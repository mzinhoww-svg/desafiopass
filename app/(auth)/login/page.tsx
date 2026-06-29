import { Header } from "@/components/header";
import { getLocale, tr } from "@/lib/i18n";
import { LoginForm } from "./login-form";

// Pagina de login (signIn do Auth.js v5). E o destino de pages.signIn do middleware
// e do link "Ja tem conta" do cadastro. searchParams.registered=1 mostra o aviso de
// conta criada (Next 15: searchParams e Promise).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getLocale();
  return (
    <>
      <Header
        title={tr(locale, "Entrar", "Ingresar")}
        subtitle={tr(locale, "Bolão Pass", "Polla Pass")}
        hideLogin
      />
      <main className="flex-1 px-5 py-8">
        <LoginForm registered={sp.registered === "1"} />
      </main>
    </>
  );
}
