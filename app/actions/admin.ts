"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  matches,
  predictions,
  leagues,
  leagueMembers,
  users,
} from "@/drizzle/schema";
import { isAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { adminResultSchema } from "@/lib/validations";
import { finalPoints, type Phase } from "@/lib/scoring";

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

  const preds = await db
    .select()
    .from(predictions)
    .where(eq(predictions.matchId, matchId));

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
  }

  revalidatePath(`/admin/partidas/${matchId}`);
  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  revalidatePath("/ranking");
  return { ok: true, scored: preds.length };
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
