'use client';

/**
 * Cartoon SVG art for electronic parts shown inside the exploded device views.
 * Each part: flat + soft-3D, bold outline, no text (name/desc live in the UI).
 */

export type PartKind =
  | 'screen' | 'battery' | 'board' | 'chip' | 'camera' | 'speaker'
  | 'motor' | 'wires' | 'lamp' | 'control' | 'dpad' | 'bell'
  | 'key' | 'sensor' | 'plugs';

const INK = '#334155';

function Screen() {
  return (
    <g>
      <rect x="14" y="8" width="72" height="62" rx="9" fill="#475569" stroke={INK} strokeWidth="3" />
      <defs>
        <linearGradient id="pa-scr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0f9ff" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <rect x="20" y="14" width="60" height="50" rx="5" fill="url(#pa-scr)" stroke="#0369a1" strokeWidth="2" />
      <path d="M 23 17 L 32 14 L 23 34 Z" fill="#fff" opacity="0.55" />
      <path d="M 68 26 l 2.6 5 5 2.6 -5 2.6 -2.6 5 -2.6 -5 -5 -2.6 5 -2.6 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.4" />
    </g>
  );
}

function Battery() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-bat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="76" y="33" width="10" height="14" rx="3" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
      <rect x="14" y="24" width="64" height="32" rx="9" fill="url(#pa-bat)" stroke={INK} strokeWidth="3" />
      <path d="M 16 47 h 60" stroke="#d97706" strokeWidth="2.5" opacity="0.5" />
      <path d="M 50 26 L 40 42 h 8 L 44 54 L 56 38 h -8 Z" fill="#fff" stroke="#b45309" strokeWidth="1.6" strokeLinejoin="round" />
      {/* + / − */}
      <path d="M 24 34 v 12 M 18 40 h 12" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 40 h -9" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function Board() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-brd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect x="12" y="16" width="76" height="48" rx="7" fill="url(#pa-brd)" stroke={INK} strokeWidth="3" />
      <path d="M 20 28 h 16 v 10 h 12 M 80 56 h -18 v -10 h -8 M 20 54 h 12 v -8" fill="none" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="42" y="30" width="18" height="14" rx="2.5" fill="#334155" stroke="#0f172a" strokeWidth="2" />
      <circle cx="46" cy="33.5" r="1.1" fill="#94a3b8" />
      <circle cx="56" cy="33.5" r="1.1" fill="#94a3b8" />
      {[
        [24, 22], [76, 24], [24, 58], [76, 58],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#fcd34d" stroke="#a16207" strokeWidth="1.8" />
      ))}
    </g>
  );
}

function Chip() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-chp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="1" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      {[28, 39, 50].map((y) => (
        <g key={y} stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round">
          <line x1="16" y1={y} x2="29" y2={y} />
          <line x1="71" y1={y} x2="84" y2={y} />
        </g>
      ))}
      <rect x="29" y="19" width="42" height="42" rx="7" fill="url(#pa-chp)" stroke={INK} strokeWidth="3" />
      <rect x="35" y="24" width="13" height="9" rx="2" fill="#fff" opacity="0.25" />
      <path d="M 39 40 q 5.5 -9 11 0 q 5.5 9 11 0" fill="none" stroke="#67e8f9" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="50" cy="33" r="2.2" fill="#fbbf24" />
    </g>
  );
}

function Camera() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-cam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <rect x="40" y="10" width="20" height="10" rx="4" fill="#64748b" stroke={INK} strokeWidth="2.5" />
      <rect x="20" y="17" width="60" height="47" rx="11" fill="url(#pa-cam)" stroke={INK} strokeWidth="3" />
      <circle cx="50" cy="40" r="15" fill="#0f172a" stroke={INK} strokeWidth="2.5" />
      <circle cx="50" cy="40" r="10" fill="#1d4ed8" />
      <circle cx="50" cy="40" r="5" fill="#93c5fd" />
      <circle cx="46" cy="36" r="2" fill="#fff" opacity="0.85" />
      <circle cx="70" cy="27" r="4.5" fill="#fde047" stroke="#b45309" strokeWidth="2" />
    </g>
  );
}

function Speaker() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>
      <rect x="16" y="20" width="50" height="40" rx="9" fill="url(#pa-spk)" stroke={INK} strokeWidth="3" />
      {[31, 40, 49].map((x) =>
        [30, 40, 50].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#e2e8f0" opacity="0.9" />),
      )}
      <path d="M 74 30 q 8 10 0 20" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 83 25 q 12 15 0 30" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function Motor() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-mtr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1f5f9" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <rect x="20" y="24" width="42" height="32" rx="9" fill="url(#pa-mtr)" stroke={INK} strokeWidth="3" />
      <path d="M 34 24 v 32 M 48 24 v 32" stroke="#64748b" strokeWidth="2.5" opacity="0.7" />
      <ellipse cx="22" cy="40" rx="4.5" ry="16" fill="#cbd5e1" stroke={INK} strokeWidth="2.5" />
      <rect x="62" y="35" width="16" height="10" rx="4" fill="#64748b" stroke={INK} strokeWidth="2.5" />
      <path d="M 82 30 q 7 10 0 20" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 90 26 q 9 14 0 28" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
    </g>
  );
}

function Wires() {
  return (
    <g>
      <path d="M 18 58 C 34 18 56 18 82 44" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
      <path d="M 18 58 C 34 18 56 18 82 44" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M 22 66 C 42 40 62 40 84 58" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <path d="M 22 66 C 42 40 62 40 84 58" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <circle cx="82" cy="44" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <circle cx="84" cy="58" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <circle cx="18" cy="58" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <circle cx="22" cy="66" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
    </g>
  );
}

function Lamp() {
  return (
    <g>
      <defs>
        <radialGradient id="pa-lmp" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="1" stopColor="#fbbf24" />
        </radialGradient>
      </defs>
      <path d="M 16 16 l 6 6 M 30 8 l 1.5 8 M 6 32 l 8 -1.5" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="28" cy="34" r="14" fill="url(#pa-lmp)" stroke="#b45309" strokeWidth="3" />
      <rect x="23" y="47" width="10" height="8" rx="2.5" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
      <path d="M 78 24 l 5 5 M 90 18 l 1.2 7 M 68 12 l 1.2 7" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="76" cy="40" r="11.5" fill="url(#pa-lmp)" stroke="#b45309" strokeWidth="3" />
      <rect x="72" y="51" width="8" height="7" rx="2.5" fill="#94a3b8" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

function Control() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-ctl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="12" y="18" width="64" height="44" rx="7" fill="url(#pa-ctl)" stroke={INK} strokeWidth="3" />
      <path d="M 20 28 h 10 v 8 M 68 54 h -14 v -8" fill="none" stroke="#bfdbfe" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="30" cy="40" r="9" fill="#e2e8f0" stroke={INK} strokeWidth="2.5" />
      <path d="M 30 40 L 35 34" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="46" y="32" width="20" height="13" rx="2.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      {[
        [20, 24], [68, 24], [20, 56], [68, 56],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill="#fcd34d" stroke="#a16207" strokeWidth="1.4" />
      ))}
    </g>
  );
}

function Dpad() {
  return (
    <g>
      <rect x="26" y="32" width="30" height="14" rx="5" fill="#475569" stroke={INK} strokeWidth="3" />
      <rect x="34" y="24" width="14" height="30" rx="5" fill="#475569" stroke={INK} strokeWidth="3" />
      <circle cx="41" cy="39" r="3" fill="#94a3b8" />
      <circle cx="74" cy="30" r="8.5" fill="#f472b6" stroke="#9d174d" strokeWidth="3" />
      <circle cx="85" cy="47" r="8.5" fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
      <circle cx="72" cy="27.5" r="2.2" fill="#fff" opacity="0.6" />
      <circle cx="83" cy="44.5" r="2.2" fill="#fff" opacity="0.6" />
    </g>
  );
}

function BellPart() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-bl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <path d="M 74 20 q 9 12 0 24" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 84 15 q 12 17 0 34" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
      <circle cx="46" cy="17" r="4.5" fill="#d97706" stroke={INK} strokeWidth="2.5" />
      <path d="M 28 50 C 28 22 64 22 64 50 Z" fill="url(#pa-bl)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="24" y="47" width="44" height="8" rx="4" fill="#d97706" stroke={INK} strokeWidth="2.5" />
      <circle cx="46" cy="61" r="5.5" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
    </g>
  );
}

function Key() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-key" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect x="26" y="28" width="48" height="30" rx="8" fill="#64748b" stroke={INK} strokeWidth="3" />
      <circle cx="50" cy="38" r="12" fill="url(#pa-key)" stroke="#991b1b" strokeWidth="3" />
      <path d="M 43 33 q 7 -6 14 0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M 20 46 h -8 M 88 46 h -8" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Sensor() {
  return (
    <g>
      <circle cx="42" cy="40" r="18" fill="#e2e8f0" stroke={INK} strokeWidth="3" />
      <circle cx="42" cy="40" r="11" fill="#22d3ee" stroke="#0e749e" strokeWidth="2.5" />
      <circle cx="42" cy="40" r="5" fill="#164e63" />
      <circle cx="38" cy="36" r="2" fill="#fff" opacity="0.9" />
      <path d="M 70 30 q 8 10 0 20" fill="none" stroke="#22d3ee" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 80 25 q 11 15 0 30" fill="none" stroke="#22d3ee" strokeWidth="3.2" strokeLinecap="round" opacity="0.65" />
    </g>
  );
}

function Plugs() {
  return (
    <g>
      <defs>
        <linearGradient id="pa-plg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="14" y="28" width="32" height="24" rx="7" fill="url(#pa-plg)" stroke={INK} strokeWidth="3" />
      {[33, 40, 47].map((y) => (
        <rect key={y} x="46" y={y - 2.5} width="12" height="5" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.6" />
      ))}
      <rect x="60" y="24" width="14" height="32" rx="5" fill="#475569" stroke={INK} strokeWidth="3" />
      {[33, 40, 47].map((y) => (
        <circle key={y} cx="67" cy={y} r="2" fill="#0f172a" />
      ))}
      <path d="M 84 32 l 5 -4 M 85 40 h 7 M 84 48 l 5 4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

const PART_ART: Record<PartKind, () => React.JSX.Element> = {
  screen: Screen,
  battery: Battery,
  board: Board,
  chip: Chip,
  camera: Camera,
  speaker: Speaker,
  motor: Motor,
  wires: Wires,
  lamp: Lamp,
  control: Control,
  dpad: Dpad,
  bell: BellPart,
  key: Key,
  sensor: Sensor,
  plugs: Plugs,
};

/** A single part visual (viewBox 100×80). `w`/`h` set explicit SVG attrs (needed when nested inside another svg). */
export function PartArt({ kind, className = '', w, h }: { kind: PartKind; className?: string; w?: number; h?: number }) {
  const Art = PART_ART[kind];
  return (
    <svg viewBox="0 0 100 80" width={w} height={h} className={className} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
