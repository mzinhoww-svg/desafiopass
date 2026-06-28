"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "@/app/actions/auth";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: SignupState = {};

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signup, initial);

  return (
    <>
      <Header title="Criar conta" subtitle="Bolão LATAM Pass" />
      <main className="flex-1 px-5 py-8">
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
              label="Senha"
              placeholder="mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
            <Input
              id="nickname"
              name="nickname"
              label="Apelido (nome no ranking)"
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
              Tenho 16 anos ou mais
            </label>
            <label className="t-body flex items-center gap-2 text-ink">
              <input
                type="checkbox"
                name="acceptTerms"
                className="size-5"
                style={{ accentColor: "var(--rose)" }}
              />
              Aceito os termos
            </label>

            {state?.error ? (
              <p className="t-body font-bold text-rose" role="alert">
                {state.error}
              </p>
            ) : null}

            <Button type="submit" disabled={pending}>
              {pending ? "Criando conta" : "Criar conta"}
            </Button>
          </form>

          <p className="t-caption mt-4 text-muted">
            Já tem conta?{" "}
            <Link href="/login" className="font-bold text-rose">
              Entrar
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
