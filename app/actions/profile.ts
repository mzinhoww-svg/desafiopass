"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { signOut } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth-helpers";
import { profileSchema } from "@/lib/validations";
import { teams as seedTeams } from "@/lib/data/copa2026";

// Codigos de selecao reais (placeholders de avanco tem flagCode vazio e nao valem).
const realTeamCodes = new Set(
  seedTeams.filter((t) => t.flagCode).map((t) => t.code),
);

export type ProfileState = { error?: string; ok?: boolean };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const current = await getCurrentUser();
  if (!current) return { error: "Sessao expirada. Entre novamente." };

  const parsed = profileSchema.safeParse({
    nickname: String(formData.get("nickname") ?? "").trim(),
    favoriteTeam: String(formData.get("favoriteTeam") ?? ""),
  });
  if (!parsed.success) {
    return { error: "Apelido de 3 a 20 caracteres: letras, numeros ou _." };
  }

  const { nickname } = parsed.data;
  const favoriteTeam =
    parsed.data.favoriteTeam && parsed.data.favoriteTeam.length > 0
      ? parsed.data.favoriteTeam
      : null;
  if (favoriteTeam && !realTeamCodes.has(favoriteTeam)) {
    return { error: "Selecao invalida." };
  }

  // Unicidade do apelido (ignorando o proprio usuario).
  const clash = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.nickname, nickname), ne(users.id, current.id)));
  if (clash.length > 0) return { error: "Apelido ja em uso." };

  // Avatar opcional: data URL de imagem ja redimensionada no client. Vazio = sem
  // alteracao. Limite de tamanho como guarda (256px jpeg fica bem abaixo disso).
  const avatarRaw = String(formData.get("avatarUrl") ?? "");
  const avatarUpdate: { avatarUrl?: string } = {};
  if (avatarRaw) {
    if (!avatarRaw.startsWith("data:image/") || avatarRaw.length > 400_000) {
      return { error: "Imagem invalida ou muito grande." };
    }
    avatarUpdate.avatarUrl = avatarRaw;
  }

  await db
    .update(users)
    .set({ nickname, favoriteTeam, ...avatarUpdate })
    .where(eq(users.id, current.id));

  revalidatePath("/perfil");
  return { ok: true };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
