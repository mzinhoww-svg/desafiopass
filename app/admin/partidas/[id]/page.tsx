import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { getMatchById } from "@/lib/queries/matches";
import { getTeamMap, resolveTeam } from "@/lib/teams";
import { phaseBadge } from "@/lib/phases";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { AdminForm } from "./admin-form";
import { EditMatchForm } from "./edit-match-form";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { toBrasiliaInput } from "@/lib/utils/dates";
import type { Phase } from "@/lib/scoring";
import { getLocale, tr } from "@/lib/i18n";

export default async function AdminMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/login");
  const locale = await getLocale();
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const teamMap = await getTeamMap();
  const home = resolveTeam(teamMap, match.homeCode);
  const away = resolveTeam(teamMap, match.awayCode);
  // Seleções para os seletores: as do banco (inclui as reais importadas) + as do
  // seed, sem duplicar. Ordenadas por nome.
  const teamOptions = [
    ...new Map(
      [
        ...teamMap.values(),
        ...seedTeams.filter((t) => t.flagCode),
      ].map((t) => [t.code, { code: t.code, name: t.name }]),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Header
        title={tr(locale, "Admin · Resultado", "Admin · Resultado")}
        subtitle={tr(locale, "Inserir placar", "Ingresar marcador")}
      />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Admin", href: "/admin" },
          { label: `${match.homeCode} x ${match.awayCode}` },
        ]}
      />
      <main className="flex-1 px-5 py-6">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <Pill variant="neutral">{phaseBadge(match.phase as Phase, locale)}</Pill>
            <Pill variant={match.status === "encerrada" ? "lime" : "neutral"}>
              {match.status === "encerrada"
                ? tr(locale, "encerrada", "finalizado")
                : tr(locale, "agendada", "programado")}
            </Pill>
          </div>
          <p className="t-caption mt-2 text-center text-muted">
            {home.name} x {away.name}
          </p>
        </Card>

        <div className="mt-4">
          <Card>
            <p className="t-kicker mb-3 text-center text-indigo">
              {tr(locale, "Placar final", "Marcador final")}
            </p>
            <AdminForm
              matchId={match.id}
              home={home}
              away={away}
              defaultHome={match.homeScore ?? undefined}
              defaultAway={match.awayScore ?? undefined}
            />
            <p className="t-caption mt-3 text-center text-muted">
              {tr(
                locale,
                "Ao salvar, os pontos de todos os palpites desta partida são calculados e quem avançou segue no chaveamento. Em empate decidido nos pênaltis, escolha quem avançou no seletor acima.",
                "Al guardar, los puntos de todos los pronósticos de este partido se calculan y quien avanzó sigue en el cuadro. En empate decidido por penales, elegí quién avanzó en el selector de arriba.",
              )}
            </p>
          </Card>
        </div>

        <div className="mt-4">
          <Card>
            <p className="t-kicker mb-3 text-center text-indigo">
              {tr(locale, "Editar partida", "Editar partido")}
            </p>
            <EditMatchForm
              matchId={match.id}
              kickoffLocal={toBrasiliaInput(new Date(match.kickoffAt))}
              stadium={match.stadium}
              homeCode={match.homeCode}
              awayCode={match.awayCode}
              homeName={home.name}
              awayName={away.name}
              teams={teamOptions}
            />
            <p className="t-caption mt-3 text-center text-muted">
              {tr(
                locale,
                "Ajuste data/hora (o prazo de palpite acompanha), estádio e as seleções — útil para resolver confrontos decididos nos pênaltis.",
                "Ajustá fecha/hora (el plazo de pronóstico se actualiza), estadio y las selecciones — útil para resolver cruces decididos por penales.",
              )}
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
