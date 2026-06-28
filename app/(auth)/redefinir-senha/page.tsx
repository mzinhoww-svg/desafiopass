import { Header } from "@/components/header";
import { RedefinirSenhaForm } from "./redefinir-senha-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <Header title="Nova senha" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        <RedefinirSenhaForm token={token ?? ""} />
      </main>
    </>
  );
}
