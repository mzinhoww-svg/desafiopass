"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { savePushSubscription } from "@/app/actions/push";
import { useT } from "@/components/i18n/locale-provider";

const ASKED_KEY = "notif-asked-v1";

function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// Pergunta UMA vez (logo após o cadastro/primeiro acesso) se a pessoa quer ativar
// notificações de jogo e resultado. No Android/desktop assina o push direto; no
// iPhone orienta a instalar o app primeiro (push só funciona no PWA instalado).
export function NotificationPrompt() {
  const t = useT();
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === "undefined" || !vapid) return;
    if (localStorage.getItem(ASKED_KEY)) return;

    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // iPhone fora do PWA instalado: orienta instalar; não insiste fora disso.
      if (isIOS && !standalone) {
        setIosHint(true);
        const tmr = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(tmr);
      }
      return;
    }
    if (Notification.permission !== "default") {
      // Já decidiu antes; não pergunta de novo.
      localStorage.setItem(ASKED_KEY, "1");
      return;
    }
    const tmr = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(tmr);
  }, [vapid]);

  function close() {
    setShow(false);
    try {
      localStorage.setItem(ASKED_KEY, "1");
    } catch {
      // ignora
    }
  }

  async function enable() {
    if (!vapid) return close();
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
        const json = sub.toJSON() as {
          keys?: { p256dh?: string; auth?: string };
        };
        await savePushSubscription({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        });
      }
    } catch {
      // ignora — pode reativar no perfil
    } finally {
      setBusy(false);
      close();
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md p-3">
      <div className="relative rounded-2xl border border-black/10 bg-paper p-4 shadow-lg">
        <button
          type="button"
          onClick={close}
          aria-label={t("Fechar", "Cerrar")}
          className="absolute right-3 top-3 text-muted"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-rose/10 text-rose">
            <Bell size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="t-card-title text-indigo">
              {t("Ativar notificações?", "¿Activar notificaciones?")}
            </p>
            <p className="t-caption mt-0.5 text-muted">
              {t(
                "Avisamos quando o jogo está perto de começar e quando sai o resultado.",
                "Te avisamos cuando el partido está por empezar y cuando sale el resultado.",
              )}
            </p>

            {iosHint ? (
              <p className="t-caption mt-2 text-ink">
                {t(
                  "No iPhone, primeiro adicione o app à tela de início; depois ative as notificações por lá.",
                  "En iPhone, primero agrega la app a la pantalla de inicio; luego activa las notificaciones desde ahí.",
                )}
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={enable}
                  disabled={busy}
                  className="flex-1 rounded-xl bg-rose py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? t("Aguarde…", "Espera…") : t("Ativar", "Activar")}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm font-bold text-muted"
                >
                  {t("Agora não", "Ahora no")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
