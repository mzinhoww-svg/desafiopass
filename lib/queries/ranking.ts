import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/*
 * Faixa pessoal do ranking (RANKING_SPEC secao 5 e 8.3). Total = soma de
 * predictions.points apenas de partidas encerradas, server-side. Posicao por
 * competition ranking: 1 + numero de usuarios com pontuacao estritamente maior.
 * Pontos 0 => position null (exibir travessao). Mantem o usuario mesmo sem palpites.
 */
export interface MyRank {
  points: number;
  position: number | null;
}

export async function getMyRank(userId: string): Promise<MyRank> {
  const result = await db.execute(sql`
    WITH totals AS (
      SELECT
        u.id AS user_id,
        COALESCE(SUM(CASE WHEN m.status = 'encerrada' THEN p.points ELSE 0 END), 0) AS points
      FROM users u
      LEFT JOIN predictions p ON p.user_id = u.id
      LEFT JOIN matches m ON m.id = p.match_id
      GROUP BY u.id
    )
    SELECT
      points,
      CASE
        WHEN points = 0 THEN NULL
        ELSE 1 + (SELECT COUNT(*) FROM totals t2 WHERE t2.points > totals.points)
      END AS position
    FROM totals
    WHERE user_id = ${userId}
  `);

  const row = (result.rows as Array<{ points: number | string; position: number | string | null }>)[0];
  if (!row) return { points: 0, position: null };
  return {
    points: Number(row.points),
    position: row.position == null ? null : Number(row.position),
  };
}
