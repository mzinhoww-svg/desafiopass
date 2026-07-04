// lib/results/open-oitavas.ts
//
// Abre o chaveamento das OITAVAS em diante (oitavas → quartas → semi → 3º → final)
// SEM tocar nos 16avos (preserva palpites/pontos já feitos). Não apaga nada.
//
// - Oitavas (R16-*): upsert com as seleções reais (do seed), sem mexer em placar/status.
// - Quartas/semi/3º/final: cria só se ainda não existir (onConflictDoNothing), para
//   não sobrescrever times já propagados. São placeholders (cruzamentos prováveis)
//   até os jogos definirem quem avança.

import { ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, teams } from "@/drizzle/schema";
import {
  teams as seedTeams,
  matches as seedMatches,
} from "@/lib/data/copa2026";

const OITAVAS = new Set(["oitavas"]);
const LATER = new Set(["quartas", "semi", "terceiro", "final"]);

export interface OpenBracketSummary {
  oitavas: number;
  later: number;
}

export async function openOitavasBracket(): Promise<OpenBracketSummary> {
  const bracket = seedMatches.filter(
    (m) => OITAVAS.has(m.phase) || LATER.has(m.phase),
  );

  // 1) Garante que todas as seleções/placeholders referenciados existam.
  const codes = new Set<string>();
  for (const m of bracket) {
    codes.add(m.homeCode);
    codes.add(m.awayCode);
  }
  const seedByCode = new Map(seedTeams.map((t) => [t.code, t]));
  for (const code of codes) {
    const t = seedByCode.get(code);
    if (!t) continue;
    await db
      .insert(teams)
      .values({ code: t.code, name: t.name, flagCode: t.flagCode })
      .onConflictDoUpdate({
        target: teams.code,
        set: { name: t.name, flagCode: t.flagCode },
      });
  }

  // 2) Oitavas: upsert com as seleções reais. Não mexe em placar/status (jogos
  //    ainda não começaram; se algum já estiver encerrado, não sobrescreve).
  let oitavas = 0;
  for (const m of bracket.filter((m) => OITAVAS.has(m.phase))) {
    await db
      .insert(matches)
      .values({
        id: m.id,
        phase: m.phase,
        grp: m.grp,
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        stadium: m.stadium,
        kickoffAt: new Date(m.kickoffAt),
      })
      .onConflictDoUpdate({
        target: matches.id,
        // Só atualiza seleções/agenda em jogos ainda não encerrados.
        set: {
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          stadium: m.stadium,
          kickoffAt: new Date(m.kickoffAt),
        },
        setWhere: ne(matches.status, "encerrada"),
      });
    oitavas++;
  }

  // 3) Quartas/semi/3º/final: cria só se ainda não existir (não sobrescreve
  //    times já propagados). Placeholders = cruzamentos prováveis até a final.
  let later = 0;
  for (const m of bracket.filter((m) => LATER.has(m.phase))) {
    const res = await db
      .insert(matches)
      .values({
        id: m.id,
        phase: m.phase,
        grp: m.grp,
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        stadium: m.stadium,
        kickoffAt: new Date(m.kickoffAt),
      })
      .onConflictDoNothing({ target: matches.id })
      .returning({ id: matches.id });
    if (res.length > 0) later++;
  }

  return { oitavas, later };
}
