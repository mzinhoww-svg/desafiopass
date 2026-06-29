import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { LinkButton } from "@/components/ui/link-button";
import { ScoreInput } from "@/components/score-input";
import { MatchTabs } from "@/components/match-tabs";
import { CommunityStats } from "@/components/community-stats";
import { PredictForm } from "./predict-form";
import {
  getMatchById,
  getUserPrediction,
  getMatchPredictionsWithUsers,
} from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getTeamMap, resolveTeam } from "@/lib/teams";
import { phaseBadge } from "@/lib/phases";
import { criterionLabel } from "@/lib/scoring-labels";
import { formatBrasilia, isPredictionOpen } from "@/lib/utils/dates";
import { getLocale, tr } from "@/lib/i18n";
import { finalPoints, type Criterion, type Phase } from "@/lib/scoring";

export default async function PartidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();

  const locale = await getLocale();
  const user = await getCurrentUser();
  const prediction = user ? await getUserPrediction(user.id, id) : null;
  const teamMap = await getTeamMap();
  const home = resolveTeam(teamMap, match.homeCode);
  const away = resolveTeam(teamMap, match.awayCode);
  const isBrazil = match.homeCode === "BRA" || match.awayCode === "BRA";
  const closed = match.status === "encerrada";
  const open =
    match.status === "agendada" && isPredictionOpen(new Date(match.kickoffAt));

  // Detalhe da pontuacao (#6): recalcula o breakdown auditavel a partir do
  // resultado e do palpite (motor puro). So quando ha placar e palpite.
  const breakdown =
    closed && prediction && match.homeScore != null && match.awayScore != null
      ? finalPoints({
          guess: { homeGuess: prediction.homeGuess, awayGuess: prediction.awayGuess },
          result: { homeScore: match.homeScore, awayScore: match.awayScore },
          phase: match.phase as Phase,
          isBrazilMatch: isBrazil,
        })
      : null;

  // Palpites da comunidade: revelados assim que o usuario palpitou (ou jogo
  // encerrado). Inclui o proprio usuario (marcado "voce"), ordenado primeiro.
  const reveal = Boolean(prediction) || closed;
  const communityAll = reveal ? await getMatchPredictionsWithUsers(id) : [];
  const community = [...communityAll].sort((a, b) =>
    a.userId === user?.id ? -1 : b.userId === user?.id ? 1 : 0,
  );

  const palpiteBlock = (
    <Card>
      {closed ? (
        <div className="flex flex-col gap-4">
          <p className="t-kicker text-center text-indigo">
            {tr(locale, "Você palpitou", "Tú pronosticaste")}
          </p>
          <ScoreInput
            home={home}
            away={away}
            defaultHome={prediction?.homeGuess ?? 0}
            defaultAway={prediction?.awayGuess ?? 0}
            disabled
          />
          {!prediction ? (
            <p className="t-caption text-center text-muted">
              {tr(
                locale,
                "Você não palpitou nesta partida.",
                "No pronosticaste este partido.",
              )}
            </p>
          ) : null}
          <p className="t-kicker text-center text-indigo">
            {tr(locale, "O placar foi", "El marcador fue")}
          </p>
          <div className="t-score flex items-center justify-center gap-3 text-indigo">
            <span>{match.homeScore}</span>
            <span className="text-muted">x</span>
            <span>{match.awayScore}</span>
          </div>
          {prediction ? (
            <div className="flex items-center justify-center gap-2">
              <Pill variant="lime">+{prediction.points} pts</Pill>
              <span className="t-caption text-muted">
                {criterionLabel(
                  (prediction.criterion as Criterion) ?? "errado",
                  locale,
                )}
              </span>
            </div>
          ) : null}
          {breakdown ? (
            <div className="rounded-xl bg-cloud px-3 py-2 text-center">
              <p className="t-caption text-muted">
                {tr(locale, "Como você pontuou", "Cómo sumaste")}
              </p>
              <p className="t-body mt-1 font-bold text-indigo">
                {breakdown.base} {tr(locale, "base", "base")}
                {breakdown.brazilMultiplier > 1
                  ? ` · ×${breakdown.brazilMultiplier} ${tr(locale, "Brasil", "Brasil")}`
                  : ""}
                {breakdown.phaseMultiplier !== 1
                  ? ` · ×${breakdown.phaseMultiplier.toLocaleString(locale === "es" ? "es-CL" : "pt-BR")} ${tr(locale, "fase", "fase")}`
                  : ""}{" "}
                = {breakdown.final}
              </p>
            </div>
          ) : null}
        </div>
      ) : open ? (
        user ? (
          <>
            <p className="t-kicker mb-3 text-center text-indigo">
              {tr(locale, "Seu palpite", "Tu pronóstico")}
            </p>
            <PredictForm
              matchId={match.id}
              home={home}
              away={away}
              defaultHome={prediction?.homeGuess}
              defaultAway={prediction?.awayGuess}
            />
            <p className="t-caption mt-3 text-center text-muted">
              {tr(
                locale,
                `Prazo: trava no apito inicial, ${formatBrasilia(new Date(match.kickoffAt))}. Vale o último.`,
                `Plazo: se bloquea al pitazo inicial, ${formatBrasilia(new Date(match.kickoffAt))}. Vale el último.`,
              )}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="t-body text-muted">
              {tr(
                locale,
                "Entre para registrar seu palpite.",
                "Entra para registrar tu pronóstico.",
              )}
            </p>
            <LinkButton href="/login">{tr(locale, "Entrar", "Entrar")}</LinkButton>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 text-muted">
            <Lock size={18} aria-hidden="true" />
            <span className="t-body font-bold">
              {tr(locale, "Prazo encerrado", "Plazo cerrado")}
            </span>
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
              ? tr(
                  locale,
                  "Seu palpite está travado.",
                  "Tu pronóstico quedó bloqueado.",
                )
              : tr(
                  locale,
                  "Você não palpitou a tempo.",
                  "No pronosticaste a tiempo.",
                )}
          </p>
        </div>
      )}
    </Card>
  );

  const comunidadeBlock = (
    <>
      {reveal && community.length > 0 ? (
        <CommunityStats
          predictions={community}
          homeCode={match.homeCode}
          awayCode={match.awayCode}
        />
      ) : null}
      <Card>
      {!reveal ? (
        <p className="t-body text-center text-muted">
          {tr(
            locale,
            "Faça seu palpite para ver os palpites da comunidade.",
            "Haz tu pronóstico para ver los pronósticos de la comunidad.",
          )}
        </p>
      ) : community.length === 0 ? (
        <p className="t-body text-center text-muted">
          {tr(
            locale,
            "Ninguém palpitou nesta partida ainda.",
            "Nadie ha pronosticado este partido todavía.",
          )}
        </p>
      ) : (
        <div className="flex flex-col">
          {community.map((c) => {
            const isMe = c.userId === user?.id;
            return (
              <div
                key={c.userId}
                className={`flex items-center justify-between px-2 py-2 ${
                  isMe ? "rounded-xl bg-lime/20" : "border-b border-black/5 last:border-0"
                }`}
              >
                <span className="t-body text-ink">
                  {c.nickname}
                  {isMe ? tr(locale, " (você)", " (tú)") : ""}
                </span>
                <span className="flex items-center gap-2">
                  <span className="t-body font-extrabold text-indigo">
                    {c.homeGuess} x {c.awayGuess}
                  </span>
                  {closed ? <Pill variant="lime">+{c.points}</Pill> : null}
                </span>
              </div>
            );
          })}
        </div>
      )}
      </Card>
    </>
  );

  return (
    <>
      <Header
        title={tr(locale, "Palpite", "Pronóstico")}
        subtitle={tr(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminación directa")}
      />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: tr(locale, "Palpites", "Pronósticos"), href: "/partidas" },
          { label: `${match.homeCode} x ${match.awayCode}` },
        ]}
      />
      <main className="flex-1 px-5 py-6">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <Pill variant="neutral">{phaseBadge(match.phase as Phase, locale)}</Pill>
            {isBrazil ? <Pill variant="rose">{tr(locale, "x2 Brasil", "x2 Brasil")}</Pill> : null}
          </div>
          <p className="t-caption mt-2 text-center text-muted">
            {home.name} x {away.name} · {formatBrasilia(new Date(match.kickoffAt))}{" "}
            (Brasília)
          </p>
        </Card>

        <div className="mt-4">
          <MatchTabs palpite={palpiteBlock} comunidade={comunidadeBlock} />
        </div>
      </main>
    </>
  );
}
