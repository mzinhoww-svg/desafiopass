import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllLeaguesWithCounts } from "@/lib/queries/leagues";
import { deleteLeague } from "@/app/actions/admin";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ConfirmButton } from "@/components/confirm-button";
import { getLocale, tr } from "@/lib/i18n";

// /admin/ligas: tabela de ligas com exclusao e link para gerir membros.
export default async function AdminLeaguesPage() {
  if (!(await isAdmin())) redirect("/login");
  const locale = await getLocale();
  const list = await getAllLeaguesWithCounts();

  return (
    <>
      <Header title={tr(locale, "Admin · Ligas", "Admin · Ligas")} subtitle={tr(locale, "Gestão", "Gestión")} />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Ligas" },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        {list.length === 0 ? (
          <p className="t-body text-muted">{tr(locale, "Nenhuma liga criada ainda.", "Aún no se ha creado ninguna liga.")}</p>
        ) : (
          list.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-paper p-3"
            >
              <div className="min-w-0">
                <p className="t-card-title truncate text-indigo">{l.name}</p>
                <p className="t-caption truncate text-muted">
                  {tr(locale, "dono", "dueño")} {l.ownerNickname} · {l.members} {tr(locale, "membro(s)", "integrante(s)")}
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <Link
                  href={`/admin/ligas/${l.id}`}
                  className="t-caption font-bold text-indigo"
                >
                  {tr(locale, "Membros", "Integrantes")}
                </Link>
                <form action={deleteLeague}>
                  <input type="hidden" name="leagueId" value={l.id} />
                  <ConfirmButton
                    message={tr(locale, `Excluir a liga ${l.name}? Os membros serão desvinculados.`, `¿Eliminar la liga ${l.name}? Los integrantes serán desvinculados.`)}
                    className="t-caption font-bold text-rose"
                  >
                    {tr(locale, "Excluir", "Eliminar")}
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
