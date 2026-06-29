// lib/integrations/football-data.ts
//
// Cliente mínimo da API pública football-data.org (free tier) para buscar os
// jogos da competição configurada. Não lança: em falta de chave ou erro, retorna
// lista vazia e registra. A chave vem de FOOTBALL_DATA_API_KEY (env na Vercel).
//
// Env:
//   FOOTBALL_DATA_API_KEY        chave da API
//   FOOTBALL_DATA_COMPETITION    código da competição (default "WC" = Copa do Mundo)
//   FOOTBALL_DATA_SEASON         ano da temporada (opcional)

export interface Fixture {
  apiId: number | null; // id da partida na API (para id estável WC-<id>)
  homeTla: string;
  awayTla: string;
  homeName: string; // nome oficial da seleção (API)
  awayName: string;
  homeCrest: string | null; // URL da bandeira (API), usado quando não há SVG local
  awayCrest: string | null;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  stage: string; // GROUP_STAGE | LAST_32 | LAST_16 | QUARTER_FINALS | SEMI_FINALS | THIRD_PLACE | FINAL
  homeScore: number | null;
  awayScore: number | null;
  utcDate: string | null; // horário oficial (ISO UTC)
  venue: string | null; // estádio
}

export async function fetchFixtures(): Promise<Fixture[]> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    console.warn("[football-data] FOOTBALL_DATA_API_KEY ausente; sync ignorado");
    return [];
  }
  const comp = process.env.FOOTBALL_DATA_COMPETITION ?? "WC";
  const season = process.env.FOOTBALL_DATA_SEASON;
  const url =
    `https://api.football-data.org/v4/competitions/${comp}/matches` +
    (season ? `?season=${encodeURIComponent(season)}` : "");

  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": key },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[football-data] HTTP", res.status, await res.text());
      return [];
    }
    const data = (await res.json()) as {
      matches?: Array<{
        id?: number | null;
        status: string;
        stage?: string | null;
        utcDate?: string | null;
        venue?: string | null;
        homeTeam?: { tla?: string | null; name?: string | null; crest?: string | null };
        awayTeam?: { tla?: string | null; name?: string | null; crest?: string | null };
        score?: { fullTime?: { home: number | null; away: number | null } };
      }>;
    };
    const out: Fixture[] = [];
    for (const m of data.matches ?? []) {
      const homeTla = m.homeTeam?.tla ?? "";
      const awayTla = m.awayTeam?.tla ?? "";
      if (!homeTla || !awayTla) continue;
      out.push({
        apiId: m.id ?? null,
        homeTla: homeTla.toUpperCase(),
        awayTla: awayTla.toUpperCase(),
        homeName: m.homeTeam?.name ?? homeTla.toUpperCase(),
        awayName: m.awayTeam?.name ?? awayTla.toUpperCase(),
        homeCrest: m.homeTeam?.crest ?? null,
        awayCrest: m.awayTeam?.crest ?? null,
        status: m.status,
        stage: m.stage ?? "",
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
        utcDate: m.utcDate ?? null,
        venue: m.venue ?? null,
      });
    }
    return out;
  } catch (e) {
    console.error("[football-data] falha de rede:", e);
    return [];
  }
}

// Nome do artilheiro líder da competição (#2), via endpoint /scorers. Null se
// indisponível.
export async function fetchTopScorer(): Promise<string | null> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return null;
  const comp = process.env.FOOTBALL_DATA_COMPETITION ?? "WC";
  const season = process.env.FOOTBALL_DATA_SEASON;
  const url =
    `https://api.football-data.org/v4/competitions/${comp}/scorers?limit=1` +
    (season ? `&season=${encodeURIComponent(season)}` : "");
  try {
    const res = await fetch(url, {
      headers: { "X-Auth-Token": key },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[football-data] scorers HTTP", res.status);
      return null;
    }
    const data = (await res.json()) as {
      scorers?: Array<{ player?: { name?: string } }>;
    };
    return data.scorers?.[0]?.player?.name ?? null;
  } catch (e) {
    console.error("[football-data] scorers falha:", e);
    return null;
  }
}
