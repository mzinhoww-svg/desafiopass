// lib/push/notify.ts
//
// Dispara um Web Push para um conjunto de usuários (todas as suas inscrições) e
// limpa as inscrições expiradas. Usado nos eventos de resultado e lembrete.

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, users } from "@/drizzle/schema";
import { sendPush, type PushPayload } from "@/lib/push/send";
import type { Locale } from "@/lib/i18n";

export async function pushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  for (const s of subs) {
    const r = await sendPush(
      { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
      payload,
    );
    if (r === "gone") {
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
    }
  }
}

// Versão bilíngue: envia a cada usuário o payload no idioma salvo dele (users.locale).
export async function pushToUsersLocalized(
  userIds: string[],
  payloads: Record<Locale, PushPayload>,
) {
  if (userIds.length === 0) return;
  const localeRows = await db
    .select({ id: users.id, locale: users.locale })
    .from(users)
    .where(inArray(users.id, userIds));
  const localeByUser = new Map<string, Locale>(
    localeRows.map((r) => [r.id, r.locale === "es" ? "es" : "pt"]),
  );
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));

  for (const s of subs) {
    const loc = localeByUser.get(s.userId) ?? "pt";
    const r = await sendPush(
      { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
      payloads[loc],
    );
    if (r === "gone") {
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
    }
  }
}
