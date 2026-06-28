import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Trilha simples (Inicio / Secao / Atual). Ultimo item sem href = pagina atual.
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Trilha de navegação"
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
