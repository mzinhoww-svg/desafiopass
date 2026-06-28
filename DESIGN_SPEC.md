# specs/DESIGN_SPEC.md

Direcao de design do Bolao LATAM Pass. A identidade visual segue o LATAM Pass Elevate
Design System (LLM_SYSTEM_GUIDE.md) como fonte unica de marca: paleta oficial Elevate e
Plus Jakarta Sans. Sobre essa base aplicamos inteligencia de design de produto
(impeccable, ui-ux-pro-max, tripled-ui) para traduzir o sistema de SLIDES do Elevate em
um APP mobile interativo. Onde houver conflito, a regra de resolucao esta na secao 1.

---

## 0. De onde vem cada decisao

- **Base de marca (manda na identidade): LLM_SYSTEM_GUIDE.md (Elevate Design System).**
  Paleta Elevate oficial (indigo #16064F, rosa #FE3173, teal #0AE7C6, lima #C2F24A,
  roxo #9E4CFE), Plus Jakarta Sans, regra de cor 60.30.10, acento unico por superficie,
  acento que muda conforme o fundo (rosa em claro, teal em escuro).
- **Traducao slide -> app (decisao deste spec):** o guia Elevate descreve slides
  projetados (frames, h-display 112px, asa watermark, KPI row de deck). Este app e
  mobile e interativo. Adotamos a IDENTIDADE do Elevate (cor, fonte, hierarquia,
  disciplina de acento) e a traduzimos para componentes de tela de celular (header,
  match-card, score-input, ranking-row). Nao portamos os componentes de slide.
- **ui-ux-pro-max (estetica funcional):** estetica atletica para contexto esportivo
  (peso, escala oversized, alto contraste) aplicada sobre a fonte e a cor Elevate, e a
  paleta de posicao de ranking ouro/prata/bronze.
- **impeccable (rigor anti-slop):** banimentos absolutos (sem side-stripe, sem gradient
  text, sem glassmorphism decorativo, sem eyebrow tracado em toda secao, sem card grid
  identico repetido), contraste verificado, motion intencional com reduced-motion.
- **tripled-ui (assets e padroes de codigo):** Lucide React para icones (nunca emoji
  estrutural), Framer Motion para entrada e scroll reveal, qualidade de producao
  mobile-first.

---

## 1. Fonte e identidade (decisao travada)

A identidade do app segue o Elevate Design System. Duas decisoes do usuario fixam isso:

1. **Fonte: Plus Jakarta Sans** (do guia Elevate), substituindo Trebuchet MS. Decisao do
   usuario, final para o MVP. Carregar via next/font (Google Fonts), pesos 400, 500, 700
   e 800. Fallback de sistema: system-ui, sans-serif.
2. **Paleta: Elevate oficial** (secao 2). Substitui o navy/magenta antigo do BRANDING.md.
   O BRANDING.md permanece como referencia historica; onde divergir do Elevate, o Elevate
   manda.

A skill ui-ux-pro-max recomenda fonte condensada para esporte. Nao adotamos fonte nova: a
energia atletica vem do peso (800 em numeros e titulos), da escala oversized (placar e
pontos dominam a tela) e do tracking negativo em titulos grandes, tudo sobre Jakarta.

---

## 2. Estrategia de cor (Elevate 60.30.10)

Regra de cor do Elevate, aplicada ao app: **60% neutro** (cloud/paper), **30% indigo**
(headers, heros, quebras, faixas de marca), **10% acento vibrante**. Um unico elemento de
acento por superficie. O acento muda conforme o fundo: **rosa #FE3173 em fundo claro,
teal #0AE7C6 em fundo escuro.**

Justificativa de cena (exigida pelo impeccable): o produto e usado no celular, durante os
jogos da Copa, em casa, com a TV ligada, em clima de torcida. Pede energia e contraste
alto. O indigo Elevate carrega as superficies de marca (header, home hero, quebras) e o
acento pontua acao e destaque, espelhando a identidade LATAM e o clima de estadio.

Proibido (impeccable, absolute bans): fundo cream/sand/bege, gradient text, side-stripe
como acento, glassmorphism decorativo, card grid identico repetido. Proibido tambem
(regra Elevate): parede inteira em rosa ou teal; mais de um acento por superficie.

### 2.1 Paleta funcional consolidada (tokens Elevate)

Tokens de marca (de LLM_SYSTEM_GUIDE.md secao 2, valores exatos):
```
--indigo:#16064F        /* base escura, tinta primaria */
--indigo-light:#2C1183  /* parceiro de gradiente */
--indigo-deep:#0C0233   /* fundo ink, vinheta, momentos-heroi */
--rose:#FE3173          /* acento em fundo CLARO (acao, destaque) */
--teal:#0AE7C6          /* acento em fundo ESCURO (dados, destaque) */
--lime:#C2F24A          /* positivo / destaque pontual */
--purple:#9E4CFE        /* acento 2 / gradiente decorativo */
--cloud:#F3F2F8         /* fundo de tela claro */
--paper:#FFFFFF         /* cards, tabelas, superficie de leitura */
--ink:#18112E           /* texto em fundo claro */
--muted:#6B6586         /* texto secundario em fundo claro */
--muted-dark:#B9B2D6    /* texto secundario em fundo escuro */
--grad:linear-gradient(135deg,var(--indigo-light),var(--rose))
```

Tokens de ranking (de ui-ux-pro-max, decisao travada, mantida):
```
--rank-gold:#FFD700    /* 1o lugar */
--rank-silver:#C0C0C0  /* 2o lugar */
--rank-bronze:#CD7F32  /* 3o lugar */
```

Regras:
- Acao primaria (botao salvar palpite, CTA) usa rosa em tela clara. Em superficie escura
  (header, hero), o destaque equivalente usa teal.
- Os tokens de rank valem so para os badges de posicao do top 3. A linha do usuario
  logado usa realce com lima suave (estado, nao posicao) ou um wash de indigo leve;
  nunca competir com o ouro/prata/bronze.
- Positivo (delta para cima, acerto) pode usar lima ou teal conforme o fundo. Negativo /
  erro usa rosa. Nunca verde generico fora desses tokens.

### 2.2 Mapa de fundo por tela (heuristica Elevate claro/escuro)

Elevate: claro = ler e analisar; escuro = sentir e impactar. Aplicado ao app:
- **Claro (cloud/paper):** lista de jogos, tela de palpite, ranking, ligas, regras.
  Maioria do app. E onde se le e se age.
- **Escuro (indigo/ink):** header, home hero, faixa de premio em milhas, tela de
  encerramento de rodada, estados de destaque. Momentos de marca e de impacto.
- Nunca duas superficies escuras coladas sem conteudo claro entre elas.

---

## 3. Tipografia (Plus Jakarta Sans, escala mobile)

Fonte: Plus Jakarta Sans (Elevate). Estetica atletica via peso, escala e tracking. A
escala do guia Elevate e de slide (112/96/88/68px); aqui ela e reduzida para mobile,
preservando a hierarquia e os pesos (800 em titulo e numero).

| Elemento | Mobile | Peso | Tracking | Cor |
|---|---|---|---|---|
| Display de tela (home hero) | clamp(2rem, 8vw, 3rem) | 800 | -0.03em | indigo ou branco |
| Titulo de tela | 26px | 800 | -0.02em | indigo ou branco |
| Titulo de secao (kicker, caixa alta) | 14px | 700 | 0.04em | indigo ou muted |
| Titulo de card | 16px | 700 | -0.01em | indigo |
| Lead / abertura | 18px | 500 | 0 | ink ou muted |
| Corpo | 15px | 400 | 0 | ink / branco |
| Numero de placar | clamp(2rem, 9vw, 2.5rem) | 800 | -0.02em | indigo ou rosa |
| Numero de pontos | 32px | 800 | -0.02em | indigo (lima/teal se positivo) |
| Caption / fonte de dado | 12px | 400 | 0 | muted |

Regras do impeccable: corpo nunca em cinza claro sobre fundo claro (contraste minimo
4.5:1; usar --ink ou --muted, nunca abaixo). Numero de placar e a unidade tipografica
mais forte da tela de palpite. Line length de prosa entre 38 e 46ch em mobile (regra
Elevate secao 8), ate 65ch em telas maiores. text-wrap:pretty em titulos e paragrafos.

Italico-assinatura do Elevate (palavra em destaque com enfase): permitido com muita
parcimonia em momentos de marca (home hero, tela de encerramento), nunca em titulo de
conteudo, card, tabela ou corpo. Replica a regra do guia (secao 5 e 9).

---

## 4. Motion (tripled-ui + impeccable)

- Entrada de tela: fade e translate suave (opacity 0 a 1, y 24 a 0), ease-out, ~0.5s.
- Scroll reveal em listas (partidas, ranking): stagger leve por item, useInView once.
- Transicao de estado do palpite (salvar): feedback imediato, micro-interacao no botao.
- Mudanca de ranking: highlight sutil na linha que muda.
- reduced-motion: toda animacao tem alternativa de crossfade ou instantanea. Nao
  opcional.
- Curvas ease-out exponenciais. Sem bounce, sem elastic.
- Reveal sempre realca um default ja visivel. Nunca esconder conteudo atras de classe de
  transicao (senao renderiza em branco em aba inativa).

Biblioteca: Framer Motion (motion.div, useInView, AnimatePresence).

---

## 5. Icones e assets (tripled-ui + Elevate)

- Icones: Lucide React. Nunca emoji como icone estrutural. Exemplos: trofeu (ranking),
  escudo/grupo (liga), relogio (prazo), check (acerto), lock (palpite travado), chevron
  (navegacao), share (convite).
- Bandeiras de selecao: assets SVG reais (biblioteca flag-icons) servidos de
  /public/flags. Componente Flag renderiza o SVG. Proibido emoji de bandeira. Para
  confrontos ainda nao definidos (placeholders de avanco), mostrar escudo neutro.
- Faixa de marca: usar a barra gradiente Elevate (--grad) na borda inferior do header e
  em quebras. A "asa" decorativa do Elevate (secao 6.8 do guia, SVG inline) e permitida
  so em superficie escura de destaque (home hero, encerramento), sempre sangrando por um
  canto, opacidade 0.14 a 0.18, nunca atras de texto. Nao usar em telas de conteudo.

---

## 6. Layout e componentes (traducao Elevate -> app)

Regras do impeccable e do Elevate que definem os componentes:

- **Cards com moderacao.** Card e usado quando e a melhor affordance (match-card,
  league-card). Nunca card aninhado. A lista de ranking nao e um grid de cards
  identicos; e uma lista densa de linhas (ranking-row), que escaneia mais rapido no
  celular. Espelha a regra Elevate de um componente de corpo por superficie.
- **Header:** superficie indigo (--indigo), titulo em caixa alta peso 800, simbolo de
  marca, barra gradiente Elevate (--grad) na borda inferior. Acento de destaque no header
  e teal (fundo escuro). Asa decorativa opcional so em home.
- **Match-card:** superficie paper. Selecoes com bandeira SVG e codigo, selo de fase com
  multiplicador, selo de x2 Brasil (rosa, pois o card e claro), estado (sem palpite /
  palpitado / encerrado com pontos). Borda completa sutil, nunca side-stripe.
- **Score-input:** a estrela da tela de palpite. Dois numeros grandes (escala oversized),
  bandeiras ao lado, stepper opcional. Acento de acao em rosa. Estado travado em cinza
  (--muted sobre cloud) quando o prazo passou, com icone de lock Lucide.
- **Ranking-row:** posicao com badge ouro/prata/bronze no top 3 (tokens da secao 2.1),
  apelido, pontos em peso 800 a direita. Linha do usuario realcada em lima suave (estado,
  nao posicao). Numero grande e legivel. Sem card por linha. Pontos zero exibem travessao
  (regra do RANKING_SPEC), nunca numero.
- **Selos (pills):** fase, status, x2 Brasil. Pequenos, caixa alta, peso 700. Variantes de
  cor seguem o guia Elevate (neutro, rosa, teal, lima) conforme o fundo.
- **Faixa de premio (milhas):** superficie escura (indigo/ink), numero grande, acento
  teal. Momento de impacto, segue a heuristica de fundo escuro do Elevate.
- **Estados vazios:** texto caption centralizado, direto, tom PROF. Ex "Voce ainda nao
  entrou em nenhuma liga." Sem ilustracao generica de terceiro. Pode ter um icone Lucide
  discreto.

---

## 7. Checklist anti-slop (rodar antes de aprovar qualquer tela)

Do impeccable, ui-ux-pro-max e das proibicoes do guia Elevate (secao 9), consolidado:

- [ ] Sem emoji como icone estrutural ou bandeira (Lucide e SVG real em vez disso).
- [ ] Sem side-stripe border como acento.
- [ ] Sem gradient text.
- [ ] Sem glassmorphism decorativo.
- [ ] Sem eyebrow tracado em caixa alta acima de toda secao.
- [ ] Sem grid de cards identicos repetidos.
- [ ] Sem fundo cream/sand/bege.
- [ ] Regra Elevate: no maximo 1 acento por superficie; sem parede inteira rosa ou teal.
- [ ] Acento certo para o fundo: rosa em claro, teal em escuro.
- [ ] Italico-assinatura so em momento de marca, nunca em conteudo.
- [ ] Contraste body >= 4.5:1, large >= 3:1. Placeholder tambem 4.5:1.
- [ ] Toque minimo 44x44px. cursor-pointer em clicaveis.
- [ ] Foco visivel para teclado (outline rosa 2px em fundo claro, teal em escuro).
- [ ] reduced-motion respeitado.
- [ ] Responsivo testado em 375, 768, 1024, 1440.
- [ ] Titulo nao estoura o container em nenhum breakpoint.
- [ ] Teste do slop: ninguem olha e diz "isso e AI". A identidade le como LATAM Pass Elevate.

---

## 8. O que esta decidido vs o que pergunta

Decidido (nao reabrir no codigo): identidade Elevate como base, Plus Jakarta Sans,
paleta Elevate oficial (indigo/rosa/teal/lima/roxo), regra de cor 60.30.10 com acento por
fundo, tokens de rank ouro/prata/bronze, estetica atletica via peso e escala, Lucide,
Framer Motion, banimentos do impeccable, traducao slide -> app (nao portar componentes de
slide).

Pergunta antes (nao decidir sozinho): qualquer fonte display nova alem de Jakarta,
qualquer cor fora da paleta Elevate, qualquer asset de marca que nao exista e precise ser
criado, e o conteudo final dos valores de premio em milhas.
