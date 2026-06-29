"use client";

import { useEffect } from "react";
import Link from "next/link";

// Error boundary de rota (#9). Captura erros de render/data no segmento, registra
// (visível nos logs de runtime da Vercel) e oferece "tentar de novo" sem reload total.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ui-error]", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="t-kicker text-rose">Ops</p>
      <h1 className="t-display text-indigo">Algo deu errado</h1>
      <p className="t-body max-w-[40ch] text-muted">
        Tivemos um problema ao carregar esta tela. Tente novamente — se
        continuar, volte mais tarde.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white"
      >
        Tentar de novo
      </button>
      <Link href="/" className="t-caption font-bold text-rose">
        Voltar ao início
      </Link>
    </main>
  );
}
