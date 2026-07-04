import Link from "next/link";
import { CalendarClock, Goal, Medal } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MatchCard } from "@/components/match-card";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { LinkButton } from "@/components/ui/link-button";
import { getAllMatches, getUserPredictionMap } from "@/lib/queries/matches";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PHASE_ORDER, phaseLabel } from "@/lib/phases";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { teamOf, getTeamMap, resolveTeam } from "@/lib/teams";
import { getLocale, tr } from "@/lib/i18n";
import { formatBrasilia } from "@/lib/utils/dates";
import {
  getSpecialPredictions,
  getSpecialResults,
  getSpecialDeadline,
} from "@/lib/queries/special";
import { fetchScorers } from "@/lib/integrations/football-data";
import { SpecialForm } from "@/app/palpites-especiais/special-form";

// /palpites (rota /partidas): duas abas via ?aba — "jogos" (placares do mata-mata)
// e "especiais" (campeão e artilheiro). Toggle no estilo do ranking.
export default async function PartidasPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const especiais = aba === "especiais";
  const user = await getCurrentUser();
  const locale = await getLocale();

  const tabCls = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-indigo text-white" : "bg-cloud text-indigo"
    }`;

  return (
    <>
      <Header
        title={tr(locale, "Palpites", "Pronósticos")}
        subtitle={tr(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminación directa")}
      />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: tr(locale, "Palpites", "Pronósticos") },
        ]}
      />
      <main className="flex-1 px-5 py-4">
        <div className="mb-4 flex gap-2">
          <Link href="/partidas?aba=jogos" className={tabCls(!especiais)}>
            <Goal size={16} strokeWidth={2.5} aria-hidden="true" />
            {tr(locale, "Jogos", "Partidos")}
          </Link>
          <Link href="/partidas?aba=especiais" className={tabCls(especiais)}>
            <Medal size={16} strokeWidth={2.5} aria-hidden="true" />
            {tr(locale, "Artilharia e outros", "Goleadores y más")}
          </Link>
        </div>

        {especiais ? (
          <EspeciaisTab userId={user?.id ?? null} />
        ) : (
          <JogosTab userId={user?.id ?? null} />
        )}
      </main>
    </>
  );
}

async function JogosTab({ userId }: { userId: string | null }) {
  const locale = await getLocale();
  const [all, predMap, teamMap] = await Promise.all([
    getAllMatches(),
    getUserPredictionMap(userId),
    getTeamMap(),
  ]);
  const groups = PHASE_ORDER.map((phase) => ({
    phase,
    label: phaseLabel(phase, locale),
    list: all.filter((m) => m.phase === phase),
  })).filter((g) => g.list.length > 0);

  // Ordem de exibição: a fase ATUAL primeiro, depois as PASSADAS (mais recente
  // antes) e por fim as FUTURAS (ainda com placeholders "Vencedor de..."). Assim
  // sempre aparece primeiro o que dá para palpitar agora.
  const isPlaceholder = (code: string) =>
    code.startsWith("W_") || code.startsWith("L_");
  const bucketOf = (list: (typeof groups)[number]["list"]) => {
    const allClosed = list.every((m) => m.status === "encerrada");
    const hasOpenReal = list.some(
      (m) =>
        m.status !== "encerrada" &&
        !isPlaceholder(m.homeCode) &&
        !isPlaceholder(m.awayCode),
    );
    return allClosed ? 1 : hasOpenReal ? 0 : 2; // 0 atual, 1 passada, 2 futura
  };
  const ordered = [...groups].sort((a, b) => {
    const ra = bucketOf(a.list);
    const rb = bucketOf(b.list);
    if (ra !== rb) return ra - rb;
    const ia = PHASE_ORDER.indexOf(a.phase);
    const ib = PHASE_ORDER.indexOf(b.phase);
    return ra === 1 ? ib - ia : ia - ib; // passadas: decrescente; resto: crescente
  });

  if (all.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={tr(locale, "Sem jogos ainda", "Aún no hay partidos")}
      >
        {tr(
          locale,
          "Os jogos do mata-mata aparecem aqui assim que o banco for semeado.",
          "Los partidos de la eliminación directa aparecen aquí apenas se cargue la base.",
        )}
      </EmptyState>
    );
  }

  return (
    <>
      {ordered.map((g) => (
        <section key={g.phase} className="mb-6">
          <p className="t-kicker mb-2 text-indigo">{g.label}</p>
          <div className="flex flex-col gap-3">
            {g.list.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={predMap.get(m.id) ?? null}
                home={resolveTeam(teamMap, m.homeCode)}
                away={resolveTeam(teamMap, m.awayCode)}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

async function EspeciaisTab({ userId }: { userId: string | null }) {
  const locale = await getLocale();
  if (!userId) {
    return (
      <Card>
        <p className="t-body text-muted">
          {tr(
            locale,
            "Entre para palpitar campeão e artilheiro.",
            "Entra para pronosticar campeón y goleador.",
          )}
        </p>
        <LinkButton href="/login" className="mt-3">
          {tr(locale, "Entrar", "Entrar")}
        </LinkButton>
      </Card>
    );
  }

  const [picks, results, deadline, scorers] = await Promise.all([
    getSpecialPredictions(userId),
    getSpecialResults(),
    getSpecialDeadline(),
    fetchScorers(),
  ]);
  const open = !deadline || Date.now() < deadline.getTime();
  const realTeams = seedTeams
    .filter((t) => t.flagCode)
    .map((t) => ({ code: t.code, name: t.name }));
  const hasResults = Boolean(results.champion || results.topScorer);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="t-body text-ink">
          {tr(
            locale,
            "Acerte quem leva a taça e quem termina como artilheiro. Vale pontos extras no ranking: ",
            "Acierta quién levanta la copa y quién termina como goleador. Da puntos extra en el ranking: ",
          )}
          <strong>{tr(locale, "campeão 300", "campeón 300")}</strong>
          {tr(locale, " e ", " y ")}
          <strong>{tr(locale, "artilheiro 200", "goleador 200")}</strong>.
        </p>
        {deadline ? (
          <p className="t-caption mt-2 text-muted">
            {open
              ? tr(
                  locale,
                  `Você pode ajustar até a final, ${formatBrasilia(deadline)} (Brasília).`,
                  `Puedes ajustar hasta la final, ${formatBrasilia(deadline)} (Brasilia).`,
                )
              : tr(
                  locale,
                  "O prazo já encerrou. Seus palpites estão travados.",
                  "El plazo ya cerró. Tus pronósticos quedaron bloqueados.",
                )}
          </p>
        ) : null}
      </Card>

      {open ? (
        <Card>
          <SpecialForm
            key={`${picks.campeao ?? ""}-${picks.artilheiro ?? ""}`}
            teams={realTeams}
            champion={picks.campeao}
            topScorer={picks.artilheiro}
            scorers={scorers.map((s) => ({ name: s.name, goals: s.goals }))}
          />
        </Card>
      ) : (
        <Card>
          <p className="t-kicker mb-2 text-indigo">
            {tr(locale, "Seus palpites", "Tus pronósticos")}
          </p>
          <SpecialRow
            label={tr(locale, "Campeão", "Campeón")}
            value={picks.campeao ? teamOf(picks.campeao).name : "—"}
            points={hasResults ? picks.campeaoPoints : null}
          />
          <SpecialRow
            label={tr(locale, "Artilheiro", "Goleador")}
            value={picks.artilheiro ?? "—"}
            points={hasResults ? picks.artilheiroPoints : null}
          />
        </Card>
      )}
    </div>
  );
}

function SpecialRow({
  label,
  value,
  points,
}: {
  label: string;
  value: string;
  points: number | null;
}) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2 last:border-0">
      <span className="t-caption text-muted">{label}</span>
      <span className="flex items-center gap-2">
        <span className="t-body font-bold text-indigo">{value}</span>
        {points != null ? <Pill variant="lime">+{points}</Pill> : null}
      </span>
    </div>
  );
}
