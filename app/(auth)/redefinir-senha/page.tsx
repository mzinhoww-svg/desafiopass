import { Header } from "@/components/header";
import { getLocale, tr } from "@/lib/i18n";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getLocale();

  return (
    <>
      <Header
        title={tr(locale, "Nova senha", "Nueva contraseña")}
        subtitle={tr(locale, "Bolão LATAM Pass", "Polla LATAM Pass")}
      />
      <main className="flex-1 px-5 py-8">
        <RedefinirSenhaForm token={token ?? ""} />
      </main>
    </>
  );
}
