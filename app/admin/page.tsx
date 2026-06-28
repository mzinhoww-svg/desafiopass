import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllMatches } from "@/lib/queries/matches";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pill } from "@/components/ui/pill";

// /admin: lista de partidas para inserir resultado. Protegida pelo middleware
// (role admin) e revalidada aqui.
export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");
  const all = await getAllMatches();

  return (
    <>
      <Header title="Admin · Partidas" subtitle="Inserir resultado" />
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Admin" }]} />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        <div className="flex gap-2">
          <Link
            href="/admin/usuarios"
            className="t-card-title flex-1 rounded-xl border border-black/10 bg-paper p-3 text-center text-indigo"
          >
            Usuários
          </Link>
          <Link
            href="/admin/ligas"
            className="t-card-title flex-1 rounded-xl border border-black/10 bg-paper p-3 text-center text-indigo"
          >
            Ligas
          </Link>
        </div>
        <p className="t-kicker mt-2 text-indigo">Partidas · inserir resultado</p>
        {all.map((m) => (
          <Link
            key={m.id}
            href={`/admin/partidas/${m.id}`}
            className="flex items-center justify-between rounded-xl border border-black/10 bg-paper p-3"
          >
            <span className="t-card-title text-indigo">
              {m.homeCode} x {m.awayCode}
            </span>
            <span className="flex items-center gap-2">
              <Pill variant={m.status === "encerrada" ? "lime" : "neutral"}>
                {m.status === "encerrada"
                  ? `${m.homeScore} x ${m.awayScore}`
                  : "Agendada"}
              </Pill>
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </main>
    </>
  );
}
