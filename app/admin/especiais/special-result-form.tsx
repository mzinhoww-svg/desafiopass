"use client";

import { useActionState } from "react";
import { setSpecialResult, type SpecialState } from "@/app/actions/special";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

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
  const t = useT();
  const [state, formAction, pending] = useActionState(setSpecialResult, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="champion" className="t-kicker text-indigo">
          {t("Campeão oficial", "Campeón oficial")}
        </label>
        <select
          id="champion"
          name="champion"
          defaultValue={champion ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">{t("Ainda não definido", "Aún no definido")}</option>
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
        label={t("Artilheiro oficial", "Goleador oficial")}
        placeholder={t("Nome do jogador", "Nombre del jugador")}
        defaultValue={topScorer ?? ""}
      />

      {state.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          {t(
            "Resultado salvo e pontos recalculados.",
            "Resultado guardado y puntos recalculados.",
          )}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? t("Salvando", "Guardando")
          : t("Salvar e recalcular", "Guardar y recalcular")}
      </Button>
    </form>
  );
}
