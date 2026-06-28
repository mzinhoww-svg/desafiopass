"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Trophy, Users, User } from "lucide-react";

/*
 * Navegacao inferior (mobile-first), espelhando o tabbar do wireframe. Item ativo
 * em rosa (acento em fundo claro). Oculta em telas de auth (login/cadastro).
 * Comunidade no lugar de Ligas para dar visibilidade ao que a galera esta
 * palpitando (as ligas continuam acessiveis dentro de Comunidade).
 */
const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/partidas", label: "Palpites", icon: ListChecks },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/comunidade", label: "Comunidade", icon: Users },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function TabBar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const authRoutes = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"];
  if (authRoutes.some((r) => pathname.startsWith(r))) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md border-t border-black/10 bg-paper"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        // Badge de palpites pendentes no item Jogos (#3).
        const badge = href === "/partidas" && pendingCount > 0 ? pendingCount : 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide ${
              active ? "text-rose" : "text-muted"
            }`}
          >
            <span className="relative">
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />
              {badge > 0 ? (
                <span
                  className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[0.5625rem] font-bold leading-none text-white"
                  aria-label={`${badge} palpites pendentes`}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
