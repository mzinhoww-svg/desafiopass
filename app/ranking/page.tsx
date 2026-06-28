import { Trophy } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { RankingRow } from "@/components/ranking-row";
import { getGlobalRanking, getMyGlobalRank } from "@/lib/queries/ranking";
import { getCurrentUser } from "@/lib/auth-helpers";

// /ranking (Task 3.1): faixa pessoal (query propria, funciona fora do top) + lista
// top 100 com competition ranking e desempate deterministico. RANKING_SPEC.
export default async function RankingPage() {
  const user = await getCurrentUser();
  const [rows, myRank] = await Promise.all([
    getGlobalRanking({ currentUserId: user?.id ?? null, limit: 100, offset: 0 }),
    user ? getMyGlobalRank(user.id) : Promise.resolve(null),
  ]);

  return (
    <>
      <Header title="Ranking geral" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ranking" }]} />
      <main className="flex-1 px-5 py-4">
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
            Assim que as primeiras partidas forem encerradas, a classificação
            aparece aqui.
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
      </main>
    </>
  );
}
