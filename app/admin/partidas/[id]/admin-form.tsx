"use client";

import { useActionState } from "react";
import { closeMatch, type AdminState } from "@/app/actions/admin";
import { Flag } from "@/components/flag";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

type TeamLite = { code: string; name: string; flagCode: string };
const initial: AdminState = {};

export function AdminForm({
  matchId,
  home,
  away,
  defaultHome,
  defaultAway,
}: {
  matchId: string;
  home: TeamLite;
  away: TeamLite;
  defaultHome?: number;
  defaultAway?: number;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(closeMatch, initial);
  const box =
    "h-16 w-14 rounded-xl border-2 border-indigo text-center text-3xl font-extrabold text-indigo bg-paper";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-2">
          <Flag code={home.flagCode} name={home.name} size={32} />
          <span className="t-caption font-bold text-indigo">{home.code}</span>
        </div>
        <input
          name="homeScore"
          type="number"
          min={0}
          max={30}
          defaultValue={defaultHome ?? 0}
          aria-label={t(`Gols ${home.name}`, `Goles ${home.name}`)}
          className={box}
        />
        <span className="t-score text-muted">x</span>
        <input
          name="awayScore"
          type="number"
          min={0}
          max={30}
          defaultValue={defaultAway ?? 0}
          aria-label={t(`Gols ${away.name}`, `Goles ${away.name}`)}
          className={box}
        />
        <div className="flex flex-col items-center gap-2">
          <Flag code={away.flagCode} name={away.name} size={32} />
          <span className="t-caption font-bold text-indigo">{away.code}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="winner" className="t-kicker text-indigo">
          {t("Quem avançou? (mata-mata)", "¿Quién avanzó? (eliminatoria)")}
        </label>
        <select
          id="winner"
          name="winner"
          defaultValue=""
          className="min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink"
        >
          <option value="">{t("Decidir pelo placar", "Decidir por el marcador")}</option>
          <option value={home.code}>
            {t(`${home.name} avançou`, `${home.name} avanzó`)}
          </option>
          <option value={away.code}>
            {t(`${away.name} avançou`, `${away.name} avanzó`)}
          </option>
        </select>
        <p className="t-caption text-muted">
          {t(
            "Use quando o jogo empatar e for decidido nos pênaltis (ex.: 0x0). A pontuação dos palpites segue o placar do tempo normal.",
            "Usá esto cuando el partido empate y se decida por penales (ej.: 0x0). El puntaje de los pronósticos sigue el marcador del tiempo normal.",
          )}
        </p>
      </div>

      {state?.error ? (
        <p className="t-body text-center font-bold text-rose" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="t-body text-center font-bold text-ink" role="status">
          {t(
            `Placar salvo. ${state.scored} palpite(s) pontuado(s).`,
            `Marcador guardado. ${state.scored} pronóstico(s) puntuado(s).`,
          )}
        </p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending
          ? t("Salvando", "Guardando")
          : t("Salvar e calcular pontos", "Guardar y calcular puntos")}
      </Button>
    </form>
  );
}
