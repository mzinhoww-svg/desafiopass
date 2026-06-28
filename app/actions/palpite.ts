"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { predictions, matches } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { scoreSchema } from "@/lib/validations";
import { isPredictionOpen } from "@/lib/utils/dates";

/*
 * Registrar/editar palpite (Task 2.3). Valida range 0..20 (Zod) e REVALIDA o prazo
 * server-side (UTC vs UTC): so aceita se status agendada E now < kickoff. Upsert pela
 * unique (user_id, match_id): vale o ultimo palpite. Nunca confia no client.
 */
export type PredictionState = { error?: string; ok?: boolean };

export async function savePrediction(
  _prev: PredictionState,
  formData: FormData,
): Promise<PredictionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre para palpitar." };

  const matchId = String(formData.get("matchId") ?? "");
  const parsed = scoreSchema.safeParse({
    homeGuess: Number(formData.get("homeGuess")),
    awayGuess: Number(formData.get("awayGuess")),
  });
  if (!parsed.success) return { error: "Use placares inteiros de 0 a 20." };

  const match = (
    await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
  )[0];
  if (!match) return { error: "Partida nao encontrada." };

  // Condicao canonica de "pode palpitar" (DATA_SPEC 3.3).
  const canPredict =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));
  if (!canPredict) {
    return { error: "Prazo encerrado. O palpite trava no inicio do jogo." };
  }

  const { homeGuess, awayGuess } = parsed.data;
  await db
    .insert(predictions)
    .values({ userId: user.id, matchId, homeGuess, awayGuess })
    .onConflictDoUpdate({
      target: [predictions.userId, predictions.matchId],
      set: { homeGuess, awayGuess, updatedAt: new Date() },
    });

  revalidatePath(`/partidas/${matchId}`);
  revalidatePath("/partidas");
  return { ok: true };
}
