import { BrandBar } from "@/components/brand-bar";

/*
 * Kit de skeletons (placeholders de carregamento) — usado nos loading.tsx das
 * rotas (Suspense do App Router). 100% CSS (animate-pulse), sem JS no cliente,
 * entao nao compromete o desempenho: aparece na hora e some quando os dados chegam.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />;
}

// Cabecalho de marca estatico (sem buscar usuario) para as telas de loading.
export function SkeletonHeader() {
  return (
    <header
      className="relative overflow-hidden px-5 py-4 text-white"
      style={{ background: "var(--grad-deep)" }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="h-4 w-32 animate-pulse rounded bg-white/25" />
          <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-white/15" />
        </div>
        <div className="h-9 w-9 flex-none animate-pulse rounded-full bg-white/15" />
      </div>
      <BrandBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}

// Card de jogo (espelha o match-card): selos no topo, placar e rodape.
export function SkeletonMatchCard() {
  return (
    <div className="rounded-2xl border border-black/10 bg-paper p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-10" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

// Linha de lista (ranking, ligas, comunidade).
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-10" />
    </div>
  );
}
