# Backlog vivo - Bolao LATAM Pass Copa 2026

Memoria persistente do projeto (GSD2). Toda task LE este arquivo no inicio e GRAVA
no fim, conforme prompts/00_PROTOCOLO.md. Estado rastreavel entre contextos frescos.

---

## 1. Visao

Bolao de palpites da Copa do Mundo FIFA 2026, fase mata-mata, identidade LATAM Pass
Elevate. MVP: cadastro/login, palpites, pontuacao, ranking geral, ligas privadas,
admin que pontua. Jogos via seed estatico. Premio em milhas LATAM Pass.

---

## 2. Estado das tasks (ROADMAP)

Marcacao: [ ] pendente, [~] em andamento, [x] concluida.

### Slice 0: Fundacao
- [x] Task 0.1 Scaffold
- [x] Task 0.2 Tokens de marca / sistema de design Elevate
- [x] Task 0.3 Banco e ORM (migracao 0000 aplicada no Neon via GitHub Actions, run 28332601479)
- [x] Task 0.4 Seed Copa 2026 (db:seed rodou no mesmo run; upsert idempotente por PK)
- [x] Task 0.5 Deploy + CI (producao no ar; ci.yml lint/typecheck/test/build; db.yml migrate+seed)

### SLICE 0 COMPLETO. Proximo: Slice 1 (Auth e perfil) — Task 1.1 NextAuth Credentials.

### Slice 1: Auth e perfil
- [x] Task 1.1 NextAuth Credentials (mergeado; AUTH_SECRET na Vercel + usuarios semeados)
- [x] Task 1.2 Cadastro (/cadastro + /login + signup action; build-verde)
- [x] Task 1.3 Perfil (/perfil: pontos/posicao agregados, edicao apelido/time, logout)

### SLICE 1 COMPLETO (codigo). Proximo: Slice 2 — Task 2.1 Scoring (codigo pronto em reference).
- [ ] Task 1.2 Cadastro
- [ ] Task 1.3 Perfil

### Slice 2: Palpites e pontuacao
- [x] Task 2.1 Logica de pontuacao (lib/scoring.ts + 38 testes verdes, F8=200)
- [x] Task 2.2 Lista de partidas (/partidas por fase, match-card, selos, estado)
- [x] Task 2.3 Registrar palpite (/partidas/[id], score-input, prazo server-side, upsert)
- [x] Task 2.4 Encerrar e pontuar admin (/admin, finalPoints + criterion, idempotente)
- [x] Task 2.5 Resultado na UI (partida encerrada: palpite, placar real, pontos+criterio)

### SLICE 2 COMPLETO (codigo, build/test verdes). Tambem: navegacao (tab bar, breadcrumbs, empty-state).

### Slice 3: Ranking
- [x] Task 3.1 Ranking geral (competition ranking, desempate travado, faixa pessoal, /ranking)

### Slice 4: Ligas privadas
- [x] Task 4.1 Criar liga (token crypto, limite 1 liga basico, owner como membro)
- [x] Task 4.2 Entrar na liga (token/link, valida, PK impede duplicata, limite)
- [x] Task 4.3 Ranking da liga (getLeagueRanking RANKING_SPEC 8.5, so membros)

### SLICE 4 COMPLETO (codigo, build/test verdes).

### Slice 5: Regras, premios e acabamento
- [x] Task 5.1 Regras e premios (/regras: pontuacao, multiplicadores, premios em milhas)
- [x] Task 5.2 Home (hero + CTA palpitar + proximos jogos do banco + link regras)
- [x] Task 5.3 QA (checks verdes; palpite inline entre bandeiras/x no match-card)
- [~] Task 5.4 Release (deploy de producao no ar; tag v1.0.0 retida ate verificacao
      funcional ponta a ponta em producao pelo usuario)

### SLICE 5 quase completo. MVP funcional entregue; falta validacao em prod + tag v1.0.0.

### REFINAMENTOS pedidos (pos-MVP, fora do escopo original): foto de perfil (upload),
### aba de palpites de outros usuarios, logo LATAM Pass (precisa do arquivo).

---

## 3. Must-haves da task atual (Task 0.3 Banco e ORM)

- [x] Drizzle configurado (drizzle.config.ts) e lib/db.ts (cliente vercel-postgres).
- [x] drizzle/schema.ts com todas as tabelas do DATA_SPEC (users, teams, matches,
      predictions com criterion, leagues, league_members, special_predictions),
      indices e unique(user_id, match_id).
- [x] db:generate funciona: migracao 0000 gerada com as 7 tabelas (validada pelo kit).
- [ ] db:migrate aplica no Postgres: BLOQUEADO (sem conexao Postgres; ver B2).
- [x] .env.example preenchido (POSTGRES_URL..., AUTH_SECRET, AUTH_URL).

### Task 0.2 (concluida)

### Task 0.2 (concluida)
- [x] globals.css importa tokens.css; Tailwind expoe bg-indigo/text-rose/text-teal e
      rank-gold/silver/bronze. Evidencia: CSS compilado contem #16064f/#fe3173/#0ae7c6.
- [x] Plus Jakarta Sans + escala/tracking do DESIGN_SPEC (classes .t-* em globals.css).
      Evidencia: CSS compilado contem "Plus Jakarta"; body usa var(--font-sans).
- [x] Framer Motion e Lucide instalados e usados. Evidencia: FadeIn/Reveal (motion/) e
      icones Goal/Trophy/ChevronRight na home; build inclui o bundle.
- [x] Header (indigo + barra gradiente + asa), primitivos botao/input/card/pill e
      brand-bar prontos, acento por fundo correto (teal no escuro, rosa no claro).
- [x] Checklist anti-slop aprovado na home (ver D10 sobre contraste do CTA rosa).

---

## 4. Decisoes travadas

- D1. Stack: Next.js 15 App Router, TypeScript estrito, Vercel Postgres, Drizzle,
  NextAuth v5 Credentials, Tailwind v4, Framer Motion, Lucide. Deploy Vercel, repo
  GitHub, CI GitHub Actions.
- D2. Identidade Elevate como base de marca (LLM_SYSTEM_GUIDE.md), traduzida para app
  em specs/DESIGN_SPEC.md. Onde BRANDING.md divergir, o Elevate manda. Paleta:
  indigo #16064F, rosa #FE3173, teal #0AE7C6, lima #C2F24A, roxo #9E4CFE.
- D3. Fonte unica: Plus Jakarta Sans (next/font, pesos 400/500/700/800).
- D4. Acento por fundo: rosa em claro, teal em escuro. Um acento por superficie. 60.30.10.
- D5. Pontuacao: regra unica em lib/scoring.ts, pura, testada. Nao cumulativa. Ordem
  base -> Brasil -> fase. Math.round half up. Codigo validado pronto em reference-code.
- D6. Ranking: competition ranking. Desempate pontos, exact_count, created_at, user_id.
  Pontos zero exibe travessao. Opcao A: coluna criterion em predictions.
- D7. Prazo de palpite: trava estritamente no kickoff (now === kickoff recusa). UTC no
  banco, Brasilia so na exibicao.
- D8. Premio sempre em milhas LATAM Pass. Valores por faixa a confirmar com o time.
- D9. Seed estatico (lib/data/copa2026.ts): 32 selecoes + placeholders de avanco,
  chaveamento fixo, BRA x JPN garante o multiplicador x2. Codigo pronto em reference-code.

### Decisoes de implementacao deste projeto (ambiente)
- DI1. create-next-app instalou Next 16 por padrao; fixado para Next 15 (^15.5) por D1.
- DI2. eslint-config-next@15 e eslintrc-style; consumido via FlatCompat no eslint.config.mjs
  (ESLint 9 flat config). Script de lint: `eslint .`.
- DI3. Scripts db:* e test declarados na Task 0.1 mas as ferramentas (drizzle-kit, vitest,
  tsx) so sao instaladas nas Tasks 0.3/0.4/2.1; ate la esses scripts podem falhar.
- D10. Botao primario (CTA) usa texto branco sobre rosa #FE3173, conforme BRANDING.md
  (decisao de marca travada) e os wireframes. Contraste branco/rosa = 3.56:1 (passa AA
  para texto grande/bold, abaixo de 4.5 para corpo). Mantido por ser a definicao de
  marca do CTA; sinalizado para confirmacao de design, nao e bloqueio. Texto de corpo
  e rotulos seguem indigo/ink/muted com contraste >= 4.5:1.
- DI4. Componentes nomeados em minusculo/kebab (header.tsx, brand-bar.tsx, ui/button.tsx)
  para casar com a arvore do ESTRUTURA.md.
- DI5. Deploy: Vercel religada a mzinhoww-svg/desafiopass; framework forcado via
  vercel.json ("framework":"nextjs") porque o projeto estava com framework null e
  exigia output dir public. Producao no ar (commit cb24bc6, READY). PRs ganham preview.
- DI6. drizzle-orm 0.45: segundo arg do pgTable usa array (forma de objeto do DATA_SPEC
  foi deprecada na 0.36). Tabelas/colunas/constraints identicos ao DATA_SPEC.
- D11. Auth (Task 1.1): Auth.js v5 (next-auth@5 beta), padrao edge-split (lib/auth.config.ts
  sem db/bcrypt para o middleware; lib/auth.ts com Credentials + bcryptjs). Sessao JWT
  com id e role. bcryptjs (puro JS) em vez de bcrypt nativo. Rotas protegidas no MVP:
  /perfil e /ligas (login) e /admin (role admin); /partidas e /ranking ficam publicas.
  Usuarios de teste semeados: admin@latampass.test e user@latampass.test, senha bolao2026.
  AUTH_SECRET: dev em .env.local; producao usa um proprio na Vercel (nao precisa casar).

---

## 5. Log cronologico

- 2026-06-28 | Task 0.1 | scaffold Next 15 + TS estrito + Tailwind v4, tokens Elevate
  iniciais, Plus Jakarta Sans, header LATAM, home minima | npm run dev sobe a home com
  header LATAM; typecheck/lint/build verdes | commit feat(scaffold) (inicial)
- 2026-06-28 | Task 0.1 | completa tsconfig noUncheckedIndexedAccess, scripts
  test/db:*, arvore de pastas do ESTRUTURA.md e backlog | pendente commit chore(setup)
- 2026-06-28 | Task 0.1 | push da branch para o GitHub via token (PR draft bloqueado por
  policy de org: API do GitHub exige Claude GitHub App conectado) | branch publicada
- 2026-06-28 | Task 0.2 | sistema de design Elevate: tokens.css + @theme, escala
  tipografica .t-*, Framer Motion (FadeIn/Reveal) + Lucide, header com asa, brand-bar,
  primitivos ui (button/input/card/pill), home de demonstracao | typecheck/lint/build
  verdes; home mostra acento por fundo, motion e icone Lucide | commit feat(design)
- 2026-06-28 | Task 0.5 (deploy) | Vercel religada ao repo certo; vercel.json framework
  nextjs corrige output dir; deploy de producao READY | site no ar (protegido por
  Deployment Protection ate o usuario desligar) | commits chore/fix na main
- 2026-06-28 | Task 0.3 | schema Drizzle do DATA_SPEC, drizzle.config.ts, lib/db.ts,
  .env.example; migracao 0000 gerada (7 tabelas) | typecheck/lint/build verdes;
  db:generate ok; db:migrate pendente de Postgres real (B2) | commit feat(db); PR #2 merge
- 2026-06-28 | Task 0.4 | copa2026.ts, 32 bandeiras SVG em public/flags, components/
  flag.tsx e lib/data/seed.ts (upsert idempotente teams->matches) | typecheck/lint/build
  verdes; db:seed nao roda deste ambiente (egress ao Neon bloqueado, B2) | commit feat(seed)
- 2026-06-28 | infra | Neon conectado; aplicacao da migracao/seed daqui bloqueada: a
  policy de rede do ambiente nao tem o host do Neon (api.sa-east-1.aws.neon.tech) na
  allowlist. Aplicar via CI/Vercel ou allowlist do host. Ver B2.
- 2026-06-28 | Task 0.5 (CI) | ci.yml (lint/typecheck/test/build) + db.yml (migrate+seed),
  vitest, secret POSTGRES_URL criado via API | run 28332601479 verde: migracao + seed
  aplicados no Neon | PR #4 merge
- 2026-06-28 | Task 1.1 | Auth.js v5 edge-split (auth.config/auth.ts), Credentials +
  bcryptjs, route handler, middleware (/perfil,/ligas login; /admin role), getCurrentUser,
  augmentacao de tipos, usuarios de teste no seed | typecheck/lint/build verdes (build ok
  sem AUTH_SECRET; rota dinamica) | commit feat(auth); login funcional valida em prod
- 2026-06-28 | Task 1.2 | /cadastro (useActionState) + signup action (Zod, unicidade,
  bcrypt) + /login (signIn v5) exigido pelo middleware | typecheck/lint/build verdes;
  rotas /cadastro e /login geradas | commit feat(auth) cadastro
- 2026-06-28 | Task 1.3 | /perfil (Server Component): pontos/posicao via getMyRank
  (lib/queries/ranking, agregado server-side), edicao de apelido (unicidade) e time do
  coracao + logout (Server Actions) | typecheck/lint/build verdes | commit feat(profile)
- Nota: verificacao funcional de login/cadastro/perfil ocorre em producao (egress ao
  banco/site bloqueado deste ambiente). Codigo coberto por typecheck/lint/build + CI.
- 2026-06-28 | nav | tab bar inferior (Inicio/Jogos/Ranking/Ligas/Perfil), breadcrumbs,
  empty-state, link-button; home com CTAs reais; placeholders /ranking e /ligas | verde
- 2026-06-28 | Task 2.2 | lib/queries/matches, lib/phases/teams/utils/dates, match-card,
  /partidas por fase com selos e estado, horario Brasilia | typecheck/lint/build verdes
- 2026-06-28 | Task 2.3 | score-input, predict-form, app/actions/palpite (scoreSchema,
  prazo server-side now<kickoff, upsert unique user+match), /partidas/[id] editavel/travado
- 2026-06-28 | Task 2.4 | app/actions/admin (role admin, adminResultSchema, grava placar+
  encerrada, finalPoints->points+criterion, idempotente), /admin e /admin/partidas/[id]
- 2026-06-28 | Task 2.5 | /partidas/[id] encerrada: 'Voce palpitou', 'O placar foi',
  pontos (lima) + frase do criterio; match-card encerrado idem. Le do banco, sem recalcular
- D12. Decisoes Slice 2: /partidas e /ranking publicas; palpite exige login (CTA Entrar);
  /perfil,/ligas,/admin protegidos pelo middleware. Times exibidos via mapa estatico do
  seed (lib/teams), sem join. Idempotencia do admin: sobrescreve points/criterion.

---

## 6. Bloqueios e ambiguidades

- B1. (RESOLVIDO) Push/PR: usuario forneceu token GitHub; push via token direto,
  PR #1 criado e mergeado na main. MCP do GitHub segue read-only (app de org nao
  conectado), mas a API direta com o token funciona por egress direto.
- B2. (RESOLVIDO via CI) db:migrate e db:seed nao rodam deste ambiente (egress da rede
  bloqueia o Neon: TCP 5432 e o host api.*.neon.tech fora da allowlist). Solucao: o
  workflow .github/workflows/db.yml roda no GitHub Actions (egress livre) com o secret
  POSTGRES_URL. Run 28332601479 aplicou migracao + seed com sucesso. Para reaplicar:
  dispatch do workflow "Database". Detalhe historico abaixo.
- B2-hist. Postgres e TCP cru (porta 5432),
  que o proxy de egress nao suporta ("raw-TCP databases"). A migracao 0000 esta gerada
  e validada (SQL). Aplicar em Postgres real precisa acontecer na Vercel/CI ou na
  maquina do usuario. Opcoes: (a) usuario provisiona Vercel Postgres (adiciona
  POSTGRES_URL ao projeto) e roda a migracao no deploy/CI; (b) autorizar um Postgres
  (Neon/Supabase) para validar o apply via MCP server-side. Mesmo bloqueio vale para
  o db:seed da Task 0.4.

---

## 7. Fora de escopo (V2 / backlog de ideias, nao implementar)

Palpites especiais (campeao, artilheiro, +150 cada). Ranking exclusivo socio LATAM Pass.
Rankings por recorte. Estatistica da comunidade. API externa de futebol. Avanco dinamico
de chaveamento. Saque/credito automatico de milhas. Sair/gerenciar membros de liga.
Login social e recuperacao de senha. CRUD de partidas pela UI.
