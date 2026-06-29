"use client";

import { useEffect, useState } from "react";
import { Share, X, Download, Plus } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

// Evento do Chromium para instalar PWA (não tipado no lib.dom padrão).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install-prompt-dismissed-v1";

// Popup para instalar o app na tela inicial. No Android/desktop (Chromium) usa o
// evento beforeinstallprompt; no iPhone mostra o passo a passo (Compartilhar →
// Adicionar à Tela de Início), pois o iOS não permite instalar via API.
export function InstallPrompt({ loggedIn = false }: { loggedIn?: boolean }) {
  const t = useT();
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Logado e ainda sem responder o aviso de notificações: deixa aquele popup
    // aparecer primeiro (após o cadastro), para não empilhar dois popups.
    if (loggedIn && !localStorage.getItem("notif-asked-v1")) return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return; // já instalado

    const iOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (iOS) {
      // Só Safari instala no iOS; evita mostrar em navegadores in-app sem Compartilhar.
      const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
      if (isSafari) {
        setIsIOS(true);
        const tmr = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(tmr);
      }
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [loggedIn]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignora
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md p-3">
      <div className="relative rounded-2xl border border-black/10 bg-paper p-4 shadow-lg">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("Fechar", "Cerrar")}
          className="absolute right-3 top-3 text-muted"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-indigo/10 text-indigo">
            <Download size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="t-card-title text-indigo">
              {t("Instale o app", "Instala la app")}
            </p>
            <p className="t-caption mt-0.5 text-muted">
              {isIOS
                ? t(
                    "Adicione à tela de início para abrir como app e receber notificações.",
                    "Agrégala a la pantalla de inicio para abrirla como app y recibir notificaciones.",
                  )
                : t(
                    "Instale na tela de início para acesso rápido e notificações.",
                    "Instálala en la pantalla de inicio para acceso rápido y notificaciones.",
                  )}
            </p>

            {isIOS ? (
              <p className="t-caption mt-2 flex flex-wrap items-center gap-1 text-ink">
                {t("Toque em", "Toca en")}
                <Share size={15} className="inline text-indigo" aria-hidden="true" />
                <strong>{t("Compartilhar", "Compartir")}</strong>
                {t("e depois", "y luego")}
                <Plus size={15} className="inline text-indigo" aria-hidden="true" />
                <strong>
                  {t("Adicionar à Tela de Início", "Agregar a pantalla de inicio")}
                </strong>
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={install}
                  className="flex-1 rounded-xl bg-indigo py-2 text-sm font-bold text-white"
                >
                  {t("Instalar", "Instalar")}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
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
