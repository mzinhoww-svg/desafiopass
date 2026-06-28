import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/*
 * Metricas do painel admin (#8, #9, #10). Tudo agregado por query, server-side.
 * - totalUsers / usersWithPrediction: funil cadastro x palpite (#10).
 * - totalPredictions / openMatches: volume e contexto.
 * - unscored: jogos cujo apito ja passou e que ainda nao foram encerrados (#9).
 */
export interface AdminMetrics {
  totalUsers: number;
  usersWithPrediction: number;
  totalPredictions: number;
  scheduledMatches: number;
  closedMatches: number;
  unscored: Array<{ id: string; label: string; kickoffAt: Date }>;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const counts = await db.execute(sql`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(DISTINCT user_id)::int FROM predictions) AS users_with_prediction,
      (SELECT COUNT(*)::int FROM predictions) AS total_predictions,
      (SELECT COUNT(*)::int FROM matches WHERE status = 'agendada') AS scheduled_matches,
      (SELECT COUNT(*)::int FROM matches WHERE status = 'encerrada') AS closed_matches
  `);
  const c = (counts.rows as Array<Record<string, number>>)[0] ?? {};

  const unscoredRows = await db.execute(sql`
    SELECT id, home_code, away_code, kickoff_at
    FROM matches
    WHERE status <> 'encerrada' AND kickoff_at < now()
    ORDER BY kickoff_at ASC
  `);
  const unscored = (
    unscoredRows.rows as Array<{
      id: string;
      home_code: string;
      away_code: string;
      kickoff_at: string;
    }>
  ).map((r) => ({
    id: r.id,
    label: `${r.home_code} x ${r.away_code}`,
    kickoffAt: new Date(r.kickoff_at),
  }));

  return {
    totalUsers: Number(c.total_users ?? 0),
    usersWithPrediction: Number(c.users_with_prediction ?? 0),
    totalPredictions: Number(c.total_predictions ?? 0),
    scheduledMatches: Number(c.scheduled_matches ?? 0),
    closedMatches: Number(c.closed_matches ?? 0),
    unscored,
  };
}
