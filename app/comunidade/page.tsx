import Link from "next/link";
import { ChevronRight, Users, Trophy } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAllMatches, getMatchPredictionCounts } from "@/lib/queries/matches";
import { getUserLeagues } from "@/lib/queries/leagues";
import { getLocale, tr } from "@/lib/i18n";

// /comunidade: ponto central para ver o que a galera esta palpitando. Lista as
// partidas por volume de palpites (link para o detalhe, onde fica a aba
// Comunidade) e da acesso rapido as ligas (criar / entrar / ver as suas).
export default async function ComunidadePage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  const [matches, counts, myLeagues] = await Promise.all([
    getAllMatches(),
    getMatchPredictionCounts(),
    user ? getUserLeagues(user.id) : Promise.resolve([]),
  ]);

  const active = matches
    .map((m) => ({ match: m, count: counts.get(m.id) ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(a.match.kickoffAt).getTime() - new Date(b.match.kickoffAt).getTime();
    });

  return (
    <>
      <Header title={tr(locale, "Comunidade", "Comunidad")} subtitle={tr(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminatorias")} />
      <Breadcrumbs
        items={[{ label: tr(locale, "Início", "Inicio"), href: "/" }, { label: tr(locale, "Comunidade", "Comunidad") }]}
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Card>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Suas ligas", "Tus ligas")}</p>
          {user && myLeagues.length > 0 ? (
            <div className="mb-3 flex flex-col gap-2">
              {myLeagues.map(({ league, members }) => (
                <Link
                  key={league.id}
                  href={`/ligas/${league.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-paper p-3"
                >
                  <span>
                    <span className="t-card-title text-indigo">
                      {league.name}
                    </span>
                    <span className="t-caption block text-muted">
                      {members} {tr(locale, "participante(s)", "participante(s)")}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-muted"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="t-body mb-3 text-muted">
              {tr(
                locale,
                "Crie uma liga para disputar com seus amigos ou entre em uma com o link de convite.",
                "Crea una liga para competir con tus amigos o únete a una con el link de invitación.",
              )}
            </p>
          )}
          <LinkButton href="/ligas" variant="secondary" className="w-full">
            <Users size={18} strokeWidth={2.5} aria-hidden="true" />
            {tr(locale, "Criar ou entrar em uma liga", "Crear o unirse a una liga")}
          </LinkButton>
        </Card>

        <div>
          <p className="t-kicker mb-2 text-indigo">
            {tr(locale, "Onde a galera está palpitando", "Dónde está pronosticando la gente")}
          </p>
          {active.length === 0 ? (
            <EmptyState icon={Users} title={tr(locale, "Os palpites começam aqui", "Los pronósticos empiezan aquí")}>
              {tr(
                locale,
                "Assim que a comunidade começar a palpitar, os jogos mais quentes aparecem nesta lista.",
                "En cuanto la comunidad empiece a pronosticar, los partidos más calientes aparecen en esta lista.",
              )}
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-2">
              {active.map(({ match, count }) => (
                <Link
                  key={match.id}
                  href={`/partidas/${match.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-paper p-3"
                >
                  <span className="min-w-0">
                    <span className="t-card-title text-indigo">
                      {match.homeCode} x {match.awayCode}
                    </span>
                    <span className="t-caption block text-muted">
                      {count} {tr(locale, "palpite(s) da comunidade", "pronóstico(s) de la comunidad")}
                    </span>
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-muted"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <LinkButton href="/ranking" variant="secondary" className="w-full">
          <Trophy size={18} strokeWidth={2.5} aria-hidden="true" />
          {tr(locale, "Ver o ranking", "Ver el ranking")}
        </LinkButton>
      </main>
    </>
  );
}
