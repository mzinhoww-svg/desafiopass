"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, leagues, leagueMembers, users, teams } from "@/drizzle/schema";
import { isAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { getLocale, tr } from "@/lib/i18n";
import { adminResultSchema, updateMatchSchema } from "@/lib/validations";
import { applyResult } from "@/lib/results/apply";
import { syncResults } from "@/lib/results/sync";
import { importKnockoutBracket } from "@/lib/results/import";
import { openOitavasBracket } from "@/lib/results/open-oitavas";
import { getAllMatches } from "@/lib/queries/matches";
import { sendEmail, appUrl } from "@/lib/email/client";
import { phaseOpenEmail } from "@/lib/email/templates";
import { phaseLabel } from "@/lib/phases";
import { formatBrasilia } from "@/lib/utils/dates";
import { inviteToken } from "@/lib/utils/slug";
import type { Phase } from "@/lib/scoring";

/*
 * Admin encerra a partida e pontua (Task 2.4). Delega para applyResult (lógica
 * compartilhada com a sincronização automática): grava placar + status encerrada,
 * avança o chaveamento, pontua os palpites e notifica. Idempotente.
 */
export type AdminState = { error?: string; ok?: boolean; scored?: number };

export async function closeMatch(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const locale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(
        locale,
        "Acesso restrito a admin.",
        "Acceso restringido a administradores.",
      ),
    };

  const parsed = adminResultSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    homeScore: Number(formData.get("homeScore")),
    awayScore: Number(formData.get("awayScore")),
  });
  if (!parsed.success)
    return {
      error: tr(
        locale,
        "Placar invalido (inteiros de 0 a 30).",
        "Marcador inválido (enteros de 0 a 30).",
      ),
    };

  // Quem avançou (mata-mata): vazio = decide pelo placar; um código = escolha do
  // admin (empate nos pênaltis). Validado contra as seleções da partida em applyResult.
  const winner = String(formData.get("winner") ?? "").trim() || undefined;

  const { matchId, homeScore, awayScore } = parsed.data;
  const res = await applyResult(matchId, homeScore, awayScore, winner);
  if (!res)
    return { error: tr(locale, "Partida nao encontrada.", "Partido no encontrado.") };

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  revalidatePath("/ranking");
  return { ok: true, scored: res.scored };
}

/*
 * Sincroniza resultados pela API pública (#1). Acionável pelo admin (botão) e
 * pelo cron. Encerra/pontua os jogos finalizados e atualiza os ao vivo.
 */
export type SyncState = { error?: string; ok?: boolean; message?: string };

export async function syncResultsAction(
  _prev: SyncState,
  _formData: FormData,
): Promise<SyncState> {
  void _prev;
  void _formData;
  const locale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(
        locale,
        "Acesso restrito a admin.",
        "Acceso restringido a administradores.",
      ),
    };
  try {
    const r = await syncResults();
    revalidatePath("/admin");
    revalidatePath("/partidas");
    revalidatePath("/ranking");
    if (r.skipped) {
      return {
        error: tr(
          locale,
          "Sincronização indisponível (sem chave da API configurada).",
          "Sincronización no disponible (sin clave de API configurada).",
        ),
      };
    }
    return {
      ok: true,
      message: tr(
        locale,
        `${r.finished} jogo(s) encerrado(s), ${r.live} ao vivo, ` +
          `${r.rescheduled} agenda(s) atualizada(s) (horário/estádio).` +
          (r.specialApplied ? " Campeão e artilheiro definidos." : ""),
        `${r.finished} partido(s) cerrado(s), ${r.live} en vivo, ` +
          `${r.rescheduled} agenda(s) actualizada(s) (horario/estadio).` +
          (r.specialApplied ? " Campeón y goleador definidos." : ""),
      ),
    };
  } catch (e) {
    console.error("[admin] sync falhou:", e);
    return {
      error: tr(
        locale,
        "Falha ao sincronizar. Veja os logs.",
        "Error al sincronizar. Revisa los logs.",
      ),
    };
  }
}

/*
 * Admin edita uma partida (#2): horario (Brasilia), estadio e seleções. Permite
 * corrigir data/hora (o prazo de palpite acompanha) e resolver manualmente
 * confrontos (ex.: empate no mata-mata definido nos penaltis). Nao altera placar.
 */
export async function updateMatch(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const locale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(
        locale,
        "Acesso restrito a admin.",
        "Acceso restringido a administradores.",
      ),
    };

  const parsed = updateMatchSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    kickoffLocal: String(formData.get("kickoffLocal") ?? ""),
    stadium: String(formData.get("stadium") ?? "").trim(),
    homeCode: String(formData.get("homeCode") ?? "").trim(),
    awayCode: String(formData.get("awayCode") ?? "").trim(),
  });
  if (!parsed.success)
    return {
      error: tr(
        locale,
        "Dados da partida inválidos.",
        "Datos del partido inválidos.",
      ),
    };

  const { matchId, kickoffLocal, stadium, homeCode, awayCode } = parsed.data;
  // Valida as seleções contra a tabela teams (inclui as reais importadas da API).
  const valid = await db
    .select({ code: teams.code })
    .from(teams)
    .where(inArray(teams.code, [homeCode, awayCode]));
  const validCodes = new Set(valid.map((t) => t.code));
  if (!validCodes.has(homeCode) || !validCodes.has(awayCode)) {
    return { error: tr(locale, "Seleção inválida.", "Selección inválida.") };
  }
  // datetime-local nao tem fuso; interpretamos como horario de Brasilia (UTC-3).
  const kickoffAt = new Date(`${kickoffLocal}:00-03:00`);
  if (Number.isNaN(kickoffAt.getTime()))
    return { error: tr(locale, "Data/hora inválida.", "Fecha/hora inválida.") };

  await db
    .update(matches)
    .set({ kickoffAt, stadium: stadium || "A confirmar", homeCode, awayCode })
    .where(eq(matches.id, matchId));

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  return { ok: true };
}

/*
 * Importa o mata-mata REAL da API (#A): substitui o chaveamento fictício pelos
 * confrontos reais da Copa (seleções, datas, estádios e resultados). Destrutivo —
 * remove partidas e palpites que não vierem da API. Acionável só pelo admin.
 */
export type ImportState = { error?: string; ok?: boolean; message?: string };

export async function importBracketAction(
  _prev: ImportState,
  _formData: FormData,
): Promise<ImportState> {
  void _prev;
  void _formData;
  const locale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(
        locale,
        "Acesso restrito a admin.",
        "Acceso restringido a administradores.",
      ),
    };
  try {
    const r = await importKnockoutBracket();
    revalidatePath("/admin");
    revalidatePath("/partidas");
    revalidatePath("/");
    revalidatePath("/ranking");
    if (r.skipped) return { error: r.reason };
    const phases = Object.entries(r.byPhase)
      .map(([p, n]) => `${n} ${p}`)
      .join(", ");
    return {
      ok: true,
      message: tr(
        locale,
        `${r.matches} jogo(s) reais importado(s) (${phases}); ` +
          `${r.teams} seleções; ${r.finished} já encerrado(s); ` +
          `${r.removed} partida(s) fictícia(s) removida(s).`,
        `${r.matches} partido(s) reales importado(s) (${phases}); ` +
          `${r.teams} selecciones; ${r.finished} ya cerrado(s); ` +
          `${r.removed} partido(s) ficticio(s) eliminado(s).`,
      ),
    };
  } catch (e) {
    console.error("[admin] import falhou:", e);
    return {
      error: tr(
        locale,
        "Falha ao importar. Veja os logs.",
        "Error al importar. Revisa los logs.",
      ),
    };
  }
}

/*
 * Abre as OITAVAS em diante (não destrutivo: mantém os 16avos e os palpites já
 * feitos). Cria/atualiza o chaveamento da reta final com os cruzamentos prováveis.
 */
export type OpenBracketState = { error?: string; ok?: boolean; message?: string };

export async function openOitavasAction(
  _prev: OpenBracketState,
  _formData: FormData,
): Promise<OpenBracketState> {
  void _prev;
  void _formData;
  const locale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(locale, "Acesso restrito a admin.", "Acceso restringido a administradores."),
    };
  try {
    const r = await openOitavasBracket();
    revalidatePath("/partidas");
    revalidatePath("/");
    revalidatePath("/ranking");
    revalidatePath("/admin");
    return {
      ok: true,
      message: tr(
        locale,
        `${r.oitavas} oitavas abertas; ${r.later} jogo(s) do chaveamento criado(s) (quartas→final).`,
        `${r.oitavas} octavos abiertos; ${r.later} partido(s) del cuadro creado(s) (cuartos→final).`,
      ),
    };
  } catch (e) {
    console.error("[admin] abrir oitavas falhou:", e);
    return {
      error: tr(locale, "Falha ao abrir as oitavas. Veja os logs.", "Error al abrir los octavos. Revisa los logs."),
    };
  }
}

/*
 * Avisa os participantes (que aceitam e-mail) que as oitavas estão abertas, com
 * a lista dos jogos e um teaser de prêmio surpresa. Envio em lotes.
 */
export type AnnounceState = { error?: string; ok?: boolean; message?: string };

export async function announceOitavasAction(
  _prev: AnnounceState,
  _formData: FormData,
): Promise<AnnounceState> {
  void _prev;
  void _formData;
  const adminLocale = await getLocale();
  if (!(await isAdmin()))
    return {
      error: tr(adminLocale, "Acesso restrito a admin.", "Acceso restringido a administradores."),
    };
  try {
    const all = await getAllMatches();
    const now = Date.now();
    const oitavas = all.filter(
      (m) =>
        m.phase === "oitavas" &&
        m.status === "agendada" &&
        new Date(m.kickoffAt).getTime() > now,
    );
    if (oitavas.length === 0)
      return {
        error: tr(
          adminLocale,
          "Nenhuma oitava aberta para avisar. Abra as oitavas primeiro.",
          "No hay octavos abiertos para avisar. Abre los octavos primero.",
        ),
      };
    const recipients = await db
      .select({ email: users.email, nickname: users.nickname, locale: users.locale })
      .from(users)
      .where(eq(users.emailReminders, true));
    const matchesUrl = `${appUrl()}/partidas`;

    let sent = 0;
    const CHUNK = 10;
    for (let i = 0; i < recipients.length; i += CHUNK) {
      const batch = recipients.slice(i, i + CHUNK);
      const results = await Promise.allSettled(
        batch.map((u) => {
          const loc = u.locale === "es" ? "es" : "pt";
          const mail = phaseOpenEmail({
            nickname: u.nickname,
            phaseLabel: phaseLabel("oitavas" as Phase, loc),
            games: oitavas.map((m) => ({
              label: `${m.homeCode} x ${m.awayCode}`,
              when: formatBrasilia(new Date(m.kickoffAt)),
            })),
            matchesUrl,
            locale: loc,
            prizeTeaser: true,
          });
          return sendEmail({
            to: u.email,
            toName: u.nickname,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          });
        }),
      );
      sent += results.filter(
        (r) => r.status === "fulfilled" && (r.value as { ok: boolean }).ok,
      ).length;
    }
    return {
      ok: true,
      message: tr(
        adminLocale,
        `Aviso enviado para ${sent} de ${recipients.length} participante(s).`,
        `Aviso enviado a ${sent} de ${recipients.length} participante(s).`,
      ),
    };
  } catch (e) {
    console.error("[admin] avisar oitavas falhou:", e);
    return {
      error: tr(adminLocale, "Falha ao enviar avisos. Veja os logs.", "Error al enviar avisos. Revisa los logs."),
    };
  }
}

/*
 * Cria (uma vez) a liga da reta final e devolve o link de convite para divulgar.
 * Idempotente: se já existir a liga com esse nome do admin, devolve o link dela.
 */
const RETA_FINAL_NAME = "Reta Final · Oitavas à Final";
export type RetaLeagueState = {
  error?: string;
  ok?: boolean;
  url?: string;
  name?: string;
};

export async function createRetaFinalLeagueAction(
  _prev: RetaLeagueState,
  _formData: FormData,
): Promise<RetaLeagueState> {
  void _prev;
  void _formData;
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (user?.role !== "admin")
    return {
      error: tr(locale, "Acesso restrito a admin.", "Acceso restringido a administradores."),
    };
  try {
    const existing = await db
      .select({ token: leagues.inviteToken })
      .from(leagues)
      .where(and(eq(leagues.ownerId, user.id), eq(leagues.name, RETA_FINAL_NAME)))
      .limit(1);
    let token = existing[0]?.token;
    if (!token) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const inserted = await db
            .insert(leagues)
            .values({
              name: RETA_FINAL_NAME,
              ownerId: user.id,
              inviteToken: inviteToken(),
            })
            .returning({ id: leagues.id, inviteToken: leagues.inviteToken });
          const row = inserted[0];
          if (!row) continue;
          token = row.inviteToken;
          await db
            .insert(leagueMembers)
            .values({ leagueId: row.id, userId: user.id })
            .onConflictDoNothing();
          break;
        } catch (e) {
          if ((e as { code?: string }).code === "23505" && attempt < 2) continue;
          throw e;
        }
      }
    }
    revalidatePath("/ligas");
    return {
      ok: true,
      name: RETA_FINAL_NAME,
      url: `${appUrl()}/ligas/entrar/${token}`,
    };
  } catch (e) {
    console.error("[admin] criar liga reta final falhou:", e);
    return {
      error: tr(locale, "Falha ao criar a liga. Veja os logs.", "Error al crear la liga. Revisa los logs."),
    };
  }
}

// --- Gestao admin (excluir usuario/liga, remover membro). Form actions. ---

export async function deleteUser(formData: FormData): Promise<void> {
  const current = await getCurrentUser();
  if (current?.role !== "admin") return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === current.id) return; // nao exclui a si mesmo
  // Remove primeiro as ligas que o usuario e dono (cascata nos membros). Depois o
  // usuario, que cascateia predictions e league_members dele.
  await db.delete(leagues).where(eq(leagues.ownerId, userId));
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/ligas");
  revalidatePath("/ranking");
}

export async function deleteLeague(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const leagueId = String(formData.get("leagueId") ?? "");
  if (!leagueId) return;
  // Cascata remove os league_members da liga.
  await db.delete(leagues).where(eq(leagues.id, leagueId));
  revalidatePath("/admin/ligas");
}

export async function removeMember(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const leagueId = String(formData.get("leagueId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!leagueId || !userId) return;
  await db
    .delete(leagueMembers)
    .where(
      and(
        eq(leagueMembers.leagueId, leagueId),
        eq(leagueMembers.userId, userId),
      ),
    );
  revalidatePath(`/admin/ligas/${leagueId}`);
}
