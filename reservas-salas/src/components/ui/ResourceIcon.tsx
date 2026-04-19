'use client';

import {
  Projector, Tv, Monitor, Computer, Webcam, Wifi, Cable,
  Volume2, Mic, PenLine, Square, Snowflake, Blinds, Accessibility, Box,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Projector, Tv, Monitor, Computer, Webcam, Wifi, Cable,
  Volume2, Mic, PenLine, Square, Snowflake, Blinds, Accessibility, Box,
};

interface Props {
  icono: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ResourceIcon({ icono, size = 16, className, style }: Props) {
  const Icon = ICON_MAP[icono] ?? Box;
  return <Icon size={size} className={className} style={style} aria-hidden="true" />;
}
