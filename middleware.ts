import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware edge usa apenas a config edge-safe (authorized callback decide o acesso).
// Visitante em rota protegida -> redirecionado para /login (pages.signIn).
// /admin exige role admin.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/perfil/:path*", "/ligas/:path*", "/admin/:path*"],
};
