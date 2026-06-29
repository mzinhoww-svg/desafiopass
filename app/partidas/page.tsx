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
import { PHASE_ORDER, PHASE_LABEL } from "@/lib/phases";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { teamOf, getTeamMap, resolveTeam } from "@/lib/teams";
import { formatBrasilia } from "@/lib/utils/dates";
import {
  getSpecialPredictions,
  getSpecialResults,
  getSpecialDeadline,
} from "@/lib/queries/special";
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

  const tabCls = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
      active ? "bg-indigo text-white" : "bg-cloud text-indigo"
    }`;

  return (
    <>
      <Header title="Palpites" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs
        items={[{ label: "Início", href: "/" }, { label: "Palpites" }]}
      />
      <main className="flex-1 px-5 py-4">
        <div className="mb-4 flex gap-2">
          <Link href="/partidas?aba=jogos" className={tabCls(!especiais)}>
            <Goal size={16} strokeWidth={2.5} aria-hidden="true" />
            Jogos
          </Link>
          <Link href="/partidas?aba=especiais" className={tabCls(especiais)}>
            <Medal size={16} strokeWidth={2.5} aria-hidden="true" />
            Artilharia e outros
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
  const [all, predMap, teamMap] = await Promise.all([
    getAllMatches(),
    getUserPredictionMap(userId),
    getTeamMap(),
  ]);
  const groups = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABEL[phase],
    list: all.filter((m) => m.phase === phase),
  })).filter((g) => g.list.length > 0);

  if (all.length === 0) {
    return (
      <EmptyState icon={CalendarClock} title="Sem jogos ainda">
        Os jogos do mata-mata aparecem aqui assim que o banco for semeado.
      </EmptyState>
    );
  }

  return (
    <>
      {groups.map((g) => (
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
  if (!userId) {
    return (
      <Card>
        <p className="t-body text-muted">
          Entre para palpitar campeão e artilheiro.
        </p>
        <LinkButton href="/login" className="mt-3">
          Entrar
        </LinkButton>
      </Card>
    );
  }

  const [picks, results, deadline] = await Promise.all([
    getSpecialPredictions(userId),
    getSpecialResults(),
    getSpecialDeadline(),
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
          Acerte quem leva a taça e quem termina como artilheiro. Vale pontos
          extras no ranking: <strong>campeão 300</strong> e{" "}
          <strong>artilheiro 200</strong>.
        </p>
        {deadline ? (
          <p className="t-caption mt-2 text-muted">
            {open
              ? `Você pode ajustar até a final, ${formatBrasilia(deadline)} (Brasília).`
              : "O prazo já encerrou. Seus palpites estão travados."}
          </p>
        ) : null}
      </Card>

      {open ? (
        <Card>
          <SpecialForm
            teams={realTeams}
            champion={picks.campeao}
            topScorer={picks.artilheiro}
          />
        </Card>
      ) : (
        <Card>
          <p className="t-kicker mb-2 text-indigo">Seus palpites</p>
          <SpecialRow
            label="Campeão"
            value={picks.campeao ? teamOf(picks.campeao).name : "—"}
            points={hasResults ? picks.campeaoPoints : null}
          />
          <SpecialRow
            label="Artilheiro"
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
