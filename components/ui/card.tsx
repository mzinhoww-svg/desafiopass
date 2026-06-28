import type { HTMLAttributes } from "react";

/*
 * Card de conteudo. Superficie paper, borda completa sutil (nunca side-stripe),
 * cantos arredondados. Usado com moderacao (match-card, league-card). Nunca
 * aninhar card dentro de card. DESIGN_SPEC secao 6.
 */
export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-black/10 bg-paper p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
