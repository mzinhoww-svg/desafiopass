import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllLeaguesWithCounts } from "@/lib/queries/leagues";
import { deleteLeague } from "@/app/actions/admin";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmButton } from "@/components/confirm-button";

// /admin/ligas: tabela de ligas com exclusao e link para gerir membros.
export default async function AdminLeaguesPage() {
  if (!(await isAdmin())) redirect("/login");
  const list = await getAllLeaguesWithCounts();

  return (
    <>
      <Header title="Admin · Ligas" subtitle="Gestão" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Ligas" },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        {list.length === 0 ? (
          <p className="t-body text-muted">Nenhuma liga criada ainda.</p>
        ) : (
          list.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-paper p-3"
            >
              <div className="min-w-0">
                <p className="t-card-title truncate text-indigo">{l.name}</p>
                <p className="t-caption truncate text-muted">
                  dono {l.ownerNickname} · {l.members} membro(s)
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <Link
                  href={`/admin/ligas/${l.id}`}
                  className="t-caption font-bold text-indigo"
                >
                  Membros
                </Link>
                <form action={deleteLeague}>
                  <input type="hidden" name="leagueId" value={l.id} />
                  <ConfirmButton
                    message={`Excluir a liga ${l.name}? Os membros serão desvinculados.`}
                    className="t-caption font-bold text-rose"
                  >
                    Excluir
                  </ConfirmButton>
                </form>
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
}
