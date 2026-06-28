"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { leagues, leagueMembers } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createLeagueSchema } from "@/lib/validations";
import { inviteToken } from "@/lib/utils/slug";
import {
  countUserLeagues,
  getLeagueByToken,
  isMember,
} from "@/lib/queries/leagues";

// Limite do MVP: usuario basico (is_premium false) participa de no maximo 1 liga
// (owner + membro). DATA_SPEC secao 5. Socio (V2) sobe para 100.
const FREE_LIMIT = 1;

export type LeagueState = { error?: string };

export async function createLeague(
  _prev: LeagueState,
  formData: FormData,
): Promise<LeagueState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre para criar uma liga." };

  const parsed = createLeagueSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
  });
  if (!parsed.success) return { error: "Nome da liga: de 3 a 40 caracteres." };

  const count = await countUserLeagues(user.id);
  if (count >= FREE_LIMIT) {
    return { error: "Usuarios basicos podem participar de 1 liga." };
  }

  // Gera token unico; em colisao de unique, tenta de novo (ate 3 vezes).
  let createdId: string | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const inserted = await db
        .insert(leagues)
        .values({
          name: parsed.data.name,
          ownerId: user.id,
          inviteToken: inviteToken(),
        })
        .returning({ id: leagues.id });
      createdId = inserted[0]?.id ?? null;
      break;
    } catch (e) {
      if ((e as { code?: string }).code === "23505" && attempt < 2) continue;
      throw e;
    }
  }
  if (!createdId) return { error: "Nao foi possivel criar a liga. Tente de novo." };

  // Owner entra como membro (ocupa a vaga de 1 liga).
  await db.insert(leagueMembers).values({ leagueId: createdId, userId: user.id });

  revalidatePath("/ligas");
  redirect(`/ligas/${createdId}`);
}

export async function joinLeague(
  _prev: LeagueState,
  formData: FormData,
): Promise<LeagueState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Entre para aceitar o convite." };

  // Aceita o token puro OU o link completo colado (.../entrar/<token>).
  const raw = String(formData.get("token") ?? "").trim();
  const afterEntrar = raw.includes("/entrar/")
    ? (raw.split("/entrar/").pop() ?? "")
    : raw;
  const token = (afterEntrar.split(/[?#]/)[0] ?? "").trim();
  const league = await getLeagueByToken(token);
  if (!league) return { error: "Convite invalido." };

  if (!(await isMember(league.id, user.id))) {
    const count = await countUserLeagues(user.id);
    if (count >= FREE_LIMIT) {
      return { error: "Usuarios basicos podem participar de 1 liga." };
    }
    try {
      await db
        .insert(leagueMembers)
        .values({ leagueId: league.id, userId: user.id });
    } catch (e) {
      // Corrida na PK (league_id, user_id): ja e membro, segue para a liga.
      if ((e as { code?: string }).code !== "23505") throw e;
    }
  }

  revalidatePath("/ligas");
  redirect(`/ligas/${league.id}`);
}
