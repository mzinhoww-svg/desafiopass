import { type Phase, phaseMultiplier } from "@/lib/scoring";

// Ordem e rotulos das fases do mata-mata (SCORING_SPEC secao 1).
export const PHASE_ORDER: Phase[] = [
  "grupos",
  "32avos",
  "oitavas",
  "quartas",
  "semi",
  "terceiro",
  "final",
];

export const PHASE_LABEL: Record<Phase, string> = {
  grupos: "Fase de grupos",
  "32avos": "32-avos de final",
  oitavas: "Oitavas de final",
  quartas: "Quartas de final",
  semi: "Semifinal",
  terceiro: "Disputa de 3º lugar",
  final: "Final",
};

// Rotulo curto + multiplicador para o selo (ex "Oitavas de final x1,4").
export function phaseBadge(phase: Phase): string {
  const mult = phaseMultiplier(phase).toLocaleString("pt-BR");
  return `${PHASE_LABEL[phase]} x${mult}`;
}
