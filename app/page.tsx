import { Header } from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero de marca: superficie escura, momento de impacto (DESIGN_SPEC 2.2).
            Fundo escuro -> acento teal. */}
        <section
          className="relative overflow-hidden px-5 py-12 text-white"
          style={{ background: "var(--grad-deep)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-teal">
            Copa do Mundo FIFA 2026
          </p>
          <h2 className="mt-2 text-3xl font-extrabold uppercase leading-none tracking-tight">
            Palpite. Pontue. Suba no ranking.
          </h2>
          <p className="mt-3 max-w-prose text-sm text-muted-dark">
            O bolão da fase mata-mata com a identidade LATAM Pass. Acerte os
            placares, acumule pontos e dispute prêmios em milhas LATAM Pass.
          </p>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-paper px-5 py-6 text-xs text-muted">
        <p>Bolão LATAM Pass · Copa 2026</p>
        <p className="mt-1">
          Aurimar Reiners · PM de Inovações · LATAM Pass Brasil · squad eLoyalty
          / New Business
        </p>
      </footer>
    </>
  );
}
