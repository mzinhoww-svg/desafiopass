"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n/locale-provider";

// Error boundary de rota (#9). Captura erros de render/data no segmento, registra
// (visível nos logs de runtime da Vercel) e oferece "tentar de novo" sem reload total.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error("[ui-error]", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="t-kicker text-rose">{t("Ops", "Ups")}</p>
      <h1 className="t-display text-indigo">{t("Algo deu errado", "Algo salió mal")}</h1>
      <p className="t-body max-w-[40ch] text-muted">
        {t(
          "Tivemos um problema ao carregar esta tela. Tente novamente — se continuar, volte mais tarde.",
          "Tuvimos un problema al cargar esta pantalla. Inténtalo de nuevo y, si sigue, vuelve más tarde.",
        )}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white"
      >
        {t("Tentar de novo", "Intentar de nuevo")}
      </button>
      <Link href="/" className="t-caption font-bold text-rose">
        {t("Voltar ao início", "Volver al inicio")}
      </Link>
    </main>
  );
}
