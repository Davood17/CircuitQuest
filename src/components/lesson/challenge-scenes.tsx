'use client';

/**
 * Challenge scenes for the redesigned l0-1 «الکترونیک چیست؟» lesson.
 *
 * Design rules (user spec):
 *  - page 1: a calm, static intro panel — NO extra animation, so the child
 *    can focus on the teacher's very first words.
 *  - page 2: a split-screen challenge — simple electricity (a plain lamp
 *    that can ONLY switch on/off) vs. smart electronics (a robot the child
 *    commands: light color + wheel speed).
 *  - page 3: the toy hospital — rebuild a dead RC car; battery wired
 *    straight to the motor crashes into the wall, adding the electronic
 *    brain makes the car steerable with a game controller.
 *
 * The two challenge scenes report completion through `onTaskDone` — the
 * lesson player keeps the "next" button disabled until then (and until the
 * teacher's speech is fully heard).
 */

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';
import { sfx } from '@/lib/sfx';
import { L } from '@/content/helpers';

/** scene kinds that gate the lesson's "next" button on their completion */
export const CHALLENGE_KINDS = new Set(['simple-vs-smart', 'toy-hospital']);

type ChallengeProps = { onTaskDone?: () => void };

/* ============================================================ page 1 panel */

/** Static "world of commanding" panel — bright engineering room + 3 icon cards. */
export function CommandIntroScene() {
  const { lang } = useI18n();
  const tx = (t: { en: string; fa?: string }) => (lang === 'fa' && t.fa ? t.fa : t.en);

  const cards = [
    { icon: '🎮', label: L('Game console', 'دستهٔ بازی'), color: '#38bdf8' },
    { icon: '📱', label: L('Smartphone', 'گوشی هوشمند'), color: '#34d399' },
    { icon: '🚀', label: L('Rocket', 'موشک'), color: '#fbbf24' },
  ];

  return (
    <svg viewBox="0 0 640 300" className="w-full rounded-2xl border" style={{ background: 'linear-gradient(180deg,#e0f2fe 0%,#f0f9ff 55%,#fef9c3 100%)' }} role="img" aria-label={tx(L('The engineering room', 'اتاق مهندسی'))}>
      {/* window with sun */}
      <rect x="500" y="30" width="100" height="76" rx="10" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="3" />
      <circle cx="530" cy="60" r="13" fill="#fde047" />
      <path d="M 530 38 L 530 30 M 530 82 L 530 90 M 508 60 L 500 60 M 552 60 L 560 60" stroke="#fde047" strokeWidth="3" strokeLinecap="round" />
      {/* wall shelf with tools */}
      <rect x="30" y="34" width="150" height="8" rx="4" fill="#94a3b8" />
      <text x="52" y="30" fontSize="17">🔧</text>
      <text x="86" y="30" fontSize="17">🪛</text>
      <text x="120" y="30" fontSize="17">🔋</text>
      {/* engineering desk */}
      <rect x="60" y="212" width="520" height="12" rx="6" fill="#d6a75c" />
      <rect x="96" y="224" width="14" height="42" rx="4" fill="#b8873f" />
      <rect x="530" y="224" width="14" height="42" rx="4" fill="#b8873f" />
      {/* welcome banner on the desk */}
      <rect x="205" y="160" width="230" height="40" rx="12" fill="#ffffff" stroke="#38bdf8" strokeWidth="3" />
      <text x="320" y="186" fontSize="16" fontWeight="800" fill="#0369a1" textAnchor="middle">
        {tx(L('Welcome to the world of commanding!', 'به دنیای فرماندهی خوش اومدی!'))}
      </text>
      {/* the three device cards */}
      {cards.map((c, i) => {
        const x = 78 + i * 168;
        return (
          <g key={i}>
            <rect x={x} y="82" width="140" height="104" rx="16" fill="#ffffff" stroke={c.color} strokeWidth="4" />
            <text x={x + 70} y="132" fontSize="34" textAnchor="middle">{c.icon}</text>
            <text x={x + 70} y="168" fontSize="14" fontWeight="800" fill="#334155" textAnchor="middle">
              {tx(c.label)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ================================================== page 2: simple vs smart */

const LIGHT_COLORS = [
  { id: 'red', fill: '#f87171', glow: '#fecaca' },
  { id: 'yellow', fill: '#fbbf24', glow: '#fef08a' },
  { id: 'green', fill: '#4ade80', glow: '#bbf7d0' },
] as const;

/** The split-screen challenge: dumb lamp vs commandable robot. */
export function SimpleVsSmartScene({ onTaskDone }: ChallengeProps) {
  const { lang } = useI18n();
  const motion = useSettings((s) => s.motion);
  const tx = (x: { en: string; fa?: string }) => (lang === 'fa' && x.fa ? x.fa : x.en);

  const [lampOn, setLampOn] = useState(false);
  const [lampTaps, setLampTaps] = useState(0);
  const [color, setColor] = useState<'red' | 'yellow' | 'green'>('red');
  const [speed, setSpeed] = useState(0); // 0..3
  const [missionDone, setMissionDone] = useState(false);

  /** mission completed when BOTH conditions hold — checked at command time (no effect needed) */
  const commandColor = (id: 'red' | 'yellow' | 'green') => {
    sfx.blip();
    setColor(id);
    if (id === 'green' && speed === 2) finishMission();
  };
  const commandSpeed = (lvl: number) => {
    sfx.blip();
    setSpeed(lvl);
    if (lvl === 2 && color === 'green') finishMission();
  };
  const finishMission = () => {
    if (missionDone) return;
    setMissionDone(true);
    sfx.applause();
    onTaskDone?.();
  };

  const toggleLamp = () => {
    sfx.click();
    setLampOn((v) => !v);
    setLampTaps((n) => n + 1);
  };

  const colorOk = color === 'green';
  const speedOk = speed === 2;

  const curColor = LIGHT_COLORS.find((c) => c.id === color)!;
  const wheelDur = speed === 0 ? 0 : Math.max(0.45, 1.6 / speed);

  return (
    <div className="space-y-2.5">
      {/* mission banner */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-3.5 py-2.5">
        <p className="text-[15px] font-extrabold text-amber-900 leading-relaxed">
          🎯 {tx(L(
            'Mission: make the robot light GREEN and set its wheel speed to level 2!',
            'مأموریت: کاری کن نور ربات «سبز» بشه و سرعت چرخ‌هاش روی «درجهٔ ۲» قرار بگیره!',
          ))}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-[13px] font-extrabold ${colorOk ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500 border'}`}>
            {colorOk ? '✅' : '⬜'} 🟢 {tx(L('green light', 'نور سبز'))}
          </span>
          <span className={`rounded-full px-3 py-1 text-[13px] font-extrabold ${speedOk ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500 border'}`}>
            {speedOk ? '✅' : '⬜'} ⚙️ {tx(L('speed level 2', 'سرعت درجهٔ ۲'))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* RIGHT (first in RTL DOM): simple electricity */}
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-100 p-2.5">
          <p className="mb-1.5 text-center text-[13px] font-extrabold text-slate-500">
            ⚡ {tx(L('Simple electricity', 'برق ساده'))}
          </p>
          <div className="relative flex h-44 flex-col items-center justify-center rounded-xl bg-white">
            {/* wall lamp */}
            <svg viewBox="0 0 120 130" className="h-32">
              <line x1="60" y1="0" x2="60" y2="16" stroke="#94a3b8" strokeWidth="4" />
              <rect x="38" y="16" width="44" height="10" rx="4" fill="#64748b" />
              {lampOn && <circle cx="60" cy="56" r="30" fill="#fde68a" opacity="0.55" />}
              <circle cx="60" cy="56" r="20" fill={lampOn ? '#fde047' : '#e2e8f0'} stroke="#94a3b8" strokeWidth="3" />
              <rect x="46" y="80" width="28" height="14" rx="4" fill="#94a3b8" />
            </svg>
            {/* the dumb switch: tap = on/off, nothing else ever happens */}
            <button
              onClick={toggleLamp}
              className={`mt-1 rounded-full border-4 px-6 py-2 text-[15px] font-extrabold transition-colors ${lampOn ? 'border-amber-400 bg-amber-100 text-amber-700' : 'border-slate-300 bg-white text-slate-500'}`}
            >
              {lampOn ? `💡 ${tx(L('on', 'روشن'))}` : `🔌 ${tx(L('off', 'خاموش'))}`}
            </button>
          </div>
          {lampTaps >= 3 && (
            <p className="cq-pop mt-2 rounded-xl bg-white px-2.5 py-1.5 text-[12.5px] font-bold leading-relaxed text-slate-500">
              💡 {tx(L(
                'See? It can ONLY turn on and off — no song, no dimming. That is simple electricity!',
                'دیدی؟ فقط روشن و خاموش میشه — نه آهنگ، نه کم‌نور شدن! این «برقِ ساده»‌ست.',
              ))}
            </p>
          )}
        </div>

        {/* LEFT: smart electronics */}
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-2.5">
          <p className="mb-1.5 text-center text-[13px] font-extrabold text-teal-700">
            🧠 {tx(L('Smart electronics', 'الکترونیک هوشمند'))}
          </p>
          <div className="relative flex h-44 flex-col items-center justify-center overflow-hidden rounded-xl bg-white">
            {/* celebration */}
            {missionDone && motion && (
              <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-around text-xl">
                <span className="cq-pop">✨</span><span className="cq-pop" style={{ animationDelay: '120ms' }}>🎉</span><span className="cq-pop" style={{ animationDelay: '240ms' }}>✨</span>
              </span>
            )}
            {/* the commandable robot */}
            <svg viewBox="0 0 120 130" className="h-32">
              {/* antenna light — the child chooses its color */}
              <line x1="60" y1="8" x2="60" y2="22" stroke="#0d9488" strokeWidth="3" />
              {color !== null && <circle cx="60" cy="12" r="8" fill={curColor.fill} stroke={curColor.glow} strokeWidth="3" />}
              <rect x="34" y="22" width="52" height="42" rx="12" fill="#e0f2f1" stroke="#0d9488" strokeWidth="3" />
              {/* face — happy on success */}
              {missionDone ? (
                <path d="M 46 42 Q 60 52 74 42" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
              ) : (
                <>
                  <circle cx="50" cy="42" r="3.4" fill="#0f766e" />
                  <circle cx="70" cy="42" r="3.4" fill="#0f766e" />
                </>
              )}
              {/* wheels — spin at the commanded speed */}
              {[
                { cx: 44 },
                { cx: 76 },
              ].map((wheel, i) => (
                <g key={i} style={wheelDur && motion ? { transformOrigin: `${wheel.cx}px 92px`, animation: `cq-spin ${wheelDur}s linear infinite` } : undefined}>
                  <circle cx={wheel.cx} cy="92" r="13" fill="#134e4a" />
                  <circle cx={wheel.cx} cy="92" r="4" fill="#99f6e4" />
                  <line x1={wheel.cx - 12} y1="92" x2={wheel.cx + 12} y2="92" stroke="#99f6e4" strokeWidth="2.5" />
                </g>
              ))}
              <rect x="30" y="72" width="60" height="14" rx="6" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
            </svg>
            {/* control panel */}
            <div className="mt-1 flex items-center gap-1.5">
              {LIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  aria-label={tx(L(`set ${c.id} light`, c.id === 'red' ? 'نور قرمز' : c.id === 'yellow' ? 'نور زرد' : 'نور سبز'))}
                  onClick={() => commandColor(c.id)}
                  className={`h-8 w-8 rounded-full border-4 transition-transform active:scale-90 ${color === c.id ? 'border-slate-700 scale-110' : 'border-white'}`}
                  style={{ background: c.fill }}
                />
              ))}
              {/* speed lever */}
              <div className="ms-1 flex items-center gap-1 rounded-full border-2 border-teal-200 bg-teal-50 px-1.5 py-1">
                <span className="text-[11px] font-extrabold text-teal-700">⚙️</span>
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => commandSpeed(lvl)}
                    className={`h-6 w-6 rounded-full text-[12px] font-extrabold leading-none ${speed === lvl ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border border-teal-200'}`}
                  >
                    {lang === 'fa' ? '۱۲۳'[lvl - 1] : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {missionDone && (
            <p className="cq-pop mt-2 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[12.5px] font-extrabold leading-relaxed text-emerald-700">
              🎉 {tx(L(
                'You gave the robot a COMMAND — that is electronics!',
                'به ربات فرمان دادی — این یعنی الکترونیک!',
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================================================== page 3: toy hospital */

type ToyPart = 'battery' | 'brain' | 'motor' | 'wires';

/** The toy-surgery table: rebuild the RC car — brainless power crashes, the brain makes it steerable. */
export function ToyHospitalScene({ onTaskDone }: ChallengeProps) {
  const { lang } = useI18n();
  const motion = useSettings((s) => s.motion);
  const tx = (x: { en: string; fa?: string }) => (lang === 'fa' && x.fa ? x.fa : x.en);

  const [placed, setPlaced] = useState<Record<ToyPart, boolean>>({ battery: false, brain: false, motor: false, wires: false });
  const [phase, setPhase] = useState<'build' | 'crash' | 'control' | 'done'>('build');
  const [steered, setSteered] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });
  const [crashHint, setCrashHint] = useState(false);
  const [tilt, setTilt] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((id) => window.clearTimeout(id)); }, []);

  const fire = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const place = (part: ToyPart) => {
    sfx.blip();
    setPlaced((p) => ({ ...p, [part]: true }));
  };

  const powerOn = () => {
    if (!placed.battery || !placed.motor) return;
    if (!(placed.brain && placed.wires)) {
      // the simple-electricity experiment: raw power, no brain → CRASH
      sfx.whoosh();
      setPhase('crash');
      setCrashHint(false);
      fire(() => setCrashHint(true), 1500);
      fire(() => setPhase('build'), 2400);
      return;
    }
    sfx.click();
    setPhase('control');
  };

  const steer = (dir: 'left' | 'right') => {
    if (phase !== 'control') return;
    sfx.click();
    setTilt(dir === 'left' ? -8 : 8);
    fire(() => setTilt(0), 420);
    const next = { ...steered, [dir]: true };
    setSteered(next);
    if (next.left && next.right) {
      setPhase('done');
      sfx.applause();
      onTaskDone?.();
    }
  };

  const toolbox: { id: ToyPart; icon: string; label: { en: string; fa?: string } }[] = [
    { id: 'battery', icon: '🔋', label: L('Battery', 'باتری') },
    { id: 'brain', icon: '🧠', label: L('Electronic brain (board)', 'مغز الکترونیکی (برد)') },
    { id: 'motor', icon: '⚙️', label: L('Motor', 'موتور') },
    { id: 'wires', icon: '🔌', label: L('Wires', 'سیم‌ها') },
  ];

  const crashing = phase === 'crash';
  const carShift = crashing ? '-92px' : '0px';

  return (
    <div className="space-y-2.5">
      {/* surgery table */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-3">
        <p className="mb-1 text-center text-[13px] font-extrabold text-sky-700">
          🏥 {tx(L('The toy surgery table', 'میز جراحیِ اسباب‌بازی‌ها'))}
        </p>

        {/* the wall the brainless car crashes into */}
        <div className="absolute inset-y-8 end-auto start-0 w-3 rounded-s-md bg-slate-300" style={{ boxShadow: 'inset -2px 0 0 #94a3b8' }} aria-hidden />

        <div
          className="relative mx-auto w-[82%] transition-transform duration-500"
          style={{ transform: `translateX(${carShift}) ${crashing ? 'rotate(-3deg)' : `rotate(${tilt}deg)`}`, marginTop: 8 }}
        >
          {/* the transparent-body RC car */}
          <svg viewBox="0 0 320 150" className="w-full">
            {/* body */}
            <rect x="34" y="26" width="252" height="72" rx="18" fill="#e0f2fe" fillOpacity="0.75" stroke="#0284c7" strokeWidth="3.5" />
            {/* cockpit */}
            <rect x="196" y="12" width="72" height="24" rx="10" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
            <text x="232" y="30" fontSize="13" textAnchor="middle">🕹️</text>
            {/* slot: battery (right in RTL reading order = x high) */}
            <g opacity={placed.battery ? 1 : 0.55}>
              <rect x="216" y="40" width="56" height="44" rx="10" fill={placed.battery ? '#bbf7d0' : '#f8fafc'} stroke={placed.battery ? '#22c55e' : '#cbd5e1'} strokeWidth="2.5" strokeDasharray={placed.battery ? undefined : '6 4'} />
              <text x="244" y="70" fontSize="24" textAnchor="middle">{placed.battery ? '🔋' : '⬚'}</text>
            </g>
            {/* slot: brain (middle) */}
            <g opacity={placed.brain ? 1 : 0.55}>
              <rect x="132" y="40" width="56" height="44" rx="10" fill={placed.brain ? '#ddd6fe' : '#f8fafc'} stroke={placed.brain ? '#7c3aed' : '#cbd5e1'} strokeWidth="2.5" strokeDasharray={placed.brain ? undefined : '6 4'} />
              <text x="160" y="70" fontSize="24" textAnchor="middle">{placed.brain ? '🧠' : '⬚'}</text>
            </g>
            {/* slot: motor (left) */}
            <g opacity={placed.motor ? 1 : 0.55}>
              <rect x="48" y="40" width="56" height="44" rx="10" fill={placed.motor ? '#fed7aa' : '#f8fafc'} stroke={placed.motor ? '#ea580c' : '#cbd5e1'} strokeWidth="2.5" strokeDasharray={placed.motor ? undefined : '6 4'} />
              <text x="76" y="70" fontSize="24" textAnchor="middle">{placed.motor ? '⚙️' : '⬚'}</text>
            </g>
            {/* internal wires battery → brain → motor */}
            {placed.wires && (
              <path d="M 216 62 L 188 62 M 132 62 L 104 62" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
            )}
            {/* wheels: spin fast during the crash / while steering */}
            {[68, 148, 252].map((cx, i) => (
              <g
                key={i}
                style={
                  (crashing || phase === 'control' || phase === 'done') && motion
                    ? { transformOrigin: `${cx}px 112px`, animation: `cq-spin ${crashing ? 0.3 : 1.1}s linear infinite` }
                    : undefined
                }
              >
                <circle cx={cx} cy="112" r="17" fill="#0f172a" />
                <circle cx={cx} cy="112" r="5.5" fill="#e2e8f0" />
                <line x1={cx - 15} y1="112" x2={cx + 15} y2="112" stroke="#e2e8f0" strokeWidth="3" />
              </g>
            ))}
          </svg>
          {/* crash burst */}
          {crashing && (
            <span aria-hidden className="cq-pop absolute start-0 top-6 text-3xl">💥</span>
          )}
        </div>

        {crashing && (
          <p className="cq-pop mt-1 text-center text-[15px] font-extrabold text-rose-600">
            {tx(L('BOOM! No brain → no control!', 'بوووم! بدون مغز → بدون کنترل!'))}
          </p>
        )}
        {crashHint && phase === 'build' && (
          <p className="cq-pop mt-1 rounded-xl bg-white px-3 py-1.5 text-center text-[12.5px] font-bold leading-relaxed text-slate-600">
            🤖 {tx(L(
              'That was just simple electricity: the motor ran wild and the car crashed. Put the electronic brain in the middle and connect the wires!',
              'این فقط برقِ ساده بود: موتور بی‌وقفه چرخید و ماشین به دیوار خورد. حالا مغزِ الکترونیکی رو وسط بذار و سیم‌ها رو وصل کن!',
            ))}
          </p>
        )}
      </div>

      {/* phase: control → the game controller appears */}
      {(phase === 'control' || phase === 'done') && (
        <div className="cq-pop rounded-2xl border-2 border-violet-300 bg-violet-50 p-3">
          <p className="text-center text-[13.5px] font-extrabold text-violet-800">
            🎮 {tx(L('The game controller appeared — steer the car both ways!', 'دستهٔ بازی ظاهر شد — ماشین رو یک‌بار به هر طرف بچرخون!'))}
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-4">
            <button
              onClick={() => steer('right')}
              className="rounded-2xl border-4 border-violet-300 bg-white px-6 py-3 text-xl font-extrabold text-violet-700 active:scale-95"
            >
              {steered.right ? '✅' : ''} {tx(L('right ⏩', 'راست ⏩'))}
            </button>
            <button
              onClick={() => steer('left')}
              className="rounded-2xl border-4 border-violet-300 bg-white px-6 py-3 text-xl font-extrabold text-violet-700 active:scale-95"
            >
              {steered.left ? '✅' : ''} {tx(L('⏪ left', '⏪ چپ'))}
            </button>
          </div>
          {phase === 'done' && (
            <p className="cq-pop mt-2.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-center text-[13px] font-extrabold text-emerald-700">
              🎉 {tx(L(
                'You are commanding the car now — it became a smart robot!',
                'حالا تو به ماشین فرمان میدی — تبدیل به یک رباتِ هوشمند شد!',
              ))}
            </p>
          )}
        </div>
      )}

      {/* toolbox */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-2.5">
        <p className="mb-1.5 text-center text-[13px] font-extrabold text-amber-800">
          🧰 {tx(L('Parts toolbox — tap a part to put it in its place', 'جعبه‌ابزار قطعات — روی هر قطعه بزن تا سر جاش بشینه'))}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {toolbox.map((part) => (
            <button
              key={part.id}
              onClick={() => place(part.id)}
              disabled={placed[part.id]}
              className={`rounded-xl border-2 px-3 py-2 text-[13px] font-extrabold transition-all ${placed[part.id] ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-amber-300 bg-white text-slate-700 active:scale-95'}`}
            >
              {part.icon} {tx(part.label)} {placed[part.id] ? '✅' : ''}
            </button>
          ))}
        </div>
        {phase === 'build' && (
          <div className="mt-2.5 flex justify-center">
            <button
              onClick={powerOn}
              disabled={!placed.battery || !placed.motor}
              className={`rounded-full px-6 py-2.5 text-[15px] font-extrabold ${placed.battery && placed.motor ? 'bg-amber-500 text-white active:scale-95' : 'bg-slate-200 text-slate-400'}`}
            >
              ⚡ {tx(L('Connect the power!', 'برق رو وصل کن!'))}
            </button>
          </div>
        )}
        {phase === 'build' && placed.battery && placed.motor && !placed.brain && !crashHint && (
          <p className="mt-1.5 text-center text-[11.5px] font-bold text-amber-700">
            {tx(L('(Try powering it without the brain… what could go wrong?)', '(بدون مغز روشنش کن ببین چی میشه…)'))}
          </p>
        )}
      </div>
    </div>
  );
}
