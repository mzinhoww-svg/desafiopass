import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { getMatchById } from "@/lib/queries/matches";
import { teamOf } from "@/lib/teams";
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

export default async function AdminMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/login");
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const home = teamOf(match.homeCode);
  const away = teamOf(match.awayCode);
  const realTeams = seedTeams
    .filter((t) => t.flagCode)
    .map((t) => ({ code: t.code, name: t.name }));

  return (
    <>
      <Header title="Admin · Resultado" subtitle="Inserir placar" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: `${match.homeCode} x ${match.awayCode}` },
        ]}
      />
      <main className="flex-1 px-5 py-6">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <Pill variant="neutral">{phaseBadge(match.phase as Phase)}</Pill>
            <Pill variant={match.status === "encerrada" ? "lime" : "neutral"}>
              {match.status}
            </Pill>
          </div>
          <p className="t-caption mt-2 text-center text-muted">
            {home.name} x {away.name}
          </p>
        </Card>

        <div className="mt-4">
          <Card>
            <p className="t-kicker mb-3 text-center text-indigo">Placar final</p>
            <AdminForm
              matchId={match.id}
              home={home}
              away={away}
              defaultHome={match.homeScore ?? undefined}
              defaultAway={match.awayScore ?? undefined}
            />
            <p className="t-caption mt-3 text-center text-muted">
              Ao salvar, os pontos de todos os palpites desta partida são
              calculados e quem avançou segue no chaveamento. Em empate decidido
              nos pênaltis, escolha quem avançou no seletor acima.
            </p>
          </Card>
        </div>

        <div className="mt-4">
          <Card>
            <p className="t-kicker mb-3 text-center text-indigo">
              Editar partida
            </p>
            <EditMatchForm
              matchId={match.id}
              kickoffLocal={toBrasiliaInput(new Date(match.kickoffAt))}
              stadium={match.stadium}
              homeCode={match.homeCode}
              awayCode={match.awayCode}
              homeName={home.name}
              awayName={away.name}
              teams={realTeams}
            />
            <p className="t-caption mt-3 text-center text-muted">
              Ajuste data/hora (o prazo de palpite acompanha), estádio e as
              seleções — útil para resolver confrontos decididos nos pênaltis.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
