"use client";

import { useActionState, useState } from "react";
import { GitBranch, Mail, Trophy, Loader2, Copy, Check } from "lucide-react";
import {
  openOitavasAction,
  announceOitavasAction,
  createRetaFinalLeagueAction,
  type OpenBracketState,
  type AnnounceState,
  type RetaLeagueState,
} from "@/app/actions/admin";
import { useT } from "@/components/i18n/locale-provider";

const openInit: OpenBracketState = {};
const annInit: AnnounceState = {};
const leagueInit: RetaLeagueState = {};

// Ações da reta final: abrir o chaveamento das oitavas em diante (não destrutivo)
// e avisar os participantes por e-mail.
export function OitavasButtons() {
  const t = useT();
  const [openState, openForm, opening] = useActionState(openOitavasAction, openInit);
  const [annState, annForm, sending] = useActionState(announceOitavasAction, annInit);
  const [leagueState, leagueForm, creating] = useActionState(
    createRetaFinalLeagueAction,
    leagueInit,
  );
  const [copied, setCopied] = useState(false);

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

      <form action={leagueForm}>
        <button type="submit" disabled={creating} className={btn}>
          {creating ? (
            <Loader2 size={16} strokeWidth={2.5} className="animate-spin" aria-hidden="true" />
          ) : (
            <Trophy size={16} strokeWidth={2.5} aria-hidden="true" />
          )}
          {creating
            ? t("Criando…", "Creando…")
            : t("Criar liga da Reta Final", "Crear liga de la Recta Final")}
        </button>
        {leagueState.url ? (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-black/10 bg-cloud p-2">
            <span className="t-caption min-w-0 flex-1 truncate text-indigo">
              {leagueState.url}
            </span>
            <button
              type="button"
              aria-label={t("Copiar link", "Copiar enlace")}
              onClick={() => {
                navigator.clipboard?.writeText(leagueState.url ?? "");
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex-none rounded-lg border border-indigo/30 p-1.5 text-indigo"
            >
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            </button>
          </div>
        ) : null}
        {leagueState.error ? (
          <p className="t-caption mt-1 text-center font-bold text-rose">{leagueState.error}</p>
        ) : null}
      </form>
    </div>
  );
}
