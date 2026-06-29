import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { TabBar } from "@/components/tab-bar";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getPendingPredictionCount } from "@/lib/queries/matches";
import { getLocale, htmlLang, tr } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import "./globals.css";

// Fonte unica do app (decisao travada, DESIGN_SPEC secao 1): Plus Jakarta Sans,
// pesos 400/500/700/800, via next/font. Fallback de sistema no globals.css.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(
      locale,
      "Bolão LATAM Pass · Copa 2026",
      "Polla LATAM Pass · Copa 2026",
    ),
    description: tr(
      locale,
      "Bolão de palpites da Copa do Mundo 2026, fase mata-mata, com identidade LATAM Pass. Palpite os placares, acumule pontos e fique no topo do ranking.",
      "Polla de pronósticos del Mundial 2026, fase eliminatoria, con identidad LATAM Pass. Pronostica los marcadores, suma puntos y llega a lo más alto del ranking.",
    ),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: tr(locale, "Bolão LATAM", "Polla LATAM"),
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#16064F",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const loggedIn = !!user;
  const pendingCount = user ? await getPendingPredictionCount(user.id) : 0;
  const locale = await getLocale();

  return (
    <html
      lang={htmlLang(locale)}
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black/5">
        <LocaleProvider locale={locale}>
          {/* App-shell: largura de telefone, centralizada em telas largas (web). A
              barra inferior (e seu espaco) so existe para usuarios logados. */}
          <div
            className={`mx-auto flex min-h-full max-w-md flex-col bg-paper shadow-sm ${
              loggedIn ? "pb-16" : ""
            }`}
          >
            {children}
          </div>
          {loggedIn ? <TabBar pendingCount={pendingCount} /> : null}
          <InstallPrompt loggedIn={loggedIn} />
        </LocaleProvider>
      </body>
    </html>
  );
}
