import type { Criterion } from "@/lib/scoring";

// Frase curta do criterio para a UI de resultado (2.5). Le o criterion gravado,
// nunca recalcula pontos.
export const CRITERION_LABEL: Record<Criterion, string> = {
  placar_exato: "Placar exato",
  vencedor_e_gols: "Acertou o vencedor e os gols de um lado",
  vencedor: "Acertou o vencedor",
  empate: "Acertou o empate",
  errado: "Não pontuou",
};
