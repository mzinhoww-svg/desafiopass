"use client";

import { useActionState } from "react";
import { createLeague, type LeagueState } from "@/app/actions/liga";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: LeagueState = {};

export function CreateLeagueForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(createLeague, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        id="league-name"
        name="name"
        label={t("Nome da liga", "Nombre de la liga")}
        placeholder={t("Família FC", "Familia FC")}
        required
      />
      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        {pending ? t("Criando", "Creando") : t("Criar nova liga", "Crear nueva liga")}
      </Button>
    </form>
  );
}
