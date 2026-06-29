"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import type { Locale } from "@/lib/i18n";

// Persiste o idioma escolhido no toggle para o usuário logado, de modo que e-mails
// e push (enviados pelo servidor, sem cookie de requisição) sigam essa preferência.
// Para deslogado, só o cookie vale (definido no cliente) e isto vira no-op.
export async function setLocalePreference(locale: Locale): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(users)
    .set({ locale: locale === "es" ? "es" : "pt" })
    .where(eq(users.id, user.id));
}
