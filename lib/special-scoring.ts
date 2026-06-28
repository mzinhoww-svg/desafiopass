// lib/special-scoring.ts
//
// Pontuacao dos palpites especiais (#2), isolada e pura (testavel). Acertar o
// campeao e o artilheiro vale pontos altos, definidos abaixo. Campeao compara o
// codigo do team (exato). Artilheiro compara nomes normalizados (sem acento,
// minusculo, espacos colapsados) para tolerar variacoes de digitacao.

export type SpecialType = "campeao" | "artilheiro";

export const SPECIAL_POINTS: Record<SpecialType, number> = {
  campeao: 300,
  artilheiro: 200,
};

// Normaliza nome para comparacao tolerante (artilheiro).
export function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Pontos de um palpite especial. guess e official vazios/nulos => 0.
 * - campeao: compara codigos de team (case-insensitive, sem espacos).
 * - artilheiro: compara nomes normalizados.
 */
export function specialPoints(
  type: SpecialType,
  guess: string | null | undefined,
  official: string | null | undefined,
): number {
  if (!guess || !official) return 0;
  if (type === "campeao") {
    return guess.trim().toUpperCase() === official.trim().toUpperCase()
      ? SPECIAL_POINTS.campeao
      : 0;
  }
  return normalizeName(guess) === normalizeName(official)
    ? SPECIAL_POINTS.artilheiro
    : 0;
}
