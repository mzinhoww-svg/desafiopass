/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { BrandBar } from "@/components/brand-bar";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserAvatar } from "@/lib/queries/users";

/*
 * Header LATAM Pass. Superficie indigo (gradiente profundo Elevate), logo oficial,
 * titulo em caixa alta peso 800 e barra gradiente Elevate na borda inferior. Quando
 * ha usuario logado, mostra a foto (ou iniciais) a direita, com link para /perfil.
 * Asa decorativa opcional so na home.
 */
interface HeaderProps {
  title?: string;
  subtitle?: string;
  wing?: boolean;
  hideLogin?: boolean; // suprime o botao "Entrar" (ex: na propria tela de login)
}

export async function Header({
  title = "Bolão LATAM Pass",
  subtitle = "Copa 2026 · Mata-mata",
  wing = false,
  hideLogin = false,
}: HeaderProps) {
  const user = await getCurrentUser();
  const avatar = user ? await getUserAvatar(user.id) : null;
  const initials = (user?.name ?? "").trim().slice(0, 2).toUpperCase();

  return (
    <header
      className="relative overflow-hidden px-5 py-4 text-white"
      style={{ background: "var(--grad-deep)" }}
    >
      {wing ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 h-32 w-32"
          style={{ opacity: 0.16 }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M10 90 C 40 70, 60 40, 95 5 C 80 45, 55 75, 10 90 Z"
            fill="var(--rose)"
          />
        </svg>
      ) : null}

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Logo oficial LATAM Pass (branco), sobre o header indigo. */}
          <img
            src="/brand/latam-white-2k23.png"
            alt="LATAM Pass"
            className="h-7 w-auto flex-none"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold uppercase leading-tight tracking-tight">
              {title}
            </h1>
            <p className="t-caption text-muted-dark">{subtitle}</p>
          </div>
        </div>

        {user ? (
          <Link
            href="/perfil"
            aria-label="Seu perfil"
            className="focus-on-dark flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full bg-white/15 text-xs font-bold text-white"
          >
            {avatar ? (
              <img src={avatar} alt="Seu perfil" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </Link>
        ) : hideLogin ? null : (
          // Atalho discreto para quem ja tem conta (visitante deslogado).
          <Link
            href="/login"
            className="focus-on-dark flex-none rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold text-white"
          >
            Entrar
          </Link>
        )}
      </div>

      <BrandBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}
