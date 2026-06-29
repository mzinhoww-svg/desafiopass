"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useRef, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

const initial: ProfileState = {};

function initialsOf(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

export function ProfileForm({
  nickname,
  favoriteTeam,
  avatarUrl,
  emailReminders,
  teams,
}: {
  nickname: string;
  favoriteTeam: string | null;
  avatarUrl: string | null;
  emailReminders: boolean;
  teams: { code: string; name: string }[];
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(updateProfile, initial);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [dataUrl, setDataUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const url = canvas.toDataURL("image/jpeg", 0.82);
        setPreview(url);
        setDataUrl(url);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full bg-cloud text-lg font-extrabold text-indigo">
          {preview ? (
            <img src={preview} alt={t("Sua foto", "Tu foto")} className="h-full w-full object-cover" />
          ) : (
            initialsOf(nickname)
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
        >
          {t("Trocar foto", "Cambiar foto")}
        </Button>
      </div>

      <input type="hidden" name="avatarUrl" value={dataUrl} />

      <Input
        id="nickname"
        name="nickname"
        label={t("Apelido", "Apodo")}
        defaultValue={nickname}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="favoriteTeam" className="t-kicker text-indigo">
          {t("Time do coração", "Selección favorita")}
        </label>
        <select
          id="favoriteTeam"
          name="favoriteTeam"
          defaultValue={favoriteTeam ?? ""}
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">{t("Sem time", "Sin selección")}</option>
          {teams.map((t) => (
            <option key={t.code} value={t.code}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <label className="t-body flex items-center gap-2 text-ink">
        <input
          type="checkbox"
          name="emailReminders"
          defaultChecked={emailReminders}
          className="size-5"
          style={{ accentColor: "var(--rose)" }}
        />
        {t("Quero receber lembretes de palpite por e-mail", "Quiero recibir recordatorios de pronóstico por correo")}
      </label>

      {state?.error ? (
        <p className="t-body font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="t-body font-bold text-ink" role="status">
          {t("Perfil salvo.", "Perfil guardado.")}
        </p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? t("Salvando", "Guardando") : t("Salvar", "Guardar")}
      </Button>
    </form>
  );
}
