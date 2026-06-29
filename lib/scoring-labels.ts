import type { Criterion } from "@/lib/scoring";
import type { Locale } from "@/lib/i18n";

// Frase curta do criterio para a UI de resultado (2.5). Le o criterion gravado,
// nunca recalcula pontos.
const CRITERION_LABEL_PT: Record<Criterion, string> = {
  placar_exato: "Placar exato",
  vencedor_e_gols: "Acertou o vencedor e os gols de um lado",
  vencedor: "Acertou o vencedor",
  empate: "Acertou o empate",
  errado: "Não pontuou",
};

const CRITERION_LABEL_ES: Record<Criterion, string> = {
  placar_exato: "Marcador exacto",
  vencedor_e_gols: "Acertaste al ganador y los goles de un lado",
  vencedor: "Acertaste al ganador",
  empate: "Acertaste el empate",
  errado: "No sumaste puntos",
};

// Mantido para compatibilidade (pt-BR). Prefira criterionLabel(criterion, locale).
export const CRITERION_LABEL = CRITERION_LABEL_PT;

export function criterionLabel(
  criterion: Criterion,
  locale: Locale = "pt",
): string {
  return (locale === "es" ? CRITERION_LABEL_ES : CRITERION_LABEL_PT)[criterion];
}
