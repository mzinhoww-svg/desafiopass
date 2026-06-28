import { BrandBar } from "@/components/brand-bar";

/*
 * Header LATAM Pass. Superficie indigo (gradiente profundo Elevate), marca em
 * quadrado gradiente, titulo em caixa alta peso 800, barra gradiente Elevate na
 * borda inferior. Fundo escuro: acento de destaque em teal. Sem emoji.
 *
 * A "asa" decorativa Elevate (SVG inline, opacidade ~0.16) e permitida so em
 * superficie de destaque (home), sangrando por um canto, nunca atras de texto.
 */
interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Asa decorativa Elevate. So na home (DESIGN_SPEC secao 5). */
  wing?: boolean;
}

export function Header({
  title = "Bolão LATAM Pass",
  subtitle = "Copa 2026 · Mata-mata",
  wing = false,
}: HeaderProps) {
  return (
    <header
      className="relative overflow-hidden px-5 py-4 text-white"
      style={{ background: "var(--grad-deep)" }}
    >
      {wing ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 h-32 w-32"
          style={{ opacity: 0.16 }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M10 90 C 40 70, 60 40, 95 5 C 80 45, 55 75, 10 90 Z"
            fill="var(--rose)"
          />
        </svg>
      ) : null}

      <div className="relative flex items-center gap-3">
        {/* Marca: quadrado gradiente Elevate (placeholder do simbolo LATAM Pass) */}
        <span
          aria-hidden="true"
          className="h-8 w-8 flex-none rounded-lg"
          style={{
            background: "var(--grad)",
            boxShadow: "0 2px 10px rgba(254,49,115,.4)",
          }}
        />
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold uppercase leading-tight tracking-tight">
            {title}
          </h1>
          <p className="t-caption text-muted-dark">{subtitle}</p>
        </div>
      </div>

      <BrandBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}
