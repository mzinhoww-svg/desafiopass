"use client";

import { useActionState } from "react";
import {
  saveSpecialPrediction,
  type SpecialState,
} from "@/app/actions/special";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { topScorerCandidates } from "@/lib/data/players";

const initial: SpecialState = {};

export function SpecialForm({
  teams,
  champion,
  topScorer,
}: {
  teams: { code: string; name: string }[];
  champion: string | null;
  topScorer: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveSpecialPrediction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="champion" className="t-kicker text-indigo">
          Campeão
        </label>
        <select
          id="champion"
          name="champion"
          defaultValue={champion ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">Escolher depois</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="topScorer"
        name="topScorer"
        label="Artilheiro"
        placeholder="Nome do jogador"
        defaultValue={topScorer ?? ""}
        list="top-scorer-options"
        autoComplete="off"
      />
      <datalist id="top-scorer-options">
        {topScorerCandidates.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>

      {state.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          Palpites especiais salvos.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando" : "Salvar palpites especiais"}
      </Button>
    </form>
  );
}
