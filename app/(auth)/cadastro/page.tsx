import { Header } from "@/components/header";
import { CadastroForm } from "./cadastro-form";

export default function CadastroPage() {
  return (
    <>
      <Header title="Criar conta" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
        <CadastroForm />
      </main>
    </>
  );
}
