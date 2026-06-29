import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, predictions, users } from "@/drizzle/schema";

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

// Palpites da comunidade (com apelido) para exibir na partida. Revelado depois que
// o usuario palpitou (ou partida encerrada).
export interface CommunityPrediction {
  userId: string;
  nickname: string;
  homeGuess: number;
  awayGuess: number;
  points: number;
}

// Historico de palpites do usuario (#4): palpite + dados da partida + pontos,
// ordenado por data do jogo. Usado na tela "Meus palpites".
export interface UserPredictionRow {
  matchId: string;
  phase: string;
  homeCode: string;
  awayCode: string;
  kickoffAt: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeGuess: number;
  awayGuess: number;
  points: number;
  criterion: string | null;
}

export async function getUserPredictionsWithMatches(
  userId: string,
): Promise<UserPredictionRow[]> {
  return db
    .select({
      matchId: matches.id,
      phase: matches.phase,
      homeCode: matches.homeCode,
      awayCode: matches.awayCode,
      kickoffAt: matches.kickoffAt,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeGuess: predictions.homeGuess,
      awayGuess: predictions.awayGuess,
      points: predictions.points,
      criterion: predictions.criterion,
    })
    .from(predictions)
    .innerJoin(matches, eq(matches.id, predictions.matchId))
    .where(eq(predictions.userId, userId))
    .orderBy(asc(matches.kickoffAt));
}

// Quantos jogos ainda abertos (agendados, antes do apito) o usuario NAO palpitou.
// Base do indicador de palpites pendentes (#3). Uma contagem leve.
export async function getPendingPredictionCount(userId: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM matches m
    WHERE m.status = 'agendada'
      AND m.kickoff_at > now()
      AND NOT EXISTS (
        SELECT 1 FROM predictions p
        WHERE p.match_id = m.id AND p.user_id = ${userId}
      )
  `);
  return Number((result.rows as Array<{ n: number }>)[0]?.n ?? 0);
}

// Quantos palpites cada partida recebeu (mapa matchId -> total). Base da pagina
// Comunidade, para mostrar onde a galera esta jogando.
export async function getMatchPredictionCounts(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      matchId: predictions.matchId,
      count: sql<number>`count(*)`,
    })
    .from(predictions)
    .groupBy(predictions.matchId);
  return new Map(rows.map((r) => [r.matchId, Number(r.count)]));
}

export async function getMatchPredictionsWithUsers(
  matchId: string,
): Promise<CommunityPrediction[]> {
  return db
    .select({
      userId: predictions.userId,
      nickname: users.nickname,
      homeGuess: predictions.homeGuess,
      awayGuess: predictions.awayGuess,
      points: predictions.points,
    })
    .from(predictions)
    .innerJoin(users, eq(users.id, predictions.userId))
    .where(eq(predictions.matchId, matchId))
    .orderBy(asc(users.nickname));
}
