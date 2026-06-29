"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type ResetRequestState,
} from "@/app/actions/password";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: ResetRequestState = {};

export function EsqueciSenhaForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state.ok) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">
          {t("Confira seu e-mail", "Revisa tu correo")}
        </p>
        <p className="t-body mt-2 text-muted">
          {t(
            "Se houver uma conta com esse e-mail, enviamos um link para você criar uma nova senha. O link vale por 1 hora.",
            "Si existe una cuenta con ese correo, te enviamos un enlace para crear una nueva contraseña. El enlace vale por 1 hora.",
          )}
        </p>
        <p className="t-caption mt-4 text-muted">
          <Link href="/login" className="font-bold text-rose">
            {t("Voltar para entrar", "Volver a ingresar")}
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="t-body mb-3 text-muted">
        {t(
          "Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.",
          "Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer la contraseña.",
        )}
      </p>
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
        {state.error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" loading={pending}>
          {pending ? t("Enviando", "Enviando") : t("Enviar link", "Enviar enlace")}
        </Button>
      </form>
      <p className="t-caption mt-4 text-muted">
        {t("Lembrou a senha?", "¿Recordaste la contraseña?")}{" "}
        <Link href="/login" className="font-bold text-rose">
          {t("Entrar", "Ingresar")}
        </Link>
      </p>
    </Card>
  );
}
