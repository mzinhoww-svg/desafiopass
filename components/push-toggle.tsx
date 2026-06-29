"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  savePushSubscription,
  removePushSubscription,
} from "@/app/actions/push";

// Converte a chave VAPID (base64url) para o formato exigido pelo PushManager.
function urlBase64ToUint8Array(base64: string): BufferSource {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "loading" | "unsupported" | "ios" | "off" | "on" | "denied";

export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === "undefined" || !vapid) {
      setStatus("unsupported");
      return;
    }
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      // iPadOS se passa por Mac; detecta pelo touch.
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // No iPhone, push só funciona no PWA instalado (tela inicial).
      setStatus(isIOS && !standalone ? "ios" : "unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, [vapid]);

  async function enable() {
    if (!vapid) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "off");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const json = sub.toJSON() as { keys?: { p256dh?: string; auth?: string } };
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      setStatus("on");
    } catch {
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch {
      // mantém o estado
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading" || status === "unsupported") return null;

  if (status === "ios") {
    return (
      <p className="t-caption mt-4 text-center text-muted">
        Para receber notificações no iPhone, toque em Compartilhar →{" "}
        <strong>Adicionar à Tela de Início</strong> e abra o app por lá.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="t-caption mt-4 text-center text-muted">
        Notificações bloqueadas no navegador. Libere nas configurações do site
        para receber avisos de jogo e resultado.
      </p>
    );
  }

  const on = status === "on";
  return (
    <button
      type="button"
      onClick={on ? disable : enable}
      disabled={busy}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo/30 py-2.5 text-sm font-bold text-indigo disabled:opacity-60"
    >
      {on ? (
        <BellOff size={18} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <Bell size={18} strokeWidth={2.5} aria-hidden="true" />
      )}
      {busy
        ? "Aguarde…"
        : on
          ? "Desativar notificações"
          : "Ativar notificações"}
    </button>
  );
}
