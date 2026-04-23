'use client';

import { ResourceIcon } from './ResourceIcon';

type Categoria =
  | 'PROYECCION' | 'COMPUTO' | 'CONECTIVIDAD' | 'AUDIO'
  | 'ESCRITURA' | 'CONFORT' | 'ACCESIBILIDAD';

const CATEGORIA_STYLES: Record<Categoria, { bg: string; fg: string; label: string }> = {
  PROYECCION:    { bg: 'var(--info-bg)',    fg: 'var(--info)',    label: 'Proyección' },
  COMPUTO:       { bg: 'var(--info-bg)',    fg: 'var(--info)',    label: 'Cómputo' },
  CONECTIVIDAD:  { bg: 'var(--success-bg)', fg: 'var(--success)', label: 'Conectividad' },
  AUDIO:         { bg: 'var(--warning-bg)', fg: 'var(--warning)', label: 'Audio' },
  ESCRITURA:     { bg: 'var(--bg-input)',   fg: 'var(--text-secondary)', label: 'Escritura' },
  CONFORT:       { bg: 'var(--bg-input)',   fg: 'var(--text-secondary)', label: 'Confort' },
  ACCESIBILIDAD: { bg: 'var(--success-bg)', fg: 'var(--success)', label: 'Accesibilidad' },
};

interface Props {
  nombre: string;
  categoria: Categoria | string;
  icono: string;
  size?: 'sm' | 'md';
  onClick?: () => void;
  active?: boolean;
  title?: string;
}

export function ResourceChip({ nombre, categoria, icono, size = 'sm', onClick, active, title }: Props) {
  const style = CATEGORIA_STYLES[categoria as Categoria] ?? CATEGORIA_STYLES.COMPUTO;
  const pad = size === 'md' ? '6px 10px' : '4px 8px';
  const fontSize = size === 'md' ? '0.78rem' : '0.7rem';
  const iconSize = size === 'md' ? 14 : 12;

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: pad, borderRadius: '999px',
    background: active ? style.fg : style.bg,
    color: active ? 'var(--bg-card)' : style.fg,
    fontSize, fontWeight: 500, lineHeight: 1,
    border: `1px solid ${active ? style.fg : 'transparent'}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };

  const Component = onClick ? 'button' : 'span';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={base}
      title={title ?? `${style.label}: ${nombre}`}
      aria-pressed={onClick ? !!active : undefined}
    >
      <ResourceIcon icono={icono} size={iconSize} />
      {nombre}
    </Component>
  );
}
