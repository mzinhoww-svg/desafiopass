// lib/push/notify.ts
//
// Dispara um Web Push para um conjunto de usuários (todas as suas inscrições) e
// limpa as inscrições expiradas. Usado nos eventos de resultado e lembrete.

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/drizzle/schema";
import { sendPush, type PushPayload } from "@/lib/push/send";

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
