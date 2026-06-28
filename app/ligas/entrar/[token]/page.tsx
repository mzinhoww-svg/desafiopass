import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  getLeagueByToken,
  isMember,
  getLeagueMemberCount,
} from "@/lib/queries/leagues";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { JoinButton } from "./join-button";

// /ligas/entrar/[token] (Task 4.2): valida o token e oferece entrar. Rota protegida
// por login (middleware /ligas).
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { token } = await params;
  const league = await getLeagueByToken(token);

  return (
    <>
      <Header title="Convite de liga" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        {!league ? (
          <Card>
            <p className="t-body text-center font-bold text-rose">
              Convite inválido.
            </p>
            <p className="t-caption mt-2 text-center text-muted">
              Confira o link com quem te convidou.
            </p>
          </Card>
        ) : (await isMember(league.id, user.id)) ? (
          <Card className="flex flex-col gap-3 text-center">
            <p className="t-card-title text-indigo">{league.name}</p>
            <p className="t-body text-muted">Você já está nesta liga.</p>
            <LinkButton href={`/ligas/${league.id}`}>Ver a liga</LinkButton>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3 text-center">
            <p className="t-kicker text-indigo">Você foi convidado</p>
            <p className="t-card-title text-indigo">{league.name}</p>
            <p className="t-caption text-muted">
              {await getLeagueMemberCount(league.id)} participante(s) · Liga privada
            </p>
            <JoinButton token={league.inviteToken} />
            <LinkButton href="/ligas" variant="secondary">
              Agora não
            </LinkButton>
          </Card>
        )}
      </main>
    </>
  );
}
