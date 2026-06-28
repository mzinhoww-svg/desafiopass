import type { ButtonHTMLAttributes } from "react";

/*
 * Botao primario do produto. Acento de acao por fundo (DESIGN_SPEC secao 2.1):
 * - primary: rosa em fundo claro (acao primaria, CTA).
 * - secondary: contorno rosa em fundo claro.
 * - onDark: teal em fundo escuro (header/hero).
 * Toque minimo 48px, caixa alta peso 700, foco visivel. Sem emoji.
 */
type Variant = "primary" | "secondary" | "onDark";

const base =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-rose text-white hover:brightness-95",
  secondary: "border-2 border-rose bg-paper text-rose hover:bg-rose/5",
  onDark: "focus-on-dark bg-teal text-indigo-deep hover:brightness-95",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
