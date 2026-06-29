import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getMyRank } from "@/lib/queries/ranking";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { logout, deleteOwnAccount } from "@/app/actions/profile";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ConfirmButton } from "@/components/confirm-button";
import { ShareButton } from "@/components/share-button";
import { PushToggle } from "@/components/push-toggle";
import { ProfileForm } from "./profile-form";
import { getLocale, tr } from "@/lib/i18n";

// /perfil: Server Component. Apelido, time do coracao e total de pontos/posicao
// (agregado server-side, RANKING_SPEC). Edicao e logout via Server Actions.
export default async function PerfilPage() {
  const locale = await getLocale();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const found = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);
  const user = found[0];
  if (!user) redirect("/login");

  const rank = await getMyRank(user.id);
  const realTeams = seedTeams
    .filter((t) => t.flagCode)
    .map((t) => ({ code: t.code, name: t.name }));

  return (
    <>
      <Header title="Perfil" subtitle={tr(locale, "Bolão Pass", "Polla Pass")} />
      <main className="flex-1 px-5 py-8">
        <div className="flex gap-3">
          <Card className="flex-1 text-center">
            <p className="t-points text-indigo">{rank.points}</p>
            <p className="t-caption uppercase tracking-wide text-muted">{tr(locale, "Pontos", "Puntos")}</p>
          </Card>
          <Card className="flex-1 text-center">
            <p className="t-points text-indigo">{rank.position ?? "—"}</p>
            <p className="t-caption uppercase tracking-wide text-muted">{tr(locale, "Posição", "Posición")}</p>
          </Card>
        </div>

        <ShareButton
          text={
            rank.position
              ? tr(
                  locale,
                  `Estou em ${rank.position}º no Bolão Pass da Copa 2026 com ${rank.points} pts! Vem disputar:`,
                  `¡Estoy en el puesto ${rank.position} de la Polla Pass de la Copa 2026 con ${rank.points} pts! Vení a competir:`,
                )
              : tr(
                  locale,
                  "Tô no Bolão Pass da Copa 2026! Vem palpitar:",
                  "¡Estoy en la Polla Pass de la Copa 2026! Vení a pronosticar:",
                )
          }
          path="/"
          label={tr(locale, "Compartilhar minha posição", "Compartir mi posición")}
          className="mt-4 w-full rounded-xl border border-indigo/30 py-2.5 text-sm font-bold text-indigo"
        />

        <div className="mt-4">
          <Card>
            <ProfileForm
              nickname={user.nickname}
              favoriteTeam={user.favoriteTeam}
              avatarUrl={user.avatarUrl}
              emailReminders={user.emailReminders}
              teams={realTeams}
            />
          </Card>
        </div>

        <PushToggle />

        <LinkButton href="/meus-palpites" variant="secondary" className="mt-4 w-full">
          {tr(locale, "Meus palpites", "Mis pronósticos")}
        </LinkButton>

        <LinkButton href="/partidas?aba=especiais" variant="secondary" className="mt-4 w-full">
          {tr(locale, "Palpites especiais (campeão e artilheiro)", "Pronósticos especiales (campeón y goleador)")}
        </LinkButton>

        {sessionUser.role === "admin" ? (
          <LinkButton href="/admin" className="mt-4 w-full">
            {tr(locale, "Painel admin", "Panel de admin")}
          </LinkButton>
        ) : null}

        <form action={logout} className="mt-4">
          <Button type="submit" variant="secondary" className="w-full">
            {tr(locale, "Sair da conta", "Cerrar sesión")}
          </Button>
        </form>

        <form action={deleteOwnAccount} className="mt-8">
          <ConfirmButton
            message={tr(
              locale,
              "Tem certeza? Isso apaga sua conta, seus palpites e as ligas que você criou. Não dá para desfazer.",
              "¿Estás seguro? Esto borra tu cuenta, tus pronósticos y las ligas que creaste. No se puede deshacer.",
            )}
            className="w-full rounded-xl py-2 text-center text-sm font-bold text-rose"
          >
            {tr(locale, "Excluir minha conta", "Eliminar mi cuenta")}
          </ConfirmButton>
        </form>
      </main>
    </>
  );
}
