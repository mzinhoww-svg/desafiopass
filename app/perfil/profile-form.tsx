"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ProfileState = {};

export function ProfileForm({
  nickname,
  favoriteTeam,
  teams,
}: {
  nickname: string;
  favoriteTeam: string | null;
  teams: { code: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        id="nickname"
        name="nickname"
        label="Apelido"
        defaultValue={nickname}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="favoriteTeam" className="t-kicker text-indigo">
          Time do coração
        </label>
        <select
          id="favoriteTeam"
          name="favoriteTeam"
          defaultValue={favoriteTeam ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">Sem time</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          Perfil salvo.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando" : "Salvar"}
      </Button>
    </form>
  );
}
