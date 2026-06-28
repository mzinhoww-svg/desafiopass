import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { RankingRow } from "@/components/ranking-row";
import {
  getGlobalRanking,
  getMyGlobalRank,
  getLeagueRanking,
} from "@/lib/queries/ranking";
import { getUserLeagues } from "@/lib/queries/leagues";
import { getCurrentUser } from "@/lib/auth-helpers";

// /ranking (Task 3.1): faixa pessoal + lista com competition ranking e desempate
// deterministico (RANKING_SPEC). Toggle entre o ranking geral (liga publica) e os
// rankings das ligas que o usuario participa.
export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const user = await getCurrentUser();
  const showLeagues = view === "ligas" && !!user;

  const myLeagues = user ? await getUserLeagues(user.id) : [];

  // Ranking de cada liga do usuario (apenas no modo "ligas").
  const leagueRankings = showLeagues
    ? await Promise.all(
        myLeagues.map(async ({ league }) => ({
          league,
          rows: await getLeagueRanking({
            leagueId: league.id,
            currentUserId: user?.id ?? null,
            limit: 100,
            offset: 0,
          }),
        })),
      )
    : [];

  const [rows, myRank] = showLeagues
    ? [[], null]
    : await Promise.all([
        getGlobalRanking({
          currentUserId: user?.id ?? null,
          limit: 100,
          offset: 0,
        }),
        user ? getMyGlobalRank(user.id) : Promise.resolve(null),
      ]);

  const tab = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-indigo text-white" : "bg-cloud text-indigo"
    }`;

  return (
    <>
      <Header title="Ranking" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ranking" }]} />
      <main className="flex-1 px-5 py-4">
        {user ? (
          <div className="mb-4 flex gap-2">
            <Link href="/ranking?view=geral" className={tab(!showLeagues)}>
              <Trophy size={16} strokeWidth={2.5} aria-hidden="true" />
              Geral
            </Link>
            <Link href="/ranking?view=ligas" className={tab(showLeagues)}>
              <Users size={16} strokeWidth={2.5} aria-hidden="true" />
              Minhas ligas
            </Link>
          </div>
        ) : null}

        {showLeagues ? (
          leagueRankings.length === 0 ? (
            <EmptyState icon={Users} title="Você ainda não está em uma liga">
              Entre em uma liga ou crie a sua em Comunidade para disputar um
              ranking privado com os amigos.
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-6">
              {leagueRankings.map(({ league, rows: lrows }) => (
                <div key={league.id}>
                  <p className="t-kicker mb-2 text-indigo">{league.name}</p>
                  <div className="rounded-2xl border border-black/10 bg-paper p-2">
                    {lrows.map((r) => (
                      <RankingRow key={r.userId} row={r} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {myRank ? (
              <div
                className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-white"
                style={{ background: "var(--grad-deep)" }}
              >
                <span className="text-2xl font-extrabold">
                  {myRank.position ?? "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-caption uppercase tracking-wide text-muted-dark">
                    Sua posição
                  </p>
                  <p className="t-card-title">{myRank.nickname}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-teal">
                    {myRank.points.toLocaleString("pt-BR")}
                  </p>
                  <p className="t-caption text-muted-dark">pts</p>
                </div>
              </div>
            ) : null}

            {rows.length === 0 ? (
              <EmptyState icon={Trophy} title="O ranking ainda está inativo">
                Assim que as primeiras partidas forem encerradas, a
                classificação aparece aqui.
              </EmptyState>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-paper p-2">
                {rows.map((r) => (
                  <RankingRow key={r.userId} row={r} />
                ))}
              </div>
            )}

            {myRank && myRank.position === null ? (
              <p className="t-caption mt-3 text-center text-muted">
                Você ainda não pontuou. Faça palpites para entrar no ranking.
              </p>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
