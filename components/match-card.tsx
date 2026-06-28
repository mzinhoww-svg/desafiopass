import Link from "next/link";
import { Flag } from "@/components/flag";
import { Pill } from "@/components/ui/pill";
import { teamOf } from "@/lib/teams";
import { phaseBadge } from "@/lib/phases";
import { CRITERION_LABEL } from "@/lib/scoring-labels";
import { formatBrasilia, isPredictionOpen } from "@/lib/utils/dates";
import type { Criterion, Phase } from "@/lib/scoring";
import type { MatchRow, PredictionRow } from "@/lib/queries/matches";

/*
 * Match-card (DESIGN_SPEC 6, wireframe tela 3). Superficie paper, borda completa
 * (nunca side-stripe). Selo de fase com multiplicador, selo rosa x2 Brasil, e o
 * estado: sem palpite / palpitado / encerrado com pontos. Linka para a partida.
 */
export function MatchCard({
  match,
  prediction,
}: {
  match: MatchRow;
  prediction: PredictionRow | null;
}) {
  const home = teamOf(match.homeCode);
  const away = teamOf(match.awayCode);
  const isBrazil = match.homeCode === "BRA" || match.awayCode === "BRA";
  const closed = match.status === "encerrada";
  const open =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));

  return (
    <Link
      href={`/partidas/${match.id}`}
      className="block rounded-2xl border border-black/10 bg-paper p-4 transition-colors hover:border-rose/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Pill variant="neutral">{phaseBadge(match.phase as Phase)}</Pill>
        {isBrazil ? <Pill variant="rose">x2 Brasil</Pill> : null}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <Flag code={home.flagCode} name={home.name} size={26} />
        <span className="t-card-title text-indigo">{match.homeCode}</span>
        <span className="t-caption text-muted">x</span>
        <span className="t-card-title text-indigo">{match.awayCode}</span>
        <Flag code={away.flagCode} name={away.name} size={26} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {closed ? (
          <>
            <span className="t-caption text-muted">
              {prediction
                ? `Você palpitou ${prediction.homeGuess} x ${prediction.awayGuess}`
                : "Sem palpite"}{" "}
              · Placar {match.homeScore} x {match.awayScore}
            </span>
            {prediction ? (
              <Pill variant="lime">+{prediction.points} pts</Pill>
            ) : (
              <Pill variant="neutral">Encerrada</Pill>
            )}
          </>
        ) : prediction ? (
          <>
            <span className="t-caption text-muted">
              Você palpitou {prediction.homeGuess} x {prediction.awayGuess}
            </span>
            <Pill variant="neutral">
              {open ? formatBrasilia(new Date(match.kickoffAt)) : "Prazo encerrado"}
            </Pill>
          </>
        ) : (
          <>
            <span className="t-caption text-muted">
              {open ? "Toque para palpitar" : "Prazo encerrado"}
            </span>
            <Pill variant="neutral">
              {formatBrasilia(new Date(match.kickoffAt))}
            </Pill>
          </>
        )}
      </div>

      {closed && prediction ? (
        <p className="t-caption mt-2 text-muted">
          {CRITERION_LABEL[(prediction.criterion as Criterion) ?? "errado"]}
        </p>
      ) : null}
    </Link>
  );
}
