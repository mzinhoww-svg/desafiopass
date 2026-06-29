import Link from "next/link";
import { Flag } from "@/components/flag";
import { Countdown } from "@/components/countdown";
import { Pill } from "@/components/ui/pill";
import type { Team } from "@/lib/data/copa2026";
import { phaseBadge } from "@/lib/phases";
import { criterionLabel } from "@/lib/scoring-labels";
import { formatBrasilia, isPredictionOpen, isLive } from "@/lib/utils/dates";
import type { Criterion, Phase } from "@/lib/scoring";
import type { MatchRow, PredictionRow } from "@/lib/queries/matches";
import { getLocale, tr } from "@/lib/i18n";

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

export async function MatchCard({
  match,
  prediction,
  home,
  away,
}: {
  match: MatchRow;
  prediction: PredictionRow | null;
  home: Team;
  away: Team;
}) {
  const locale = await getLocale();
  const isBrazil = match.homeCode === "BRA" || match.awayCode === "BRA";
  const closed = match.status === "encerrada";
  const open =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));
  // Em andamento: apito passou, ainda nao encerrado (#5).
  const live = isLive(new Date(match.kickoffAt), match.status);
  // Pendente: aberto e ainda sem palpite -> destaque para o usuario nao esquecer.
  const pending = open && !prediction;

  // Placar ao vivo: jogo em andamento com placar parcial vindo da sincronizacao (#6).
  const showLiveScore =
    live && match.homeScore != null && match.awayScore != null;
  // Numeros entre as bandeiras: placar real (encerrado/ao vivo) ou palpite (antes).
  const tone: "guess" | "result" | "empty" =
    closed || showLiveScore ? "result" : prediction ? "guess" : "empty";
  const left =
    closed || showLiveScore ? match.homeScore : (prediction?.homeGuess ?? null);
  const right =
    closed || showLiveScore ? match.awayScore : (prediction?.awayGuess ?? null);

  return (
    <Link
      href={`/partidas/${match.id}`}
      className={`block rounded-2xl border bg-paper p-4 transition-colors hover:border-rose/40 ${
        pending ? "border-rose/50 ring-1 ring-rose/30" : "border-black/10"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <Pill variant="neutral">{phaseBadge(match.phase as Phase, locale)}</Pill>
        {live ? (
          <span className="flex items-center gap-1.5 rounded-full bg-rose px-2.5 py-1 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {tr(locale, "Ao vivo", "En vivo")}
          </span>
        ) : isBrazil ? (
          <Pill variant="rose">x2 Brasil</Pill>
        ) : null}
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
                ? tr(
                    locale,
                    `Você palpitou ${prediction.homeGuess} x ${prediction.awayGuess}`,
                    `Pronosticaste ${prediction.homeGuess} x ${prediction.awayGuess}`,
                  )
                : tr(locale, "Sem palpite", "Sin pronóstico")}
            </span>
            {prediction ? (
              <Pill variant="lime">+{prediction.points} pts</Pill>
            ) : (
              <Pill variant="neutral">{tr(locale, "Encerrada", "Finalizado")}</Pill>
            )}
          </>
        ) : (
          <>
            <span className={`t-caption ${pending ? "font-bold text-rose" : "text-muted"}`}>
              {prediction
                ? tr(locale, "Seu palpite salvo", "Tu pronóstico guardado")
                : open
                  ? tr(locale, "Palpite pendente", "Pronóstico pendiente")
                  : live
                    ? tr(locale, "Em andamento", "En curso")
                    : tr(locale, "Prazo encerrado", "Plazo cerrado")}
            </span>
            <Pill variant="neutral">
              {open ? (
                <Countdown
                  kickoffAt={new Date(match.kickoffAt).toISOString()}
                  fallback={formatBrasilia(new Date(match.kickoffAt))}
                />
              ) : live ? (
                tr(locale, "Aguardando resultado", "Esperando resultado")
              ) : (
                tr(locale, "Prazo encerrado", "Plazo cerrado")
              )}
            </Pill>
          </>
        )}
      </div>

      {closed && prediction ? (
        <p className="t-caption mt-2 text-muted">
          {criterionLabel((prediction.criterion as Criterion) ?? "errado", locale)}
        </p>
      ) : null}
    </Link>
  );
}
