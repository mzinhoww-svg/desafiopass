"use client";

import { useActionState } from "react";
import { joinLeague, type LeagueState } from "@/app/actions/liga";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: LeagueState = {};

export function JoinForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(joinLeague, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        id="join-token"
        name="token"
        label={t("Código ou link do convite", "Código o enlace de invitación")}
        placeholder={t("cole aqui o convite da liga", "pega aquí la invitación de la liga")}
        required
      />
      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" loading={pending}>
        {pending ? t("Entrando", "Uniéndote") : t("Entrar no grupo", "Unirse al grupo")}
      </Button>
    </form>
  );
}
