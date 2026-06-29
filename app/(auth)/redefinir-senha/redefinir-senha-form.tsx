"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ResetState } from "@/app/actions/password";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: ResetState = {};

export function RedefinirSenhaForm({ token }: { token: string }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(resetPassword, initial);

  if (state.done) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">
          {t("Senha alterada", "Contraseña cambiada")}
        </p>
        <p className="t-body mt-2 text-muted">
          {t(
            "Pronto! Sua nova senha já está valendo. Agora é só entrar.",
            "¡Listo! Tu nueva contraseña ya está activa. Ahora solo tienes que ingresar.",
          )}
        </p>
        <p className="t-caption mt-4">
          <Link href="/login" className="font-bold text-rose">
            {t("Entrar", "Ingresar")}
          </Link>
        </p>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">
          {t("Link inválido", "Enlace inválido")}
        </p>
        <p className="t-body mt-2 text-muted">
          {t(
            "O link de redefinição está incompleto. Peça um novo.",
            "El enlace de restablecimiento está incompleto. Pide uno nuevo.",
          )}
        </p>
        <p className="t-caption mt-4 text-muted">
          <Link href="/esqueci-senha" className="font-bold text-rose">
            {t("Recuperar acesso", "Recuperar acceso")}
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="t-body mb-3 text-muted">
        {t("Escolha uma nova senha.", "Elige una nueva contraseña.")}
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <Input
          id="password"
          name="password"
          type="password"
          label={t("Nova senha", "Nueva contraseña")}
          placeholder={t("mínimo 8 caracteres", "mínimo 8 caracteres")}
          autoComplete="new-password"
          required
        />
        {state.error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending
            ? t("Salvando", "Guardando")
            : t("Salvar nova senha", "Guardar nueva contraseña")}
        </Button>
      </form>
      <p className="t-caption mt-4 text-muted">
        <Link href="/login" className="font-bold text-rose">
          {t("Voltar para entrar", "Volver a ingresar")}
        </Link>
      </p>
    </Card>
  );
}
