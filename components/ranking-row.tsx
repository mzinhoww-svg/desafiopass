/* eslint-disable @next/next/no-img-element */
import type { RankRow } from "@/lib/queries/ranking";
import { getLocale, tr } from "@/lib/i18n";

/*
 * Linha do ranking (DESIGN_SPEC 6, wireframe tela 6). Lista densa, sem card por
 * linha. Top 3 com badge ouro/prata/bronze. Linha do usuario logado realcada em
 * lima suave (estado, nao posicao). Pontos em peso 800. Avatar (ou iniciais) a
 * esquerda do apelido.
 */
export async function RankingRow({ row }: { row: RankRow }) {
  const locale = await getLocale();
  const badge =
    row.position === 1
      ? "bg-rank-gold text-indigo-deep"
      : row.position === 2
        ? "bg-rank-silver text-indigo-deep"
        : row.position === 3
          ? "bg-rank-bronze text-white"
          : "bg-cloud text-indigo";
  const positionLabel = row.position ?? "—";
  const initials = row.nickname.trim().slice(0, 2).toUpperCase();

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
      <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full bg-cloud text-xs font-bold text-indigo">
        {row.avatarUrl ? (
          <img
            src={row.avatarUrl}
            alt={row.nickname}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
      <span className="t-body flex-1 font-medium text-ink">
        {row.nickname}
        {row.isCurrentUser ? tr(locale, " (você)", " (tú)") : ""}
      </span>
      <span className="t-body font-extrabold text-indigo">
        {row.points.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}
