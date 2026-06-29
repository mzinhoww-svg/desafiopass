import { type Phase, phaseMultiplier } from "@/lib/scoring";
import type { Locale } from "@/lib/i18n";

// Ordem e rotulos das fases do mata-mata (SCORING_SPEC secao 1).
export const PHASE_ORDER: Phase[] = [
  "grupos",
  "16avos",
  "oitavas",
  "quartas",
  "semi",
  "terceiro",
  "final",
];

const PHASE_LABEL_PT: Record<Phase, string> = {
  grupos: "Fase de grupos",
  "16avos": "16 avos de final",
  oitavas: "Oitavas de final",
  quartas: "Quartas de final",
  semi: "Semifinal",
  terceiro: "Disputa de 3º lugar",
  final: "Final",
};

const PHASE_LABEL_ES: Record<Phase, string> = {
  grupos: "Fase de grupos",
  "16avos": "Dieciseisavos de final",
  oitavas: "Octavos de final",
  quartas: "Cuartos de final",
  semi: "Semifinal",
  terceiro: "Partido por el 3.º lugar",
  final: "Final",
};

// Mantido para compatibilidade (pt-BR). Prefira phaseLabel(phase, locale).
export const PHASE_LABEL = PHASE_LABEL_PT;

export function phaseLabel(phase: Phase, locale: Locale = "pt"): string {
  return (locale === "es" ? PHASE_LABEL_ES : PHASE_LABEL_PT)[phase];
}

// Rotulo curto + multiplicador para o selo (ex "Oitavas de final x1,4").
export function phaseBadge(phase: Phase, locale: Locale = "pt"): string {
  const mult = phaseMultiplier(phase).toLocaleString(
    locale === "es" ? "es-CL" : "pt-BR",
  );
  return `${phaseLabel(phase, locale)} x${mult}`;
}
