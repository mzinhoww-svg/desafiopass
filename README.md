# Bolão LATAM Pass · Copa 2026 (Mata-Mata)

Bolão de palpites da Copa do Mundo FIFA 2026, fase mata-mata, com identidade
visual LATAM Pass (Elevate Design System). Usuário palpita placares, acumula
pontos, sobe no ranking e disputa prêmios em milhas LATAM Pass. Inclui ligas
privadas.

## Stack

Next.js 15 (App Router) · TypeScript estrito · Tailwind v4 · Plus Jakarta Sans.
Demais camadas (Vercel Postgres, Drizzle, NextAuth v5, Framer Motion, Lucide)
entram nas tasks seguintes do ROADMAP.

## Scripts

| Comando             | O que faz                          |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Sobe o servidor de desenvolvimento |
| `npm run build`     | Build de produção                  |
| `npm run start`     | Servidor de produção               |
| `npm run lint`      | ESLint (flat config)               |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |

## Metodologia

GSD2: Milestone > Slice > Task, uma task por vez, spec antes de código,
must-have verificável por task. Marca conforme `specs/DESIGN_SPEC.md` e
`BRANDING.md`: paleta Elevate (índigo #16064F, rosa #FE3173, teal #0AE7C6),
sem emoji na UI, prêmio sempre em milhas LATAM Pass.
