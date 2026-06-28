"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, Trophy, Users, User } from "lucide-react";

/*
 * Navegacao inferior (mobile-first), espelhando o tabbar do wireframe. Item ativo
 * em rosa (acento em fundo claro). Oculta em telas de auth (login/cadastro).
 */
const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/partidas", label: "Jogos", icon: ListChecks },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/ligas", label: "Ligas", icon: Users },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/cadastro")) {
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
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide ${
              active ? "text-rose" : "text-muted"
            }`}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.5 : 2}
              aria-hidden="true"
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
