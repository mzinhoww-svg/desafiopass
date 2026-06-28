import { Header } from "@/components/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Goal, Trophy, ChevronRight } from "lucide-react";

/*
 * Home de demonstracao do sistema de design Elevate (Task 0.2). Valida tokens,
 * tipografia, acento por fundo (teal no escuro, rosa no claro), motion (entrada e
 * scroll reveal), icones Lucide e os primitivos. Telas reais vem nas proximas tasks.
 */
export default function Home() {
  return (
    <>
      <Header wing />

      <main className="flex-1">
        {/* Hero de marca: superficie escura, acento unico teal (DESIGN_SPEC 2.2). */}
        <section
          className="relative overflow-hidden px-5 py-12 text-white"
          style={{ background: "var(--grad-deep)" }}
        >
          <FadeIn>
            <p className="t-kicker text-teal">Copa do Mundo FIFA 2026</p>
            <h2 className="t-display mt-2 text-white">
              Palpite. Pontue. Suba no ranking.
            </h2>
            <p className="t-body mt-3 max-w-[46ch] text-muted-dark">
              O bolão da fase mata-mata com a identidade LATAM Pass. Acerte os
              placares, acumule pontos e dispute prêmios em milhas LATAM Pass.
            </p>
            <Button variant="onDark" className="mt-6">
              <Goal size={18} strokeWidth={2.5} aria-hidden="true" />
              Palpitar agora
            </Button>
          </FadeIn>
        </section>

        {/* Conteudo: superficie clara, acento unico rosa. */}
        <section className="px-5 py-8">
          <p className="t-kicker text-indigo">Próximos jogos</p>

          <FadeIn className="mt-3">
            <Card>
              <div className="flex items-center justify-between">
                <Pill variant="neutral">Oitavas x1,4</Pill>
                <Pill variant="rose">x2 Brasil</Pill>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="t-card-title text-indigo">BRA</span>
                <span className="t-caption text-muted">vs</span>
                <span className="t-card-title text-indigo">JPN</span>
              </div>
            </Card>
          </FadeIn>

          <Reveal delay={0.05} className="mt-3">
            <Card>
              <div className="flex items-center justify-between">
                <Pill variant="neutral">Oitavas x1,4</Pill>
                <Pill variant="lime">+28 pts</Pill>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="t-card-title text-indigo">ARG</span>
                <span className="t-caption text-muted">1 x 1</span>
                <span className="t-card-title text-indigo">MEX</span>
              </div>
            </Card>
          </Reveal>

          <Button className="mt-6 w-full">
            <Trophy size={18} strokeWidth={2.5} aria-hidden="true" />
            Ver ranking
            <ChevronRight size={18} strokeWidth={2.5} aria-hidden="true" />
          </Button>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-paper px-5 py-6">
        <p className="t-caption text-muted">Bolão LATAM Pass · Copa 2026</p>
        <p className="t-caption mt-1 text-muted">
          Aurimar Reiners · PM de Inovações · LATAM Pass Brasil · squad eLoyalty
          / New Business
        </p>
      </footer>
    </>
  );
}
