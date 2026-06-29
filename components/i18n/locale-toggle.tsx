"use client";

import { useLocale } from "@/components/i18n/locale-provider";
import { setLocalePreference } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n";

// Nome do cookie inline (não importar valor de @/lib/i18n, que puxa next/headers
// para o bundle do cliente). Deve casar com LOCALE_COOKIE de @/lib/i18n.
const LOCALE_COOKIE = "locale";

// Toggle PT | ES. Grava o cookie de idioma e recarrega para o servidor
// re-renderizar tudo no novo idioma. "light" usa cores claras (sobre o header).
export function LocaleToggle({ variant = "light" }: { variant?: "light" | "dark" }) {
  const locale = useLocale();

  async function set(next: Locale) {
    if (next === locale) return;
    // 1 ano. path=/ para valer no app inteiro.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    // Persiste no perfil (se logado) para e-mails/push seguirem o idioma; ignora erro.
    try {
      await setLocalePreference(next);
    } catch {
      // segue mesmo assim — o cookie já vale para a navegação
    }
    window.location.reload();
  }

  const base =
    "px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors";
  const on =
    variant === "light" ? "bg-white text-indigo" : "bg-indigo text-white";
  const off =
    variant === "light" ? "text-white/80" : "text-indigo/70";

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${
        variant === "light" ? "bg-white/15" : "bg-cloud"
      }`}
      role="group"
      aria-label={locale === "es" ? "Idioma" : "Idioma"}
    >
      <button
        type="button"
        onClick={() => set("pt")}
        aria-pressed={locale === "pt"}
        className={`${base} ${locale === "pt" ? on : off}`}
      >
        PT
      </button>
      <button
        type="button"
        onClick={() => set("es")}
        aria-pressed={locale === "es"}
        className={`${base} ${locale === "es" ? on : off}`}
      >
        ES
      </button>
    </div>
  );
}
