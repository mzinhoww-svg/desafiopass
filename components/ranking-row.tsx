import type { RankRow } from "@/lib/queries/ranking";

/*
 * Linha do ranking (DESIGN_SPEC 6, wireframe tela 6). Lista densa, sem card por
 * linha. Top 3 com badge ouro/prata/bronze. Linha do usuario logado realcada em
 * lima suave (estado, nao posicao). Pontos em peso 800.
 */
export function RankingRow({ row }: { row: RankRow }) {
  const badge =
    row.position === 1
      ? "bg-rank-gold text-indigo-deep"
      : row.position === 2
        ? "bg-rank-silver text-indigo-deep"
        : row.position === 3
          ? "bg-rank-bronze text-white"
          : "bg-cloud text-indigo";
  const positionLabel = row.position ?? "—";

  return (
    <div
      className={`flex items-center gap-3 px-2 py-3 ${
        row.isCurrentUser ? "rounded-xl bg-lime/20" : "border-b border-black/5"
      }`}
    >
      <span
        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-sm font-bold ${badge}`}
      >
        {positionLabel}
      </span>
      <span className="t-body flex-1 font-medium text-ink">
        {row.nickname}
        {row.isCurrentUser ? " (você)" : ""}
      </span>
      <span className="t-body font-extrabold text-indigo">
        {row.points.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}
