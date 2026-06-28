import { Header } from "@/components/header";
import { EsqueciSenhaForm } from "./esqueci-senha-form";

export default function EsqueciSenhaPage() {
  return (
    <>
      <Header title="Recuperar acesso" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        <EsqueciSenhaForm />
      </main>
    </>
  );
}
