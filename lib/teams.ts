import { cache } from "react";
import { teams, type Team } from "@/lib/data/copa2026";
import { db } from "@/lib/db";
import { teams as teamsTable } from "@/drizzle/schema";

// Mapa codigo -> selecao (nome, flagCode) a partir do seed. Usado para exibir
// bandeiras/nomes sem ir ao banco. Placeholders de avanco tem flagCode vazio.
const map = new Map<string, Team>(teams.map((t) => [t.code, t]));

export function teamOf(code: string): Team {
  return map.get(code) ?? { code, name: code, flagCode: "" };
}

// Mapa código -> seleção a partir do BANCO (inclui seleções reais importadas da
// API, que não estão no seed). Cacheado por requisição. flagCode pode ser uma URL
// http() para seleções sem SVG local — o componente Flag desenha como <img>.
export const getTeamMap = cache(async (): Promise<Map<string, Team>> => {
  const rows = await db
    .select({
      code: teamsTable.code,
      name: teamsTable.name,
      flagCode: teamsTable.flagCode,
    })
    .from(teamsTable);
  return new Map(rows.map((r) => [r.code, r]));
});

// Resolve uma seleção pelo mapa do banco, com fallback no seed e, por fim, no
// próprio código (placeholder neutro). Use em telas que exibem partidas.
export function resolveTeam(map: Map<string, Team>, code: string): Team {
  return map.get(code) ?? teamOf(code);
}
