"use client";

import { useActionState } from "react";
import { savePrediction, type PredictionState } from "@/app/actions/palpite";
import { ScoreInput } from "@/components/score-input";
import { Button } from "@/components/ui/button";

type TeamLite = { code: string; name: string; flagCode: string };
const initial: PredictionState = {};

export function PredictForm({
  matchId,
  home,
  away,
  defaultHome,
  defaultAway,
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  defaultHome?: number;
  defaultAway?: number;
}) {
  const [state, formAction, pending] = useActionState(savePrediction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      <ScoreInput
        home={home}
        away={away}
        defaultHome={defaultHome}
        defaultAway={defaultAway}
      />
      {state?.error ? (
        <p className="t-body text-center font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="t-body text-center font-bold text-ink" role="status">
          Palpite salvo. Vale o último até o início do jogo.
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando" : "Salvar palpite"}
      </Button>
    </form>
  );
}
