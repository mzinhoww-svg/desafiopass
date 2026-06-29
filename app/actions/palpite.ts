"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { predictions, matches } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLocale, tr } from "@/lib/i18n";
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
  const locale = await getLocale();
  if (!user)
    return { error: tr(locale, "Entre para palpitar.", "Ingresa para pronosticar.") };

  const matchId = String(formData.get("matchId") ?? "");
  const parsed = scoreSchema.safeParse({
    homeGuess: Number(formData.get("homeGuess")),
    awayGuess: Number(formData.get("awayGuess")),
  });
  if (!parsed.success)
    return {
      error: tr(
        locale,
        "Use placares inteiros de 0 a 20.",
        "Usa marcadores enteros de 0 a 20.",
      ),
    };

  const match = (
    await db.select().from(matches).where(eq(matches.id, matchId)).limit(1)
  )[0];
  if (!match)
    return { error: tr(locale, "Partida nao encontrada.", "Partido no encontrado.") };

  // Condicao canonica de "pode palpitar" (DATA_SPEC 3.3).
  const canPredict =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));
  if (!canPredict) {
    return {
      error: tr(
        locale,
        "Prazo encerrado. O palpite trava no inicio do jogo.",
        "Plazo cerrado. El pronóstico se bloquea al inicio del partido.",
      ),
    };
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
