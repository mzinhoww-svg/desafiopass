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

const initial: ResetRequestState = {};

export function EsqueciSenhaForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state.ok) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">Confira seu e-mail</p>
        <p className="t-body mt-2 text-muted">
          Se houver uma conta com esse e-mail, enviamos um link para você criar
          uma nova senha. O link vale por 1 hora.
        </p>
        <p className="t-caption mt-4 text-muted">
          <Link href="/login" className="font-bold text-rose">
            Voltar para entrar
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="t-body mb-3 text-muted">
        Informe o e-mail da sua conta e enviaremos um link para redefinir a
        senha.
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
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando" : "Enviar link"}
        </Button>
      </form>
      <p className="t-caption mt-4 text-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-bold text-rose">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
