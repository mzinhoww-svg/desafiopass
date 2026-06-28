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
- [ ] Task 0.3 Banco e ORM
- [ ] Task 0.4 Seed Copa 2026
- [ ] Task 0.5 Deploy

### Slice 1: Auth e perfil
- [ ] Task 1.1 NextAuth Credentials
- [ ] Task 1.2 Cadastro
- [ ] Task 1.3 Perfil

### Slice 2: Palpites e pontuacao
- [ ] Task 2.1 Logica de pontuacao (isolada, testada)
- [ ] Task 2.2 Lista de partidas
- [ ] Task 2.3 Registrar palpite
- [ ] Task 2.4 Encerrar e pontuar (admin)
- [ ] Task 2.5 Resultado na UI

### Slice 3: Ranking
- [ ] Task 3.1 Ranking geral

### Slice 4: Ligas privadas
- [ ] Task 4.1 Criar liga
- [ ] Task 4.2 Entrar na liga
- [ ] Task 4.3 Ranking da liga

### Slice 5: Regras, premios e acabamento
- [ ] Task 5.1 Regras e premios
- [ ] Task 5.2 Home
- [ ] Task 5.3 QA e responsivo
- [ ] Task 5.4 Release

---

## 3. Must-haves da task atual (proxima: Task 0.3 Banco e ORM)

A definir ao iniciar a 0.3. Must-haves da 0.2 (concluida) abaixo, com evidencia.

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

---

## 6. Bloqueios e ambiguidades

- B1. Push e PR bloqueados por permissao: git relay e MCP do GitHub retornam 403
  (integracao com acesso de leitura em mzinhoww-svg/desafiopass). Usuario vai conceder
  write (contents + pull requests). Ate la, trabalho commitado localmente.

---

## 7. Fora de escopo (V2 / backlog de ideias, nao implementar)

Palpites especiais (campeao, artilheiro, +150 cada). Ranking exclusivo socio LATAM Pass.
Rankings por recorte. Estatistica da comunidade. API externa de futebol. Avanco dinamico
de chaveamento. Saque/credito automatico de milhas. Sair/gerenciar membros de liga.
Login social e recuperacao de senha. CRUD de partidas pela UI.
