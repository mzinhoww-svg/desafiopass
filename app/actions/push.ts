"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/drizzle/schema";
import { getCurrentUser } from "@/lib/auth-helpers";

// Salva/atualiza a inscrição de push do dispositivo atual (PWA).
export async function savePushSubscription(sub: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (!sub.endpoint || !sub.p256dh || !sub.auth) return { ok: false };
  await db
    .insert(pushSubscriptions)
    .values({
      userId: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: sub.p256dh, auth: sub.auth },
    });
  return { ok: true };
}

// Remove a inscrição (ao desativar as notificações).
export async function removePushSubscription(
  endpoint: string,
): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, user.id),
      ),
    );
  return { ok: true };
}
