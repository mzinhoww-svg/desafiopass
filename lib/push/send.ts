// lib/push/send.ts
//
// Envio de Web Push (notificações PWA) via web-push + VAPID. Não lança: sem
// chaves configuradas, vira no-op. Roda no runtime Node (server actions/rotas).
//
// Env:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY   chave pública VAPID (também usada no cliente)
//   VAPID_PRIVATE_KEY              chave privada VAPID
//   VAPID_SUBJECT                  mailto: do remetente (opcional)

import webpush from "web-push";

export interface PushSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

let configured: boolean | null = null;

function ensureConfigured(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    console.warn("[push] VAPID ausente; push desativado");
    configured = false;
    return false;
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:no-reply@desafiopass.com",
    pub,
    priv,
  );
  configured = true;
  return true;
}

// Retorna "gone" quando a inscrição expirou (404/410) para a chamadora removê-la.
export async function sendPush(
  sub: PushSub,
  payload: PushPayload,
): Promise<"ok" | "gone" | "skip" | "error"> {
  if (!ensureConfigured()) return "skip";
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return "ok";
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) return "gone";
    console.error("[push] falha ao enviar:", code ?? e);
    return "error";
  }
}
