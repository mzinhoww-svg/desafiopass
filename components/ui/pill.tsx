import type { HTMLAttributes } from "react";

/*
 * Selo (pill): fase, status, x2 Brasil. Pequeno, caixa alta peso 700. Variantes
 * de cor seguem o guia Elevate conforme o fundo (DESIGN_SPEC secao 6).
 * - neutral: superficie neutra (cloud) com tinta indigo.
 * - rose: destaque/acao em fundo claro (ex x2 Brasil no match-card).
 * - teal: dado/destaque em fundo escuro.
 * - lime: positivo (acerto, estado).
 */
type Variant = "neutral" | "rose" | "teal" | "lime";

const variants: Record<Variant, string> = {
  neutral: "bg-cloud text-indigo",
  rose: "bg-rose text-white",
  teal: "bg-teal text-indigo-deep",
  lime: "bg-lime text-indigo-deep",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Pill({
  variant = "neutral",
  className = "",
  children,
  ...props
}: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
