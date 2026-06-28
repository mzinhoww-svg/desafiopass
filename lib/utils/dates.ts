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
