"use client";

import { useActionState, useState } from "react";
import { Download } from "lucide-react";
import { importBracketAction, type ImportState } from "@/app/actions/admin";

const initial: ImportState = {};

// Botão "Importar mata-mata real (API)": substitui o chaveamento fictício pelos
// confrontos reais da Copa vindos da football-data.org. Destrutivo — pede
// confirmação antes de enviar (apaga partidas/palpites fora do chaveamento real).
export function ImportButton() {
  const [state, formAction, pending] = useActionState(
    importBracketAction,
    initial,
  );
  const [armed, setArmed] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!armed) {
            e.preventDefault();
            setArmed(true);
          }
        }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold disabled:opacity-60 ${
          armed
            ? "border-rose bg-rose/10 text-rose"
            : "border-indigo/30 text-indigo"
        }`}
      >
        <Download size={16} strokeWidth={2.5} aria-hidden="true" />
        {pending
          ? "Importando…"
          : armed
            ? "Confirmar: apaga o chaveamento atual"
            : "Importar mata-mata real (API)"}
      </button>
      {armed && !pending ? (
        <p className="t-caption text-center text-muted">
          Substitui as partidas pelos jogos reais da API. Palpites no chaveamento
          fictício serão perdidos. Clique de novo para confirmar.
        </p>
      ) : null}
      {state.message ? (
        <p className="t-caption mt-1 text-center text-muted">{state.message}</p>
      ) : null}
      {state.error ? (
        <p className="t-caption mt-1 text-center font-bold text-rose">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
