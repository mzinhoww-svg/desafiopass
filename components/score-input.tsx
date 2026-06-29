"use client";

import { Flag } from "@/components/flag";
import { useT } from "@/components/i18n/locale-provider";

/*
 * Score-input (DESIGN_SPEC 6, wireframe tela 4). Dois numeros grandes (oversized)
 * com bandeiras ao lado. Acento de acao rosa quando editavel; cinza/travado quando
 * o prazo passou. Inputs nativos 0..20 com name homeGuess/awayGuess (FormData).
 *
 * UX mobile: inputMode numeric abre o teclado numerico; ao focar, seleciona o
 * valor (o "0" inicial) para o primeiro digito substituir sem precisar apagar.
 */
type TeamLite = { code: string; name: string; flagCode: string };

export function ScoreInput({
  home,
  away,
  defaultHome,
  defaultAway,
  disabled = false,
}: {
  home: TeamLite;
  away: TeamLite;
  defaultHome?: number;
  defaultAway?: number;
  disabled?: boolean;
}) {
  const t = useT();
  const box = `h-16 w-14 rounded-xl border-2 text-center text-3xl font-extrabold ${
    disabled
      ? "border-black/15 bg-cloud text-muted"
      : "border-rose text-rose bg-paper"
  }`;

  const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.currentTarget.select();

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <Flag code={home.flagCode} name={home.name} size={32} />
        <span className="t-caption font-bold text-indigo">{home.code}</span>
      </div>
      <input
        name="homeGuess"
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={0}
        max={20}
        defaultValue={defaultHome ?? 0}
        disabled={disabled}
        onFocus={selectOnFocus}
        aria-label={t(`Gols ${home.name}`, `Goles ${home.name}`)}
        className={box}
      />
      <span className="t-score text-muted">x</span>
      <input
        name="awayGuess"
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={0}
        max={20}
        defaultValue={defaultAway ?? 0}
        disabled={disabled}
        onFocus={selectOnFocus}
        aria-label={t(`Gols ${away.name}`, `Goles ${away.name}`)}
        className={box}
      />
      <div className="flex flex-col items-center gap-2">
        <Flag code={away.flagCode} name={away.name} size={32} />
        <span className="t-caption font-bold text-indigo">{away.code}</span>
      </div>
    </div>
  );
}
