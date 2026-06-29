"use client";

import { useActionState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { syncResultsAction, type SyncState } from "@/app/actions/admin";
import { useT } from "@/components/i18n/locale-provider";

const initial: SyncState = {};

// Botão "Sincronizar resultados" (#1): puxa os jogos da API e encerra/pontua os
// finalizados sob demanda, sem esperar o cron diário.
export function SyncButton() {
  const t = useT();
  const [state, formAction, pending] = useActionState(syncResultsAction, initial);
  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo/30 py-2.5 text-sm font-bold text-indigo disabled:opacity-60"
      >
        {pending ? (
          <Loader2 size={16} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw size={16} strokeWidth={2.5} aria-hidden="true" />
        )}
        {pending
          ? t("Sincronizando…", "Sincronizando…")
          : t("Sincronizar resultados (API)", "Sincronizar resultados (API)")}
      </button>
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
