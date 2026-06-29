import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Pill } from "@/components/ui/pill";
import { Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserPredictionsWithMatches } from "@/lib/queries/matches";
import { PHASE_LABEL } from "@/lib/phases";
import { CRITERION_LABEL } from "@/lib/scoring-labels";
import { formatBrasilia } from "@/lib/utils/dates";
import type { Phase, Criterion } from "@/lib/scoring";

// /meus-palpites (#4): histórico dos palpites do usuário, com placar real e pontos.
export default async function MeusPalpitesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await getUserPredictionsWithMatches(user.id);
  const total = rows.reduce((s, r) => s + (r.status === "encerrada" ? r.points : 0), 0);

  return (
    <>
      <Header title="Meus palpites" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs
        items={[{ label: "Início", href: "/" }, { label: "Meus palpites" }]}
      />
      <main className="flex-1 px-5 py-4">
        {rows.length === 0 ? (
          <EmptyState icon={Target} title="Você ainda não palpitou">
            <Link href="/partidas" className="font-bold text-rose">
              Faça seu primeiro palpite
            </Link>{" "}
            e ele aparece aqui com os pontos.
          </EmptyState>
        ) : (
          <>
            <div
              className="mb-4 flex items-center justify-between rounded-2xl px-4 py-3 text-white"
              style={{ background: "var(--grad-deep)" }}
            >
              <span className="t-body font-bold">Total de pontos</span>
              <span className="text-lg font-extrabold text-teal">
                {total.toLocaleString("pt-BR")}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {rows.map((r) => {
                const closed = r.status === "encerrada";
                return (
                  <Link
                    key={r.matchId}
                    href={`/partidas/${r.matchId}`}
                    className="rounded-2xl border border-black/10 bg-paper p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="t-caption text-muted">
                        {PHASE_LABEL[r.phase as Phase] ?? r.phase}
                      </span>
                      <span className="t-caption text-muted">
                        {formatBrasilia(new Date(r.kickoffAt))}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="t-card-title text-indigo">
                        {r.homeCode} {r.homeGuess} x {r.awayGuess} {r.awayCode}
                      </span>
                      {closed ? (
                        <Pill variant="lime">+{r.points} pts</Pill>
                      ) : (
                        <Pill variant="neutral">Aguardando</Pill>
                      )}
                    </div>
                    {closed ? (
                      <p className="t-caption mt-1 text-muted">
                        Placar: {r.homeScore} x {r.awayScore} ·{" "}
                        {CRITERION_LABEL[(r.criterion as Criterion) ?? "errado"]}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
