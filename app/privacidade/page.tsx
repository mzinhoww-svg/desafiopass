import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";

// /privacidade (#13): aviso curto de privacidade/LGPD. Projeto pessoal, sem fins
// comerciais; coleta minima (e-mail, apelido e palpites) para operar o bolao.
export const metadata = {
  title: "Privacidade · Bolão LATAM Pass",
};

export default function PrivacidadePage() {
  return (
    <>
      <Header title="Privacidade" subtitle="Bolão LATAM Pass" />
      <Breadcrumbs
        items={[{ label: "Início", href: "/" }, { label: "Privacidade" }]}
      />
      <main className="flex flex-1 flex-col gap-5 px-5 py-6">
        <section>
          <p className="t-kicker mb-2 text-indigo">O que coletamos</p>
          <p className="t-body text-ink">
            Para participar do bolão, guardamos apenas o seu e-mail, o apelido que
            aparece no ranking, uma foto de perfil opcional e os palpites que você
            faz. A senha é armazenada de forma criptografada (hash) e nunca em
            texto puro.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Como usamos</p>
          <p className="t-body text-ink">
            Os dados servem só para operar o bolão: autenticar seu acesso, calcular
            a pontuação e montar os rankings geral e das ligas. Não vendemos nem
            compartilhamos seus dados com terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Seus direitos (LGPD)</p>
          <p className="t-body text-ink">
            Você pode solicitar a correção ou a exclusão da sua conta e dos seus
            dados a qualquer momento. Ao excluir a conta, removemos seus palpites e
            suas informações de perfil.
          </p>
        </section>

        <section>
          <p className="t-kicker mb-2 text-indigo">Contato</p>
          <p className="t-body text-ink">
            Dúvidas sobre privacidade? Fale com o organizador do bolão pelo canal em
            que você recebeu o convite.
          </p>
          <p className="t-caption mt-3 text-muted">
            Este é um projeto pessoal, sem vínculo comercial, criado para a
            brincadeira do bolão entre amigos.
          </p>
        </section>
      </main>
    </>
  );
}
