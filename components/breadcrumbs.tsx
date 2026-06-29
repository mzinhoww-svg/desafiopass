import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getLocale, tr } from "@/lib/i18n";

// Trilha simples (Inicio / Secao / Atual). Ultimo item sem href = pagina atual.
export async function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const locale = await getLocale();
  return (
    <nav
      aria-label={tr(locale, "Trilha de navegação", "Ruta de navegación")}
      className="t-caption flex items-center gap-1 px-5 pt-4 text-muted"
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight size={12} aria-hidden="true" /> : null}
          {it.href ? (
            <Link href={it.href} className="hover:text-indigo">
              {it.label}
            </Link>
          ) : (
            <span className="font-bold text-indigo">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
