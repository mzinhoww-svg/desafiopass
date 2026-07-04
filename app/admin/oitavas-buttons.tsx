"use client";

import { useActionState } from "react";
import { GitBranch, Mail, Loader2 } from "lucide-react";
import {
  openOitavasAction,
  announceOitavasAction,
  type OpenBracketState,
  type AnnounceState,
} from "@/app/actions/admin";
import { useT } from "@/components/i18n/locale-provider";

const openInit: OpenBracketState = {};
const annInit: AnnounceState = {};

// Ações da reta final: abrir o chaveamento das oitavas em diante (não destrutivo)
// e avisar os participantes por e-mail.
export function OitavasButtons() {
  const t = useT();
  const [openState, openForm, opening] = useActionState(openOitavasAction, openInit);
  const [annState, annForm, sending] = useActionState(announceOitavasAction, annInit);

  const btn =
    "flex w-full items-center justify-center gap-2 rounded-xl border border-indigo/30 py-2.5 text-sm font-bold text-indigo disabled:opacity-60";

  return (
    <div className="flex flex-col gap-2">
      <form action={openForm}>
        <button type="submit" disabled={opening} className={btn}>
          {opening ? (
            <Loader2 size={16} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
          ) : (
            <GitBranch size={16} strokeWidth={2.5} aria-hidden="true" />
          )}
          {opening
            ? t("Abrindo…", "Abriendo…")
            : t("Abrir oitavas → final", "Abrir octavos → final")}
        </button>
        {openState.message ? (
          <p className="t-caption mt-1 text-center text-muted">{openState.message}</p>
        ) : null}
        {openState.error ? (
          <p className="t-caption mt-1 text-center font-bold text-rose">{openState.error}</p>
        ) : null}
      </form>

      <form action={annForm}>
        <button type="submit" disabled={sending} className={btn}>
          {sending ? (
            <Loader2 size={16} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
          ) : (
            <Mail size={16} strokeWidth={2.5} aria-hidden="true" />
          )}
          {sending
            ? t("Enviando…", "Enviando…")
            : t("Avisar participantes (e-mail)", "Avisar participantes (correo)")}
        </button>
        {annState.message ? (
          <p className="t-caption mt-1 text-center text-muted">{annState.message}</p>
        ) : null}
        {annState.error ? (
          <p className="t-caption mt-1 text-center font-bold text-rose">{annState.error}</p>
        ) : null}
      </form>
    </div>
  );
}
