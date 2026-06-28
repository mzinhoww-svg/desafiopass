import { CalendarClock } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/empty-state";
import { getAllMatches, getUserPredictionMap } from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PHASE_ORDER, PHASE_LABEL } from "@/lib/phases";

// /partidas: lista por fase (ordem do torneio) com estado do palpite do usuario.
export default async function PartidasPage() {
  const user = await getCurrentUser();
  const [all, predMap] = await Promise.all([
    getAllMatches(),
    getUserPredictionMap(user?.id ?? null),
  ]);

  const groups = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABEL[phase],
    list: all.filter((m) => m.phase === phase),
  })).filter((g) => g.list.length > 0);

  return (
    <>
      <Header title="Jogos" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Jogos" }]} />
      <main className="flex-1 px-5 py-4">
        {all.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Sem jogos ainda">
            Os jogos do mata-mata aparecem aqui assim que o banco for semeado.
          </EmptyState>
        ) : (
          groups.map((g) => (
            <section key={g.phase} className="mb-6">
              <p className="t-kicker mb-2 text-indigo">{g.label}</p>
              <div className="flex flex-col gap-3">
                {g.list.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    prediction={predMap.get(m.id) ?? null}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
