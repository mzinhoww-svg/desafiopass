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

// ---------------------------------------------------------------------------
// Ranking geral (RANKING_SPEC secao 7 e 8). Total = soma de points em partidas
// encerradas. Competition ranking: position = 1 + (qtd com pontos estritamente
// maiores). Desempate (ordem da lista): pontos desc, exact_count desc, created_at
// asc, user_id asc -> estavel entre refreshes (R6). exact_count via criterion
// gravado (Opcao A). Pontos zero nao recebem numero (filtrados da lista; a faixa
// pessoal trata travessao). Tudo server-side.
// ---------------------------------------------------------------------------

export interface RankRow {
  userId: string;
  nickname: string;
  isPremium: boolean;
  points: number;
  exactCount: number;
  position: number | null; // null quando points === 0 (travessao)
  isCurrentUser: boolean;
  avatarUrl: string | null;
}

const TOTALS_CTE = `
  WITH totals AS (
    SELECT
      u.id AS user_id,
      u.nickname AS nickname,
      u.is_premium AS is_premium,
      u.avatar_url AS avatar_url,
      u.created_at AS created_at,
      COALESCE(SUM(CASE WHEN m.status = 'encerrada' THEN p.points ELSE 0 END), 0) AS points,
      COUNT(*) FILTER (WHERE m.status = 'encerrada' AND p.criterion = 'placar_exato') AS exact_count
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    LEFT JOIN matches m ON m.id = p.match_id
    GROUP BY u.id, u.nickname, u.is_premium, u.avatar_url, u.created_at
  )
`;

export async function getGlobalRanking(args: {
  currentUserId: string | null;
  limit?: number;
  offset?: number;
}): Promise<RankRow[]> {
  const limit = args.limit ?? 100;
  const offset = args.offset ?? 0;

  const result = await db.execute(sql`
    ${sql.raw(TOTALS_CTE)}
    SELECT
      t.user_id,
      t.nickname,
      t.is_premium,
      t.avatar_url,
      t.points,
      t.exact_count,
      CASE WHEN t.points = 0 THEN NULL
           ELSE 1 + (SELECT COUNT(*) FROM totals t2 WHERE t2.points > t.points)
      END AS position
    FROM totals t
    ORDER BY t.points DESC, t.exact_count DESC, t.created_at ASC, t.user_id ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return (
    result.rows as Array<{
      user_id: string;
      nickname: string;
      is_premium: boolean;
      avatar_url: string | null;
      points: number | string;
      exact_count: number | string;
      position: number | string | null;
    }>
  ).map((r) => ({
    userId: r.user_id,
    nickname: r.nickname,
    isPremium: r.is_premium,
    avatarUrl: r.avatar_url ?? null,
    points: Number(r.points),
    exactCount: Number(r.exact_count),
    position: r.position == null ? null : Number(r.position),
    isCurrentUser: r.user_id === args.currentUserId,
  }));
}

export interface MyGlobalRank {
  nickname: string;
  points: number;
  position: number | null; // null quando points === 0 (travessao)
}

export async function getMyGlobalRank(
  userId: string,
): Promise<MyGlobalRank | null> {
  const result = await db.execute(sql`
    ${sql.raw(TOTALS_CTE)}
    SELECT
      nickname,
      points,
      CASE WHEN points = 0 THEN NULL
           ELSE 1 + (SELECT COUNT(*) FROM totals t2 WHERE t2.points > totals.points)
      END AS position
    FROM totals
    WHERE user_id = ${userId}
  `);
  const row = (
    result.rows as Array<{
      nickname: string;
      points: number | string;
      position: number | string | null;
    }>
  )[0];
  if (!row) return null;
  return {
    nickname: row.nickname,
    points: Number(row.points),
    position: row.position == null ? null : Number(row.position),
  };
}

// Ranking interno de uma liga (RANKING_SPEC secao 8.5). Mesma logica de posicao e
// desempate do geral, mas a CTE parte de league_members filtrando a liga. Lista
// todos os membros (inclui 0 pontos, com position null = travessao).
export async function getLeagueRanking(args: {
  leagueId: string;
  currentUserId: string | null;
  limit?: number;
  offset?: number;
}): Promise<RankRow[]> {
  const limit = args.limit ?? 100;
  const offset = args.offset ?? 0;

  const result = await db.execute(sql`
    WITH member_totals AS (
      SELECT
        u.id AS user_id,
        u.nickname AS nickname,
        u.is_premium AS is_premium,
        u.avatar_url AS avatar_url,
        u.created_at AS created_at,
        COALESCE(SUM(CASE WHEN m.status = 'encerrada' THEN p.points ELSE 0 END), 0) AS points,
        COUNT(*) FILTER (WHERE m.status = 'encerrada' AND p.criterion = 'placar_exato') AS exact_count
      FROM league_members lm
      JOIN users u ON u.id = lm.user_id
      LEFT JOIN predictions p ON p.user_id = u.id
      LEFT JOIN matches m ON m.id = p.match_id
      WHERE lm.league_id = ${args.leagueId}
      GROUP BY u.id, u.nickname, u.is_premium, u.avatar_url, u.created_at
    )
    SELECT
      user_id,
      nickname,
      is_premium,
      avatar_url,
      points,
      exact_count,
      CASE WHEN points = 0 THEN NULL
           ELSE 1 + (SELECT COUNT(*) FROM member_totals t2 WHERE t2.points > member_totals.points)
      END AS position
    FROM member_totals
    ORDER BY points DESC, exact_count DESC, created_at ASC, user_id ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return (
    result.rows as Array<{
      user_id: string;
      nickname: string;
      is_premium: boolean;
      avatar_url: string | null;
      points: number | string;
      exact_count: number | string;
      position: number | string | null;
    }>
  ).map((r) => ({
    userId: r.user_id,
    nickname: r.nickname,
    isPremium: r.is_premium,
    avatarUrl: r.avatar_url ?? null,
    points: Number(r.points),
    exactCount: Number(r.exact_count),
    position: r.position == null ? null : Number(r.position),
    isCurrentUser: r.user_id === args.currentUserId,
  }));
}
