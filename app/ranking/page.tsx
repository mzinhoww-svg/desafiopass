import { Trophy } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

// Placeholder ate a Task 3.1 (Ranking geral).
export default function RankingPage() {
  return (
    <>
      <Header title="Ranking" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ranking" }]} />
      <main className="flex-1">
        <EmptyState icon={Trophy} title="Ranking em breve">
          O ranking geral entra na próxima etapa. Comece palpitando os jogos para
          somar pontos.
        </EmptyState>
      </main>
    </>
  );
}
