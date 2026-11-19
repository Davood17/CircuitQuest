'use client';

import type { CircuitSchematic } from '@/content/types';

/**
 * Simple, kid-readable circuit schematics for the "which circuit lights the lamp?"
 * play-quiz (l0-1). Drawn by hand (like device-art/part-art) because the live
 * CircuitView elbow router overlaps wires in a two-part loop, which would make
 * the options impossible for a child to tell apart.
 *
 * All lamps are shown OFF so the picture never gives the answer away.
 */

const WIRE = '#64748b';
const WIRE_W = 6;
const DOT = '#475569';

/** battery capsule drawn horizontally, centered at (cx, cy) */
function Battery({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 32} y={cy - 19} width={64} height={38} rx={9} fill="#fbbf24" stroke="#b45309" strokeWidth={3} />
      {/* plus mark (right cap) */}
      <path d={`M ${cx + 18} ${cy} h 10 M ${cx + 23} ${cy - 5} v 10`} stroke="#92400e" strokeWidth={3.5} strokeLinecap="round" />
      {/* minus mark (left cap) */}
      <path d={`M ${cx - 28} ${cy} h 10`} stroke="#92400e" strokeWidth={3.5} strokeLinecap="round" />
    </g>
  );
}

/** lamp bulb drawn centered at (cx, cy); pins stick out on the given sides */
function Lamp({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={26} fill="#f8fafc" stroke="#94a3b8" strokeWidth={4} />
      {/* little filament zigzag */}
      <path
        d={`M ${cx - 10} ${cy + 8} L ${cx - 4} ${cy - 6} L ${cx + 2} ${cy + 8} L ${cx + 8} ${cy - 6}`}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** filled dot = connected terminal, hollow dot = loose terminal */
function Terminal({ cx, cy, loose = false }: { cx: number; cy: number; loose?: boolean }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={loose ? '#ffffff' : DOT}
      stroke={loose ? '#94a3b8' : DOT}
      strokeWidth={loose ? 3 : 0}
      strokeDasharray={loose ? '3 3' : undefined}
    />
  );
}

function ClosedVariant() {
  // classic textbook rectangle loop: battery on the left edge, lamp on the right edge
  const left = 56;
  const right = 262;
  const top = 38;
  const bottom = 124;
  return (
    <g>
      <path d={`M ${left} ${top} H ${right}`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d={`M ${left} ${bottom} H ${right}`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d={`M ${left} ${top} V 62`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d={`M ${left} 100 V ${bottom}`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d={`M ${right} ${top} V 52`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d={`M ${right} 108 V ${bottom}`} stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <Battery cx={left} cy={81} />
      <Lamp cx={right} cy={80} />
      <Terminal cx={left} cy={top} />
      <Terminal cx={left} cy={bottom} />
      <Terminal cx={right} cy={top} />
      <Terminal cx={right} cy={bottom} />
    </g>
  );
}

function OpenVariant() {
  // one wire only: battery's + reaches one side of the lamp; nothing ever comes back
  return (
    <g>
      <path d="M 108 112 H 196 V 56" stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <Battery cx={76} cy={112} />
      <Lamp cx={222} cy={56} />
      {/* lamp's left side connected, right side loose; battery's − loose */}
      <Terminal cx={196} cy={56} />
      <Terminal cx={248} cy={56} loose />
      <Terminal cx={44} cy={112} loose />
    </g>
  );
}

function SamePinVariant() {
  // both wires leave the battery's + terminal; the − terminal stays loose
  return (
    <g>
      <path d="M 108 80 H 140 V 40 H 252 V 52" stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <path d="M 108 80 H 176 V 122 H 252 V 110" stroke={WIRE} strokeWidth={WIRE_W} strokeLinecap="round" fill="none" />
      <Battery cx={76} cy={80} />
      <Lamp cx={252} cy={81} />
      <Terminal cx={108} cy={80} />
      <Terminal cx={44} cy={80} loose />
    </g>
  );
}

const VARIANTS: Record<CircuitSchematic, () => React.JSX.Element> = {
  closed: ClosedVariant,
  open: OpenVariant,
  'same-pin': SamePinVariant,
};

export function CircuitPickArt({ variant }: { variant: CircuitSchematic }) {
  const Art = VARIANTS[variant];
  return (
    <svg viewBox="0 0 320 164" className="block h-full w-full" role="img" aria-label={`circuit: ${variant}`}>
      <Art />
    </svg>
  );
}
