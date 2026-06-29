"use client";

import { useEffect } from "react";

// Global error boundary (#9): usado quando o próprio layout raiz falha. Precisa
// renderizar <html>/<body> próprios. Mantém uma mensagem simples e na marca.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  // Sem acesso confiável ao contexto de locale aqui (renderiza o próprio
  // <html>/<body>): lê o cookie "locale" para escolher o idioma.
  const isEs =
    typeof document !== "undefined" && document.cookie.includes("locale=es");

  return (
    <html lang={isEs ? "es-CL" : "pt-BR"}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#16064F",
          color: "#FFFFFF",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          {isEs ? "Algo salió mal" : "Algo deu errado"}
        </h1>
        <p style={{ maxWidth: "40ch", color: "#C9C5E6", margin: 0 }}>
          {isEs
            ? "Tuvimos un problema inesperado. Inténtalo de nuevo."
            : "Tivemos um problema inesperado. Tente novamente."}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            border: "none",
            borderRadius: 999,
            background: "#FE3173",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: 14,
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          {isEs ? "Intentar de nuevo" : "Tentar de novo"}
        </button>
      </body>
    </html>
  );
}
