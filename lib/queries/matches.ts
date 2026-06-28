import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, predictions } from "@/drizzle/schema";

export type MatchRow = typeof matches.$inferSelect;
export type PredictionRow = typeof predictions.$inferSelect;

export async function getAllMatches(): Promise<MatchRow[]> {
  return db.select().from(matches).orderBy(asc(matches.kickoffAt));
}

export async function getMatchById(id: string): Promise<MatchRow | null> {
  const rows = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
  return rows[0] ?? null;
}

// Mapa matchId -> palpite do usuario (para a lista). Vazio se nao logado.
export async function getUserPredictionMap(
  userId: string | null,
): Promise<Map<string, PredictionRow>> {
  if (!userId) return new Map();
  const rows = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId));
  return new Map(rows.map((r) => [r.matchId, r]));
}

export async function getUserPrediction(
  userId: string,
  matchId: string,
): Promise<PredictionRow | null> {
  const rows = await db
    .select()
    .from(predictions)
    .where(and(eq(predictions.userId, userId), eq(predictions.matchId, matchId)))
    .limit(1);
  return rows[0] ?? null;
}

// Todos os palpites de uma partida (para o admin pontuar).
export async function getMatchPredictions(
  matchId: string,
): Promise<PredictionRow[]> {
  return db.select().from(predictions).where(eq(predictions.matchId, matchId));
}
