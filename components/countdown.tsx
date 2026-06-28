"use client";

import { useEffect, useState } from "react";

/*
 * Contagem regressiva até o apito (#4). Atualiza a cada 30s no cliente. Antes de
 * montar, mostra o `fallback` (horário absoluto) para evitar mismatch de hidratação.
 */
function format(ms: number): string {
  if (ms <= 0) return "Prazo encerrado";
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const min = totalMin % 60;
  if (days > 0) return `Fecha em ${days}d ${hours}h`;
  if (hours > 0) return `Fecha em ${hours}h ${min}min`;
  return `Fecha em ${min}min`;
}

export function Countdown({
  kickoffAt,
  fallback,
}: {
  kickoffAt: string;
  fallback: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const target = new Date(kickoffAt).getTime();
    const tick = () => setLabel(format(target - Date.now()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [kickoffAt]);

  return <span>{label ?? fallback}</span>;
}
