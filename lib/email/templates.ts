// lib/email/templates.ts
//
// HTML de e-mail responsivo e à prova de clients (tabelas + estilos inline).
// Identidade LATAM Pass Elevate: índigo #16064F, rosa #FE3173, teal #0AE7C6.
// Sem emoji, sem imagens externas pesadas (logo em texto para máxima entrega).

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

interface ShellOptions {
  title: string;
  preheader: string;
  bodyHtml: string;
}

// Esqueleto comum: cabeçalho índigo com marca, corpo branco, barra de marca e
// rodapé discreto. Largura 600px, centralizado, com preheader oculto.
function shell({ title, preheader, bodyHtml }: ShellOptions): string {
  return `<!doctype html>
<html lang="pt-BR">
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
      <span style="font-family:${FONT};font-size:18px;font-weight:800;letter-spacing:.5px;color:#FFFFFF;text-transform:uppercase;">Bolão LATAM Pass</span>
      <div style="font-family:${FONT};font-size:13px;color:#C9C5E6;margin-top:2px;">Copa 2026 · Mata-mata</div>
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
      Bolão LATAM Pass · Copa 2026<br>
      Você recebeu este e-mail porque tem uma conta no bolão.
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
}): { subject: string; html: string; text: string } {
  const subject = "Redefina sua senha · Bolão LATAM Pass";
  const body = `
    ${heading("Redefinir senha")}
    ${paragraph(`Olá, <strong>${escapeHtml(args.nickname)}</strong>.`)}
    ${paragraph("Recebemos um pedido para redefinir a senha da sua conta no bolão. Toque no botão abaixo para criar uma nova senha. O link vale por 1 hora.")}
    ${button(args.resetUrl, "Criar nova senha")}
    ${paragraph(`Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="color:${MUTED};font-size:13px;word-break:break-all;">${args.resetUrl}</span>`)}
    ${paragraph(`<span style="color:${MUTED};font-size:13px;">Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</span>`)}
  `;
  const text = `Redefinir senha - Bolão LATAM Pass

Olá, ${args.nickname}.
Recebemos um pedido para redefinir sua senha. Acesse o link abaixo (válido por 1 hora):
${args.resetUrl}

Se você não pediu isso, ignore este e-mail.`;
  return {
    subject,
    html: shell({ title: subject, preheader: "Link para criar uma nova senha (válido por 1 hora).", bodyHtml: body }),
    text,
  };
}

// --- Template: lembrete de palpites pendentes (#5) ---
export function reminderEmail(args: {
  nickname: string;
  matchesUrl: string;
  games: Array<{ label: string; when: string }>;
}): { subject: string; html: string; text: string } {
  const count = args.games.length;
  const subject =
    count === 1
      ? "Falta 1 palpite · Bolão LATAM Pass"
      : `Faltam ${count} palpites · Bolão LATAM Pass`;

  const rows = args.games
    .map(
      (g) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:15px;font-weight:700;color:${INDIGO};">${escapeHtml(g.label)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #ECECF3;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${escapeHtml(g.when)}</td>
      </tr>`,
    )
    .join("");

  const body = `
    ${heading(count === 1 ? "Falta 1 jogo para palpitar" : `Faltam ${count} jogos para palpitar`)}
    ${paragraph(`Olá, <strong>${escapeHtml(args.nickname)}</strong>. O apito está chegando e estes jogos ainda esperam o seu palpite:`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">${rows}</table>
    ${button(args.matchesUrl, "Palpitar agora")}
    ${paragraph(`<span style="color:${MUTED};font-size:13px;">Sem palpite até o apito, o jogo vale zero ponto. Não perca pontos por esquecimento.</span>`)}
  `;
  const text = `${subject}

Olá, ${args.nickname}. Estes jogos ainda esperam o seu palpite:
${args.games.map((g) => `- ${g.label} (${g.when})`).join("\n")}

Palpite agora: ${args.matchesUrl}`;
  return {
    subject,
    html: shell({
      title: subject,
      preheader: "O apito está chegando e há jogos sem o seu palpite.",
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
