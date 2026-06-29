import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLeagueById, isMember } from "@/lib/queries/leagues";
import { getLeagueRanking } from "@/lib/queries/ranking";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { RankingRow } from "@/components/ranking-row";
import { ShareButton } from "@/components/share-button";
import { InviteLink } from "./invite-link";

// /ligas/[id] (Task 4.3): ranking interno (so membros), mesma logica do geral.
export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const league = await getLeagueById(id);
  if (!league) notFound();

  if (!(await isMember(id, user.id))) {
    return (
      <>
        <Header title={league.name} subtitle="Liga privada" />
        <main className="flex-1 px-5 py-8">
          <p className="t-body text-center text-muted">
            Você não participa desta liga.
          </p>
        </main>
      </>
    );
  }

  const rows = await getLeagueRanking({
    leagueId: id,
    currentUserId: user.id,
    limit: 100,
    offset: 0,
  });

  return (
    <>
      <Header title={league.name} subtitle="Liga privada" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Ligas", href: "/ligas" },
          { label: league.name },
        ]}
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Card>
          <p className="t-kicker mb-2 text-indigo">Convite da liga</p>
          <InviteLink token={league.inviteToken} />
          <ShareButton
            text={`Entra na minha liga "${league.name}" no Bolão LATAM Pass da Copa 2026:`}
            path={`/ligas/entrar/${league.inviteToken}`}
            label="Convidar no WhatsApp"
            className="mt-3 w-full rounded-xl bg-rose py-2.5 text-sm font-bold text-white"
          />
          <p className="t-caption mt-2 text-muted">
            Compartilhe o link para os amigos entrarem.
          </p>
        </Card>

        <div>
          <p className="t-kicker mb-2 text-indigo">Classificação interna</p>
          <div className="rounded-2xl border border-black/10 bg-paper p-2">
            {rows.map((r) => (
              <RankingRow key={r.userId} row={r} />
            ))}
          </div>
          <p className="t-caption mt-2 text-muted">
            Mesma pontuação do ranking geral, só entre os membros.
          </p>
        </div>
      </main>
    </>
  );
}
