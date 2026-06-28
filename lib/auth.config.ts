import type { NextAuthConfig } from "next-auth";

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
