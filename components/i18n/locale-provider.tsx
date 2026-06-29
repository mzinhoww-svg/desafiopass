"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";

// Disponibiliza o idioma resolvido no servidor para os componentes client. O
// valor não muda no cliente (a troca recarrega a página), então um contexto
// simples basta.
const LocaleContext = createContext<Locale>("pt");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

// Versão client do tr(), usando o idioma do contexto.
export function useT() {
  const locale = useLocale();
  return (pt: string, es: string) => (locale === "es" ? es : pt);
}
