// lib/i18n.ts
//
// i18n leve (2 idiomas): português do Brasil (padrão) e espanhol do Chile.
// Convenção: cada string aparece nas duas línguas no próprio ponto de uso, via
// tr(locale, "pt", "es"). Sem dicionário central — fácil de manter e de revisar,
// e a cópia es-CL fica ao lado da pt-BR.
//
// Idioma resolvido por:
//   1) cookie "locale" (escolha explícita no toggle);
//   2) cabeçalho Accept-Language (detecção): "es*" => espanhol;
//   3) padrão: português.

import { cookies, headers } from "next/headers";
import { cache } from "react";

export type Locale = "pt" | "es";

export const LOCALE_COOKIE = "locale";

// Escolhe a string conforme o idioma. Inline nos componentes.
export function tr(locale: Locale, pt: string, es: string): string {
  return locale === "es" ? es : pt;
}

// Tag BCP-47 para o atributo lang do <html>.
export function htmlLang(locale: Locale): string {
  return locale === "es" ? "es-CL" : "pt-BR";
}

// Resolve o idioma no servidor (cookie -> Accept-Language -> pt). Cacheado por
// requisição para não reler cookies/headers várias vezes.
export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie === "es" || fromCookie === "pt") return fromCookie;

  const h = await headers();
  const accept = (h.get("accept-language") ?? "").toLowerCase();
  if (/(^|,|\s)es\b/.test(accept) || accept.startsWith("es")) return "es";
  return "pt";
});
