import { Header } from "@/components/header";
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
  return (
    <>
      <Header title="Entrar" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        <LoginForm registered={sp.registered === "1"} />
      </main>
    </>
  );
}
