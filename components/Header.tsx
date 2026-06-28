/*
 * Header LATAM Pass. Superficie indigo (gradiente profundo Elevate), marca em
 * quadrado gradiente, titulo em caixa alta peso 800 e barra gradiente Elevate na
 * borda inferior (DESIGN_SPEC secao 6, BRANDING.md). Fundo escuro: acento teal.
 * Sem emoji. Asa decorativa permitida so em superficie de destaque (home).
 */
export function Header() {
  return (
    <header
      className="relative overflow-hidden px-5 py-4 text-white"
      style={{ background: "var(--grad-deep)" }}
    >
      <div className="flex items-center gap-3">
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
            Bolão LATAM Pass
          </h1>
          <p className="text-xs font-medium text-muted-dark">
            Copa 2026 · Mata-mata
          </p>
        </div>
      </div>

      {/* Barra gradiente Elevate na borda inferior */}
      <span className="brand-bar absolute inset-x-0 bottom-0" aria-hidden="true" />
    </header>
  );
}
