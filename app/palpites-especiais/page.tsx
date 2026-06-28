import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { getCurrentUser } from "@/lib/auth-helpers";
import { teams as seedTeams } from "@/lib/data/copa2026";
import {
  getSpecialPredictions,
  getSpecialResults,
  getSpecialDeadline,
} from "@/lib/queries/special";
import { teamOf } from "@/lib/teams";
import { formatBrasilia } from "@/lib/utils/dates";
import { SpecialForm } from "./special-form";

// /palpites-especiais (#2): campeão e artilheiro. Trava no primeiro apito.
export default async function PalpitesEspeciaisPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [picks, results, deadline] = await Promise.all([
    getSpecialPredictions(user.id),
    getSpecialResults(),
    getSpecialDeadline(),
  ]);

  const open = !deadline || Date.now() < deadline.getTime();
  const realTeams = seedTeams
    .filter((t) => t.flagCode)
    .map((t) => ({ code: t.code, name: t.name }));
  const hasResults = Boolean(results.champion || results.topScorer);

  return (
    <>
      <Header title="Palpites especiais" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Palpites especiais" },
        ]}
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Card>
          <p className="t-body text-ink">
            Acerte quem leva a taça e quem termina como artilheiro. Vale pontos
            extras no ranking: <strong>campeão 300</strong> e{" "}
            <strong>artilheiro 200</strong>.
          </p>
          {deadline ? (
            <p className="t-caption mt-2 text-muted">
              {open
                ? `Prazo: até o primeiro jogo, ${formatBrasilia(deadline)} (Brasília).`
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
            <Row
              label="Campeão"
              value={picks.campeao ? teamOf(picks.campeao).name : "—"}
              points={hasResults ? picks.campeaoPoints : null}
            />
            <Row
              label="Artilheiro"
              value={picks.artilheiro ?? "—"}
              points={hasResults ? picks.artilheiroPoints : null}
            />
            {hasResults ? (
              <p className="t-caption mt-3 text-muted">
                Resultado oficial:{" "}
                {results.champion ? teamOf(results.champion).name : "—"} (campeão)
                · {results.topScorer ?? "—"} (artilheiro).
              </p>
            ) : (
              <p className="t-caption mt-3 text-muted">
                Os pontos aparecem quando o resultado oficial for lançado.
              </p>
            )}
          </Card>
        )}
      </main>
    </>
  );
}

function Row({
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
