"use client";

import { useActionState } from "react";
import { createLeague, type LeagueState } from "@/app/actions/liga";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: LeagueState = {};

export function CreateLeagueForm() {
  const [state, formAction, pending] = useActionState(createLeague, initial);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        id="league-name"
        name="name"
        label="Nome da liga"
        placeholder="Família FC"
        required
      />
      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando" : "Criar nova liga"}
      </Button>
    </form>
  );
}
