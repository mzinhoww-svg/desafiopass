// lib/results/sync.ts
//
// Sincroniza resultados da API pública (football-data.org) com as nossas partidas
// (#1/#6). Casa por código de 3 letras (tla) das seleções, respeitando a
// orientação mandante/visitante. Jogos FINISHED que ainda não encerramos: aplica
// o resultado (pontua + avança chaveamento + notifica). IN_PLAY/PAUSED: placar ao
// vivo. Conservador: só age quando há correspondência única e clara.

import { getAllMatches } from "@/lib/queries/matches";
import {
  fetchFixtures,
  fetchTopScorer,
  type Fixture,
} from "@/lib/integrations/football-data";
import { applyResult, setLiveScore, updateSchedule } from "@/lib/results/apply";
import { applySpecialResults } from "@/lib/results/special";

export interface SyncSummary {
  finished: number;
  live: number;
  rescheduled: number;
  specialApplied?: boolean;
  skipped?: boolean;
}

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export async function syncResults(): Promise<SyncSummary> {
  const fixtures = await fetchFixtures();
  if (fixtures.length === 0)
    return { finished: 0, live: 0, rescheduled: 0, skipped: true };

  const all = await getAllMatches();
  // Index das nossas partidas ainda não encerradas, por par de códigos.
  const open = all.filter((m) => m.status !== "encerrada");
  const byPair = new Map<string, (typeof open)[number]>();
  for (const m of open) {
    byPair.set(pairKey(m.homeCode.toUpperCase(), m.awayCode.toUpperCase()), m);
  }

  // Resolve o placar na ORIENTAÇÃO da nossa partida (mandante/visitante).
  const oriented = (m: { homeCode: string }, f: Fixture) =>
    m.homeCode.toUpperCase() === f.homeTla
      ? { home: f.homeScore as number, away: f.awayScore as number }
      : { home: f.awayScore as number, away: f.homeScore as number };

  let finished = 0;
  let live = 0;
  let rescheduled = 0;

  // Diagnóstico: total e amostra dos códigos retornados pela API vs os nossos.
  console.log(
    "[sync] fixtures=%d. amostra API: %s | nossos pares: %s",
    fixtures.length,
    fixtures.slice(0, 6).map((f) => `${f.homeTla}-${f.awayTla}(${f.status})`).join(", "),
    [...byPair.keys()].slice(0, 6).join(", "),
  );

  for (const f of fixtures) {
    const m = byPair.get(pairKey(f.homeTla, f.awayTla));
    if (!m) {
      if (f.status === "FINISHED") {
        console.log("[sync] sem match p/ FINISHED %s-%s", f.homeTla, f.awayTla);
      }
      continue;
    }

    if (f.status === "FINISHED" && f.homeScore != null && f.awayScore != null) {
      const s = oriented(m, f);
      const r = await applyResult(m.id, s.home, s.away);
      if (r) finished++;
    } else if (
      (f.status === "IN_PLAY" || f.status === "PAUSED") &&
      f.homeScore != null &&
      f.awayScore != null
    ) {
      const s = oriented(m, f);
      await setLiveScore(m.id, s.home, s.away);
      live++;
    } else if (f.status === "SCHEDULED" || f.status === "TIMED") {
      // Corrige horário e/ou estádio oficiais do jogo agendado (o prazo acompanha).
      const fields: { kickoffAt?: Date; stadium?: string } = {};
      if (f.utcDate) {
        const apiDate = new Date(f.utcDate);
        if (
          !Number.isNaN(apiDate.getTime()) &&
          apiDate.getTime() !== new Date(m.kickoffAt).getTime()
        ) {
          fields.kickoffAt = apiDate;
        }
      }
      if (f.venue && f.venue !== m.stadium) {
        fields.stadium = f.venue;
      }
      if (Object.keys(fields).length > 0) {
        await updateSchedule(m.id, fields);
        rescheduled++;
      }
    }
  }

  // Resultado oficial dos especiais (#2): quando a FINAL terminar, define o
  // campeão (vencedor da final) e o artilheiro (líder em /scorers) e recalcula.
  let specialApplied = false;
  const refreshed = await getAllMatches();
  const final = refreshed.find(
    (m) => m.phase === "final" && m.status === "encerrada",
  );
  if (
    final &&
    final.homeScore != null &&
    final.awayScore != null &&
    final.homeScore !== final.awayScore
  ) {
    const champion =
      final.homeScore > final.awayScore ? final.homeCode : final.awayCode;
    const topScorer = await fetchTopScorer();
    await applySpecialResults({ champion, topScorer });
    specialApplied = true;
  }

  return { finished, live, rescheduled, specialApplied };
}
