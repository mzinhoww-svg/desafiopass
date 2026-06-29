import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import {
  getLeagueById,
  getLeagueMembersWithUsers,
} from "@/lib/queries/leagues";
import { removeMember } from "@/app/actions/admin";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmButton } from "@/components/confirm-button";
import { getLocale, tr } from "@/lib/i18n";

// /admin/ligas/[id]: membros da liga com remocao individual.
export default async function AdminLeagueMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/login");
  const locale = await getLocale();
  const { id } = await params;
  const league = await getLeagueById(id);
  if (!league) notFound();
  const members = await getLeagueMembersWithUsers(id);

  return (
    <>
      <Header title={league.name} subtitle={tr(locale, "Admin · Membros", "Admin · Integrantes")} />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Ligas", href: "/admin/ligas" },
          { label: league.name },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        {members.length === 0 ? (
          <p className="t-body text-muted">{tr(locale, "Liga sem membros.", "Liga sin integrantes.")}</p>
        ) : (
          members.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-paper p-3"
            >
              <span className="t-card-title truncate text-indigo">
                {m.nickname}
              </span>
              <form action={removeMember}>
                <input type="hidden" name="leagueId" value={id} />
                <input type="hidden" name="userId" value={m.userId} />
                <ConfirmButton
                  message={tr(locale, `Remover ${m.nickname} desta liga?`, `¿Quitar a ${m.nickname} de esta liga?`)}
                  className="t-caption font-bold text-rose"
                >
                  {tr(locale, "Remover", "Quitar")}
                </ConfirmButton>
              </form>
            </div>
          ))
        )}
      </main>
    </>
  );
}
