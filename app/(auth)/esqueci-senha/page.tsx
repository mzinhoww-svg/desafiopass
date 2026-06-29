import { Header } from "@/components/header";
import { getLocale, tr } from "@/lib/i18n";
import { EsqueciSenhaForm } from "./esqueci-senha-form";

export default async function EsqueciSenhaPage() {
  const locale = await getLocale();
  return (
    <>
      <Header
        title={tr(locale, "Recuperar acesso", "Recuperar acceso")}
        subtitle={tr(locale, "Bolão LATAM Pass", "Polla LATAM Pass")}
      />
      <main className="flex-1 px-5 py-8">
        <EsqueciSenhaForm />
      </main>
    </>
  );
}
