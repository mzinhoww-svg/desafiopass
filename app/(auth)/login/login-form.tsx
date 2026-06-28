"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm({ registered }: { registered: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      redirect: false,
    });
    if (res?.error) {
      setError("Email ou senha invalidos.");
      setPending(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <Card>
      {registered ? (
        <p className="t-body mb-3 font-bold text-ink">
          Conta criada. Entre para começar a palpitar.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          label="Senha"
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Entrando" : "Entrar"}
        </Button>
      </form>

      <p className="t-caption mt-4 text-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-bold text-rose">
          Criar conta
        </Link>
      </p>
      <p className="t-caption mt-1 text-muted">
        Esqueceu a senha?{" "}
        <Link href="/esqueci-senha" className="font-bold text-rose">
          Recuperar acesso
        </Link>
      </p>
    </Card>
  );
}
