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
import { getLocale, tr } from "@/lib/i18n";

// /ligas/[id] (Task 4.3): ranking interno (so membros), mesma logica do geral.
export default async function LeaguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const { id } = await params;
  const league = await getLeagueById(id);
  if (!league) notFound();

  if (!(await isMember(id, user.id))) {
    return (
      <>
        <Header title={league.name} subtitle={tr(locale, "Liga privada", "Liga privada")} />
        <main className="flex-1 px-5 py-8">
          <p className="t-body text-center text-muted">
            {tr(locale, "Você não participa desta liga.", "No participas en esta liga.")}
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
      <Header title={league.name} subtitle={tr(locale, "Liga privada", "Liga privada")} />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Ligas", href: "/ligas" },
          { label: league.name },
        ]}
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Card>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Convite da liga", "Invitación de la liga")}</p>
          <InviteLink token={league.inviteToken} />
          <ShareButton
            text={tr(locale, `Entra na minha liga "${league.name}" no Bolão Pass da Copa 2026:`, `Únete a mi liga "${league.name}" en la Polla Pass de la Copa 2026:`)}
            path={`/ligas/entrar/${league.inviteToken}`}
            label={tr(locale, "Convidar no WhatsApp", "Invitar por WhatsApp")}
            className="mt-3 w-full rounded-xl bg-rose py-2.5 text-sm font-bold text-white"
          />
          <p className="t-caption mt-2 text-muted">
            {tr(locale, "Compartilhe o link para os amigos entrarem.", "Comparte el enlace para que tus amigos se unan.")}
          </p>
        </Card>

        <div>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Classificação interna", "Clasificación interna")}</p>
          <div className="rounded-2xl border border-black/10 bg-paper p-2">
            {rows.map((r) => (
              <RankingRow key={r.userId} row={r} />
            ))}
          </div>
          <p className="t-caption mt-2 text-muted">
            {tr(locale, "Mesma pontuação do ranking geral, só entre os membros.", "Mismo puntaje del ranking general, solo entre los integrantes.")}
          </p>
        </div>
      </main>
    </>
  );
}
