import Link from "next/link";
import { Goal, ScrollText, Target, Trophy, Medal } from "lucide-react";
import { Header } from "@/components/header";
import { LinkButton } from "@/components/ui/link-button";
import { MatchCard } from "@/components/match-card";
import { FadeIn } from "@/components/motion/fade-in";
import { getAllMatches, getUserPredictionMap } from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";

// Passo a passo da proposta, exibido na home para quem ainda nao conhece o bolao.
const STEPS = [
  { icon: Target, title: "Palpite", text: "Dê o placar de cada jogo do mata-mata antes do apito inicial." },
  { icon: Trophy, title: "Pontue", text: "Some pontos a cada rodada e suba no ranking geral e nas suas ligas." },
  { icon: Medal, title: "Vença", text: "Termine no topo da classificação e ganhe o bolão." },
];

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
            <p className="t-kicker text-teal">
              Copa do Mundo 2026 · Mata-mata
            </p>
            <h2 className="t-display mt-2 text-white">
              Palpite. Pontue. Vença o bolão.
            </h2>
            <p className="t-body mt-3 max-w-[46ch] text-muted-dark">
              Acerte os placares do mata-mata, acumule pontos a cada rodada e
              fique no topo do ranking com seus amigos.
            </p>
            <LinkButton
              href={user ? "/partidas" : "/cadastro"}
              variant="onDark"
              className="mt-6"
            >
              <Goal size={18} strokeWidth={2.5} aria-hidden="true" />
              {user ? "Palpitar agora" : "Criar conta e palpitar"}
            </LinkButton>
          </FadeIn>
        </section>

        <section className="px-5 py-6">
          <p className="t-kicker mb-3 text-indigo">Como funciona</p>
          <div className="flex flex-col gap-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-white"
                  style={{ background: "var(--grad-deep)" }}
                >
                  <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="t-card-title text-indigo">{title}</p>
                  <p className="t-caption text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 pb-6">
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
              Os jogos do mata-mata aparecem aqui assim que a fase começar.
            </p>
          )}

          <LinkButton href="/regras" variant="secondary" className="mt-6 w-full">
            <ScrollText size={18} strokeWidth={2.5} aria-hidden="true" />
            Regras e pontuação
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-paper px-5 py-6">
        <p className="t-caption text-muted">Bolão LATAM Pass · Copa 2026</p>
        <p className="t-caption mt-1 text-muted">
          Palpite, pontue e vença o bolão · Mata-mata
        </p>
      </footer>
    </>
  );
}
