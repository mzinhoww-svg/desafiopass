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
import { getLocale, tr } from "@/lib/i18n";

// /ligas/entrar/[token] (Task 4.2): valida o token e oferece entrar. Rota protegida
// por login (middleware /ligas).
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const locale = await getLocale();
  const { token } = await params;
  const league = await getLeagueByToken(token);

  return (
    <>
      <Header title={tr(locale, "Convite de liga", "Invitación de liga")} subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        {!league ? (
          <Card>
            <p className="t-body text-center font-bold text-rose">
              {tr(locale, "Convite inválido.", "Invitación inválida.")}
            </p>
            <p className="t-caption mt-2 text-center text-muted">
              {tr(locale, "Confira o link com quem te convidou.", "Revisa el enlace con quien te invitó.")}
            </p>
          </Card>
        ) : (await isMember(league.id, user.id)) ? (
          <Card className="flex flex-col gap-3 text-center">
            <p className="t-card-title text-indigo">{league.name}</p>
            <p className="t-body text-muted">{tr(locale, "Você já está nesta liga.", "Ya estás en esta liga.")}</p>
            <LinkButton href={`/ligas/${league.id}`}>{tr(locale, "Ver a liga", "Ver la liga")}</LinkButton>
          </Card>
        ) : (
          <Card className="flex flex-col gap-3 text-center">
            <p className="t-kicker text-indigo">{tr(locale, "Você foi convidado", "Te invitaron")}</p>
            <p className="t-card-title text-indigo">{league.name}</p>
            <p className="t-caption text-muted">
              {await getLeagueMemberCount(league.id)} {tr(locale, "participante(s) · Liga privada", "participante(s) · Liga privada")}
            </p>
            <JoinButton token={league.inviteToken} />
            <LinkButton href="/ligas" variant="secondary">
              {tr(locale, "Agora não", "Ahora no")}
            </LinkButton>
          </Card>
        )}
      </main>
    </>
  );
}
