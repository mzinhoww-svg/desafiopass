"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

export function LoginForm({ registered }: { registered: boolean }) {
  const t = useT();
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
      setError(t("Email ou senha invalidos.", "Correo o contraseña inválidos."));
      setPending(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <Card>
      {registered ? (
        <p className="t-body mb-3 font-bold text-ink">
          {t(
            "Conta criada. Entre para começar a palpitar.",
            "Cuenta creada. Ingresa para empezar a pronosticar.",
          )}
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
          label={t("Senha", "Contraseña")}
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="t-body font-bold text-rose" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={pending}>
          {pending ? t("Entrando", "Ingresando") : t("Entrar", "Ingresar")}
        </Button>
      </form>

      <p className="t-caption mt-4 text-muted">
        {t("Não tem conta?", "¿No tienes cuenta?")}{" "}
        <Link href="/cadastro" className="font-bold text-rose">
          {t("Criar conta", "Crear cuenta")}
        </Link>
      </p>
      <p className="t-caption mt-1 text-muted">
        {t("Esqueceu a senha?", "¿Olvidaste la contraseña?")}{" "}
        <Link href="/esqueci-senha" className="font-bold text-rose">
          {t("Recuperar acesso", "Recuperar acceso")}
        </Link>
      </p>
    </Card>
  );
}
