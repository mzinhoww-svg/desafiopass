"use client";

import type { ReactNode } from "react";

// Botao de submit com confirmacao nativa antes de enviar (acoes destrutivas).
export function ConfirmButton({
  message,
  children,
  className = "",
}: {
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
