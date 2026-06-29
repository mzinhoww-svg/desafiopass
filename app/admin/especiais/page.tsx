import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth-helpers";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card } from "@/components/ui/card";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { getSpecialResults } from "@/lib/queries/special";
import { SpecialResultForm } from "./special-result-form";
import { getLocale, tr } from "@/lib/i18n";

// /admin/especiais (#2): admin lança o campeão e o artilheiro oficiais. Ao salvar,
// recalcula os pontos especiais de todos os usuários.
export default async function AdminEspeciaisPage() {
  if (!(await isAdmin())) redirect("/login");

  const locale = await getLocale();
  const results = await getSpecialResults();
  const realTeams = seedTeams
    .filter((t) => t.flagCode)
    .map((t) => ({ code: t.code, name: t.name }));

  return (
    <>
      <Header
        title={tr(locale, "Admin · Especiais", "Admin · Especiales")}
        subtitle={tr(locale, "Campeão e artilheiro", "Campeón y goleador")}
      />
      <Breadcrumbs
        items={[
          { label: tr(locale, "Início", "Inicio"), href: "/" },
          { label: "Admin", href: "/admin" },
          { label: tr(locale, "Especiais", "Especiales") },
        ]}
      />
      <main className="flex flex-1 flex-col gap-4 px-5 py-4">
        <Card>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Defina o resultado oficial. Ao salvar, os pontos de campeão (300) e artilheiro (200) são recalculados para todos os participantes.",
              "Definí el resultado oficial. Al guardar, los puntos de campeón (300) y goleador (200) se recalculan para todos los participantes.",
            )}
          </p>
        </Card>
        <Card>
          <SpecialResultForm
            teams={realTeams}
            champion={results.champion}
            topScorer={results.topScorer}
          />
        </Card>
      </main>
    </>
  );
}
