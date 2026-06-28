import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

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
