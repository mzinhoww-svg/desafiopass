import Link from "next/link";

// 404 amigável e na marca (#9).
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="t-kicker text-rose">Erro 404</p>
      <h1 className="t-display text-indigo">Página não encontrada</h1>
      <p className="t-body max-w-[40ch] text-muted">
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-rose px-6 py-3 text-sm font-bold text-white"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
