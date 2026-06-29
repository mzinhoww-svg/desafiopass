// reference-code/lib/scoring.ts
//
// Logica de pontuacao do Bolao Pass. FUNCAO PURA.
// Implementa specs/SCORING_SPEC.md ao pe da letra.
//
// Regras invioláveis:
// - Sem I/O, sem acesso a banco, sem leitura de data do sistema.
// - Pontuacao NAO cumulativa: vale o maior criterio em que o palpite se enquadra.
// - Ordem do calculo: base -> Brasil -> fase. Arredondamento half up (Math.round).
// - Penalti nao conta: o `result` recebido ja e o placar do tempo regulamentar ou
//   prorrogacao. Esta funcao nao conhece penalti.
// - Entrada assumida valida (range 0..20 validado por Zod na borda). Nao revalida.
// - Esta e a UNICA fonte da regra de pontos. Proibido recalcular em outro arquivo.

export type Phase =
  | 'grupos'
  | '16avos'
  | 'oitavas'
  | 'quartas'
  | 'semi'       // semifinal
  | 'terceiro'   // disputa de 3 e 4 lugar
  | 'final';

export interface MatchResult {
  homeScore: number; // inteiro >= 0
  awayScore: number; // inteiro >= 0
}

export interface Guess {
  homeGuess: number; // inteiro 0..20
  awayGuess: number; // inteiro 0..20
}

export interface ScoreInput {
  guess: Guess | null;    // null = usuario nao palpitou no prazo
  result: MatchResult;    // sempre presente (so calcula apos encerrar)
  phase: Phase;
  isBrazilMatch: boolean; // true se a selecao brasileira joga esta partida
}

export type Criterion =
  | 'placar_exato'    // 50
  | 'vencedor_e_gols' // 35
  | 'vencedor'        // 20
  | 'empate'          // 20
  | 'errado';         // 0

export interface ScoreBreakdown {
  base: number;
  criterion: Criterion;
  brazilMultiplier: 1 | 2;
  phaseMultiplier: number; // 1, 1.2, 1.4, 1.6, 1.8, 2
  final: number;           // resultado inteiro final
}

const PHASE_MULTIPLIER: Record<Phase, number> = {
  grupos: 1,
  '16avos': 1.2,
  oitavas: 1.4,
  quartas: 1.6,
  semi: 1.8,
  terceiro: 1.8, // disputa de 3 e 4 lugar usa o mesmo da semi
  final: 2,
};

// Sinal do resultado de um placar.
function sign(h: number, a: number): 'home' | 'away' | 'draw' {
  if (h > a) return 'home';
  if (a > h) return 'away';
  return 'draw';
}

/**
 * Pontos-base puros. Nao aplica multiplicador.
 * Avalia os criterios em ordem e para no primeiro que bate (nao cumulativo).
 * guess null retorna base 0 / errado.
 */
export function basePoints(
  guess: Guess | null,
  result: MatchResult
): { base: number; criterion: Criterion } {
  if (!guess) return { base: 0, criterion: 'errado' };

  // 1. Placar exato.
  const exact =
    guess.homeGuess === result.homeScore && guess.awayGuess === result.awayScore;
  if (exact) return { base: 50, criterion: 'placar_exato' };

  const sameSign =
    sign(guess.homeGuess, guess.awayGuess) === sign(result.homeScore, result.awayScore);
  const oneSideHits =
    guess.homeGuess === result.homeScore || guess.awayGuess === result.awayScore;
  const isDraw = sign(result.homeScore, result.awayScore) === 'draw';

  // 2. Vencedor correto (ou empate) + gols de pelo menos uma selecao, sem placar exato.
  //    Empate nunca cai aqui: num empate, acertar um lado implica o outro (sao iguais),
  //    o que ja teria batido o criterio 1. Por isso a guarda !isDraw.
  if (sameSign && oneSideHits && !isDraw) {
    return { base: 35, criterion: 'vencedor_e_gols' };
  }

  // 3. Empate correto sem placar exato (ex real 1x1, palpite 2x2).
  if (sameSign && isDraw) return { base: 20, criterion: 'empate' };

  // 4. Apenas o vencedor correto, sem acertar gols.
  if (sameSign) return { base: 20, criterion: 'vencedor' };

  // 5. Errado.
  return { base: 0, criterion: 'errado' };
}

/** Multiplicador de fase. Tipagem garante fase valida. */
export function phaseMultiplier(phase: Phase): number {
  return PHASE_MULTIPLIER[phase];
}

/**
 * Pontuacao final. Ordem: base -> Brasil -> fase. Arredonda half up.
 * Retorna o detalhamento completo, auditavel.
 */
export function finalPoints(input: ScoreInput): ScoreBreakdown {
  const { base, criterion } = basePoints(input.guess, input.result);
  const brazilMultiplier: 1 | 2 = input.isBrazilMatch ? 2 : 1;
  const pm = phaseMultiplier(input.phase);
  const final = Math.round(base * brazilMultiplier * pm);
  return { base, criterion, brazilMultiplier, phaseMultiplier: pm, final };
}
