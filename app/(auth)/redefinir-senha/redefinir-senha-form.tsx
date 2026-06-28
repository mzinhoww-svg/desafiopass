"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword, type ResetState } from "@/app/actions/password";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: ResetState = {};

export function RedefinirSenhaForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initial);

  if (state.done) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">Senha alterada</p>
        <p className="t-body mt-2 text-muted">
          Pronto! Sua nova senha já está valendo. Agora é só entrar.
        </p>
        <p className="t-caption mt-4">
          <Link href="/login" className="font-bold text-rose">
            Entrar
          </Link>
        </p>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <p className="t-body font-bold text-ink">Link inválido</p>
        <p className="t-body mt-2 text-muted">
          O link de redefinição está incompleto. Peça um novo.
        </p>
        <p className="t-caption mt-4 text-muted">
          <Link href="/esqueci-senha" className="font-bold text-rose">
            Recuperar acesso
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="t-body mb-3 text-muted">Escolha uma nova senha.</p>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <Input
          id="password"
          name="password"
          type="password"
          label="Nova senha"
          placeholder="mínimo 8 caracteres"
          autoComplete="new-password"
          required
        />
        {state.error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando" : "Salvar nova senha"}
        </Button>
      </form>
      <p className="t-caption mt-4 text-muted">
        <Link href="/login" className="font-bold text-rose">
          Voltar para entrar
        </Link>
      </p>
    </Card>
  );
}
