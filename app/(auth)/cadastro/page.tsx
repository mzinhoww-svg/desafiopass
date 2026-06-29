import { Header } from "@/components/header";
import { getLocale, tr } from "@/lib/i18n";
import { CadastroForm } from "./cadastro-form";

export default async function CadastroPage() {
  const locale = await getLocale();
  return (
    <>
      <Header
        title={tr(locale, "Criar conta", "Crear cuenta")}
        subtitle={tr(locale, "Bolão Pass", "Polla Pass")}
      />
      <main className="flex-1 px-5 py-8">
        <CadastroForm />
      </main>
    </>
  );
}
