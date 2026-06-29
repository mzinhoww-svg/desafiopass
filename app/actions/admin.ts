"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  matches,
  predictions,
  leagues,
  leagueMembers,
  users,
} from "@/drizzle/schema";
import { isAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { adminResultSchema, updateMatchSchema } from "@/lib/validations";
import { finalPoints, type Phase } from "@/lib/scoring";
import { advancement, teams as seedTeams } from "@/lib/data/copa2026";
import { getMyGlobalRank } from "@/lib/queries/ranking";
import { sendEmail, appUrl } from "@/lib/email/client";
import { resultEmail } from "@/lib/email/templates";

const allTeamCodes = new Set(seedTeams.map((t) => t.code));

// Propaga o vencedor (ou perdedor) de uma partida encerrada para o confronto
// seguinte, trocando o placeholder (ex 'W_R32_1') pelo time real (#1). Empate no
// mata-mata nao define avanco automatico — fica para o admin ajustar (editar jogo).
async function propagateWinner(
  matchId: string,
  homeCode: string,
  awayCode: string,
  homeScore: number,
  awayScore: number,
) {
  const winner =
    homeScore > awayScore ? homeCode : awayScore > homeScore ? awayCode : null;
  const loser =
    homeScore > awayScore ? awayCode : awayScore > homeScore ? homeCode : null;

  for (const [placeholder, info] of Object.entries(advancement)) {
    if (info.fromMatch !== matchId) continue;
    const resolved = info.takes === "winner" ? winner : loser;
    if (!resolved) continue;
    await db
      .update(matches)
      .set({ homeCode: resolved })
      .where(eq(matches.homeCode, placeholder));
    await db
      .update(matches)
      .set({ awayCode: resolved })
      .where(eq(matches.awayCode, placeholder));
  }
}

/*
 * Admin encerra a partida e pontua (Task 2.4). Revalida role admin, grava placar +
 * status encerrada, percorre os palpites e grava points E criterion via finalPoints
 * (SCORING_SPEC). Idempotente: recalcula a partir do palpite e do placar atuais e
 * SOBRESCREVE points/criterion (nunca incrementa). Quem nao palpitou nao tem linha.
 */
export type AdminState = { error?: string; ok?: boolean; scored?: number };

export async function closeMatch(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  if (!(await isAdmin())) return { error: "Acesso restrito a admin." };

  const parsed = adminResultSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    homeScore: Number(formData.get("homeScore")),
    awayScore: Number(formData.get("awayScore")),
  });
  if (!parsed.success) return { error: "Placar invalido (inteiros de 0 a 30)." };

  const { matchId, homeScore, awayScore } = parsed.data;
  const match = (
    await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
  )[0];
  if (!match) return { error: "Partida nao encontrada." };

  const isBrazilMatch =
    match.homeCode === "BRA" || match.awayCode === "BRA";

  await db
    .update(matches)
    .set({ homeScore, awayScore, status: "encerrada" })
    .where(eq(matches.id, matchId));

  // Avanca o chaveamento: preenche o time real no confronto seguinte (#1).
  await propagateWinner(matchId, match.homeCode, match.awayCode, homeScore, awayScore);

  const preds = await db
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId));

  const scored: { userId: string; guessLabel: string; points: number }[] = [];
  for (const p of preds) {
    const breakdown = finalPoints({
      guess: { homeGuess: p.homeGuess, awayGuess: p.awayGuess },
      result: { homeScore, awayScore },
      phase: match.phase as Phase,
      isBrazilMatch,
    });
    await db
      .update(predictions)
      .set({ points: breakdown.final, criterion: breakdown.criterion })
      .where(eq(predictions.id, p.id));
    scored.push({
      userId: p.userId,
      guessLabel: `${p.homeGuess} x ${p.awayGuess}`,
      points: breakdown.final,
    });
  }

  // Notifica por e-mail quem palpitou (#6). Nao bloqueia o sucesso da pontuacao.
  try {
    await notifyResults(
      `${match.homeCode} x ${match.awayCode}`,
      `${homeScore} x ${awayScore}`,
      scored,
    );
  } catch (e) {
    console.error("[admin] falha ao notificar resultados:", e);
  }

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  revalidatePath("/ranking");
  return { ok: true, scored: preds.length };
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
  if (!(await isAdmin())) return { error: "Acesso restrito a admin." };

  const parsed = updateMatchSchema.safeParse({
    matchId: String(formData.get("matchId") ?? ""),
    kickoffLocal: String(formData.get("kickoffLocal") ?? ""),
    stadium: String(formData.get("stadium") ?? "").trim(),
    homeCode: String(formData.get("homeCode") ?? "").trim(),
    awayCode: String(formData.get("awayCode") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Dados da partida inválidos." };

  const { matchId, kickoffLocal, stadium, homeCode, awayCode } = parsed.data;
  if (!allTeamCodes.has(homeCode) || !allTeamCodes.has(awayCode)) {
    return { error: "Seleção inválida." };
  }
  // datetime-local nao tem fuso; interpretamos como horario de Brasilia (UTC-3).
  const kickoffAt = new Date(`${kickoffLocal}:00-03:00`);
  if (Number.isNaN(kickoffAt.getTime())) return { error: "Data/hora inválida." };

  await db
    .update(matches)
    .set({ kickoffAt, stadium: stadium || "A confirmar", homeCode, awayCode })
    .where(eq(matches.id, matchId));

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  return { ok: true };
}

// Envia o e-mail de resultado (#6) para quem palpitou e aceita receber e-mails.
async function notifyResults(
  matchLabel: string,
  scoreLabel: string,
  scored: { userId: string; guessLabel: string; points: number }[],
) {
  if (scored.length === 0) return;
  const ids = scored.map((s) => s.userId);
  const recipients = await db
    .select({
      id: users.id,
      email: users.email,
      nickname: users.nickname,
      emailReminders: users.emailReminders,
    })
    .from(users)
    .where(inArray(users.id, ids));
  const byId = new Map(recipients.map((r) => [r.id, r]));
  const rankingUrl = `${appUrl()}/ranking`;

  for (const s of scored) {
    const u = byId.get(s.userId);
    if (!u || !u.emailReminders) continue;
    const rank = await getMyGlobalRank(u.id);
    const mail = resultEmail({
      nickname: u.nickname,
      matchLabel,
      scoreLabel,
      guessLabel: s.guessLabel,
      points: s.points,
      position: rank?.position ?? null,
      rankingUrl,
    });
    await sendEmail({
      to: u.email,
      toName: u.nickname,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
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
