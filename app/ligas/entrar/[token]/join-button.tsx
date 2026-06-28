"use client";

import { useActionState } from "react";
import { joinLeague, type LeagueState } from "@/app/actions/liga";
import { Button } from "@/components/ui/button";

const initial: LeagueState = {};

export function JoinButton({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(joinLeague, initial);
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="token" value={token} />
      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando" : "Entrar na liga"}
      </Button>
    </form>
  );
}
