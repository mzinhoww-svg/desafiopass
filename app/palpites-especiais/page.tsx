import { redirect } from "next/navigation";

// Palpites especiais agora vivem na aba "Artilharia e outros" de /palpites.
// Mantido como redirect para não quebrar links/atalhos antigos.
export default function PalpitesEspeciaisPage() {
  redirect("/partidas?aba=especiais");
}
