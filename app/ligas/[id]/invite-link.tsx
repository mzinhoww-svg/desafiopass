"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { useT } from "@/components/i18n/locale-provider";

// Mostra o link de convite, copia a URL completa e gera um QR code (#7) para
// quem quiser entrar pelo celular escaneando.
export function InviteLink({ token }: { token: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const path = `/ligas/entrar/${token}`;

  useEffect(() => {
    const url =
      typeof window !== "undefined" ? window.location.origin + path : path;
    QRCode.toDataURL(url, { margin: 1, width: 256 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [path]);

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-cloud px-3 py-2">
        <span className="t-caption truncate text-muted">{path}</span>
        <button
          type="button"
          onClick={copy}
          className="t-caption flex flex-none items-center gap-1 font-bold text-rose"
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" /> {t("Copiado", "Copiado")}
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" /> {t("Copiar link", "Copiar enlace")}
            </>
          )}
        </button>
      </div>

      {qr ? (
        <div className="flex flex-col items-center gap-1">
          <img
            src={qr}
            alt={t("QR code do convite da liga", "Código QR de la invitación de la liga")}
            className="h-40 w-40 rounded-xl border border-black/10"
          />
          <span className="t-caption text-muted">
            {t("Aponte a câmera para entrar", "Apunta la cámara para unirte")}
          </span>
        </div>
      ) : null}
    </div>
  );
}
