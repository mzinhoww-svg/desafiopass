// reference-code/lib/data/copa2026.ts
//
// Seed estatico da Copa do Mundo 2026, fase mata-mata. Implementa
// specs/DATA_SPEC.md secao 6.
//
// Fonte do chaveamento: ge.globo.com (confrontos e datas reais da segunda fase).
// Horarios convertidos de Brasilia (UTC-3) para UTC. kickoffAt sempre em UTC.
//
// Bandeiras: assets SVG reais (biblioteca flag-icons), servidos de /public/flags.
// O campo flagCode e o codigo do arquivo SVG (ex 'br' -> /flags/br.svg). NUNCA emoji.
// Placeholders de avanco tem flagCode vazio; a UI mostra um escudo neutro.
//
// Estrutura:
// - 16avos: 16 jogos com selecoes reais. Inclui Brasil x Japao (multiplicador x2).
// - oitavas, quartas, semi, terceiro, final: chaveamento fixo com placeholders.
//
// Estadios: 'A confirmar'; nao constavam na fonte.

export interface Team {
  code: string;
  name: string;
  flagCode: string; // codigo do SVG em /public/flags (ex 'br'); vazio para placeholder
}

export interface SeedMatch {
  id: string;
  phase: 'grupos' | '16avos' | 'oitavas' | 'quartas' | 'semi' | 'terceiro' | 'final';
  grp: string | null;
  homeCode: string;
  awayCode: string;
  stadium: string;
  kickoffAt: string; // ISO 8601 em UTC
}

export const teams: Team[] = [
  { code: "BRA", name: "Brasil", flagCode: "br" },
  { code: "JPN", name: "Japao", flagCode: "jp" },
  { code: "GER", name: "Alemanha", flagCode: "de" },
  { code: "PAR", name: "Paraguai", flagCode: "py" },
  { code: "FRA", name: "Franca", flagCode: "fr" },
  { code: "SWE", name: "Suecia", flagCode: "se" },
  { code: "RSA", name: "Africa do Sul", flagCode: "za" },
  { code: "CAN", name: "Canada", flagCode: "ca" },
  { code: "NED", name: "Holanda", flagCode: "nl" },
  { code: "MAR", name: "Marrocos", flagCode: "ma" },
  { code: "POR", name: "Portugal", flagCode: "pt" },
  { code: "CRO", name: "Croacia", flagCode: "hr" },
  { code: "ESP", name: "Espanha", flagCode: "es" },
  { code: "AUT", name: "Austria", flagCode: "at" },
  { code: "USA", name: "Estados Unidos", flagCode: "us" },
  { code: "BIH", name: "Bosnia", flagCode: "ba" },
  { code: "BEL", name: "Belgica", flagCode: "be" },
  { code: "SEN", name: "Senegal", flagCode: "sn" },
  { code: "CIV", name: "Costa do Marfim", flagCode: "ci" },
  { code: "NOR", name: "Noruega", flagCode: "no" },
  { code: "MEX", name: "Mexico", flagCode: "mx" },
  { code: "ECU", name: "Equador", flagCode: "ec" },
  { code: "ENG", name: "Inglaterra", flagCode: "gb-eng" },
  { code: "COD", name: "RD Congo", flagCode: "cd" },
  { code: "ARG", name: "Argentina", flagCode: "ar" },
  { code: "CPV", name: "Cabo Verde", flagCode: "cv" },
  { code: "AUS", name: "Australia", flagCode: "au" },
  { code: "EGY", name: "Egito", flagCode: "eg" },
  { code: "SUI", name: "Suica", flagCode: "ch" },
  { code: "ALG", name: "Argelia", flagCode: "dz" },
  { code: "COL", name: "Colombia", flagCode: "co" },
  { code: "GHA", name: "Gana", flagCode: "gh" },
  { code: "W_R32_1", name: "Vencedor 16 avos 1", flagCode: "" },
  { code: "W_R32_2", name: "Vencedor 16 avos 2", flagCode: "" },
  { code: "W_R32_3", name: "Vencedor 16 avos 3", flagCode: "" },
  { code: "W_R32_4", name: "Vencedor 16 avos 4", flagCode: "" },
  { code: "W_R32_5", name: "Vencedor 16 avos 5", flagCode: "" },
  { code: "W_R32_6", name: "Vencedor 16 avos 6", flagCode: "" },
  { code: "W_R32_7", name: "Vencedor 16 avos 7", flagCode: "" },
  { code: "W_R32_8", name: "Vencedor 16 avos 8", flagCode: "" },
  { code: "W_R32_9", name: "Vencedor 16 avos 9", flagCode: "" },
  { code: "W_R32_10", name: "Vencedor 16 avos 10", flagCode: "" },
  { code: "W_R32_11", name: "Vencedor 16 avos 11", flagCode: "" },
  { code: "W_R32_12", name: "Vencedor 16 avos 12", flagCode: "" },
  { code: "W_R32_13", name: "Vencedor 16 avos 13", flagCode: "" },
  { code: "W_R32_14", name: "Vencedor 16 avos 14", flagCode: "" },
  { code: "W_R32_15", name: "Vencedor 16 avos 15", flagCode: "" },
  { code: "W_R32_16", name: "Vencedor 16 avos 16", flagCode: "" },
  { code: "W_R16_1", name: "Vencedor Oitavas 1", flagCode: "" },
  { code: "W_R16_2", name: "Vencedor Oitavas 2", flagCode: "" },
  { code: "W_R16_3", name: "Vencedor Oitavas 3", flagCode: "" },
  { code: "W_R16_4", name: "Vencedor Oitavas 4", flagCode: "" },
  { code: "W_R16_5", name: "Vencedor Oitavas 5", flagCode: "" },
  { code: "W_R16_6", name: "Vencedor Oitavas 6", flagCode: "" },
  { code: "W_R16_7", name: "Vencedor Oitavas 7", flagCode: "" },
  { code: "W_R16_8", name: "Vencedor Oitavas 8", flagCode: "" },
  { code: "W_QF_1", name: "Vencedor Quartas 1", flagCode: "" },
  { code: "W_QF_2", name: "Vencedor Quartas 2", flagCode: "" },
  { code: "W_QF_3", name: "Vencedor Quartas 3", flagCode: "" },
  { code: "W_QF_4", name: "Vencedor Quartas 4", flagCode: "" },
  { code: "W_SF_1", name: "Vencedor Semifinal 1", flagCode: "" },
  { code: "W_SF_2", name: "Vencedor Semifinal 2", flagCode: "" },
  { code: "L_SF_1", name: "Perdedor Semifinal 1", flagCode: "" },
  { code: "L_SF_2", name: "Perdedor Semifinal 2", flagCode: "" },
];

export const matches: SeedMatch[] = [
  { id: "R32-01", phase: "16avos", grp: null, homeCode: "GER", awayCode: "PAR", stadium: "A confirmar", kickoffAt: "2026-06-29T20:30:00Z" },
  { id: "R32-02", phase: "16avos", grp: null, homeCode: "FRA", awayCode: "SWE", stadium: "A confirmar", kickoffAt: "2026-06-30T21:00:00Z" },
  { id: "R32-03", phase: "16avos", grp: null, homeCode: "RSA", awayCode: "CAN", stadium: "A confirmar", kickoffAt: "2026-06-28T19:00:00Z" },
  { id: "R32-04", phase: "16avos", grp: null, homeCode: "NED", awayCode: "MAR", stadium: "A confirmar", kickoffAt: "2026-06-30T01:00:00Z" },
  { id: "R32-05", phase: "16avos", grp: null, homeCode: "POR", awayCode: "CRO", stadium: "A confirmar", kickoffAt: "2026-07-02T23:00:00Z" },
  { id: "R32-06", phase: "16avos", grp: null, homeCode: "ESP", awayCode: "AUT", stadium: "A confirmar", kickoffAt: "2026-07-02T19:00:00Z" },
  { id: "R32-07", phase: "16avos", grp: null, homeCode: "USA", awayCode: "BIH", stadium: "A confirmar", kickoffAt: "2026-07-02T00:00:00Z" },
  { id: "R32-08", phase: "16avos", grp: null, homeCode: "BEL", awayCode: "SEN", stadium: "A confirmar", kickoffAt: "2026-07-01T20:00:00Z" },
  { id: "R32-09", phase: "16avos", grp: null, homeCode: "BRA", awayCode: "JPN", stadium: "A confirmar", kickoffAt: "2026-06-29T17:00:00Z" },
  { id: "R32-10", phase: "16avos", grp: null, homeCode: "CIV", awayCode: "NOR", stadium: "A confirmar", kickoffAt: "2026-06-30T17:00:00Z" },
  { id: "R32-11", phase: "16avos", grp: null, homeCode: "MEX", awayCode: "ECU", stadium: "A confirmar", kickoffAt: "2026-07-01T01:00:00Z" },
  { id: "R32-12", phase: "16avos", grp: null, homeCode: "ENG", awayCode: "COD", stadium: "A confirmar", kickoffAt: "2026-07-01T16:00:00Z" },
  { id: "R32-13", phase: "16avos", grp: null, homeCode: "ARG", awayCode: "CPV", stadium: "A confirmar", kickoffAt: "2026-07-03T22:00:00Z" },
  { id: "R32-14", phase: "16avos", grp: null, homeCode: "AUS", awayCode: "EGY", stadium: "A confirmar", kickoffAt: "2026-07-03T18:00:00Z" },
  { id: "R32-15", phase: "16avos", grp: null, homeCode: "SUI", awayCode: "ALG", stadium: "A confirmar", kickoffAt: "2026-07-03T03:00:00Z" },
  { id: "R32-16", phase: "16avos", grp: null, homeCode: "COL", awayCode: "GHA", stadium: "A confirmar", kickoffAt: "2026-07-04T01:30:00Z" },
  // Oitavas reais (mapeadas pelas datas oficiais da API). A ordem dos slots segue
  // o chaveamento fictício (advancement) -> os cruzamentos das quartas em diante
  // são os prováveis a partir daqui.
  { id: "R16-01", phase: "oitavas", grp: null, homeCode: "PAR", awayCode: "FRA", stadium: "A confirmar", kickoffAt: "2026-07-04T21:00:00Z" },
  { id: "R16-02", phase: "oitavas", grp: null, homeCode: "CAN", awayCode: "MAR", stadium: "A confirmar", kickoffAt: "2026-07-04T17:00:00Z" },
  { id: "R16-03", phase: "oitavas", grp: null, homeCode: "POR", awayCode: "ESP", stadium: "A confirmar", kickoffAt: "2026-07-06T19:00:00Z" },
  { id: "R16-04", phase: "oitavas", grp: null, homeCode: "USA", awayCode: "BEL", stadium: "A confirmar", kickoffAt: "2026-07-07T00:00:00Z" },
  { id: "R16-05", phase: "oitavas", grp: null, homeCode: "BRA", awayCode: "NOR", stadium: "A confirmar", kickoffAt: "2026-07-05T20:00:00Z" },
  { id: "R16-06", phase: "oitavas", grp: null, homeCode: "MEX", awayCode: "ENG", stadium: "A confirmar", kickoffAt: "2026-07-06T00:00:00Z" },
  { id: "R16-07", phase: "oitavas", grp: null, homeCode: "ARG", awayCode: "EGY", stadium: "A confirmar", kickoffAt: "2026-07-07T16:00:00Z" },
  { id: "R16-08", phase: "oitavas", grp: null, homeCode: "SUI", awayCode: "COL", stadium: "A confirmar", kickoffAt: "2026-07-07T20:00:00Z" },
  { id: "QF-01", phase: "quartas", grp: null, homeCode: "W_R16_1", awayCode: "W_R16_2", stadium: "A confirmar", kickoffAt: "2026-07-09T20:00:00Z" },
  { id: "QF-02", phase: "quartas", grp: null, homeCode: "W_R16_3", awayCode: "W_R16_4", stadium: "A confirmar", kickoffAt: "2026-07-10T19:00:00Z" },
  { id: "QF-03", phase: "quartas", grp: null, homeCode: "W_R16_5", awayCode: "W_R16_6", stadium: "A confirmar", kickoffAt: "2026-07-11T21:00:00Z" },
  { id: "QF-04", phase: "quartas", grp: null, homeCode: "W_R16_7", awayCode: "W_R16_8", stadium: "A confirmar", kickoffAt: "2026-07-12T01:00:00Z" },
  { id: "SF-01", phase: "semi", grp: null, homeCode: "W_QF_1", awayCode: "W_QF_2", stadium: "A confirmar", kickoffAt: "2026-07-14T19:00:00Z" },
  { id: "SF-02", phase: "semi", grp: null, homeCode: "W_QF_3", awayCode: "W_QF_4", stadium: "A confirmar", kickoffAt: "2026-07-15T19:00:00Z" },
  { id: "TF-01", phase: "terceiro", grp: null, homeCode: "L_SF_1", awayCode: "L_SF_2", stadium: "A confirmar", kickoffAt: "2026-07-18T21:00:00Z" },
  { id: "FN-01", phase: "final", grp: null, homeCode: "W_SF_1", awayCode: "W_SF_2", stadium: "A confirmar", kickoffAt: "2026-07-19T19:00:00Z" },
];

// Mapa de avanco do chaveamento. A chave e o code placeholder de uma fase seguinte;
// o valor diz de qual partida e qual resultado (vencedor/perdedor) ele vem. Usado pelo
// admin para propor o preenchimento do confronto seguinte ao encerrar um jogo. No MVP e
// referencia; avanco automatico e item de backlog.
export const advancement: Record<string, { fromMatch: string; takes: 'winner' | 'loser' }> = {
  W_R32_1: { fromMatch: 'R32-01', takes: 'winner' },
  W_R32_2: { fromMatch: 'R32-02', takes: 'winner' },
  W_R32_3: { fromMatch: 'R32-03', takes: 'winner' },
  W_R32_4: { fromMatch: 'R32-04', takes: 'winner' },
  W_R32_5: { fromMatch: 'R32-05', takes: 'winner' },
  W_R32_6: { fromMatch: 'R32-06', takes: 'winner' },
  W_R32_7: { fromMatch: 'R32-07', takes: 'winner' },
  W_R32_8: { fromMatch: 'R32-08', takes: 'winner' },
  W_R32_9: { fromMatch: 'R32-09', takes: 'winner' },
  W_R32_10: { fromMatch: 'R32-10', takes: 'winner' },
  W_R32_11: { fromMatch: 'R32-11', takes: 'winner' },
  W_R32_12: { fromMatch: 'R32-12', takes: 'winner' },
  W_R32_13: { fromMatch: 'R32-13', takes: 'winner' },
  W_R32_14: { fromMatch: 'R32-14', takes: 'winner' },
  W_R32_15: { fromMatch: 'R32-15', takes: 'winner' },
  W_R32_16: { fromMatch: 'R32-16', takes: 'winner' },
  W_R16_1: { fromMatch: 'R16-01', takes: 'winner' },
  W_R16_2: { fromMatch: 'R16-02', takes: 'winner' },
  W_R16_3: { fromMatch: 'R16-03', takes: 'winner' },
  W_R16_4: { fromMatch: 'R16-04', takes: 'winner' },
  W_R16_5: { fromMatch: 'R16-05', takes: 'winner' },
  W_R16_6: { fromMatch: 'R16-06', takes: 'winner' },
  W_R16_7: { fromMatch: 'R16-07', takes: 'winner' },
  W_R16_8: { fromMatch: 'R16-08', takes: 'winner' },
  W_QF_1: { fromMatch: 'QF-01', takes: 'winner' },
  W_QF_2: { fromMatch: 'QF-02', takes: 'winner' },
  W_QF_3: { fromMatch: 'QF-03', takes: 'winner' },
  W_QF_4: { fromMatch: 'QF-04', takes: 'winner' },
  W_SF_1: { fromMatch: 'SF-01', takes: 'winner' },
  W_SF_2: { fromMatch: 'SF-02', takes: 'winner' },
  L_SF_1: { fromMatch: 'SF-01', takes: 'loser' },
  L_SF_2: { fromMatch: 'SF-02', takes: 'loser' },
};