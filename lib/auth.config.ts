import type { NextAuthConfig } from "next-auth";

/*
 * Lista de emails sempre tratados como admin, independente do valor em banco.
 * Edge-safe (sem db): aplicada no callback jwt em TODA requisicao, entao a
 * promocao vale para sessoes existentes sem precisar de novo login nem seed.
 */
const ADMIN_EMAILS = ["mazinhoww@gmail.com"];

/*
 * Config edge-safe do Auth.js v5: SEM bcrypt e SEM acesso a banco, para poder rodar
 * no middleware (edge). O Credentials provider (que usa db + bcrypt) fica em lib/auth.ts.
 *
 * - sessao via JWT; id e role viajam no token e na sessao (role permite o middleware
 *   decidir /admin sem ir ao banco).
 * - authorized() e usado pelo middleware: protege rotas logadas e /admin.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // Credentials adicionado em lib/auth.ts (fora do edge)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
      }
      // Allowlist por email: roda em toda chamada (login e refresh), promovendo
      // tambem sessoes ja abertas sem exigir novo login.
      const email = (user?.email ?? token.email) as string | undefined;
      if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "user";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth?.user?.role === "admin";
      }
      // Demais rotas cobertas pelo matcher do middleware exigem apenas login.
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
