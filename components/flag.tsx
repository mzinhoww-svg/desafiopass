// reference-code/components/flag.tsx
//
// Componente de bandeira. Renderiza o SVG REAL da selecao (assets em /public/flags,
// biblioteca flag-icons). Nunca emoji.
//
// flagCode vem de teams[].flagCode no seed (ex 'br' -> /flags/br.svg).
// Para placeholders de avanco (flagCode vazio), mostra um escudo neutro, sem bandeira.
//
// Uso:
//   <Flag code="br" name="Brasil" />
//   <Flag code="gb-eng" name="Inglaterra" size={28} />

import Image from 'next/image';

interface FlagProps {
  code: string;       // flagCode do seed; vazio = placeholder
  name: string;       // nome da selecao, para alt e title
  size?: number;      // largura em px (proporcao 4x3). Default 24.
  rounded?: boolean;  // cantos arredondados. Default true.
}

export function Flag({ code, name, size = 24, rounded = true }: FlagProps) {
  const height = Math.round((size * 3) / 4);
  const radius = rounded ? 3 : 0;

  // Seleção real importada da API sem SVG local: a bandeira vem como URL (crest).
  // next/image exigiria allowlist de domínio; usamos <img> simples (ok p/ bandeiras).
  if (code.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={code}
        alt={name}
        title={name}
        width={size}
        height={height}
        style={{
          borderRadius: radius,
          objectFit: 'cover',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      />
    );
  }

  // Placeholder de avanco (sem selecao definida): escudo neutro.
  if (!code) {
    return (
      <span
        role="img"
        aria-label={name}
        title={name}
        style={{
          display: 'inline-block',
          width: size,
          height,
          borderRadius: radius,
          background: 'var(--off-white, #F4F4F8)',
          border: '1px solid #d0d3dd',
        }}
      />
    );
  }

  return (
    <Image
      src={`/flags/${code}.svg`}
      alt={name}
      title={name}
      width={size}
      height={height}
      style={{ borderRadius: radius, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.08)' }}
    />
  );
}
