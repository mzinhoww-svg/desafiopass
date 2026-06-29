import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { isAdmin } from "@/lib/auth-helpers";
import { getAllMatches } from "@/lib/queries/matches";
import { getAdminMetrics } from "@/lib/queries/admin-metrics";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { SyncButton } from "./sync-button";
import { ImportButton } from "./import-button";
import { formatBrasilia } from "@/lib/utils/dates";
import { getLocale, tr } from "@/lib/i18n";

// /admin: metricas, alertas e lista de partidas para inserir resultado. Protegida
// pelo middleware (role admin) e revalidada aqui.
export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");
  const locale = await getLocale();
  const [all, metrics] = await Promise.all([getAllMatches(), getAdminMetrics()]);
  const participation =
    metrics.totalUsers > 0
      ? Math.round((metrics.usersWithPrediction / metrics.totalUsers) * 100)
      : 0;

  return (
    <>
      <Header
        title={tr(locale, "Admin · Partidas", "Admin · Partidos")}
        subtitle={tr(locale, "Inserir resultado", "Ingresar resultado")}
      />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Admin" },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5 py-4">
        <div className="flex gap-2">
          <Link
            href="/admin/usuarios"
            className="t-card-title flex-1 rounded-xl border border-black/10 bg-paper p-3 text-center text-indigo"
          >
            {tr(locale, "Usuários", "Usuarios")}
          </Link>
          <Link
            href="/admin/ligas"
            className="t-card-title flex-1 rounded-xl border border-black/10 bg-paper p-3 text-center text-indigo"
          >
            {tr(locale, "Ligas", "Ligas")}
          </Link>
          <Link
            href="/admin/especiais"
            className="t-card-title flex-1 rounded-xl border border-black/10 bg-paper p-3 text-center text-indigo"
          >
            {tr(locale, "Especiais", "Especiales")}
          </Link>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Card className="text-center">
            <p className="t-points text-indigo">{metrics.totalUsers}</p>
            <p className="t-caption uppercase tracking-wide text-muted">
              {tr(locale, "Usuários", "Usuarios")}
            </p>
          </Card>
          <Card className="text-center">
            <p className="t-points text-indigo">{participation}%</p>
            <p className="t-caption uppercase tracking-wide text-muted">
              {tr(locale, "Palpitaram", "Pronosticaron")}
            </p>
          </Card>
          <Card className="text-center">
            <p className="t-points text-indigo">{metrics.totalPredictions}</p>
            <p className="t-caption uppercase tracking-wide text-muted">
              {tr(locale, "Palpites", "Pronósticos")}
            </p>
          </Card>
          <Card className="text-center">
            <p className="t-points text-indigo">
              {metrics.closedMatches}/{metrics.closedMatches + metrics.scheduledMatches}
            </p>
            <p className="t-caption uppercase tracking-wide text-muted">
              {tr(locale, "Jogos pontuados", "Partidos puntuados")}
            </p>
          </Card>
        </div>
        <p className="t-caption text-muted">
          {tr(
            locale,
            `${metrics.usersWithPrediction} de ${metrics.totalUsers} usuários já fizeram ao menos 1 palpite.`,
            `${metrics.usersWithPrediction} de ${metrics.totalUsers} usuarios ya hicieron al menos 1 pronóstico.`,
          )}
        </p>

        <div className="mt-1 flex flex-col gap-2">
          <SyncButton />
          <ImportButton />
        </div>

        {metrics.unscored.length > 0 ? (
          <Card className="border border-rose/40 bg-rose/5">
            <div className="mb-2 flex items-center gap-2 text-rose">
              <AlertTriangle size={18} aria-hidden="true" />
              <p className="t-card-title">
                {tr(locale, "Jogos sem placar lançado", "Partidos sin marcador ingresado")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {metrics.unscored.map((m) => (
                <Link
                  key={m.id}
                  href={`/admin/partidas/${m.id}`}
                  className="flex items-center justify-between py-1"
                >
                  <span className="t-body font-bold text-indigo">{m.label}</span>
                  <span className="t-caption text-muted">
                    {formatBrasilia(m.kickoffAt)}
                  </span>
                </Link>
              ))}
            </div>
            <p className="t-caption mt-2 text-muted">
              {tr(
                locale,
                "O apito já passou — lance o placar para liberar os pontos.",
                "El pitazo final ya pasó — ingresá el marcador para liberar los puntos.",
              )}
            </p>
          </Card>
        ) : null}

        <p className="t-kicker mt-2 text-indigo">
          {tr(locale, "Partidas · inserir resultado", "Partidos · ingresar resultado")}
        </p>
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
                  : tr(locale, "Agendada", "Programada")}
              </Pill>
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </main>
    </>
  );
}
