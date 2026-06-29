"use client";

import { Share2 } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

/*
 * Botao de compartilhar (#7). Usa a Web Share API nativa quando disponivel
 * (mobile) e cai para o WhatsApp (wa.me) caso contrario. `path` é relativo; a URL
 * absoluta é montada com o origin no cliente.
 */
export function ShareButton({
  text,
  path = "/",
  label,
  className = "",
}: {
  text: string;
  path?: string;
  label?: string;
  className?: string;
}) {
  const t = useT();
  const resolvedLabel = label ?? t("Compartilhar", "Compartir");
  async function share() {
    const url =
      typeof window !== "undefined" ? window.location.origin + path : path;
    const full = `${text} ${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // usuario cancelou ou nao suportado: cai para o WhatsApp
      }
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(full)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Share2 size={18} strokeWidth={2.5} aria-hidden="true" />
      {resolvedLabel}
    </button>
  );
}
