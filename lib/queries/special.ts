import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialPredictions, settings, matches } from "@/drizzle/schema";

// Palpites especiais (#2). type: 'campeao' (codigo do team) | 'artilheiro' (nome).
export interface SpecialPicks {
  campeao: string | null;
  artilheiro: string | null;
  campeaoPoints: number;
  artilheiroPoints: number;
}

export async function getSpecialPredictions(
  userId: string,
): Promise<SpecialPicks> {
  const rows = await db
    .select({
      type: specialPredictions.type,
      value: specialPredictions.value,
      points: specialPredictions.points,
    })
    .from(specialPredictions)
    .where(eq(specialPredictions.userId, userId));
  const campeao = rows.find((r) => r.type === "campeao");
  const artilheiro = rows.find((r) => r.type === "artilheiro");
  return {
    campeao: campeao?.value ?? null,
    artilheiro: artilheiro?.value ?? null,
    campeaoPoints: campeao?.points ?? 0,
    artilheiroPoints: artilheiro?.points ?? 0,
  };
}

// Resultado oficial (settings). champion = codigo do team, top_scorer = nome.
export async function getSpecialResults(): Promise<{
  champion: string | null;
  topScorer: string | null;
}> {
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    champion: map.get("champion") ?? null,
    topScorer: map.get("top_scorer") ?? null,
  };
}

// Prazo dos palpites especiais: travam no primeiro apito do mata-mata.
export async function getSpecialDeadline(): Promise<Date | null> {
  const rows = await db
    .select({ kickoffAt: matches.kickoffAt })
    .from(matches)
    .orderBy(asc(matches.kickoffAt))
    .limit(1);
  return rows[0]?.kickoffAt ?? null;
}

// Soma de pontos especiais por usuario (para somar ao ranking).
export async function getSpecialPointsTotal(userId: string): Promise<number> {
  const result = await db.execute(sql`
    SELECT COALESCE(SUM(points), 0)::int AS n
    FROM special_predictions WHERE user_id = ${userId}
  `);
  return Number((result.rows as Array<{ n: number }>)[0]?.n ?? 0);
}
