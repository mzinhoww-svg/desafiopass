import type { MetadataRoute } from "next";

// PWA manifest (#12). Permite "adicionar à tela inicial" com cara de app.
// Indigo profundo de fundo, rosa de acento.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bolão Pass · Copa 2026",
    short_name: "Bolão Pass",
    description:
      "Palpite os placares do mata-mata, acumule pontos e fique no topo do ranking.",
    start_url: "/",
    display: "standalone",
    background_color: "#16064F",
    theme_color: "#16064F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
