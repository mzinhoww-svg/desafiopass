"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { specialPredictions } from "@/drizzle/schema";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { specialPredictionSchema, specialResultSchema } from "@/lib/validations";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { getSpecialDeadline, getSpecialResults } from "@/lib/queries/special";
import { specialPoints, type SpecialType } from "@/lib/special-scoring";
import { applySpecialResults } from "@/lib/results/special";

const realTeamCodes = new Set(
  seedTeams.filter((t) => t.flagCode).map((t) => t.code),
);

export type SpecialState = { ok?: boolean; error?: string };

// Palpite especial do usuario (#2): campeao (codigo) + artilheiro (nome livre).
export async function saveSpecialPrediction(
  _prev: SpecialState,
  formData: FormData,
): Promise<SpecialState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  // Prazo: trava no primeiro apito do mata-mata.
  const deadline = await getSpecialDeadline();
  if (deadline && Date.now() >= deadline.getTime()) {
    return { error: "O prazo dos palpites especiais já encerrou." };
  }

  const parsed = specialPredictionSchema.safeParse({
    champion: String(formData.get("champion") ?? "").trim(),
    topScorer: String(formData.get("topScorer") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Dados inválidos." };

  const champion = parsed.data.champion?.trim() ?? "";
  const topScorer = parsed.data.topScorer?.trim() ?? "";
  if (champion && !realTeamCodes.has(champion)) {
    return { error: "Seleção inválida para campeão." };
  }

  await upsertOrClear(user.id, "campeao", champion);
  await upsertOrClear(user.id, "artilheiro", topScorer);

  // Se o resultado oficial ja existir, pontua na hora.
  const official = await getSpecialResults();
  await recomputeForUser(user.id, official);

  revalidatePath("/palpites-especiais");
  return { ok: true };
}

async function upsertOrClear(userId: string, type: SpecialType, value: string) {
  if (!value) {
    await db
      .delete(specialPredictions)
      .where(
        and(
          eq(specialPredictions.userId, userId),
          eq(specialPredictions.type, type),
        ),
      );
    return;
  }
  await db
    .insert(specialPredictions)
    .values({ userId, type, value, points: 0 })
    .onConflictDoUpdate({
      target: [specialPredictions.userId, specialPredictions.type],
      set: { value },
    });
}

async function recomputeForUser(
  userId: string,
  official: { champion: string | null; topScorer: string | null },
) {
  const rows = await db
    .select({ type: specialPredictions.type, value: specialPredictions.value })
    .from(specialPredictions)
    .where(eq(specialPredictions.userId, userId));
  for (const r of rows) {
    const type = r.type as SpecialType;
    const off = type === "campeao" ? official.champion : official.topScorer;
    const points = specialPoints(type, r.value, off);
    await db
      .update(specialPredictions)
      .set({ points })
      .where(
        and(
          eq(specialPredictions.userId, userId),
          eq(specialPredictions.type, type),
        ),
      );
  }
}

// Admin: define o resultado oficial e recalcula os pontos de TODOS (#2).
export async function setSpecialResult(
  _prev: SpecialState,
  formData: FormData,
): Promise<SpecialState> {
  if (!(await isAdmin())) return { error: "Acesso restrito." };

  const parsed = specialResultSchema.safeParse({
    champion: String(formData.get("champion") ?? "").trim(),
    topScorer: String(formData.get("topScorer") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Dados inválidos." };

  const champion = parsed.data.champion?.trim() ?? "";
  const topScorer = parsed.data.topScorer?.trim() ?? "";
  if (champion && !realTeamCodes.has(champion)) {
    return { error: "Seleção inválida para campeão." };
  }

  // Grava e recalcula via lógica compartilhada (mesma usada pela sincronização).
  await applySpecialResults({ champion, topScorer });

  revalidatePath("/admin");
  revalidatePath("/ranking");
  return { ok: true };
}
