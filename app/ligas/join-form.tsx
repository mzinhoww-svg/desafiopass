"use client";

import { useActionState } from "react";
import { joinLeague, type LeagueState } from "@/app/actions/liga";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: LeagueState = {};

export function JoinForm() {
  const [state, formAction, pending] = useActionState(joinLeague, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        id="join-token"
        name="token"
        label="Código ou link do convite"
        placeholder="cole aqui o convite da liga"
        required
      />
      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Entrando" : "Entrar no grupo"}
      </Button>
    </form>
  );
}
