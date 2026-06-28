"use client";

import { useState, type ReactNode } from "react";

// Abas da partida: "Seu palpite" e "Comunidade" (palpites de outros usuarios).
export function MatchTabs({
  palpite,
  comunidade,
}: {
  palpite: ReactNode;
  comunidade: ReactNode;
}) {
  const [tab, setTab] = useState<"palpite" | "comunidade">("palpite");
  const base =
    "flex-1 py-2 text-sm font-bold uppercase tracking-wide -mb-0.5 border-b-2";
  return (
    <div>
      <div className="mb-4 flex border-b-2 border-black/10">
        <button
          type="button"
          onClick={() => setTab("palpite")}
          aria-current={tab === "palpite" ? "true" : undefined}
          className={`${base} ${tab === "palpite" ? "border-rose text-indigo" : "border-transparent text-muted"}`}
        >
          Seu palpite
        </button>
        <button
          type="button"
          onClick={() => setTab("comunidade")}
          aria-current={tab === "comunidade" ? "true" : undefined}
          className={`${base} ${tab === "comunidade" ? "border-rose text-indigo" : "border-transparent text-muted"}`}
        >
          Comunidade
        </button>
      </div>
      {tab === "palpite" ? palpite : comunidade}
    </div>
  );
}
