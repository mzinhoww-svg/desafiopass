import Link from "next/link";
import { getLocale, tr } from "@/lib/i18n";

// 404 amigável e na marca (#9).
export default async function NotFound() {
  const locale = await getLocale();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="t-kicker text-rose">{tr(locale, "Erro 404", "Error 404")}</p>
      <h1 className="t-display text-indigo">{tr(locale, "Página não encontrada", "Página no encontrada")}</h1>
      <p className="t-body max-w-[40ch] text-muted">
        {tr(
          locale,
          "O endereço que você tentou abrir não existe ou foi movido.",
          "La dirección que intentaste abrir no existe o fue movida.",
        )}
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white"
      >
        {tr(locale, "Voltar ao início", "Volver al inicio")}
      </Link>
    </main>
  );
}
