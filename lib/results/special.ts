// lib/results/special.ts
//
// Aplica o resultado oficial dos palpites especiais (#2): grava champion/top_scorer
// em settings e recalcula os pontos de TODOS os palpites especiais. Compartilhado
// entre o admin manual e a sincronização automática (artilheiro pela API + campeão
// pela final). Passe undefined/null para não alterar aquele campo.

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialPredictions, settings } from "@/drizzle/schema";
import { specialPoints, type SpecialType } from "@/lib/special-scoring";

async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export async function applySpecialResults(args: {
  champion?: string | null;
  topScorer?: string | null;
}) {
  if (args.champion != null) await setSetting("champion", args.champion);
  if (args.topScorer != null) await setSetting("top_scorer", args.topScorer);

  // Lê o oficial atual (após upsert) e recalcula todos os palpites especiais.
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const champion = map.get("champion") ?? null;
  const topScorer = map.get("top_scorer") ?? null;

  const all = await db
    .select({
      userId: specialPredictions.userId,
      type: specialPredictions.type,
      value: specialPredictions.value,
    })
    .from(specialPredictions);
  for (const r of all) {
    const type = r.type as SpecialType;
    const off = type === "campeao" ? champion : topScorer;
    const points = specialPoints(type, r.value, off);
    await db
      .update(specialPredictions)
      .set({ points })
      .where(
        and(
          eq(specialPredictions.userId, r.userId),
          eq(specialPredictions.type, type),
        ),
      );
  }
}
