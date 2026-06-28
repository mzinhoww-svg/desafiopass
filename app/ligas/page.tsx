import { Users } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";

// Placeholder ate o Slice 4 (Ligas privadas). Rota protegida por login (middleware).
export default function LigasPage() {
  return (
    <>
      <Header title="Ligas" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ligas" }]} />
      <main className="flex-1">
        <EmptyState icon={Users} title="Ligas em breve">
          Em breve você poderá criar uma liga privada e disputar o ranking só com os
          seus amigos.
        </EmptyState>
      </main>
    </>
  );
}
