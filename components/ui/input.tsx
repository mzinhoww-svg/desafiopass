import type { InputHTMLAttributes } from "react";

/*
 * Input com label associado (impeccable: inputs sempre com label, foco visivel).
 * Rotulo em caixa alta peso 700 (kicker). Superficie paper, borda sutil.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-kicker text-indigo">
        {label}
      </label>
      <input
        id={id}
        className={`min-h-12 rounded-xl border border-black/10 bg-paper px-3 text-ink placeholder:text-muted ${className}`}
        {...props}
      />
    </div>
  );
}
