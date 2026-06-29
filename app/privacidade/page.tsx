import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getLocale, tr } from "@/lib/i18n";

// /privacidade (#13): aviso curto de privacidade/LGPD. Projeto pessoal, sem fins
// comerciais; coleta minima (e-mail, apelido e palpites) para operar o bolao.
export const metadata = {
  title: "Privacidade · Bolão Pass",
};

export default async function PrivacidadePage() {
  const locale = await getLocale();
  return (
    <>
      <Header title={tr(locale, "Privacidade", "Privacidad")} subtitle={tr(locale, "Bolão Pass", "Polla Pass")} />
      <Breadcrumbs
        items={[{ label: tr(locale, "Início", "Inicio"), href: "/" }, { label: tr(locale, "Privacidade", "Privacidad") }]}
      />
      <main className="flex flex-1 flex-col gap-5 px-5 py-6">
        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "O que coletamos", "Qué recopilamos")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Para participar do bolão, guardamos apenas o seu e-mail, o apelido que aparece no ranking, uma foto de perfil opcional e os palpites que você faz. A senha é armazenada de forma criptografada (hash) e nunca em texto puro.",
              "Para participar en la polla, solo guardamos tu correo, el apodo que aparece en el ranking, una foto de perfil opcional y los pronósticos que haces. La contraseña se almacena de forma cifrada (hash) y nunca en texto plano.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Como usamos", "Cómo los usamos")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Os dados servem só para operar o bolão: autenticar seu acesso, calcular a pontuação e montar os rankings geral e das ligas. Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.",
              "Los datos sirven solo para operar la polla: autenticar tu acceso, calcular la puntuación y armar los rankings general y de las ligas. No vendemos ni compartimos tus datos con terceros con fines de marketing.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Seus direitos (LGPD)", "Tus derechos (LGPD)")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Você pode solicitar a correção ou a exclusão da sua conta e dos seus dados a qualquer momento. Ao excluir a conta, removemos seus palpites e suas informações de perfil.",
              "Puedes solicitar la corrección o la eliminación de tu cuenta y de tus datos en cualquier momento. Al eliminar la cuenta, borramos tus pronósticos y la información de tu perfil.",
            )}
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">{tr(locale, "Contato", "Contacto")}</p>
          <p className="t-body text-ink">
            {tr(
              locale,
              "Dúvidas sobre privacidade? Fale com o organizador do bolão pelo canal em que você recebeu o convite.",
              "¿Dudas sobre privacidad? Habla con el organizador de la polla por el canal donde recibiste la invitación.",
            )}
          </p>
          <p className="t-caption mt-3 text-muted">
            {tr(
              locale,
              "Este é um projeto pessoal, sem vínculo comercial, criado para a brincadeira do bolão entre amigos.",
              "Este es un proyecto personal, sin vínculo comercial, creado para la entretención de la polla entre amigos.",
            )}
          </p>
        </section>
      </main>
    </>
  );
}
