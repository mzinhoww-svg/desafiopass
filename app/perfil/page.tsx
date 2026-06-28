import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { getMyRank } from "@/lib/queries/ranking";
import { teams as seedTeams } from "@/lib/data/copa2026";
import { logout } from "@/app/actions/profile";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ProfileForm } from "./profile-form";

// /perfil: Server Component. Apelido, time do coracao e total de pontos/posicao
// (agregado server-side, RANKING_SPEC). Edicao e logout via Server Actions.
export default async function PerfilPage() {
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
      <Header title="Perfil" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        <div className="flex gap-3">
          <Card className="flex-1 text-center">
            <p className="t-points text-indigo">{rank.points}</p>
            <p className="t-caption uppercase tracking-wide text-muted">Pontos</p>
          </Card>
          <Card className="flex-1 text-center">
            <p className="t-points text-indigo">{rank.position ?? "—"}</p>
            <p className="t-caption uppercase tracking-wide text-muted">Posição</p>
          </Card>
        </div>

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

        <LinkButton href="/partidas?aba=especiais" variant="secondary" className="mt-4 w-full">
          Palpites especiais (campeão e artilheiro)
        </LinkButton>

        {sessionUser.role === "admin" ? (
          <LinkButton href="/admin" className="mt-4 w-full">
            Painel admin
          </LinkButton>
        ) : null}

        <form action={logout} className="mt-4">
          <Button type="submit" variant="secondary" className="w-full">
            Sair da conta
          </Button>
        </form>
      </main>
    </>
  );
}
