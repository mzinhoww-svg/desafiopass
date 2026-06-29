"use client";

import { useActionState } from "react";
import { updateMatch, type AdminState } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: AdminState = {};

export function EditMatchForm({
  matchId,
  kickoffLocal,
  stadium,
  homeCode,
  awayCode,
  homeName,
  awayName,
  teams,
}: {
  matchId: string;
  kickoffLocal: string;
  stadium: string;
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
  teams: { code: string; name: string }[];
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(updateMatch, initial);

  // Garante que o valor atual (mesmo placeholder de avanço) apareça no select.
  const withCurrent = (code: string, name: string) =>
    teams.some((t) => t.code === code)
      ? teams
      : [{ code, name }, ...teams];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      <Input
        id="kickoffLocal"
        name="kickoffLocal"
        type="datetime-local"
        label={t("Data e hora (Brasília)", "Fecha y hora (Brasilia)")}
        defaultValue={kickoffLocal}
        required
      />

      <Input
        id="stadium"
        name="stadium"
        label={t("Estádio", "Estadio")}
        defaultValue={stadium}
        placeholder={t("A confirmar", "Por confirmar")}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="homeCode" className="t-kicker text-indigo">
          {t("Mandante", "Local")}
        </label>
        <select
          id="homeCode"
          name="homeCode"
          defaultValue={homeCode}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          {withCurrent(homeCode, homeName).map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="awayCode" className="t-kicker text-indigo">
          {t("Visitante", "Visitante")}
        </label>
        <select
          id="awayCode"
          name="awayCode"
          defaultValue={awayCode}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          {withCurrent(awayCode, awayName).map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          {t("Partida atualizada.", "Partido actualizado.")}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={pending}>
        {pending
          ? t("Salvando", "Guardando")
          : t("Salvar dados da partida", "Guardar datos del partido")}
      </Button>
    </form>
  );
}
