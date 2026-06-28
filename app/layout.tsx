import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
