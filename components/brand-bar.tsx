/*
 * Barra gradiente (--grad). Borda inferior de header e quebras de secao.
 * Assinatura de marca Bolão Pass. DESIGN_SPEC secao 5 e 6.
 */
export function BrandBar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`brand-bar block w-full ${className}`} />;
}
