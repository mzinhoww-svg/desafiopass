"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { signupSchema } from "@/lib/validations";

/*
 * Server Action de cadastro (Task 1.2). Valida com Zod, checa apelido/email unicos,
 * faz hash bcrypt e insere o usuario (role user, is_premium false). Em duplicidade
 * retorna mensagem clara. Sucesso: redireciona para /login?registered=1 (escolha
 * documentada: nao auto-loga; o usuario confirma a senha entrando).
 */
export type SignupState = { error?: string };

function messageForField(field: string): string {
  switch (field) {
    case "email":
      return "Informe um email valido.";
    case "password":
      return "A senha precisa de ao menos 8 caracteres.";
    case "nickname":
      return "Apelido de 3 a 20 caracteres: letras, numeros ou _.";
    case "isAdult":
      return "Confirme que voce tem 16 anos ou mais.";
    case "acceptTerms":
      return "E preciso aceitar os termos.";
    default:
      return "Dados invalidos.";
  }
}

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    nickname: String(formData.get("nickname") ?? "").trim(),
    isAdult: formData.get("isAdult") === "on",
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path[0];
    return { error: messageForField(typeof field === "string" ? field : "") };
  }

  const { email, password, nickname } = parsed.data;

  // Pre-checagem de unicidade para mensagem clara.
  const existing = await db
    .select({ email: users.email, nickname: users.nickname })
    .from(users)
    .where(or(eq(users.email, email), eq(users.nickname, nickname)));

  if (existing.some((u) => u.nickname === nickname)) {
    return { error: "Apelido ja em uso." };
  }
  if (existing.some((u) => u.email === email)) {
    return { error: "Email ja cadastrado." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      nickname,
      passwordHash,
      role: "user",
      isPremium: false,
    });
  } catch (e) {
    // Backstop para corrida na constraint unique (email/nickname).
    const code = (e as { code?: string }).code;
    if (code === "23505") {
      return { error: "Apelido ou email ja em uso." };
    }
    throw e;
  }

  redirect("/login?registered=1");
}
