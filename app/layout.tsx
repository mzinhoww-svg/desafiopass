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
  const title = tr(locale, "Bolão Pass · Copa 2026", "Polla Pass · Copa 2026");
  const description = tr(
    locale,
    "Bolão de palpites da Copa do Mundo 2026, fase mata-mata. Palpite os placares, acumule pontos e fique no topo do ranking.",
    "Polla de pronósticos del Mundial 2026, fase eliminatoria. Pronostica los marcadores, suma puntos y llega a lo más alto del ranking.",
  );
  const siteName = tr(locale, "Bolão Pass", "Polla Pass");
  return {
    metadataBase: new URL("https://desafiopass.com"),
    title,
    description,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: "/apple-touch-icon.png",
    },
    // Preview de link (WhatsApp/redes): imagem própria com a cauda + marca.
    openGraph: {
      type: "website",
      url: "/",
      siteName,
      title,
      description,
      locale: locale === "es" ? "es_CL" : "pt_BR",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
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
