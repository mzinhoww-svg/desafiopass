"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { signupSchema } from "@/lib/validations";
import { getLocale, tr, type Locale } from "@/lib/i18n";

/*
 * Server Action de cadastro (Task 1.2). Valida com Zod, checa apelido/email unicos,
 * faz hash bcrypt e insere o usuario (role user, is_premium false). Em duplicidade
 * retorna mensagem clara. Sucesso: redireciona para /login?registered=1 (escolha
 * documentada: nao auto-loga; o usuario confirma a senha entrando).
 */
export type SignupState = { error?: string };

function messageForField(field: string, locale: Locale): string {
  switch (field) {
    case "email":
      return tr(locale, "Informe um email valido.", "Ingresa un correo válido.");
    case "password":
      return tr(
        locale,
        "A senha precisa de ao menos 8 caracteres.",
        "La contraseña necesita al menos 8 caracteres.",
      );
    case "nickname":
      return tr(
        locale,
        "Apelido de 3 a 20 caracteres: letras, numeros ou _.",
        "Apodo de 3 a 20 caracteres: letras, números o _.",
      );
    case "isAdult":
      return tr(
        locale,
        "Confirme que voce tem 16 anos ou mais.",
        "Confirma que tienes 16 años o más.",
      );
    case "acceptTerms":
      return tr(locale, "E preciso aceitar os termos.", "Debes aceptar los términos.");
    default:
      return tr(locale, "Dados invalidos.", "Datos inválidos.");
  }
}

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const locale = await getLocale();
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
    return {
      error: messageForField(typeof field === "string" ? field : "", locale),
    };
  }

  const { email, password, nickname } = parsed.data;

  // Pre-checagem de unicidade para mensagem clara.
  const existing = await db
    .select({ email: users.email, nickname: users.nickname })
    .from(users)
    .where(or(eq(users.email, email), eq(users.nickname, nickname)));

  if (existing.some((u) => u.nickname === nickname)) {
    return { error: tr(locale, "Apelido ja em uso.", "Ese apodo ya está en uso.") };
  }
  if (existing.some((u) => u.email === email)) {
    return {
      error: tr(locale, "Email ja cadastrado.", "Ese correo ya está registrado."),
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      nickname,
      passwordHash,
      role: "user",
      isPremium: false,
      // Idioma inicial = o detectado/escolhido no cadastro (e-mail/push seguem isso).
      locale,
    });
  } catch (e) {
    // Backstop para corrida na constraint unique (email/nickname).
    const code = (e as { code?: string }).code;
    if (code === "23505") {
      return {
        error: tr(locale, "Apelido ou email ja em uso.", "Apodo o correo ya en uso."),
      };
    }
    throw e;
  }

  redirect("/login?registered=1");
}
