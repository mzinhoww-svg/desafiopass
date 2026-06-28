import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { TabBar } from "@/components/tab-bar";
import "./globals.css";

// Fonte unica do app (decisao travada, DESIGN_SPEC secao 1): Plus Jakarta Sans,
// pesos 400/500/700/800, via next/font. Fallback de sistema no globals.css.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bolão LATAM Pass · Copa 2026",
  description:
    "Bolão de palpites da Copa do Mundo FIFA 2026, fase mata-mata, com identidade LATAM Pass. Palpite placares, acumule pontos e dispute prêmios em milhas LATAM Pass.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-black/5">
        {/* App-shell: largura de telefone, centralizada em telas largas (web). */}
        <div className="mx-auto flex min-h-full max-w-md flex-col bg-paper pb-16 shadow-sm">
          {children}
        </div>
        <TabBar />
      </body>
    </html>
  );
}
