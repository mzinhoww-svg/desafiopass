import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserLeagues } from "@/lib/queries/leagues";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CreateLeagueForm } from "./create-league-form";
import { JoinForm } from "./join-form";

// /ligas (Task 4.1/4.3): liga publica (link p/ ranking geral) + minhas ligas
// privadas, criar liga e entrar por convite.
export default async function LigasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const myLeagues = await getUserLeagues(user.id);

  return (
    <>
      <Header title="Ligas" subtitle="Copa 2026 · Mata-mata" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ligas" }]} />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <LinkButton href="/ranking" variant="secondary" className="w-full">
          <Trophy size={18} strokeWidth={2.5} aria-hidden="true" />
          Ranking geral (liga pública)
        </LinkButton>

        <div>
          <p className="t-kicker mb-2 text-indigo">Minhas ligas</p>
          {myLeagues.length === 0 ? (
            <p className="t-body text-muted">
              Você ainda não entrou em nenhuma liga privada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {myLeagues.map(({ league, members }) => (
                <Link
                  key={league.id}
                  href={`/ligas/${league.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-paper p-3"
                >
                  <span>
                    <span className="t-card-title text-indigo">{league.name}</span>
                    <span className="t-caption block text-muted">
                      {members} participante(s)
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-muted" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <Card>
          <p className="t-kicker mb-2 text-indigo">Criar liga</p>
          <CreateLeagueForm />
        </Card>

        <Card>
          <p className="t-kicker mb-2 text-indigo">Entrar em uma liga</p>
          <JoinForm />
        </Card>

        <p className="t-caption text-muted">
          Plano básico: 1 liga. Sócio LATAM Pass: até 100 (em breve).
        </p>
      </main>
    </>
  );
}
