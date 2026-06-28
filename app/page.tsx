import Link from "next/link";
import { Goal, ScrollText } from "lucide-react";
import { Header } from "@/components/header";
import { LinkButton } from "@/components/ui/link-button";
import { MatchCard } from "@/components/match-card";
import { FadeIn } from "@/components/motion/fade-in";
import { getAllMatches, getUserPredictionMap } from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";

// Home (Task 5.2): hero de marca, CTA para palpitar e proximos jogos do mata-mata
// (agendados futuros), com a navegacao principal na tab bar (layout).
export default async function Home() {
  const user = await getCurrentUser();
  const [all, predMap] = await Promise.all([
    getAllMatches(),
    getUserPredictionMap(user?.id ?? null),
  ]);
  const now = Date.now();
  const upcoming = all
    .filter(
      (m) => m.status === "agendada" && new Date(m.kickoffAt).getTime() > now,
    )
    .slice(0, 3);

  return (
    <>
      <Header wing />
      <main className="flex-1">
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
            <LinkButton href="/partidas" variant="onDark" className="mt-6">
              <Goal size={18} strokeWidth={2.5} aria-hidden="true" />
              Palpitar agora
            </LinkButton>
          </FadeIn>
        </section>

        <section className="px-5 py-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="t-kicker text-indigo">Próximos jogos</p>
            <Link href="/partidas" className="t-caption font-bold text-rose">
              Ver todos
            </Link>
          </div>

          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  prediction={predMap.get(m.id) ?? null}
                />
              ))}
            </div>
          ) : (
            <p className="t-body text-muted">
              Sem jogos agendados no momento. Volte em breve.
            </p>
          )}

          <LinkButton href="/regras" variant="secondary" className="mt-6 w-full">
            <ScrollText size={18} strokeWidth={2.5} aria-hidden="true" />
            Regras e prêmios
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-paper px-5 py-6">
        <p className="t-caption text-muted">Bolão LATAM Pass · Copa 2026</p>
        <p className="t-caption mt-1 text-muted">
          Prêmios em milhas LATAM Pass · Mata-mata
        </p>
      </footer>
    </>
  );
}
