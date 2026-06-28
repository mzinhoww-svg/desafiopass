import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Estado vazio: icone Lucide discreto + titulo + texto caption (DESIGN_SPEC 6).
// Tom PROF, direto. Sem ilustracao de terceiro.
export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
      <Icon size={40} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
      <p className="t-card-title text-indigo">{title}</p>
      {children ? (
        <p className="t-body max-w-[40ch] text-muted">{children}</p>
      ) : null}
    </div>
  );
}
