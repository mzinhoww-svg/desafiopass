import { Flag } from "@/components/flag";

/*
 * Score-input (DESIGN_SPEC 6, wireframe tela 4). Dois numeros grandes (oversized)
 * com bandeiras ao lado. Acento de acao rosa quando editavel; cinza/travado quando
 * o prazo passou. Inputs nativos 0..20 com name homeGuess/awayGuess (FormData).
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
  const box = `h-16 w-14 rounded-xl border-2 text-center text-3xl font-extrabold ${
    disabled
      ? "border-black/15 bg-cloud text-muted"
      : "border-rose text-rose bg-paper"
  }`;

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <Flag code={home.flagCode} name={home.name} size={32} />
        <span className="t-caption font-bold text-indigo">{home.code}</span>
      </div>
      <input
        name="homeGuess"
        type="number"
        min={0}
        max={20}
        defaultValue={defaultHome ?? 0}
        disabled={disabled}
        aria-label={`Gols ${home.name}`}
        className={box}
      />
      <span className="t-score text-muted">x</span>
      <input
        name="awayGuess"
        type="number"
        min={0}
        max={20}
        defaultValue={defaultAway ?? 0}
        disabled={disabled}
        aria-label={`Gols ${away.name}`}
        className={box}
      />
      <div className="flex flex-col items-center gap-2">
        <Flag code={away.flagCode} name={away.name} size={32} />
        <span className="t-caption font-bold text-indigo">{away.code}</span>
      </div>
    </div>
  );
}
