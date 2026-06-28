import Link from "next/link";
import type { ComponentProps } from "react";

/*
 * Link com aparencia de botao (mesmos tokens do Button). Para CTAs que navegam.
 * Acento por fundo: primary rosa (claro), onDark teal (escuro), secondary contorno.
 */
type Variant = "primary" | "secondary" | "onDark";

const base =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold uppercase tracking-wide transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-rose text-white hover:brightness-95",
  secondary: "border-2 border-rose bg-paper text-rose hover:bg-rose/5",
  onDark: "focus-on-dark bg-teal text-indigo-deep hover:brightness-95",
};

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
