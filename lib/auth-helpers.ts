import { auth } from "@/lib/auth";

/*
 * Le a sessao no servidor (Server Components e Server Actions). Retorna o usuario
 * logado (id, role, email, name) ou null. Nunca expoe passwordHash.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** True quando ha usuario logado com role admin. */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
