import { teams, type Team } from "@/lib/data/copa2026";

// Mapa codigo -> selecao (nome, flagCode) a partir do seed. Usado para exibir
// bandeiras/nomes sem ir ao banco. Placeholders de avanco tem flagCode vazio.
const map = new Map<string, Team>(teams.map((t) => [t.code, t]));

export function teamOf(code: string): Team {
  return map.get(code) ?? { code, name: code, flagCode: "" };
}
