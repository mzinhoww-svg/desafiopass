"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "@/app/actions/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: SignupState = {};

export function CadastroForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(signup, initial);

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="voce@email.com"
          autoComplete="email"
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={t("Senha", "Contraseña")}
          placeholder={t("mínimo 8 caracteres", "mínimo 8 caracteres")}
          autoComplete="new-password"
          required
        />
        <Input
          id="nickname"
          name="nickname"
          label={t("Apelido (nome no ranking)", "Apodo (nombre en el ranking)")}
          placeholder="Mazinho"
          required
        />

        <label className="t-body flex items-center gap-2 text-ink">
          <input
            type="checkbox"
            name="isAdult"
            className="size-5"
            style={{ accentColor: "var(--rose)" }}
          />
          {t("Tenho 16 anos ou mais", "Tengo 16 años o más")}
        </label>
        <label className="t-body flex items-center gap-2 text-ink">
          <input
            type="checkbox"
            name="acceptTerms"
            className="size-5"
            style={{ accentColor: "var(--rose)" }}
          />
          <span>
            {t("Aceito os termos e a", "Acepto los términos y la")}{" "}
            <Link href="/privacidade" className="font-bold text-rose">
              {t("política de privacidade", "política de privacidad")}
            </Link>
          </span>
        </label>

        {state?.error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending
            ? t("Criando conta", "Creando cuenta")
            : t("Criar conta", "Crear cuenta")}
        </Button>
      </form>

      <p className="t-caption mt-4 text-muted">
        {t("Já tem conta?", "¿Ya tienes cuenta?")}{" "}
        <Link href="/login" className="font-bold text-rose">
          {t("Entrar", "Ingresar")}
        </Link>
      </p>
    </Card>
  );
}
