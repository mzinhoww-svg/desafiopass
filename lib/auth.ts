import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

/*
 * Auth.js v5. Credentials provider: valida email + senha contra a tabela users,
 * comparando o hash bcrypt. Roda no runtime Node (route handler), nunca no edge.
 * Nunca expoe passwordHash. role e id entram no token via callbacks (auth.config.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);
        const user = found[0];
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // O objeto retornado vira o `user` do callback jwt. Sem passwordHash.
        return {
          id: user.id,
          email: user.email,
          name: user.nickname,
          role: user.role,
        };
      },
    }),
  ],
});
