// reference-code/lib/scoring.test.ts
//
// Suite de testes da logica de pontuacao. Cobre TODOS os casos de specs/SCORING_SPEC.md
// secao 7: base puros B1..B14 e finais com multiplicador F1..F13, mais ScoreBreakdown
// e arredondamento half up.
//
// Runner: vitest. Rodar com `npm run test`.

import { describe, it, expect } from 'vitest';
import {
  basePoints,
  phaseMultiplier,
  finalPoints,
  type Phase,
} from './scoring';

describe('basePoints (B1..B14)', () => {
  const cases: Array<{
    id: string;
    home: number;
    away: number;
    gh: number | null;
    ga: number | null;
    base: number;
    criterion: string;
  }> = [
    { id: 'B1', home: 2, away: 0, gh: 2, ga: 0, base: 50, criterion: 'placar_exato' },
    { id: 'B2', home: 2, away: 0, gh: 2, ga: 1, base: 35, criterion: 'vencedor_e_gols' },
    { id: 'B3', home: 2, away: 0, gh: 3, ga: 1, base: 20, criterion: 'vencedor' },
    { id: 'B4', home: 0, away: 0, gh: 0, ga: 0, base: 50, criterion: 'placar_exato' },
    { id: 'B5', home: 1, away: 1, gh: 2, ga: 2, base: 20, criterion: 'empate' },
    { id: 'B6', home: 1, away: 1, gh: 1, ga: 1, base: 50, criterion: 'placar_exato' },
    { id: 'B7', home: 2, away: 1, gh: 1, ga: 2, base: 0, criterion: 'errado' },
    { id: 'B8', home: 2, away: 1, gh: 0, ga: 3, base: 0, criterion: 'errado' },
    { id: 'B9', home: 3, away: 1, gh: 3, ga: 2, base: 35, criterion: 'vencedor_e_gols' },
    { id: 'B10', home: 3, away: 1, gh: 2, ga: 1, base: 35, criterion: 'vencedor_e_gols' },
    { id: 'B11', home: 0, away: 2, gh: 0, ga: 1, base: 35, criterion: 'vencedor_e_gols' },
    { id: 'B12', home: 2, away: 2, gh: 3, ga: 3, base: 20, criterion: 'empate' },
    { id: 'B13', home: 1, away: 0, gh: null, ga: null, base: 0, criterion: 'errado' },
    { id: 'B14', home: 1, away: 0, gh: 0, ga: 1, base: 0, criterion: 'errado' },
  ];

  for (const c of cases) {
    it(`${c.id}: real ${c.home}x${c.away} palpite ${c.gh}x${c.ga} -> ${c.base} (${c.criterion})`, () => {
      const guess =
        c.gh === null || c.ga === null ? null : { homeGuess: c.gh, awayGuess: c.ga };
      const r = basePoints(guess, { homeScore: c.home, awayScore: c.away });
      expect(r.base).toBe(c.base);
      expect(r.criterion).toBe(c.criterion);
    });
  }

  it('empate nunca retorna vencedor_e_gols (B5, B12)', () => {
    expect(basePoints({ homeGuess: 2, awayGuess: 2 }, { homeScore: 1, awayScore: 1 }).criterion).toBe('empate');
    expect(basePoints({ homeGuess: 3, awayGuess: 3 }, { homeScore: 2, awayScore: 2 }).criterion).toBe('empate');
  });
});

describe('phaseMultiplier', () => {
  const table: Array<[Phase, number]> = [
    ['grupos', 1],
    ['16avos', 1.2],
    ['oitavas', 1.4],
    ['quartas', 1.6],
    ['semi', 1.8],
    ['terceiro', 1.8],
    ['final', 2],
  ];
  for (const [phase, mult] of table) {
    it(`${phase} -> x${mult}`, () => {
      expect(phaseMultiplier(phase)).toBe(mult);
    });
  }
});

describe('finalPoints (F1..F13)', () => {
  const cases: Array<{
    id: string;
    phase: Phase;
    brazil: boolean;
    home: number;
    away: number;
    gh: number;
    ga: number;
    final: number;
  }> = [
    { id: 'F1', phase: 'grupos', brazil: false, home: 2, away: 0, gh: 3, ga: 1, final: 20 },
    { id: 'F2', phase: 'grupos', brazil: true, home: 2, away: 1, gh: 2, ga: 0, final: 70 },
    { id: 'F3', phase: 'oitavas', brazil: false, home: 2, away: 1, gh: 2, ga: 0, final: 49 },
    { id: 'F4', phase: 'quartas', brazil: false, home: 2, away: 0, gh: 2, ga: 0, final: 80 },
    { id: 'F5', phase: 'final', brazil: false, home: 1, away: 0, gh: 1, ga: 0, final: 100 },
    { id: 'F6', phase: 'oitavas', brazil: true, home: 1, away: 1, gh: 2, ga: 2, final: 56 },
    { id: 'F7', phase: 'semi', brazil: true, home: 2, away: 1, gh: 2, ga: 0, final: 126 },
    { id: 'F8', phase: 'final', brazil: true, home: 2, away: 1, gh: 2, ga: 1, final: 200 },
    { id: 'F9', phase: '16avos', brazil: false, home: 1, away: 0, gh: 1, ga: 0, final: 60 },
    { id: 'F10', phase: 'terceiro', brazil: false, home: 2, away: 1, gh: 2, ga: 0, final: 63 },
    { id: 'F11', phase: '16avos', brazil: false, home: 2, away: 0, gh: 2, ga: 1, final: 42 },
    { id: 'F12', phase: 'oitavas', brazil: false, home: 1, away: 1, gh: 2, ga: 2, final: 28 },
    { id: 'F13', phase: '16avos', brazil: false, home: 3, away: 1, gh: 3, ga: 2, final: 42 },
  ];

  for (const c of cases) {
    it(`${c.id}: ${c.phase} brasil=${c.brazil} real ${c.home}x${c.away} palpite ${c.gh}x${c.ga} -> ${c.final}`, () => {
      const out = finalPoints({
        guess: { homeGuess: c.gh, awayGuess: c.ga },
        result: { homeScore: c.home, awayScore: c.away },
        phase: c.phase,
        isBrazilMatch: c.brazil,
      });
      expect(out.final).toBe(c.final);
    });
  }
});

describe('ScoreBreakdown completo (SCORING_SPEC 7.3)', () => {
  it('F8: final, Brasil, placar exato 2x1 -> 200 com detalhamento auditavel', () => {
    expect(
      finalPoints({
        guess: { homeGuess: 2, awayGuess: 1 },
        result: { homeScore: 2, awayScore: 1 },
        phase: 'final',
        isBrazilMatch: true,
      })
    ).toEqual({
      base: 50,
      criterion: 'placar_exato',
      brazilMultiplier: 2,
      phaseMultiplier: 2,
      final: 200,
    });
  });
});

describe('arredondamento half up (SCORING_SPEC 6.1)', () => {
  it('Math.round documenta half up para positivos', () => {
    expect(Math.round(49.5)).toBe(50);
    expect(Math.round(49.4)).toBe(49);
  });

  it('palpite sem registro (null) sempre zera', () => {
    const out = finalPoints({
      guess: null,
      result: { homeScore: 3, awayScore: 0 },
      phase: 'final',
      isBrazilMatch: true,
    });
    expect(out.final).toBe(0);
    expect(out.criterion).toBe('errado');
  });
});
