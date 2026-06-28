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
 * Match-card (DESIGN_SPEC 6). Superficie paper, borda completa. O placar fica SEMPRE
 * entre as bandeiras e o "x": palpite do usuario (rosa) antes do jogo; placar real
 * (indigo) quando encerrado; travessao quando ainda nao palpitou. Selo de fase e x2
 * Brasil no topo; estado e pontos abaixo. Linka para a partida.
 */
function Num({ value, tone }: { value: number | null; tone: "guess" | "result" | "empty" }) {
  const cls =
    tone === "guess"
      ? "text-rose"
      : tone === "result"
        ? "text-indigo"
        : "text-muted";
  return (
    <span className={`min-w-6 text-center text-2xl font-extrabold ${cls}`}>
      {value ?? "–"}
    </span>
  );
}

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

  // Numeros entre as bandeiras: placar real (encerrado) ou palpite (antes do jogo).
  const tone: "guess" | "result" | "empty" = closed
    ? "result"
    : prediction
      ? "guess"
      : "empty";
  const left = closed ? match.homeScore : (prediction?.homeGuess ?? null);
  const right = closed ? match.awayScore : (prediction?.awayGuess ?? null);

  return (
    <Link
      href={`/partidas/${match.id}`}
      className="block rounded-2xl border border-black/10 bg-paper p-4 transition-colors hover:border-rose/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Pill variant="neutral">{phaseBadge(match.phase as Phase)}</Pill>
        {isBrazil ? <Pill variant="rose">x2 Brasil</Pill> : null}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2.5">
        <Flag code={home.flagCode} name={home.name} size={26} />
        <span className="t-card-title text-indigo">{match.homeCode}</span>
        <Num value={left} tone={tone} />
        <span className="t-caption text-muted">x</span>
        <Num value={right} tone={tone} />
        <span className="t-card-title text-indigo">{match.awayCode}</span>
        <Flag code={away.flagCode} name={away.name} size={26} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {closed ? (
          <>
            <span className="t-caption text-muted">
              {prediction
                ? `Você palpitou ${prediction.homeGuess} x ${prediction.awayGuess}`
                : "Sem palpite"}
            </span>
            {prediction ? (
              <Pill variant="lime">+{prediction.points} pts</Pill>
            ) : (
              <Pill variant="neutral">Encerrada</Pill>
            )}
          </>
        ) : (
          <>
            <span className="t-caption text-muted">
              {prediction
                ? "Seu palpite salvo"
                : open
                  ? "Toque para palpitar"
                  : "Prazo encerrado"}
            </span>
            <Pill variant="neutral">
              {open
                ? formatBrasilia(new Date(match.kickoffAt))
                : "Prazo encerrado"}
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
