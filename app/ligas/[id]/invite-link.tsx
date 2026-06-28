"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Mostra o link de convite e copia a URL completa (origin + caminho).
export function InviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/ligas/entrar/${token}`;

  async function copy() {
    const url =
      typeof window !== "undefined" ? window.location.origin + path : path;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignora falha de clipboard (ex permissao negada).
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-cloud px-3 py-2">
      <span className="t-caption truncate text-muted">{path}</span>
      <button
        type="button"
        onClick={copy}
        className="t-caption flex flex-none items-center gap-1 font-bold text-rose"
      >
        {copied ? (
          <>
            <Check size={14} aria-hidden="true" /> Copiado
          </>
        ) : (
          <>
            <Copy size={14} aria-hidden="true" /> Copiar link
          </>
        )}
      </button>
    </div>
  );
}
