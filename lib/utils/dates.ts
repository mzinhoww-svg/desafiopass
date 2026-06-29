// lib/utils/dates.ts (DATA_SPEC secao 3.2)
// Prazo de palpite e comparacao UTC vs UTC. Exibicao converte para Brasilia.

export function isPredictionOpen(kickoffAt: Date, now: Date = new Date()): boolean {
  // Estritamente menor: no instante do apito (now === kickoff), fecha.
  return now.getTime() < kickoffAt.getTime();
}

export function formatBrasilia(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Converte um Date (UTC) para o valor de um input datetime-local em horario de
// Brasilia ("YYYY-MM-DDTHH:mm"). Usado no formulario de edicao de partida (admin).
export function toBrasiliaInput(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

// "Em andamento": o apito ja passou mas o admin ainda nao encerrou a partida.
export function isLive(kickoffAt: Date, status: string, now: Date = new Date()): boolean {
  return status !== "encerrada" && now.getTime() >= kickoffAt.getTime();
}
