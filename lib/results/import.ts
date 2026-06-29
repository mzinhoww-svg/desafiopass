// lib/results/import.ts
//
// Importa o MATA-MATA REAL da Copa a partir da API pública (football-data.org),
// substituindo o chaveamento fictício do seed pelos confrontos reais. Usa o campo
// `stage` da API (LAST_32 em diante) e o `tla` de 3 letras como código da seleção.
//
// Seleções que não têm bandeira SVG local (/public/flags) usam a URL da bandeira
// da própria API (crest), guardada no campo flag_code — o componente Flag desenha
// URLs http() como <img> remoto. Assim qualquer seleção real aparece corretamente.
//
// CUIDADO: é destrutivo. Remove as partidas (e palpites) que não vierem da API.
// Pensado para rodar UMA vez, antes da divulgação, e a cada nova fase revelada.

import { notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { matches, predictions, teams } from "@/drizzle/schema";
import { fetchFixtures } from "@/lib/integrations/football-data";
import { stageToPhase } from "@/lib/results/sync";
import { teams as seedTeams } from "@/lib/data/copa2026";

// tla -> bandeira/nome do seed (quando temos SVG local e nome em pt-BR).
const seedByTla = new Map(
  seedTeams
    .filter((t) => t.flagCode)
    .map((t) => [t.code.toUpperCase(), t] as const),
);

export interface ImportSummary {
  skipped?: boolean;
  reason?: string;
  teams: number;
  matches: number;
  finished: number;
  removed: number;
  byPhase: Record<string, number>;
}

function statusFor(apiStatus: string): "agendada" | "ao_vivo" | "encerrada" {
  if (apiStatus === "FINISHED") return "encerrada";
  if (apiStatus === "IN_PLAY" || apiStatus === "PAUSED") return "ao_vivo";
  return "agendada";
}

export async function importKnockoutBracket(): Promise<ImportSummary> {
  const fixtures = await fetchFixtures();
  if (fixtures.length === 0) {
    return {
      skipped: true,
      reason: "Sem resposta da API (chave ausente ou erro de rede).",
      teams: 0,
      matches: 0,
      finished: 0,
      removed: 0,
      byPhase: {},
    };
  }

  // Só o mata-mata, e só confrontos com as duas seleções já definidas.
  const knockout = fixtures
    .filter((f) => stageToPhase(f.stage) !== null)
    .filter((f) => f.homeTla && f.awayTla)
    .sort((a, b) => (a.utcDate ?? "").localeCompare(b.utcDate ?? ""));

  if (knockout.length === 0) {
    return {
      skipped: true,
      reason:
        "A API ainda não traz jogos de mata-mata com as seleções definidas. " +
        "Tente de novo quando o chaveamento for sorteado.",
      teams: 0,
      matches: 0,
      finished: 0,
      removed: 0,
      byPhase: {},
    };
  }

  // 1) Upsert das seleções envolvidas (código = tla). Nome/bandeira do seed quando
  // existir; senão, nome e bandeira (URL) vindos da API.
  const teamByCode = new Map<
    string,
    { code: string; name: string; flagCode: string }
  >();
  for (const f of knockout) {
    for (const side of [
      { tla: f.homeTla, name: f.homeName, crest: f.homeCrest },
      { tla: f.awayTla, name: f.awayName, crest: f.awayCrest },
    ]) {
      const code = side.tla.toUpperCase();
      if (teamByCode.has(code)) continue;
      const seed = seedByTla.get(code);
      teamByCode.set(code, {
        code,
        name: seed?.name ?? side.name,
        flagCode: seed?.flagCode ?? side.crest ?? "",
      });
    }
  }
  for (const t of teamByCode.values()) {
    await db
      .insert(teams)
      .values(t)
      .onConflictDoUpdate({
        target: teams.code,
        set: { name: t.name, flagCode: t.flagCode },
      });
  }

  // 2) Upsert das partidas reais (id estável WC-<apiId>, ou WC-<tla>-<tla> de reserva).
  const keepIds: string[] = [];
  const byPhase: Record<string, number> = {};
  let finished = 0;
  for (const f of knockout) {
    const phase = stageToPhase(f.stage)!;
    const id = f.apiId
      ? `WC-${f.apiId}`
      : `WC-${f.homeTla}-${f.awayTla}-${f.stage}`;
    keepIds.push(id);
    byPhase[phase] = (byPhase[phase] ?? 0) + 1;

    const status = statusFor(f.status);
    const hasScore = f.homeScore != null && f.awayScore != null;
    if (status === "encerrada" && hasScore) finished++;

    const base = {
      phase,
      grp: null as string | null,
      homeCode: f.homeTla.toUpperCase(),
      awayCode: f.awayTla.toUpperCase(),
      stadium: f.venue ?? "A confirmar",
      kickoffAt: f.utcDate ? new Date(f.utcDate) : new Date(),
    };
    // Placar/status: só grava quando a API tem resultado/parcial; senão deixa em aberto.
    const scoreFields =
      hasScore && (status === "encerrada" || status === "ao_vivo")
        ? { homeScore: f.homeScore, awayScore: f.awayScore, status }
        : { status };

    await db
      .insert(matches)
      .values({ id, ...base, ...scoreFields })
      .onConflictDoUpdate({
        target: matches.id,
        // Em conflito, não rebaixa um jogo já encerrado por nós; atualiza agenda/seleções.
        set:
          status === "encerrada" && hasScore
            ? { ...base, homeScore: f.homeScore, awayScore: f.awayScore, status }
            : base,
      });
  }

  // 3) Remove o que sobrou do chaveamento fictício (e os palpites órfãos). Sem
  // cascade em predictions.match_id, então apaga os palpites primeiro.
  await db.delete(predictions).where(notInArray(predictions.matchId, keepIds));
  const removedRows = await db
    .delete(matches)
    .where(notInArray(matches.id, keepIds))
    .returning({ id: matches.id });
  // As seleções extras do seed (eliminadas/placeholders) ficam na tabela sem
  // causar dano: dropdowns leem do seed e o display tem fallback. Não removemos.

  return {
    teams: teamByCode.size,
    matches: keepIds.length,
    finished,
    removed: removedRows.length,
    byPhase,
  };
}
