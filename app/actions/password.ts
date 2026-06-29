"use server";

import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/drizzle/schema";
import { requestResetSchema, resetPasswordSchema } from "@/lib/validations";
import { sendEmail, appUrl } from "@/lib/email/client";
import { passwordResetEmail } from "@/lib/email/templates";

/*
 * Recuperacao de senha (#1). Fluxo de uso unico e expiravel:
 * - requestPasswordReset: gera token cru (enviado por e-mail) e grava so o hash.
 *   Resposta sempre generica (nao revela se o e-mail existe).
 * - resetPassword: valida o token (hash, nao usado, nao expirado), troca a senha
 *   e marca o token como usado.
 */
export type ResetRequestState = { ok?: boolean; error?: string };
export type ResetState = { done?: boolean; error?: string };

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = requestResetSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
  });
  if (!parsed.success) return { error: "Informe um e-mail válido." };

  const found = await db
    .select({ id: users.id, nickname: users.nickname, email: users.email })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  const user = found[0];

  // Só envia se existir; mas a resposta é sempre a mesma (anti-enumeração).
  if (user) {
    const raw = randomBytes(32).toString("hex");
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });
    const resetUrl = `${appUrl()}/redefinir-senha?token=${raw}`;
    const mail = passwordResetEmail({ nickname: user.nickname, resetUrl });
    const r = await sendEmail({
      to: user.email,
      toName: user.nickname,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    // Diagnostico (sem expor o e-mail): resultado do envio do reset.
    console.log("[reset] envio:", JSON.stringify(r));
  } else {
    console.warn("[reset] e-mail informado nao esta cadastrado");
  }

  return { ok: true };
}

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "A senha precisa de ao menos 8 caracteres." };
  }

  const tokenHash = hashToken(parsed.data.token);
  const rows = await db
    .select({ id: passwordResetTokens.id, userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const token = rows[0];
  if (!token) {
    return { error: "Link inválido ou expirado. Peça um novo." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, token.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, token.id));

  return { done: true };
}
