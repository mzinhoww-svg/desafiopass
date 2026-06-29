import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Pill } from "@/components/ui/pill";
import { Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserPredictionsWithMatches } from "@/lib/queries/matches";
import { phaseLabel } from "@/lib/phases";
import { criterionLabel } from "@/lib/scoring-labels";
import { formatBrasilia } from "@/lib/utils/dates";
import { getLocale, tr } from "@/lib/i18n";
import type { Phase, Criterion } from "@/lib/scoring";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-paper p-3 text-center">
      <p className="text-xl font-extrabold text-indigo">{value}</p>
      <p className="t-caption text-muted">{label}</p>
    </div>
  );
}

// /meus-palpites (#4): histórico dos palpites do usuário, com placar real e pontos.
export default async function MeusPalpitesPage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await getUserPredictionsWithMatches(user.id);
  const closedRows = rows.filter((r) => r.status === "encerrada");
  const total = closedRows.reduce((s, r) => s + r.points, 0);
  // Estatisticas pessoais (#5).
  const exactCount = closedRows.filter((r) => r.criterion === "placar_exato").length;
  const hits = closedRows.filter((r) => r.points > 0).length;
  const accuracy =
    closedRows.length > 0 ? Math.round((hits / closedRows.length) * 100) : 0;
  const best = closedRows.reduce((m, r) => Math.max(m, r.points), 0);

  return (
    <>
      <Header title={tr(locale, "Meus palpites", "Mis pronósticos")} subtitle={tr(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminatorias")} />
      <Breadcrumbs
        items={[{ label: tr(locale, "Início", "Inicio"), href: "/" }, { label: tr(locale, "Meus palpites", "Mis pronósticos") }]}
      />
      <main className="flex-1 px-5 py-4">
        {rows.length === 0 ? (
          <EmptyState icon={Target} title={tr(locale, "Você ainda não palpitou", "Todavía no hiciste ningún pronóstico")}>
            <Link href="/partidas" className="font-bold text-rose">
              {tr(locale, "Faça seu primeiro palpite", "Haz tu primer pronóstico")}
            </Link>{" "}
            {tr(locale, "e ele aparece aqui com os pontos.", "y aparece aquí con los puntos.")}
          </EmptyState>
        ) : (
          <>
            <div
              className="mb-3 flex items-center justify-between rounded-2xl px-4 py-3 text-white"
              style={{ background: "var(--grad-deep)" }}
            >
              <span className="t-body font-bold">{tr(locale, "Total de pontos", "Total de puntos")}</span>
              <span className="text-lg font-extrabold text-teal">
                {total.toLocaleString(locale === "es" ? "es-CL" : "pt-BR")}
              </span>
            </div>

            {closedRows.length > 0 ? (
              <div className="mb-4 grid grid-cols-3 gap-2">
                <Stat value={`${accuracy}%`} label={tr(locale, "Aproveitamento", "Efectividad")} />
                <Stat value={exactCount} label={tr(locale, "Placares exatos", "Marcadores exactos")} />
                <Stat value={best} label={tr(locale, "Melhor jogo", "Mejor partido")} />
              </div>
            ) : null}

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
                        {phaseLabel(r.phase as Phase, locale) ?? r.phase}
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
                        <Pill variant="neutral">{tr(locale, "Aguardando", "Esperando")}</Pill>
                      )}
                    </div>
                    {closed ? (
                      <p className="t-caption mt-1 text-muted">
                        {tr(locale, "Placar", "Marcador")}: {r.homeScore} x {r.awayScore} ·{" "}
                        {criterionLabel((r.criterion as Criterion) ?? "errado", locale)}
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
