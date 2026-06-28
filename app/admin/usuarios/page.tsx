import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllUsers } from "@/lib/queries/users";
import { deleteUser } from "@/app/actions/admin";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pill } from "@/components/ui/pill";
import { ConfirmButton } from "@/components/confirm-button";

// /admin/usuarios: tabela de usuarios com exclusao (cascateia palpites e ligas).
export default async function AdminUsersPage() {
  if (!(await isAdmin())) redirect("/login");
  const list = await getAllUsers();

  return (
    <>
      <Header title="Admin · Usuários" subtitle="Gestão" />
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Usuários" },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        {list.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-black/10 bg-paper p-3"
          >
            <div className="min-w-0">
              <p className="t-card-title truncate text-indigo">{u.nickname}</p>
              <p className="t-caption truncate text-muted">{u.email}</p>
            </div>
            <div className="flex flex-none items-center gap-3">
              <Pill variant={u.role === "admin" ? "rose" : "neutral"}>
                {u.role}
              </Pill>
              <form action={deleteUser}>
                <input type="hidden" name="userId" value={u.id} />
                <ConfirmButton
                  message={`Excluir ${u.nickname}? Remove os palpites e as ligas que ele criou.`}
                  className="t-caption font-bold text-rose"
                >
                  Excluir
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
