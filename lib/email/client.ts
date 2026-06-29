// lib/email/client.ts
//
// Envio de e-mail transacional via Brevo (dominio conectado la). Usa a API REST
// (sem SDK) para rodar no runtime do Next sem dependencia extra. Nunca lanca: em
// falta de chave ou erro de rede, registra e segue (o fluxo de UX nao quebra).
//
// Env necessarias em producao:
//   BREVO_API_KEY      chave da API Brevo (Transactional)
//   EMAIL_FROM_EMAIL   remetente verificado no dominio (ex no-reply@desafiopass.com)
//   EMAIL_FROM_NAME    nome exibido (ex "Bolão Pass")

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export interface SendEmailInput {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM_EMAIL ?? "no-reply@desafiopass.com";
  const fromName = process.env.EMAIL_FROM_NAME ?? "Bolão Pass";

  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY ausente; e-mail nao enviado:", input.subject);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: fromEmail },
        to: [{ email: input.to, name: input.toName ?? input.to }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Brevo respondeu", res.status, body);
      return { ok: false, error: `brevo_${res.status}` };
    }
    console.log("[email] enviado via Brevo:", input.subject);
    return { ok: true };
  } catch (e) {
    console.error("[email] falha ao enviar:", e);
    return { ok: false, error: "network" };
  }
}

// URL base da aplicacao para montar links absolutos nos e-mails.
export function appUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://desafiopass.com"
  ).replace(/\/$/, "");
}
