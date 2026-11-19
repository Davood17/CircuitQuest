'use client';

/**
 * Cartoon SVG art for the five everyday devices of the discovery lesson (l0-1).
 * Flat + soft-3D style: bold friendly outlines, bright fills, rounded shapes.
 * Pure art — no text inside (labels live in DeviceDiscovery).
 */

export type DeviceId = 'phone' | 'car' | 'console' | 'bell' | 'robot';

const INK = '#334155';

/** soft ground shadow under each closed device */
function Shadow({ cy = 111, rx = 34 }: { cy?: number; rx?: number }) {
  return <ellipse cx={60} cy={cy} rx={rx} ry={5} fill="#e2e8f0" />;
}

function Phone() {
  return (
    <g>
      <Shadow cy={110} rx={26} />
      <defs>
        <linearGradient id="dv-phone-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="dv-phone-s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0f9ff" />
          <stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <rect x="38" y="10" width="44" height="96" rx="13" fill="url(#dv-phone-b)" stroke={INK} strokeWidth="3" />
      <rect x="44" y="23" width="32" height="66" rx="7" fill="url(#dv-phone-s)" stroke="#0369a1" strokeWidth="2" />
      <path d="M 47 26 L 55 23 L 47 40 Z" fill="#fff" opacity="0.55" />
      <rect x="53" y="15" width="14" height="3.5" rx="1.75" fill="#0369a1" opacity="0.55" />
      <circle cx="60" cy="97" r="4" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
      {/* little "electric" hint badge */}
      <circle cx="83" cy="24" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <path d="M 84 19 L 79.5 25.5 H 83 L 81.5 29 L 86.5 22.5 H 83.5 Z" fill="#7c2d12" />
    </g>
  );
}

function Car() {
  return (
    <g>
      <Shadow cy={109} rx={38} />
      <defs>
        <linearGradient id="dv-car-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* cabin */}
      <path d="M 34 66 Q 36 42 56 42 H 70 Q 86 42 90 66 Z" fill="#fca5a5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 44 63 Q 46 48 56 48 H 60 V 63 Z" fill="#bae6fd" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 66 63 V 48 H 70 Q 78 48 82 63 Z" fill="#bae6fd" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* body */}
      <rect x="16" y="62" width="88" height="28" rx="13" fill="url(#dv-car-b)" stroke={INK} strokeWidth="3" />
      <rect x="90" y="68" width="9" height="9" rx="3" fill="#fde047" stroke="#b45309" strokeWidth="2" />
      {/* wheels */}
      <circle cx="36" cy="92" r="11" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="36" cy="92" r="4.5" fill="#cbd5e1" />
      <circle cx="86" cy="92" r="11" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="86" cy="92" r="4.5" fill="#cbd5e1" />
      {/* electric hint badge */}
      <circle cx="20" cy="52" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <path d="M 21 47 L 16.5 53.5 H 20 L 18.5 57 L 23.5 50.5 H 20.5 Z" fill="#7c2d12" />
    </g>
  );
}

function Console() {
  return (
    <g>
      <Shadow cy={97} rx={38} />
      <defs>
        <linearGradient id="dv-con-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="20" y="28" width="80" height="62" rx="16" fill="url(#dv-con-b)" stroke={INK} strokeWidth="3" />
      <rect x="38" y="36" width="44" height="32" rx="6" fill="#e0f2fe" stroke="#4c1d95" strokeWidth="2.5" />
      <path d="M 41 39 L 49 36 L 41 52 Z" fill="#fff" opacity="0.55" />
      {/* d-pad */}
      <rect x="26" y="72" width="15" height="7" rx="3" fill="#4c1d95" />
      <rect x="30" y="68" width="7" height="15" rx="3" fill="#4c1d95" />
      {/* buttons */}
      <circle cx="80" cy="74" r="4.5" fill="#f472b6" stroke="#9d174d" strokeWidth="2" />
      <circle cx="90" cy="68" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {/* speaker dots */}
      <circle cx="56" cy="78" r="1.8" fill="#4c1d95" opacity="0.7" />
      <circle cx="62" cy="78" r="1.8" fill="#4c1d95" opacity="0.7" />
      <circle cx="68" cy="78" r="1.8" fill="#4c1d95" opacity="0.7" />
      {/* electric hint badge */}
      <circle cx="96" cy="32" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      <path d="M 97 27 L 92.5 33.5 H 96 L 94.5 37 L 99.5 30.5 H 96.5 Z" fill="#7c2d12" />
    </g>
  );
}

function Bell() {
  return (
    <g>
      <Shadow cy={103} rx={34} />
      <defs>
        <linearGradient id="dv-bell-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      {/* sound arcs */}
      <path d="M 22 46 Q 14 60 22 74" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
      <path d="M 98 46 Q 106 60 98 74" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" opacity="0.75" />
      {/* base unit */}
      <rect x="28" y="80" width="64" height="20" rx="9" fill="#14b8a6" stroke={INK} strokeWidth="3" />
      <circle cx="60" cy="90" r="5.5" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
      {/* dome */}
      <path d="M 40 82 C 40 46 80 46 80 82 Z" fill="url(#dv-bell-d)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="36" y="77" width="48" height="8" rx="4" fill="#d97706" stroke={INK} strokeWidth="2.5" />
      <circle cx="60" cy="47" r="5" fill="#d97706" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

function Robot() {
  return (
    <g>
      <Shadow cy={108} rx={30} />
      <defs>
        <linearGradient id="dv-rob-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* arms */}
      <path d="M 42 70 Q 30 74 28 84" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
      <path d="M 78 70 Q 90 74 92 84" fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
      {/* antenna */}
      <line x1="60" y1="26" x2="60" y2="16" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="60" cy="12.5" r="5" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
      {/* head */}
      <rect x="37" y="25" width="46" height="34" rx="11" fill="url(#dv-rob-b)" stroke={INK} strokeWidth="3" />
      <circle cx="52" cy="41" r="6.5" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="52.5" cy="41.5" r="3" fill="#1e293b" />
      <circle cx="68" cy="41" r="6.5" fill="#fff" stroke={INK} strokeWidth="2" />
      <circle cx="68.5" cy="41.5" r="3" fill="#1e293b" />
      <path d="M 54 51.5 Q 60 55 66 51.5" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      {/* body */}
      <rect x="43" y="61" width="34" height="28" rx="9" fill="url(#dv-rob-b)" stroke={INK} strokeWidth="3" />
      <rect x="50" y="67" width="20" height="11" rx="3.5" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
      <circle cx="55" cy="72.5" r="1.7" fill="#0f766e" />
      <circle cx="60" cy="72.5" r="1.7" fill="#f59e0b" />
      <circle cx="65" cy="72.5" r="1.7" fill="#0f766e" />
      {/* feet */}
      <ellipse cx="52" cy="93" rx="7" ry="4" fill="#0f766e" />
      <ellipse cx="68" cy="93" rx="7" ry="4" fill="#0f766e" />
    </g>
  );
}

const ART: Record<DeviceId, () => React.JSX.Element> = {
  phone: Phone,
  car: Car,
  console: Console,
  bell: Bell,
  robot: Robot,
};

/** Closed (mystery) view of a device — the "what's inside?" teaser. */
export function DeviceClosedArt({ id, className = '' }: { id: DeviceId; className?: string }) {
  const Art = ART[id];
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
