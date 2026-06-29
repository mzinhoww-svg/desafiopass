import type { CommunityPrediction } from "@/lib/queries/matches";

/*
 * Termômetro da comunidade (#2): probabilidades implícitas a partir dos próprios
 * palpites — sem API, sem aposta. Mostra % de palpites em vitória mandante /
 * empate / vitória visitante e o placar mais palpitado.
 */
export function CommunityStats({
  predictions,
  homeCode,
  awayCode,
}: {
  predictions: CommunityPrediction[];
  homeCode: string;
  awayCode: string;
}) {
  const total = predictions.length;
  if (total === 0) return null;

  let home = 0;
  let draw = 0;
  let away = 0;
  const scoreCount = new Map<string, number>();
  for (const p of predictions) {
    if (p.homeGuess > p.awayGuess) home++;
    else if (p.homeGuess < p.awayGuess) away++;
    else draw++;
    const key = `${p.homeGuess} x ${p.awayGuess}`;
    scoreCount.set(key, (scoreCount.get(key) ?? 0) + 1);
  }
  const pct = (n: number) => Math.round((n / total) * 100);
  const top = [...scoreCount.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="mb-3 rounded-2xl border border-black/10 bg-paper p-3">
      <p className="t-kicker mb-2 text-indigo">Termômetro da comunidade</p>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-cloud">
        <span style={{ width: `${pct(home)}%` }} className="bg-indigo" />
        <span style={{ width: `${pct(draw)}%` }} className="bg-muted" />
        <span style={{ width: `${pct(away)}%` }} className="bg-rose" />
      </div>
      <div className="mt-2 flex justify-between text-[0.6875rem] font-bold">
        <span className="text-indigo">{homeCode} {pct(home)}%</span>
        <span className="text-muted">Empate {pct(draw)}%</span>
        <span className="text-rose">{awayCode} {pct(away)}%</span>
      </div>
      {top ? (
        <p className="t-caption mt-2 text-muted">
          Placar mais palpitado: <strong className="text-ink">{top[0]}</strong>{" "}
          ({top[1]} de {total})
        </p>
      ) : null}
    </div>
  );
}
