import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { LinkButton } from "@/components/ui/link-button";
import { ScoreInput } from "@/components/score-input";
import { PredictForm } from "./predict-form";
import { getMatchById, getUserPrediction } from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";
import { teamOf } from "@/lib/teams";
import { phaseBadge } from "@/lib/phases";
import { CRITERION_LABEL } from "@/lib/scoring-labels";
import { formatBrasilia, isPredictionOpen } from "@/lib/utils/dates";
import type { Criterion, Phase } from "@/lib/scoring";

export default async function PartidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const user = await getCurrentUser();
  const prediction = user ? await getUserPrediction(user.id, id) : null;
  const home = teamOf(match.homeCode);
  const away = teamOf(match.awayCode);
  const isBrazil = match.homeCode === "BRA" || match.awayCode === "BRA";
  const closed = match.status === "encerrada";
  const open =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));

  return (
    <>
      <Header title="Palpite" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Jogos", href: "/partidas" },
          { label: `${match.homeCode} x ${match.awayCode}` },
        ]}
      />
      <main className="flex-1 px-5 py-6">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <Pill variant="neutral">{phaseBadge(match.phase as Phase)}</Pill>
            {isBrazil ? <Pill variant="rose">x2 Brasil</Pill> : null}
          </div>
          <p className="t-caption mt-2 text-center text-muted">
            {home.name} x {away.name} · {formatBrasilia(new Date(match.kickoffAt))}{" "}
            (Brasília)
          </p>
        </Card>

        <div className="mt-4">
          <Card>
            {closed ? (
              <div className="flex flex-col gap-4">
                <p className="t-kicker text-center text-indigo">Você palpitou</p>
                <ScoreInput
                  home={home}
                  away={away}
                  defaultHome={prediction?.homeGuess ?? 0}
                  defaultAway={prediction?.awayGuess ?? 0}
                  disabled
                />
                {!prediction ? (
                  <p className="t-caption text-center text-muted">
                    Você não palpitou nesta partida.
                  </p>
                ) : null}
                <p className="t-kicker text-center text-indigo">O placar foi</p>
                <div className="t-score flex items-center justify-center gap-3 text-indigo">
                  <span>{match.homeScore}</span>
                  <span className="text-muted">x</span>
                  <span>{match.awayScore}</span>
                </div>
                {prediction ? (
                  <div className="flex items-center justify-center gap-2">
                    <Pill variant="lime">+{prediction.points} pts</Pill>
                    <span className="t-caption text-muted">
                      {CRITERION_LABEL[(prediction.criterion as Criterion) ?? "errado"]}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : open ? (
              user ? (
                <>
                  <p className="t-kicker mb-3 text-center text-indigo">
                    Seu palpite
                  </p>
                  <PredictForm
                    matchId={match.id}
                    home={home}
                    away={away}
                    defaultHome={prediction?.homeGuess}
                    defaultAway={prediction?.awayGuess}
                  />
                  <p className="t-caption mt-3 text-center text-muted">
                    Prazo: trava no apito inicial,{" "}
                    {formatBrasilia(new Date(match.kickoffAt))}. Vale o último.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="t-body text-muted">
                    Entre para registrar seu palpite.
                  </p>
                  <LinkButton href="/login">Entrar</LinkButton>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-muted">
                  <Lock size={18} aria-hidden="true" />
                  <span className="t-body font-bold">Prazo encerrado</span>
                </div>
                <ScoreInput
                  home={home}
                  away={away}
                  defaultHome={prediction?.homeGuess ?? 0}
                  defaultAway={prediction?.awayGuess ?? 0}
                  disabled
                />
                <p className="t-caption text-center text-muted">
                  {prediction
                    ? "Seu palpite está travado."
                    : "Você não palpitou a tempo."}
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
