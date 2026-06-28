import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

// Avatar (data URL) do usuario, para o header. Uma leitura leve por render.
export async function getUserAvatar(userId: string): Promise<string | null> {
  const rows = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0]?.avatarUrl ?? null;
}

// Lista de usuarios para o painel admin (sem passwordHash).
export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      nickname: users.nickname,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.nickname));
}
