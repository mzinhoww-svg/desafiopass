import Link from "next/link";
import { Goal, ScrollText, Target, Trophy, Medal } from "lucide-react";
import { Header } from "@/components/header";
import { LinkButton } from "@/components/ui/link-button";
import { MatchCard } from "@/components/match-card";
import { FadeIn } from "@/components/motion/fade-in";
import { getAllMatches, getUserPredictionMap } from "@/lib/queries/matches";
import { getTeamMap, resolveTeam } from "@/lib/teams";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLocale, tr } from "@/lib/i18n";
import { NotificationPrompt } from "@/components/pwa/notification-prompt";

// Home (Task 5.2): hero de marca, CTA para palpitar e proximos jogos do mata-mata
// (agendados futuros), com a navegacao principal na tab bar (layout).
export default async function Home() {
  const user = await getCurrentUser();
  const [all, predMap, teamMap, locale] = await Promise.all([
    getAllMatches(),
    getUserPredictionMap(user?.id ?? null),
    getTeamMap(),
    getLocale(),
  ]);

  // Passo a passo da proposta, exibido na home para quem ainda nao conhece o bolao.
  const STEPS = [
    {
      icon: Target,
      title: tr(locale, "Palpite", "Pronostica"),
      text: tr(
        locale,
        "Dê o placar de cada jogo do mata-mata antes do apito inicial.",
        "Pon el marcador de cada partido de la fase eliminatoria antes del pitazo inicial.",
      ),
    },
    {
      icon: Trophy,
      title: tr(locale, "Pontue", "Suma puntos"),
      text: tr(
        locale,
        "Some pontos a cada rodada e suba no ranking geral e nas suas ligas.",
        "Suma puntos en cada ronda y sube en el ranking general y en tus ligas.",
      ),
    },
    {
      icon: Medal,
      title: tr(locale, "Vença", "Gana"),
      text: tr(
        locale,
        "Termine no topo da classificação e ganhe o bolão.",
        "Termina en lo más alto de la clasificación y gana la polla.",
      ),
    },
  ];
  const now = Date.now();
  const openMatches = all.filter(
    (m) => m.status === "agendada" && new Date(m.kickoffAt).getTime() > now,
  );
  const upcoming = openMatches.slice(0, 3);
  // Palpites pendentes do usuario logado (#3): jogos abertos ainda sem palpite.
  const pendingCount = user
    ? openMatches.filter((m) => !predMap.has(m.id)).length
    : 0;

  return (
    <>
      {user ? <NotificationPrompt /> : null}
      <Header wing />
      <main className="flex-1">
        <section
          className="relative overflow-hidden px-5 py-12 text-white"
          style={{ background: "var(--grad-deep)" }}
        >
          <FadeIn>
            <p className="t-kicker text-teal">
              {tr(locale, "Copa do Mundo 2026 · Mata-mata", "Copa del Mundo 2026 · Eliminatorias")}
            </p>
            <h2 className="t-display mt-2 text-white">
              {tr(locale, "Palpite. Pontue. Vença o bolão.", "Pronostica. Suma. Gana la polla.")}
            </h2>
            <p className="t-body mt-3 max-w-[46ch] text-muted-dark">
              {tr(
                locale,
                "Acerte os placares do mata-mata, acumule pontos a cada rodada e fique no topo do ranking com seus amigos.",
                "Acierta los marcadores de la fase eliminatoria, suma puntos en cada ronda y llega a lo más alto del ranking con tus amigos.",
              )}
            </p>
            <LinkButton
              href={user ? "/partidas" : "/cadastro"}
              variant="onDark"
              className="mt-6"
            >
              <Goal size={18} strokeWidth={2.5} aria-hidden="true" />
              {user
                ? tr(locale, "Palpitar agora", "Pronosticar ahora")
                : tr(locale, "Criar conta e palpitar", "Crear cuenta y pronosticar")}
            </LinkButton>
          </FadeIn>
        </section>

        {pendingCount > 0 ? (
          <Link
            href="/partidas"
            className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-rose/40 bg-rose/5 px-4 py-3"
          >
            <span className="t-body font-bold text-indigo">
              {pendingCount === 1
                ? tr(locale, "Falta 1 jogo para palpitar", "Falta 1 partido por pronosticar")
                : tr(
                    locale,
                    `Faltam ${pendingCount} jogos para palpitar`,
                    `Faltan ${pendingCount} partidos por pronosticar`,
                  )}
            </span>
            <span className="t-caption flex-none font-bold text-rose">
              {tr(locale, "Palpitar", "Pronosticar")}
            </span>
          </Link>
        ) : null}

        {/* Partidas em destaque, logo abaixo do hero. */}
        <section className="px-5 py-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="t-kicker text-indigo">
              {tr(locale, "Próximos jogos", "Próximos partidos")}
            </p>
            <Link href="/partidas" className="t-caption font-bold text-rose">
              {tr(locale, "Ver todos", "Ver todos")}
            </Link>
          </div>

          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  prediction={predMap.get(m.id) ?? null}
                  home={resolveTeam(teamMap, m.homeCode)}
                  away={resolveTeam(teamMap, m.awayCode)}
                />
              ))}
            </div>
          ) : (
            <p className="t-body text-muted">
              {tr(
                locale,
                "Os jogos do mata-mata aparecem aqui assim que a fase começar.",
                "Los partidos de la fase eliminatoria aparecen aquí apenas comience la fase.",
              )}
            </p>
          )}

          <LinkButton
            href={user ? "/partidas" : "/cadastro"}
            className="mt-4 w-full"
          >
            <Goal size={18} strokeWidth={2.5} aria-hidden="true" />
            {user
              ? tr(locale, "Ver todos os jogos", "Ver todos los partidos")
              : tr(locale, "Criar conta e palpitar", "Crear cuenta y pronosticar")}
          </LinkButton>
        </section>

        <section className="px-5 pb-6">
          <p className="t-kicker mb-3 text-indigo">
            {tr(locale, "Como funciona", "Cómo funciona")}
          </p>
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

          <LinkButton href="/regras" variant="secondary" className="mt-6 w-full">
            <ScrollText size={18} strokeWidth={2.5} aria-hidden="true" />
            {tr(locale, "Regras e pontuação", "Reglas y puntuación")}
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-paper px-5 py-6">
        <p className="t-caption text-muted">
          {tr(locale, "Bolão LATAM Pass · Copa 2026", "Polla LATAM Pass · Copa 2026")}
        </p>
        <p className="t-caption mt-1 text-muted">
          {tr(
            locale,
            "Palpite, pontue e vença o bolão · Mata-mata",
            "Pronostica, suma y gana la polla · Eliminatorias",
          )}
        </p>
        <Link href="/privacidade" className="t-caption mt-2 inline-block font-bold text-rose">
          {tr(locale, "Privacidade", "Privacidad")}
        </Link>
      </footer>
    </>
  );
}
