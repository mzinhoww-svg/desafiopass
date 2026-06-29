"use client";

import { useActionState } from "react";
import {
  saveSpecialPrediction,
  type SpecialState,
} from "@/app/actions/special";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { topScorerCandidates } from "@/lib/data/players";
import { useT } from "@/components/i18n/locale-provider";

const initial: SpecialState = {};

export function SpecialForm({
  teams,
  champion,
  topScorer,
  scorers = [],
}: {
  teams: { code: string; name: string }[];
  champion: string | null;
  topScorer: string | null;
  // Artilheiros vindos da API (já ordenados por gols). Vazio antes de haver gols.
  scorers?: { name: string; goals: number }[];
}) {
  const [state, formAction, pending] = useActionState(
    saveSpecialPrediction,
    initial,
  );
  const t = useT();
  // Mantém o palpite atual no topo mesmo se ele ainda não estiver na lista da API.
  const currentMissing =
    !!topScorer && !scorers.some((s) => s.name === topScorer);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="champion" className="t-kicker text-indigo">
          {t("Campeão", "Campeón")}
        </label>
        <select
          id="champion"
          name="champion"
          defaultValue={champion ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">{t("Escolher depois", "Elegir después")}</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {scorers.length > 0 ? (
        // Dropdown com os artilheiros da Copa (API), em ordem de mais gols.
        <div className="flex flex-col gap-1.5">
          <label htmlFor="topScorer" className="t-kicker text-indigo">
            {t("Artilheiro", "Goleador")}
          </label>
          <select
            id="topScorer"
            name="topScorer"
            defaultValue={topScorer ?? ""}
            className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
          >
            <option value="">{t("Escolher depois", "Elegir después")}</option>
            {currentMissing ? (
              <option value={topScorer ?? ""}>{topScorer}</option>
            ) : null}
            {scorers.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} — {s.goals} {t("gols", "goles")}
              </option>
            ))}
          </select>
          <p className="t-caption text-muted">
            {t(
              "Lista de artilheiros da Copa, do mais para o menos goleador.",
              "Lista de goleadores de la Copa, de mayor a menor cantidad de goles.",
            )}
          </p>
        </div>
      ) : (
        // Antes de haver gols, mantém o campo com sugestões ao digitar.
        <>
          <Input
            id="topScorer"
            name="topScorer"
            label={t("Artilheiro", "Goleador")}
            placeholder={t("Nome do jogador", "Nombre del jugador")}
            defaultValue={topScorer ?? ""}
            list="top-scorer-options"
            autoComplete="off"
          />
          <datalist id="top-scorer-options">
            {topScorerCandidates.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </>
      )}

      {state.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          {t("Palpites especiais salvos.", "Pronósticos especiales guardados.")}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? t("Salvando", "Guardando")
          : t("Salvar palpites especiais", "Guardar pronósticos especiales")}
      </Button>
    </form>
  );
}
