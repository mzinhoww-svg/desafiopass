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
  homeTla: string;
  awayTla: string;
  status: string; // SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | ...
  homeScore: number | null;
  awayScore: number | null;
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
        status: string;
        homeTeam?: { tla?: string | null };
        awayTeam?: { tla?: string | null };
        score?: { fullTime?: { home: number | null; away: number | null } };
      }>;
    };
    const out: Fixture[] = [];
    for (const m of data.matches ?? []) {
      const homeTla = m.homeTeam?.tla ?? "";
      const awayTla = m.awayTeam?.tla ?? "";
      if (!homeTla || !awayTla) continue;
      out.push({
        homeTla: homeTla.toUpperCase(),
        awayTla: awayTla.toUpperCase(),
        status: m.status,
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
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
