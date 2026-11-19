'use client';

/**
 * Original SVG visuals for every part. Drawn in local coordinates around (0,0),
 * pin positions must match src/parts/registry.ts exactly.
 */

import type { PartParams } from '@/engine/types';
import { PART_MAP } from './registry';

export interface PartState {
  brightness?: number;
  closed?: boolean;
  pressed?: boolean;
  speed?: number;
  sounding?: boolean;
  chargePct?: number;
  current?: number;
  voltage?: number;
  dischargeCurrent?: number;
  taper?: number;
  reversed?: boolean;
  running?: boolean;
  overcurrent?: boolean;
  /** diode: forward-conducting */
  conducting?: boolean;
  /** LDR: ambient light 0..1 */
  light?: number;
  /** motor: revolutions per minute */
  rpm?: number;
  /** transistor: 'off' | 'active' | 'saturated' */
  mode?: string;
}

const STROKE = '#334155';
const PIN_R = 4.5;

const Pin = ({ x, y, hot }: { x: number; y: number; hot?: boolean }) => (
  <circle cx={x} cy={y} r={PIN_R} fill={hot ? '#0d9488' : '#64748b'} stroke={STROKE} strokeWidth={1.5} />
);

const Lead = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={3} strokeLinecap="round" />
);

const ValueTag = ({ y, text, color = '#475569' }: { y: number; text: string; color?: string }) => (
  <text x={0} y={y} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} style={{ pointerEvents: 'none' }}>
    {text}
  </text>
);

type V = { params: PartParams; state: PartState };

// ------------------------------------------------------------------ battery

const BatteryVisual = ({ params, state }: V) => (
  <g>
    <Lead x1={-44} y1={0} x2={-22} y2={0} />
    <Lead x1={44} y1={0} x2={22} y2={0} />
    <rect x={-22} y={-16} width={30} height={32} rx={5} fill="#fde68a" stroke={STROKE} strokeWidth={2.5} />
    <rect x={8} y={-16} width={14} height={32} rx={5} fill="#f59e0b" stroke={STROKE} strokeWidth={2.5} />
    <text x={-7} y={6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#78350f">+</text>
    <text x={15} y={6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#78350f">−</text>
    <Pin x={-44} y={0} />
    <Pin x={44} y={0} />
    <ValueTag y={34} text={`${params.voltage ?? 3} V`} color="#b45309" />
    {state.running && Number(state.dischargeCurrent ?? 0) > 0.0005 && (
      <ValueTag y={-22} text={`${(Number(state.dischargeCurrent) * 1000).toFixed(0)} mA`} color="#0f766e" />
    )}
  </g>
);

// ----------------------------------------------------------------- resistor

const ResistorVisual = ({ params }: V) => (
  <g>
    <Lead x1={-42} y1={0} x2={-26} y2={0} />
    <Lead x1={42} y1={0} x2={26} y2={0} />
    <rect x={-26} y={-11} width={52} height={22} rx={7} fill="#fecaca" stroke={STROKE} strokeWidth={2.5} />
    <rect x={-16} y={-11} width={7} height={22} fill="#b91c1c" opacity={0.85} />
    <rect x={-2} y={-11} width={7} height={22} fill="#1e293b" opacity={0.85} />
    <rect x={12} y={-11} width={7} height={22} fill="#d97706" opacity={0.85} />
    <Pin x={-42} y={0} />
    <Pin x={42} y={0} />
    <ValueTag y={28} text={`${params.resistance ?? 220} Ω`} />
  </g>
);

// ---------------------------------------------------------------------- LED

const LED_COLORS: Record<string, { fill: string; glow: string }> = {
  red: { fill: '#ef4444', glow: '#fca5a5' },
  yellow: { fill: '#eab308', glow: '#fde047' },
  green: { fill: '#22c55e', glow: '#86efac' },
  blue: { fill: '#3b82f6', glow: '#93c5fd' },
};

const LedVisual = ({ params, state }: V) => {
  const color = LED_COLORS[String(params.color ?? 'red')] ?? LED_COLORS.red;
  const b = Math.min(1, Number(state.brightness ?? 0));
  return (
    <g>
      <Lead x1={-32} y1={0} x2={-10} y2={0} />
      <Lead x1={32} y1={0} x2={10} y2={0} />
      {b > 0.03 && <circle cx={0} cy={-2} r={26 + b * 10} fill={color.glow} opacity={0.25 + b * 0.45} />}
      <path d="M -10 6 L -10 -6 A 10 10 0 0 1 10 -6 L 10 6 Z" fill={color.fill} stroke={STROKE} strokeWidth={2.5} opacity={0.45 + b * 0.55} />
      <line x1={-10} y1={6} x2={10} y2={6} stroke={STROKE} strokeWidth={2.5} />
      {b > 0.03 && (
        <g stroke={color.glow} strokeWidth={2.5} strokeLinecap="round" opacity={0.9}>
          <line x1={-18} y1={-16} x2={-24} y2={-22} />
          <line x1={0} y1={-20} x2={0} y2={-27} />
          <line x1={18} y1={-16} x2={24} y2={-22} />
        </g>
      )}
      <Pin x={-32} y={0} />
      <Pin x={32} y={0} />
      {state.overcurrent === true && <ValueTag y={-30} text="!" color="#dc2626" />}
    </g>
  );
};

// ---------------------------------------------------------- switch & button

const SwitchVisual = ({ params, state }: V) => {
  const closed = state.closed === true || params.closed === true;
  return (
    <g>
      <Lead x1={-38} y1={0} x2={-18} y2={0} />
      <Lead x1={38} y1={0} x2={18} y2={0} />
      <circle cx={-18} cy={0} r={4} fill={STROKE} />
      <circle cx={18} cy={0} r={4} fill={STROKE} />
      <line
        x1={-18}
        y1={0}
        x2={closed ? 18 : 12}
        y2={closed ? 0 : -16}
        stroke="#0d9488"
        strokeWidth={5}
        strokeLinecap="round"
        style={{ transition: 'all 150ms' }}
      />
      <Pin x={-38} y={0} />
      <Pin x={38} y={0} />
      <ValueTag y={26} text={closed ? 'ON' : 'OFF'} color={closed ? '#0f766e' : '#94a3b8'} />
    </g>
  );
};

const ButtonVisual = ({ state }: V) => {
  const pressed = state.pressed === true;
  return (
    <g>
      <Lead x1={-34} y1={0} x2={-14} y2={0} />
      <Lead x1={34} y1={0} x2={14} y2={0} />
      <rect x={-14} y={-12} width={28} height={24} rx={6} fill="#e2e8f0" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={0} cy={pressed ? 2 : -2} r={8} fill={pressed ? '#0d9488' : '#14b8a6'} stroke={STROKE} strokeWidth={2} style={{ transition: 'all 80ms' }} />
      <Pin x={-34} y={0} />
      <Pin x={34} y={0} />
    </g>
  );
};

// ------------------------------------------------------------ potentiometer

const PotVisual = ({ params, state }: V) => {
  const t = Number(state.taper ?? params.taper ?? 0.5);
  const knobX = -30 + t * 60;
  return (
    <g>
      <Lead x1={-38} y1={0} x2={-26} y2={0} />
      <Lead x1={38} y1={0} x2={26} y2={0} />
      <Lead x1={0} y1={16} x2={0} y2={8} />
      <rect x={-30} y={-14} width={60} height={22} rx={6} fill="#ddd6fe" stroke={STROKE} strokeWidth={2.5} />
      <rect x={-26} y={-2} width={52} height={5} rx={2} fill="#94a3b8" />
      <circle cx={knobX} cy={-3} r={7} fill="#7c3aed" stroke={STROKE} strokeWidth={2} />
      <Pin x={-38} y={0} />
      <Pin x={38} y={0} />
      <Pin x={0} y={16} />
      <ValueTag y={34} text={`${Math.round(t * 100)}%`} color="#6d28d9" />
    </g>
  );
};

// --------------------------------------------------------------- capacitor

const CapacitorVisual = ({ params, state }: V) => {
  const electrolytic = params.polarity !== 'none';
  const charge = Number(state.chargePct ?? 0);
  return (
    <g>
      <Lead x1={-30} y1={0} x2={-9} y2={0} />
      <Lead x1={30} y1={0} x2={9} y2={0} />
      {electrolytic ? (
        <g>
          <rect x={-9} y={-15} width={18} height={30} rx={3} fill="#bae6fd" stroke={STROKE} strokeWidth={2.5} />
          <rect x={-9} y={-15} width={6} height={30} fill="#0284c7" opacity={0.8} />
          <text x={-6} y={5} fontSize={12} fontWeight={800} fill="#fff">−</text>
        </g>
      ) : (
        <g>
          <rect x={-9} y={-15} width={6} height={30} fill={STROKE} />
          <rect x={3} y={-15} width={6} height={30} fill={STROKE} />
        </g>
      )}
      {charge > 0.02 && running_charge_bar(charge)}
      <Pin x={-30} y={0} />
      <Pin x={30} y={0} />
      <ValueTag y={32} text={`${params.capacitance ?? 100} µF`} />
      {state.reversed === true && <ValueTag y={-24} text="! polarity" color="#dc2626" />}
    </g>
  );
};
const running_charge_bar = (charge: number) => (
  <g>
    <rect x={-14} y={-26} width={28} height={5} rx={2.5} fill="#e2e8f0" stroke={STROKE} strokeWidth={1} />
    <rect x={-14} y={-26} width={28 * Math.min(1, charge)} height={5} rx={2.5} fill="#0ea5e9" />
  </g>
);

// -------------------------------------------------------------------- diode

const DiodeVisual = ({ state }: V) => (
  <g>
    <Lead x1={-32} y1={0} x2={-10} y2={0} />
    <Lead x1={32} y1={0} x2={10} y2={0} />
    <path d="M -10 -9 L -10 9 L 8 0 Z" fill="#1e293b" stroke={STROKE} strokeWidth={2} />
    <line x1={8} y1={-9} x2={8} y2={9} stroke={STROKE} strokeWidth={3.5} />
    <Pin x={-32} y={0} />
    <Pin x={32} y={0} />
    {state.conducting === true && <ValueTag y={-16} text="▶" color="#0f766e" />}
  </g>
);

// ---------------------------------------------------------------------- LDR

const LdrVisual = ({ state }: V) => (
  <g>
    <Lead x1={-32} y1={0} x2={-12} y2={0} />
    <Lead x1={32} y1={0} x2={12} y2={0} />
    <circle cx={0} cy={0} r={14} fill="#fef3c7" stroke={STROKE} strokeWidth={2.5} />
    <path d="M -9 0 q 3 -5 6 0 q 3 5 6 0 q 3 -5 6 0" fill="none" stroke="#b45309" strokeWidth={2.5} />
    {Number(state.light ?? 1) > 0.35 && (
      <g stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round">
        <line x1={-16} y1={-20} x2={-8} y2={-12} />
        <line x1={0} y1={-24} x2={0} y2={-15} />
        <line x1={16} y1={-20} x2={8} y2={-12} />
      </g>
    )}
    <Pin x={-32} y={0} />
    <Pin x={32} y={0} />
  </g>
);

// ------------------------------------------------------------------- buzzer

const BuzzerVisual = ({ state }: V) => (
  <g>
    <Lead x1={-30} y1={0} x2={-12} y2={0} />
    <Lead x1={30} y1={0} x2={12} y2={0} />
    <path d="M -12 -12 L 4 -12 A 14 14 0 0 1 4 12 L -12 12 Z" fill="#fbcfe8" stroke={STROKE} strokeWidth={2.5} />
    <rect x={-16} y={-12} width={5} height={24} fill={STROKE} />
    {state.sounding === true && (
      <g fill="none" stroke="#db2777" strokeWidth={2.5} strokeLinecap="round">
        <path d="M 12 -8 q 5 8 0 16" />
        <path d="M 18 -12 q 8 12 0 24" />
      </g>
    )}
    <Pin x={-30} y={0} />
    <Pin x={30} y={0} />
  </g>
);

// -------------------------------------------------------------------- motor

const MotorVisual = ({ state }: V) => {
  const speed = Math.min(1, Number(state.speed ?? 0));
  return (
    <g>
      <Lead x1={-32} y1={0} x2={-16} y2={0} />
      <Lead x1={32} y1={0} x2={16} y2={0} />
      <circle cx={0} cy={0} r={17} fill="#e0e7ff" stroke={STROKE} strokeWidth={2.5} />
      <g style={speed > 0.02 ? { transformOrigin: '0px 0px', animation: `cq-spin ${Math.max(0.15, 1.4 - speed * 1.3)}s linear infinite` } : undefined}>
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#4338ca" strokeWidth={4} strokeLinecap="round" />
        <circle cx={0} cy={0} r={3} fill="#4338ca" />
      </g>
      <Pin x={-32} y={0} />
      <Pin x={32} y={0} />
      {speed > 0.02 && <ValueTag y={-24} text={`${state.rpm ?? 0} rpm`} color="#4338ca" />}
    </g>
  );
};

// --------------------------------------------------------------- transistor

const TransistorVisual = ({ state }: V) => {
  const mode = String(state.mode ?? 'off');
  const active = mode !== 'off';
  return (
    <g>
      <Lead x1={-40} y1={0} x2={-12} y2={0} />
      <Lead x1={26} y1={-26} x2={14} y2={-14} />
      <Lead x1={26} y1={26} x2={14} y2={14} />
      <circle cx={6} cy={0} r={17} fill="#d1fae5" stroke={STROKE} strokeWidth={2.5} />
      <line x1={-12} y1={-12} x2={-12} y2={12} stroke={STROKE} strokeWidth={3.5} />
      <line x1={-12} y1={0} x2={8} y2={0} stroke={STROKE} strokeWidth={3} />
      <line x1={4} y1={-6} x2={14} y2={-14} stroke={STROKE} strokeWidth={3} />
      <line x1={4} y1={6} x2={14} y2={14} stroke={STROKE} strokeWidth={3} />
      {active && <path d="M 8 8 L 0 10 L 6 15 Z" fill={STROKE} />}
      <Pin x={-40} y={0} />
      <Pin x={26} y={-26} />
      <Pin x={26} y={26} />
      <ValueTag y={44} text={mode === 'sat' ? 'SAT' : mode === 'active' ? 'ON' : 'OFF'} color={active ? '#047857' : '#94a3b8'} />
    </g>
  );
};

// ------------------------------------------------------------------ ammeter

const AmmeterVisual = ({ state }: V) => {
  const i = Math.abs(Number(state.current ?? 0));
  return (
    <g>
      <Lead x1={-32} y1={0} x2={-15} y2={0} />
      <Lead x1={32} y1={0} x2={15} y2={0} />
      <circle cx={0} cy={0} r={16} fill="#fff" stroke={STROKE} strokeWidth={2.5} />
      <text x={0} y={6} textAnchor="middle" fontSize={16} fontWeight={800} fill="#0f766e">A</text>
      <Pin x={-32} y={0} />
      <Pin x={32} y={0} />
      {i > 1e-5 && <ValueTag y={-22} text={`${(i * 1000).toFixed(1)} mA`} color="#0f766e" />}
    </g>
  );
};

// ------------------------------------------------------------------ lookup

const VISUALS: Record<string, (p: V) => React.ReactElement> = {
  battery: BatteryVisual,
  resistor: ResistorVisual,
  led: LedVisual,
  switch: SwitchVisual,
  button: ButtonVisual,
  potentiometer: PotVisual,
  capacitor: CapacitorVisual,
  diode: DiodeVisual,
  ldr: LdrVisual,
  buzzer: BuzzerVisual,
  motor: MotorVisual,
  transistor: TransistorVisual,
  ammeter: AmmeterVisual,
};

export function PartVisual({
  type,
  params,
  state,
}: {
  type: string;
  params: PartParams;
  state: PartState;
}) {
  const Visual = VISUALS[type];
  if (!Visual) return null;
  return <Visual params={params} state={state} />;
}

/** small icon version for palette buttons (no pins) */
export function PartIcon({ type, size = 44 }: { type: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-50 -34 100 68" aria-hidden>
      <PartVisual type={type} params={defaultParamsFor(type)} state={{}} />
    </svg>
  );
}

export function defaultParamsFor(type: string): PartParams {
  const def = PART_MAP.get(type);
  const p: PartParams = {};
  def?.params.forEach((s) => (p[s.key] = s.default));
  return p;
}
