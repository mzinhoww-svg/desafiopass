// lib/email/templates.ts
//
// HTML de e-mail responsivo e à prova de clients (tabelas + estilos inline).
// Identidade visual: índigo #16064F, rosa #FE3173, teal #0AE7C6.
// Sem emoji, sem imagens externas pesadas (logo em texto para máxima entrega).
//
// Bilíngue: cada template recebe o locale do destinatário ('pt' | 'es') e escolhe
// o texto com L(locale, pt, es).

import type { Locale } from "@/lib/i18n";

const INDIGO = "#16064F";
const INDIGO_DEEP = "#0E0436";
const ROSE = "#FE3173";
const TEAL = "#0AE7C6";
const INK = "#1B1B2F";
const MUTED = "#6B6B85";
const PAPER = "#FFFFFF";
const CLOUD = "#F4F4F8";

const FONT =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function L(locale: Locale, pt: string, es: string): string {
  return locale === "es" ? es : pt;
}

interface ShellOptions {
  locale: Locale;
  title: string;
  preheader: string;
  bodyHtml: string;
}

// Esqueleto comum: cabeçalho índigo com marca, corpo branco, barra de marca e
// rodapé discreto. Largura 600px, centralizado, com preheader oculto.
function shell({ locale, title, preheader, bodyHtml }: ShellOptions): string {
  return `<!doctype html>
<html lang="${locale === "es" ? "es-CL" : "pt-BR"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${CLOUD};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${CLOUD};">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CLOUD};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:${PAPER};border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(22,6,79,0.10);">
  <tr>
    <td style="background:linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_DEEP} 100%);padding:28px 32px;">
      <span style="font-family:${FONT};font-size:18px;font-weight:800;letter-spacing:.5px;color:#FFFFFF;text-transform:uppercase;">${L(locale, "Bolão Pass", "Polla Pass")}</span>
      <div style="font-family:${FONT};font-size:13px;color:#C9C5E6;margin-top:2px;">${L(locale, "Copa 2026 · Mata-mata", "Copa 2026 · Eliminatorias")}</div>
    </td>
  </tr>
  <tr><td style="height:4px;background:linear-gradient(90deg, ${ROSE} 0%, ${TEAL} 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="padding:32px;font-family:${FONT};">
      ${bodyHtml}
    </td>
  </tr>
  <tr>
    <td style="padding:20px 32px;background:${CLOUD};font-family:${FONT};font-size:12px;color:${MUTED};">
      ${L(locale, "Bolão Pass · Copa 2026", "Polla Pass · Copa 2026")}<br>
      ${L(locale, "Você recebeu este e-mail porque tem uma conta no bolão.", "Recibiste este correo porque tienes una cuenta en la polla.")}
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="border-radius:999px;background:${ROSE};">
<a href="${href}" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:15px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:999px;">${label}</a>
</td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:24px;font-weight:800;color:${INDIGO};line-height:1.2;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">${text}</p>`;
}

// --- Template: recuperação de senha (#1) ---
export function passwordResetEmail(args: {
  nickname: string;
  resetUrl: string;
  locale?: Locale;
}): { subject: string; html: string; text: string } {
  const locale = args.locale ?? "pt";
  const subject = L(
    locale,
    "Redefina sua senha · Bolão Pass",
    "Restablece tu contraseña · Polla Pass",
  );
  const body = `
    ${heading(L(locale, "Redefinir senha", "Restablecer contraseña"))}
    ${paragraph(L(locale, `Olá, <strong>${escapeHtml(args.nickname)}</strong>.`, `Hola, <strong>${escapeHtml(args.nickname)}</strong>.`))}
    ${paragraph(L(locale, "Recebemos um pedido para redefinir a senha da sua conta no bolão. Toque no botão abaixo para criar uma nova senha. O link vale por 1 hora.", "Recibimos una solicitud para restablecer la contraseña de tu cuenta. Toca el botón de abajo para crear una nueva contraseña. El enlace vale por 1 hora."))}
    ${button(args.resetUrl, L(locale, "Criar nova senha", "Crear nueva contraseña"))}
    ${paragraph(L(locale, `Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="color:${MUTED};font-size:13px;word-break:break-all;">${args.resetUrl}</span>`, `Si el botón no funciona, copia y pega esta dirección en el navegador:<br><span style="color:${MUTED};font-size:13px;word-break:break-all;">${args.resetUrl}</span>`))}
    ${paragraph(`<span style="color:${MUTED};font-size:13px;">${L(locale, "Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.", "Si no lo solicitaste, puedes ignorar este correo — tu contraseña sigue igual.")}</span>`)}
  `;
  const text = L(
    locale,
    `Redefinir senha - Bolão Pass

Olá, ${args.nickname}.
Recebemos um pedido para redefinir sua senha. Acesse o link abaixo (válido por 1 hora):
${args.resetUrl}

Se você não pediu isso, ignore este e-mail.`,
    `Restablecer contraseña - Polla Pass

Hola, ${args.nickname}.
Recibimos una solicitud para restablecer tu contraseña. Entra al enlace de abajo (válido por 1 hora):
${args.resetUrl}

Si no lo solicitaste, ignora este correo.`,
  );
  return {
    subject,
    html: shell({
      locale,
      title: subject,
      preheader: L(
        locale,
        "Link para criar uma nova senha (válido por 1 hora).",
        "Enlace para crear una nueva contraseña (válido por 1 hora).",
      ),
      bodyHtml: body,
    }),
    text,
  };
}

// --- Template: lembrete de palpites pendentes (#5) ---
export function reminderEmail(args: {
  nickname: string;
  matchesUrl: string;
  games: Array<{ label: string; when: string }>;
  locale?: Locale;
}): { subject: string; html: string; text: string } {
  const locale = args.locale ?? "pt";
  const count = args.games.length;
  const subject =
    count === 1
      ? L(locale, "Falta 1 palpite · Bolão Pass", "Falta 1 pronóstico · Polla Pass")
      : L(
          locale,
          `Faltam ${count} palpites · Bolão Pass`,
          `Faltan ${count} pronósticos · Polla Pass`,
        );

  const rows = args.games
    .map(
      (g) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:15px;font-weight:700;color:${INDIGO};">${escapeHtml(g.label)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${escapeHtml(g.when)}</td>
      </tr>`,
    )
    .join("");

  const headingText =
    count === 1
      ? L(locale, "Falta 1 jogo para palpitar", "Falta 1 partido por pronosticar")
      : L(
          locale,
          `Faltam ${count} jogos para palpitar`,
          `Faltan ${count} partidos por pronosticar`,
        );
  const body = `
    ${heading(headingText)}
    ${paragraph(L(locale, `Olá, <strong>${escapeHtml(args.nickname)}</strong>. O apito está chegando e estes jogos ainda esperam o seu palpite:`, `Hola, <strong>${escapeHtml(args.nickname)}</strong>. El pitazo se acerca y estos partidos aún esperan tu pronóstico:`))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>
    ${button(args.matchesUrl, L(locale, "Palpitar agora", "Pronosticar ahora"))}
    ${paragraph(`<span style="color:${MUTED};font-size:13px;">${L(locale, "Sem palpite até o apito, o jogo vale zero ponto. Não perca pontos por esquecimento.", "Sin pronóstico antes del pitazo, el partido vale cero puntos. No pierdas puntos por olvido.")}</span>`)}
  `;
  const text = L(
    locale,
    `${subject}

Olá, ${args.nickname}. Estes jogos ainda esperam o seu palpite:
${args.games.map((g) => `- ${g.label} (${g.when})`).join("\n")}

Palpite agora: ${args.matchesUrl}`,
    `${subject}

Hola, ${args.nickname}. Estos partidos aún esperan tu pronóstico:
${args.games.map((g) => `- ${g.label} (${g.when})`).join("\n")}

Pronostica ahora: ${args.matchesUrl}`,
  );
  return {
    subject,
    html: shell({
      locale,
      title: subject,
      preheader: L(
        locale,
        "O apito está chegando e há jogos sem o seu palpite.",
        "El pitazo se acerca y hay partidos sin tu pronóstico.",
      ),
      bodyHtml: body,
    }),
    text,
  };
}

// --- Template: resultado de um jogo encerrado (#6) ---
export function resultEmail(args: {
  nickname: string;
  matchLabel: string;
  scoreLabel: string;
  guessLabel: string;
  points: number;
  position: number | null;
  rankingUrl: string;
  locale?: Locale;
}): { subject: string; html: string; text: string } {
  const locale = args.locale ?? "pt";
  const subject = L(
    locale,
    `Você fez ${args.points} pts em ${args.matchLabel} · Bolão Pass`,
    `Hiciste ${args.points} pts en ${args.matchLabel} · Polla Pass`,
  );
  const posLine =
    args.position != null
      ? L(
          locale,
          `Você está em <strong>${args.position}º</strong> no ranking geral.`,
          `Estás en el <strong>${args.position}º</strong> del ranking general.`,
        )
      : L(
          locale,
          "Faça mais palpites para entrar no ranking.",
          "Haz más pronósticos para entrar al ranking.",
        );
  const body = `
    ${heading(L(locale, "Resultado saiu!", "¡Salió el resultado!"))}
    ${paragraph(L(locale, `Olá, <strong>${escapeHtml(args.nickname)}</strong>. O jogo <strong>${escapeHtml(args.matchLabel)}</strong> terminou <strong>${escapeHtml(args.scoreLabel)}</strong>.`, `Hola, <strong>${escapeHtml(args.nickname)}</strong>. El partido <strong>${escapeHtml(args.matchLabel)}</strong> terminó <strong>${escapeHtml(args.scoreLabel)}</strong>.`))}
    ${paragraph(L(locale, `Seu palpite: ${escapeHtml(args.guessLabel)} — você somou <strong>${args.points} pts</strong>. ${posLine}`, `Tu pronóstico: ${escapeHtml(args.guessLabel)} — sumaste <strong>${args.points} pts</strong>. ${posLine}`))}
    ${button(args.rankingUrl, L(locale, "Ver o ranking", "Ver el ranking"))}
  `;
  const text = L(
    locale,
    `${subject}

Olá, ${args.nickname}. ${args.matchLabel} terminou ${args.scoreLabel}.
Seu palpite: ${args.guessLabel} — ${args.points} pts.
${args.position != null ? `Você está em ${args.position}º no ranking geral.` : ""}
Ranking: ${args.rankingUrl}`,
    `${subject}

Hola, ${args.nickname}. ${args.matchLabel} terminó ${args.scoreLabel}.
Tu pronóstico: ${args.guessLabel} — ${args.points} pts.
${args.position != null ? `Estás en el ${args.position}º del ranking general.` : ""}
Ranking: ${args.rankingUrl}`,
  );
  return {
    subject,
    html: shell({
      locale,
      title: subject,
      preheader: L(
        locale,
        `${args.matchLabel} terminou ${args.scoreLabel}.`,
        `${args.matchLabel} terminó ${args.scoreLabel}.`,
      ),
      bodyHtml: body,
    }),
    text,
  };
}

// --- Template: aviso de fase aberta (ex.: oitavas) ---
export function phaseOpenEmail(args: {
  nickname: string;
  phaseLabel: string;
  games: Array<{ label: string; when: string }>;
  matchesUrl: string;
  locale?: Locale;
  prizeTeaser?: boolean;
}): { subject: string; html: string; text: string } {
  const locale = args.locale ?? "pt";
  const subject = L(
    locale,
    `As ${args.phaseLabel} estão abertas! · Bolão Pass`,
    `¡${args.phaseLabel} ya está abierta! · Polla Pass`,
  );
  const rows = args.games
    .map(
      (g) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:15px;font-weight:700;color:${INDIGO};">${escapeHtml(g.label)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${escapeHtml(g.when)}</td>
      </tr>`,
    )
    .join("");
  const prize = args.prizeTeaser
    ? paragraph(
        `<span style="color:${ROSE};font-weight:800;">${L(locale, "🎁 Tem prêmio surpresa nesta reta final.", "🎁 Hay un premio sorpresa en esta recta final.")}</span> ${L(locale, "Palpite todos os jogos até a final e concorra.", "Pronostica todos los partidos hasta la final y participa.")}`,
      )
    : "";
  const body = `
    ${heading(L(locale, `${args.phaseLabel} abertas!`, `¡${args.phaseLabel}!`))}
    ${paragraph(L(locale, `Olá, <strong>${escapeHtml(args.nickname)}</strong>. Começou o mata-mata da reta final — já dá para palpitar:`, `Hola, <strong>${escapeHtml(args.nickname)}</strong>. Empezó la fase decisiva — ya puedes pronosticar:`))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>
    ${prize}
    ${button(args.matchesUrl, L(locale, "Fazer meus palpites", "Hacer mis pronósticos"))}
    ${paragraph(`<span style="color:${MUTED};font-size:13px;">${L(locale, "O prazo de cada jogo fecha no apito inicial. Vale o último palpite.", "El plazo de cada partido cierra al pitazo inicial. Vale el último pronóstico.")}</span>`)}
  `;
  const text = L(
    locale,
    `${subject}

Olá, ${args.nickname}. Começou o mata-mata da reta final:
${args.games.map((g) => `- ${g.label} (${g.when})`).join("\n")}

Palpite agora: ${args.matchesUrl}`,
    `${subject}

Hola, ${args.nickname}. Empezó la fase decisiva:
${args.games.map((g) => `- ${g.label} (${g.when})`).join("\n")}

Pronostica ahora: ${args.matchesUrl}`,
  );
  return {
    subject,
    html: shell({
      locale,
      title: subject,
      preheader: L(
        locale,
        "Começou o mata-mata da reta final. Faça seus palpites.",
        "Empezó la fase decisiva. Haz tus pronósticos.",
      ),
      bodyHtml: body,
    }),
    text,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
