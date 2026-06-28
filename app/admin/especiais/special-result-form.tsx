"use client";

import { useActionState } from "react";
import { setSpecialResult, type SpecialState } from "@/app/actions/special";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: SpecialState = {};

export function SpecialResultForm({
  teams,
  champion,
  topScorer,
}: {
  teams: { code: string; name: string }[];
  champion: string | null;
  topScorer: string | null;
}) {
  const [state, formAction, pending] = useActionState(setSpecialResult, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="champion" className="t-kicker text-indigo">
          Campeão oficial
        </label>
        <select
          id="champion"
          name="champion"
          defaultValue={champion ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">Ainda não definido</option>
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
        label="Artilheiro oficial"
        placeholder="Nome do jogador"
        defaultValue={topScorer ?? ""}
      />

      {state.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          Resultado salvo e pontos recalculados.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando" : "Salvar e recalcular"}
      </Button>
    </form>
  );
}
