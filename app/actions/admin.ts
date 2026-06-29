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
