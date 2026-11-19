'use client';

/**
 * Story scenes — the interactive picture pages of the new-format lessons
 * (first shipped with lesson l0-2 «برق چیست؟»).
 *
 * Unlike the pure-SVG scenes in `scenes.tsx`, these pair an AI-generated
 * story illustration (served from /public/images/lessons/<lesson>/) with a
 * small hands-on interaction, so every page has something to DO:
 *
 *   room-wake      — tap the desk lamp, then the TV: the dark room wakes up (page 1)
 *   electron-race  — hold & drag the wire: the electrons race     (page 2)
 *   power-journey  — drag along the path: power reaches home      (page 3)
 *   safe-danger    — tap the two faces of electricity             (page 4)
 *   celebration    — trophy picture + falling confetti            (reward)
 *
 * l0-3 «قوانین ایمنی مهندس کوچولو» added four more:
 *
 *   shield-unlock  — tap the shield: the 4 golden-rule locks open (page 1)
 *   battery-socket — tap the battery ✅ / the socket ⛔           (page 2)
 *   short-circuit  — drop the lamp into the wire: battery cools   (page 3)
 *   tidy-desk      — tap the clutter: the engineer's desk is ready(page 4)
 *
 * All labels are bilingual LocaleText (fa = the user's exact wording),
 * sounds go through the shared sfx kit, and the "reduce motion" setting
 * disables the decorative CSS animations.
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useI18n, type LocaleText } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';
import { sfx } from '@/lib/sfx';
import { L } from '@/content/helpers';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ shared */

/** full-bleed story illustration inside a rounded frame */
function StoryImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-white ${className}`}>
      { }
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading="lazy"
        decoding="async"
        className="block aspect-[7/4] w-full select-none object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------- page 1 · room-wake */

const ROOM_DARK = L(
  'The room is dark and everyone is asleep — tap the desk lamp to wake it up! 💡',
  'اتاق تاریکه و همه خوابند؛ چراغِ روی میز رو بزن تا اتاق روشن بشه! 💡',
);
const ROOM_LAMP_ON = L(
  'The lamp lit the room and the chick and the robot woke up! Now tap the TV to wake it up too! 📺',
  'چراغ روشن شد و جوجه و ربات بیدار شدن! حالا روی تلویزیون بزن تا اونم بیدار بشه! 📺',
);
const ROOM_TV_ONLY = L(
  'The TV is glowing in the dark room! Now tap the lamp to light the whole room up! 💡',
  'تلویزیون توی اتاقِ تاریک روشن شد! حالا چراغ رو هم بزن تا کل اتاق روشن بشه! 💡',
);
const ROOM_ALL_ON = L(
  'Everything is awake and happy — electricity wakes the devices up! ⚡✨',
  'همه بیدار و شاد شدن؛ برق رسید و وسایل بیدار شدن! ⚡✨',
);
const ROOM_SLEEP_ALL = L('Let them sleep again 😴', 'بذار دوباره بخوابن 😴');

/** the big room colors fade smoothly between night and warm light */
const RW_FILL_TR = { transition: 'fill 0.7s ease' } as const;

/** closed sleeping eyes: two soft arcs (centered on x) */
const RwSleepEyes = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g stroke={c} strokeWidth={2.6} strokeLinecap="round" fill="none">
    <path d={`M ${x - 13} ${y} Q ${x - 9} ${y + 4.5} ${x - 5} ${y}`} />
    <path d={`M ${x + 5} ${y} Q ${x + 9} ${y + 4.5} ${x + 13} ${y}`} />
  </g>
);

/** awake cartoon eyes: white ball + pupil + sparkle (two eyes centered on x) */
const RwAwakeEyes = ({ x, y }: { x: number; y: number }) => (
  <g>
    {[-13, 13].map((dx) => (
      <g key={dx}>
        <circle cx={x + dx} cy={y} r={6.2} fill="#fff" stroke="#334155" strokeWidth={1.4} />
        <circle cx={x + dx} cy={y + 0.8} r={2.9} fill="#1e293b" />
        <circle cx={x + dx - 1.6} cy={y - 1.8} r={1} fill="#fff" />
      </g>
    ))}
  </g>
);

/** floating z-z-z marker (two staggered z's rising and fading) */
const RwZzz = ({ x, y, d = 2.2 }: { x: number; y: number; d?: number }) => (
  <g transform={`translate(${x} ${y})`} fontWeight={800}>
    <text x={0} y={0} fontSize={24} fill="#c7d2fe" stroke="#312e81" strokeWidth={0.6}>
      z
      <animate attributeName="opacity" values="0;1;1;0" dur={`${d}s`} repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="translate" values="0 8;0 0;0 -10" dur={`${d}s`} repeatCount="indefinite" />
    </text>
    <text x={14} y={-13} fontSize={17} fill="#a5b4fc" stroke="#312e81" strokeWidth={0.5}>
      z
      <animate attributeName="opacity" values="0;1;1;0" dur={`${d}s`} begin={`${d / 2}s`} repeatCount="indefinite" />
      <animateTransform attributeName="transform" type="translate" values="0 8;0 0;0 -10" dur={`${d}s`} begin={`${d / 2}s`} repeatCount="indefinite" />
    </text>
  </g>
);

/** the night sky: moon + twinkling stars (stays charming even in the dark) */
const RwSky = () => (
  <g>
    <circle cx={86} cy={72} r={22} fill="#f8fafc" opacity={0.15} />
    <circle cx={86} cy={72} r={14} fill="#f8fafc" />
    <circle cx={81} cy={68} r={2.8} fill="#cbd5e1" />
    <circle cx={91} cy={76} r={2} fill="#cbd5e1" />
    {[
      [58, 52, 2, 1.6],
      [142, 56, 1.7, 2.1],
      [126, 104, 2.2, 1.3],
      [58, 118, 1.6, 2.4],
      [150, 122, 1.8, 1.9],
    ].map(([sx, sy, sr, sd]) => (
      <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r={sr} fill="#e2e8f0">
        <animate attributeName="opacity" values="0.15;1;0.15" dur={`${sd}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </g>
);

/** the awake TV face: big happy eyes + smile + retro color bars + a note */
const RwTvFace = () => (
  <g>
    <RwAwakeEyes x={110} y={264} />
    <path d="M 96 282 Q 110 294 124 282" fill="none" stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
    <circle cx={88} cy={279} r={4.5} fill="#fda4af" opacity={0.9} />
    <circle cx={132} cy={279} r={4.5} fill="#fda4af" opacity={0.9} />
    {['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'].map((c, i) => (
      <rect key={c} x={74 + i * 18} y={298} width={16} height={9} rx={2} fill={c} />
    ))}
    <text x={163} y={232} fontSize={15} fill="#0284c7" fontWeight={700}>
      ♪
      <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite" />
    </text>
  </g>
);

/**
 * The child's room at night. Two separate switches, two separate effects:
 *  • tap the DESK LAMP  → the room fills with warm light and the chick + robot wake up (TV stays off)
 *  • tap the TV         → its screen turns on with a happy awake face (even alone in the dark)
 * Everything is drawn state-by-state, so the picture itself changes — not just brightness.
 */
export function RoomWakeScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [lampOn, setLampOn] = useState(false);
  const [tvOn, setTvOn] = useState(false);

  const lit = lampOn; // the room light follows the desk lamp
  const allOn = lit && tvOn;

  const toggleLamp = () => {
    const next = !lampOn;
    setLampOn(next);
    if (next) {
      sfx.powerup();
      window.setTimeout(() => sfx.sparkle(), 380);
    } else {
      sfx.click();
    }
  };
  const toggleTv = () => {
    const next = !tvOn;
    setTvOn(next);
    if (next) {
      sfx.whirr();
      window.setTimeout(() => (lampOn ? sfx.fanfare() : sfx.sparkle()), 420);
    } else {
      sfx.click();
    }
  };
  const sleepAll = () => {
    setLampOn(false);
    setTvOn(false);
    sfx.click();
  };

  const status = !lit && !tvOn ? ROOM_DARK : lit && !tvOn ? ROOM_LAMP_ON : tvOn && !lit ? ROOM_TV_ONLY : ROOM_ALL_ON;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border bg-white">
        <svg
          viewBox="0 0 640 400"
          className="block w-full select-none"
          role="img"
          aria-label={tx(L('A dark room that wakes up: desk lamp, chick plush, robot and TV', 'اتاقی که با چراغ و تلویزیون بیدار می‌شود'))}
        >
          <defs>
            <linearGradient id="rw-cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
            </linearGradient>
            <clipPath id="rw-photo">
              <rect x={212} y={54} width={96} height={68} rx={5} />
            </clipPath>
          </defs>

          {/* ——— the room: every color switches between night and warm light ——— */}
          <rect x={0} y={0} width={640} height={265} fill={lit ? '#fdf1dd' : '#272d4e'} style={RW_FILL_TR} />
          <rect x={0} y={265} width={640} height={135} fill={lit ? '#f3d8a6' : '#1b2140'} style={RW_FILL_TR} />
          <line x1={0} y1={265} x2={640} y2={265} stroke={lit ? '#d9b87e' : '#151a33'} strokeWidth={3} style={RW_FILL_TR} />

          {/* window — it is always night outside */}
          <g>
            <rect x={42} y={36} width={124} height={108} rx={12} fill="#0d1533" stroke={lit ? '#e3b273' : '#4a4a6e'} strokeWidth={7} style={RW_FILL_TR} />
            <line x1={104} y1={36} x2={104} y2={144} stroke={lit ? '#e3b273' : '#4a4a6e'} strokeWidth={4} style={RW_FILL_TR} />
            <line x1={42} y1={90} x2={166} y2={90} stroke={lit ? '#e3b273' : '#4a4a6e'} strokeWidth={4} style={RW_FILL_TR} />
            <RwSky />
          </g>

          {/* the wall photo frame (reuses the story illustration) */}
          <rect x={206} y={48} width={108} height={80} rx={9} fill={lit ? '#caa268' : '#4a4a6e'} style={RW_FILL_TR} />
          {image ? (
            <image href={image} x={212} y={54} width={96} height={68} clipPath="url(#rw-photo)" preserveAspectRatio="xMidYMid slice" />
          ) : (
            <rect x={212} y={54} width={96} height={68} rx={5} fill={lit ? '#fef3c7' : '#31385c'} />
          )}

          {/* rug */}
          <ellipse cx={250} cy={336} rx={140} ry={34} fill={lit ? '#f9a8a8' : '#333055'} style={RW_FILL_TR} />
          <ellipse cx={250} cy={336} rx={104} ry={23} fill="none" stroke={lit ? '#e88080' : '#414066'} strokeWidth={3} strokeDasharray="10 8" style={RW_FILL_TR} />

          {/* soft shadows */}
          <ellipse cx={250} cy={324} rx={54} ry={9} fill="#0f172a" opacity={0.14} />
          <ellipse cx={372} cy={328} rx={42} ry={8} fill="#0f172a" opacity={0.14} />
          <ellipse cx={122} cy={344} rx={72} ry={9} fill="#0f172a" opacity={0.14} />
          <ellipse cx={526} cy={296} rx={92} ry={8} fill="#0f172a" opacity={0.14} />

          {/* dresser with drawers + books + the desk lamp (tap target) */}
          <g>
            <rect x={452} y={280} width={14} height={14} fill={lit ? '#b7854e' : '#2b2a4a'} style={RW_FILL_TR} />
            <rect x={586} y={280} width={14} height={14} fill={lit ? '#b7854e' : '#2b2a4a'} style={RW_FILL_TR} />
            <rect x={438} y={196} width={176} height={86} rx={10} fill={lit ? '#d99e63' : '#3b3757'} stroke={lit ? '#b7854e' : '#2b2a4a'} strokeWidth={3} style={RW_FILL_TR} />
            <line x1={450} y1={224} x2={602} y2={224} stroke={lit ? '#b7854e' : '#2b2a4a'} strokeWidth={3} />
            <line x1={450} y1={252} x2={602} y2={252} stroke={lit ? '#b7854e' : '#2b2a4a'} strokeWidth={3} />
            <circle cx={526} cy={210} r={4.5} fill={lit ? '#8a5a2e' : '#242244'} />
            <circle cx={526} cy={238} r={4.5} fill={lit ? '#8a5a2e' : '#242244'} />
            <circle cx={526} cy={266} r={4.5} fill={lit ? '#8a5a2e' : '#242244'} />
            <rect x={452} y={158} width={16} height={38} rx={3} fill={lit ? '#2dd4bf' : '#1f4d4a'} style={RW_FILL_TR} />
            <rect x={470} y={164} width={16} height={32} rx={3} fill={lit ? '#fb7185' : '#5d3242'} style={RW_FILL_TR} />
            <rect x={488} y={168} width={16} height={28} rx={3} fill={lit ? '#fbbf24' : '#5d5326'} style={RW_FILL_TR} />
            {/* the desk lamp */}
            <ellipse cx={560} cy={186} rx={17} ry={5.5} fill="#475569" />
            <line x1={560} y1={182} x2={560} y2={148} stroke="#475569" strokeWidth={5} strokeLinecap="round" />
            <path d="M 536 148 Q 560 114 584 148 Z" fill={lampOn ? '#fbbf24' : '#94a3b8'} stroke={lampOn ? '#b45309' : '#64748b'} strokeWidth={2.5} style={RW_FILL_TR} />
            <circle cx={560} cy={150} r={6.5} fill={lampOn ? '#fef9c3' : '#64748b'} style={RW_FILL_TR} />
          </g>

          {/* the chick plush — sleeps until the lamp is on */}
          <g>
            <ellipse cx={210} cy={288} rx={12} ry={19} fill={lit ? '#fde047' : '#6d6420'} transform="rotate(-18 210 288)" style={RW_FILL_TR} />
            <ellipse cx={290} cy={288} rx={12} ry={19} fill={lit ? '#fde047' : '#6d6420'} transform="rotate(18 290 288)" style={RW_FILL_TR} />
            <ellipse cx={250} cy={282} rx={42} ry={37} fill={lit ? '#fde047' : '#6d6420'} stroke={lit ? '#eab308' : '#4d4718'} strokeWidth={2.5} style={RW_FILL_TR} />
            <ellipse cx={250} cy={298} rx={22} ry={15} fill={lit ? '#fef9c3' : '#565023'} style={RW_FILL_TR} />
            <path d="M 243 247 Q 246 238 250 246" fill="none" stroke={lit ? '#eab308' : '#4d4718'} strokeWidth={2.5} strokeLinecap="round" />
            <path d="M 251 245 Q 255 237 258 246" fill="none" stroke={lit ? '#eab308' : '#4d4718'} strokeWidth={2.5} strokeLinecap="round" />
            <polygon points="243,276 257,276 250,288" fill="#f97316" />
            <circle cx={224} cy={276} r={5} fill="#fda4af" opacity={0.85} />
            <circle cx={276} cy={276} r={5} fill="#fda4af" opacity={0.85} />
            {lit ? <RwAwakeEyes x={250} y={263} /> : <RwSleepEyes x={250} y={264} c="#f2ecc2" />}
            <line x1={240} y1={318} x2={240} y2={326} stroke="#f97316" strokeWidth={3.5} strokeLinecap="round" />
            <line x1={260} y1={318} x2={260} y2={326} stroke="#f97316" strokeWidth={3.5} strokeLinecap="round" />
          </g>

          {/* the little robot — sleeps until the lamp is on */}
          <g>
            <line x1={372} y1={216} x2={372} y2={200} stroke={lit ? '#94a3b8' : '#3f4869'} strokeWidth={3.5} style={RW_FILL_TR} />
            {lit ? (
              <circle cx={372} cy={196} r={5.5} fill="#22d3ee">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.4s" repeatCount="indefinite" />
              </circle>
            ) : (
              <circle cx={372} cy={196} r={5.5} fill="#475569" />
            )}
            <line x1={348} y1={270} x2={333} y2={286} stroke={lit ? '#94a3b8' : '#3f4869'} strokeWidth={6} strokeLinecap="round" style={RW_FILL_TR} />
            <line x1={396} y1={270} x2={411} y2={286} stroke={lit ? '#94a3b8' : '#3f4869'} strokeWidth={6} strokeLinecap="round" style={RW_FILL_TR} />
            <line x1={358} y1={300} x2={358} y2={322} stroke={lit ? '#94a3b8' : '#3f4869'} strokeWidth={7} strokeLinecap="round" style={RW_FILL_TR} />
            <line x1={386} y1={300} x2={386} y2={322} stroke={lit ? '#94a3b8' : '#3f4869'} strokeWidth={7} strokeLinecap="round" style={RW_FILL_TR} />
            <rect x={348} y={258} width={48} height={44} rx={9} fill={lit ? '#e8edf5' : '#3f4869'} stroke={lit ? '#cbd5e1' : '#2b3352'} strokeWidth={2.5} style={RW_FILL_TR} />
            <rect x={356} y={266} width={32} height={20} rx={5} fill={lit ? '#67e8f9' : '#16203c'} stroke={lit ? '#22d3ee' : '#0f1a38'} strokeWidth={2} style={RW_FILL_TR} />
            {lit ? (
              <polygon points="375,269 366,278 371,278 369,284 378,275 373,275" fill="#0c4a6e" />
            ) : (
              <text x={372} y={281} textAnchor="middle" fontSize={11} fontWeight={800} fill="#5b6b8c">z z</text>
            )}
            <rect x={352} y={216} width={40} height={36} rx={10} fill={lit ? '#f4f7fb' : '#485377'} stroke={lit ? '#cbd5e1' : '#2b3352'} strokeWidth={2.5} style={RW_FILL_TR} />
            {lit ? (
              <g>
                <RwAwakeEyes x={372} y={231} />
                <path d="M 364 241 Q 372 247 380 241" fill="none" stroke="#334155" strokeWidth={2.4} strokeLinecap="round" />
              </g>
            ) : (
              <RwSleepEyes x={372} y={232} c="#aab6d4" />
            )}
          </g>

          {/* the retro TV — has its own switch */}
          <g>
            <line x1={104} y1={226} x2={86} y2={198} stroke={lit ? '#64748b' : '#39406a'} strokeWidth={3} strokeLinecap="round" style={RW_FILL_TR} />
            <line x1={144} y1={226} x2={164} y2={200} stroke={lit ? '#64748b' : '#39406a'} strokeWidth={3} strokeLinecap="round" style={RW_FILL_TR} />
            <circle cx={86} cy={196} r={3.5} fill={lit ? '#64748b' : '#39406a'} />
            <circle cx={164} cy={198} r={3.5} fill={lit ? '#64748b' : '#39406a'} />
            <rect x={78} y={334} width={10} height={10} fill={lit ? '#b98a4a' : '#2c2a48'} style={RW_FILL_TR} />
            <rect x={158} y={334} width={10} height={10} fill={lit ? '#b98a4a' : '#2c2a48'} style={RW_FILL_TR} />
            <rect x={56} y={224} width={132} height={110} rx={16} fill={lit ? '#f3c66e' : '#3a3557'} stroke={lit ? '#d9a856' : '#2c2a48'} strokeWidth={3} style={RW_FILL_TR} />
            <rect x={68} y={238} width={84} height={74} rx={10} fill={tvOn ? '#a5ecff' : '#1c2740'} stroke={tvOn ? '#38bdf8' : '#101830'} strokeWidth={2.5} style={RW_FILL_TR} />
            {tvOn ? (
              <RwTvFace />
            ) : (
              <g>
                <RwSleepEyes x={110} y={266} c="#8ea0c0" />
                <line x1={104} y1={284} x2={116} y2={284} stroke="#8ea0c0" strokeWidth={2.4} strokeLinecap="round" />
              </g>
            )}
            <circle cx={170} cy={254} r={6.5} fill={lit ? '#b98a4a' : '#2c2a48'} stroke={lit ? '#8a5a2e' : '#1e1c3c'} strokeWidth={2} style={RW_FILL_TR} />
            <circle cx={170} cy={278} r={6.5} fill={lit ? '#b98a4a' : '#2c2a48'} stroke={lit ? '#8a5a2e' : '#1e1c3c'} strokeWidth={2} style={RW_FILL_TR} />
            <line x1={162} y1={300} x2={180} y2={300} stroke={lit ? '#8a5a2e' : '#1e1c3c'} strokeWidth={3} strokeLinecap="round" />
            <line x1={162} y1={310} x2={180} y2={310} stroke={lit ? '#8a5a2e' : '#1e1c3c'} strokeWidth={3} strokeLinecap="round" />
          </g>

          {/* night dim over everything while the lamp is off */}
          {!lit && (
            <rect x={0} y={0} width={640} height={400} fill="#0a0f2c" opacity={0.48} pointerEvents="none" style={{ transition: 'opacity 0.7s ease' }} />
          )}

          {/* ——— things that must stay bright above the night dim ——— */}
          <g pointerEvents="none">
            {!lit && <RwSky />}
            {/* sleeping z-z-z markers */}
            {!lit && <RwZzz x={296} y={234} />}
            {!lit && <RwZzz x={402} y={188} d={2.6} />}
            {!tvOn && <RwZzz x={182} y={214} d={2.4} />}
            {/* a TV switched on in the dark room glows by itself */}
            {tvOn && !lit && (
              <g>
                <circle cx={110} cy={275} r={62} fill="#7dd3fc" opacity={0.25}>
                  <animate attributeName="r" values="56;68;56" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x={68} y={238} width={84} height={74} rx={10} fill="#a5ecff" />
                <RwTvFace />
              </g>
            )}
            {/* the lamp's warm glow + light cone */}
            {lit && (
              <g>
                <polygon points="538,150 582,150 640,400 130,400" fill="url(#rw-cone)" />
                <circle cx={560} cy={148} r={62} fill="#fde68a" opacity={0.4}>
                  <animate attributeName="r" values="58;72;58" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0.25;0.45" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x={205} y={112} fontSize={20} opacity={0.9}>
                  ✨
                  <animate attributeName="opacity" values="0.2;1;0.2" dur="1.7s" repeatCount="indefinite" />
                </text>
                <text x={330} y={86} fontSize={16}>
                  ✨
                  <animate attributeName="opacity" values="1;0.2;1" dur="2.1s" repeatCount="indefinite" />
                </text>
                <text x={452} y={114} fontSize={18}>
                  ✨
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                </text>
              </g>
            )}
            {/* where to tap next */}
            {!lit && (
              <text x={498} y={100} fontSize={27}>
                👆
                <animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="1.4s" repeatCount="indefinite" />
              </text>
            )}
            {lit && !tvOn && (
              <text x={112} y={210} fontSize={27}>
                👆
                <animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="1.4s" repeatCount="indefinite" />
              </text>
            )}
          </g>

          {/* tap targets (on top, generous) */}
          <g role="button" aria-label={tx(L('the desk lamp', 'چراغِ روی میز'))} style={{ cursor: 'pointer' }} onClick={toggleLamp}>
            <circle cx={560} cy={148} r={58} fill="transparent" />
          </g>
          <g role="button" aria-label={tx(L('the TV', 'تلویزیون'))} style={{ cursor: 'pointer' }} onClick={toggleTv}>
            <rect x={46} y={186} width={152} height={158} fill="transparent" />
          </g>
        </svg>
      </div>

      {/* status banner */}
      <div
        className={`rounded-2xl border-2 p-3 text-center text-[15px] font-extrabold leading-relaxed transition-colors ${
          allOn
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : lit || tvOn
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-slate-300 bg-slate-100 text-slate-600'
        }`}
      >
        {tx(status)}
      </div>

      {(lampOn || tvOn) && (
        <Button variant="outline" className="h-11 w-full font-extrabold" onClick={sleepAll}>
          😴 {tx(ROOM_SLEEP_ALL)}
        </Button>
      )}
    </div>
  );
}

/* ---------------------------------------------------- page 2 · electron-race */

const RACE_HINT = L(
  'Put your finger on the wire and drag — let the electrons race!',
  'دستت رو روی سیم بکش تا الکترون‌ها مسابقه دو بدهند!',
);

/** one cute electron runner carrying its little glowing lantern */
function Runner({ i, n, dur }: { i: number; n: number; dur: number }) {
  return (
    <g>
      <animateMotion dur={`${dur}s`} begin={`${-(i / n) * dur}s`} repeatCount="indefinite" path="M 604 40 L 36 40" />
      {/* glowing lantern held above the head */}
      <g transform="translate(2 -20)">
        <circle r={9} fill="#fde047" opacity={0.3}>
          <animate attributeName="r" values="7;11;7" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <circle r={5.5} fill="#fde047" stroke="#f59e0b" strokeWidth={1.5} />
      </g>
      {/* the electron body */}
      <circle r={13} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
      <circle cx={-4} cy={-2.5} r={1.7} fill="#0c4a6e" />
      <circle cx={4} cy={-2.5} r={1.7} fill="#0c4a6e" />
      <path d="M -4 3 Q 0 6.5 4 3" stroke="#0c4a6e" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx={-7.5} cy={1.5} r={1.4} fill="#fda4af" opacity={0.8} />
      <circle cx={7.5} cy={1.5} r={1.4} fill="#fda4af" opacity={0.8} />
    </g>
  );
}

/** Press & drag the wire: the electrons dash (hold-to-run, keyboard friendly). */
export function ElectronRaceScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [racing, setRacing] = useState(false);

  const start = () => {
    setRacing((was) => {
      if (!was) sfx.whoosh();
      return true;
    });
  };
  const stop = () => setRacing(false);

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('Cute electrons running inside a wire with glowing lanterns', 'الکترون‌های بامزه با فانوس‌های نورانی داخل سیم می‌دوند'))}
      />
      {/* the wire — hold or drag anywhere on it */}
      <div
        role="button"
        tabIndex={0}
        aria-label={tx(RACE_HINT)}
        className={`relative touch-none select-none rounded-full border-2 bg-gradient-to-l from-sky-50 to-slate-100 transition-colors ${
          racing ? 'border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.45)]' : 'border-slate-300'
        }`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start();
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start();
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') stop();
        }}
      >
        <svg viewBox="0 0 640 80" className="block w-full">
          {/* transparent wire tube */}
          <rect x={10} y={18} width={620} height={44} rx={22} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={2.5} />
          <rect x={10} y={18} width={620} height={20} rx={10} fill="#f1f5f9" opacity={0.85} />
          {/* metal caps on both ends */}
          <rect x={2} y={24} width={14} height={32} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={624} y={24} width={14} height={32} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          {/* the runners: idle stroll → full sprint while held */}
          {Array.from({ length: 7 }).map((_, i) => (
            <Runner key={i} i={i} n={7} dur={racing ? 0.85 : 2.8} />
          ))}
        </svg>
      </div>
      <p className="text-center text-sm font-bold text-slate-500">👆 {tx(RACE_HINT)}</p>
    </div>
  );
}

/* --------------------------------------------------- page 3 · power-journey */

const JOURNEY_HINT = L(
  'Move your finger along the path to bring electricity home!',
  'انگشتت رو روی مسیر حرکت بده تا برق به خانه برسه!',
);
const JOURNEY_DONE = L('The electricity reached home! ⚡🏠', 'برق به خانه رسید! ⚡🏠');

const STATIONS = [
  { emoji: '🏭', label: L('Power plant', 'نیروگاه') },
  { emoji: '🗼', label: L('Tall pylons', 'دکل‌های بلند') },
  { emoji: '🚇', label: L('Underground wires', 'سیم زیرزمین') },
  { emoji: '🏠', label: L('Home', 'خانه') },
] as const;

/** Drag along the RTL journey strip: plant (right) → pylons → underground → home (left). */
export function PowerJourneyScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [progress, setProgress] = useState(0); // 0 = plant (right edge) → 1 = home (left edge)
  const dragging = useRef(false);
  const lit = useRef(0);
  const celebrated = useRef(false);

  const advance = (raw: number) => {
    const p = Math.min(1, Math.max(0, raw));
    setProgress(p);
    const litNow = Math.round(p * 3);
    if (litNow > lit.current) sfx.blip();
    lit.current = litNow;
    if (p >= 0.97 && !celebrated.current) {
      celebrated.current = true;
      sfx.fanfare();
    } else if (p < 0.9) {
      celebrated.current = false;
    }
  };

  const update = (clientX: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    advance((rect.right - clientX) / rect.width);
  };

  const done = progress >= 0.97;

  return (
    <div className="space-y-3">
      {/* illustration mirrored so its journey reads right-to-left, like the strip below */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        { }
        <img
          src={image}
          alt={tx(L('The journey of electricity: power plant, pylons, underground wires, home', 'سفر برق: نیروگاه، دکل‌ها، سیم‌های زیرزمین، خانه'))}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="cq-scene-flip block aspect-[7/4] w-full select-none object-cover"
        />
      </div>
      <p className="text-center text-sm font-bold text-slate-500">👉 {tx(JOURNEY_HINT)}</p>
      <div
        role="slider"
        tabIndex={0}
        aria-label={tx(JOURNEY_HINT)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="relative h-28 touch-none select-none rounded-2xl border-2 bg-white"
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e.clientX, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if (dragging.current) update(e.clientX, e.currentTarget);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            advance(progress + 1 / 12);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            advance(progress - 1 / 12);
          } else if (e.key === 'Home') {
            e.preventDefault();
            advance(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            advance(1);
          }
        }}
      >
        {/* dashed road */}
        <div className="absolute inset-x-10 top-[36%] border-t-2 border-dashed border-slate-300" />
        {/* stations, right → left */}
        {STATIONS.map((st, i) => {
          const at = i / 3;
          const on = progress >= at - 0.02;
          return (
            <div key={st.label.en} className="absolute top-2.5 w-14 text-center" style={{ right: `${at * 100}%`, transform: 'translateX(50%)' }}>
              <span
                className={`inline-block rounded-full px-1 text-3xl transition-all duration-300 ${
                  on ? 'scale-110 bg-teal-50' : 'opacity-45 grayscale'
                } ${on && i === 3 ? 'cq-path-pulse' : ''}`}
              >
                {st.emoji}
              </span>
              <span className="mt-0.5 block whitespace-nowrap text-[11px] font-bold text-slate-500">{tx(st.label)}</span>
            </div>
          );
        })}
        {/* the traveling bolt */}
        <span
          className="absolute top-[30%] text-2xl transition-[right] duration-150 ease-linear"
          style={{ right: `${progress * 100}%`, transform: 'translateX(50%)' }}
          aria-hidden
        >
          ⚡
        </span>
        {done && (
          <p className="cq-pop absolute inset-x-0 bottom-1.5 text-center text-sm font-extrabold text-teal-700">
            {tx(JOURNEY_DONE)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------- page 4 · safe-danger */

const SAFE_TITLE = L('Battery power', 'برق باتری');
const SAFE_SUB = L('tame and gentle 🐱', 'رام‌شده و آروم 🐱');
const SAFE_DESC = L(
  'Weak, harmless and kind — like a cute kitten. All our experiments use this!',
  'کم‌قدرت، بی‌خطر و مهربونه؛ مثل یه بچه‌گربه ملوس. همهٔ آزمایش‌هامون با همینه!',
);
const SAFE_BADGE = L('Safe ✅', 'امنه ✅');

const DANGER_TITLE = L('Wall-socket power', 'برق پریز دیوار');
const DANGER_SUB = L('very strong 🦁', 'خیلی قوی 🦁');
const DANGER_DESC = L(
  'Like a big, mighty lion! Grown-ups only — never touch it!',
  'مثل یه شیر بزرگ و پرقدرته! فقط مخصوص بزرگ‌ترهاست — هرگز دست نزن!',
);
const DANGER_BADGE = L('Dangerous ⚠️', 'خطرناکه ⚠️');

/** Two tappable cards: the kind battery kitten vs. the mighty wall-socket lion. */
export function SafeDangerScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [picked, setPicked] = useState<'safe' | 'danger' | null>(null);

  const pick = (side: 'safe' | 'danger') => {
    setPicked(side);
    if (side === 'safe') sfx.sparkle();
    else sfx.click();
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A safe kitten next to a battery and a mighty lion next to a wall socket', 'بچه‌گربه امن کنار باتری و شیر پرقدرت کنار پریز دیوار'))}
      />
      <div className="grid grid-cols-2 gap-3">
        {/* RTL: this first card lands on the right — the safe side */}
        <button
          onClick={() => pick('safe')}
          className={`rounded-2xl border-2 p-3 text-center transition-all ${
            picked === 'safe' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30' : 'border-slate-200 bg-white'
          }`}
        >
          <span className="text-3xl">🔋</span>
          <p className="mt-1 font-extrabold">{tx(SAFE_TITLE)}</p>
          <p className="text-xs font-bold text-slate-500">{tx(SAFE_SUB)}</p>
          {picked === 'safe' && <p className="mt-1.5 text-xs font-semibold leading-relaxed text-emerald-700">{tx(SAFE_DESC)}</p>}
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
              picked === 'safe' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {tx(SAFE_BADGE)}
          </span>
        </button>
        <button
          onClick={() => pick('danger')}
          className={`rounded-2xl border-2 p-3 text-center transition-all ${
            picked === 'danger' ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/30' : 'border-slate-200 bg-white'
          }`}
        >
          <span className="text-3xl">🔌</span>
          <p className="mt-1 font-extrabold">{tx(DANGER_TITLE)}</p>
          <p className="text-xs font-bold text-slate-500">{tx(DANGER_SUB)}</p>
          {picked === 'danger' && <p className="mt-1.5 text-xs font-semibold leading-relaxed text-rose-700">{tx(DANGER_DESC)}</p>}
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
              picked === 'danger' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {tx(DANGER_BADGE)}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------- reward · celebration */

const CONFETTI_COLORS = ['#f59e0b', '#10b981', '#38bdf8', '#ef4444', '#a855f7', '#f97316'];

/** Trophy picture with falling confetti — the medal moment of the lesson. */
export function CelebrationScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-white">
      { }
      <img
        src={image}
        alt={tx(L('The robot celebrates with a golden trophy and confetti', 'ربات با جام طلایی و کاغذرنگی جشن می‌گیرد'))}
        draggable={false}
        decoding="async"
        className="block aspect-[7/4] w-full select-none object-cover"
      />
      {motion && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="cq-fall absolute top-0 h-2.5 w-2.5 rounded-[3px]"
              style={{
                right: `${(i * 5.7 + 4) % 96}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${(i % 6) * 0.45}s`,
                animationDuration: `${2.4 + (i % 4) * 0.55}s`,
              }}
            />
          ))}
          <span className="cq-float absolute right-8 top-3 text-2xl">⭐</span>
          <span className="cq-float absolute left-10 top-8 text-xl" style={{ animationDelay: '0.9s' }}>✨</span>
        </div>
      )}
    </div>
  );
}

/* ================================================ l0-3 · safety-rule pages ================================================ */

/* -------------------------------------------------- page 1 · shield-unlock */

const SHIELD_HINT = L(
  '4 locks hang around the golden medal — open each one to discover a golden rule!',
  '۴ قفل دور مدال طلاییه — با باز کردن هر قفل، یک قانون طلایی آشکار میشه!',
);
const SHIELD_START = L('Tap to open the first rule\u2019s lock!', 'بزن تا قفل قانون اول باز بشه!');
const SHIELD_NEXT = L('A rule was discovered! Tap for the next lock 🔓', 'یک قانون آشکار شد! بزن تا قفل بعدی هم باز بشه 🔓');
const SHIELD_DONE = L('All 4 locks are open — now let\u2019s practice each rule together! 🎉', 'همهٔ ۴ قفل باز شد! حالا بریم هر قانون رو با هم تمرین کنیم! 🎉');
const SHIELD_LOCKED_ROW = L('Still locked… tap the shield to discover it!', 'هنوز قفله… روی سپر بزن تا آشکار بشه!');

/**
 * The 4 golden rules — the actual CONTENT behind each lock (in RTL reading
 * order, matching SHIELD_LOCKS). Each tap opens one lock AND reveals its rule
 * as a real sentence, so the interaction shows content, not just a picture.
 * They mirror what pages 2–4 of this lesson teach:
 *   1. batteries only, never the wall socket        (page 2)
 *   2. never short-circuit — a lamp sits in between  (page 3)
 *   3. tidy desk + dry hands                         (page 4)
 *   4. nothing near the mouth                        (page 4)
 */
const SHIELD_RULES = [
  {
    emoji: '🔌',
    label: L('Rule 1', 'قانون ۱'),
    text: L('I only work with batteries — never the wall socket!', 'فقط با باتری کار می‌کنم؛ هرگز پریز دیوار!'),
  },
  {
    emoji: '⚡',
    label: L('Rule 2', 'قانون ۲'),
    text: L('I never join the two battery ends — a lamp always sits in the middle!', 'هرگز دو سر باتری رو به هم وصل نمی‌کنم؛ همیشه لامپ وسط مسیره!'),
  },
  {
    emoji: '💧',
    label: L('Rule 3', 'قانون ۳'),
    text: L('My desk is tidy and my hands are dry!', 'میزم مرتبه و دست‌هام خشکه!'),
  },
  {
    emoji: '👄',
    label: L('Rule 4', 'قانون ۴'),
    text: L('I never take tiny parts or wires near my mouth!', 'قطعه‌های ریز و سیم‌ها رو نزدیک دهانم نمی‌برم!'),
  },
] as const;

/** the 4 locks around the shield, opened right-to-left (RTL reading order) */
const SHIELD_LOCKS = [
  { x: 548, y: 44 },
  { x: 92, y: 44 },
  { x: 548, y: 106 },
  { x: 92, y: 106 },
] as const;

function Padlock({ x, y, open }: { x: number; y: number; open: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* shackle — springs open when unlocked */}
      <g
        style={{
          transform: open ? 'rotate(38deg) translateY(-3px)' : 'none',
          transformBox: 'fill-box',
          transformOrigin: '78% 100%',
          transition: 'transform .5s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <path
          d="M -11 -4 V -15 A 11 11 0 0 1 11 -15 V -4"
          fill="none"
          stroke={open ? '#059669' : '#64748b'}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </g>
      <rect x={-15} y={-5} width={30} height={27} rx={7} fill={open ? '#fbbf24' : '#cbd5e1'} stroke={open ? '#b45309' : '#94a3b8'} strokeWidth={2.5} />
      <circle cx={0} cy={5} r={3.4} fill={open ? '#92400e' : '#64748b'} />
      <rect x={-1.6} y={7} width={3.2} height={7} rx={1.6} fill={open ? '#92400e' : '#64748b'} />
      {open && (
        <g className="cq-pop">
          <circle cx={15} cy={-14} r={9} fill="#10b981" stroke="#fff" strokeWidth={2} />
          <path d="M 10.5 -14 L 13.7 -10.8 L 19.5 -17" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
}

/**
 * Tap the shield → each of the 4 locks opens AND reveals its golden rule as a
 * real sentence card below, so every click shows content — not just an open
 * padlock. After the 4th tap the medal glows and all 4 rules stay readable.
 */
export function ShieldUnlockScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [open, setOpen] = useState(0);
  const [pop, setPop] = useState(-1); // index of the rule card that just popped in

  const unlock = () => {
    setOpen((n) => {
      if (n >= 4) return n;
      sfx.open();
      if (n === 3) {
        window.setTimeout(() => sfx.sparkle(), 320);
        window.setTimeout(() => sfx.fanfare(), 640);
      }
      return n + 1;
    });
  };

  // flag the newest rule card so it plays the pop-in animation exactly once
  useEffect(() => {
    if (open > 0 && open <= SHIELD_RULES.length) {
      const r = requestAnimationFrame(() => setPop(open - 1));
      const t = window.setTimeout(() => setPop(-1), 950);
      return () => {
        cancelAnimationFrame(r);
        window.clearTimeout(t);
      };
    }
  }, [open]);

  const done = open >= SHIELD_RULES.length;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A shiny golden safety shield with a glowing lightbulb', 'سپر طلایی درخشان ایمنی با یک لامپ نورانی'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🔒 {tx(SHIELD_HINT)}</p>
      <div
        role="button"
        tabIndex={0}
        aria-label={tx(done ? SHIELD_DONE : SHIELD_START)}
        onClick={unlock}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            unlock();
          }
        }}
        className={`cursor-pointer select-none rounded-2xl border-2 bg-gradient-to-l from-amber-50 to-yellow-50 transition-shadow ${
          done ? 'border-emerald-300' : 'border-amber-200 hover:shadow-[0_0_18px_rgba(245,158,11,0.35)]'
        }`}
      >
        <svg viewBox="0 0 640 150" className="block w-full" role="group" aria-label={tx(L('The golden medal and its 4 rule locks', 'مدال طلایی و ۴ قفل قانون‌ها'))}>
          {/* small golden shield in the middle */}
          <defs>
            <linearGradient id="cq-gold-shield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde68a" />
              <stop offset="1" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <g transform="translate(320 76)">
            {done && (
              <circle r={46} fill="#fde047" opacity={0.35}>
                <animate attributeName="r" values="40;52;40" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <path
              d="M 0 -40 L 30 -28 V 0 Q 30 26 0 42 Q -30 26 -30 0 V -28 Z"
              fill="url(#cq-gold-shield)"
              stroke="#b45309"
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <text x={0} y={9} fontSize={26} textAnchor="middle">💡</text>
          </g>
          {/* connection dashes from the shield to each lock */}
          {SHIELD_LOCKS.map((lk, i) => (
            <line
              key={i}
              x1={320 + (lk.x > 320 ? 34 : -34)}
              y1={76}
              x2={lk.x + (lk.x > 320 ? -22 : 22)}
              y2={lk.y}
              stroke={i < open ? '#10b981' : '#e2c27d'}
              strokeWidth={2.5}
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          ))}
          {SHIELD_LOCKS.map((lk, i) => (
            <g key={i}>
              <Padlock x={lk.x} y={lk.y} open={i < open} />
              {/* the rule's own emoji pops under each opened lock — lock = rule */}
              {i < open && (
                <text x={lk.x} y={lk.y + 40} fontSize={20} textAnchor="middle" className={i === pop ? 'cq-pop' : undefined}>
                  {SHIELD_RULES[i].emoji}
                </text>
              )}
            </g>
          ))}
          {done && motion && (
            <>
              <text x={215} y={40} fontSize={24} className="cq-float">✨</text>
              <text x={415} y={118} fontSize={22} className="cq-float" style={{ animationDelay: '0.6s' }}>⭐</text>
            </>
          )}
        </svg>
      </div>
      {/* ---- the revealed golden rules: real content behind every lock ---- */}
      <div className="space-y-1.5" role="list" aria-label={tx(L('The 4 golden safety rules', '۴ قانون طلایی ایمنی'))}>
        {SHIELD_RULES.map((rule, i) => {
          const unlocked = i < open;
          return (
            <div
              key={i}
              role="listitem"
              className={`flex items-center gap-2.5 rounded-2xl border-2 px-3 py-2 text-[13px] font-extrabold transition-colors ${
                unlocked
                  ? i === pop
                    ? 'cq-pop border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
                    : 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                  : 'border-dashed border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <span className="text-lg" aria-hidden>
                {unlocked ? rule.emoji : '🔒'}
              </span>
              <span className="flex-1">{unlocked ? tx(rule.text) : `${tx(rule.label)}: ${tx(SHIELD_LOCKED_ROW)}`}</span>
              {unlocked && (
                <span className="text-base text-emerald-500" aria-hidden>
                  ✅
                </span>
              )}
            </div>
          );
        })}
      </div>
      <Button
        onClick={unlock}
        disabled={done}
        className={`h-12 w-full font-extrabold ${done ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}
      >
        {done ? `🏅 ${tx(SHIELD_DONE)}` : `🛡️ ${tx(open === 0 ? SHIELD_START : SHIELD_NEXT)}`}
      </Button>
    </div>
  );
}

/* ------------------------------------------------- page 2 · battery-socket */

const SOCKET_MSG = L('⛔ No, no! This giant is only for grown-ups!', '⛔ نه نه! این غول فقط مال بزرگ‌ترهاست!');
const BATTERY_MSG = L('✅ The battery is our 100% safe friend!', '✅ باتری دوستِ ۱۰۰٪ امن ماست!');

/** Tap the smiling battery → green check of approval; tap the socket → it growls. */
export function BatterySocketScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [msg, setMsg] = useState<'bat' | 'soc' | null>(null);
  const [socShakes, setSocShakes] = useState(0);

  const tapBattery = () => {
    setMsg('bat');
    sfx.sparkle();
  };
  const tapSocket = () => {
    setMsg('soc');
    setSocShakes((n) => n + 1);
    sfx.click();
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A smiling battery superhero next to a forbidden wall socket', 'باتری ابرقهرمان خندان کنار پریز دیوار ممنوع'))}
      />
      <svg
        viewBox="0 0 640 220"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-white"
        role="group"
        aria-label={tx(L('Tap the battery or the socket', 'روی باتری یا پریز بزن'))}
      >
        {/* ---- wall socket (left / danger) ---- */}
        <g onClick={tapSocket} style={{ cursor: 'pointer' }}>
          <g key={socShakes}>
            {socShakes > 0 && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -7 0; 7 0; -5 0; 5 0; 0 0"
                dur="0.45s"
                repeatCount="1"
              />
            )}
            <rect x={105} y={45} width={110} height={140} rx={16} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={3} />
            <circle cx={160} cy={90} r={20} fill="#fff" stroke="#cbd5e1" strokeWidth={2.5} />
            <rect x={152} y={80} width={6} height={13} rx={3} fill="#475569" />
            <rect x={162} y={80} width={6} height={13} rx={3} fill="#475569" />
            <circle cx={160} cy={140} r={20} fill="#fff" stroke="#cbd5e1" strokeWidth={2.5} />
            <rect x={152} y={130} width={6} height={13} rx={3} fill="#475569" />
            <rect x={162} y={130} width={6} height={13} rx={3} fill="#475569" />
            {/* red prohibition sign hovering over the socket */}
            <circle cx={160} cy={52} r={34} fill="none" stroke="#ef4444" strokeWidth={8} />
            <line x1={136} y1={76} x2={184} y2={28} stroke="#ef4444" strokeWidth={8} strokeLinecap="round" />
            {socShakes > 0 && <text x={218} y={40} fontSize={30}>💢</text>}
          </g>
          <rect x={100} y={40} width={120} height={150} rx={18} fill="transparent" />
        </g>

        {/* ---- smiling battery (right / safe) ---- */}
        <g transform="translate(480 112)" onClick={tapBattery} style={{ cursor: 'pointer' }}>
          {/* green safe halo */}
          <circle r={64} fill="#10b981" opacity={0.13} />
          {msg === 'bat' && (
            <circle r={64} fill="none" stroke="#10b981" strokeWidth={3} opacity={0.55}>
              <animate attributeName="r" values="58;74;58" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          <rect x={-40} y={-54} width={80} height={108} rx={12} fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
          <rect x={-40} y={22} width={80} height={32} rx={12} fill="#d97706" opacity={0.65} />
          <rect x={-16} y={-62} width={32} height={10} rx={4} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <text x={-24} y={-32} fontSize={20} fontWeight={800} fill="#7c2d12">+</text>
          <text x={18} y={52} fontSize={20} fontWeight={800} fill="#7c2d12">−</text>
          {/* face */}
          <circle cx={-13} cy={-12} r={4.2} fill="#78350f" />
          <circle cx={13} cy={-12} r={4.2} fill="#78350f" />
          <path d="M -12 4 Q 0 15 12 4" fill="none" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
          <circle cx={-22} cy={0} r={4.5} fill="#fda4af" opacity={0.75} />
          <circle cx={22} cy={0} r={4.5} fill="#fda4af" opacity={0.75} />
          {/* the big green check of approval */}
          {msg === 'bat' && (
            <g className="cq-pop">
              <circle cx={46} cy={-52} r={20} fill="#10b981" stroke="#fff" strokeWidth={3.5} />
              <path d="M 37 -52 L 43.5 -45.5 L 55 -58" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>

        {motion && msg === 'bat' && (
          <>
            <text x={395} y={42} fontSize={22} className="cq-float">✨</text>
            <text x={565} y={60} fontSize={19} className="cq-float" style={{ animationDelay: '0.5s' }}>💚</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${msg === 'soc' ? 'text-rose-600' : msg === 'bat' ? 'text-emerald-600' : 'text-slate-400'}`}>
        {msg === 'soc' ? tx(SOCKET_MSG) : msg === 'bat' ? tx(BATTERY_MSG) : `👆 ${tx(L('Tap the battery, then peek at the socket!', 'روی باتری بزن، بعد یه سر به پریز بزن!'))}`}
      </p>
    </div>
  );
}

/* ------------------------------------------------- page 3 · short-circuit */

const SHORT_FIX = L('Put the lamp in the middle of the wire to cool the battery down!', 'لامپ رو بگذار وسط سیم تا باتری خنک بشه!');
const SHORT_UNDO = L('Empty the wire again to see what happens! 🔥', 'دوباره سیم رو خالی کن تا ببینی چی میشه! 🔥');
const SHORT_BAD = L('Short circuit! The electrons dash around with no purpose and the battery gets hot 🥵', 'اتصال کوتاه! الکترون‌ها بی‌هدف میدوند و باتری داغ میشه 🥵');
const SHORT_GOOD = L('Yay! The lamp uses the electrons\u2019 energy — everyone is cool and happy ✨', 'آفرین! لامپ انرژی الکترون‌ها رو استفاده می‌کنه — همه خنک و خوشحالن ✨');

/** electron loop path: + (top right) around to − (bottom right) */
const SHORT_LOOP = 'M 552 64 H 150 A 20 20 0 0 0 130 84 V 156 A 20 20 0 0 0 150 176 H 552';

function ShortLamp({ x, y, glowing, floating }: { x: number; y: number; glowing: boolean; floating?: boolean }) {
  const motion = useSettings((s) => s.motion);
  return (
    <g transform={`translate(${x} ${y})`} className={floating && motion ? 'cq-float' : undefined}>
      {glowing && (
        <circle r={34} fill="#fde047" opacity={0.4}>
          <animate attributeName="r" values="28;40;28" dur="1.3s" repeatCount="indefinite" />
        </circle>
      )}
      {glowing &&
        [0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={0}
            y1={0}
            x2={Math.cos((a * Math.PI) / 180) * 42}
            y2={Math.sin((a * Math.PI) / 180) * 42}
            stroke="#f59e0b"
            strokeWidth={3.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      <circle r={19} fill={glowing ? '#fef9c3' : '#f1f5f9'} stroke={glowing ? '#eab308' : '#94a3b8'} strokeWidth={3} />
      <rect x={-9} y={16} width={18} height={13} rx={3.5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
      {glowing && <text x={0} y={6} fontSize={15} textAnchor="middle">😊</text>}
    </g>
  );
}

/** The short-circuit lab: an empty wire makes the battery hot & sweaty — drop the lamp in! */
export function ShortCircuitScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [fixed, setFixed] = useState(false); // false = short circuit (bare wire)

  const toggle = () => {
    setFixed((was) => {
      if (!was) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 420);
      } else {
        sfx.whoosh();
      }
      return !was;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A hot sweaty battery next to a cool battery powering a glowing bulb', 'باتری داغ و عرق‌کرده کنار باتری خنک و خندان با لامپ روشن'))}
      />
      <svg viewBox="0 0 640 240" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-white" role="group" aria-label={tx(fixed ? SHORT_GOOD : SHORT_BAD)}>
        {/* the loop wire */}
        {fixed ? (
          <>
            <path d="M 552 64 H 350" fill="none" stroke="#94a3b8" strokeWidth={5.5} strokeLinecap="round" />
            <path d="M 290 64 H 150 A 20 20 0 0 0 130 84 V 156 A 20 20 0 0 0 150 176 H 552" fill="none" stroke="#94a3b8" strokeWidth={5.5} strokeLinecap="round" />
          </>
        ) : (
          <path d={SHORT_LOOP} fill="none" stroke="#ef4444" strokeWidth={5.5} strokeLinecap="round" />
        )}

        {/* electrons: wild & red when shorted, calm & blue when fixed */}
        {Array.from({ length: fixed ? 5 : 7 }).map((_, i) => {
          const n = fixed ? 5 : 7;
          return (
            <circle key={`${fixed}-${i}`} r={fixed ? 8 : 6.5} fill={fixed ? '#38bdf8' : '#f87171'} stroke={fixed ? '#0369a1' : '#b91c1c'} strokeWidth={1.6}>
              {motion && (
                <animateMotion dur={`${fixed ? 5.5 : 0.7}s`} begin={`${-(i / n) * (fixed ? 5.5 : 0.7)}s`} repeatCount="indefinite" path={SHORT_LOOP} />
              )}
            </circle>
          );
        })}

        {/* the battery (right, vertical, + top / − bottom) */}
        <g transform="translate(560 120)">
          {!fixed && (
            <>
              <path d="M -26 -66 q 5 -9 0 -18 q -5 -9 0 -16" fill="none" stroke="#f87171" strokeWidth={3.5} strokeLinecap="round">
                <animate attributeName="opacity" values="0.25;0.95;0.25" dur="1.1s" repeatCount="indefinite" />
              </path>
              <path d="M 8 -68 q 5 -9 0 -18 q -5 -9 0 -14" fill="none" stroke="#f87171" strokeWidth={3.5} strokeLinecap="round">
                <animate attributeName="opacity" values="0.9;0.25;0.9" dur="1.2s" repeatCount="indefinite" />
              </path>
              <text x={28} y={-58} fontSize={26}>🔥</text>
            </>
          )}
          <rect x={-34} y={-56} width={68} height={112} rx={12} fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
          {!fixed && <rect x={-34} y={-56} width={68} height={112} rx={12} fill="#ef4444" opacity={0.3} />}
          <rect x={-14} y={-66} width={28} height={10} rx={4} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <text x={-28} y={-36} fontSize={18} fontWeight={800} fill="#7c2d12">+</text>
          <text x={16} y={50} fontSize={18} fontWeight={800} fill="#7c2d12">−</text>
          {/* face: worried+swetty vs happy */}
          <circle cx={-12} cy={-14} r={4.2} fill="#78350f" />
          <circle cx={12} cy={-14} r={4.2} fill="#78350f" />
          {fixed ? (
            <path d="M -11 2 Q 0 13 11 2" fill="none" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
          ) : (
            <path d="M -11 10 Q 0 1 11 10" fill="none" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
          )}
          {!fixed && (
            <>
              <circle cx={-24} cy={-2} r={4} fill="#7dd3fc" />
              <circle cx={25} cy={4} r={3.2} fill="#7dd3fc" />
              <circle cx={20} cy={-26} r={2.6} fill="#7dd3fc" />
            </>
          )}
          <circle cx={-22} cy={-4} r={4.5} fill="#fda4af" opacity={fixed ? 0.75 : 0.5} />
          <circle cx={22} cy={-4} r={4.5} fill="#fda4af" opacity={fixed ? 0.75 : 0.5} />
        </g>

        {/* the lamp: always mounted — hovers above the gap, drops into it when fixed.
            The lamp ITSELF is tappable (the picture invites tapping it): tapping the
            floating lamp — or its dashed target — drops it into the circuit, exactly
            like the bottom button. Tapping the seated lamp lifts it out again. */}
        {!fixed && (
          <g onClick={toggle} style={{ cursor: 'pointer' }} role="button" aria-label={tx(SHORT_FIX)}>
            <circle cx={320} cy={64} r={30} fill="#fffbeb" opacity={0.9} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 6" />
            <text x={358} y={44} fontSize={20}>👇</text>
          </g>
        )}
        <g
          onClick={toggle}
          role="button"
          aria-label={tx(fixed ? SHORT_UNDO : SHORT_FIX)}
          style={{
            cursor: 'pointer',
            transform: fixed ? 'translate(320px, 64px)' : 'translate(320px, 18px)',
            transition: 'transform .65s cubic-bezier(.34,1.3,.64,1)',
          }}
        >
          {/* invisible hit-area so the little lamp is easy to tap */}
          <circle r={40} fill="transparent" />
          <ShortLamp x={0} y={0} glowing={fixed} floating={!fixed} />
        </g>
        {/* landing sparkle the moment the lamp seats into the wire */}
        {fixed && (
          <text x={372} y={44} fontSize={22} className="cq-pop" aria-hidden>
            ✨
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${fixed ? 'text-teal-700' : 'text-rose-600'}`}>
        {fixed ? tx(SHORT_GOOD) : tx(SHORT_BAD)}
      </p>
      <Button
        onClick={toggle}
        className={`h-12 w-full font-extrabold ${fixed ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
      >
        {fixed ? `🔥 ${tx(SHORT_UNDO)}` : `💡 ${tx(SHORT_FIX)}`}
      </Button>
    </div>
  );
}

/* ----------------------------------------------------- page 4 · tidy-desk */

const DESK_START = L('Tap the extra things to take them off the desk! 👆', 'وسایل اضافی رو لمس کن تا از روی میز برداشته بشن! 👆');
const DESK_DONE = L('The engineer\u2019s desk is ready — clean, dry and tidy! ✨', 'میز مهندسی آماده شد — تمیز، خشک و مرتب! ✨');

type ClutterId = 'cup' | 'cookie' | 'teddy';
const CLUTTER: { id: ClutterId; emoji: string; x: number; y: number; label: LocaleText }[] = [
  { id: 'cup', emoji: '🥤', x: 168, y: 106, label: L('Put the drink away', 'لیوان رو بردار') },
  { id: 'cookie', emoji: '🍪', x: 300, y: 108, label: L('Put the snack away', 'خوراکی رو بردار') },
  { id: 'teddy', emoji: '🧸', x: 232, y: 58, label: L('Put the toy away', 'عروسک رو بردار') },
];

/** Tap the clutter off the desk until only the engineer's tools remain. */
export function TidyDeskScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [gone, setGone] = useState<Record<ClutterId, boolean>>({ cup: false, cookie: false, teddy: false });

  const done = Object.values(gone).every(Boolean);
  const celebrated = useRef(false);

  useEffect(() => {
    if (done && !celebrated.current) {
      celebrated.current = true;
      sfx.fanfare();
      window.setTimeout(() => sfx.sparkle(), 420);
    } else if (!done) {
      celebrated.current = false;
    }
  }, [done]);

  const remove = (id: ClutterId) => {
    if (gone[id]) return;
    sfx.pop();
    setGone((g) => ({ ...g, [id]: true }));
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A tidy wooden workbench with components and a small dry towel', 'میز کار چوبی مرتب با قطعه‌های الکترونیکی و یک حولهٔ کوچک خشک'))}
      />
      <svg viewBox="0 0 640 220" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(done ? DESK_DONE : DESK_START)}>
        {/* sunny window */}
        <rect x={430} y={14} width={180} height={100} rx={10} fill="#e0f2fe" stroke="#bae6fd" strokeWidth={3} />
        <line x1={520} y1={14} x2={520} y2={114} stroke="#bae6fd" strokeWidth={3} />
        {/* the wooden desk */}
        <rect x={24} y={122} width={592} height={26} rx={9} fill="#d9a066" stroke="#b07b3e" strokeWidth={2.5} />
        <rect x={44} y={148} width={18} height={64} fill="#c08c52" />
        <rect x={578} y={148} width={18} height={64} fill="#c08c52" />
        <rect x={24} y={140} width={592} height={14} rx={7} fill="#c8925c" opacity={0.85} />

        {/* the small dry towel (left, folded) */}
        <rect x={64} y={104} width={92} height={20} rx={7} fill="#fef3c7" stroke="#d6b45e" strokeWidth={2.5} />
        <line x1={72} y1={111} x2={148} y2={111} stroke="#e7d8a8" strokeWidth={2} />

        {/* neat engineer tools (stay on the desk) */}
        <g transform="translate(540 106)">
          <rect x={-17} y={-27} width={34} height={54} rx={7} fill="#22c55e" stroke="#15803d" strokeWidth={2.5} />
          <rect x={-7} y={-33} width={14} height={7} rx={3} fill="#94a3b8" />
          <circle cx={-6} cy={-10} r={2.6} fill="#14532d" />
          <circle cx={6} cy={-10} r={2.6} fill="#14532d" />
          <path d="M -6 0 Q 0 7 6 0" fill="none" stroke="#14532d" strokeWidth={2.2} strokeLinecap="round" />
        </g>
        <g transform="translate(462 116)">
          <circle cx={0} cy={-16} r={9} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
          <line x1={-4} y1={-8} x2={-4} y2={8} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={4} y1={-8} x2={4} y2={8} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        <g transform="translate(408 120)">
          <circle cx={0} cy={-14} r={8} fill="#22d3ee" stroke="#0e7490" strokeWidth={2} />
          <line x1={-3.5} y1={-7} x2={-3.5} y2={7} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={3.5} y1={-7} x2={3.5} y2={7} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
        </g>
        <path d="M 340 118 q 10 -16 20 0 q 10 16 20 0 q 10 -16 20 0" fill="none" stroke="#64748b" strokeWidth={3} strokeLinecap="round" />

        {/* the clutter — tap to remove */}
        {CLUTTER.map((c) => (
          <g
            key={c.id}
            role="button"
            tabIndex={gone[c.id] ? -1 : 0}
            aria-label={tx(c.label)}
            onClick={() => remove(c.id)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                remove(c.id);
              }
            }}
            style={{
              cursor: gone[c.id] ? 'default' : 'pointer',
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transition: 'transform .38s cubic-bezier(.5,-0.4,.7,.2), opacity .38s',
              transform: gone[c.id] ? 'scale(0) rotate(25deg)' : 'scale(1)',
              opacity: gone[c.id] ? 0 : 1,
              pointerEvents: gone[c.id] ? 'none' : 'auto',
            }}
          >
            <circle cx={c.x} cy={c.y - 12} r={27} fill="#fff" opacity={0.65} />
            <text x={c.x} y={c.y} fontSize={38} textAnchor="middle">{c.emoji}</text>
          </g>
        ))}

        {motion && done && (
          <>
            <text x={360} y={70} fontSize={26} className="cq-float">✨</text>
            <text x={140} y={84} fontSize={22} className="cq-float" style={{ animationDelay: '0.6s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${done ? 'text-emerald-600' : 'text-slate-400'}`}>
        {done ? tx(DESK_DONE) : tx(DESK_START)}
      </p>
    </div>
  );
}

/* ================================================ l0-4 · circuit pages ================================================ */
/*
 * l0-4 «مدار چیست؟ (جاده جادویی و حلقه بسته)» added four more:
 *
 *   race-start      — press the start flag: electrons race the round loop (page 1)
 *   trace-circuit   — drag along the loop: the wire glows, the LED lights (page 2)
 *   fix-circuit     — tap the two loose wire ends: the gap closes like a bridge (page 3)
 *   circuit-stations— tap the 4 stations: each says its name and job          (page 4)
 */

/* -------------------------------------------------- page 1 · race-start */

const RACE_CTA = L(
  'Tap the start flag so the electrons start their race on the round track!',
  'روی پرچم استارت بزن تا الکترون‌ها مسابقه‌شون رو توی مسیر گرد شروع کنند!',
);
const RACE_IDLE = L('The electrons are lined up behind the start line… 🏁', 'الکترون‌ها پشت خط استارت آماده‌اند… 🏁');
const RACE_GO = L(
  'The electrons are zooming around the round road — just like a real circuit! ⚡',
  'الکترون‌ها توی مسیرِ گرد می‌چرخند — درست مثل یک مدار واقعی! ⚡',
);
const RACE_START_LABEL = L('Start the race! 🏁', 'شروع مسابقه! 🏁');
const RACE_STOP_LABEL = L('Stop the race', 'توقف مسابقه');

/** the closed round track: two half-ellipse arcs, starting at the flag (right) running RTL over the top */
const RACE_LOOP = 'M 600 160 A 272 112 0 0 0 40 160 A 272 112 0 0 0 600 160';

/** starting-grid positions behind the flag (upper-right arc, RTL order) */
const RACE_GRID = [
  { x: 589, y: 144 },
  { x: 581, y: 129 },
  { x: 569, y: 114 },
  { x: 551, y: 101 },
  { x: 528, y: 88 },
  { x: 502, y: 77 },
] as const;

/** one cute electron wearing a racing helmet */
function Racer({ i, racing }: { i: number; racing: boolean }) {
  const spot = RACE_GRID[i];
  const dur = 2.4;
  return (
    <g transform={racing ? undefined : `translate(${spot.x} ${spot.y})`}>
      {racing && (
        <animateMotion dur={`${dur}s`} begin={`${-(i / RACE_GRID.length) * dur}s`} repeatCount="indefinite" path={RACE_LOOP} />
      )}
      {/* ⚠️ nested group on purpose: a SMIL animateTransform REPLACES the target's
          transform attribute, so rotating the outer <g> would wipe out its base
          translate and park every electron at the SVG origin (invisible). The
          idle wobble rotates this inner group; the outer translate survives. */}
      <g>
        {!racing && (
          <animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur={`${0.4 + i * 0.05}s`} repeatCount="indefinite" />
        )}
        <circle r={13} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
        {/* helmet */}
        <path d="M -12 -3 A 12 12 0 0 1 12 -3 Z" fill="#f59e0b" stroke="#b45309" strokeWidth={2} />
        {/* goggles */}
        <rect x={-11} y={-7} width={22} height={6} rx={3} fill="#e0f2fe" stroke="#0369a1" strokeWidth={1.4} />
        <circle cx={-4} cy={1.5} r={1.7} fill="#0c4a6e" />
        <circle cx={4} cy={1.5} r={1.7} fill="#0c4a6e" />
        <path d="M -4 6 Q 0 9.5 4 6" stroke="#0c4a6e" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Press the start flag: the electron racecars zoom around the closed loop. */
export function RaceStartScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [racing, setRacing] = useState(false);

  const toggle = () => {
    setRacing((was) => {
      if (!was) {
        sfx.whoosh();
        window.setTimeout(() => sfx.sparkle(), 350);
      } else {
        sfx.click();
      }
      return !was;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('Cute electron racecar drivers running around a closed circular racetrack', 'الکترون‌های راننده دور یک پیست گرد و بسته می‌دوند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🏁 {tx(RACE_CTA)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="group"
        aria-label={tx(racing ? RACE_GO : RACE_IDLE)}
      >
        {/* the round road */}
        <ellipse cx={320} cy={160} rx={272} ry={112} fill="none" stroke="#475569" strokeWidth={40} />
        <ellipse cx={320} cy={160} rx={272} ry={112} fill="none" stroke="#64748b" strokeWidth={30} />
        <ellipse cx={320} cy={160} rx={272} ry={112} fill="none" stroke="#e2e8f0" strokeWidth={2.5} strokeDasharray="16 12" />
        {/* start line + the flag (right side, RTL start). The cloth is drawn by
            hand (2×4 checker cells) and attached exactly at the pole top, so it
            can never drift off the pole like the old emoji glyph did. It flies
            left over the track — the racers zoom right under it. The whole flag
            is tappable, matching the «tap the start flag» instruction. */}
        <line x1={600} y1={140} x2={600} y2={180} stroke="#f8fafc" strokeWidth={4} strokeDasharray="6 6" />
        <g onClick={toggle} style={{ cursor: 'pointer' }} role="button" aria-label={tx(racing ? RACE_STOP_LABEL : RACE_START_LABEL)}>
          <line x1={612} y1={170} x2={612} y2={92} stroke="#7c2d12" strokeWidth={4} strokeLinecap="round" />
          <circle cx={612} cy={90} r={3} fill="#fbbf24" stroke="#b45309" strokeWidth={1.5} />
          {/* invisible hit-area around cloth + pole so small taps register */}
          <circle cx={596} cy={110} r={40} fill="transparent" />
          <g>
            {racing && (
              <animateTransform attributeName="transform" type="rotate" values="-7 612 92;7 612 92;-7 612 92" dur="0.5s" repeatCount="indefinite" />
            )}
            {Array.from({ length: 8 }).map((_, k) => {
              const r = Math.floor(k / 4);
              const c = k % 4;
              return <rect key={k} x={576 + c * 9} y={92 + r * 9} width={9} height={9} fill={(r + c) % 2 ? '#f8fafc' : '#ef4444'} />;
            })}
            <rect x={576} y={92} width={36} height={18} fill="none" stroke="#94a3b8" strokeWidth={1} opacity={0.6} />
          </g>
        </g>
        {/* the racers */}
        {RACE_GRID.map((_, i) => (
          <Racer key={i} i={i} racing={racing} />
        ))}
        {racing && (
          <>
            <text x={120} y={70} fontSize={22} className="cq-float">💨</text>
            <text x={470} y={280} fontSize={20} className="cq-float" style={{ animationDelay: '0.6s' }}>💨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${racing ? 'text-teal-700' : 'text-slate-400'}`}>
        {racing ? tx(RACE_GO) : tx(RACE_IDLE)}
      </p>
      <Button
        onClick={toggle}
        className={`h-12 w-full font-extrabold ${racing ? 'bg-slate-500 hover:bg-slate-600' : 'bg-sky-600 hover:bg-sky-700'}`}
      >
        {racing ? `🛑 ${tx(RACE_STOP_LABEL)}` : `🏁 ${tx(RACE_START_LABEL)}`}
      </Button>
    </div>
  );
}

/* ------------------------------------------------- page 2 · trace-circuit */

const TRACE_CTA = L(
  'Draw your finger along the circuit path to see the LED stay lit!',
  'انگشتت رو روی مسیر مدار بکش تا روشن ماندن LED رو ببینی!',
);
const TRACE_DONE = L('The circuit closed! The electrons spin and the LED is ON! ✨', 'مدار بسته شد! الکترون‌ها می‌چرخند و LED روشنه! ✨');

const TRACE_CX = 320;
const TRACE_CY = 168;
const TRACE_R = 118;
/** full loop from the battery (right), running RTL over the top */
const TRACE_LOOP = 'M 438 168 A 118 118 0 0 0 202 168 A 118 118 0 0 0 438 168';

/** Persian digits for the kid-facing progress counter */
const faNum = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

/* -- shared loop parts (also used by fix-circuit below) -- */

/** the smiling battery of the loop (right side, + on top) */
function LoopBattery({ happy }: { happy: boolean }) {
  return (
    <g transform="translate(438 168)">
      <rect x={-30} y={-52} width={60} height={104} rx={11} fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
      <rect x={-13} y={-62} width={26} height={10} rx={4} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
      <text x={-25} y={-32} fontSize={17} fontWeight={800} fill="#7c2d12">+</text>
      <text x={14} y={46} fontSize={17} fontWeight={800} fill="#7c2d12">−</text>
      <circle cx={-11} cy={-12} r={4} fill="#78350f" />
      <circle cx={11} cy={-12} r={4} fill="#78350f" />
      {happy ? (
        <path d="M -10 3 Q 0 13 10 3" fill="none" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
      ) : (
        <>
          <path d="M -10 9 Q 0 1 10 9" fill="none" stroke="#78350f" strokeWidth={3} strokeLinecap="round" />
          <circle cx={-22} cy={2} r={3.4} fill="#7dd3fc" />
        </>
      )}
      <circle cx={-20} cy={-2} r={4.2} fill="#fda4af" opacity={0.7} />
      <circle cx={20} cy={-2} r={4.2} fill="#fda4af" opacity={0.7} />
    </g>
  );
}

/** the LED lamp sitting at the top of the loop — asleep or glowing */
function LoopLed({ lit }: { lit: boolean }) {
  return (
    <g transform="translate(320 46)">
      {lit && (
        <>
          <circle r={34} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="30;40;30" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {/* rays */}
      {lit && (
        <g stroke="#f59e0b" strokeWidth={3} strokeLinecap="round">
          <line x1={0} y1={-30} x2={0} y2={-40} />
          <line x1={21} y1={-21} x2={28} y2={-28} />
          <line x1={-21} y1={-21} x2={-28} y2={-28} />
        </g>
      )}
      {/* screw base */}
      <rect x={-12} y={16} width={24} height={12} rx={4} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
      {/* glass */}
      <circle r={20} fill={lit ? '#fde047' : '#f1f5f9'} stroke={lit ? '#d97706' : '#94a3b8'} strokeWidth={2.5} />
      {lit ? (
        <>
          <circle cx={-6} cy={-3} r={2.2} fill="#92400e" />
          <circle cx={6} cy={-3} r={2.2} fill="#92400e" />
          <path d="M -6 4 Q 0 10 6 4" fill="none" stroke="#92400e" strokeWidth={2.4} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M -9 -2 L -3 -2" stroke="#94a3b8" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M 3 -2 L 9 -2" stroke="#94a3b8" strokeWidth={2.4} strokeLinecap="round" />
          <text x={16} y={-14} fontSize={16}>💤</text>
        </>
      )}
    </g>
  );
}

/** Drag along the loop: the wire glows behind the finger and the LED lights up. */
export function TraceCircuitScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [progress, setProgress] = useState(0);
  const lit = progress >= 0.97;
  const cur = useRef(0);
  const lastAngle = useRef(0);
  const celebrated = useRef(false);
  const dragging = useRef(false);

  const set = (raw: number) => {
    const p = Math.min(1, Math.max(0, raw));
    cur.current = p;
    setProgress(p);
    if (p >= 0.97 && !celebrated.current) {
      celebrated.current = true;
      sfx.fanfare();
      window.setTimeout(() => sfx.sparkle(), 420);
    } else if (p < 0.9) {
      celebrated.current = false;
    }
  };

  const update = (clientX: number, clientY: number, el: SVGSVGElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 640;
    const y = ((clientY - rect.top) / rect.height) * 320;
    let a = Math.atan2(TRACE_CY - y, x - TRACE_CX); // 0 = right, + = counter-clockwise on screen
    if (a < 0) a += Math.PI * 2;
    let d = a - lastAngle.current;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    lastAngle.current = a;
    set(cur.current + d / (Math.PI * 2));
  };

  const theta = progress * Math.PI * 2;
  const traveler = { x: TRACE_CX + TRACE_R * Math.cos(theta), y: TRACE_CY - TRACE_R * Math.sin(theta) };
  const pct = Math.round(progress * 100);

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A complete closed circuit: battery, wires with flowing electrons, glowing LED at the top', 'مدار بستهٔ کامل: باتری، سیم‌های پر از الکترون و LED روشن بالای مدار'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">✍️ {tx(TRACE_CTA)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer touch-none select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="slider"
        tabIndex={0}
        aria-label={tx(TRACE_CTA)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if (dragging.current) update(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            set(cur.current + 1 / 12);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            set(cur.current - 1 / 12);
          } else if (e.key === 'Home') {
            e.preventDefault();
            set(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            set(1);
          }
        }}
      >
        {/* the dim road */}
        <circle cx={TRACE_CX} cy={TRACE_CY} r={TRACE_R} fill="none" stroke="#cbd5e1" strokeWidth={16} />
        {/* the glowing trace (mirrored so it reveals RTL over the top) */}
        <g transform={`translate(0 ${2 * TRACE_CY}) scale(1 -1)`}>
          <circle
            cx={TRACE_CX}
            cy={TRACE_CY}
            r={TRACE_R}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={30}
            opacity={0.35}
            pathLength={1000}
            strokeDasharray="1000"
            strokeDashoffset={1000 - progress * 1000}
          />
          <circle
            cx={TRACE_CX}
            cy={TRACE_CY}
            r={TRACE_R}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={16}
            strokeLinecap="round"
            pathLength={1000}
            strokeDasharray="1000"
            strokeDashoffset={1000 - progress * 1000}
          />
        </g>
        {/* electrons race once the loop is complete */}
        {lit &&
          Array.from({ length: 7 }).map((_, i) => (
            <circle key={i} r={7} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.6}>
              {motion && <animateMotion dur="3.4s" begin={`${-(i / 7) * 3.4}s`} repeatCount="indefinite" path={TRACE_LOOP} />}
            </circle>
          ))}
        {/* the traveling finger-friend */}
        {!lit && (
          <g style={{ transform: `translate(${traveler.x}px, ${traveler.y}px)` }} className="pointer-events-none">
            <text y={7} fontSize={22} textAnchor="middle">⚡</text>
          </g>
        )}
        {/* battery (right) + LED (top), drawn on the road */}
        <LoopBattery happy={lit} />
        <LoopLed lit={lit} />
        {lit && motion && (
          <>
            <text x={210} y={270} fontSize={24} className="cq-float">✨</text>
            <text x={420} y={80} fontSize={20} className="cq-float" style={{ animationDelay: '0.7s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${lit ? 'text-teal-700' : 'text-slate-400'}`}>
        {lit
          ? tx(TRACE_DONE)
          : tx(L(`${pct}% of the road is glowing — keep going!`, `٪${faNum(pct)} از جاده نورانی شد — ادامه بده!`))}
      </p>
    </div>
  );
}

/* --------------------------------------------------- page 3 · fix-circuit */

const FIX_CTA = L(
  'Connect the separated wires with your hand so the circuit closes again!',
  'سیم‌های جداشده رو با دستت به هم وصل کن تا مدار دوباره بسته بشه!',
);
const FIX_OPEN = L('The electrons stopped in front of the gap and the LED is asleep… 🛑', 'الکترون‌ها پشت شکاف ایستاده‌اند و LED خوابیده… 🛑');
const FIX_CLOSED = L('The circuit is closed again! The current is back and the LED is ON! 🟢', 'مدار دوباره بسته شد! جریان برگشت و LED روشنه! 🟢');
const FIX_CONNECT = L('Tap to connect the wire', 'بزن تا سیم وصل بشه');
const FIX_CONNECT_BTN = L('🔌 Connect the wires!', '🔌 سیم‌ها رو به هم وصل کن!');
const FIX_OPEN_BTN = L('✂️ Open the circuit again', '✂️ دوباره مدار رو باز کن');

// the loop with a gap on the LEFT side (φ 168°→212°): electrons pile up in front of it
const FIX_GAP_DASH = '411 122 467 0'; // pathLength=1000, visible except t 411..533 (the gap)
const FIX_CAP_A = { x: 205, y: 144 }; // upper edge of the gap (electrons arrive here)
const FIX_CAP_B = { x: 220, y: 231 }; // lower edge of the gap
const FIX_BRIDGE = 'M 205 144 A 118 118 0 0 0 220 231'; // grows from A to B like a closing bridge
/** stopped electrons waiting in front of the gap (upper-left arc) */
const FIX_QUEUE = [
  { x: 218, y: 106 },
  { x: 213, y: 118 },
  { x: 208, y: 132 },
  { x: 205, y: 144 },
] as const;

/** Tap the two loose wire ends: the bridge closes, electrons dash, the LED wakes up. */
export function FixCircuitScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [closed, setClosed] = useState(false);

  const close = () => {
    if (closed) return;
    setClosed(true);
    sfx.click();
    window.setTimeout(() => sfx.powerup(), 300);
    window.setTimeout(() => sfx.sparkle(), 700);
  };
  const open = () => {
    setClosed(false);
    sfx.click();
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('An open circuit: electrons stopped at the gap, the LED asleep', 'مدار باز: الکترون‌ها پشت شکاف ایستاده‌اند و LED خواب است'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🖐️ {tx(FIX_CTA)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="img"
        aria-label={tx(closed ? FIX_CLOSED : FIX_OPEN)}
      >
        {/* the road with the gap (left side) */}
        <circle cx={TRACE_CX} cy={TRACE_CY} r={TRACE_R} fill="none" stroke="#cbd5e1" strokeWidth={16} pathLength={1000} strokeDasharray={FIX_GAP_DASH} />
        {/* the closing bridge — springs across the gap */}
        <path
          d={FIX_BRIDGE}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={28}
          opacity={0.35}
          pathLength={1000}
          strokeDasharray="1000"
          strokeDashoffset={closed ? 0 : 1000}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.34,1.3,.64,1)' }}
        />
        <path
          d={FIX_BRIDGE}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray="1000"
          strokeDashoffset={closed ? 0 : 1000}
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.34,1.3,.64,1)' }}
        />
        {/* red warning over the gap while it is open */}
        {!closed && (
          <>
            <path d={FIX_BRIDGE} fill="none" stroke="#f87171" strokeWidth={4} strokeDasharray="6 9" strokeLinecap="round">
              <animate attributeName="opacity" values="0.35;0.95;0.35" dur="1.2s" repeatCount="indefinite" />
            </path>
            <text x={204} y={198} fontSize={24} textAnchor="middle">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
              ❌
            </text>
          </>
        )}
        {/* electrons zoom the whole loop once it is closed */}
        {closed &&
          Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} r={7} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.6}>
              {motion && <animateMotion dur="3.2s" begin={`${-(i / 6) * 3.2}s`} repeatCount="indefinite" path={TRACE_LOOP} />}
            </circle>
          ))}
        {/* the stopped queue, holding little stop signs */}
        {!closed &&
          FIX_QUEUE.map((q, i) => (
            <g key={i}>
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.2;0 0" dur={`${0.5 + i * 0.07}s`} repeatCount="indefinite" />
              <text x={q.x} y={q.y - 17} fontSize={11} textAnchor="middle">🛑</text>
              <circle cx={q.x} cy={q.y} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.8} />
              <circle cx={q.x - 3} cy={q.y - 2} r={1.4} fill="#0c4a6e" />
              <circle cx={q.x + 3} cy={q.y - 2} r={1.4} fill="#0c4a6e" />
              <path d={`M ${q.x - 3} ${q.y + 3} Q ${q.x} ${q.y + 6} ${q.x + 3} ${q.y + 3}`} stroke="#0c4a6e" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            </g>
          ))}
        {/* the two loose ends (tap either one) */}
        {([FIX_CAP_A, FIX_CAP_B] as const).map((cap, i) => (
          <g
            key={i}
            role={closed ? undefined : 'button'}
            tabIndex={closed ? -1 : 0}
            aria-label={tx(FIX_CONNECT)}
            onClick={close}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                close();
              }
            }}
            style={{ cursor: closed ? 'default' : 'pointer', pointerEvents: closed ? 'none' : 'auto', outline: 'none' }}
          >
            <circle cx={cap.x} cy={cap.y} r={26} fill="transparent" />
            {!closed && (
              <circle cx={cap.x} cy={cap.y} r={13} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 5">
                <animate attributeName="r" values="12;17;12" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={cap.x}
              cy={cap.y}
              r={8}
              fill="#fbbf24"
              stroke="#b45309"
              strokeWidth={2.5}
              style={{
                transform: closed && i === 0 ? `translate(${FIX_CAP_B.x - FIX_CAP_A.x}px, ${FIX_CAP_B.y - FIX_CAP_A.y}px)` : 'none',
                transition: 'transform .5s cubic-bezier(.34,1.3,.64,1)',
              }}
            />
          </g>
        ))}
        {/* battery (right) + LED (top) */}
        <LoopBattery happy={closed} />
        <LoopLed lit={closed} />
        {closed && motion && (
          <>
            <text x={430} y={280} fontSize={24} className="cq-float">✨</text>
            <text x={120} y={70} fontSize={20} className="cq-float" style={{ animationDelay: '0.7s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${closed ? 'text-teal-700' : 'text-rose-600'}`}>
        {closed ? tx(FIX_CLOSED) : tx(FIX_OPEN)}
      </p>
      <Button
        onClick={closed ? open : close}
        className={`h-12 w-full font-extrabold ${closed ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        {closed ? tx(FIX_OPEN_BTN) : tx(FIX_CONNECT_BTN)}
      </Button>
    </div>
  );
}

/* ------------------------------------------------ page 4 · circuit-stations */

const STATION_CTA = L('Tap each station so it tells you its name and job!', 'روی هر ایستگاه بزن تا اسم و کارشو برات بگه!');
const STATIONS_DONE = L('You know all 4 stations — the circuit road is complete! 🎉', 'همهٔ ۴ ایستگاه رو شناختی! جادهٔ مدار کامل شد! 🎉');

type StationId = 'battery' | 'wire' | 'switch' | 'lamp';

const CIRCUIT_STATIONS: { id: StationId; emoji: string; name: LocaleText; job: LocaleText; sound: () => void; on: string; chip: string }[] = [
  {
    id: 'battery',
    emoji: '🔋',
    name: L('The energy pump (the battery)', 'پمپ انرژی (باتری)'),
    job: L('It pushes the electrons so they start moving!', 'الکترون‌ها رو هول میده تا حرکت کنند!'),
    sound: () => sfx.powerup(),
    on: 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/30',
    chip: 'bg-amber-600 text-white',
  },
  {
    id: 'wire',
    emoji: '🧵',
    name: L('The moving road (the copper wires)', 'جادهٔ حرکت (سیم‌های مس)'),
    job: L('They are the path the electrons travel on!', 'مسیر رفت و آمد الکترون‌ها هستند!'),
    sound: () => sfx.whoosh(),
    on: 'border-sky-500 bg-sky-50 ring-2 ring-sky-500/30',
    chip: 'bg-sky-600 text-white',
  },
  {
    id: 'switch',
    emoji: '🚦',
    name: L('The road gate (the switch)', 'دروازهٔ جاده (کلید)'),
    job: L('It opens and closes the road!', 'جاده رو باز و بسته می‌کنه!'),
    sound: () => sfx.click(),
    on: 'border-violet-500 bg-violet-50 ring-2 ring-violet-500/30',
    chip: 'bg-violet-600 text-white',
  },
  {
    id: 'lamp',
    emoji: '💡',
    name: L('The energy user (the lamp or motor)', 'مصرف‌کننده انرژی (لامپ یا موتور)'),
    job: L('It turns the electrons’ energy into light or motion!', 'انرژی الکترون‌ها رو می‌گیره و نور یا حرکت می‌سازه!'),
    sound: () => sfx.sparkle(),
    on: 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-500/30',
    chip: 'bg-yellow-600 text-white',
  },
];

/** Tap the 4 stations of the circuit map; each says its name and its job. */
export function CircuitStationsScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const [visited, setVisited] = useState<Partial<Record<StationId, boolean>>>({});
  const celebrated = useRef(false);

  const done = CIRCUIT_STATIONS.every((s) => visited[s.id]);

  useEffect(() => {
    if (done && !celebrated.current) {
      celebrated.current = true;
      sfx.fanfare();
      window.setTimeout(() => sfx.sparkle(), 420);
    } else if (!done) {
      celebrated.current = false;
    }
  }, [done]);

  const tap = (s: (typeof CIRCUIT_STATIONS)[number]) => {
    if (!visited[s.id]) s.sound();
    setVisited((v) => ({ ...v, [s.id]: true }));
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A fantasy map of four friendly circuit stations connected in a loop', 'نقشهٔ فانتزی چهار ایستگاه مهربان مدار در یک حلقه'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">👆 {tx(STATION_CTA)}</p>
      <div className="grid grid-cols-2 gap-3">
        {CIRCUIT_STATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => tap(s)}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${
              visited[s.id] ? s.on : 'border-slate-200 bg-white'
            }`}
          >
            <span className="text-3xl">{s.emoji}</span>
            <p className="mt-1 font-extrabold">{tx(s.name)}</p>
            {visited[s.id] && (
              <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-600">💬 {tx(s.job)}</p>
            )}
            {visited[s.id] && (
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${s.chip}`}>
                {tx(L('Got it! ✅', 'یاد گرفتم! ✅'))}
              </span>
            )}
          </button>
        ))}
      </div>
      {done && <p className="cq-pop text-center text-sm font-extrabold text-teal-700">{tx(STATIONS_DONE)}</p>}
    </div>
  );
}

/* ================================================================
   l0-5 «مدار باز و مدار بسته (پل جاده)» — the drawbridge story scenes
   (cars queue on the RIGHT and cross toward the LEFT: RTL journey)
   ================================================================ */

/* ------------------------------------------------- shared bridge parts */

/** the purple river channel between the two grassy banks */
function BridgeRiver({ motion = true }: { motion?: boolean }) {
  return (
    <g>
      <rect x={256} y={212} width={128} height={108} fill="#c4b5fd" opacity={0.6} />
      <rect x={256} y={212} width={128} height={7} fill="#a78bfa" opacity={0.65} />
      {[276, 312, 348].map((x, i) => (
        <path
          key={i}
          d={`M ${x} ${244 + i * 22} q 11 -5 22 0 q 11 5 22 0`}
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        >
          {motion && <animate attributeName="opacity" values="0.3;0.75;0.3" dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" />}
        </path>
      ))}
    </g>
  );
}

/** grassy banks + asphalt road on both sides (right = start, left = LED home) */
function BridgeBanks() {
  return (
    <g>
      {[{ x: 0, w: 262 }, { x: 378, w: 262 }].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={210} width={b.w} height={16} rx={4} fill="#86efac" />
          <rect x={b.x} y={196} width={b.w} height={16} fill="#64748b" />
          <line x1={b.x + 8} y1={204} x2={b.x + b.w - 8} y2={204} stroke="#f8fafc" strokeWidth={2.5} strokeDasharray="10 10" opacity={0.8} />
        </g>
      ))}
    </g>
  );
}

/** the stone control tower standing on the right bank (the hinge of the deck) */
function BridgeTower() {
  return (
    <g>
      <rect x={382} y={160} width={26} height={52} rx={6} fill="#fbbf24" stroke="#b45309" strokeWidth={2.5} />
      <rect x={387} y={170} width={16} height={12} rx={3} fill="#e0f2fe" stroke="#b45309" strokeWidth={2} />
      <path d="M 380 160 L 395 148 L 410 160 Z" fill="#f87171" stroke="#b91c1c" strokeWidth={2} />
      <circle cx={395} cy={144} r={3} fill="#fde047" stroke="#d97706" strokeWidth={1.5} />
    </g>
  );
}

/** the rotating deck: raised = rotate(+66°) about the hinge (CSS transform) */
function BridgeDeck({ down, motion = true }: { down: boolean; motion?: boolean }) {
  return (
    <g
      style={{
        // pivot about the hinge (382,202) — written as a transform chain so it
        // never depends on transform-origin/transform-box browser behavior
        transform: `translate(382px, 202px) rotate(${down ? 0 : 66}deg) translate(-382px, -202px)`,
        transition: motion ? 'transform 1s cubic-bezier(.45,.05,.35,1)' : 'none',
      }}
    >
      <rect x={252} y={196} width={132} height={17} rx={3} fill="#d97706" stroke="#b45309" strokeWidth={2.5} />
      {[268, 288, 308, 328, 348, 368].map((x) => (
        <line key={x} x1={x} y1={197} x2={x} y2={212} stroke="#b45309" strokeWidth={1.6} opacity={0.6} />
      ))}
      <line x1={256} y1={186} x2={380} y2={186} stroke="#b45309" strokeWidth={3} strokeLinecap="round" />
      {[262, 290, 318, 346, 374].map((x) => (
        <line key={x} x1={x} y1={187} x2={x} y2={196} stroke="#b45309" strokeWidth={2.5} />
      ))}
    </g>
  );
}

/** «خانهٔ نور» — the little house with the LED bulb on its roof (left bank) */
function BridgeLamp({ lit, motion = true }: { lit: boolean; motion?: boolean }) {
  return (
    <g transform="translate(96 0)">
      {lit && (
        <circle cx={0} cy={128} r={30} fill="#fde047" opacity={0.3}>
          {motion && <animate attributeName="r" values="26;36;26" dur="1.6s" repeatCount="indefinite" />}
        </circle>
      )}
      {/* the bulb */}
      {lit &&
        [0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={22 * Math.cos((a * Math.PI) / 180)}
            y1={128 + 22 * Math.sin((a * Math.PI) / 180)}
            x2={28 * Math.cos((a * Math.PI) / 180)}
            y2={128 + 28 * Math.sin((a * Math.PI) / 180)}
            stroke="#f59e0b"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      <rect x={-9} y={141} width={18} height={9} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
      <circle cx={0} cy={128} r={15} fill={lit ? '#fde047' : '#f1f5f9'} stroke={lit ? '#d97706' : '#94a3b8'} strokeWidth={2.2} />
      {lit ? (
        <>
          <circle cx={-5} cy={126} r={1.8} fill="#92400e" />
          <circle cx={5} cy={126} r={1.8} fill="#92400e" />
          <path d="M -5 132 Q 0 137 5 132" fill="none" stroke="#92400e" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M -8 124 L -3 124" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />
          <path d="M 3 124 L 8 124" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />
          <text x={20} y={116} fontSize={14}>💤</text>
        </>
      )}
      {/* the house */}
      <rect x={-38} y={156} width={76} height={54} rx={6} fill="#fef3c7" stroke="#d97706" strokeWidth={2.5} />
      <path d="M -44 158 L 0 132 L 44 158 Z" fill="#f87171" stroke="#b91c1c" strokeWidth={2.5} />
      <rect x={-12} y={182} width={24} height={28} rx={4} fill="#d97706" />
      <circle cx={0} cy={196} r={2} fill="#fef3c7" />
      <circle cx={-24} cy={172} r={7} fill="#bae6fd" stroke="#d97706" strokeWidth={2} />
      <circle cx={24} cy={172} r={7} fill={lit ? '#fde047' : '#bae6fd'} stroke="#d97706" strokeWidth={2} />
    </g>
  );
}

/** one cute electron driving its tiny toy car (looks toward its travel direction) */
function BridgeCar({ x, y, moving = false, holdStop = false, delay = '0s', motion = true }: {
  x: number;
  y: number;
  moving?: boolean;
  holdStop?: boolean;
  delay?: string;
  motion?: boolean;
}) {
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transformBox: 'view-box',
        transition: motion ? 'transform 1.5s cubic-bezier(.45,.1,.3,1)' : 'none',
        transitionDelay: delay,
      }}
    >
      {holdStop && <text x={0} y={-30} fontSize={11} textAnchor="middle">🛑</text>}
      {moving && <text x={26} y={-12} fontSize={13} textAnchor="middle">💨</text>}
      {/* wheels */}
      <circle cx={-11} cy={0} r={5.5} fill="#334155" />
      <circle cx={11} cy={0} r={5.5} fill="#334155" />
      <circle cx={-11} cy={0} r={2} fill="#94a3b8" />
      <circle cx={11} cy={0} r={2} fill="#94a3b8" />
      {/* body + cabin */}
      <rect x={-20} y={-17} width={40} height={15} rx={6} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
      <path d="M -11 -17 L -8 -26 Q -7 -28 -5 -28 L 6 -28 Q 8 -28 8 -26 L 10 -17 Z" fill="#7dd3fc" stroke="#0369a1" strokeWidth={2} />
      {/* the electron driver, leaning toward the front (left) */}
      <circle cx={-3} cy={-22} r={6.5} fill="#0ea5e9" stroke="#0369a1" strokeWidth={1.6} />
      <circle cx={-5.5} cy={-23} r={1.3} fill="#082f49" />
      <circle cx={-0.5} cy={-23} r={1.3} fill="#082f49" />
      <path d="M -6 -19.5 Q -3 -17 0 -19.5" stroke="#082f49" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {/* headlight at the front (left) */}
      <circle cx={-20} cy={-9} r={2.6} fill="#fde047" stroke="#d97706" strokeWidth={1} />
    </g>
  );
}

/* ------------------------------------------------- page 1 · bridge-move */

const BRIDGE1_HINT = L(
  'Tap the bridge button to see how it moves!',
  'روی دکمه پل بزن تا ببینی چطور حرکت می‌کنه!',
);
const BRIDGE1_UP = L('The bridge is up! The electron cars wait for the ship to pass… 🚢', 'پل بالاست! ماشین‌های الکترون منتظرن که کشتی رد بشه… 🚢');
const BRIDGE1_DOWN = L('The bridge came down; the road connected and the car crossed! 🌉', 'پل پایین اومد؛ جاده وصل شد و ماشین رد شد! 🌉');
const BRIDGE1_LOWER = L('🌉 Lower the bridge!', '🌉 بگذار پل پایین بیاد!');
const BRIDGE1_RAISE = L('⬆️ Raise the bridge again', '⬆️ دوباره پل رو بالا ببر');

/** Page 1: toggle the toy drawbridge up/down and watch the electron car cross. */
export function BridgeMoveScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [down, setDown] = useState(false);

  const toggle = () => {
    setDown((was) => {
      const next = !was;
      if (next) {
        sfx.open(); // the creak-whoosh of the big deck moving
        window.setTimeout(() => sfx.whoosh(), 1000); // the car dashing across
        window.setTimeout(() => sfx.sparkle(), 2400); // arrived at the other bank
      } else {
        sfx.click();
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A toy drawbridge over a glowing river with electron cars waiting in line', 'پل متحرک اسباب‌بازی روی رودخانهٔ درخشان و ماشین‌های الکترون منتظر توی صف'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🌉 {tx(BRIDGE1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="img"
        aria-label={tx(down ? BRIDGE1_DOWN : BRIDGE1_UP)}
      >
        <BridgeRiver motion={motion} />
        <BridgeBanks />
        {!down && <text x={318} y={268} fontSize={30} textAnchor="middle" className={motion ? 'cq-float' : ''}>🚢</text>}
        <BridgeTower />
        <BridgeDeck down={down} motion={motion} />
        <BridgeLamp lit={down} motion={motion} />
        {/* the waiting electron car — crosses once the deck is down */}
        <BridgeCar
          x={down ? 160 : 566}
          y={196}
          moving={down}
          delay={down ? '0.9s' : '0.05s'}
          motion={motion}
        />
        {down && motion && (
          <>
            <text x={300} y={80} fontSize={22} className="cq-float">✨</text>
            <text x={480} y={140} fontSize={18} className="cq-float" style={{ animationDelay: '0.7s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${down ? 'text-teal-700' : 'text-slate-500'}`}>
        {down ? tx(BRIDGE1_DOWN) : tx(BRIDGE1_UP)}
      </p>
      <Button
        onClick={toggle}
        className={`h-12 w-full font-extrabold ${down ? 'bg-slate-500 hover:bg-slate-600' : 'bg-sky-600 hover:bg-sky-700'}`}
      >
        {down ? tx(BRIDGE1_RAISE) : tx(BRIDGE1_LOWER)}
      </Button>
    </div>
  );
}

/* ------------------------------------------------ page 2 · bridge-cross */

const BRIDGE2_HINT = L(
  'Guide the cars with your finger until they reach the lamp!',
  'با انگشتت ماشین‌ها رو هدایت کن تا به لامپ برسند!',
);
const BRIDGE2_TAP = L('Send this electron car across the bridge', 'این ماشین الکترون رو بفرست از روی پل');
const BRIDGE2_WAITING = L('Tap each little car so it crosses the bridge to the house of light! 👆', 'روی هر ماشین کوچولو بزن تا از روی پل به خانهٔ نور بره! 👆');
const BRIDGE2_DONE = L('All the electrons arrived! The circuit is closed and the house of light shines! 🟢💡', 'همهٔ الکترون‌ها رسیدند! مدار بسته‌ست و خانهٔ نور روشنه! 🟢💡');

/** the 5 waiting spots (right) and their parking spots by the lamp (left) */
const CROSS_QUEUE = [576, 530, 484, 438, 392] as const;
const CROSS_PARK = [210, 178, 146, 114, 82] as const;

/** Page 2: closed circuit — tap the electron cars and they cross to the LED. */
export function BridgeCrossScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [crossed, setCrossed] = useState<boolean[]>(() => CROSS_QUEUE.map(() => false));
  const celebrated = useRef(false);
  const arrived = crossed.filter(Boolean).length;
  const all = arrived === CROSS_QUEUE.length;

  useEffect(() => {
    if (all && !celebrated.current) {
      celebrated.current = true;
      sfx.fanfare();
      window.setTimeout(() => sfx.sparkle(), 420);
    } else if (!all) {
      celebrated.current = false;
    }
  }, [all]);

  const send = (i: number) => {
    if (crossed[i]) return;
    sfx.whoosh();
    setCrossed((c) => c.map((v, j) => (j === i ? true : v)));
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('The lowered bridge with electron cars driving across toward the glowing LED', 'پلِ پایین‌آمده و ماشین‌های الکترون که به سمت LED روشن می‌روند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🚗 {tx(BRIDGE2_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="img"
        aria-label={tx(all ? BRIDGE2_DONE : BRIDGE2_WAITING)}
      >
        <BridgeRiver motion={motion} />
        <BridgeBanks />
        <BridgeTower />
        <BridgeDeck down motion={motion} />
        <BridgeLamp lit={arrived > 0} motion={motion} />
        {CROSS_QUEUE.map((qx, i) => {
          const gone = crossed[i];
          return (
            <g
              key={i}
              role={gone ? undefined : 'button'}
              tabIndex={gone ? -1 : 0}
              aria-label={tx(BRIDGE2_TAP)}
              onClick={() => send(i)}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault();
                  send(i);
                }
              }}
              style={{ cursor: gone ? 'default' : 'pointer', outline: 'none' }}
            >
              {/* pulsing invite ring on cars still waiting */}
              {!gone && (
                <circle cx={qx} cy={186} r={26} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="5 6">
                  {motion && <animate attributeName="r" values="24;30;24" dur="1.3s" repeatCount="indefinite" />}
                </circle>
              )}
              <BridgeCar
                x={gone ? CROSS_PARK[i] : qx}
                y={196}
                moving={gone}
                delay={gone ? '0.12s' : '0s'}
                motion={motion}
              />
            </g>
          );
        })}
        {all && motion && (
          <>
            <text x={250} y={90} fontSize={24} className="cq-float">✨</text>
            <text x={430} y={140} fontSize={20} className="cq-float" style={{ animationDelay: '0.7s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${all ? 'text-teal-700' : 'text-slate-500'}`}>
        {all ? tx(BRIDGE2_DONE) : tx(BRIDGE2_WAITING)}
      </p>
    </div>
  );
}

/* ------------------------------------------------- page 3 · bridge-open */

const BRIDGE3_HINT = L(
  'Lower the bridge so the electrons start moving again!',
  'پل رو بگذار پایین تا الکترون‌ها دوباره راه بیفتند!',
);
const BRIDGE3_OPEN = L('Open circuit! The electrons stopped behind the bridge and the lamp is asleep… 🔴', 'مدار باز! الکترون‌ها پشت پل ایستادند و چراغ خوابه… 🔴');
const BRIDGE3_CLOSED = L('The circuit closed! The electrons move again and the lamp shines! 🟢', 'مدار بسته شد! الکترون‌ها دوباره حرکت کردند و چراغ روشنه! 🟢');
const BRIDGE3_LOWER = L('🌉 Lower the bridge — let them pass!', '🌉 پل رو بگذار پایین تا رد بشن!');
const BRIDGE3_RAISE = L('⬆️ Raise the bridge again', '⬆️ دوباره پل رو بالا ببر');

/** the 4 stopped cars (right queue) and their parking spots (left) */
const OPEN_QUEUE = [576, 530, 484, 438] as const;
const OPEN_PARK = [210, 178, 146, 114] as const;
/** red dashed warning arc across the gap while the bridge is up */
const OPEN_WARN = 'M 258 192 Q 296 140 330 90';

/** Page 3: open circuit — lower the bridge and the stopped electrons resume. */
export function BridgeOpenScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [down, setDown] = useState(false);

  const toggle = () => {
    setDown((was) => {
      const next = !was;
      if (next) {
        sfx.open();
        window.setTimeout(() => sfx.powerup(), 900);
        window.setTimeout(() => sfx.sparkle(), 1500);
      } else {
        sfx.click();
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('The raised bridge with a gap, electron cars stopped holding stop signs', 'پلِ بالا رفته با شکاف وسط جاده و ماشین‌های الکترونِ ایستاده با تابلو ایست'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🛑 {tx(BRIDGE3_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="img"
        aria-label={tx(down ? BRIDGE3_CLOSED : BRIDGE3_OPEN)}
      >
        <BridgeRiver motion={motion} />
        <BridgeBanks />
        <BridgeTower />
        <BridgeDeck down={down} motion={motion} />
        {/* pulsing red warning across the gap while open */}
        {!down && (
          <path d={OPEN_WARN} fill="none" stroke="#f87171" strokeWidth={4} strokeDasharray="7 9" strokeLinecap="round">
            {motion && <animate attributeName="opacity" values="0.35;0.95;0.35" dur="1.2s" repeatCount="indefinite" />}
          </path>
        )}
        {!down && <text x={300} y={152} fontSize={22} textAnchor="middle">❌</text>}
        <BridgeLamp lit={down} motion={motion} />
        {OPEN_QUEUE.map((qx, i) => (
          <BridgeCar
            key={i}
            x={down ? OPEN_PARK[i] : qx}
            y={196}
            moving={down}
            holdStop={!down}
            delay={down ? `${0.9 + i * 0.3}s` : '0.05s'}
            motion={motion}
          />
        ))}
        {down && motion && (
          <>
            <text x={300} y={84} fontSize={22} className="cq-float">✨</text>
            <text x={470} y={130} fontSize={18} className="cq-float" style={{ animationDelay: '0.7s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${down ? 'text-teal-700' : 'text-rose-600'}`}>
        {down ? tx(BRIDGE3_CLOSED) : tx(BRIDGE3_OPEN)}
      </p>
      <Button
        onClick={toggle}
        className={`h-12 w-full font-extrabold ${down ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        {down ? tx(BRIDGE3_RAISE) : tx(BRIDGE3_LOWER)}
      </Button>
    </div>
  );
}

/* ----------------------------------------------- page 4 · bridge-switch */

const BRIDGE4_HINT = L(
  'Tap the switch to try the ON and OFF modes!',
  'کلید رو بزن تا حالت روشن و خاموش رو امتحان کنی!',
);
const BRIDGE4_ON = L('🟢 Switch ON: bridge down ➔ circuit closed ➔ lamp lit!', '🟢 کلید روشن: پل پایین ➔ مدار بسته ➔ چراغ روشن!');
const BRIDGE4_OFF = L('🔴 Switch OFF: bridge up ➔ circuit open ➔ lamp dark!', '🔴 کلید خاموش: پل بالا ➔ مدار باز ➔ چراغ خاموش!');
const BRIDGE4_TURN_ON = L('🎛️ Turn the switch ON', '🎛️ کلید رو روشن کن');
const BRIDGE4_TURN_OFF = L('🎛️ Turn the switch OFF', '🎛️ کلید رو خاموش کن');

/** the friendly switch character dressed as a bridge conductor (right side) */
function SwitchKeeper({ on, motion = true }: { on: boolean; motion?: boolean }) {
  return (
    <g transform="translate(492 108)">
      {/* conductor cap */}
      <path d="M -30 -66 Q 0 -84 30 -66 L 30 -58 L -30 -58 Z" fill="#7c3aed" stroke="#5b21b6" strokeWidth={2.5} />
      <ellipse cx={0} cy={-58} rx={40} ry={7} fill="#8b5cf6" stroke="#5b21b6" strokeWidth={2} />
      <circle cx={0} cy={-80} r={4} fill="#fde047" stroke="#d97706" strokeWidth={1.5} />
      {/* the plate */}
      <rect x={-46} y={-56} width={92} height={116} rx={18} fill="#ede9fe" stroke="#7c3aed" strokeWidth={3.5} />
      {/* face (eyes follow the state: happy when ON, sleepy when OFF) */}
      {on ? (
        <>
          <circle cx={-15} cy={-34} r={4} fill="#4c1d95" />
          <circle cx={15} cy={-34} r={4} fill="#4c1d95" />
          <path d="M -10 -22 Q 0 -14 10 -22" fill="none" stroke="#4c1d95" strokeWidth={2.6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M -20 -36 L -10 -36" stroke="#4c1d95" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M 10 -36 L 20 -36" stroke="#4c1d95" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M -8 -18 Q 0 -23 8 -18" fill="none" stroke="#4c1d95" strokeWidth={2.6} strokeLinecap="round" />
          <text x={30} y={-40} fontSize={13}>💤</text>
        </>
      )}
      <circle cx={-28} cy={-24} r={4.5} fill="#fda4af" opacity={0.7} />
      <circle cx={28} cy={-24} r={4.5} fill="#fda4af" opacity={0.7} />
      {/* the lever: down = ON, up = OFF */}
      <g
        style={{
          // pivot about the lever base (0,22) in the plate's local frame —
          // a transform chain, independent of transform-origin quirks
          transform: `translate(0px, 22px) rotate(${on ? 26 : -26}deg) translate(0px, -22px)`,
          transition: motion ? 'transform .35s cubic-bezier(.34,1.4,.64,1)' : 'none',
        }}
      >
        <rect x={-9} y={-16} width={18} height={40} rx={9} fill="#7c3aed" stroke="#5b21b6" strokeWidth={2} />
        <circle cx={0} cy={-16} r={11} fill={on ? '#22c55e' : '#f87171'} stroke={on ? '#15803d' : '#dc2626'} strokeWidth={2.5} />
      </g>
      <circle cx={0} cy={22} r={7} fill="#a78bfa" stroke="#5b21b6" strokeWidth={2} />
      {/* state labels: OFF on top, ON at the bottom (Persian, live-rendered) */}
      <text x={-64} y={-38} fontSize={13} fontWeight={700} fill="#dc2626">🔴</text>
      <text x={-64} y={44} fontSize={13} fontWeight={700} fill="#16a34a">🟢</text>
    </g>
  );
}

/** Page 4: the switch commands the bridge — ON closes, OFF opens. */
export function BridgeSwitchScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [on, setOn] = useState(false);

  const toggle = () => {
    setOn((was) => {
      const next = !was;
      sfx.click();
      if (next) {
        window.setTimeout(() => sfx.powerup(), 350);
        window.setTimeout(() => sfx.sparkle(), 900);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A friendly light-switch character dressed as a bridge conductor beside a glowing and a dark bulb', 'کلید برقِ بامزه با لباس نگهبان پل، کنار یک چراغ روشن و یک چراغ خاموش'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🎛️ {tx(BRIDGE4_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="img"
        aria-label={tx(on ? BRIDGE4_ON : BRIDGE4_OFF)}
      >
        <BridgeRiver motion={motion} />
        <BridgeBanks />
        <BridgeTower />
        <BridgeDeck down={on} motion={motion} />
        <BridgeLamp lit={on} motion={motion} />
        {/* the waiting electrons — they only cross when the switch is ON */}
        {on && (
          <BridgeCar x={566} y={196} moving delay="0.5s" motion={motion} />
        )}
        <SwitchKeeper on={on} motion={motion} />
        {on && motion && (
          <>
            <text x={270} y={90} fontSize={22} className="cq-float">✨</text>
            <text x={430} y={70} fontSize={18} className="cq-float" style={{ animationDelay: '0.6s' }}>🌟</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${on ? 'text-teal-700' : 'text-rose-600'}`}>
        {on ? tx(BRIDGE4_ON) : tx(BRIDGE4_OFF)}
      </p>
      <Button
        onClick={toggle}
        className={`h-12 w-full font-extrabold ${on ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        {on ? tx(BRIDGE4_TURN_OFF) : tx(BRIDGE4_TURN_ON)}
      </Button>
    </div>
  );
}

/* ================================================== l0-6 · conductors & insulators ==================================================
 *
 * l0-6 «رسانا و عایق (کدام وسایل برق را رد می‌کنند؟)» — rebuilt IMAGE-FREE per
 * the user's brief: every page is now a full-bleed animated SVG stage (the AI
 * illustrations were removed), each with a richer hands-on interaction:
 *
 *   conductor-insulator — a cinema curtain opens and the two mascots slide in:
 *                         tap the conductor → he hops and a glowing highway of
 *                         running electrons forms under his feet;
 *                         tap the insulator → he raises his soft cloud shield
 *                         and the sparks land as harmless stars.      (page 1)
 *   copper-slide        — electrons queue at the top of a transparent copper
 *                         water-slide; hold & drag your finger and they whoosh
 *                         down, leap out of the tube and light a blinking LED (page 2)
 *   plastic-raincoat    — DRAG the zipper knob along the wire to zip the
 *                         colourful plastic coat shut around the bare wire:
 *                         a green safety halo appears, a cartoon hand grips the
 *                         wire with no sparks and 👍 pops up.             (page 3)
 *   material-lab        — detective lab: DRAG & DROP the key / coin / pencil /
 *                         ruler from the shelf into the circuit gap; metals
 *                         light the laughing LED, insulators make the electrons
 *                         stop and hold a STOP sign.                     (page 4)
 *
 * Same rules as the previous lessons: the teacher's words live in the robot
 * bubble untouched; scene labels are short bilingual additions in the same
 * friendly voice; sounds go through the shared sfx kit; the "reduce motion"
 * setting disables the decorative animations.
 */

/* ------------------------------------------------ page 1 · conductor-insulator */

const CON1_HINT = L(
  'The curtain is opening! Tap each hero so it shows you its magic!',
  'پرده داره باز میشه! روی هر قهرمان بزن تا جادوشو نشونت بده!',
);
const CON1_WAITING = L(
  'Who are these two? Tap them and watch their magic! 👂',
  'این دو تا کی‌ان؟ لمسشون کن و جادوشون رو ببین! 👂',
);
const CON1_CON_INTRO = L(
  'Hello! I am the CONDUCTOR! Look — the electrons race on the shiny highway under my feet! 🚀',
  'سلام! من رسانام! ببین — الکترون‌ها روی بزرگراهِ درخشانِ زیر پایم می‌دوند! 🚀',
);
const CON1_INS_INTRO = L(
  'And I am the INSULATOR! My soft shield stops the sparks so they can never hurt you! 🛡️',
  'من هم عایقم! سپر نرمم جرقه‌ها رو متوقف می‌کنه تا هیچ‌وقت بهت آسیب نزنن! 🛡️',
);
const CON1_BOTH = L(
  'The conductor lets the electrons race; the insulator stops them — what a team! 🤝',
  'رسانا می‌ذاره الکترون‌ها بدوند؛ عایق جلوشون رو می‌گیره — چه تیمی! 🤝',
);

/** one electron running on the hero's glowing highway (hero-local coords) */
function ConHighwayElectron({ i, motion = true }: { i: number; motion?: boolean }) {
  return (
    <circle r={8} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.8}>
      {motion && <animateMotion dur="1.6s" begin={`-${i * 0.4}s`} repeatCount="indefinite" path="M 50 17 H -180" />}
    </circle>
  );
}

/** the shiny metallic conductor superhero (local coords: feet at 0,0).
 *  Tapping him makes him hop and opens a glowing electron highway under his
 *  feet; electric particles orbit him all the time. */
function ConductorHero({ active, motion = true }: { active: boolean; motion?: boolean }) {
  return (
    <g>
      {!active && (
        <circle cx={0} cy={-64} r={80} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="6 8">
          {motion && <animate attributeName="r" values="76;88;76" dur="1.4s" repeatCount="indefinite" />}
        </circle>
      )}
      {/* the glowing electron highway that forms under his feet */}
      {active && (
        <g>
          <rect x={-198} y={6} width={264} height={22} rx={11} fill="#fde047" opacity={0.35} />
          <rect x={-198} y={6} width={264} height={22} rx={11} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="9 7" opacity={0.9} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <ConHighwayElectron i={i} motion={motion} />
            </g>
          ))}
        </g>
      )}
      {/* acrobatic hop while active — nested group WITHOUT a base transform, so
          the SMIL translate cannot wipe out a positioning transform */}
      <g>
        {active && motion && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -30; 0 0; 0 -14; 0 0"
            keyTimes="0;0.3;0.55;0.75;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
        {/* orbiting electric particles (nested group without base transform) */}
        <g>
          {motion && <animateTransform attributeName="transform" type="rotate" values="0 0 -70;360 0 -70" dur="3.2s" repeatCount="indefinite" />}
          {[
            [0, -134],
            [64, -70],
            [0, -6],
            [-64, -70],
          ].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={5.5} fill="#fbbf24" stroke="#d97706" strokeWidth={1.6} opacity={0.9} />
          ))}
        </g>
        {/* red cape */}
        <path d="M -40 -92 Q -78 -20 -54 26 Q -30 6 -16 12 Q -34 -34 -26 -86 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth={2.5} />
        {/* metallic body */}
        <rect x={-36} y={-104} width={72} height={100} rx={28} fill="url(#cqConMetal)" stroke="#64748b" strokeWidth={3} />
        <path d="M -28 -96 L -10 -96" stroke="#f8fafc" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
        {/* chest lightning emblem */}
        <path d="M 4 -70 L -10 -46 L 0 -46 L -6 -24 L 12 -52 L 1 -52 Z" fill="#fbbf24" stroke="#d97706" strokeWidth={2} strokeLinejoin="round" />
        {/* arms: wide open when active, relaxed otherwise */}
        {[-1, 1].map((s) => (
          <path
            key={s}
            d={active ? `M ${34 * s} -88 L ${66 * s} -110` : `M ${34 * s} -88 L ${50 * s} -46`}
            stroke="#cbd5e1"
            strokeWidth={11}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {/* face */}
        <circle cx={-12} cy={-82} r={4.2} fill="#1e293b" />
        <circle cx={12} cy={-82} r={4.2} fill="#1e293b" />
        <circle cx={-20} cy={-74} r={4.4} fill="#fda4af" opacity={0.75} />
        <circle cx={20} cy={-74} r={4.4} fill="#fda4af" opacity={0.75} />
        {active ? (
          <path d="M -8 -72 Q 0 -60 8 -72 Z" fill="#1e293b" />
        ) : (
          <path d="M -8 -72 Q 0 -64 8 -72" stroke="#1e293b" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        )}
        {/* hero mask */}
        <path d="M -34 -92 Q 0 -108 34 -92 L 34 -84 Q 0 -96 -34 -84 Z" fill="#f59e0b" stroke="#d97706" strokeWidth={2} />
      </g>
      {active && motion && <text x={0} y={-142} fontSize={20} textAnchor="middle" className="cq-float">✨</text>}
    </g>
  );
}

/** the kind insulator guard in a colourful plastic coat (feet at 0,0).
 *  Tapping him raises the soft cloud shield; sparks fly at it and drop to the
 *  floor as harmless stars. */
function InsulatorGuard({ active, motion = true }: { active: boolean; motion?: boolean }) {
  return (
    <g>
      {!active && (
        <circle cx={0} cy={-64} r={80} fill="none" stroke="#14b8a6" strokeWidth={3} strokeDasharray="6 8">
          {motion && <animate attributeName="r" values="76;88;76" dur="1.4s" begin="0.5s" repeatCount="indefinite" />}
        </circle>
      )}
      {/* sparks fly at the shield, then land as harmless stars */}
      {active && (
        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} r={5.5} fill="#fbbf24" stroke="#d97706" strokeWidth={1.5}>
              {motion && (
                <animateMotion
                  dur="1.9s"
                  begin={`${i * 0.55}s`}
                  repeatCount="indefinite"
                  path={`M ${596 - i * 24} ${146 + i * 30} Q 400 ${116 + i * 28} 232 262 Q 226 300 ${206 - i * 24} 326`}
                />
              )}
            </circle>
          ))}
          {[0, 1, 2].map((i) => (
            <text key={i} x={206 - i * 24} y={334} fontSize={16} textAnchor="middle" opacity={0}>
              ⭐
              {motion && (
                <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.7;0.88;1" dur="1.9s" begin={`${i * 0.55}s`} repeatCount="indefinite" />
              )}
            </text>
          ))}
        </g>
      )}
      <g>
        {active && motion && (
          <animateTransform attributeName="transform" type="translate" values="0 0; 0 -8; 0 0" keyTimes="0;0.4;1" dur="1.6s" repeatCount="indefinite" />
        )}
        {/* colourful plastic coat: bands clipped to the body */}
        <clipPath id="cqGuardCoat">
          <rect x={-40} y={-96} width={80} height={92} rx={30} />
        </clipPath>
        <rect x={-40} y={-96} width={80} height={92} rx={30} fill="#f8fafc" stroke="#0f766e" strokeWidth={3} />
        <g clipPath="url(#cqGuardCoat)">
          <rect x={-40} y={-96} width={80} height={24} fill="#fb7185" opacity={0.85} />
          <rect x={-40} y={-72} width={80} height={22} fill="#fbbf24" opacity={0.85} />
          <rect x={-40} y={-50} width={80} height={22} fill="#34d399" opacity={0.85} />
          <rect x={-40} y={-28} width={80} height={24} fill="#38bdf8" opacity={0.85} />
        </g>
        {/* face */}
        <circle cx={-13} cy={-78} r={4.4} fill="#134e4a" />
        <circle cx={13} cy={-78} r={4.4} fill="#134e4a" />
        <circle cx={-22} cy={-68} r={4.6} fill="#fda4af" opacity={0.75} />
        <circle cx={22} cy={-68} r={4.6} fill="#fda4af" opacity={0.75} />
        <path d="M -9 -64 Q 0 -55 9 -64" stroke="#134e4a" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        {/* the soft cloud shield: rests low, rises in front when active */}
        <g
          transform={active ? 'translate(52 -64)' : 'translate(58 4)'}
          style={{ transition: motion ? 'transform .45s cubic-bezier(.34,1.3,.64,1)' : 'none' }}
        >
          <g fill="#f8fafc" stroke={active ? '#14b8a6' : '#94a3b8'} strokeWidth={2.5}>
            <circle cx={-16} cy={2} r={13} />
            <circle cx={0} cy={-8} r={16} />
            <circle cx={16} cy={2} r={13} />
            <rect x={-27} y={-2} width={54} height={16} rx={8} />
          </g>
          {active && (
            <path d="M -7 6 L -2 11 L 8 -1" fill="none" stroke="#059669" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
      </g>
      {active && motion && <text x={-2} y={-140} fontSize={20} textAnchor="middle" className="cq-float">🌟</text>}
    </g>
  );
}

/** theatre curtain: two red panels that slide aside on mount (cinema opening) */
function Curtain({ open, motion = true }: { open: boolean; motion?: boolean }) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* left panel */}
      <g style={{ transform: open ? 'translateX(-372px)' : 'translateX(0px)', transition: motion ? 'transform 1s ease-in-out .1s' : 'none' }}>
        <rect x={-8} y={10} width={342} height={336} fill="#dc2626" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-8 + i * 43} y={10} width={21} height={336} fill="#b91c1c" opacity={0.5} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={13 + i * 43} cy={346} r={21} fill="#dc2626" />
        ))}
      </g>
      {/* right panel (mirrored) */}
      <g style={{ transform: open ? 'translateX(372px)' : 'translateX(0px)', transition: motion ? 'transform 1s ease-in-out .1s' : 'none' }}>
        <rect x={306} y={10} width={342} height={336} fill="#dc2626" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={306 + i * 43} y={10} width={21} height={336} fill="#b91c1c" opacity={0.5} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={327 + i * 43} cy={346} r={21} fill="#dc2626" />
        ))}
      </g>
      {/* gold rod on top */}
      <rect x={0} y={0} width={640} height={15} rx={7} fill="#b45309" stroke="#92400e" strokeWidth={2} />
      <circle cx={14} cy={7.5} r={4} fill="#fde047" />
      <circle cx={626} cy={7.5} r={4} fill="#fde047" />
    </g>
  );
}

/** Page 1: the cinema curtain opens, the two mascots slide in and each shows
 *  its magic when tapped — the conductor's electron highway vs the insulator's
 *  star-catching shield. */
export function ConductorInsulatorScene() {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [open, setOpen] = useState(false);
  const [conActive, setConActive] = useState(false);
  const [insActive, setInsActive] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setOpen(true);
      sfx.whoosh();
    }, 350);
    return () => window.clearTimeout(t);
  }, []);

  const toggleCon = () => {
    setConActive((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 350);
      } else {
        sfx.click();
      }
      return next;
    });
  };
  const toggleIns = () => {
    setInsActive((was) => {
      const next = !was;
      if (next) {
        sfx.blip();
        window.setTimeout(() => sfx.sparkle(), 350);
      } else {
        sfx.click();
      }
      return next;
    });
  };

  const status = conActive && insActive ? CON1_BOTH : conActive ? CON1_CON_INTRO : insActive ? CON1_INS_INTRO : CON1_WAITING;

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">🎬 {tx(CON1_HINT)}</p>
      <svg
        viewBox="0 0 640 360"
        className="block w-full select-none overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-b from-sky-100 to-sky-50"
        role="group"
        aria-label={tx(status)}
      >
        <defs>
          <linearGradient id="cqConMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1f5f9" />
            <stop offset="0.5" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <ellipse cx={320} cy={336} rx={272} ry={16} fill="#e2e8f0" />
        {/* the insulator guard (left) slides in from the left edge */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(CON1_INS_INTRO)}
          onClick={toggleIns}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              toggleIns();
            }
          }}
          style={{
            outline: 'none',
            cursor: 'pointer',
            transform: open ? 'translate(178px, 318px)' : 'translate(-260px, 318px)',
            transition: motion ? 'transform .8s cubic-bezier(.34,1.3,.64,1) .55s' : 'none',
          }}
        >
          <InsulatorGuard active={insActive} motion={motion} />
        </g>
        {/* the conductor hero (right — read first in RTL) slides in from the right edge */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(CON1_CON_INTRO)}
          onClick={toggleCon}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              toggleCon();
            }
          }}
          style={{
            outline: 'none',
            cursor: 'pointer',
            transform: open ? 'translate(462px, 318px)' : 'translate(800px, 318px)',
            transition: motion ? 'transform .8s cubic-bezier(.34,1.3,.64,1) .55s' : 'none',
          }}
        >
          <ConductorHero active={conActive} motion={motion} />
        </g>
        <Curtain open={open} motion={motion} />
      </svg>
      <p
        className={`text-center text-sm font-extrabold ${
          conActive && insActive ? 'text-violet-700' : conActive ? 'text-amber-600' : insActive ? 'text-teal-700' : 'text-slate-500'
        }`}
      >
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------------- page 2 · copper-slide */

const SLIDE2_HINT = L(
  'Hold your finger on the copper tube and drag — the electrons slide!',
  'انگشتت رو روی لولهٔ مسی نگه دار و بکش — الکترون‌ها سر می‌خورن!',
);
const SLIDE2_IDLE = L(
  'The electrons are waiting at the top of the copper water-slide… 🛝',
  'الکترون‌ها بالای سرسرهٔ آبیِ مسی منتظر اشارهٔ توئه… 🛝',
);
const SLIDE2_GO = L(
  'Whee! On the smooth copper slide the electrons whoosh down and the LED blinks happily! ⚡',
  'وای! روی سرسرهٔ صافِ مس الکترون‌ها تندتند سر می‌خورن و LED خوشحال چشمک می‌زنه! ⚡',
);

/** the copper slide: a transparent tube from the top-right to the bottom-left */
const SLIDE_P0 = { x: 596, y: 84 };
const SLIDE_P1 = { x: 330, y: 44 };
const SLIDE_P2 = { x: 60, y: 232 };
const SLIDE_PATH = `M ${SLIDE_P0.x} ${SLIDE_P0.y} Q ${SLIDE_P1.x} ${SLIDE_P1.y} ${SLIDE_P2.x} ${SLIDE_P2.y}`;
/** the slide + the happy leap out of the tube right into the LED's mouth */
const SLIDE_RIDE_PATH = `${SLIDE_PATH} Q 18 254 66 284`;

/** point on the quadratic slide bezier at parameter t */
function slidePoint(t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * SLIDE_P0.x + 2 * u * t * SLIDE_P1.x + t * t * SLIDE_P2.x,
    y: u * u * SLIDE_P0.y + 2 * u * t * SLIDE_P1.y + t * t * SLIDE_P2.y,
  };
}

/** a cute LED: dome + two legs; lights up with a blinking glow and can laugh */
function CuteLed({
  x,
  y,
  lit,
  blink = false,
  laugh = false,
  motion = true,
}: {
  x: number;
  y: number;
  lit: boolean;
  blink?: boolean;
  laugh?: boolean;
  motion?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit && (
        <>
          <circle r={28} fill="#fde047" opacity={0.28}>
            {motion && blink && <animate attributeName="opacity" values="0.1;0.42;0.1" dur="0.75s" repeatCount="indefinite" />}
          </circle>
          <circle r={44} fill="#fde047" opacity={0.13}>
            {motion && blink && <animate attributeName="opacity" values="0.04;0.26;0.04" dur="0.75s" begin="0.35s" repeatCount="indefinite" />}
          </circle>
        </>
      )}
      {/* legs */}
      <path d="M -8 12 V 34" stroke="#94a3b8" strokeWidth={4.5} strokeLinecap="round" />
      <path d="M 8 12 V 27" stroke="#64748b" strokeWidth={4.5} strokeLinecap="round" />
      {/* dome */}
      <path d="M -16 8 L -16 -2 A 16 16 0 0 1 16 -2 L 16 8 Z" fill={lit ? '#fde047' : '#e2e8f0'} stroke={lit ? '#eab308' : '#94a3b8'} strokeWidth={3} />
      <rect x={-19} y={8} width={38} height={7} rx={3.5} fill={lit ? '#f59e0b' : '#cbd5e1'} stroke={lit ? '#b45309' : '#94a3b8'} strokeWidth={2} />
      {lit ? (
        <>
          <circle cx={-6} cy={-7} r={2.6} fill="#713f12" />
          <circle cx={6} cy={-7} r={2.6} fill="#713f12" />
          {laugh ? (
            <path d="M -7 -1 Q 0 9 7 -1 Z" fill="#713f12" />
          ) : (
            <path d="M -6 0 Q 0 7 6 0" stroke="#713f12" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          )}
        </>
      ) : (
        <>
          <path d="M -9 -6 H -3 M 3 -6 H 9" stroke="#64748b" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M -4 2 Q 0 -1 4 2" stroke="#64748b" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <text x={20} y={-9} fontSize={13}>💤</text>
        </>
      )}
    </g>
  );
}

/** one smiling electron: queued & bobbing when idle, whooshing when riding.
 *  ⚠️ the idle wobble rotates a NESTED group — a SMIL animateTransform would
 *  otherwise replace the outer translate and park the electron at the origin. */
function SlideElectron({
  x,
  y,
  riding,
  index,
  motion = true,
}: {
  x: number;
  y: number;
  riding: boolean;
  index: number;
  motion?: boolean;
}) {
  return (
    <g transform={riding ? undefined : `translate(${x} ${y})`}>
      {riding && motion && <animateMotion dur="1.9s" begin={`-${index * 0.32}s`} repeatCount="indefinite" path={SLIDE_RIDE_PATH} />}
      <g>
        {!riding && motion && (
          <animateTransform attributeName="transform" type="rotate" values="-4;4;-4" dur={`${0.7 + index * 0.09}s`} repeatCount="indefinite" />
        )}
        <circle r={13} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.4} />
        <circle cx={-4.5} cy={-3} r={2.3} fill="#0c4a6e" />
        <circle cx={4.5} cy={-3} r={2.3} fill="#0c4a6e" />
        {riding ? (
          <ellipse cx={0} cy={4.5} rx={3.4} ry={4.6} fill="#0c4a6e" />
        ) : (
          <path d="M -4 3 Q 0 7 4 3" stroke="#0c4a6e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        )}
        <circle cx={-8.5} cy={3} r={2.2} fill="#fda4af" opacity={0.8} />
        <circle cx={8.5} cy={3} r={2.2} fill="#fda4af" opacity={0.8} />
      </g>
    </g>
  );
}

/** Page 2: hold & drag your finger on the transparent copper water-slide —
 *  the tube electrifies, the queued electrons whoosh down one by one, leap out
 *  of the tube and light the blinking LED. */
export function CopperSlideScene() {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [sliding, setSliding] = useState(false);
  const whooshTimer = useRef<number | null>(null);

  const start = () => {
    setSliding((was) => {
      if (was) return was;
      sfx.whoosh();
      whooshTimer.current = window.setInterval(() => sfx.whoosh(), 900);
      return true;
    });
  };
  const stop = () => {
    setSliding((was) => {
      if (!was) return was;
      if (whooshTimer.current !== null) {
        window.clearInterval(whooshTimer.current);
        whooshTimer.current = null;
      }
      sfx.sparkle();
      return false;
    });
  };
  useEffect(
    () => () => {
      if (whooshTimer.current !== null) window.clearInterval(whooshTimer.current);
    },
    [],
  );

  /** the queue: electrons stand at the TOP of the slide, waiting */
  const idleSpots = [0.02, 0.07, 0.12, 0.17, 0.22, 0.27].map(slidePoint);

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">🛝 {tx(SLIDE2_HINT)}</p>
      <svg
        viewBox="0 0 640 360"
        className={`block w-full touch-none select-none rounded-2xl border-2 border-slate-200 bg-sky-50 ${sliding ? 'cursor-grabbing' : 'cursor-grab'}`}
        role="button"
        tabIndex={0}
        aria-label={tx(sliding ? SLIDE2_GO : SLIDE2_IDLE)}
        onPointerDown={(e) => {
          e.preventDefault();
          start();
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') stop();
        }}
        style={{ outline: 'none' }}
      >
        <defs>
          <linearGradient id="cqCopper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="0.45" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <ellipse cx={320} cy={340} rx={280} ry={14} fill="#e2e8f0" />
        {/* support posts under the tube */}
        <rect x={402} y={100} width={14} height={236} rx={6} fill="#a16207" stroke="#854d0e" strokeWidth={2} />
        <rect x={242} y={144} width={14} height={192} rx={6} fill="#a16207" stroke="#854d0e" strokeWidth={2} />
        {/* the transparent copper tube: rim → copper body → glass interior → gloss */}
        <path d={SLIDE_PATH} fill="none" stroke="#92400e" strokeWidth={38} strokeLinecap="round" />
        <path d={SLIDE_PATH} fill="none" stroke="url(#cqCopper)" strokeWidth={30} strokeLinecap="round" />
        <path d={SLIDE_PATH} fill="none" stroke="#e0f2fe" strokeWidth={18} strokeLinecap="round" opacity={0.72} />
        <path
          d={`M ${SLIDE_P0.x - 4} ${SLIDE_P0.y - 8} Q ${SLIDE_P1.x - 4} ${SLIDE_P1.y - 12} ${SLIDE_P2.x + 2} ${SLIDE_P2.y - 9}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={0.55}
        />
        {/* the tube electrifies while sliding */}
        {sliding && (
          <path d={SLIDE_PATH} fill="none" stroke="#fde047" strokeWidth={36} strokeLinecap="round">
            {motion && <animate attributeName="opacity" values="0.08;0.45;0.08" dur="0.7s" repeatCount="indefinite" />}
          </path>
        )}
        {/* tube rims */}
        <circle cx={SLIDE_P0.x} cy={SLIDE_P0.y} r={19} fill="none" stroke="#78350f" strokeWidth={5} />
        <circle cx={SLIDE_P2.x} cy={SLIDE_P2.y} r={19} fill="none" stroke="#78350f" strokeWidth={5} />
        {/* start platform */}
        <rect x={556} y={92} width={84} height={13} rx={6.5} fill="#a16207" stroke="#854d0e" strokeWidth={2} />
        {/* the LED that receives the electrons (scaled up for the stage) */}
        <g transform="translate(80 298) scale(1.4)">
          <CuteLed x={0} y={0} lit={sliding} blink motion={motion} />
        </g>
        {sliding
          ? [0, 1, 2, 3, 4, 5].map((i) => <SlideElectron key={i} x={0} y={0} riding index={i} motion={motion} />)
          : idleSpots.map((pt, i) => <SlideElectron key={i} x={pt.x} y={pt.y} riding={false} index={i} motion={motion} />)}
        {sliding && motion && (
          <>
            <text x={300} y={70} fontSize={22} className="cq-float">✨</text>
            <text x={170} y={200} fontSize={18} className="cq-float" style={{ animationDelay: '0.5s' }}>💨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${sliding ? 'text-teal-700' : 'text-slate-500'}`}>
        {sliding ? tx(SLIDE2_GO) : tx(SLIDE2_IDLE)}
      </p>
    </div>
  );
}

/* ------------------------------------------------ page 3 · plastic-raincoat */

const COAT3_HINT = L(
  'Grab the zipper and pull it along the wire to zip the safety coat shut!',
  'زیپ رو بگیر و روی سیم بکش تا روپوشِ ایمنی بسته بشه!',
);
const COAT3_BARE = L(
  'Bare wire! The raging electricity around it can jump to your hand — careful! ⚠️',
  'سیم لخته! برقِ خروشانِ دورش ممکنه به دستت بپره — مواظب باش! ⚠️',
);
const COAT3_ZIPPING = L(
  'Keep pulling… the colourful safety coat is wrapping the wire! 🧤',
  'ادامه بده… روپوشِ رنگیِ ایمنی داره دور سیم پیچیده میشه! 🧤',
);
const COAT3_SAFE = L(
  'Zipped! A green safety halo — and the hand grips it with no sparks at all! 👍',
  'بسته شد! هالهٔ سبزِ ایمنی — و دست بدون هیچ جرقه‌ای راحت می‌گیرش! 👍',
);
const COAT3_ZIP_BTN = L('🧤 Zip the coat shut for me', '🧤 زیپ رو برام ببند');
const COAT3_UNZIP_BTN = L('🧨 Open the zipper again', '🧨 زیپ رو دوباره باز کن');

const WIRE_X0 = 140;
const WIRE_X1 = 520;
const WIRE_LEN = WIRE_X1 - WIRE_X0;
const WIRE_Y = 200;

/** the cartoon hand that slides in and grips the coated wire comfortably */
function GripHand({ shown, motion = true }: { shown: boolean; motion?: boolean }) {
  return (
    <g
      style={{
        transform: shown ? 'translate(0px, 0px)' : 'translate(-160px, 110px)',
        opacity: shown ? 1 : 0,
        transition: motion ? 'transform .6s cubic-bezier(.34,1.3,.64,1) .3s, opacity .4s ease .3s' : 'none',
      }}
    >
      <g transform="translate(320 262)">
        {/* the arm reaching up from below */}
        <rect x={-13} y={10} width={26} height={58} rx={13} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.5} transform="rotate(18)" />
        {/* palm */}
        <circle cx={0} cy={-16} r={16} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2.5} />
        {/* fingers wrapping over the coat — no sparks at all */}
        {[-11, -3.5, 4, 11.5].map((fx) => (
          <rect key={fx} x={fx - 3.2} y={-40} width={6.4} height={26} rx={3.2} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={1.8} />
        ))}
      </g>
    </g>
  );
}

/** Page 3: DRAG the zipper knob along the bare wire — the colourful plastic
 *  coat zips shut around it. Fully zipped → green safety halo, a cartoon hand
 *  grips the wire with no sparks and 👍 pops up. */
export function PlasticRaincoatScene() {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [zip, setZip] = useState(0);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zipRef = useRef(0);
  const lastTooth = useRef(0);
  const autoTimer = useRef<number | null>(null);
  const downPos = useRef({ x: 0, y: 0 });
  const movedFar = useRef(false);

  const setZipBoth = (z: number) => {
    zipRef.current = z;
    setZip(z);
  };
  const stopAuto = () => {
    if (autoTimer.current !== null) {
      window.clearInterval(autoTimer.current);
      autoTimer.current = null;
    }
  };
  useEffect(() => stopAuto, []);

  const tooth = () => {
    const now = Date.now();
    if (now - lastTooth.current > 130) {
      lastTooth.current = now;
      sfx.click();
    }
  };

  const completeZip = () => {
    stopAuto();
    setZipBoth(1);
    sfx.powerup();
    window.setTimeout(() => sfx.sparkle(), 420);
  };
  const autoZip = () => {
    if (autoTimer.current !== null) return;
    sfx.whoosh();
    autoTimer.current = window.setInterval(() => {
      const next = Math.min(1, zipRef.current + 0.055);
      setZipBoth(next);
      tooth();
      if (next >= 1) {
        stopAuto();
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 420);
      }
    }, 42);
  };
  const autoUnzip = () => {
    if (autoTimer.current !== null) return;
    sfx.click();
    autoTimer.current = window.setInterval(() => {
      const next = Math.max(0, zipRef.current - 0.07);
      setZipBoth(next);
      if (next <= 0) stopAuto();
    }, 42);
  };

  const svgPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 640, y: ((e.clientY - r.top) / r.height) * 360 };
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (!movedFar.current) {
      // a simple tap on the zipper: zip it fully (or reopen it)
      if (zipRef.current < 0.97) completeZip();
      else autoUnzip();
      return;
    }
    if (zipRef.current >= 0.97) completeZip();
    else if (zipRef.current <= 0.03) setZipBoth(0);
  };

  const covered = WIRE_X1 - zip * WIRE_LEN; // the coat covers covered..WIRE_X1
  const done = zip >= 1;

  const status = done ? COAT3_SAFE : zip <= 0 ? COAT3_BARE : COAT3_ZIPPING;

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">🧤 {tx(COAT3_HINT)}</p>
      <svg
        ref={svgRef}
        viewBox="0 0 640 360"
        className={`block w-full touch-none select-none rounded-2xl border-2 border-slate-200 bg-sky-50 ${dragging ? 'cursor-grabbing' : ''}`}
        role="group"
        aria-label={tx(status)}
        onPointerMove={(e) => {
          if (!dragging) return;
          const p = svgPoint(e);
          if (!p) return;
          if (Math.hypot(e.clientX - downPos.current.x, e.clientY - downPos.current.y) > 12) movedFar.current = true;
          const z = Math.min(1, Math.max(0, (WIRE_X1 - p.x) / WIRE_LEN));
          if (Math.abs(z - zipRef.current) > 0.012) tooth();
          setZipBoth(z);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setDragging(false)}
      >
        <defs>
          <linearGradient id="cqWireCore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="0.5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <clipPath id="cqCoatClip">
            <rect x={covered - 8} y={164} width={WIRE_X1 - covered + 28} height={72} rx={34} />
          </clipPath>
        </defs>
        <ellipse cx={320} cy={330} rx={272} ry={15} fill="#e2e8f0" />
        {/* the raging electricity halo around the still-bare part */}
        {!done &&
          [180, 250, 320]
            .filter((sx) => sx < covered - 20)
            .map((sx, i) => (
              <g key={sx}>
                <text x={sx} y={148} fontSize={19} textAnchor="middle">
                  ⚡
                  {motion && <animate attributeName="opacity" values="1;0.3;1" dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite" />}
                </text>
                <path
                  d={`M ${sx - 26} 180 q 8 -10 0 -20 M ${sx + 26} 224 q -8 10 0 20`}
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.65}
                >
                  {motion && <animate attributeName="opacity" values="0.65;0.2;0.65" dur={`${0.9 + i * 0.15}s`} repeatCount="indefinite" />}
                </path>
              </g>
            ))}
        {!done && (
          <text x={170} y={104} fontSize={26} textAnchor="middle">
            ⚠️
            {motion && <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />}
          </text>
        )}
        {/* the bare copper wire */}
        <rect x={WIRE_X0} y={WIRE_Y - 17} width={WIRE_LEN} height={34} rx={16} fill="#92400e" />
        <rect x={WIRE_X0 + 4} y={WIRE_Y - 13} width={WIRE_LEN - 8} height={26} rx={13} fill="url(#cqWireCore)" />
        <rect x={WIRE_X0 + 14} y={WIRE_Y - 9} width={WIRE_LEN - 28} height={8} rx={4} fill="#fef3c7" opacity={0.45} />
        {/* electrons running inside — drawn BEFORE the coat so the coat hides them */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle r={11} fill="#38bdf8" stroke="#0369a1" strokeWidth={2}>
              {motion && <animateMotion dur="2.4s" begin={`-${i * 0.8}s`} repeatCount="indefinite" path={`M ${WIRE_X1 - 14} ${WIRE_Y} H ${WIRE_X0 + 14}`} />}
            </circle>
          </g>
        ))}
        {/* the colourful plastic coat sleeve, zipping shut right → left (RTL) */}
        <rect x={covered - 8} y={164} width={WIRE_X1 - covered + 28} height={72} rx={34} fill="#fb7185" stroke="#e11d48" strokeWidth={3.5} />
        <g clipPath="url(#cqCoatClip)">
          {['#fb7185', '#fbbf24', '#34d399', '#38bdf8', '#a78bfa'].map((c, i) => (
            <rect key={c} x={covered - 8} y={164 + i * 14.4} width={WIRE_X1 - covered + 28} height={14.4} fill={c} opacity={0.55} />
          ))}
        </g>
        {/* right end-cap ring of the coat */}
        <rect x={WIRE_X1 + 8} y={168} width={14} height={64} rx={7} fill="#fbbf24" stroke="#d97706" strokeWidth={3} />
        {/* the coat's happy face once fully zipped (left of the gripping hand) */}
        {done && (
          <g transform="translate(228 200)">
            <circle cx={-16} cy={-8} r={4.4} fill="#881337" />
            <circle cx={16} cy={-8} r={4.4} fill="#881337" />
            <path d="M -10 4 Q 0 14 10 4" stroke="#881337" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* little windows: the electrons stay safe inside the coat */}
        {[430, 480]
          .filter((wx) => wx > covered + 22)
          .map((wx) => (
            <g key={wx}>
              <circle cx={wx} cy={WIRE_Y} r={10} fill="#bae6fd" stroke="#f8fafc" strokeWidth={2.5} />
              <circle cx={wx} r={5.5} fill="#0284c7" cy={WIRE_Y}>
                {motion && <animate attributeName="cy" values={`${WIRE_Y - 3};${WIRE_Y + 3};${WIRE_Y - 3}`} dur="1s" repeatCount="indefinite" />}
              </circle>
            </g>
          ))}
        {/* zipper track + teeth along the coat's top edge */}
        <line x1={covered + 6} y1={168} x2={WIRE_X1 + 4} y2={168} stroke="#7c2d12" strokeWidth={2.5} strokeDasharray="4 4" opacity={0.8} />
        {/* the draggable zipper knob */}
        <g
          transform={`translate(${covered + 2} 168)`}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          role="button"
          tabIndex={0}
          aria-label={tx(done ? COAT3_UNZIP_BTN : COAT3_ZIP_BTN)}
          onPointerDown={(e) => {
            e.preventDefault();
            stopAuto();
            setDragging(true);
            movedFar.current = false;
            downPos.current = { x: e.clientX, y: e.clientY };
          }}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              if (done) autoUnzip();
              else completeZip();
            }
          }}
        >
          <circle r={30} fill="transparent" />
          <rect x={-7} y={-8} width={14} height={18} rx={4} fill="#fbbf24" stroke="#b45309" strokeWidth={2.5} />
          <path d="M 0 -8 V -24" stroke="#b45309" strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={0} cy={-29} r={5} fill="none" stroke="#b45309" strokeWidth={3} />
          {zip < 0.05 && !dragging && (
            <text x={-2} y={-46} fontSize={19} textAnchor="middle">
              👇
              {motion && <animate attributeName="opacity" values="1;0.35;1" dur="1.1s" repeatCount="indefinite" />}
            </text>
          )}
        </g>
        {/* the green safety halo once fully zipped */}
        {done && (
          <g>
            <rect x={WIRE_X0 - 26} y={140} width={WIRE_LEN + 60} height={120} rx={60} fill="none" stroke="#22c55e" strokeWidth={5}>
              {motion && <animate attributeName="opacity" values="0.35;0.85;0.35" dur="1.4s" repeatCount="indefinite" />}
            </rect>
            <text x={560} y={122} fontSize={26} className="cq-pop">
              👍
            </text>
            {motion && <text x={250} y={120} fontSize={20} className="cq-float">✨</text>}
          </g>
        )}
        <GripHand shown={done} motion={motion} />
      </svg>
      <p className={`text-center text-sm font-extrabold ${done ? 'text-teal-700' : zip <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>
        {tx(status)}
      </p>
      <Button
        onClick={() => {
          if (done) autoUnzip();
          else completeZip();
        }}
        className={`h-12 w-full font-extrabold ${done ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
      >
        {done ? tx(COAT3_UNZIP_BTN) : tx(COAT3_ZIP_BTN)}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------- page 4 · material-lab */

const LAB4_HINT = L(
  'Drag each object into the gap between the wires and test it, detective!',
  'هر وسیله رو بکش و بنداز وسط شکاف سیم‌ها تا آزمایشش کنی، کارآگاه!',
);
const LAB4_EMPTY = L(
  'The road is open! Drag an object from the shelf into the gap! 🔍',
  'جاده بازه! یک وسیله از قفسه بردار و بکش وسط شکاف! 🔍',
);
const LAB4_KEY = L(
  '🔑 Click! The LED lit up and laughed — the metal key is a conductor! ✨',
  '🔑 کلینک! LED روشن شد و خندید — کلید فلزی رسانا است! ✨',
);
const LAB4_COIN = L(
  '🪙 Click! The LED lit up and laughed — the metal coin is a conductor! ✨',
  '🪙 کلینک! LED روشن شد و خندید — سکهٔ فلزی رسانا است! ✨',
);
const LAB4_PENCIL = L(
  '✏️ Silence… the electrons stopped — the wooden pencil is an insulator! 🛑',
  '✏️ سکوت… الکترون‌ها ایستادند — مداد چوبی عایق است! 🛑',
);
const LAB4_RULER = L(
  '📏 Silence… the electrons stopped — the plastic ruler is an insulator! 🛑',
  '📏 سکوت… الکترون‌ها ایستادند — خط‌کش پلاستیکی عایق است! 🛑',
);
const LAB4_KEY_BTN = L('🔑 Metal key', '🔑 کلید فلزی');
const LAB4_COIN_BTN = L('🪙 Coin', '🪙 سکه');
const LAB4_PENCIL_BTN = L('✏️ Wooden pencil', '✏️ مداد چوبی');
const LAB4_RULER_BTN = L('📏 Plastic ruler', '📏 خط‌کش پلاستیکی');
const LAB4_REMOVE = L('Take the object off the gap', 'وسیله رو از شکاف بردار');

type LabItem = 'key' | 'coin' | 'pencil' | 'ruler' | null;

/** the gap of the open circuit — the drop target */
const LAB_GAP = { x: 340, y: 95 };
const LAB_ITEMS: { id: Exclude<LabItem, null>; x: number }[] = [
  { id: 'key', x: 100 },
  { id: 'coin', x: 246 },
  { id: 'pencil', x: 392 },
  { id: 'ruler', x: 538 },
];
const LAB_BTN: Record<Exclude<LabItem, null>, LocaleText> = {
  key: LAB4_KEY_BTN,
  coin: LAB4_COIN_BTN,
  pencil: LAB4_PENCIL_BTN,
  ruler: LAB4_RULER_BTN,
};

/** the object artwork, drawn centred on (0,0) */
function LabObjectArt({ item }: { item: Exclude<LabItem, null> }) {
  if (item === 'key') {
    return (
      <g>
        <circle cx={-30} cy={0} r={15} fill="none" stroke="#eab308" strokeWidth={8} />
        <circle cx={-30} cy={0} r={15} fill="none" stroke="#fde047" strokeWidth={3} />
        <rect x={-18} y={-4} width={54} height={8} rx={4} fill="#eab308" stroke="#ca8a04" strokeWidth={1.5} />
        <rect x={26} y={0} width={8} height={13} rx={3} fill="#eab308" stroke="#ca8a04" strokeWidth={1.5} />
        <rect x={13} y={0} width={8} height={10} rx={3} fill="#eab308" stroke="#ca8a04" strokeWidth={1.5} />
      </g>
    );
  }
  if (item === 'coin') {
    return (
      <g>
        <circle r={19} fill="#fbbf24" stroke="#b45309" strokeWidth={3} />
        <circle r={13.5} fill="none" stroke="#d97706" strokeWidth={2} strokeDasharray="3 3" />
        <text x={0} y={5.5} fontSize={15} fontWeight={800} fill="#92400e" textAnchor="middle">
          ۱
        </text>
      </g>
    );
  }
  if (item === 'pencil') {
    return (
      <g>
        <rect x={-44} y={-7} width={70} height={14} rx={3} fill="#fbbf24" stroke="#d97706" strokeWidth={2} />
        <rect x={-44} y={-7} width={70} height={5} fill="#fde68a" opacity={0.8} />
        <path d="M 26 -7 L 44 0 L 26 7 Z" fill="#f5d0a9" stroke="#d97706" strokeWidth={2} />
        <path d="M 37 -3.4 L 44 0 L 37 3.4 Z" fill="#334155" />
        <rect x={-54} y={-7} width={11} height={14} rx={4} fill="#fb7185" stroke="#e11d48" strokeWidth={2} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-48} y={-13} width={96} height={26} rx={6} fill="#e0f2fe" stroke="#0284c7" strokeWidth={2.5} opacity={0.95} />
      {[-34, -22, -10, 2, 14, 26, 38].map((tx, i) => (
        <line key={tx} x1={tx} y1={i % 2 ? -6 : -13} x2={tx} y2={6} stroke="#0284c7" strokeWidth={i % 2 ? 1.6 : 2.4} />
      ))}
    </g>
  );
}

/** the STOP sign the electrons hold up in front of an insulator */
function StopSign({ motion = true }: { motion?: boolean }) {
  return (
    <g transform="translate(398 60)">
      <line x1={0} y1={14} x2={0} y2={33} stroke="#334155" strokeWidth={3} strokeLinecap="round" />
      <g className={motion ? 'cq-float' : ''}>
        <path d="M -13 -8 L -8 -13 L 8 -13 L 13 -8 L 13 8 L 8 13 L -8 13 L -13 8 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
        <text x={0} y={4.5} fontSize={10.5} fontWeight={800} fill="#ffffff" textAnchor="middle" style={{ fontFamily: 'Arial, sans-serif' }}>
          STOP
        </text>
      </g>
    </g>
  );
}

/** one queued electron waiting angrily in front of an insulator */
function LabQueueElectron({ x, i, motion = true }: { x: number; i: number; motion?: boolean }) {
  return (
    <g transform={`translate(${x} ${LAB_GAP.y})`}>
      <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.35}s` }}>
        <circle r={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
        <circle cx={-3.5} cy={-2} r={1.8} fill="#0c4a6e" />
        <circle cx={3.5} cy={-2} r={1.8} fill="#0c4a6e" />
        <path d="M -6 -7 L -2 -5 M 6 -7 L 2 -5" stroke="#0c4a6e" strokeWidth={1.4} strokeLinecap="round" />
        <path d="M -3 3 Q 0 6 3 3" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Page 4: the detective lab — DRAG & DROP the key / coin / pencil / ruler from
 *  the shelf into the circuit gap. Metals connect the road: the electrons race
 *  the full loop and the laughing LED lights up. Insulators stop the electrons
 *  (they hold a STOP sign) and the LED stays asleep. */
export function MaterialLabScene() {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [item, setItem] = useState<LabItem>(null);
  const [drag, setDrag] = useState<{ id: Exclude<LabItem, null>; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragMoved = useRef(false);
  const lit = item === 'key' || item === 'coin';
  const isInsulator = item === 'pencil' || item === 'ruler';

  const svgPoint = (e: React.PointerEvent): { x: number; y: number } | null => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 640, y: ((e.clientY - r.top) / r.height) * 360 };
  };

  const place = (id: Exclude<LabItem, null>) => {
    if (item === id) {
      setItem(null);
      sfx.click();
      return;
    }
    setItem(id);
    if (id === 'pencil' || id === 'ruler') {
      sfx.whirr();
      window.setTimeout(() => sfx.click(), 260);
    } else {
      sfx.powerup();
      window.setTimeout(() => sfx.sparkle(), 380);
    }
  };

  const startDrag = (id: Exclude<LabItem, null>) => (e: React.PointerEvent) => {
    e.preventDefault();
    dragMoved.current = false;
    const p = svgPoint(e);
    setDrag({ id, x: p?.x ?? 0, y: p?.y ?? 0 });
    sfx.pop();
  };

  const endDrag = () => {
    if (!drag) return;
    const near = Math.hypot(drag.x - LAB_GAP.x, drag.y - LAB_GAP.y) < 82;
    if (near || !dragMoved.current) place(drag.id);
    else sfx.click();
    setDrag(null);
    dragMoved.current = false;
  };

  /** the full electron loop (used when a conductor bridges the gap) */
  const LOOP = 'M 556 170 V 95 H 96 V 252 H 556 V 218';
  const status = item === 'key' ? LAB4_KEY : item === 'coin' ? LAB4_COIN : item === 'pencil' ? LAB4_PENCIL : item === 'ruler' ? LAB4_RULER : LAB4_EMPTY;

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">🔍 {tx(LAB4_HINT)}</p>
      <svg
        ref={svgRef}
        viewBox="0 0 640 360"
        className="block w-full touch-none select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="group"
        aria-label={tx(status)}
        onPointerMove={(e) => {
          if (!drag) return;
          const p = svgPoint(e);
          if (!p) return;
          if (Math.hypot(p.x - drag.x, p.y - drag.y) > 4) dragMoved.current = true;
          setDrag({ ...drag, x: p.x, y: p.y });
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          setDrag(null);
          dragMoved.current = false;
        }}
      >
        <defs>
          <linearGradient id="cqLabWire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#64748b" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
        {/* the wooden lab desk */}
        <rect x={36} y={252} width={568} height={50} rx={12} fill="#d6a06a" stroke="#a16207" strokeWidth={3} />
        <rect x={36} y={252} width={568} height={11} rx={5.5} fill="#e7bd8b" opacity={0.7} />
        {/* the objects shelf */}
        <rect x={36} y={330} width={568} height={22} rx={10} fill="#b98756" stroke="#854d0e" strokeWidth={2.5} />
        {/* wires: LED (left) → top tip, gap, battery (right); continuous bottom */}
        <path d="M 96 168 V 95 H 302" fill="none" stroke="url(#cqLabWire)" strokeWidth={7} strokeLinecap="round" />
        <path d="M 378 95 H 556 V 170" fill="none" stroke="url(#cqLabWire)" strokeWidth={7} strokeLinecap="round" />
        <path d="M 96 220 V 252 H 556 V 218" fill="none" stroke="url(#cqLabWire)" strokeWidth={7} strokeLinecap="round" />
        {/* the battery (right) */}
        <g transform="translate(556 187)">
          <rect x={-16} y={-34} width={32} height={68} rx={7} fill="#22c55e" stroke="#15803d" strokeWidth={3} />
          <rect x={-8} y={-42} width={16} height={10} rx={3} fill="#86efac" stroke="#15803d" strokeWidth={2} />
          <text x={-7} y={-12} fontSize={15} fontWeight={800} fill="#14532d">+</text>
          <text x={1} y={28} fontSize={15} fontWeight={800} fill="#14532d">−</text>
        </g>
        {/* the LED (left) */}
        <CuteLed x={96} y={182} lit={lit} laugh motion={motion} />
        {/* the bare tips + the inviting gap */}
        <circle cx={302} cy={95} r={6} fill="#f59e0b" stroke="#92400e" strokeWidth={2} />
        <circle cx={378} cy={95} r={6} fill="#f59e0b" stroke="#92400e" strokeWidth={2} />
        {!item && !drag && (
          <>
            <circle cx={LAB_GAP.x} cy={LAB_GAP.y} r={40} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="6 8">
              {motion && <animate attributeName="r" values="36;46;36" dur="1.3s" repeatCount="indefinite" />}
            </circle>
            <text x={LAB_GAP.x} y={46} fontSize={20} textAnchor="middle">
              👇
            </text>
          </>
        )}
        {/* the drop zone glows while dragging */}
        {drag && (
          <circle cx={LAB_GAP.x} cy={LAB_GAP.y} r={54} fill="none" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="7 7">
            {motion && <animate attributeName="r" values="48;58;48" dur="1s" repeatCount="indefinite" />}
          </circle>
        )}
        {/* the tested object bridging the gap */}
        {item && (
          <g
            role="button"
            aria-label={tx(LAB4_REMOVE)}
            style={{ cursor: 'pointer' }}
            onClick={() => place(item)}
          >
            <ellipse cx={LAB_GAP.x} cy={LAB_GAP.y + 26} rx={44} ry={7} fill="#0f172a" opacity={0.08} />
            <g transform={`translate(${LAB_GAP.x} ${LAB_GAP.y})`}>
              <LabObjectArt item={item} />
            </g>
          </g>
        )}
        {/* the electrons: race the full loop on a conductor, queue + STOP on an insulator */}
        {lit &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} r={7.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.6}>
              {motion && <animateMotion dur="2.6s" begin={`-${(i / 6) * 2.6}s`} repeatCount="indefinite" path={LOOP} />}
            </circle>
          ))}
        {isInsulator && (
          <>
            {[426, 454, 482].map((qx, i) => (
              <LabQueueElectron key={qx} x={qx} i={i} motion={motion} />
            ))}
            <StopSign motion={motion} />
          </>
        )}
        {(lit || isInsulator) && motion && (
          <text x={LAB_GAP.x} y={54} fontSize={19} textAnchor="middle" className="cq-float">
            {lit ? '✨' : '🛑'}
          </text>
        )}
        {/* the tray objects — drag them up into the gap */}
        {LAB_ITEMS.map(({ id, x }) => (
          <g
            key={id}
            transform={`translate(${x} 318) scale(0.78)`}
            role="button"
            tabIndex={0}
            aria-label={tx(LAB_BTN[id])}
            style={{ cursor: 'grab', outline: 'none' }}
            onPointerDown={startDrag(id)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                place(id);
              }
            }}
          >
            {item === id ? (
              <rect x={-56} y={-30} width={112} height={58} rx={12} fill="none" stroke="#94a3b8" strokeDasharray="5 5" opacity={0.7} />
            ) : null}
            <LabObjectArt item={id} />
            {item === id && (
              <text x={0} y={-36} fontSize={15} textAnchor="middle" opacity={0.65}>
                ✓
              </text>
            )}
          </g>
        ))}
        {/* the ghost that follows the finger while dragging */}
        {drag && (
          <g transform={`translate(${drag.x} ${drag.y}) scale(1.1)`} style={{ pointerEvents: 'none' }}>
            <ellipse cx={0} cy={30} rx={46} ry={8} fill="#0f172a" opacity={0.12} />
            <LabObjectArt item={drag.id} />
          </g>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${lit ? 'text-teal-700' : isInsulator ? 'text-rose-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------------- page 1 · voltage-hero */

const VOLT1_HINT = L(
  'Tap the voltage hero to push the electrons forward!',
  'روی قهرمان ولتاژ بزن تا الکترون‌ها رو به جلو هول بده!',
);
const VOLT1_IDLE = L(
  'The voltage hero stands behind the electrons, full of energy — tap him to give them a push! ⚡',
  'قهرمانِ ولتاژ پشت الکترون‌ها ایستاده و پر از انرژیه؛ لمسش کن تا بهشون انرژی بده و هولشون بده! ⚡',
);
const VOLT1_PUSH = L(
  'Push! Push! The voltage gives the electrons energy and shoves them forward! 💨',
  'هول! هول! ولتاژ به الکترون‌ها انرژی میده و اون‌ها رو به جلو می‌فرسته! 💨',
);
const VOLT1_DONE = L(
  'They made it! The lamp turned on — voltage is the kind, strong pusher of the electrons! ✨',
  'رسیدند! چراغ روشن شد؛ ولتاژ یعنی همون هل‌دهندهٔ مهربون و قویِ الکترون‌ها! ✨',
);
const VOLT1_SHOUT = L('Come on kids, run forward with power!', 'یالا بچه‌ها، با قدرت به جلو بدوید!');

/** electron x positions for every push stage (RTL journey: right → left) */
const VOLT1_STAGES = [
  [500, 452, 404],
  [300, 252, 204],
  [148, 114, 84],
] as const;

/** one smiling electron standing on the wire road */
function VoltElectron({ x, y = 222, motion = true, delay = 0 }: { x: number; y?: number; motion?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${delay}s` }}>
        <circle cx={0} cy={0} r={14} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.4} />
        <circle cx={-4.2} cy={-2.4} r={2.2} fill="#0c4a6e" />
        <circle cx={4.2} cy={-2.4} r={2.2} fill="#0c4a6e" />
        <path d="M -4 3 Q 0 7 4 3" stroke="#0c4a6e" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <circle cx={-7.5} cy={4} r={2.2} fill="#fda4af" opacity={0.8} />
        <circle cx={7.5} cy={4} r={2.2} fill="#fda4af" opacity={0.8} />
      </g>
    </g>
  );
}

/** the friendly strong voltage superhero (local coords: feet at 0,0) */
function VoltageHero({ pushing, motion = true }: { pushing: boolean; motion?: boolean }) {
  return (
    <g transform={`translate(${pushing ? -20 : 0} 0)`} style={{ transition: motion ? 'transform .28s ease-out' : 'none' }}>
      {/* cape */}
      <path d="M -30 -96 Q -62 -40 -44 6 Q -22 -8 -8 -2 Q -22 -44 -14 -92 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth={2.5} />
      {/* strong body */}
      <rect x={-30} y={-92} width={60} height={62} rx={22} fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
      <rect x={-30} y={-92} width={60} height={26} rx={20} fill="#fbbf24" opacity={0.55} />
      {/* pushing arm (stretched forward, to the left) */}
      <rect x={-64} y={-72} width={44} height={17} rx={8.5} fill="#f59e0b" stroke="#b45309" strokeWidth={2.6}
        transform={pushing ? 'rotate(8 -40 -64)' : 'rotate(-6 -40 -64)'}
        style={{ transition: motion ? 'transform .28s ease-out' : 'none' }} />
      {/* other arm on the hip */}
      <rect x={16} y={-74} width={17} height={40} rx={8.5} fill="#f59e0b" stroke="#b45309" strokeWidth={2.6} transform="rotate(24 24 -70)" />
      {/* belt */}
      <rect x={-30} y={-44} width={60} height={13} rx={6} fill="#7c2d12" />
      <rect x={-9} y={-47} width={18} height={19} rx={4} fill="#fde047" stroke="#b45309" strokeWidth={2} />
      {/* legs + boots */}
      <rect x={-22} y={-32} width={15} height={28} rx={7} fill="#b45309" />
      <rect x={7} y={-32} width={15} height={28} rx={7} fill="#b45309" />
      <rect x={-26} y={-8} width={22} height={10} rx={5} fill="#7c2d12" />
      <rect x={4} y={-8} width={22} height={10} rx={5} fill="#7c2d12" />
      {/* head with hero headband */}
      <circle cx={0} cy={-110} r={21} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2.5} />
      <rect x={-21} y={-122} width={42} height={10} rx={5} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
      <path d="M -3 -121 L 4 -119 L -1 -114" stroke="#fde047" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pushing ? (
        <path d="M -12 -104 Q 0 -95 12 -104" stroke="#78350f" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -10 -102 Q -5 -97 0 -102 Q 5 -97 10 -102" stroke="#78350f" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      )}
      <circle cx={-8} cy={-107} r={2.6} fill="#78350f" />
      <circle cx={8} cy={-107} r={2.6} fill="#78350f" />
    </g>
  );
}

/** Page 1: tap the voltage hero — he pushes the electrons along the wire road. */
export function VoltageHeroScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [stage, setStage] = useState(0); // 0 waiting · 1 pushed once · 2 arrived
  const [shout, setShout] = useState(false);
  const shoutTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (shoutTimer.current !== null) window.clearTimeout(shoutTimer.current);
  }, []);

  const push = () => {
    if (shoutTimer.current !== null) window.clearTimeout(shoutTimer.current);
    setStage((was) => {
      const next = was >= 2 ? 0 : was + 1;
      if (next === 0) sfx.whoosh();
      else {
        sfx.powerup();
        if (next === 2) window.setTimeout(() => sfx.sparkle(), 400);
      }
      return next;
    });
    setShout(true);
    shoutTimer.current = window.setTimeout(() => setShout(false), 1400);
  };

  const arrived = stage === 2;
  const status = arrived ? VOLT1_DONE : stage === 1 ? VOLT1_PUSH : VOLT1_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A friendly strong superhero pushing cute blue electrons along a glowing circuit track', 'قهرمان مهربون و قوی که الکترون‌های آبیِ بامزه را روی جادهٔ مدارِ روشن به جلو هول میدهد'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🌊 {tx(VOLT1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={push}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            push();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the shout bubble */}
        {shout && (
          <g>
            <rect x={286} y={30} width={280} height={38} rx={19} fill="#fffbeb" stroke="#f59e0b" strokeWidth={2.5} />
            <path d="M 520 66 L 536 84 L 544 64 Z" fill="#fffbeb" stroke="#f59e0b" strokeWidth={2.5} strokeLinejoin="round" />
            <text x={426} y={55} fontSize={14.5} fontWeight="bold" textAnchor="middle" fill="#92400e">{tx(VOLT1_SHOUT)}</text>
          </g>
        )}
        {/* the glowing wire road */}
        <rect x={52} y={236} width={576} height={28} rx={14} fill="#475569" />
        <rect x={60} y={242} width={560} height={8} rx={4} fill="#94a3b8" opacity={0.8} />
        {stage > 0 && !arrived && (
          <rect x={60} y={242} width={560} height={8} rx={4} fill="#67e8f9">
            {motion && <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.8s" repeatCount="indefinite" />}
          </rect>
        )}
        {/* the lamp at the end of the road (left) */}
        <rect x={58} y={196} width={10} height={44} rx={5} fill="#64748b" />
        <circle cx={63} cy={178} r={20} fill={arrived ? '#fde047' : '#e2e8f0'} stroke={arrived ? '#eab308' : '#94a3b8'} strokeWidth={3} />
        {arrived && (
          <>
            {motion && (
              <circle cx={63} cy={178} r={27} fill="#fde047" opacity={0.3}>
                <animate attributeName="r" values="24;34;24" dur="0.9s" repeatCount="indefinite" />
              </circle>
            )}
            <path d="M 60 170 L 55 182 L 62 182 L 58 192" stroke="#b45309" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {/* the electrons (outer g positions, inner g floats) */}
        {VOLT1_STAGES[stage].map((x, i) => (
          <g
            key={i}
            transform={`translate(${x} 0)`}
            style={{ transition: motion ? 'transform .5s cubic-bezier(.34,1.3,.64,1)' : 'none' }}
          >
            <VoltElectron x={0} motion={motion} delay={i * 0.35} />
          </g>
        ))}
        {arrived && motion && (
          <>
            <text x={150} y={170} fontSize={22} className="cq-float">✨</text>
            <text x={230} y={150} fontSize={17} className="cq-float" style={{ animationDelay: '0.45s' }}>🌟</text>
          </>
        )}
        {/* the voltage hero behind the queue (right side) */}
        <g transform="translate(566 254)">
          <g className={motion && stage === 0 ? 'cq-float' : ''} style={{ animationDuration: '2.4s' }}>
            <VoltageHero pushing={shout} motion={motion} />
          </g>
        </g>
        {!arrived && stage === 0 && motion && (
          <text x={566} y={104} fontSize={24} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        <ellipse cx={320} cy={296} rx={260} ry={14} fill="#e2e8f0" />
      </svg>
      <p className={`text-center text-sm font-extrabold ${arrived ? 'text-teal-700' : stage === 1 ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------------- page 2 · water-pressure */

const WATER2_HINT = L(
  'Raise the water tank higher and watch how the pressure grows!',
  'ارتفاع منبع آب رو ببر بالا تا ببینی چطور فشار زیاد میشه!',
);
const WATER2_L0 = L(
  'The tank is low: the water drips out calm and low-pressure, and the electrons stroll along lazily 🕊️',
  'منبع آب پایینه؛ آب آروم و کم‌فشار می‌ریزه و الکترون‌ها هم آروم و بی‌عجله می‌رن 🕊️',
);
const WATER2_L1 = L(
  'Higher! The water pressure grew — the electrons run faster and the lamp shines brighter! 💨',
  'بالاتر رفت! فشار آب بیشتر شد؛ الکترون‌ها هم تندتر دویدند و چراغ درخشان‌تر شد! 💨',
);
const WATER2_L2 = L(
  'Wow! A very high tank means very strong pressure! A high-pressure battery shoves the electrons hard so the lamp shines strong and bright! ⚡✨',
  'وای! منبعِ خیلی بالا یعنی فشارِ خیلی زیاد! باتریِ پرفشار هم الکترون‌ها رو محکم هول میده تا چراغ محکم و درخشان بدرخشه! ⚡✨',
);
const WATER2_BTN = [L('⬆️ Raise the water tank', '⬆️ منبع آب رو ببر بالا'), L('⬆️ Even higher!', '⬆️ باز هم بالاتر ببر!'), L('⬇️ Bring it back down', '⬇️ برگردونش پایین')];
const WATER2_TANK_LABEL = L('💧 Water tank', '💧 منبع آب');
const WATER2_BATTERY_LABEL = L('🔋 Battery', '🔋 باتری');

/** tank platform y for every level (base level drawn at 216) */
const WATER2_LEVEL_Y = [216, 178, 140] as const;
/** the little circuit loop the electrons run around */
const WATER2_LOOP = 'M 128 224 V 136 Q 128 110 150 110 Q 172 110 172 136 V 224 Q 172 246 150 246 Q 128 246 128 224 Z';
/** the water jet path for every level */
const WATER2_JETS = [
  'M 408 268 Q 380 276 354 292',
  'M 408 268 Q 356 256 306 296',
  'M 408 268 Q 378 206 342 192',
] as const;
const WATER2_JET_W = [5, 8, 11] as const;

/** Page 2: raise the rooftop water tank — more height, more pressure, faster electrons. */
export function WaterPressureScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [level, setLevel] = useState(0);

  const cycle = () => {
    setLevel((was) => {
      const next = was >= 2 ? 0 : was + 1;
      if (next === 0) sfx.click();
      else if (next === 1) sfx.whoosh();
      else {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      }
      return next;
    });
  };

  const platformY = WATER2_LEVEL_Y[level];
  const rise = platformY - WATER2_LEVEL_Y[0];
  const jetDurNum = [2.6, 1.5, 0.8][level];
  const jetDur = `${jetDurNum}s`;
  const status = level === 0 ? WATER2_L0 : level === 1 ? WATER2_L1 : WATER2_L2;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A water tank on a tall tower spraying water with high pressure beside a battery pushing electrons through a wire', 'منبع آب روی برج بلند که آب را با فشار زیاد می‌پاشد، کنار باتری که الکترون‌ها را با قدرت داخل سیم هول میدهد'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🚰 {tx(WATER2_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <defs>
          <linearGradient id="cqWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* divider between the two halves */}
        <line x1={320} y1={44} x2={320} y2={284} stroke="#cbd5e1" strokeWidth={2.5} strokeDasharray="8 9" />
        {/* ground */}
        <rect x={16} y={290} width={608} height={13} rx={6.5} fill="#e2e8f0" />

        {/* ===== right half: the water tower (drawn at base, lifted by rise) ===== */}
        {/* static back frame */}
        <rect x={446} y={98} width={11} height={192} rx={5} fill="#94a3b8" />
        <rect x={524} y={98} width={11} height={192} rx={5} fill="#94a3b8" />
        <rect x={452} y={150} width={76} height={8} rx={4} fill="#cbd5e1" />
        <rect x={452} y={216} width={76} height={8} rx={4} fill="#cbd5e1" />
        {/* rising center column */}
        <rect x={477} y={platformY + 10} width={24} height={280 - platformY} rx={8} fill="#a16207"
          style={{ transition: motion ? 'y .6s ease, height .6s ease' : 'none' }} />
        {/* the tank group (rides up and down) */}
        <g transform={`translate(0 ${rise})`} style={{ transition: motion ? 'transform .6s cubic-bezier(.34,1.2,.64,1)' : 'none' }}>
          <rect x={431} y={216} width={116} height={12} rx={6} fill="#a16207" />
          {/* tank body */}
          <rect x={439} y={152} width={104} height={64} rx={18} fill="#e0f2fe" stroke="#0369a1" strokeWidth={3} />
          <rect x={445} y={176} width={92} height={36} rx={12} fill="url(#cqWater)" opacity={0.9} />
          <path d="M 445 178 Q 456 172 467 178 Q 478 184 489 178 Q 500 172 511 178 Q 522 184 533 178" stroke="#0ea5e9" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {/* tank roof */}
          <path d="M 435 154 Q 491 118 547 154 Z" fill="#0284c7" stroke="#075985" strokeWidth={2.5} />
          {/* tank face */}
          <circle cx={477} cy={186} r={3.2} fill="#075985" />
          <circle cx={505} cy={186} r={3.2} fill="#075985" />
          <path d="M 479 196 Q 491 205 503 196" stroke="#075985" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <circle cx={468} cy={196} r={4} fill="#bae6fd" opacity={0.9} />
          <circle cx={514} cy={196} r={4} fill="#bae6fd" opacity={0.9} />
        </g>
        {/* the drop pipe: stretches from the (moving) tank bottom to the ground elbow */}
        <rect x={483} y={216 + rise} width={12} height={46 - rise} rx={5} fill="#64748b"
          style={{ transition: motion ? 'y .6s ease, height .6s ease' : 'none' }} />
        {/* ground pipe + tap (static) */}
        <rect x={414} y={262} width={82} height={12} rx={6} fill="#64748b" />
        <rect x={404} y={258} width={14} height={20} rx={5} fill="#475569" />
        {/* the jet — grows with the level */}
        <path d={WATER2_JETS[level]} fill="none" stroke="#38bdf8" strokeWidth={WATER2_JET_W[level]} strokeLinecap="round" opacity={0.85}>
          {level === 2 && motion && <animate attributeName="stroke-width" values="10;13;10" dur="0.7s" repeatCount="indefinite" />}
        </path>
        {level === 2 && (
          <>
            <circle cx={330} cy={226} r={4.4} fill="#38bdf8" />
            <circle cx={323} cy={258} r={3.6} fill="#38bdf8" />
            <circle cx={317} cy={288} r={3} fill="#38bdf8" />
            {motion && <text x={346} y={178} fontSize={20} className="cq-float">💧</text>}
          </>
        )}
        <ellipse cx={368} cy={296} rx={34} ry={7} fill="#7dd3fc" opacity={0.45} />

        {/* ===== left half: the battery circuit ===== */}
        <path d={WATER2_LOOP} fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d={WATER2_LOOP} fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        {/* electrons running around the loop — faster when the pressure is higher */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={jetDur} begin={`-${((i * jetDurNum) / 3).toFixed(2)}s`} repeatCount="indefinite" path={WATER2_LOOP} />
            )}
            <circle cx={0} cy={0} r={8} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <path d="M -2.4 1.8 Q 0 4 2.4 1.8" stroke="#0c4a6e" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* battery at the bottom of the loop */}
        <g transform="translate(150 236)">
          <rect x={-19} y={-13} width={38} height={26} rx={6} fill="#22c55e" stroke="#15803d" strokeWidth={2.6} />
          <rect x={-8} y={-19} width={16} height={8} rx={3} fill="#86efac" stroke="#15803d" strokeWidth={2} />
        </g>
        {/* the lamp at the top of the loop */}
        <g transform="translate(150 110)">
          <rect x={-10} y={14} width={20} height={10} rx={4} fill="#94a3b8" />
          <circle cx={0} cy={0} r={20} fill={level === 0 ? '#f1f5f9' : level === 1 ? '#fef08a' : '#fde047'} stroke={level === 0 ? '#cbd5e1' : '#eab308'} strokeWidth={3} />
          {level === 0 && <text x={22} y={-8} fontSize={13}>💤</text>}
          {level >= 1 && (
            <circle cx={0} cy={0} r={level === 2 ? 34 : 27} fill="#fde047" opacity={level === 2 ? 0.35 : 0.22}>
              {level === 2 && motion && <animate attributeName="r" values="30;40;30" dur="0.9s" repeatCount="indefinite" />}
            </circle>
          )}
          {level === 2 && motion && (
            <>
              <text x={-52} y={-18} fontSize={18} className="cq-float">✨</text>
              <text x={38} y={-26} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>🌟</text>
            </>
          )}
        </g>

        {/* half labels */}
        <g>
          <rect x={431} y={8} width={122} height={24} rx={12} fill="#ffffff" stroke="#0ea5e9" strokeWidth={2} />
          <text x={492} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(WATER2_TANK_LABEL)}</text>
        </g>
        <g>
          <rect x={90} y={8} width={120} height={24} rx={12} fill="#ffffff" stroke="#22c55e" strokeWidth={2} />
          <text x={150} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(WATER2_BATTERY_LABEL)}</text>
        </g>
      </svg>
      <p className={`text-center text-sm font-extrabold ${level === 2 ? 'text-teal-700' : level === 1 ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <Button onClick={cycle} className="h-12 w-full bg-sky-600 font-extrabold hover:bg-sky-700">
        {tx(WATER2_BTN[level])}
      </Button>
    </div>
  );
}

/* --------------------------------------------------- page 3 · battery-duo */

const BAT3_HINT = L(
  'Connect the 9-volt battery and see how much brighter the lamp gets!',
  'باتری ۹ ولت رو وصل کن تا ببینی چراغ چقدر پرنورتر میشه!',
);
const BAT3_NONE = L(
  'No battery is connected yet! Pick one and plug it into the circuit 🔌',
  'هنوز هیچ باتری‌ای وصل نشده! یک باتری بردار و به مدار وصلش کن 🔌',
);
const BAT3_AA = L(
  '1.5 volts: a soft, gentle push for small jobs — the lamp turned on calm and dim 🌙',
  '۱.۵ ولت: یک هولِ نرم و آروم برای کارهای کوچک — چراغ کم‌نور و آروم روشن شد 🌙',
);
const BAT3_NINE = L(
  '9 volts: a strong, powerful push — the lamp turned on bright and shiny! ⚡✨',
  '۹ ولت: یک هولِ پرقدرت و قوی — چراغ پرنور و درخشان روشن شد! ⚡✨',
);
const BAT3_AA_BTN = L('🔋 AA battery (1.5 V)', '🔋 باتری قلمی (۱.۵ ولت)');
const BAT3_NINE_BTN = L('📦 Block battery (9 V)', '📦 باتری کتابی (۹ ولت)');

type Bat3Choice = 'aa' | 'nine' | null;

/** the little AA battery with a cute face (local coords, centered) */
function AaBattery({ motion = true }: { motion?: boolean }) {
  return (
    <g>
      <rect x={-13} y={-42} width={26} height={10} rx={4} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
      <rect x={-18} y={-34} width={36} height={62} rx={8} fill="#f59e0b" stroke="#b45309" strokeWidth={3} />
      <rect x={-18} y={-34} width={36} height={20} rx={8} fill="#fbbf24" opacity={0.55} />
      <rect x={-18} y={-4} width={36} height={10} fill="#fde68a" opacity={0.7} />
      <circle cx={-6} cy={14} r={2.6} fill="#78350f" />
      <circle cx={6} cy={14} r={2.6} fill="#78350f" />
      <path d="M -5 22 Q 0 27 5 22" stroke="#78350f" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {motion && <circle cx={0} cy={-8} r={2.2} fill="#fff7ed" opacity={0.8} />}
    </g>
  );
}

/** the big 9 V block battery with a superhero belt (local coords, centered) */
function NineBattery({ motion = true }: { motion?: boolean }) {
  return (
    <g>
      <rect x={-22} y={-50} width={11} height={10} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
      <rect x={11} y={-50} width={11} height={10} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
      <rect x={-38} y={-42} width={76} height={70} rx={10} fill="#0d9488" stroke="#115e59" strokeWidth={3} />
      <rect x={-38} y={-42} width={76} height={24} rx={10} fill="#14b8a6" opacity={0.6} />
      {/* the superhero belt */}
      <rect x={-38} y={2} width={76} height={14} fill="#fbbf24" stroke="#d97706" strokeWidth={2} />
      <rect x={-11} y={-1} width={22} height={20} rx={4} fill="#fde047" stroke="#d97706" strokeWidth={2} />
      <path d="M -2 2 L 3 8 L 0 8 L 2 15" stroke="#b45309" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* the proud face */}
      <circle cx={-14} cy={-18} r={3.2} fill="#134e4a" />
      <circle cx={14} cy={-18} r={3.2} fill="#134e4a" />
      <path d="M -11 -8 Q 0 1 11 -8" stroke="#134e4a" strokeWidth={2.8} fill="none" strokeLinecap="round" />
      {motion && (
        <>
          <circle cx={-26} cy={-24} r={2.2} fill="#ccfbf1" opacity={0.9} />
          <circle cx={26} cy={-24} r={2.2} fill="#ccfbf1" opacity={0.9} />
        </>
      )}
    </g>
  );
}

/** Page 3: connect the gentle 1.5 V battery or the strong 9 V one. */
export function BatteryDuoScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [choice, setChoice] = useState<Bat3Choice>(null);

  const pick = (who: Exclude<Bat3Choice, null>) => {
    setChoice((was) => {
      const next = was === who ? null : who;
      if (next === null) sfx.click();
      else if (next === 'aa') {
        sfx.click();
        window.setTimeout(() => sfx.blip(), 220);
      } else {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      }
      return next;
    });
  };

  const status = choice === 'aa' ? BAT3_AA : choice === 'nine' ? BAT3_NINE : BAT3_NONE;
  const tray = 'translate(320 248)';

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A small smiling AA battery next to a strong 9 V block battery wearing a superhero belt', 'باتری قلمیِ کوچولوی خندان کنار باتری کتابیِ قوی با کمربند ابرقهرمانی'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🔋 {tx(BAT3_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        {/* the lamp at the top */}
        <g transform="translate(320 92)">
          {choice === 'aa' && <circle cx={0} cy={0} r={40} fill="#fde047" opacity={0.22} />}
          {choice === 'nine' && (
            <>
              <circle cx={0} cy={0} r={46} fill="#fde047" opacity={0.3}>
                {motion && <animate attributeName="r" values="42;54;42" dur="0.9s" repeatCount="indefinite" />}
              </circle>
              {motion && (
                <>
                  <text x={-58} y={-28} fontSize={19} className="cq-float">✨</text>
                  <text x={46} y={-36} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>🌟</text>
                </>
              )}
            </>
          )}
          <circle cx={0} cy={0} r={30} fill={choice === null ? '#f1f5f9' : choice === 'aa' ? '#fef9c3' : '#fde047'} stroke={choice === null ? '#cbd5e1' : '#eab308'} strokeWidth={3} />
          {choice === null && <text x={34} y={-14} fontSize={14}>💤</text>}
          {choice === 'aa' && (
            <>
              <path d="M -11 -2 Q -6 3 -1 -2" stroke="#a16207" strokeWidth={2.4} fill="none" strokeLinecap="round" />
              <path d="M 1 -2 Q 6 3 11 -2" stroke="#a16207" strokeWidth={2.4} fill="none" strokeLinecap="round" />
              <path d="M -6 10 Q 0 14 6 10" stroke="#a16207" strokeWidth={2.4} fill="none" strokeLinecap="round" />
              <text x={-64} y={-16} fontSize={15}>🌙</text>
            </>
          )}
          {choice === 'nine' && (
            <>
              <circle cx={-10} cy={-4} r={3.4} fill="#78350f" />
              <circle cx={10} cy={-4} r={3.4} fill="#78350f" />
              <path d="M -10 8 Q 0 18 10 8" stroke="#78350f" strokeWidth={3} fill="none" strokeLinecap="round" />
              <circle cx={-17} cy={6} r={4.4} fill="#fda4af" opacity={0.8} />
              <circle cx={17} cy={6} r={4.4} fill="#fda4af" opacity={0.8} />
            </>
          )}
          <rect x={-16} y={28} width={32} height={16} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
        </g>
        {/* wires from the lamp down to the tray tips */}
        <path d="M 306 136 V 226" fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d="M 334 136 V 226" fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d="M 306 136 V 226" fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        <path d="M 334 136 V 226" fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        <circle cx={306} cy={228} r={6} fill="#f59e0b" stroke="#92400e" strokeWidth={2} />
        <circle cx={334} cy={228} r={6} fill="#f59e0b" stroke="#92400e" strokeWidth={2} />
        {/* the tray */}
        <rect x={252} y={272} width={136} height={16} rx={8} fill="#a16207" />
        <ellipse cx={320} cy={300} rx={150} ry={12} fill="#e2e8f0" />
        {/* the AA battery: waits on the right, rolls into the tray when picked */}
        <g transform={choice === 'aa' ? tray : 'translate(486 248)'} style={{ transition: motion ? 'transform .55s cubic-bezier(.34,1.3,.64,1)' : 'none' }}>
          <AaBattery motion={motion} />
        </g>
        {/* the 9 V battery: waits on the left */}
        <g transform={choice === 'nine' ? tray : 'translate(154 248)'} style={{ transition: motion ? 'transform .55s cubic-bezier(.34,1.3,.64,1)' : 'none' }}>
          <NineBattery motion={motion} />
        </g>
        {/* volt labels follow each battery */}
        <g transform={choice === 'aa' ? 'translate(320 302)' : 'translate(486 302)'} style={{ transition: motion ? 'transform .55s cubic-bezier(.34,1.3,.64,1)' : 'none' }}>
          <text fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#334155">۱.۵ ولت</text>
        </g>
        <g transform={choice === 'nine' ? 'translate(320 302)' : 'translate(154 302)'} style={{ transition: motion ? 'transform .55s cubic-bezier(.34,1.3,.64,1)' : 'none' }}>
          <text fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#334155">۹ ولت</text>
        </g>
        {choice === null && (
          <>
            <circle cx={320} cy={244} r={40} fill="none" stroke="#0ea5e9" strokeWidth={2.5} strokeDasharray="6 8">
              {motion && <animate attributeName="r" values="36;46;36" dur="1.3s" repeatCount="indefinite" />}
            </circle>
            <text x={320} y={188} fontSize={20} textAnchor="middle">👇</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${choice === 'nine' ? 'text-teal-700' : choice === 'aa' ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => pick('aa')}
          aria-pressed={choice === 'aa'}
          className={`h-12 px-1 font-extrabold ${choice === 'aa' ? 'bg-amber-500 ring-4 ring-amber-200 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(BAT3_AA_BTN)}
        </Button>
        <Button
          onClick={() => pick('nine')}
          aria-pressed={choice === 'nine'}
          className={`h-12 px-1 font-extrabold ${choice === 'nine' ? 'bg-amber-500 ring-4 ring-amber-200 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(BAT3_NINE_BTN)}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ page 4 · happy-led */

const LED4_HINT = L(
  'Pick the right voltage so the lamp smiles!',
  'ولتاژ درست رو انتخاب کن تا چراغ لبخند بزنه!',
);
const LED4_NONE = L('The LED is waiting — see which voltage makes it smile 💡', 'ال‌ای‌دی منتظره؛ ببین با کدوم ولتاژ لبخند می‌زنه 💡');
const LED4_LOW = L(
  'The voltage is too low: the electrons crawl along and the lamp turned dim and sleepy 😴',
  'ولتاژ خیلی کمه؛ الکترون‌ها آروم می‌رن و چراغ کم‌نور و بی‌حال شده 😴',
);
const LED4_RIGHT = L(
  'Great! Just the right voltage: the electrons run at a good speed and the lamp is completely bright and happy! 😄✨',
  'عالی! ولتاژِ مناسب: الکترون‌ها با سرعت خوب می‌رن و چراغ کاملاً پرنور و شاد شده! 😄✨',
);
const LED4_WALL = L(
  '⛔ No, no! 220 volts is like a very dangerous ocean wave — only grown-ups may go near it. We only work with safe batteries (1.5–9 V)! ⚠️',
  '⛔ نه نه! ولتاژ پریز دیوار ۲۲۰ ولت مثل یک موجِ اقیانوسیِ خیلی خطرناکه و فقط بزرگ‌ترها اجازه دارن بهش نزدیک بشن؛ ما فقط با باتری‌های امنِ ۱.۵ تا ۹ ولت کار می‌کنیم! ⚠️',
);
const LED4_LOW_BTN = L('😴 Low voltage', '😴 ولتاژ کم');
const LED4_RIGHT_BTN = L('😄 Right voltage', '😄 ولتاژ مناسب');
const LED4_WALL_BTN = L('⛔ 220 V socket', '⛔ پریز ۲۲۰ ولت');

type Led4Choice = 'low' | 'right' | 'wall' | null;

/** Page 4: try a sleepy, a happy and a dangerous voltage on the LED. */
export function HappyLedScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [pick, setPick] = useState<Led4Choice>(null);

  const choose = (who: Exclude<Led4Choice, null>) => {
    setPick((was) => {
      const next = was === who ? null : who;
      if (next === null) sfx.click();
      else if (next === 'low') {
        sfx.click();
        window.setTimeout(() => sfx.whirr(), 200);
      } else if (next === 'right') {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 380);
      } else {
        sfx.whirr();
        window.setTimeout(() => sfx.click(), 240);
      }
      return next;
    });
  };

  const status = pick === 'low' ? LED4_LOW : pick === 'right' ? LED4_RIGHT : pick === 'wall' ? LED4_WALL : LED4_NONE;
  const danger = pick === 'wall';
  const happy = pick === 'right';

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A happy glowing LED light bulb shining warmly, powered safely by a small battery', 'ال‌ای‌دی خندان و درخشان که با یک باتری کوچکِ امن روشن شده'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">💡 {tx(LED4_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        {/* glow rings behind the LED */}
        {happy && (
          <>
            <circle cx={320} cy={138} r={64} fill="#fde047" opacity={0.3}>
              {motion && <animate attributeName="r" values="58;74;58" dur="1s" repeatCount="indefinite" />}
            </circle>
            <circle cx={320} cy={138} r={84} fill="#fef08a" opacity={0.16}>
              {motion && <animate attributeName="r" values="78;92;78" dur="1.4s" repeatCount="indefinite" />}
            </circle>
          </>
        )}
        {danger && (
          <circle cx={320} cy={138} r={62} fill="none" stroke="#ef4444" strokeWidth={4} strokeDasharray="10 10">
            {motion && <animate attributeName="opacity" values="0.9;0.25;0.9" dur="0.8s" repeatCount="indefinite" />}
          </circle>
        )}
        {/* the LED bulb */}
        <circle cx={320} cy={138} r={46}
          fill={pick === null ? '#f1f5f9' : pick === 'low' ? '#fde68a' : happy ? '#fde047' : '#fee2e2'}
          stroke={pick === null ? '#cbd5e1' : danger ? '#f87171' : '#eab308'}
          strokeWidth={3.5} />
        {pick !== null && <circle cx={302} cy={120} r={12} fill="#ffffff" opacity={0.45} />}
        {/* the face */}
        {pick === null && (
          <>
            <path d="M 300 132 L 312 132 M 328 132 L 340 132" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
            <path d="M 310 154 Q 320 150 330 154" stroke="#94a3b8" strokeWidth={2.8} fill="none" strokeLinecap="round" />
            <text x={352} y={110} fontSize={14}>💤</text>
          </>
        )}
        {pick === 'low' && (
          <>
            <path d="M 300 134 Q 306 140 312 134" stroke="#a16207" strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 328 134 Q 334 140 340 134" stroke="#a16207" strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 312 156 L 328 156" stroke="#a16207" strokeWidth={2.8} strokeLinecap="round" />
            <text x={354} y={112} fontSize={13} fontStyle="italic">z</text>
            <text x={366} y={98} fontSize={11} fontStyle="italic">z</text>
          </>
        )}
        {happy && (
          <>
            <circle cx={303} cy={130} r={4.4} fill="#78350f" />
            <circle cx={337} cy={130} r={4.4} fill="#78350f" />
            <path d="M 302 150 Q 320 168 338 150" stroke="#78350f" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            <circle cx={294} cy={148} r={5.5} fill="#fda4af" opacity={0.85} />
            <circle cx={346} cy={148} r={5.5} fill="#fda4af" opacity={0.85} />
          </>
        )}
        {danger && (
          <>
            <circle cx={305} cy={130} r={8} fill="#ffffff" stroke="#ef4444" strokeWidth={2.4} />
            <circle cx={335} cy={130} r={8} fill="#ffffff" stroke="#ef4444" strokeWidth={2.4} />
            <circle cx={305} cy={130} r={3} fill="#334155" />
            <circle cx={335} cy={130} r={3} fill="#334155" />
            <circle cx={320} cy={156} r={7.5} fill="none" stroke="#ef4444" strokeWidth={3} />
          </>
        )}
        {/* the screw base + leads + safe little battery */}
        <rect x={298} y={184} width={44} height={12} rx={4} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
        <rect x={302} y={196} width={36} height={11} rx={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
        <rect x={306} y={207} width={28} height={10} rx={4} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
        <path d="M 310 217 V 244" stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" />
        <path d="M 330 217 V 244" stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" />
        <g transform="translate(320 260)">
          <rect x={-30} y={-14} width={60} height={28} rx={7} fill="#22c55e" stroke="#15803d" strokeWidth={2.6} />
          <rect x={-10} y={-20} width={20} height={8} rx={3} fill="#86efac" stroke="#15803d" strokeWidth={2} />
        </g>
        {happy && motion && (
          <>
            <text x={236} y={92} fontSize={22} className="cq-float">✨</text>
            <text x={408} y={116} fontSize={17} className="cq-float" style={{ animationDelay: '0.45s' }}>🌟</text>
          </>
        )}
        {/* the dangerous wall socket (only in the 220 V scene) */}
        {danger && (
          <g>
            <rect x={488} y={108} width={58} height={86} rx={12} fill="#f8fafc" stroke="#94a3b8" strokeWidth={3} />
            <circle cx={517} cy={140} r={5} fill="#334155" />
            <rect x={507} y={158} width={7} height={16} rx={3} fill="#334155" />
            <rect x={520} y={158} width={7} height={16} rx={3} fill="#334155" />
            <text x={517} y={96} fontSize={26} textAnchor="middle">⛔</text>
            <text x={517} y={218} fontSize={20} textAnchor="middle">🌊</text>
          </g>
        )}
        {danger && motion && (
          <text x={228} y={96} fontSize={30}>
            ⚠️
            <animate attributeName="opacity" values="1;0.25;1" dur="1s" repeatCount="indefinite" />
          </text>
        )}
        <ellipse cx={320} cy={300} rx={190} ry={11} fill="#e2e8f0" />
      </svg>
      <p className={`text-center text-sm font-extrabold ${happy ? 'text-teal-700' : danger ? 'text-rose-600' : pick === 'low' ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => choose('low')}
          aria-pressed={pick === 'low'}
          className={`h-12 px-1 font-extrabold ${pick === 'low' ? 'bg-amber-500 ring-4 ring-amber-200 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(LED4_LOW_BTN)}
        </Button>
        <Button
          onClick={() => choose('right')}
          aria-pressed={pick === 'right'}
          className={`h-12 px-1 font-extrabold ${pick === 'right' ? 'bg-amber-500 ring-4 ring-amber-200 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(LED4_RIGHT_BTN)}
        </Button>
        <Button
          onClick={() => choose('wall')}
          aria-pressed={pick === 'wall'}
          className={`h-12 px-1 font-extrabold ${pick === 'wall' ? 'bg-rose-500 ring-4 ring-rose-200 hover:bg-rose-600' : 'bg-rose-700 hover:bg-rose-800'}`}
        >
          {tx(LED4_WALL_BTN)}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------- page 1 · race-finish (l0-8) */

type FlowMode = 'low' | 'high';

/** status line under the scene, per selected intensity */
const FLOW_STATUS: Record<'none' | FlowMode, LocaleText> = {
  none: L(
    'Choose one of the two buttons below so the electron runners set off! 👇',
    'یکی از دو دکمهٔ پایین رو انتخاب کن تا دونده‌های الکترون به راه بیفتند! 👇',
  ),
  low: L(
    'Low current: only 2 electrons cross the finish line every second. 🐢',
    'جریان کم: در هر ثانیه فقط ۲ الکترون از خط پایان رد می‌شه. 🐢',
  ),
  high: L(
    'High current: 10 electrons per second — many more and much faster! ⚡',
    'جریان زیاد: در هر ثانیه ۱۰ الکترون — خیلی بیشتر و خیلی سریع‌تر! ⚡',
  ),
};
const FLOW_LOW_BTN = L('🐢 Low current', '🐢 جریان کم');
const FLOW_HIGH_BTN = L('⚡ High current', '⚡ جریان زیاد');

/** the sign board (تابلو) hanging above the finish line: pill title + 2 lines */
const FLOW_SIGN: Record<'none' | FlowMode, { pill: LocaleText; l1: LocaleText; l2: LocaleText; fill: string; stroke: string }> = {
  none: {
    pill: L('Which current?', 'کدوم جریان؟'),
    l1: L('Tap one of the two buttons', 'یکی از دو دکمه رو بزن'),
    l2: L('to see the runners set off!', 'تا دونده‌ها به راه بیفتن!'),
    fill: '#f59e0b',
    stroke: '#fbbf24',
  },
  low: {
    pill: L('Low current', 'جریان کم'),
    l1: L('2 electrons in one second', '۲ الکترون در یک ثانیه'),
    l2: L('cross the finish line', 'از خط پایان رد می‌شوند'),
    fill: '#0ea5e9',
    stroke: '#38bdf8',
  },
  high: {
    pill: L('High current', 'جریان زیاد'),
    l1: L('10 electrons in one second', '۱۰ الکترون در یک ثانیه'),
    l2: L('cross the finish line', 'از خط پایان رد می‌شوند'),
    fill: '#f43f5e',
    stroke: '#fb7185',
  },
};

/** flow tuning: crossing rate at the finish line = runners / lap duration
 *  low:  6 runners over 3.0 s  =  2 electrons per second (calm pace)
 *  high: 20 runners over 2.0 s = 10 electrons per second (1.5× faster) */
const FLOW_N = { low: 6, high: 20 } as const;
const FLOW_DUR = { low: 3, high: 2 } as const;
/** the two running lanes on the road (runners alternate between them) */
const FLOW_LANES = [242, 264] as const;
/** straight lane path: enter from the right edge, exit past the finish line */
const flowPath = (y: number) => `M 680 ${y} L -40 ${y}`;

/** a SMALL happy electron runner (r = 9), face turned toward its running
 *  direction (left) with little speed-sparkles trailing behind it.
 *  `grad` lets each SVG scene bring its own gradient id (SVG url(#…) refs
 *  only resolve inside the same document, and scenes mount one at a time). */
function FlowElectron({ motion, fast, grad = 'flow-e-grad' }: { motion: boolean; fast: boolean; grad?: string }) {
  return (
    <g>
      <circle r={9} fill={`url(#${grad})`} stroke="#0369a1" strokeWidth={1.6} />
      <ellipse cx={-2.6} cy={-4.2} rx={3.2} ry={1.9} fill="#ffffff" opacity={0.75} transform="rotate(-24 -2.6 -4.2)" />
      <circle cx={-3.6} cy={-1.4} r={1.3} fill="#0c4a6e" />
      <circle cx={0.6} cy={-1.4} r={1.3} fill="#0c4a6e" />
      <path d="M -4 1.8 Q -1 4.6 2.2 1.8" stroke="#0c4a6e" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <circle cx={12.5} cy={3.5} r={1.3} fill="#7dd3fc">
        {motion && <animate attributeName="opacity" values="0.9;0.1;0.9" dur={fast ? '0.45s' : '0.85s'} repeatCount="indefinite" />}
      </circle>
      <circle cx={15.5} cy={-3} r={1} fill="#bae6fd">
        {motion && <animate attributeName="opacity" values="0.15;0.85;0.15" dur={fast ? '0.5s' : '0.9s'} repeatCount="indefinite" />}
      </circle>
    </g>
  );
}

/** Page 1: the student picks «low current» or «high current» — the road fills
 *  with small electron runners crossing the finish line continuously (2 or 10
 *  per second, the big current visibly faster) while the sign board above the
 *  finish line announces the intensity. */
export function RaceFinishScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [mode, setMode] = useState<FlowMode | null>(null);

  const choose = (m: FlowMode) => {
    setMode((was) => {
      if (was === m) return was;
      if (m === 'low') sfx.blip();
      else {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 420);
      }
      return m;
    });
  };

  const sign = FLOW_SIGN[mode ?? 'none'];
  const status = FLOW_STATUS[mode ?? 'none'];
  const n = mode ? FLOW_N[mode] : 0;
  const dur = mode ? FLOW_DUR[mode] : 0;

  return (
    <div className="space-y-3">
      <svg
        viewBox="0 0 640 330"
        className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="group"
        aria-label={tx(status)}
      >
        <defs>
          <radialGradient id="flow-e-grad" cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </radialGradient>
        </defs>

        {/* sunny sky + slowly drifting clouds */}
        <circle cx={568} cy={56} r={22} fill="#fde047" />
        <circle cx={568} cy={56} r={29} fill="#fde047" opacity={0.35} />
        <g fill="#ffffff" opacity={0.95}>
          {motion && <animateTransform attributeName="transform" type="translate" values="0 0;16 0;0 0" dur="11s" repeatCount="indefinite" />}
          <ellipse cx={420} cy={64} rx={34} ry={13} />
          <ellipse cx={447} cy={54} rx={22} ry={11} />
          <ellipse cx={396} cy={56} rx={18} ry={9} />
        </g>
        <g fill="#ffffff" opacity={0.8}>
          {motion && <animateTransform attributeName="transform" type="translate" values="0 0;-12 0;0 0" dur="14s" repeatCount="indefinite" />}
          <ellipse cx={330} cy={34} rx={26} ry={10} />
          <ellipse cx={350} cy={27} rx={16} ry={8} />
        </g>

        {/* the running road */}
        <rect x={16} y={222} width={608} height={78} rx={22} fill="#fda4af" />
        <rect x={16} y={222} width={608} height={15} rx={7.5} fill="#fecdd3" opacity={0.75} />
        {[80, 150, 220, 290, 360, 430, 500, 570].map((x) => (
          <rect key={x} x={x} y={253} width={30} height={5} rx={2.5} fill="#fff1f2" opacity={0.9} />
        ))}
        <rect x={0} y={296} width={640} height={34} fill="#bbf7d0" />
        <ellipse cx={110} cy={322} rx={26} ry={6} fill="#86efac" opacity={0.8} />
        <ellipse cx={540} cy={324} rx={32} ry={7} fill="#86efac" opacity={0.8} />

        {/* high-current speed streaks flickering on the road */}
        {mode === 'high' && (
          <g stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
            <line x1={500} y1={236} x2={548} y2={236}>
              {motion && <animate attributeName="opacity" values="0.1;0.9;0.1" dur="0.5s" repeatCount="indefinite" />}
            </line>
            <line x1={430} y1={272} x2={490} y2={272}>
              {motion && <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.62s" repeatCount="indefinite" />}
            </line>
            <line x1={560} y1={254} x2={610} y2={254}>
              {motion && <animate attributeName="opacity" values="0.15;0.8;0.15" dur="0.55s" repeatCount="indefinite" />}
            </line>
          </g>
        )}

        {/* the checkered finish line (x≈150) with its little pennant */}
        <rect x={142} y={196} width={9} height={102} rx={4} fill="#94a3b8" />
        <rect x={186} y={196} width={9} height={102} rx={4} fill="#94a3b8" />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 2 }).map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={150 + col * 19}
              y={202 + row * 19}
              width={19}
              height={19}
              fill={(row + col) % 2 === 0 ? '#1e293b' : '#f8fafc'}
            />
          )),
        )}
        <path
          d="M 150 196 L 150 168 L 196 178 L 150 188 Z"
          fill={mode === 'high' ? '#f43f5e' : mode === 'low' ? '#38bdf8' : '#94a3b8'}
          stroke="#334155"
          strokeWidth={2.4}
          strokeLinejoin="round"
        >
          {motion && <animateTransform attributeName="transform" type="rotate" values="-4 150 168;4 150 168;-4 150 168" dur="1.4s" repeatCount="indefinite" />}
        </path>

        {/* the sign board (تابلو) above the finish line: mode pill + count text */}
        <rect x={92} y={116} width={7} height={108} rx={3.5} fill="#94a3b8" />
        <rect x={244} y={116} width={7} height={108} rx={3.5} fill="#94a3b8" />
        <rect x={46} y={38} width={252} height={84} rx={14} fill="#0f172a" opacity={0.08} />
        <rect x={42} y={34} width={252} height={84} rx={14} fill="#ffffff" stroke={sign.stroke} strokeWidth={3} />
        <g key={mode ?? 'none'} className={motion ? 'cq-pop' : ''}>
          <rect x={110} y={46} width={116} height={25} rx={12.5} fill={sign.fill} />
          <text x={168} y={63.5} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#ffffff" style={{ direction: 'rtl' }}>
            {tx(sign.pill)}
          </text>
        </g>
        <text x={168} y={90} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#334155" style={{ direction: 'rtl' }}>
          {tx(sign.l1)}
        </text>
        <text x={168} y={107} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#334155" style={{ direction: 'rtl' }}>
          {tx(sign.l2)}
        </text>

        {/* the electron runners: a continuous stream — 2 per second on «low»,
            10 per second (visibly faster) on «high». The key includes the mode
            so the SMIL animations restart cleanly when the student switches. */}
        {mode &&
          Array.from({ length: n }).map((_, i) => {
            const laneY = FLOW_LANES[i % 2];
            return (
              <g key={`${mode}-${i}`}>
                {motion ? (
                  <animateMotion
                    dur={`${dur}s`}
                    begin={`${(-((i / n) * dur)).toFixed(3)}s`}
                    repeatCount="indefinite"
                    path={flowPath(laneY)}
                  />
                ) : null}
                <g transform={motion ? undefined : `translate(${Math.round(660 - (i / n) * 700)} ${laneY})`}>
                  {/* SMIL animateTransform REPLACES the target's transform —
                      so the wiggle lives on this inner group while the lane
                      translate/animateMotion stays on the outer groups */}
                  <g>
                    {motion && <animateTransform attributeName="transform" type="rotate" values="-9;9;-9" dur="0.38s" repeatCount="indefinite" />}
                    <FlowElectron motion={motion} fast={mode === 'high'} />
                  </g>
                </g>
              </g>
            );
          })}
      </svg>
      <p className={`text-center text-sm font-extrabold ${mode === 'high' ? 'text-rose-600' : mode === 'low' ? 'text-sky-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => choose('low')}
          aria-pressed={mode === 'low'}
          className={`h-12 flex-1 px-1 font-extrabold ${mode === 'low' ? 'bg-sky-500 ring-4 ring-sky-200 hover:bg-sky-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(FLOW_LOW_BTN)}
        </Button>
        <Button
          onClick={() => choose('high')}
          aria-pressed={mode === 'high'}
          className={`h-12 flex-1 px-1 font-extrabold ${mode === 'high' ? 'bg-rose-500 ring-4 ring-rose-200 hover:bg-rose-600' : 'bg-slate-600 hover:bg-slate-700'}`}
        >
          {tx(FLOW_HIGH_BTN)}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------- page 2 · river-brook (l0-8) */

const RIVER2_HINT = L(
  'Turn the tap and watch the brook grow into a river!',
  'شیر آب رو بچرخون تا جویبار تبدیل به رودخانه بشه!',
);
const RIVER2_L0 = L(
  'A tiny brook: the water moves very little and very calmly (a small current) 💧',
  'جویبارِ کوچولو: آب خیلی کم و آروم حرکت می‌کنه (جریان کم) 💧',
);
const RIVER2_L1 = L(
  'The tap turned and more water came — the brook is growing wider and stronger! 🌊',
  'شیر که چرخید آب بیشتر شد؛ جویبار داره پهن‌تر و پرشورتر میشه! 🌊',
);
const RIVER2_L2 = L(
  'A rushing river: a huge amount of water passes with great strength (a big current)! 🌊⚡',
  'رودخانهٔ خروشان: حجم خیلی زیادی از آب با شدت زیاد رد میشه (جریان زیاد)! 🌊⚡',
);
const RIVER2_BTN = [L('🔄 Turn the tap', '🔄 شیر آب رو بچرخون'), L('🔄 Turn it more!', '🔄 باز هم بچرخون!'), L('↩️ Back to the tiny brook', '↩️ برگردونش جویبارِ کوچولو')];
const RIVER2_WATER_LABEL = L('💧 Water', '💧 آب');
const RIVER2_WIRE_LABEL = L('⚡ The wire', '⚡ سیم');

/** stream stroke width / drop & electron durations per level */
const RIVER2_STREAM_W = [7, 13, 21] as const;
const RIVER2_DROP_DUR = [2.6, 1.5, 0.85] as const;
const RIVER2_E_DUR = [2.8, 1.7, 0.95] as const;
/** the stream bed: from the tap mouth curving down to the pool */
const RIVER2_STREAM = 'M 508 96 Q 500 150 468 190 Q 440 226 392 248';
/** the little circuit loop the electrons run around (left half) */
const RIVER2_LOOP = 'M 138 224 V 136 Q 138 110 160 110 Q 182 110 182 136 V 224 Q 182 246 160 246 Q 138 246 138 224 Z';

/** Page 2: turn the tap — the brook swells into a rushing river while more
 *  electrons run faster through the wire: more water = more current. */
export function RiverBrookScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [level, setLevel] = useState(0);

  const cycle = () => {
    setLevel((was) => {
      const next = was >= 2 ? 0 : was + 1;
      if (next === 0) sfx.click();
      else if (next === 1) sfx.whoosh();
      else {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      }
      return next;
    });
  };

  const status = level === 0 ? RIVER2_L0 : level === 1 ? RIVER2_L1 : RIVER2_L2;
  const eCount = [3, 5, 7][level];
  const dropCount = [2, 4, 6][level];
  const eDur = RIVER2_E_DUR[level];

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A split comparison: a small calm brook on the right and a wide rushing river on the left', 'مقایسهٔ دو تکه: یک جویبار کوچک و آروم در سمت راست و یک رودخانهٔ پهن و خروشان در سمت چپ'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🚰 {tx(RIVER2_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <defs>
          <linearGradient id="cqRiver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* divider between the two halves */}
        <line x1={320} y1={44} x2={320} y2={284} stroke="#cbd5e1" strokeWidth={2.5} strokeDasharray="8 9" />
        {/* ground */}
        <rect x={16} y={290} width={608} height={13} rx={6.5} fill="#e2e8f0" />

        {/* ===== right half: the tap and the growing stream ===== */}
        {/* the tap */}
        <rect x={492} y={60} width={14} height={40} rx={6} fill="#475569" />
        <rect x={486} y={54} width={44} height={14} rx={7} fill="#475569" />
        <rect x={500} y={88} width={16} height={12} rx={4} fill="#334155" />
        {/* the rotating handle */}
        <g transform="translate(508 54)">
          <g transform={`rotate(${level * 65})`} style={{ transition: motion ? 'transform .55s cubic-bezier(.34,1.3,.64,1)' : 'none' }}>
            <rect x={-5} y={-34} width={10} height={26} rx={5} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
            <circle cx={0} cy={0} r={9} fill="#f8fafc" stroke="#334155" strokeWidth={2.6} />
          </g>
        </g>
        {/* the stream bed */}
        <path d={RIVER2_STREAM} fill="none" stroke="#bae6fd" strokeWidth={RIVER2_STREAM_W[level] + 8} strokeLinecap="round" />
        <path d={RIVER2_STREAM} fill="none" stroke="url(#cqRiver)" strokeWidth={RIVER2_STREAM_W[level]} strokeLinecap="round"
          style={{ transition: motion ? 'stroke-width .55s ease' : 'none' }} />
        {/* flowing drops along the stream */}
        {Array.from({ length: dropCount }).map((_, i) => (
          <g key={`${level}-${i}`}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={`${RIVER2_DROP_DUR[level]}s`} begin={`-${((i * RIVER2_DROP_DUR[level]) / dropCount).toFixed(2)}s`} repeatCount="indefinite" path={RIVER2_STREAM} />
            )}
            <circle cx={0} cy={0} r={4.2} fill="#0ea5e9" opacity={0.95} />
          </g>
        ))}
        {/* the pool at the bottom — grows with the level */}
        <ellipse cx={392} cy={266} rx={44 + level * 22} ry={12 + level * 5} fill="url(#cqRiver)" opacity={0.9}
          style={{ transition: motion ? 'all .55s ease' : 'none' }} />
        {level === 2 && (
          <>
            <path d="M 356 258 Q 348 246 358 240" stroke="#e0f2fe" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            <path d="M 420 256 Q 428 244 420 238" stroke="#e0f2fe" strokeWidth={3.4} fill="none" strokeLinecap="round" />
            {motion && <text x={348} y={216} fontSize={20} className="cq-float">💦</text>}
          </>
        )}

        {/* ===== left half: the wire — more water, more electrons running ===== */}
        <path d={RIVER2_LOOP} fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d={RIVER2_LOOP} fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        {Array.from({ length: eCount }).map((_, i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={`${eDur}s`} begin={`-${((i * eDur) / eCount).toFixed(2)}s`} repeatCount="indefinite" path={RIVER2_LOOP} />
            )}
            <circle cx={0} cy={0} r={8} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <path d="M -2.4 1.8 Q 0 4 2.4 1.8" stroke="#0c4a6e" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* the lamp at the top of the loop */}
        <g transform="translate(160 110)">
          <rect x={-10} y={14} width={20} height={10} rx={4} fill="#94a3b8" />
          <circle cx={0} cy={0} r={20} fill={level === 0 ? '#f1f5f9' : level === 1 ? '#fef08a' : '#fde047'} stroke={level === 0 ? '#cbd5e1' : '#eab308'} strokeWidth={3} />
          {level === 0 && <text x={22} y={-8} fontSize={13}>💤</text>}
          {level >= 1 && (
            <circle cx={0} cy={0} r={level === 2 ? 34 : 27} fill="#fde047" opacity={level === 2 ? 0.35 : 0.22}>
              {level === 2 && motion && <animate attributeName="r" values="30;40;30" dur="0.9s" repeatCount="indefinite" />}
            </circle>
          )}
          {level === 2 && motion && (
            <>
              <text x={-52} y={-18} fontSize={18} className="cq-float">✨</text>
              <text x={38} y={-26} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>🌟</text>
            </>
          )}
        </g>

        {/* half labels */}
        <g>
          <rect x={432} y={8} width={112} height={24} rx={12} fill="#ffffff" stroke="#0ea5e9" strokeWidth={2} />
          <text x={488} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(RIVER2_WATER_LABEL)}</text>
        </g>
        <g>
          <rect x={100} y={8} width={120} height={24} rx={12} fill="#ffffff" stroke="#22c55e" strokeWidth={2} />
          <text x={160} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(RIVER2_WIRE_LABEL)}</text>
        </g>
      </svg>
      <p className={`text-center text-sm font-extrabold ${level === 2 ? 'text-teal-700' : level === 1 ? 'text-sky-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <Button onClick={cycle} className="h-12 w-full bg-sky-600 font-extrabold hover:bg-sky-700">
        {tx(RIVER2_BTN[level])}
      </Button>
    </div>
  );
}

/* ---------------------------------------------- page 3 · ampere-detective (l0-8) */

const AMP3_HINT = L(
  'Tap the stopwatch — the detective counts ONE REAL second of the rushing electrons!',
  'روی ساعت بزن تا کارآگاه یک ثانیهٔ واقعی از تندتندِ الکترون‌ها رو بشماره!',
);
const AMP3_IDLE = L(
  'The electrons rush through the pipe — tap the stopwatch to count how many cross the gate in one second! 🕒',
  'الکترون‌ها تندتند از لوله رد می‌شن؛ روی ساعت بزن تا ببینی در یک ثانیه چند الکترون از دروازه رد می‌شه! 🕒',
);
const AMP3_COUNTING = L(
  'The detective is counting for one whole second… ⏱️',
  'کارآگاه یک ثانیهٔ کامل داره می‌شماره… ⏱️',
);
/** the counting gate (the vertical dashed line) */
const AMP3_GATE_X = 320;
/** flow tuning: 480 px/s with 60 px spacing → exactly 8 gate crossings per second */
const AMP3_SPEED = 480;
const AMP3_SPACING = 60;
const AMP3_SPAN = 720;
const AMP3_X0 = 660;
const AMP3_N = 12;
/** tiny lane offsets so the stream does not look like a rigid row */
const AMP3_JITTER = [0, -6, 5, -3, 6, -5, 3, -2, 4, -4, 2, -6] as const;

/** the friendly detective with hat, magnifying glass and stopwatch (feet at 0,0) */
function AmpDetective({ counting, motion = true }: { counting: boolean; motion?: boolean }) {
  return (
    <g>
      {/* coat */}
      <path d="M -20 -66 L 20 -66 L 26 -8 Q 0 -2 -26 -8 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2.6} />
      <path d="M -8 -66 L 0 -44 L 8 -66" fill="#bae6fd" stroke="#7dd3fc" strokeWidth={2} />
      {/* legs + shoes */}
      <rect x={-14} y={-10} width={11} height={12} rx={5} fill="#334155" />
      <rect x={3} y={-10} width={11} height={12} rx={5} fill="#334155" />
      {/* head */}
      <circle cx={0} cy={-82} r={17} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2.4} />
      {/* hat */}
      <ellipse cx={0} cy={-94} rx={30} ry={7} fill="#a16207" />
      <path d="M -16 -94 Q -14 -112 0 -112 Q 14 -112 16 -94 Z" fill="#ca8a04" stroke="#854d0e" strokeWidth={2.2} />
      {/* face */}
      <circle cx={-6} cy={-82} r={2.4} fill="#78350f" />
      <circle cx={6} cy={-82} r={2.4} fill="#78350f" />
      <path d={counting ? 'M -6 -72 Q 0 -66 6 -72' : 'M -5 -73 Q 0 -69 5 -73'} stroke="#78350f" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {/* magnifying glass (front hand, pointing left toward the pipe) */}
      <rect x={-38} y={-58} width={22} height={9} rx={4.5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={1.8} transform="rotate(18 -38 -58)" />
      <circle cx={-48} cy={-46} r={11} fill="#dbeafe" stroke="#64748b" strokeWidth={3.4} opacity={0.95} />
      {/* stopwatch (other hand) — the hand spins while counting */}
      <rect x={22} y={-60} width={20} height={9} rx={4.5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={1.8} transform="rotate(-24 22 -60)" />
      <circle cx={40} cy={-62} r={13} fill="#fffbeb" stroke="#d97706" strokeWidth={3} />
      <rect x={37} y={-79} width={6} height={6} rx={2} fill="#d97706" />
      <g transform="translate(40 -62)">
        {/* the hand sweeps exactly one full turn during the 1-second measurement */}
        <g transform={`rotate(${counting ? 360 : 40})`} style={{ transition: counting ? 'transform 1s linear' : 'none' }}>
          <line x1={0} y1={0} x2={0} y2={-8} stroke="#b45309" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      </g>
      {motion && !counting && (
        <circle cx={40} cy={-62} r={17} fill="none" stroke="#f59e0b" strokeWidth={2.4}>
          <animate attributeName="opacity" values="0.9;0.15;0.9" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="r" values="15;20;15" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

/** Page 3: the electrons really rush (JS simulation) — tap the stopwatch and
 *  the detective counts ONE REAL second: every actual crossing of the dashed
 *  gate is detected in the simulation and the measured number (the strength
 *  of the current) is displayed. */
export function AmpereDetectiveScene({ image }: { image: string }) {
  const { tx, lang } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'done'>('idle');
  const [count, setCount] = useState(0);
  const [xs, setXs] = useState<number[]>(() => Array.from({ length: AMP3_N }, (_, i) => AMP3_X0 - i * AMP3_SPACING)); // electron positions (render copy)
  const tRef = useRef(0); // simulation clock (seconds)
  const xsRef = useRef<number[]>(Array.from({ length: AMP3_N }, (_, i) => AMP3_X0 - i * AMP3_SPACING));
  const winRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tRef.current += dt;
      const xs = xsRef.current;
      for (let i = 0; i < xs.length; i++) {
        const prev = xs[i];
        const nx = prev - AMP3_SPEED * dt;
        if (winRef.current && prev > AMP3_GATE_X && nx <= AMP3_GATE_X) {
          // exact crossing time — the motion inside a frame is linear
          const f = (prev - AMP3_GATE_X) / (prev - nx);
          const tcross = tRef.current - dt * (1 - f);
          if (tcross >= winRef.current.start && tcross < winRef.current.end) {
            setCount((c) => c + 1);
            sfx.blip();
          }
        }
        xs[i] = nx < AMP3_X0 - AMP3_SPAN ? nx + AMP3_SPAN : nx;
      }
      if (winRef.current && tRef.current >= winRef.current.end) {
        winRef.current = null;
        setPhase('done');
        window.setTimeout(() => sfx.sparkle(), 250);
      }
      setXs([...xs]);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const measure = () => {
    if (phase === 'counting') return;
    setCount(0);
    winRef.current = { start: tRef.current, end: tRef.current + 1 };
    setPhase('counting');
    sfx.click();
  };

  const resultText =
    lang === 'fa' ? `${faNum(count)} الکترون در ۱ ثانیه!` : `${count} electrons in 1 second!`;
  const statusStr =
    phase === 'done'
      ? lang === 'fa'
        ? `در یک ثانیه ${faNum(count)} الکترون رد شد! این عدد، شدتِ جریانه! 🕒✨`
        : `${count} electrons crossed in one second — that number is the current! 🕒✨`
      : tx(phase === 'counting' ? AMP3_COUNTING : AMP3_IDLE);

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">⏱️ {tx(AMP3_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={statusStr}
        onClick={measure}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            measure();
          }
        }}
        style={{ outline: 'none' }}
      >
        <defs>
          <radialGradient id="amp-e-grad" cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </radialGradient>
        </defs>

        {/* the transparent pipe */}
        <rect x={30} y={172} width={580} height={56} rx={28} fill="#e0f2fe" opacity={0.85} stroke="#7dd3fc" strokeWidth={3} />
        <line x1={54} y1={188} x2={586} y2={188} stroke="#f0f9ff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />

        {/* the fast electron stream — real positions from the rAF simulation */}
        {xs.map((x, i) => (
          <g key={i} transform={`translate(${x.toFixed(1)} ${200 + AMP3_JITTER[i]})`}>
            <FlowElectron motion={motion} fast grad="amp-e-grad" />
          </g>
        ))}

        {/* the counting gate */}
        <line x1={AMP3_GATE_X} y1={150} x2={AMP3_GATE_X} y2={250} stroke={phase === 'done' ? '#f43f5e' : '#0ea5e9'} strokeWidth={3} strokeDasharray="7 7" strokeLinecap="round" />
        {phase !== 'idle' && (
          <text x={AMP3_GATE_X} y={140} fontSize={17} textAnchor="middle" opacity={0.9}>🔍</text>
        )}

        {/* one bubble per electron that REALLY crossed during this second */}
        {phase !== 'idle' &&
          Array.from({ length: Math.min(count, 9) }).map((_, i) => (
            <g key={i} className={motion ? 'cq-pop' : ''}>
              <circle cx={336 + i * 34} cy={100} r={15} fill="#ffffff" stroke={phase === 'done' ? '#f43f5e' : '#0ea5e9'} strokeWidth={3} />
              <text x={336 + i * 34} y={105.5} fontSize={14} fontWeight="bold" textAnchor="middle" fill="#0f172a">
                {faNum(i + 1)}
              </text>
            </g>
          ))}

        {/* the result chip: the real measured number */}
        {phase === 'done' && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={92} y={58} width={216} height={40} rx={20} fill="#fff1f2" stroke="#f43f5e" strokeWidth={2.6} />
            <text x={200} y={84} fontSize={16} fontWeight="bold" textAnchor="middle" fill="#be123c">{resultText}</text>
          </g>
        )}

        {/* the detective beside the pipe (right side) */}
        <ellipse cx={560} cy={262} rx={52} ry={10} fill="#e2e8f0" />
        <g transform="translate(560 256)">
          <g className={motion && phase === 'idle' ? 'cq-float' : ''} style={{ animationDuration: '2.6s' }}>
            <AmpDetective counting={phase === 'counting'} motion={motion} />
          </g>
        </g>
        {phase === 'idle' && motion && (
          <text x={560} y={140} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${phase === 'done' ? 'text-rose-600' : phase === 'counting' ? 'text-sky-600' : 'text-slate-500'}`}>
        {statusStr}
      </p>
    </div>
  );
}

/* ------------------------------------------ page 4 · voltage-current-team (l0-8) */

const TEAM4_HINT = L(
  'Use the up and down arrows to make the voltage weaker or stronger and watch the current follow!',
  'با فلشِ رو به بالا و رو به پایین، ولتاژ رو کم و زیاد کن و ببین جریان چطور همراهیش می‌کنه!',
);
const TEAM4_L0 = L(
  'Low voltage: only a few runners set off calmly (a small current) 🚶',
  'ولتاژ کم: فقط چند تا دوندهٔ آروم راه افتادن (جریان کم) 🚶',
);
const TEAM4_L1 = L(
  'More voltage: more runners, running faster! The current grew too 🏃‍♂️💨',
  'ولتاژ بیشتر شد: دونده‌های بیشتر و تندتر! جریان هم زیادتر شد 🏃‍♂️💨',
);
const TEAM4_L2 = L(
  'Full-power voltage: the whole team runs together — a very big current! 🏆⚡',
  'ولتاژ پرقدرت: کل تیم با هم می‌دوند — جریانِ خیلی زیاد! 🏆⚡',
);
const TEAM4_UP_BTN = L('⬆️ More voltage', '⬆️ ولتاژ بیشتر');
const TEAM4_DOWN_BTN = L('⬇️ Less voltage', '⬇️ ولتاژ کمتر');
const TEAM4_VOLT_LABEL = [
  L('⚡ Voltage: low', '⚡ ولتاژ: کم'),
  L('⚡ Voltage: medium', '⚡ ولتاژ: متوسط'),
  L('⚡ Voltage: high', '⚡ ولتاژ: زیاد'),
] as const;
/** voltage gauge fill height (px) & color per level */
const TEAM4_GAUGE_H = [44, 89, 134] as const;
const TEAM4_GAUGE_C = ['#38bdf8', '#f59e0b', '#f43f5e'] as const;
const TEAM4_TEAM_LABEL = [
  L('👥 Runners: 3', '👥 دونده‌ها: ۳'),
  L('👥 Runners: 5', '👥 دونده‌ها: ۵'),
  L('👥 Runners: 7', '👥 دونده‌ها: ۷'),
] as const;
/** the wide stadium track the runner electrons loop around */
const TEAM4_LOOP = 'M 120 186 A 200 86 0 1 0 520 186 A 200 86 0 1 0 120 186';
const TEAM4_DUR = [3.2, 1.9, 1.05] as const;

/** Page 4: the voltage hero and the runner team — with up/down arrows the
 *  student sets the voltage; more push means more runners moving faster:
 *  voltage and current always work together. */
export function VoltageCurrentTeamScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [level, setLevel] = useState(0);

  const step = (dir: 1 | -1) => {
    setLevel((was) => {
      const next = Math.min(2, Math.max(0, was + dir));
      if (next === was) return was;
      if (dir === 1) {
        if (next === 1) sfx.whoosh();
        else {
          sfx.powerup();
          window.setTimeout(() => sfx.sparkle(), 400);
        }
      } else {
        sfx.click();
      }
      return next;
    });
  };

  const status = level === 0 ? TEAM4_L0 : level === 1 ? TEAM4_L1 : TEAM4_L2;
  const runners = [3, 5, 7][level];
  const dur = TEAM4_DUR[level];

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('The voltage superhero gently pushing a large team of cheerful blue electron runners along a circuit track', 'ابرقهرمانِ ولتاژ که تیم بزرگ دونده‌های آبیِ خندان را روی مسیر مدار به جلو هول میدهد'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🤝 {tx(TEAM4_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        {/* the stadium track (the circuit road) */}
        <path d={TEAM4_LOOP} fill="none" stroke="#475569" strokeWidth={16} strokeLinecap="round" opacity={0.18} />
        <path d={TEAM4_LOOP} fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d={TEAM4_LOOP} fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />

        {/* the runner electrons — more of them, faster every level */}
        {Array.from({ length: runners }).map((_, i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={`${dur}s`} begin={`-${((i * dur) / runners).toFixed(2)}s`} repeatCount="indefinite" path={TEAM4_LOOP} />
            )}
            <circle cx={0} cy={0} r={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {level >= 1 && motion && (
          <>
            <text x={300} y={92} fontSize={20} className="cq-float" style={{ animationDelay: '0.2s' }}>💨</text>
            <text x={340} y={288} fontSize={17} className="cq-float">💨</text>
          </>
        )}
        {level === 2 && motion && (
          <>
            <text x={130} y={82} fontSize={22} className="cq-float">✨</text>
            <text x={490} y={300} fontSize={18} className="cq-float" style={{ animationDelay: '0.4s' }}>🌟</text>
          </>
        )}

        {/* the voltage hero behind the team (right side), pushing harder each level */}
        <g transform={`translate(${566 + level * 6} 262)`} style={{ transition: motion ? 'transform .4s ease-out' : 'none' }}>
          <g className={motion ? 'cq-float' : ''} style={{ animationDuration: '2.4s' }}>
            <VoltageHero pushing={level > 0} motion={motion} />
          </g>
        </g>
        {level === 0 && motion && (
          <text x={566} y={104} fontSize={24} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}

        {/* the team counter chip (top left) */}
        <g>
          <rect x={20} y={12} width={132} height={26} rx={13} fill="#ffffff" stroke="#f59e0b" strokeWidth={2.2} />
          <text x={86} y={30} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#b45309">{tx(TEAM4_TEAM_LABEL[level])}</text>
        </g>

        {/* the voltage chip (top right) — follows the arrows */}
        <rect x={468} y={12} width={152} height={26} rx={13} fill="#ffffff" stroke={TEAM4_GAUGE_C[level]} strokeWidth={2.2} />
        <text x={544} y={30} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill={level === 2 ? '#be123c' : level === 1 ? '#b45309' : '#0369a1'}>
          {tx(TEAM4_VOLT_LABEL[level])}
        </text>

        {/* the voltage gauge (left) — fills up as the voltage grows */}
        <text x={47} y={82} fontSize={17} textAnchor="middle">⚡</text>
        <rect x={36} y={90} width={22} height={140} rx={11} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2} />
        <rect
          x={39}
          y={228 - TEAM4_GAUGE_H[level]}
          width={16}
          height={TEAM4_GAUGE_H[level]}
          rx={8}
          fill={TEAM4_GAUGE_C[level]}
          style={{ transition: motion ? 'y .4s ease-out, height .4s ease-out' : 'none' }}
        />
      </svg>
      <p className={`text-center text-sm font-extrabold ${level === 2 ? 'text-teal-700' : level === 1 ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <div className="flex gap-2">
        <Button
          onClick={() => step(1)}
          disabled={level >= 2}
          aria-label={tx(TEAM4_UP_BTN)}
          className="h-12 flex-1 bg-amber-500 font-extrabold hover:bg-amber-600"
        >
          {tx(TEAM4_UP_BTN)}
        </Button>
        <Button
          onClick={() => step(-1)}
          disabled={level <= 0}
          aria-label={tx(TEAM4_DOWN_BTN)}
          className="h-12 flex-1 bg-slate-600 font-extrabold hover:bg-slate-700"
        >
          {tx(TEAM4_DOWN_BTN)}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------- page 1 · narrow-road (l0-9) */

const ROAD1_HINT = L(
  'Tap the resistor so it lands on the road and calms the electrons!',
  'روی مقاومت بزن تا بیفته روی جاده و الکترون‌ها رو آروم کنه!',
);
const ROAD1_IDLE = L(
  'The electrons are rushing too fast and too crowded — the resistor is not on the road yet! 🛑',
  'الکترون‌ها دارن خیلی تند و شلوغ می‌دون؛ مقاومت هنوز روی جاده قرار نگرفته! 🛑',
);
const ROAD1_QUOTE = L(
  'Slow down kids! Go gently so you don\u2019t hurt the parts!',
  'آروم‌تر بچه‌ها! یواش‌تر برید تا به قطعات آسیب نرسونید!',
);
const ROAD1_DONE = L(
  'See? The resistor speed bump made the electron line calm and orderly! 🚧✨',
  'دیدی؟ سرعت‌گیرِ مقاومت صفِ الکترون‌ها رو منظم و آروم کرد! 🚧✨',
);

/** the friendly striped resistor guard (local coords: feet at 0,0) */
function ResistorGuard({ calm }: { calm: boolean }) {
  return (
    <g>
      {/* wire leads */}
      <rect x={-50} y={-26} width={18} height={7} rx={3.5} fill="#94a3b8" />
      <rect x={32} y={-26} width={18} height={7} rx={3.5} fill="#94a3b8" />
      {/* body — a touch longer so it reads as a real resistor */}
      <rect x={-32} y={-58} width={64} height={46} rx={16} fill="#e7d3b1" stroke="#b79b74" strokeWidth={2.8} />
      {/* the four color bands */}
      <rect x={-23} y={-58} width={7} height={46} fill="#ef4444" />
      <rect x={-10} y={-58} width={7} height={46} fill="#ef4444" />
      <rect x={3} y={-58} width={7} height={46} fill="#92400e" />
      <rect x={16} y={-58} width={7} height={46} fill="#eab308" />
      {/* legs */}
      <rect x={-19} y={-12} width={11} height={12} rx={5} fill="#b79b74" />
      <rect x={8} y={-12} width={11} height={12} rx={5} fill="#b79b74" />
      {/* face */}
      <circle cx={-8} cy={-46} r={2.8} fill="#57350f" />
      <circle cx={8} cy={-46} r={2.8} fill="#57350f" />
      {calm ? (
        <path d="M -7 -34 Q 0 -27 7 -34" stroke="#57350f" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -6 -35 Q 0 -30 6 -35" stroke="#57350f" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

/** Page 1: the rushing electrons meet the resistor speed bump — tap it and the
 *  whole line calms down into one neat, orderly queue. */
export function NarrowRoadScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [calm, setCalm] = useState(false);
  const [quote, setQuote] = useState(false);
  const quoteTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (quoteTimer.current !== null) window.clearTimeout(quoteTimer.current);
  }, []);

  const tap = () => {
    if (quoteTimer.current !== null) window.clearTimeout(quoteTimer.current);
    setCalm((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
    if (!calm) {
      setQuote(true);
      quoteTimer.current = window.setTimeout(() => setQuote(false), 1800);
    } else {
      setQuote(false);
    }
  };

  const status = calm ? ROAD1_DONE : ROAD1_IDLE;
  const runners = calm ? 3 : 6;
  const dur = calm ? 2.6 : 0.9;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A friendly striped resistor character slowing down running blue electrons at a narrow section of the circuit road', 'مقاومتِ راه‌راهِ مهربون که الکترون‌های دوندگان رو در تنگهٔ جادهٔ مدار آروم می‌کنه'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🛑 {tx(ROAD1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the guard's quote bubble */}
        {quote && (
          <g>
            <rect x={150} y={26} width={340} height={38} rx={19} fill="#fffbeb" stroke="#f59e0b" strokeWidth={2.5} />
            <path d="M 306 62 L 296 80 L 326 62 Z" fill="#fffbeb" stroke="#f59e0b" strokeWidth={2.5} strokeLinejoin="round" />
            <text x={320} y={51} fontSize={14.5} fontWeight="bold" textAnchor="middle" fill="#92400e">{tx(ROAD1_QUOTE)}</text>
          </g>
        )}
        {/* the wire road — narrows in the middle (the speed bump section) */}
        <rect x={30} y={224} width={580} height={30} rx={15} fill="#475569" />
        <rect x={38} y={230} width={564} height={9} rx={4.5} fill="#94a3b8" opacity={0.8} />
        {/* the narrow middle: shoulders squeeze in */}
        <path d="M 258 224 L 286 236 L 286 242 L 258 254 Z" fill="#334155" />
        <path d="M 382 224 L 354 236 L 354 242 L 382 254 Z" fill="#334155" />
        <ellipse cx={320} cy={296} rx={260} ry={13} fill="#e2e8f0" />
        {/* the lamp at the end (left) */}
        <rect x={52} y={192} width={10} height={40} rx={5} fill="#64748b" />
        <circle cx={57} cy={176} r={19} fill={calm ? '#fde047' : '#f1f5f9'} stroke={calm ? '#eab308' : '#cbd5e1'} strokeWidth={3} />
        {!calm && <text x={82} y={168} fontSize={13}>💤</text>}
        {calm && motion && (
          <circle cx={57} cy={176} r={25} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="22;31;22" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}
        {/* landing target on the narrow section — visible until the resistor lands */}
        {!calm && (
          <rect x={284} y={223} width={72} height={32} rx={9} fill="#fde68a" fillOpacity={0.2} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="7 6" />
        )}
        {/* soft shadow under the floating resistor — it is clearly not on the wire yet */}
        {!calm && <ellipse cx={320} cy={251} rx={33} ry={6} fill="#0f172a" opacity={0.15} />}
        {/* the electron runners — fast & crowded → slow & orderly */}
        {Array.from({ length: runners }).map((_, i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`run-${calm}-${i}`} dur={`${dur}s`} begin={`-${((i * dur) / runners).toFixed(2)}s`} repeatCount="indefinite" path="M 620 239 L 76 239" />
            )}
            <circle cx={0} cy={0} r={calm ? 9 : 11} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {!calm && motion && (
          <>
            <text x={470} y={204} fontSize={19} className="cq-float">💨</text>
            <text x={520} y={186} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>💨</text>
          </>
        )}
        {calm && motion && (
          <>
            <text x={200} y={188} fontSize={20} className="cq-float">✨</text>
            <text x={430} y={182} fontSize={16} className="cq-float" style={{ animationDelay: '0.4s' }}>🌟</text>
          </>
        )}
        {/* the resistor guard — hovers high above the road until tapped, then lands on it */}
        <g style={{ transform: `translate(320px, ${calm ? 254 : 204}px)`, transition: motion ? 'transform .55s cubic-bezier(0.3, 1.4, 0.5, 1)' : 'none' }}>
          <g className={motion && !calm ? 'cq-float' : ''} style={{ animationDuration: '2.4s' }}>
            <ResistorGuard calm={calm} />
          </g>
        </g>
        {!calm && motion && (
          <text x={320} y={124} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${calm ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------------- page 2 · pinch-pipe (l0-9) */

const PIPE2_HINT = L(
  'Pinch the pipe and watch the water pressure and volume drop!',
  'لوله رو باریک کن تا فشار و حجم آب کم بشه!',
);
const PIPE2_L0 = L(
  'A wide hose: lots of water rushes out — and in the wire the current is rich too 🌊',
  'شیلنگ پهنه: آب با حجم زیاد می‌ریزه؛ توی سیم هم جریانِ پرآبه 🌊',
);
const PIPE2_L1 = L(
  'The pipe got narrow! Less, calmer water comes — the resistor does exactly the same to electricity 🤏',
  'لوله باریک شد! آب کمتر و کنترل‌شده‌تر میاد — مقاومت هم دقیقاً همین کارو با برق می‌کنه 🤏',
);
const PIPE2_L2 = L(
  'A very tight pipe: just a tiny thread of water! The resistor never lets too much current rush through at once 💧',
  'لولهٔ خیلی تنگ: فقط یک رگهٔ کوچیک آب! مقاومت اجازه نمیده جریانِ زیادی یک‌دفعه رد بشه 💧',
);
const PIPE2_BTN = [L('🤏 Pinch the pipe', '🤏 لوله رو باریک کن'), L('🤏 Even narrower!', '🤏 باز هم باریک‌تر!'), L('↩️ Let it open wide', '↩️ بگردونش پهن پهن')];
const PIPE2_HOSE_LABEL = L('💧 The hose', '💧 شیلنگ');
const PIPE2_WIRE_LABEL = L('⚡ The resistor', '⚡ مقاومت');

/** water stream width / drop count / electron count & durations per pinch level */
const PIPE2_WATER_W = [10, 6, 3] as const;
const PIPE2_DROP_DUR = [2.4, 3.4, 4.6] as const;
const PIPE2_E_COUNT = [6, 4, 2] as const;
const PIPE2_E_DUR = [1.3, 1.9, 2.7] as const;
const PIPE2_HOSE = 'M 508 96 Q 500 150 468 190 Q 440 226 392 248';
const PIPE2_LOOP = 'M 138 224 V 136 Q 138 110 160 110 Q 182 110 182 136 V 224 Q 182 246 160 246 Q 138 246 138 224 Z';

/** Page 2: pinch the hose → less water; the striped resistor squeezes the wire
 *  the very same way → fewer, calmer electrons. */
export function PinchPipeScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [level, setLevel] = useState(0);

  const cycle = () => {
    setLevel((was) => {
      const next = was >= 2 ? 0 : was + 1;
      if (next === 0) sfx.click();
      else if (next === 1) sfx.whoosh();
      else {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      }
      return next;
    });
  };

  const status = level === 0 ? PIPE2_L0 : level === 1 ? PIPE2_L1 : PIPE2_L2;
  const eCount = PIPE2_E_COUNT[level];
  const eDur = PIPE2_E_DUR[level];
  const dropCount = [5, 3, 2][level];
  const pinchGap = [30, 20, 11][level];
  const lampFill = ['#fde047', '#fef08a', '#f1f5f9'][level];

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A split comparison: a hand pinching a water hose on the right, a striped resistor narrowing the electron passage in a transparent wire on the left', 'مقایسهٔ دو تکه: دستی که شیلنگ آب را در سمت راست باریک می‌کند و مقاومتِ راه‌راه که در سمت چپ راه الکترون‌ها را تنگ کرده'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🚰 {tx(PIPE2_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <defs>
          <linearGradient id="cqPipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <line x1={320} y1={44} x2={320} y2={284} stroke="#cbd5e1" strokeWidth={2.5} strokeDasharray="8 9" />
        <rect x={16} y={290} width={608} height={13} rx={6.5} fill="#e2e8f0" />

        {/* ===== right half: the hose with a pinch in the middle ===== */}
        {/* the tap */}
        <rect x={492} y={60} width={14} height={40} rx={6} fill="#475569" />
        <rect x={486} y={54} width={44} height={14} rx={7} fill="#475569" />
        {/* the hose */}
        <path d={PIPE2_HOSE} fill="none" stroke="#16a34a" strokeWidth={PIPE2_WATER_W[level] + 12} strokeLinecap="round"
          style={{ transition: motion ? 'stroke-width .55s ease' : 'none' }} />
        <path d={PIPE2_HOSE} fill="none" stroke="url(#cqPipe)" strokeWidth={PIPE2_WATER_W[level]} strokeLinecap="round"
          style={{ transition: motion ? 'stroke-width .55s ease' : 'none' }} />
        {/* the pinching fingers — close in with every level */}
        <g transform="translate(468 190) rotate(-38)">
          <rect x={-8} y={-pinchGap - 13} width={16} height={26} rx={8} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2}
            style={{ transition: motion ? 'all .55s ease' : 'none' }} />
          <rect x={-8} y={pinchGap - 13} width={16} height={26} rx={8} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2}
            style={{ transition: motion ? 'all .55s ease' : 'none' }} />
        </g>
        {level === 2 && <text x={496} y={186} fontSize={21} className={motion ? 'cq-float' : ''}>🤏</text>}
        {/* water drops along the hose — fewer & slower with every pinch */}
        {Array.from({ length: dropCount }).map((_, i) => (
          <g key={`${level}-${i}`}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={`${PIPE2_DROP_DUR[level]}s`} begin={`-${((i * PIPE2_DROP_DUR[level]) / dropCount).toFixed(2)}s`} repeatCount="indefinite" path={PIPE2_HOSE} />
            )}
            <circle cx={0} cy={0} r={3.8} fill="#0ea5e9" opacity={0.95} />
          </g>
        ))}
        {/* the pool — shrinks with every pinch */}
        <ellipse cx={392} cy={266} rx={40 - level * 9} ry={11 - level * 2.4} fill="url(#cqPipe)" opacity={0.9}
          style={{ transition: motion ? 'all .55s ease' : 'none' }} />

        {/* ===== left half: the wire with the resistor squeezing it ===== */}
        <path d={PIPE2_LOOP} fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d={PIPE2_LOOP} fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        {/* the little striped resistor on the bottom segment */}
        <g transform="translate(160 246)">
          <rect x={-22} y={-9} width={44} height={18} rx={7} fill="#e7d3b1" stroke="#b79b74" strokeWidth={2.4} />
          <rect x={-13} y={-9} width={6} height={18} fill="#ef4444" />
          <rect x={-3} y={-9} width={6} height={18} fill="#ef4444" />
          <rect x={7} y={-9} width={6} height={18} fill="#92400e" />
        </g>
        {/* electrons — fewer & slower with every pinch */}
        {Array.from({ length: eCount }).map((_, i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`${level}-${i}`} dur={`${eDur}s`} begin={`-${((i * eDur) / eCount).toFixed(2)}s`} repeatCount="indefinite" path={PIPE2_LOOP} />
            )}
            <circle cx={0} cy={0} r={8} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.4} r={1.4} fill="#0c4a6e" />
            <path d="M -2.4 1.8 Q 0 4 2.4 1.8" stroke="#0c4a6e" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* the lamp at the top — dimmer with every pinch */}
        <g transform="translate(160 110)">
          <rect x={-10} y={14} width={20} height={10} rx={4} fill="#94a3b8" />
          <circle cx={0} cy={0} r={20} fill={lampFill} stroke={level === 2 ? '#cbd5e1' : '#eab308'} strokeWidth={3} />
          {level === 2 && <text x={22} y={-8} fontSize={13}>💤</text>}
          {level === 0 && motion && (
            <circle cx={0} cy={0} r={27} fill="#fde047" opacity={0.25}>
              <animate attributeName="r" values="24;31;24" dur="0.9s" repeatCount="indefinite" />
            </circle>
          )}
          {level === 0 && motion && <text x={-52} y={-18} fontSize={18} className="cq-float">✨</text>}
        </g>

        {/* half labels */}
        <g>
          <rect x={434} y={8} width={112} height={24} rx={12} fill="#ffffff" stroke="#16a34a" strokeWidth={2} />
          <text x={490} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(PIPE2_HOSE_LABEL)}</text>
        </g>
        <g>
          <rect x={92} y={8} width={136} height={24} rx={12} fill="#ffffff" stroke="#f59e0b" strokeWidth={2} />
          <text x={160} y={24.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#b45309">{tx(PIPE2_WIRE_LABEL)}</text>
        </g>
      </svg>
      <p className={`text-center text-sm font-extrabold ${level === 2 ? 'text-teal-700' : level === 1 ? 'text-sky-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
      <Button onClick={cycle} className="h-12 w-full bg-emerald-600 font-extrabold hover:bg-emerald-700">
        {tx(PIPE2_BTN[level])}
      </Button>
    </div>
  );
}

/* ---------------------------------------------- page 3 · led-bodyguard (l0-9) */

const GUARD3_HINT = L(
  'Drag the resistor onto the wire, right before the LED!',
  'مقاومت رو بکش روی سیم، درست قبل از LED!',
);
const GUARD3_FLOAT_TAG = L('I am not on the wire yet!', 'من هنوز روی سیم نیستم!');
const GUARD3_BARE = L(
  'Without a resistor: the huge current hits the LED directly — it is getting hot and about to burn! 🥵🔥',
  'بدون مقاومت: جریانِ خیلی زیاد مستقیم به LED می‌رسه؛ LED داره داغ میشه و می‌سوزه! 🥵🔥',
);
const GUARD3_GUARDED = L(
  'With the resistor bodyguard: only a small, safe current passes — the LED stays on, smiling and bright! 🛡️😄',
  'با بادیگاردِ مقاومت: فقط جریانِ کم و امن رد میشه؛ LED خندان و پرنور روشن موند! 🛡️😄',
);
const GUARD3_BTN = [L('🛡️ Put the resistor in front', '🛡️ مقاومت رو بذار جلوی LED'), L('↩️ Take the resistor out', '↩️ مقاومت رو بردار')];

/** drag & drop geometry (svg coords; x/y = the guard's feet) */
const GUARD3_OFF = { x: 468, y: 188 } as const;
const GUARD3_ON = { x: 300, y: 250 } as const;
const GUARD3_ZONE = { x: 262, y: 222, w: 76, h: 34 } as const;
const GUARD3_HIT = { x: 246, y: 184, w: 108, h: 94 } as const;

/** the brave resistor bodyguard with a shield (local coords: feet at 0,0) */
function ResistorBodyguard({ motion = true }: { motion?: boolean }) {
  return (
    <g>
      {/* cape */}
      <path d="M -22 -70 Q -48 -34 -36 4 Q -18 -6 -6 -2 Q -18 -36 -12 -68 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth={2.4} />
      {/* striped body */}
      <rect x={-24} y={-70} width={48} height={46} rx={16} fill="#e7d3b1" stroke="#b79b74" strokeWidth={2.8} />
      <rect x={-16} y={-70} width={7} height={46} fill="#ef4444" />
      <rect x={-5} y={-70} width={7} height={46} fill="#ef4444" />
      <rect x={6} y={-70} width={7} height={46} fill="#92400e" />
      {/* shield arm toward the surge (right side) */}
      <rect x={16} y={-62} width={30} height={10} rx={5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={1.8} transform="rotate(-16 16 -62)" />
      <ellipse cx={54} cy={-40} rx={17} ry={26} fill="#38bdf8" stroke="#0369a1" strokeWidth={3.2} />
      <ellipse cx={54} cy={-40} rx={10} ry={17} fill="#7dd3fc" opacity={0.8} />
      {/* legs + boots */}
      <rect x={-15} y={-24} width={12} height={16} rx={5} fill="#b79b74" />
      <rect x={4} y={-24} width={12} height={16} rx={5} fill="#b79b74" />
      <rect x={-19} y={-10} width={19} height={10} rx={5} fill="#7c2d12" />
      <rect x={1} y={-10} width={19} height={10} rx={5} fill="#7c2d12" />
      {/* proud face */}
      <circle cx={-8} cy={-56} r={2.8} fill="#57350f" />
      <circle cx={8} cy={-56} r={2.8} fill="#57350f" />
      <path d="M -6 -45 Q 0 -39 6 -45" stroke="#57350f" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {motion && (
        <circle cx={-30} cy={-62} r={2.4} fill="#fef3c7" opacity={0.9} />
      )}
    </g>
  );
}

/** Page 3: the resistor bodyguard floats beside the wire — drag it (or tap it)
 *  onto the drop zone before the LED: without it the LED burns hot, with it
 *  only a small safe current passes and the LED smiles. */
export function LedBodyguardScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [placed, setPlaced] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const moved = useRef(false);
  const suppressClick = useRef(false);

  const toggle = () => {
    setPlaced((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const toSvg = (clientX: number, clientY: number) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const overHit = (p: { x: number; y: number }) =>
    p.x >= GUARD3_HIT.x && p.x <= GUARD3_HIT.x + GUARD3_HIT.w &&
    p.y >= GUARD3_HIT.y && p.y <= GUARD3_HIT.y + GUARD3_HIT.h;

  const onGuardDown = (e: ReactPointerEvent<SVGGElement>) => {
    moved.current = false;
    if (placed) return; // a simple tap on the placed guard is handled by click
    e.preventDefault();
    const p = toSvg(e.clientX, e.clientY);
    if (!p) return;
    grab.current = { dx: GUARD3_OFF.x - p.x, dy: GUARD3_OFF.y - p.y };
    setPos({ x: GUARD3_OFF.x, y: GUARD3_OFF.y });
    setDragging(true);
    sfx.blip();
  };

  useEffect(() => {
    if (!dragging) return;
    const track = (e: PointerEvent) => {
      const p = toSvg(e.clientX, e.clientY);
      if (!p) return;
      moved.current = true;
      setPos({
        x: Math.min(606, Math.max(64, p.x + grab.current.dx)),
        y: Math.min(258, Math.max(84, p.y + grab.current.dy)),
      });
    };
    const drop = (e: PointerEvent) => {
      setDragging(false);
      const p = toSvg(e.clientX, e.clientY);
      setPos(null);
      if (!p || !moved.current) return;
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      const at = { x: p.x + grab.current.dx, y: p.y + grab.current.dy };
      if (overHit(at)) {
        setPlaced(true);
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
    };
    window.addEventListener('pointermove', track);
    window.addEventListener('pointerup', drop);
    window.addEventListener('pointercancel', drop);
    return () => {
      window.removeEventListener('pointermove', track);
      window.removeEventListener('pointerup', drop);
      window.removeEventListener('pointercancel', drop);
    };
  }, [dragging]);

  const status = placed ? GUARD3_GUARDED : GUARD3_BARE;
  const runners = placed ? 2 : 6;
  const dur = placed ? 2.4 : 0.8;
  const feet = dragging && pos ? pos : placed ? GUARD3_ON : GUARD3_OFF;
  const overZone = dragging && pos !== null && overHit(pos);

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A brave superhero resistor with a shield protecting a smiling LED bulb from a big surge of electron energy', 'مقاومتِ قهرمان با سپر که یک لامپ LED خندان را از موج بزرگ انرژی الکترون‌ها محافظت می‌کند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🦸‍♂️ {tx(GUARD3_HINT)}</p>
      <svg
        ref={svgRef}
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={() => { if (!suppressClick.current) toggle(); }}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            toggle();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the wire road */}
        <rect x={30} y={224} width={580} height={30} rx={15} fill="#475569" />
        <rect x={38} y={230} width={564} height={9} rx={4.5} fill="#94a3b8" opacity={0.8} />
        <ellipse cx={320} cy={296} rx={260} ry={13} fill="#e2e8f0" />

        {/* the LED at the end (left) */}
        <rect x={112} y={196} width={10} height={40} rx={5} fill="#64748b" />
        <circle cx={117} cy={172} r={24} fill={placed ? '#fde047' : '#fca5a5'} stroke={placed ? '#eab308' : '#ef4444'} strokeWidth={3.4} />
        {placed ? (
          <>
            <circle cx={110} cy={168} r={2.8} fill="#78350f" />
            <circle cx={124} cy={168} r={2.8} fill="#78350f" />
            <path d="M 109 178 Q 117 185 125 178" stroke="#78350f" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            {motion && (
              <circle cx={117} cy={172} r={31} fill="#fde047" opacity={0.32}>
                <animate attributeName="r" values="28;38;28" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
            {motion && <text x={66} y={136} fontSize={19} className="cq-float">✨</text>}
          </>
        ) : (
          <>
            <path d="M 110 168 L 116 174 L 110 180" stroke="#7f1d1d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            <path d="M 124 168 L 118 174 L 124 180" stroke="#7f1d1d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            <path d="M 110 182 Q 117 177 124 182" stroke="#7f1d1d" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            {motion && (
              <circle cx={117} cy={172} r={28} fill="none" stroke="#ef4444" strokeWidth={3}>
                <animate attributeName="opacity" values="0.85;0.15;0.85" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="r" values="26;33;26" dur="0.8s" repeatCount="indefinite" />
              </circle>
            )}
            {/* smoke puffs */}
            {motion && (
              <>
                <text x={86} y={128} fontSize={18} className="cq-float">💨</text>
                <text x={136} y={116} fontSize={14} className="cq-float" style={{ animationDelay: '0.5s' }}>💨</text>
              </>
            )}
            <text x={150} y={136} fontSize={19}>🥵</text>
          </>
        )}
        {/* the danger badge */}
        {!placed && (
          <g>
            <rect x={40} y={40} width={150} height={34} rx={17} fill="#fef2f2" stroke="#ef4444" strokeWidth={2.6} />
            <text x={115} y={63} fontSize={15} fontWeight="bold" textAnchor="middle" fill="#b91c1c">⚠️</text>
          </g>
        )}

        {/* the drop zone on the wire, right before the LED */}
        {!placed && (
          <rect x={GUARD3_ZONE.x} y={GUARD3_ZONE.y} width={GUARD3_ZONE.w} height={GUARD3_ZONE.h} rx={11}
            fill={overZone ? '#fbbf24' : '#fffbeb'} fillOpacity={overZone ? 0.55 : 0.25}
            stroke={overZone ? '#f59e0b' : '#fbbf24'} strokeWidth={overZone ? 3.5 : 2.5} strokeDasharray="7 6" />
        )}
        {/* dashed helper arrow: from the floating guard to the drop zone */}
        {!placed && !dragging && (
          <g opacity={0.9}>
            <path d="M 414 208 Q 366 202 342 218" fill="none" stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" strokeDasharray="6 7">
              {motion && <animate attributeName="stroke-dashoffset" values="0;-26" dur="1.1s" repeatCount="indefinite" />}
            </path>
            <path d="M 334 223 L 339 212 L 345 221 Z" fill="#f59e0b" />
          </g>
        )}
        {/* soft shadow under the floating guard */}
        {!placed && !dragging && <ellipse cx={GUARD3_OFF.x} cy={251} rx={36} ry={6} fill="#0f172a" opacity={0.15} />}
        {/* the floating tag */}
        {!placed && !dragging && (
          <g>
            <rect x={384} y={74} width={170} height={27} rx={13.5} fill="#fff7ed" stroke="#fb923c" strokeWidth={2.2} />
            <text x={469} y={92.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#c2410c">{tx(GUARD3_FLOAT_TAG)}</text>
          </g>
        )}

        {/* the electron surge — big & fast, or small & calm */}
        {Array.from({ length: runners }).map((_, i) => (
          <g key={i}>
            {motion && (
              <animateMotion key={`g-${placed}-${i}`} dur={`${dur}s`} begin={`-${((i * dur) / runners).toFixed(2)}s`} repeatCount="indefinite" path="M 630 239 L 190 239" />
            )}
            <circle cx={0} cy={0} r={placed ? 8.5 : 11.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {!placed && motion && <text x={596} y={202} fontSize={19} className="cq-float">💨</text>}

        {/* the resistor bodyguard — floats beside the wire until dragged/tapped onto it */}
        <g
          style={{
            transform: `translate(${feet.x}px, ${feet.y}px) scale(${dragging ? 1.07 : 1})`,
            transition: dragging || !motion ? 'none' : 'transform .55s cubic-bezier(0.3, 1.4, 0.5, 1)',
            cursor: dragging ? 'grabbing' : placed ? 'pointer' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onGuardDown}
        >
          <g className={motion && !placed && !dragging ? 'cq-float' : ''} style={{ animationDuration: '2.6s' }}>
            {/* invisible grab handle */}
            <rect x={-54} y={-94} width={130} height={100} fill="transparent" />
            <ResistorBodyguard motion={motion} />
          </g>
        </g>
        {!placed && !dragging && motion && (
          <text x={468} y={58} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${placed ? 'text-teal-700' : 'text-rose-600'}`}>
        {tx(status)}
      </p>
      <Button onClick={toggle} className={`h-12 w-full font-extrabold ${placed ? 'bg-slate-600 hover:bg-slate-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
        {tx(GUARD3_BTN[placed ? 1 : 0])}
      </Button>
    </div>
  );
}

/* ----------------------------------------------- page 4 · color-bands (l0-9) */

const BAND4_HINT = L(
  'Tap the red band to unlock its secret!',
  'روی نوار قرمزرنگ بزن تا رازش رو بفهمی!',
);
const BAND4_IDLE = L(
  'Tap each colorful band and it will tell you its secret meaning 🎨',
  'روی هر نوار رنگی بزن تا معنیِ رازآلودش رو بهت بگه 🎨',
);
const BAND4_ALL = L(
  'You cracked the secret code: 22 times 10 makes 220 ohms (Ω)! 🎉',
  'راز مقاومت رو گشودی: ۲۲ ضربدر ۱۰ می‌شه ۲۲۰ اُهم (Ω)! 🎉',
);
const BAND4_CHIPS = [
  L('Red = 2', 'قرمز = ۲'),
  L('Red = 2', 'قرمز = ۲'),
  L('Brown = ×10', 'قهوه‌ای = ×۱۰'),
  L('Gold = ±5%', 'طلایی = ±۵٪'),
] as const;
const BAND4_RESULT = L('22 × 10 = 220 ohms (Ω)!', '۲۲ × ۱۰ = ۲۲۰ اُهم (Ω)!');
const BAND4_BAND_LABELS = [
  L('first band: red', 'نوار اول: قرمز'),
  L('second band: red', 'نوار دوم: قرمز'),
  L('third band: brown', 'نوار سوم: قهوه‌ای'),
  L('fourth band: gold', 'نوار چهارم: طلایی'),
] as const;
const BAND4_COLORS = ['#ef4444', '#ef4444', '#92400e', '#eab308'] as const;
/** band x positions on the resistor body (center 320, body 210..430) */
const BAND4_X = [268, 312, 356, 400] as const;
/** chip x positions along the top row */
const BAND4_CHIP_X = [104, 248, 392, 536] as const;

/** Page 4: a big cartoon resistor with four real color bands (red-red-brown-gold);
 *  tap each band to reveal its digit, then the ohm secret adds up. */
export function ColorBandsScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [seen, setSeen] = useState<number[]>([]);

  const reveal = (i: number) => {
    setSeen((prev) => {
      if (prev.includes(i)) return prev;
      const next = [...prev, i];
      sfx.pop();
      if (next.length === 4) {
        window.setTimeout(() => sfx.fanfare(), 350);
        window.setTimeout(() => sfx.sparkle(), 750);
      }
      return next;
    });
  };

  const all = seen.length === 4;
  const status = all ? BAND4_ALL : BAND4_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cute resistor character with colorful bands inspecting its own stripes with a magnifying glass', 'مقاومتِ بامزه‌ای که با ذره‌بین به نوارهای رنگیِ بدنه‌اش نگاه می‌کند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🎨 {tx(BAND4_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-amber-50/60" role="img" aria-label={tx(status)}>
        {/* revealed meaning chips along the top */}
        {BAND4_CHIPS.map((chip, i) =>
          seen.includes(i) ? (
            <g key={i} className={motion ? 'cq-pop' : ''}>
              <rect x={BAND4_CHIP_X[i] - 66} y={16} width={132} height={30} rx={15} fill="#ffffff" stroke={BAND4_COLORS[i]} strokeWidth={2.6} />
              <text x={BAND4_CHIP_X[i]} y={36} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#1f2937">{tx(chip)}</text>
            </g>
          ) : null,
        )}
        {/* the result chip */}
        {all && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={190} y={62} width={260} height={38} rx={19} fill="#fff1f2" stroke="#f43f5e" strokeWidth={2.8} />
            <text x={320} y={87} fontSize={16} fontWeight="bold" textAnchor="middle" fill="#be123c">{tx(BAND4_RESULT)}</text>
          </g>
        )}

        {/* the wire through the resistor */}
        <rect x={50} y={204} width={540} height={13} rx={6.5} fill="#94a3b8" />
        {/* the resistor body */}
        <g>
          <rect x={210} y={140} width={220} height={130} rx={30} fill="#e7d3b1" stroke="#b79b74" strokeWidth={3.4} />
          <rect x={210} y={140} width={220} height={44} rx={30} fill="#f3e7cf" opacity={0.75} />
          {/* cute face */}
          <circle cx={248} cy={172} r={4.2} fill="#57350f" />
          <circle cx={392} cy={172} r={4.2} fill="#57350f" />
          <path d="M 300 190 Q 320 206 340 190" stroke="#57350f" strokeWidth={3.4} fill="none" strokeLinecap="round" />
          <circle cx={272} cy={188} r={5.5} fill="#fda4af" opacity={0.75} />
          <circle cx={368} cy={188} r={5.5} fill="#fda4af" opacity={0.75} />
        </g>
        {/* the four tappable color bands */}
        {BAND4_X.map((bx, i) => (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={tx(BAND4_BAND_LABELS[i])}
            onClick={() => reveal(i)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                reveal(i);
              }
            }}
            style={{ cursor: seen.includes(i) ? 'default' : 'pointer', outline: 'none' }}
          >
            <rect x={bx - 14} y={140} width={28} height={130} fill={BAND4_COLORS[i]} />
            {seen.includes(i) && (
              <>
                <rect x={bx - 14} y={140} width={28} height={130} fill="none" stroke="#ffffff" strokeWidth={3.4} />
                <text x={bx} y={286} fontSize={17} fontWeight="bold" textAnchor="middle" fill="#334155">
                  {['۲', '۲', '×۱۰', '±۵٪'][i]}
                </text>
              </>
            )}
            {!seen.includes(i) && motion && (
              <text x={bx} y={134} fontSize={15} textAnchor="middle">
                👆
                <animate attributeName="opacity" values="1;0.15;1" dur="1.3s" repeatCount="indefinite" />
              </text>
            )}
          </g>
        ))}
        {all && motion && (
          <>
            <text x={150} y={112} fontSize={22} className="cq-float">🎉</text>
            <text x={500} y={108} fontSize={18} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${all ? 'text-rose-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------- page 1 · battery-backpack (l0-10) */

const BAT1_HINT = L(
  'Click the battery to open the energy backpack!',
  'روی باتری کلیک کن تا کوله‌پشتی انرژی رو باز کنه!',
);
const BAT1_IDLE = L(
  'The tired electrons are waiting… the battery\u2019s energy backpack is still closed 🔋',
  'الکترون‌های خسته منتظرن… کوله‌پشتیِ انرژیِ باتری هنوز بسته‌ست 🔋',
);
const BAT1_OPEN = L(
  'The backpack opened! The electrons grabbed their energy snacks and are dashing through the wires! 🎒⚡',
  'کوله‌پشتی باز شد! الکترون‌ها خوراکیِ انرژی‌شون رو برداشتند و توی سیم‌ها می‌دوند! 🎒⚡',
);

/** Page 1: the battery is a backpack full of energy snacks — click it and the
 *  tired electrons fill up with power and dash through the wires. */
export function BatteryBackpackScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [open, setOpen] = useState(false);

  const tap = () => {
    setOpen((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = open ? BAT1_OPEN : BAT1_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cheerful battery character with a glowing backpack full of golden energy stars handing power to tiny blue electrons', 'باتریِ خندانی با کوله‌پشتیِ درخشان پر از ستاره‌های انرژی که به الکترون‌های کوچولو انرژی می‌دهد'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🔋 {tx(BAT1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the wire road */}
        <rect x={30} y={224} width={580} height={30} rx={15} fill="#475569" />
        <rect x={38} y={230} width={564} height={9} rx={4.5} fill="#94a3b8" opacity={0.8} />
        <ellipse cx={320} cy={296} rx={260} ry={13} fill="#e2e8f0" />

        {/* the lamp at the end (left) */}
        <rect x={52} y={192} width={10} height={40} rx={5} fill="#64748b" />
        <circle cx={57} cy={176} r={19} fill={open ? '#fde047' : '#f1f5f9'} stroke={open ? '#eab308' : '#cbd5e1'} strokeWidth={3} />
        {!open && <text x={82} y={168} fontSize={13}>💤</text>}
        {open && motion && (
          <circle cx={57} cy={176} r={25} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="22;31;22" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}

        {/* idle: tired electrons waiting by the road … */}
        {!open && [430, 370, 310].map((x, i) => (
          <g key={`tired-${i}`} transform={`translate(${x} 239)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.5}s`, animationDuration: '2.8s' }}>
              <circle cx={0} cy={0} r={10} fill="#7dd3fc" stroke="#0369a1" strokeWidth={2.2} />
              <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
              <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
              <path d="M -3 3.4 Q 0 0.8 3 3.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </g>
            {i === 0 && <text x={16} y={-12} fontSize={13}>💤</text>}
          </g>
        ))}
        {/* open: energized electrons dashing to the lamp! */}
        {open && Array.from({ length: 3 }).map((_, i) => (
          <g key={`run-${i}`}>
            {motion && (
              <animateMotion key={`bp-${i}`} dur="1.5s" begin={`-${(i * 0.5).toFixed(2)}s`} repeatCount="indefinite" path="M 470 239 L 76 239" />
            )}
            <circle cx={0} cy={0} r={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* energy stars flying when the backpack is open */}
        {open && motion && (
          <>
            <text x={470} y={190} fontSize={20} className="cq-float">⭐</text>
            <text x={250} y={182} fontSize={17} className="cq-float" style={{ animationDelay: '0.3s' }}>✨</text>
            <text x={150} y={196} fontSize={15} className="cq-float" style={{ animationDelay: '0.6s' }}>⭐</text>
          </>
        )}

        {/* the battery friend with the energy backpack (feet at 0,0) */}
        <g transform="translate(540 252)">
          {/* the backpack on its back */}
          <rect x={30} y={-84} width={44} height={54} rx={13} fill="#f59e0b" stroke="#b45309" strokeWidth={2.6} />
          <rect x={26} y={-74} width={8} height={30} rx={4} fill="#b45309" />
          {/* the flap — swings open like a lid */}
          <rect x={30} y={-84} width={44} height={22} rx={11} fill="#d97706" stroke="#b45309" strokeWidth={2}
            transform={open ? 'rotate(-150 52 -84)' : 'rotate(0 52 -84)'}
            style={{ transition: motion ? 'transform .45s ease-out' : 'none' }} />
          {open && motion && (
            <>
              <text x={34} y={-98} fontSize={15} className="cq-float">⭐</text>
              <text x={50} y={-110} fontSize={18} className="cq-float" style={{ animationDelay: '0.2s' }}>⭐</text>
              <text x={66} y={-96} fontSize={13} className="cq-float" style={{ animationDelay: '0.45s' }}>✨</text>
            </>
          )}
          {/* body */}
          <rect x={-11} y={-118} width={22} height={13} rx={4} fill="#94a3b8" />
          <rect x={-34} y={-106} width={68} height={14} rx={6} fill="#64748b" />
          <rect x={-34} y={-92} width={68} height={84} rx={15} fill="#4ade80" stroke="#15803d" strokeWidth={3} />
          <rect x={-34} y={-92} width={68} height={24} rx={14} fill="#86efac" opacity={0.6} />
          {/* offering arm toward the electrons (left) */}
          <rect x={-58} y={-68} width={28} height={11} rx={5.5} fill="#4ade80" stroke="#15803d" strokeWidth={2} transform="rotate(-14 -30 -62)" />
          {/* face */}
          <circle cx={-12} cy={-64} r={3} fill="#14532d" />
          <circle cx={12} cy={-64} r={3} fill="#14532d" />
          <path d="M -8 -50 Q 0 -42 8 -50" stroke="#14532d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <circle cx={-20} cy={-52} r={4.5} fill="#fda4af" opacity={0.8} />
          <circle cx={20} cy={-52} r={4.5} fill="#fda4af" opacity={0.8} />
          {/* legs */}
          <rect x={-17} y={-8} width={12} height={12} rx={5} fill="#15803d" />
          <rect x={5} y={-8} width={12} height={12} rx={5} fill="#15803d" />
        </g>
        {!open && motion && (
          <text x={540} y={120} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${open ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 2 · battery-factory (l0-10) */

const FACT2_HINT = L(
  'Tap the chemicals to see how they turn into electricity!',
  'بزن روی مواد شیمیایی تا ببینی چطور به برق تبدیل می‌شن!',
);
const FACT2_IDLE = L(
  'Inside the battery there are special chemical materials — tap them to start the game! 🧪',
  'داخل باتری مواد شیمیاییِ مخصوصی هست — روشن بزن تا بازی شروع بشه! 🧪',
);
const FACT2_MIXING = L(
  'The chemicals are playing their game… chemical energy is turning into electricity! ✨',
  'مواد شیمیایی دارن بازیشون رو انجام می‌دن… انرژی شیمیایی داره به برق تبدیل میشه! ✨',
);
const FACT2_DONE = L(
  'The magical piggy bank opened: the stored energy is running in the wire as electric current! ⚡',
  'قلک جادویی باز شد: انرژیِ ذخیره‌شده به شکل جریان برق توی سیم می‌دوده! ⚡',
);
const FACT2_CHIP = L('Chemical energy → Electrical energy!', 'انرژی شیمیایی ← انرژی الکتریکی!');
const FACT2_INNER = L('Inside the battery', 'داخل باتری');
const FACT2_DROP_COLORS = ['#f87171', '#fbbf24', '#4ade80', '#c084fc'] as const;
const FACT2_DROP_X = [466, 492, 518, 544] as const;

/** Page 2: the cutaway battery — tap the chemical drops and watch them turn
 *  into electric sparks one by one, then the current runs in the wire. */
export function BatteryFactoryScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [phase, setPhase] = useState<'idle' | 'mixing' | 'done'>('idle');
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    for (const t of timers.current) window.clearTimeout(t);
  }, []);

  const tap = () => {
    if (phase === 'mixing') return;
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
    if (phase === 'done') {
      setPhase('idle');
      setStep(0);
      sfx.whoosh();
      return;
    }
    setPhase('mixing');
    setStep(0);
    sfx.click();
    for (let i = 1; i <= 4; i++) {
      timers.current.push(
        window.setTimeout(() => {
          setStep(i);
          sfx.blip();
          if (i === 4) {
            setPhase('done');
            timers.current.push(
              window.setTimeout(() => {
                sfx.powerup();
                window.setTimeout(() => sfx.sparkle(), 350);
              }, 300),
            );
          }
        }, 260 + i * 380),
      );
    }
  };

  const status = phase === 'done' ? FACT2_DONE : phase === 'mixing' ? FACT2_MIXING : FACT2_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cutaway cartoon battery showing its magical inner chemical factory turning colorful droplets into blue electric sparks', 'برشِ کارتونی باتری که کارخانهٔ جادوییِ درونش را نشان می‌دهد: قطره‌های رنگی به جرقه‌های آبی برق تبدیل می‌شوند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🧪 {tx(FACT2_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the wire road */}
        <rect x={30} y={234} width={580} height={26} rx={13} fill="#475569" />
        <rect x={38} y={239} width={564} height={8} rx={4} fill="#94a3b8" opacity={0.8} />
        <ellipse cx={320} cy={296} rx={260} ry={13} fill="#e2e8f0" />

        {/* the lamp at the end (left) */}
        <rect x={52} y={202} width={10} height={38} rx={5} fill="#64748b" />
        <circle cx={57} cy={186} r={19} fill={phase === 'done' ? '#fde047' : '#f1f5f9'} stroke={phase === 'done' ? '#eab308' : '#cbd5e1'} strokeWidth={3} />
        {phase !== 'done' && <text x={82} y={178} fontSize={13}>💤</text>}
        {phase === 'done' && motion && (
          <circle cx={57} cy={186} r={25} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="22;31;22" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}

        {/* done: the new current dashing to the lamp */}
        {phase === 'done' && Array.from({ length: 3 }).map((_, i) => (
          <g key={`cur-${i}`}>
            {motion && (
              <animateMotion key={`fc-${i}`} dur="1.6s" begin={`-${(i * 0.55).toFixed(2)}s`} repeatCount="indefinite" path="M 470 247 L 76 247" />
            )}
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* the conversion chip */}
        {phase === 'done' && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={158} y={62} width={324} height={38} rx={19} fill="#eff6ff" stroke="#0ea5e9" strokeWidth={2.8} />
            <text x={320} y={87} fontSize={15} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(FACT2_CHIP)}</text>
          </g>
        )}

        {/* the glass battery (cutaway) on little stands */}
        <rect x={468} y={216} width={10} height={22} rx={4} fill="#94a3b8" />
        <rect x={532} y={216} width={10} height={22} rx={4} fill="#94a3b8" />
        <rect x={492} y={27} width={26} height={14} rx={4} fill="#94a3b8" />
        <rect x={470} y={40} width={70} height={16} rx={6} fill="#64748b" />
        <rect x={440} y={54} width={130} height={172} rx={26} fill="#e0f2fe" fillOpacity={0.5} stroke="#64748b" strokeWidth={3.4} />
        {/* the chemical liquid */}
        <rect x={448} y={150} width={114} height={68} rx={16} fill="#fde68a" opacity={0.92} />
        <ellipse cx={505} cy={152} rx={55} ry={7} fill="#fcd34d" opacity={0.92} />
        {/* the chemical drops → electric sparks, one by one */}
        {FACT2_DROP_X.map((dx, i) => {
          const hot = i < step;
          return (
            <g key={i} transform={`translate(${dx} 186)`}>
              <g className={motion && !hot ? 'cq-float' : motion && hot ? 'cq-pop' : ''} style={{ animationDelay: `${i * 0.3}s` }}>
                {hot && <circle cx={0} cy={0} r={14} fill="#38bdf8" opacity={0.35} />}
                <circle cx={0} cy={0} r={9} fill={hot ? '#38bdf8' : FACT2_DROP_COLORS[i]} stroke={hot ? '#0369a1' : '#334155'} strokeWidth={2} />
                {hot ? (
                  <circle cx={0} cy={0} r={3.4} fill="#f0f9ff" />
                ) : (
                  <>
                    <circle cx={-2.6} cy={-1.6} r={1.5} fill="#1e293b" />
                    <circle cx={2.6} cy={-1.6} r={1.5} fill="#1e293b" />
                  </>
                )}
              </g>
            </g>
          );
        })}
        {phase === 'mixing' && motion && <text x={505} y={122} fontSize={17} textAnchor="middle" className="cq-float">✨</text>}
        {phase === 'done' && motion && <text x={505} y={98} fontSize={19} textAnchor="middle" className="cq-float">⚡</text>}

        {/* inner label */}
        <rect x={446} y={8} width={118} height={24} rx={12} fill="#ffffff" stroke="#0ea5e9" strokeWidth={2} />
        <text x={505} y={24.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(FACT2_INNER)}</text>

        {phase === 'idle' && motion && (
          <text x={505} y={132} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${phase === 'done' ? 'text-teal-700' : phase === 'mixing' ? 'text-sky-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------- page 3 · battery-terminals (l0-10) */

const TERM3_HINT = L(
  'With your finger, follow the electrons\u2019 run from the negative terminal to the positive one!',
  'با انگشت، مسیر دویدن الکترون‌ها رو از قطب منفی تا قطب مثبت دنبال کن!',
);
const TERM3_IDLE = L(
  'The electrons are lined up at the negative terminal (the flat end)… tap to send the first runner! 🏁',
  'الکترون‌ها پشت قطب منفی (تهِ صاف) صف کشیدن… بزن تا دوندهٔ اول راه بیفته! 🏁',
);
const TERM3_ONE = L(
  'One electron made the whole trip from − to + and lit the lamp! Send the next one 👉',
  'یک الکترون کل سفر از ➖ تا ➕ رو رفت و چراغ رو روشن کرد! بزن تا بعدی بره 👉',
);
const TERM3_TWO = L(
  'Two electrons made the trip! One more…',
  'دو الکترون سفر رو رفتن! یکی مونده…',
);
const TERM3_DONE = L(
  'All trips done: they started from −, lit the lamp and came back to + to recharge! 🔄✨',
  'همهٔ سفرها تموم شد: از ➖ شروع کردند، چراغ رو روشن کردند و برای شارژِ دوباره به ➕ برگشتند! 🔄✨',
);
const TERM3_POS = L('➕ Positive (bumpy top)', '➕ قطب مثبت (سرِ قلمبه)');
const TERM3_NEG = L('➖ Negative (flat bottom)', '➖ قطب منفی (تهِ صاف)');
/** the full loop: from the − terminal (battery bottom) left along the road,
 *  up past the lamp, back along the top and down into the + terminal */
const TERM3_LOOP = 'M 540 232 L 540 246 L 90 246 L 90 44 L 540 44 L 540 56';
const TERM3_QUEUE_X = [468, 428, 388] as const;
const TERM3_HOME_X = [476, 440, 404] as const;

/** Page 3: the two terminals — every tap sends one electron from the flat
 *  negative end all the way around the loop to the bumpy positive end. */
export function BatteryTerminalsScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [sent, setSent] = useState(0);
  const [arrived, setArrived] = useState(0);
  const [flying, setFlying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    for (const t of timers.current) window.clearTimeout(t);
  }, []);

  const tap = () => {
    if (flying) return;
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
    if (sent >= 3) {
      setSent(0);
      setArrived(0);
      sfx.whoosh();
      return;
    }
    setSent((s) => s + 1);
    setFlying(true);
    sfx.pop();
    timers.current.push(
      window.setTimeout(() => {
        setFlying(false);
        sfx.blip();
        setArrived((a) => {
          const n = a + 1;
          if (n === 3) {
            window.setTimeout(() => sfx.fanfare(), 250);
            window.setTimeout(() => sfx.sparkle(), 650);
          }
          return n;
        });
      }, motion ? 3000 : 700),
    );
  };

  const statuses = [TERM3_IDLE, TERM3_ONE, TERM3_TWO, TERM3_DONE] as const;
  const status = arrived >= 3 ? TERM3_DONE : statuses[arrived];
  const lit = arrived >= 1;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A tall smiling battery with a raised bumpy top and a flat bottom, with blue electron runners lined up to start their trip', 'باتریِ بلند و خندانی با سرِ قلمبهٔ برجسته و تهِ صاف، و صفی از الکترون‌های دونده که برای شروع سفر صف کشیده‌اند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🧭 {tx(TERM3_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the loop road: − (bottom of battery) ➔ lamp ➔ + (top of battery) */}
        <path d={TERM3_LOOP} fill="none" stroke="#475569" strokeWidth={16} strokeLinecap="round" opacity={0.18} />
        <path d={TERM3_LOOP} fill="none" stroke="#475569" strokeWidth={7} strokeLinecap="round" />
        <path d={TERM3_LOOP} fill="none" stroke="#94a3b8" strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={320} cy={296} rx={260} ry={13} fill="#e2e8f0" />

        {/* the lamp riding on the left side of the loop */}
        <rect x={80} y={180} width={20} height={13} rx={4} fill="#64748b" />
        <circle cx={90} cy={160} r={22} fill={lit ? '#fde047' : '#f1f5f9'} stroke={lit ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
        {!lit && <text x={116} y={150} fontSize={13}>💤</text>}
        {lit && motion && (
          <circle cx={90} cy={160} r={29} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="26;36;26" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}

        {/* the electrons waiting in line at the − terminal */}
        {TERM3_QUEUE_X.slice(0, 3 - sent).map((x, i) => (
          <g key={`q-${i}`} transform={`translate(${x} 246)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {/* the runner making the trip (one at a time) */}
        {flying && motion && (
          <g>
            <animateMotion key={`fly-${sent}`} dur="3s" repeatCount="1" fill="freeze" path={TERM3_LOOP} />
            <circle cx={0} cy={0} r={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {/* the electrons that made it home to + (recharging) */}
        {TERM3_HOME_X.slice(0, arrived).map((x, i) => (
          <g key={`h-${i}`} transform={`translate(${x} 44)`}>
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            {motion && <text x={0} y={22} fontSize={11} textAnchor="middle">⚡</text>}
          </g>
        ))}

        {/* the tall battery: bumpy + top, flat wide − bottom */}
        <g>
          <ellipse cx={540} cy={292} rx={70} ry={10} fill="#e2e8f0" />
          <rect x={524} y={52} width={32} height={17} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={508} y={68} width={64} height={20} rx={6} fill="#64748b" />
          <rect x={502} y={86} width={76} height={130} rx={16} fill="#4ade80" stroke="#15803d" strokeWidth={3.4} />
          <rect x={502} y={86} width={76} height={30} rx={15} fill="#86efac" opacity={0.55} />
          {/* the flat, wide negative end */}
          <rect x={494} y={216} width={92} height={16} rx={5} fill="#334155" stroke="#1e293b" strokeWidth={2} />
          <text x={540} y={65} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#1e293b">+</text>
          <text x={540} y={228.5} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f8fafc">−</text>
          {/* face */}
          <circle cx={526} cy={128} r={3.2} fill="#14532d" />
          <circle cx={554} cy={128} r={3.2} fill="#14532d" />
          <path d="M 532 142 Q 540 150 548 142" stroke="#14532d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <circle cx={516} cy={142} r={4.5} fill="#fda4af" opacity={0.8} />
          <circle cx={564} cy={142} r={4.5} fill="#fda4af" opacity={0.8} />
        </g>

        {/* terminal labels */}
        <rect x={424} y={8} width={202} height={26} rx={13} fill="#ffffff" stroke="#16a34a" strokeWidth={2.2} />
        <text x={525} y={25.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(TERM3_POS)}</text>
        <rect x={424} y={284} width={202} height={26} rx={13} fill="#ffffff" stroke="#475569" strokeWidth={2.2} />
        <text x={525} y={301.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(TERM3_NEG)}</text>

        {sent === 0 && arrived === 0 && motion && (
          <text x={428} y={206} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {arrived >= 3 && motion && (
          <>
            <text x={180} y={120} fontSize={22} className="cq-float">🎉</text>
            <text x={300} y={96} fontSize={17} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${arrived >= 3 ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* -------------------------------------------- page 4 · battery-family (l0-10) */

const FAM4_HINT = L(
  'Tap each battery to see its name and voltage!',
  'روی هر باتری بزن تا اسم و ولتاژش رو ببینی!',
);
const FAM4_IDLE = L(
  'The battery family is waiting to introduce themselves — tap them all! 👆',
  'خانوادهٔ باتری منتظره که خودشون رو معرفی کنن — روی همه‌شون بزن! 👆',
);
const FAM4_ALL = L(
  'You know the whole battery family — and remember: never open their shell! ⚠️🔋',
  'کل خانوادهٔ باتری رو می‌شناسی — و یادت باشه: هیچ‌وقت پوسته‌شون رو باز نکن! ⚠️🔋',
);
const FAM4_RESULT = L('The battery family is complete! 🎉', 'خانوادهٔ باتری کامل شد! 🎉');
const FAM4_CHIPS = [
  L('🔋 Pencil (AA): 1.5 V', '🔋 قلمی (AA): ۱.۵ ولت'),
  L('🔘 Coin cell: 3 V', '🔘 سکه‌ای: ۳ ولت'),
  L('📦 Book: 9 V', '📦 کتابی: ۹ ولت'),
  L('🔄 Rechargeable: 1.2 V', '🔄 قابل شارژ: ۱.۲ ولت'),
] as const;
const FAM4_LABELS = [
  L('pencil battery', 'باتری قلمی'),
  L('coin battery', 'باتری سکه‌ای'),
  L('book battery', 'باتری کتابی'),
  L('rechargeable battery', 'باتری قابل شارژ'),
] as const;
const FAM4_X = [118, 262, 406, 550] as const;
const FAM4_STROKE = ['#0284c7', '#64748b', '#b45309', '#16a34a'] as const;

/** the four battery siblings (local coords: standing on 0,0) */
function FamilyBattery({ kind }: { kind: 0 | 1 | 2 | 3 }) {
  if (kind === 1) {
    // the tiny flat coin cell, lying low
    return (
      <g>
        <ellipse cx={0} cy={-16} rx={42} ry={17} fill="#cbd5e1" stroke="#64748b" strokeWidth={2.8} />
        <ellipse cx={0} cy={-18} rx={30} ry={11} fill="#e2e8f0" />
        <circle cx={-8} cy={-20} r={2.4} fill="#334155" />
        <circle cx={8} cy={-20} r={2.4} fill="#334155" />
        <path d="M -6 -12 Q 0 -7 6 -12" stroke="#334155" strokeWidth={2} fill="none" strokeLinecap="round" />
        <circle cx={-16} cy={-13} r={3} fill="#fda4af" opacity={0.8} />
        <circle cx={16} cy={-13} r={3} fill="#fda4af" opacity={0.8} />
      </g>
    );
  }
  if (kind === 2) {
    // the sturdy book (9V) battery with two snap terminals
    return (
      <g>
        <rect x={-20} y={-103} width={13} height={12} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
        <rect x={7} y={-103} width={13} height={12} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
        <rect x={-30} y={-92} width={60} height={88} rx={8} fill="#f59e0b" stroke="#b45309" strokeWidth={2.8} />
        <rect x={-30} y={-92} width={60} height={16} rx={8} fill="#fbbf24" opacity={0.7} />
        <circle cx={-10} cy={-58} r={3} fill="#78350f" />
        <circle cx={10} cy={-58} r={3} fill="#78350f" />
        <path d="M -8 -44 Q 0 -36 8 -44" stroke="#78350f" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <circle cx={-18} cy={-42} r={4} fill="#fda4af" opacity={0.8} />
        <circle cx={18} cy={-42} r={4} fill="#fda4af" opacity={0.8} />
      </g>
    );
  }
  // kind 0: the pencil (AA) · kind 3: the rechargeable (green + 🔄)
  const green = kind === 3;
  return (
    <g>
      <rect x={-8} y={-142} width={16} height={11} rx={3} fill="#94a3b8" />
      <rect x={-16} y={-132} width={32} height={13} rx={4} fill="#94a3b8" />
      <rect x={-22} y={-119} width={44} height={115} rx={10} fill={green ? '#4ade80' : '#38bdf8'} stroke={green ? '#15803d' : '#0369a1'} strokeWidth={2.8} />
      <rect x={-22} y={-119} width={44} height={22} rx={10} fill={green ? '#86efac' : '#7dd3fc'} opacity={0.6} />
      {green && <text x={0} y={-46} fontSize={17} textAnchor="middle">🔄</text>}
      <circle cx={-9} cy={-84} r={3} fill={green ? '#14532d' : '#0c4a6e'} />
      <circle cx={9} cy={-84} r={3} fill={green ? '#14532d' : '#0c4a6e'} />
      <path d="M -7 -70 Q 0 -62 7 -70" stroke={green ? '#14532d' : '#0c4a6e'} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <circle cx={-16} cy={-68} r={4} fill="#fda4af" opacity={0.8} />
      <circle cx={16} cy={-68} r={4} fill="#fda4af" opacity={0.8} />
    </g>
  );
}

/** Page 4: the battery family photo — tap every sibling and it introduces
 *  itself with its name and its voltage. */
export function BatteryFamilyScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [seen, setSeen] = useState<number[]>([]);

  const reveal = (i: number) => {
    setSeen((prev) => {
      if (prev.includes(i)) return prev;
      const next = [...prev, i];
      sfx.pop();
      if (next.length === 4) {
        window.setTimeout(() => sfx.fanfare(), 350);
        window.setTimeout(() => sfx.sparkle(), 750);
      }
      return next;
    });
  };

  const all = seen.length === 4;
  const status = all ? FAM4_ALL : FAM4_IDLE;
  /** hint-arrow height per kind (above each battery's head) */
  const hintY = [-152, -46, -114, -140] as const;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A happy battery family photo: a tall pencil battery, a tiny flat coin cell, a boxy book battery and a green rechargeable one, all smiling', 'عکس خانوادگیِ باتری‌های خندان: باتری قلمیِ بلند، سکه‌ایِ کوچولو و تخت، باتری کتابی و باتری سبزِ قابل شارژ'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">📦 {tx(FAM4_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-amber-50/60" role="img" aria-label={tx(status)}>
        <ellipse cx={320} cy={290} rx={290} ry={14} fill="#fde68a" opacity={0.55} />
        {/* revealed name+voltage chips along the top */}
        {FAM4_CHIPS.map((chip, i) =>
          seen.includes(i) ? (
            <g key={`c-${i}`} className={motion ? 'cq-pop' : ''}>
              <rect x={FAM4_X[i] - 72} y={36} width={144} height={30} rx={15} fill="#ffffff" stroke={FAM4_STROKE[i]} strokeWidth={2.6} />
              <text x={FAM4_X[i]} y={56} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#1f2937">{tx(chip)}</text>
            </g>
          ) : null,
        )}
        {/* the result chip */}
        {all && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={195} y={74} width={250} height={34} rx={17} fill="#f0fdf4" stroke="#16a34a" strokeWidth={2.6} />
            <text x={320} y={96} fontSize={14.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(FAM4_RESULT)}</text>
          </g>
        )}

        {/* the four tappable siblings */}
        {FAM4_X.map((bx, i) => (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={tx(FAM4_LABELS[i])}
            onClick={() => reveal(i)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                reveal(i);
              }
            }}
            style={{ cursor: seen.includes(i) ? 'default' : 'pointer', outline: 'none' }}
          >
            <g transform={`translate(${bx} 252)`} className={motion && !seen.includes(i) ? 'cq-float' : ''} style={{ animationDuration: '3s', animationDelay: `${i * 0.35}s` }}>
              <FamilyBattery kind={i as 0 | 1 | 2 | 3} />
              {!seen.includes(i) && motion && (
                <text x={0} y={hintY[i]} fontSize={16} textAnchor="middle">
                  👆
                  <animate attributeName="opacity" values="1;0.15;1" dur="1.3s" repeatCount="indefinite" />
                </text>
              )}
              {seen.includes(i) && motion && <text x={0} y={hintY[i]} fontSize={14} textAnchor="middle">✨</text>}
            </g>
          </g>
        ))}
        {all && motion && (
          <>
            <text x={80} y={130} fontSize={22} className="cq-float">🎉</text>
            <text x={560} y={126} fontSize={18} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${all ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------- page 1 · wire-highway (l0-11) */

const HW1_HINT = L(
  'Tap the highway to start the electron traffic!',
  'روی بزرگراه بزن تا ترافیک الکترون‌ها راه بیفته!',
);
const HW1_IDLE = L(
  'The electron cars are parked… tap to turn the light green! 🚦',
  'ماشین‌های الکترونی پارک شدن… بزن تا چراغ سبز بشه! 🚦',
);
const HW1_FLOW = L(
  'Traffic is flowing! The electrons are racing down their private highway toward the lamp! 🛣️⚡',
  'ترافیک راه افتاد! الکترون‌ها توی بزرگراهِ اختصاصی‌شون به سمت لامپ می‌دوند! 🛣️⚡',
);
const HW1_LANES = [150, 186] as const;
const HW1_PARK = [
  [120, 150], [300, 150], [480, 150], [200, 186], [380, 186], [540, 186],
] as const;
const HW1_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'] as const;

/** Page 1: the wire is a private highway — tap it and the electron cars race
 *  along its lanes (RTL: toward the lamp on the left). */
export function WireHighwayScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [flow, setFlow] = useState(false);

  const tap = () => {
    setFlow((was) => {
      const next = !was;
      if (next) {
        sfx.whoosh();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.click();
      }
      return next;
    });
  };

  const status = flow ? HW1_FLOW : HW1_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A glowing futuristic highway with lanes inside a transparent wire tube where smiling blue electrons drive cute toy cars', 'بزرگراهِ درخشانِ چندبانده داخل لولهٔ شفافِ سیم که الکترون‌های خندان با ماشین‌های کوچولو توش می‌رن'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🛣️ {tx(HW1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={296} rx={270} ry={13} fill="#e2e8f0" />

        {/* the lamp at the destination (left) */}
        <rect x={40} y={204} width={9} height={38} rx={4.5} fill="#64748b" />
        <circle cx={44.5} cy={190} r={17} fill={flow ? '#fde047' : '#f1f5f9'} stroke={flow ? '#eab308' : '#cbd5e1'} strokeWidth={3} />
        {!flow && <text x={68} y={182} fontSize={13}>💤</text>}
        {flow && motion && (
          <circle cx={44.5} cy={190} r={23} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="20;29;20" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}

        {/* the transparent wire tube = the highway tunnel */}
        <rect x={24} y={112} width={592} height={104} rx={44} fill="#e0f2fe" fillOpacity={0.45} stroke="#64748b" strokeWidth={3.4} />
        <rect x={48} y={122} width={300} height={8} rx={4} fill="#ffffff" opacity={0.5} />
        {/* the road with two lanes */}
        <rect x={36} y={136} width={568} height={68} rx={30} fill="#334155" opacity={0.14} />
        <line x1={52} y1={168} x2={588} y2={168} stroke="#94a3b8" strokeWidth={2.5} strokeDasharray="12 10" />

        {/* the electron cars — parked, then racing to the left */}
        {HW1_COLORS.map((color, i) => {
          const lane = HW1_LANES[i % 2];
          const dur = lane === 150 ? 3.2 : 4.1;
          const parked = HW1_PARK[i];
          return (
            <g key={`car-${flow}-${i}`} transform={flow ? undefined : `translate(${parked[0]} ${parked[1]})`}>
              {flow && motion && (
                <animateMotion key={`hw-${i}`} dur={`${dur}s`} begin={`-${((i * dur) / 6).toFixed(2)}s`} repeatCount="indefinite" path={`M 650 ${lane} L 6 ${lane}`} />
              )}
              <rect x={-14} y={-10} width={28} height={12} rx={4.5} fill={color} stroke="#1e293b" strokeWidth={1.6} />
              <rect x={-8} y={-16} width={16} height={8} rx={3.5} fill={color} stroke="#1e293b" strokeWidth={1.6} />
              <circle cx={-7.5} cy={2.5} r={3.6} fill="#1e293b" />
              <circle cx={7.5} cy={2.5} r={3.6} fill="#1e293b" />
              <circle cx={0} cy={-20} r={6.2} fill="#38bdf8" stroke="#0369a1" strokeWidth={1.8} />
              <circle cx={-2} cy={-21.5} r={1.1} fill="#0c4a6e" />
              <circle cx={2} cy={-21.5} r={1.1} fill="#0c4a6e" />
              <path d="M -2 -18.5 Q 0 -16.5 2 -18.5" stroke="#0c4a6e" strokeWidth={1.1} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
        {flow && motion && (
          <>
            <text x={230} y={128} fontSize={18} className="cq-float">💨</text>
            <text x={430} y={122} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>💨</text>
            <text x={330} y={252} fontSize={16} className="cq-float" style={{ animationDelay: '0.2s' }}>✨</text>
          </>
        )}

        {/* the traffic light at the right end */}
        <rect x={590} y={118} width={24} height={44} rx={7} fill="#475569" />
        <circle cx={602} cy={132} r={6} fill={flow ? '#7f1d1d' : '#ef4444'} stroke="#1e293b" strokeWidth={1.6} />
        <circle cx={602} cy={150} r={6} fill={flow ? '#22c55e' : '#14532d'} stroke="#1e293b" strokeWidth={1.6} />
        {flow && motion && (
          <circle cx={602} cy={150} r={10} fill="#22c55e" opacity={0.35}>
            <animate attributeName="r" values="8;13;8" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {!flow && motion && (
          <text x={320} y={100} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${flow ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------- page 2 · copper-heart (l0-11) */

const COP2_HINT = L(
  'Tap the copper strands to see them shine!',
  'روی رشته‌های مس بزن تا درخششون رو ببینی!',
);
const COP2_IDLE = L(
  'The copper strands are resting… tap them to light them up! 🪙',
  'رشته‌های مسی استراحت می‌کنن… روشن بزن تا بدرخشن! 🪙',
);
const COP2_SHINE = L(
  'Shiny! The electrons slide down the bright copper strands like a playground slide! ✨',
  'چقدر درخشان! الکترون‌ها مثل سرسره روی رشته‌های مسیِ براق سر می‌خورن! ✨',
);
const COP2_CHIP = L('Copper = a great conductor', 'مس = رسانای عالی');
/** the four copper strands (also the sliders' right-to-left paths) */
const COP2_STRANDS = [
  'M 560 140 Q 440 132 300 140 T 52 140',
  'M 590 158 Q 460 150 320 158 T 46 158',
  'M 570 178 Q 440 186 300 178 T 50 178',
  'M 560 196 Q 440 204 300 196 T 54 196',
] as const;

/** Page 2: the wire's shiny heart — tap and the copper strands light up while
 *  the electrons slide along them like a playground slide (RTL). */
export function CopperHeartScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [shine, setShine] = useState(false);

  const tap = () => {
    setShine((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = shine ? COP2_SHINE : COP2_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cutaway wire showing shiny copper strands inside with tiny blue electrons sliding down them like a playground slide', 'سیمِ برش‌خورده که رشته‌های مسیِ براق داخلش دیده می‌شود و الکترون‌های کوچولو مثل سرسره رویشان سر می‌خورند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🪙 {tx(COP2_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={296} rx={270} ry={13} fill="#e2e8f0" />

        {/* the transparent tube (cut wire) with red jacket ends */}
        <rect x={24} y={112} width={592} height={104} rx={44} fill="#e0f2fe" fillOpacity={0.45} stroke="#64748b" strokeWidth={3.4} />
        {/* the copper strands — dull, then glowing bright */}
        {COP2_STRANDS.map((d, i) => (
          <g key={`s-${i}`}>
            {shine && (
              <path d={d} fill="none" stroke="#fbbf24" strokeWidth={11} strokeLinecap="round" opacity={0.3}
                style={{ transition: motion ? 'opacity .4s ease' : 'none' }} />
            )}
            <path d={d} fill="none" stroke={shine ? '#fbbf24' : '#b45309'} strokeWidth={5.5} strokeLinecap="round" opacity={shine ? 1 : 0.55}
              style={{ transition: motion ? 'stroke .4s ease, opacity .4s ease' : 'none' }} />
            {shine && (
              <path d={d} fill="none" stroke="#fde68a" strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />
            )}
          </g>
        ))}
        {/* electrons waiting at the right end … then sliding down the strands */}
        {!shine && [552, 566, 580].map((x, i) => (
          <g key={`wait-${i}`} transform={`translate(${x} 158)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {shine && [0, 1, 2].map((i) => (
          <g key={`slide-${i}`}>
            {motion && (
              <animateMotion key={`cop-${i}`} dur={`${2.4 + i * 0.5}s`} begin={`-${(i * 0.8).toFixed(2)}s`} repeatCount="indefinite" path={COP2_STRANDS[i]} />
            )}
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* the red plastic sheath at both cut ends */}
        <rect x={26} y={112} width={26} height={104} rx={10} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />
        <rect x={588} y={112} width={26} height={104} rx={10} fill="#ef4444" stroke="#b91c1c" strokeWidth={2} />

        {shine && motion && (
          <>
            <text x={200} y={104} fontSize={20} className="cq-float">✨</text>
            <text x={400} y={100} fontSize={16} className="cq-float" style={{ animationDelay: '0.35s' }}>⭐</text>
            <text x={300} y={248} fontSize={15} className="cq-float" style={{ animationDelay: '0.6s' }}>✨</text>
          </>
        )}

        {/* the conductor chip */}
        <rect x={436} y={8} width={180} height={24} rx={12} fill="#ffffff" stroke="#f59e0b" strokeWidth={2} />
        <text x={526} y={24.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#b45309">{tx(COP2_CHIP)}</text>

        {!shine && motion && (
          <text x={320} y={96} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${shine ? 'text-amber-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 3 · safety-jacket (l0-11) */

const JKT3_HINT = L(
  'Put the plastic jacket on the wire to make it safe!',
  'روپوش پلاستیکی رو بپوشون روی سیم تا ایمن بشه!',
);
const JKT3_BARE = L(
  'Without its jacket the electrons jump out of the wire — keep your hand away! ⚠️',
  'بدون روپوش، الکترون‌ها از سیم بیرون می‌پرن — دستت رو نزدیک نکن! ⚠️',
);
const JKT3_ON = L(
  'Safe! The jacket keeps the electrons inside the wire and your hand stays far from danger ✅',
  'امن شد! روپوش الکترون‌ها رو توی سیم نگه می‌داره و دستت از خطر دور می‌مونه ✅',
);
const JKT3_WARN = L('⚠️', '⚠️');
const JKT3_OK = L('✅', '✅');

/** Page 3: the plastic jacket is the wire's safety armor — without it the
 *  electrons escape, with it the child's hand can hold the wire safely. */
export function SafetyJacketScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [on, setOn] = useState(false);

  const toggle = () => {
    setOn((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = on ? JKT3_ON : JKT3_BARE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A happy red plastic jacket on a wire with copper strands peeking out at the end, while a child hand safely holds its middle', 'روپوشِ پلاستیکیِ قرمزِ خندان روی سیم که سرِ مسی‌اش بیرون زده و دستِ کودک وسطش را امن گرفته'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🧥 {tx(JKT3_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={toggle}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            toggle();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={286} rx={280} ry={13} fill="#e2e8f0" />

        {/* the copper wire (bare strands) */}
        {[194, 200, 206].map((y, i) => (
          <path key={`w-${i}`} d={`M 70 ${y} Q 200 ${y - 3} 340 ${y} T 590 ${y}`} fill="none"
            stroke={['#fb923c', '#f59e0b', '#d97706'][i]} strokeWidth={3.5} strokeLinecap="round" />
        ))}

        {/* the child's hand holding the right end (always safe there) */}
        <g transform="translate(560 200)">
          <rect x={-16} y={-22} width={40} height={42} rx={17} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2.4} />
          <rect x={-26} y={-16} width={14} height={9} rx={4.5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2} />
          <rect x={-26} y={-4} width={14} height={9} rx={4.5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2} />
          <rect x={-26} y={8} width={14} height={9} rx={4.5} fill="#fcd9b8" stroke="#e7b58b" strokeWidth={2} />
        </g>

        {/* escaping electrons when the wire is bare */}
        {!on && motion && (
          <>
            {[260, 380].map((x, i) => (
              <g key={`esc-${i}`} transform={`translate(${x} 158)`}>
                <g className="cq-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
                  <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
                  <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
                </g>
                <path d={`M ${x > 320 ? -14 : 14} 12 q ${x > 320 ? 10 : -10} -14 0 -26`} stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 4" fill="none" />
              </g>
            ))}
          </>
        )}
        {/* contained electrons sliding under the jacket when it is on */}
        {on && [0, 1, 2].map((i) => (
          <g key={`in-${i}`}>
            {motion && (
              <animateMotion key={`jkt-${i}`} dur="1.9s" begin={`-${(i * 0.65).toFixed(2)}s`} repeatCount="indefinite" path="M 580 200 L 76 200" />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* the red safety jacket — hanging above, then pulled down over the wire */}
        <g transform={`translate(0 ${on ? 118 : 0})`} style={{ transition: motion ? 'transform .5s ease-out' : 'none' }}>
          <rect x={196} y={44} width={248} height={70} rx={28} fill="#ef4444" stroke="#b91c1c" strokeWidth={3.2} />
          <rect x={196} y={44} width={248} height={26} rx={13} fill="#f87171" opacity={0.6} />
          <rect x={180} y={62} width={18} height={30} rx={9} fill="#ef4444" stroke="#b91c1c" strokeWidth={2.4} />
          <rect x={442} y={62} width={18} height={30} rx={9} fill="#ef4444" stroke="#b91c1c" strokeWidth={2.4} />
          <circle cx={282} cy={78} r={4} fill="#7f1d1d" />
          <circle cx={358} cy={78} r={4} fill="#7f1d1d" />
          <path d="M 300 92 Q 320 106 340 92" stroke="#7f1d1d" strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={266} cy={94} r={6} fill="#fda4af" opacity={0.85} />
          <circle cx={374} cy={94} r={6} fill="#fda4af" opacity={0.85} />
          {!on && motion && (
            <text x={320} y={30} fontSize={20} textAnchor="middle">
              👆
              <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
            </text>
          )}
        </g>

        {/* the state chip near the hand */}
        <g>
          <rect x={470} y={38} width={110} height={34} rx={17} fill={on ? '#f0fdf4' : '#fef2f2'} stroke={on ? '#16a34a' : '#ef4444'} strokeWidth={2.6} />
          <text x={525} y={61} fontSize={17} fontWeight="bold" textAnchor="middle" fill={on ? '#15803d' : '#b91c1c'}>{tx(on ? JKT3_OK : JKT3_WARN)}</text>
        </g>
        {on && motion && (
          <>
            <text x={180} y={120} fontSize={20} className="cq-float">✨</text>
            <text x={470} y={250} fontSize={17} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${on ? 'text-teal-700' : 'text-rose-600'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------- page 4 · clip-jumper (l0-11) */

const CLP4_HINT = L(
  'Open the alligator clip so it connects to the part!',
  'گیره سوسماری رو باز کن تا به قطعه وصل بشه!',
);
const CLP4_HOVER = L(
  'The alligator clip is waiting… its jaws are shut 🐊',
  'گیره سوسماری منتظره… دهنش بسته‌ست 🐊',
);
const CLP4_OPEN = L(
  'The crocodile jaws opened wide! One more tap to bite the part 🐊',
  'دهانِ سوسمار باز شد! یک لمس دیگه تا به قطعه بچسبه 🐊',
);
const CLP4_BITTEN = L(
  'Connected! The current flows through the wire and the lamp is ON! 🐊⚡',
  'وصل شد! جریان از سیم رد میشه و لامپ روشنه! 🐊⚡',
);
const CLP4_CLIP = L('🐊 Alligator clip', '🐊 گیره سوسماری');
const CLP4_JUMP = L('📌 Jumpers', '📌 جامپر');
const CLP4_TAIL = 'M 404 140 Q 480 110 540 78 Q 570 62 600 58';
const CLP4_TAIL_FLOW = 'M 404 148 Q 480 118 540 86 Q 570 70 600 66';

/** Page 4: the alligator clip — open its crocodile jaws and snap them onto the
 *  part so the current flows; jumper wires wait on their breadboard below. */
export function ClipJumperScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [phase, setPhase] = useState<'hover' | 'open' | 'bitten'>('hover');

  const tap = () => {
    setPhase((was) => {
      const next = was === 'hover' ? 'open' : was === 'open' ? 'bitten' : 'hover';
      if (next === 'open') sfx.click();
      else if (next === 'bitten') {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 350);
      } else sfx.whoosh();
      return next;
    });
  };

  const status = phase === 'bitten' ? CLP4_BITTEN : phase === 'open' ? CLP4_OPEN : CLP4_HOVER;
  const bitten = phase === 'bitten';
  const openJaws = phase === 'open';

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('Friendly colorful wire characters: alligator clip wires with playful crocodile jaws and jumper wires standing in a small breadboard', 'سیم‌های رنگارنگِ دوست‌داشتنی: سیم‌های گیره سوسماری با دهان‌های باز و بسته و سیم‌های جامپر داخل یک بردبورد کوچولو'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🐊 {tx(CLP4_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={296} rx={270} ry={13} fill="#e2e8f0" />

        {/* the part: a lamp on its stand (left) */}
        <rect x={122} y={186} width={16} height={10} rx={4} fill="#64748b" />
        <circle cx={130} cy={162} r={24} fill={bitten ? '#fde047' : '#f1f5f9'} stroke={bitten ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
        {!bitten && <text x={158} y={152} fontSize={13}>💤</text>}
        {bitten && motion && (
          <circle cx={130} cy={162} r={31} fill="#fde047" opacity={0.3}>
            <animate attributeName="r" values="28;38;28" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}
        {/* the terminal post the clip bites onto */}
        <rect x={376} y={150} width={9} height={34} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
        <rect x={364} y={182} width={34} height={9} rx={3} fill="#94a3b8" />
        <path d="M 138 196 L 240 196 Q 300 196 300 174 L 300 168 L 372 168" fill="none" stroke="#475569" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 138 196 L 240 196 Q 300 196 300 174 L 300 168 L 372 168" fill="none" stroke="#94a3b8" strokeWidth={2.2} strokeLinecap="round" />

        {/* the clip assembly: tail wire + crocodile jaws (snaps down to bite) */}
        <g transform={`translate(0 ${bitten ? 34 : 0})`} style={{ transition: motion ? 'transform .22s ease-in' : 'none' }}>
          <path d={CLP4_TAIL} fill="none" stroke="#475569" strokeWidth={6} strokeLinecap="round" />
          <path d={CLP4_TAIL} fill="none" stroke="#94a3b8" strokeWidth={2.4} strokeLinecap="round" />
          {bitten && [0, 1, 2].map((i) => (
            <g key={`cw-${i}`}>
              {motion && (
                <animateMotion key={`clp-${i}`} dur="1.6s" begin={`-${(i * 0.55).toFixed(2)}s`} repeatCount="indefinite" path={CLP4_TAIL_FLOW} />
              )}
              <circle cx={0} cy={0} r={8} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
              <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            </g>
          ))}
          {/* upper jaw */}
          <path d="M 408 136 Q 372 116 350 129 Q 345 137 354 142 L 408 145 Z" fill="#22c55e" stroke="#15803d" strokeWidth={2.6}
            transform={openJaws ? 'rotate(-32 408 140)' : 'rotate(0 408 140)'}
            style={{ transition: motion ? 'transform .2s ease-out' : 'none' }} />
          {/* lower jaw */}
          <path d="M 408 144 Q 372 164 350 151 Q 345 143 354 138 L 408 135 Z" fill="#22c55e" stroke="#15803d" strokeWidth={2.6}
            transform={openJaws ? 'rotate(30 408 140)' : 'rotate(0 408 140)'}
            style={{ transition: motion ? 'transform .2s ease-out' : 'none' }} />
          {/* teeth */}
          {(openJaws || !bitten) && motion && (
            <g fill="#ffffff">
              <path d="M 366 130 l 5 7 l 4 -6 z" opacity={0.9} />
              <path d="M 378 132 l 5 7 l 4 -6 z" opacity={0.9} />
            </g>
          )}
          {/* eye + nostril */}
          <circle cx={416} cy={127} r={4.4} fill="#ffffff" stroke="#15803d" strokeWidth={1.6} />
          <circle cx={417.5} cy={127.5} r={2} fill="#052e16" />
          <circle cx={400} cy={120} r={2.6} fill="#15803d" />
        </g>

        {/* phase hint */}
        {phase === 'hover' && motion && (
          <text x={404} y={92} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {bitten && motion && (
          <>
            <text x={250} y={110} fontSize={20} className="cq-float">✨</text>
            <text x={520} y={180} fontSize={17} className="cq-float" style={{ animationDelay: '0.4s' }}>⚡</text>
          </>
        )}

        {/* the clip label */}
        <rect x={252} y={36} width={158} height={24} rx={12} fill="#ffffff" stroke="#16a34a" strokeWidth={2} />
        <text x={331} y={52.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(CLP4_CLIP)}</text>

        {/* the jumper wires on their little breadboard (bottom-left) */}
        <rect x={56} y={252} width={170} height={46} rx={8} fill="#ffffff" stroke="#cbd5e1" strokeWidth={2.4} />
        {Array.from({ length: 2 }).map((_, r) =>
          Array.from({ length: 8 }).map((_, c) => (
            <circle key={`d-${r}-${c}`} cx={72 + c * 20} cy={266 + r * 16} r={2.2} fill="#cbd5e1" />
          )),
        )}
        <path d="M 92 252 Q 118 208 156 214" fill="none" stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <line x1={156} y1={214} x2={166} y2={206} stroke="#94a3b8" strokeWidth={3.4} strokeLinecap="round" />
        <path d="M 200 252 Q 228 222 254 228" fill="none" stroke="#3b82f6" strokeWidth={5} strokeLinecap="round" />
        <line x1={254} y1={228} x2={264} y2={221} stroke="#94a3b8" strokeWidth={3.4} strokeLinecap="round" />
        <rect x={56} y={224} width={104} height={22} rx={11} fill="#ffffff" stroke="#3b82f6" strokeWidth={2} />
        <text x={108} y={239.5} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#1d4ed8">{tx(CLP4_JUMP)}</text>
      </svg>
      <p className={`text-center text-sm font-extrabold ${bitten ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------------ page 1 · led-hero (l0-12) */

const LH1_HINT = L(
  'Tap the LED to turn its magic light on!',
  'روی LED کلیک کن تا نور جادوییش روشن بشه!',
);
const LH1_IDLE = L(
  'The little wizard LED is waiting… the energetic electrons are ready to bring their energy! 💡',
  'ال‌دی‌دیِ جادوگر منتظره… الکترون‌های پرانرژی آماده‌ان که انرژیشون رو برسونن! 💡',
);
const LH1_LIT = L(
  'Hooray! The little wizard took the electrons\u2019 energy and turned it into beautiful colorful light! ✨',
  'هورا! جادوگرِ کوچولو انرژی الکترون‌ها رو گرفت و به نورِ قشنگ و رنگارنگ تبدیلش کرد! ✨',
);
const LH1_RAYS = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#c084fc'] as const;
const LH1_WAIT_X = [588, 552, 516] as const;
const LH1_IN = 'M 636 252 L 334 252 L 334 216';

/** Page 1: the LED is the little wizard of light — tap it and the electrons
 *  rush in (RTL) and it bursts into rainbow light. */
export function LedHeroScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [lit, setLit] = useState(false);

  const tap = () => {
    setLit((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = lit ? LH1_LIT : LH1_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cute smiling LED bulb character floating magically while sparkling with colorful rainbow light rays', 'ال‌دی‌دیِ کارتونیِ خندان که جادویی معلقه و پرتوهای رنگین‌کمانی دورش می‌درخشه'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">💡 {tx(LH1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={298} rx={270} ry={13} fill="#e2e8f0" />

        {/* the rainbow rays (behind everything, only when lit) */}
        {lit && LH1_RAYS.map((color, i) => (
          <g key={`ray-${i}`} transform={`rotate(${(i - 3) * 26} 320 150)`} opacity={0.85}>
            <rect x={315} y={30} width={10} height={34} rx={5} fill={color}>
              {motion && <animate attributeName="opacity" values="0.45;1;0.45" dur="1.6s" begin={`${(i * 0.14).toFixed(2)}s`} repeatCount="indefinite" />}
            </rect>
          </g>
        ))}

        {/* the road wire */}
        <rect x={24} y={242} width={592} height={22} rx={11} fill="#475569" />
        <rect x={34} y={247} width={572} height={7} rx={3.5} fill="#94a3b8" opacity={0.8} />

        {/* the electrons: waiting on the right, then streaming into the LED */}
        {!lit && LH1_WAIT_X.map((x, i) => (
          <g key={`w-${i}`} transform={`translate(${x} 252)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {lit && [0, 1, 2].map((i) => (
          <g key={`in-${i}`}>
            {motion && (
              <animateMotion key={`lh-${i}`} dur="2.2s" begin={`-${(i * 0.75).toFixed(2)}s`} repeatCount="indefinite" path={LH1_IN} />
            )}
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* the wizard LED: legs, flange, dome, face and magic hat */}
        <g>
          {lit && motion && (
            <circle cx={320} cy={150} r={56} fill="#fde047" opacity={0.28}>
              <animate attributeName="r" values="50;62;50" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          {/* legs */}
          <rect x={331} y={206} width={6} height={40} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          <rect x={303} y={206} width={6} height={36} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          {/* dome */}
          <path d="M 282 196 L 282 150 Q 282 98 320 98 Q 358 98 358 150 L 358 196 Z"
            fill={lit ? '#fef08a' : '#f8fafc'} stroke={lit ? '#eab308' : '#cbd5e1'} strokeWidth={3.5} />
          <rect x={276} y={196} width={88} height={12} rx={6} fill="#94a3b8" />
          {/* face */}
          <circle cx={306} cy={146} r={4} fill={lit ? '#92400e' : '#94a3b8'} />
          <circle cx={334} cy={146} r={4} fill={lit ? '#92400e' : '#94a3b8'} />
          {lit && (
            <>
              <circle cx={304.6} cy={144.6} r={1.5} fill="#ffffff" />
              <circle cx={332.6} cy={144.6} r={1.5} fill="#ffffff" />
            </>
          )}
          {lit ? (
            <path d="M 306 160 Q 320 174 334 160" stroke="#92400e" strokeWidth={3} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 310 162 Q 320 170 330 162" stroke="#94a3b8" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          )}
          <circle cx={296} cy={160} r={5} fill="#fda4af" opacity={0.8} />
          <circle cx={344} cy={160} r={5} fill="#fda4af" opacity={0.8} />
          {!lit && <text x={372} y={116} fontSize={13}>💤</text>}
          {/* the little wizard hat */}
          <g transform="rotate(-6 320 100)">
            <path d="M 320 48 L 296 102 L 344 102 Z" fill="#8b5cf6" stroke="#7c3aed" strokeWidth={2.5} />
            <rect x={290} y={100} width={60} height={10} rx={5} fill="#7c3aed" />
            <text x={320} y={62} fontSize={15} textAnchor="middle">⭐</text>
          </g>
        </g>

        {lit && motion && (
          <>
            <text x={240} y={120} fontSize={20} className="cq-float">✨</text>
            <text x={404} y={104} fontSize={16} className="cq-float" style={{ animationDelay: '0.4s' }}>⭐</text>
            <text x={392} y={222} fontSize={15} className="cq-float" style={{ animationDelay: '0.6s' }}>✨</text>
          </>
        )}
        {!lit && motion && (
          <text x={250} y={120} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${lit ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------------ page 2 · led-legs (l0-12) */

const LL2_HINT = L(
  'Seat the LED in its holder the right way so it lights up!',
  'LED رو درست توی پایه جا بزن تا نور بده!',
);
const LL2_IDLE = L(
  'The LED is floating above its holder… tap to seat it! Which way is right? 🤔',
  'ال‌دی‌دی بالای محلی‌ش معلقه… بزن تا جا بخوره! کدوم جهت درسته؟ 🤔',
);
const LL2_WRONG = L(
  'Backwards! The electrons stopped at the gate — the LED is not sad, it just stays dark 🚫',
  'برعکس جا خورد! الکترون‌ها پشت دروازه ایستادند — ال‌دی‌دی ناراحت نیست، فقط خاموشه 🚫',
);
const LL2_RIGHT = L(
  'Long leg to ➕ and short leg to ➖ — the electrons march through and the LED shines! ✨',
  'پایهٔ بلند به ➕ و پایهٔ کوتاه به ➖ — الکترون‌ها رد می‌شن و ال‌دی‌دی می‌درخشه! ✨',
);
const LL2_LONG = L('➕ the longer leg', '➕ پایهٔ بلندتر');
const LL2_SHORT = L('➖ the shorter leg', '➖ پایهٔ کوتاه‌تر');
const LL2_IN = 'M 578 90 L 578 52 L 334 52 L 334 178';
const LL2_OUT = 'M 306 188 L 306 288 L 578 288';

/** the LED with its two legs — `wrong` swaps them (long leg into the − tube) */
function LegsLed({ mode }: { mode: 'idle' | 'wrong' | 'right' }) {
  const lit = mode === 'right';
  const wrong = mode === 'wrong';
  const longX = wrong ? -14 : 14;
  const shortX = wrong ? 14 : -14;
  return (
    <g>
      {lit && <circle cx={0} cy={-10} r={46} fill="#fde047" opacity={0.28} />}
      {/* legs (long + short; drawn first so the dome overlaps their tops) */}
      <rect x={longX - 3} y={24} width={6} height={26} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
      <rect x={shortX - 3} y={24} width={6} height={mode === 'idle' ? 16 : 22} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
      {/* dome */}
      <path d="M -24 16 L -24 -8 Q -24 -36 0 -36 Q 24 -36 24 -8 L 24 16 Z"
        fill={lit ? '#fde047' : '#f8fafc'} stroke={lit ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
      <rect x={-20} y={-32} width={40} height={13} rx={6.5} fill="#ffffff" opacity={0.45} />
      {/* flange */}
      <rect x={-28} y={16} width={56} height={8} rx={4} fill="#94a3b8" />
      {/* face */}
      <circle cx={-9} cy={-10} r={3} fill={lit ? '#92400e' : '#64748b'} />
      <circle cx={9} cy={-10} r={3} fill={lit ? '#92400e' : '#64748b'} />
      {lit && (
        <>
          <circle cx={-10} cy={-11.2} r={1.2} fill="#ffffff" />
          <circle cx={8} cy={-11.2} r={1.2} fill="#ffffff" />
        </>
      )}
      {mode === 'idle' && <circle cx={0} cy={0} r={2.6} fill="none" stroke="#64748b" strokeWidth={1.8} />}
      {wrong && <path d="M -6 1 L 6 1" stroke="#64748b" strokeWidth={2.2} strokeLinecap="round" />}
      {lit && <path d="M -7 -2 Q 0 7 7 -2" stroke="#92400e" strokeWidth={2.6} fill="none" strokeLinecap="round" />}
    </g>
  );
}

/** Page 2: the two legs — the first tap seats the LED BACKWARDS (the electrons
 *  stop at the gate, no light, no sadness), the second tap seats it the right
 *  way: long leg to ➕, short leg to ➖, and it shines. */
export function LedLegsScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [phase, setPhase] = useState<'idle' | 'wrong' | 'right'>('idle');

  const tap = () => {
    setPhase((was) => {
      const next = was === 'idle' ? 'wrong' : was === 'wrong' ? 'right' : 'idle';
      if (next === 'wrong') sfx.click();
      else if (next === 'right') {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else sfx.whoosh();
      return next;
    });
  };

  const status = phase === 'right' ? LL2_RIGHT : phase === 'wrong' ? LL2_WRONG : LL2_IDLE;
  const seated = phase !== 'idle';

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cartoon LED component with one long metal leg and one short metal leg while tiny electron friends arrive from one direction only', 'ال‌دی‌دیِ کارتونی با یک پایهٔ بلند و یک پایهٔ کوتاه که دوست‌های الکترونی فقط از یک جهت بهش می‌رسن'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🦵 {tx(LL2_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={304} rx={280} ry={12} fill="#e2e8f0" />

        {/* the red wire from the battery's ➕ to the right (+) tube … */}
        <path d="M 578 88 L 578 52 L 334 52 L 334 178" fill="none" stroke="#ef4444" strokeWidth={5.5} strokeLinecap="round" />
        {/* … and the dark wire back from the left (−) tube to the battery's ➖ */}
        <path d="M 306 244 L 306 288 L 578 288 L 578 260" fill="none" stroke="#334155" strokeWidth={5.5} strokeLinecap="round" />

        {/* the battery (right): bumpy ➕ top, flat ➖ bottom */}
        <g>
          <ellipse cx={578} cy={296} rx={66} ry={9} fill="#e2e8f0" />
          <rect x={562} y={88} width={32} height={12} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
          <rect x={552} y={100} width={52} height={18} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={540} y={118} width={76} height={126} rx={14} fill="#4ade80" stroke="#15803d" strokeWidth={3.2} />
          <rect x={540} y={118} width={76} height={26} rx={13} fill="#86efac" opacity={0.55} />
          <rect x={532} y={244} width={92} height={16} rx={5} fill="#334155" stroke="#1e293b" strokeWidth={2} />
          <text x={578} y={112} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#1e293b">+</text>
          <text x={578} y={256} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f8fafc">−</text>
          <circle cx={562} cy={160} r={3.2} fill="#14532d" />
          <circle cx={594} cy={160} r={3.2} fill="#14532d" />
          <path d="M 568 174 Q 578 182 588 174" stroke="#14532d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>

        {/* the electrons on the red wire */}
        {phase === 'idle' && [560, 524, 488].map((x, i) => (
          <g key={`q-${i}`} transform={`translate(${x} 52)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {phase === 'wrong' && (
          <>
            {[470, 434].map((x, i) => (
              <g key={`s-${i}`} transform={`translate(${x} 52)`}>
                <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
                <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
                <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              </g>
            ))}
            <text x={398} y={44} fontSize={15} textAnchor="middle">⛔</text>
          </>
        )}
        {phase === 'right' && (
          <>
            {[0, 1].map((i) => (
              <g key={`in-${i}`}>
                {motion && (
                  <animateMotion key={`lli-${i}`} dur="2.1s" begin={`-${(i * 1.05).toFixed(2)}s`} repeatCount="indefinite" path={LL2_IN} />
                )}
                <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
                <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
                <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
              </g>
            ))}
            {[0, 1].map((i) => (
              <g key={`out-${i}`}>
                {motion && (
                  <animateMotion key={`llo-${i}`} dur="2.3s" begin={`-${(0.4 + i * 1.15).toFixed(2)}s`} repeatCount="indefinite" path={LL2_OUT} />
                )}
                <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
                <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
                <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
              </g>
            ))}
          </>
        )}

        {/* the holder: two contact tubes on a base */}
        <rect x={326} y={180} width={16} height={50} rx={7} fill="#64748b" stroke="#475569" strokeWidth={2} />
        <rect x={298} y={180} width={16} height={50} rx={7} fill="#64748b" stroke="#475569" strokeWidth={2} />
        <rect x={282} y={230} width={76} height={14} rx={7} fill="#475569" />
        <text x={352} y={174} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#b91c1c">+</text>
        <text x={290} y={174} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">−</text>

        {/* the LED — floating, seated backwards, or seated the right way */}
        <g transform={`translate(320 ${seated ? 138 : 96})`} style={{ transition: motion ? 'transform .4s ease-out' : 'none' }}>
          <LegsLed mode={phase} />
        </g>

        {/* the leg chips (only while floating) */}
        {phase === 'idle' && (
          <>
            <rect x={366} y={118} width={158} height={28} rx={14} fill="#ffffff" stroke="#ef4444" strokeWidth={2.2} />
            <text x={445} y={137} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#b91c1c">{tx(LL2_LONG)}</text>
            <rect x={116} y={118} width={158} height={28} rx={14} fill="#ffffff" stroke="#334155" strokeWidth={2.2} />
            <text x={195} y={137} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(LL2_SHORT)}</text>
            <path d="M 320 152 L 320 176" stroke="#94a3b8" strokeWidth={2.5} strokeDasharray="4 4" strokeLinecap="round" />
          </>
        )}

        {phase === 'idle' && motion && (
          <text x={238} y={92} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {phase === 'right' && motion && (
          <>
            <text x={248} y={100} fontSize={18} className="cq-float">✨</text>
            <text x={398} y={96} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
            <text x={500} y={120} fontSize={15} className="cq-float" style={{ animationDelay: '0.2s' }}>⚡</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${phase === 'right' ? 'text-teal-700' : phase === 'wrong' ? 'text-rose-600' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------- page 3 · led-rainbow (l0-12) */

const RB3_HINT = L(
  'Tap each LED to see its own special color!',
  'روی هر LED بزن تا رنگ مخصوص خودشو نشون بده!',
);
const RB3_IDLE = L(
  'The rainbow team of LEDs is waiting — tap them all! 🌈',
  'تیم رنگین‌کمانیِ LEDها منتظره — روی همه‌شون بزن! 🌈',
);
const RB3_ALL = L(
  'You know the whole rainbow team — LEDs are everywhere: traffic lights, phone screens, flashlights and robots! 🌈💡',
  'کل تیم رنگین‌کمانی رو شناختی — LEDها همه‌جا هستن: چراغ راهنمایی، صفحهٔ گوشی، چراغ‌قوه و ربات‌ها! 🌈💡',
);
const RB3_RESULT = L('The LED rainbow is complete! 🎉', 'رنگین‌کمانِ LEDها کامل شد! 🎉');
const RB3_CHIPS = [
  L('🔴 Red', '🔴 قرمز'),
  L('🟢 Green', '🟢 سبز'),
  L('🔵 Blue', '🔵 آبی'),
  L('🟡 Yellow', '🟡 زرد'),
  L('🟣 Purple', '🟣 بنفش'),
] as const;
const RB3_LABELS = [
  L('red LED', 'LED قرمز'),
  L('green LED', 'LED سبز'),
  L('blue LED', 'LED آبی'),
  L('yellow LED', 'LED زرد'),
  L('purple LED', 'LED بنفش'),
] as const;
const RB3_X = [88, 199, 310, 421, 532] as const;
const RB3_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'] as const;

/** one little rainbow-team LED (local coords: standing on 0,0) */
function RainbowLed({ kind, on }: { kind: 0 | 1 | 2 | 3 | 4; on: boolean }) {
  const color = RB3_COLORS[kind];
  return (
    <g>
      {/* legs */}
      <rect x={-10} y={-36} width={5} height={36} rx={2.5} fill="#94a3b8" />
      <rect x={5} y={-36} width={5} height={36} rx={2.5} fill="#94a3b8" />
      {/* arms for holding hands with the neighbours */}
      <path d="M -20 -56 Q -28 -50 -32 -44" stroke="#94a3b8" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M 20 -56 Q 28 -50 32 -44" stroke="#94a3b8" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {/* glow halo */}
      {on && (
        <circle cx={0} cy={-72} r={36} fill={color} opacity={0.26}>
          <animate attributeName="r" values="30;40;30" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* dome body */}
      <path d="M -20 -54 L -20 -68 Q -20 -94 0 -94 Q 20 -94 20 -68 L 20 -54 Z"
        fill={on ? color : '#f1f5f9'} stroke={color} strokeWidth={3} />
      <rect x={-24} y={-54} width={48} height={8} rx={4} fill="#cbd5e1" />
      <circle cx={0} cy={-96} r={3.6} fill="#94a3b8" />
      {/* face */}
      <circle cx={-7} cy={-76} r={3} fill={on ? '#ffffff' : '#475569'} />
      <circle cx={7} cy={-76} r={3} fill={on ? '#ffffff' : '#475569'} />
      {on && (
        <>
          <circle cx={-7.8} cy={-77} r={1.1} fill="#1e293b" />
          <circle cx={6.2} cy={-77} r={1.1} fill="#1e293b" />
        </>
      )}
      <path d="M -5 -66 Q 0 -61 5 -66" stroke={on ? '#ffffff' : '#475569'} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <circle cx={-13} cy={-68} r={3} fill="#fda4af" opacity={0.85} />
      <circle cx={13} cy={-68} r={3} fill="#fda4af" opacity={0.85} />
    </g>
  );
}

/** Page 3: the rainbow team — tap every LED and it lights up with its own
 *  color and introduces itself; all five together make the LED rainbow. */
export function LedRainbowScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [seen, setSeen] = useState<number[]>([]);

  const reveal = (i: number) => {
    setSeen((prev) => {
      if (prev.includes(i)) return prev;
      const next = [...prev, i];
      sfx.pop();
      if (next.length === 5) {
        window.setTimeout(() => sfx.fanfare(), 350);
        window.setTimeout(() => sfx.sparkle(), 750);
      }
      return next;
    });
  };

  const all = seen.length === 5;
  const status = all ? RB3_ALL : RB3_IDLE;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A friendly rainbow team of colorful glowing LED bulb characters standing together holding hands', 'تیم دوست‌داشتنیِ رنگین‌کمانیِ ال‌دی‌دی‌های رنگارنگِ درخشان که دست هم را گرفتند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🌈 {tx(RB3_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <ellipse cx={320} cy={292} rx={290} ry={14} fill="#e2e8f0" />
        {/* revealed color chips along the top */}
        {RB3_CHIPS.map((chip, i) =>
          seen.includes(i) ? (
            <g key={`c-${i}`} className={motion ? 'cq-pop' : ''}>
              <rect x={RB3_X[i] - 54} y={30} width={108} height={28} rx={14} fill="#ffffff" stroke={RB3_COLORS[i]} strokeWidth={2.4} />
              <text x={RB3_X[i]} y={49} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#1f2937">{tx(chip)}</text>
            </g>
          ) : null,
        )}
        {/* the result chip */}
        {all && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={185} y={68} width={270} height={34} rx={17} fill="#f0fdf4" stroke="#16a34a" strokeWidth={2.6} />
            <text x={320} y={90} fontSize={13.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(RB3_RESULT)}</text>
          </g>
        )}

        {/* the five tappable siblings (holding hands in a row) */}
        {RB3_X.map((bx, i) => (
          <g
            key={i}
            role="button"
            tabIndex={0}
            aria-label={tx(RB3_LABELS[i])}
            onClick={() => reveal(i)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                reveal(i);
              }
            }}
            style={{ cursor: seen.includes(i) ? 'default' : 'pointer', outline: 'none' }}
          >
            <g transform={`translate(${bx} 252)`} className={motion && !seen.includes(i) ? 'cq-float' : ''} style={{ animationDuration: '3s', animationDelay: `${i * 0.3}s` }}>
              <RainbowLed kind={i as 0 | 1 | 2 | 3 | 4} on={seen.includes(i)} />
              {!seen.includes(i) && motion && (
                <text x={0} y={-112} fontSize={15} textAnchor="middle">
                  👆
                  <animate attributeName="opacity" values="1;0.15;1" dur="1.3s" repeatCount="indefinite" />
                </text>
              )}
              {seen.includes(i) && motion && <text x={0} y={-112} fontSize={13} textAnchor="middle">✨</text>}
            </g>
          </g>
        ))}
        {all && motion && (
          <>
            <text x={70} y={140} fontSize={22} className="cq-float">🎉</text>
            <text x={566} y={136} fontSize={18} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${all ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 4 · led-resistor (l0-12) */

const RS4_HINT = L(
  'Connect the resistor so the LED shines safely!',
  'مقاومت رو وصل کن تا LED با خیال راحت درخشان بشه!',
);
const RS4_FAST = L(
  'Too fast! The electrons are rushing into the delicate LED — it may get hot and burn! ⚠️',
  'چه تند! الکترون‌ها دارن به ال‌دی‌دیِ ظریف هجوم می‌آرن — ممکنه داغ بشه و بسوزه! ⚠️',
);
const RS4_CALM = L(
  'The resistor came! It slowed the electrons down and now the LED shines safely and happily ✨',
  'مقاومت اومد! سرعت الکترون‌ها رو کم کرد و حالا ال‌دی‌دی امن و خوشحال می‌درخشه ✨',
);
const RS4_QUOTE = L(
  '«Come in slowly so my friend stays safe!»',
  '«آروم وارد بشید تا دوستمون آسیب نبینه!»',
);
const RS4_ROAD = 'M 540 250 L 124 250';

/** Page 4: the personal guard — without the resistor the electrons dash in too
 *  fast and the delicate LED overheats; tap and the superhero resistor lands on
 *  the road, slows everyone down and the LED shines safely. */
export function LedResistorScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [guard, setGuard] = useState(false);

  const toggle = () => {
    setGuard((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = guard ? RS4_CALM : RS4_FAST;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A superhero resistor with a cape and a shield standing guard beside a glowing happy LED', 'مقاومتِ ابرقهرمان با شنل و سپر که کنار ال‌دی‌دیِ خندان و درخشان ایستاده'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🦸‍♂️ {tx(RS4_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={toggle}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            toggle();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={296} rx={270} ry={12} fill="#e2e8f0" />

        {/* the road */}
        <rect x={30} y={238} width={560} height={24} rx={12} fill="#475569" />
        <rect x={40} y={243} width={540} height={7} rx={3.5} fill="#94a3b8" opacity={0.8} />

        {/* the battery (right) */}
        <g>
          <ellipse cx={572} cy={282} rx={46} ry={8} fill="#e2e8f0" />
          <rect x={562} y={156} width={20} height={10} rx={3} fill="#94a3b8" />
          <rect x={544} y={166} width={56} height={74} rx={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={3} />
          <rect x={544} y={166} width={56} height={16} rx={8} fill="#7dd3fc" opacity={0.6} />
          <circle cx={560} cy={192} r={2.8} fill="#0c4a6e" />
          <circle cx={584} cy={192} r={2.8} fill="#0c4a6e" />
          <path d="M 564 204 Q 572 211 580 204" stroke="#0c4a6e" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>

        {/* the LED (left): overheating, then calm and glowing */}
        <g>
          {guard && motion && (
            <circle cx={84} cy={208} r={40} fill="#fde047" opacity={0.28}>
              <animate attributeName="r" values="36;46;36" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <g
            transform="rotate(0 84 245)"
          >
            {!guard && motion && (
              <animateTransform attributeName="transform" type="rotate" values="-2 84 245;2 84 245;-2 84 245" dur="0.35s" repeatCount="indefinite" />
            )}
            <path d="M 56 236 L 56 206 Q 56 174 84 174 Q 112 174 112 206 L 112 236 Z"
              fill={guard ? '#fde047' : '#fecaca'} stroke={guard ? '#eab308' : '#ef4444'} strokeWidth={3.2} />
            <rect x={52} y={236} width={64} height={9} rx={4.5} fill="#94a3b8" />
            <circle cx={72} cy={196} r={3.4} fill={guard ? '#92400e' : '#7f1d1d'} />
            <circle cx={96} cy={196} r={3.4} fill={guard ? '#92400e' : '#7f1d1d'} />
            {guard ? (
              <path d="M 70 210 Q 84 222 98 210" stroke="#92400e" strokeWidth={2.8} fill="none" strokeLinecap="round" />
            ) : (
              <path d="M 72 214 Q 78 209 84 214 Q 90 219 96 214" stroke="#7f1d1d" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            )}
            <circle cx={64} cy={208} r={5} fill="#fda4af" opacity={guard ? 0.8 : 1} />
            <circle cx={104} cy={208} r={5} fill="#fda4af" opacity={guard ? 0.8 : 1} />
          </g>
          {!guard && motion && (
            <>
              <text x={118} y={176} fontSize={15}>💢</text>
              <text x={116} y={206} fontSize={13}>💨</text>
            </>
          )}
          {guard && motion && <text x={116} y={172} fontSize={16} className="cq-float">✨</text>}
        </g>

        {/* the electrons: dashing, then calm and gentle */}
        {!guard && [0, 1, 2, 3].map((i) => (
          <g key={`f-${i}`}>
            {motion && (
              <animateMotion key={`rs-f-${i}`} dur="0.85s" begin={`-${(i * 0.21).toFixed(2)}s`} repeatCount="indefinite" path={RS4_ROAD} />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}
        {guard && [0, 1, 2].map((i) => (
          <g key={`c-${i}`}>
            {motion && (
              <animateMotion key={`rs-c-${i}`} dur="2.6s" begin={`-${(i * 0.85).toFixed(2)}s`} repeatCount="indefinite" path={RS4_ROAD} />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}

        {/* the superhero resistor — hovering above, then landing on the road */}
        <g transform={`translate(0 ${guard ? 0 : -110})`} style={{ transition: motion ? 'transform .45s ease-out' : 'none' }}>
          {/* cape */}
          <path d="M 312 196 Q 282 202 272 234 Q 298 226 314 232 Z" fill="#ef4444" opacity={0.9} />
          {/* arms (drawn behind the body) */}
          <path d="M 306 210 Q 294 212 288 218" stroke="#fde68a" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M 354 206 Q 366 198 370 188" stroke="#fde68a" strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* striped body */}
          <rect x={306} y={190} width={48} height={54} rx={12} fill="#fde68a" stroke="#b45309" strokeWidth={3} />
          <rect x={311} y={196} width={6} height={42} fill="#dc2626" />
          <rect x={321} y={196} width={6} height={42} fill="#7c3aed" />
          <rect x={331} y={196} width={6} height={42} fill="#eab308" />
          <rect x={341} y={196} width={6} height={42} fill="#d97706" />
          {/* face */}
          <circle cx={322} cy={204} r={2.8} fill="#78350f" />
          <circle cx={338} cy={204} r={2.8} fill="#78350f" />
          <path d="M 324 214 Q 330 220 336 214" stroke="#78350f" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          {/* legs on the road */}
          <rect x={316} y={244} width={6} height={14} rx={3} fill="#b45309" />
          <rect x={338} y={244} width={6} height={14} rx={3} fill="#b45309" />
          {/* the shield */}
          <circle cx={282} cy={222} r={13} fill="#93c5fd" stroke="#1d4ed8" strokeWidth={2.6} />
          <text x={282} y={227} fontSize={12} textAnchor="middle">⭐</text>
          {!guard && motion && (
            <text x={330} y={176} fontSize={20} textAnchor="middle">
              👆
              <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
            </text>
          )}
        </g>

        {/* the resistor's kind quote (once on guard) */}
        {guard && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={216} y={94} width={264} height={34} rx={17} fill="#f0fdf4" stroke="#16a34a" strokeWidth={2.2} />
            <path d="M 328 128 L 334 142 L 342 128 Z" fill="#f0fdf4" stroke="#16a34a" strokeWidth={2} />
            <text x={348} y={116} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(RS4_QUOTE)}</text>
          </g>
        )}

        {/* the warning chip (before the guard arrives) */}
        {!guard && (
          <g>
            <rect x={36} y={120} width={112} height={30} rx={15} fill="#fef2f2" stroke="#ef4444" strokeWidth={2.4} />
            <text x={92} y={141} fontSize={16} textAnchor="middle">⚠️</text>
          </g>
        )}
        {guard && motion && (
          <text x={430} y={170} fontSize={16} className="cq-float" style={{ animationDelay: '0.3s' }}>✨</text>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${guard ? 'text-teal-700' : 'text-rose-600'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 1 · switch-police (l0-13) */

const SP1_HINT = L(
  'Tap the switch to show the green sign to the electrons!',
  'روی کلید بزن تا تابلوی سبز رو به الکترون‌ها نشون بده!',
);
const SP1_STOP = L(
  'Officer Switch is showing the red STOP sign — the electrons are standing gently and resting! 🔴',
  'کلیدِ پلیس تابلوی قرمزِ ایست رو نشون میده — الکترون‌ها آروم ایستادند و استراحت می‌کنن! 🔴',
);
const SP1_GO = L(
  'The green GO sign is up! The electrons happily start running and the lamps turn on! 🟢',
  'تابلوی سبز بالا اومد! الکترون‌ها با خوشحالی راه میفتن و چراغ‌ها روشن میشه! 🟢',
);
const SP1_WAIT_X = [516, 552, 588] as const;
const SP1_RUN = 'M 540 257 L 112 257';

/** Page 1: the switch is the circuit's traffic officer — tap it and the red
 *  STOP paddle flips to the green GO sign, so the waiting electrons may run
 *  along the road (RTL) and light the lamp. */
export function SwitchPoliceScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [go, setGo] = useState(false);

  const tap = () => {
    setGo((was) => {
      const next = !was;
      if (next) {
        sfx.click();
        window.setTimeout(() => sfx.powerup(), 260);
        window.setTimeout(() => sfx.sparkle(), 650);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = go ? SP1_GO : SP1_STOP;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A friendly cartoon switch character dressed as a smiling traffic police officer holding a green go paddle while cute electron characters wait to run', 'کلیدِ کارتونیِ خندانی که لباس پلیس راهنمایی پوشیده و تابلوی سبز رو به الکترون‌های کوچولوی منتظر نشون میده'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🚦 {tx(SP1_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={298} rx={280} ry={12} fill="#e2e8f0" />

        {/* the wire road with crossing stripes */}
        <rect x={24} y={246} width={592} height={22} rx={11} fill="#475569" />
        <rect x={34} y={251} width={572} height={7} rx={3.5} fill="#94a3b8" opacity={0.8} />
        {[110, 190, 450, 530].map((x) => (
          <rect key={`str-${x}`} x={x} y={249} width={30} height={6} rx={3} fill="#f8fafc" opacity={0.65} />
        ))}

        {/* the battery (right) */}
        <g>
          <ellipse cx={572} cy={282} rx={46} ry={8} fill="#e2e8f0" />
          <rect x={562} y={156} width={20} height={10} rx={3} fill="#94a3b8" />
          <rect x={544} y={166} width={56} height={74} rx={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={3} />
          <rect x={544} y={166} width={56} height={16} rx={8} fill="#7dd3fc" opacity={0.6} />
          <circle cx={560} cy={192} r={2.8} fill="#0c4a6e" />
          <circle cx={584} cy={192} r={2.8} fill="#0c4a6e" />
          <path d="M 564 204 Q 572 211 580 204" stroke="#0c4a6e" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>

        {/* the lamp (left) */}
        <g>
          {go && motion && (
            <circle cx={84} cy={192} r={30} fill="#fde047" opacity={0.3}>
              <animate attributeName="r" values="26;36;26" dur="1.1s" repeatCount="indefinite" />
            </circle>
          )}
          <rect x={79} y={212} width={10} height={34} rx={5} fill="#64748b" />
          <rect x={70} y={206} width={28} height={9} rx={4.5} fill="#94a3b8" />
          <circle cx={84} cy={190} r={20} fill={go ? '#fde047' : '#f1f5f9'} stroke={go ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
          <circle cx={77} cy={186} r={3} fill={go ? '#92400e' : '#94a3b8'} />
          <circle cx={91} cy={186} r={3} fill={go ? '#92400e' : '#94a3b8'} />
          {go ? (
            <path d="M 76 197 Q 84 205 92 197" stroke="#92400e" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 79 198 Q 84 194 89 198" stroke="#94a3b8" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          )}
          <circle cx={70} cy={195} r={4} fill="#fda4af" opacity={0.8} />
          <circle cx={98} cy={195} r={4} fill="#fda4af" opacity={0.8} />
          {!go && <text x={112} y={172} fontSize={13}>💤</text>}
        </g>

        {/* the electrons: waiting on the right, then running to the lamp */}
        {!go && SP1_WAIT_X.map((x, i) => (
          <g key={`w-${i}`} transform={`translate(${x} 257)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {go && [0, 1, 2].map((i) => (
          <g key={`run-${i}`}>
            {motion && (
              <animateMotion key={`sp-${i}`} dur="2.2s" begin={`-${(i * 0.73).toFixed(2)}s`} repeatCount="indefinite" path={SP1_RUN} />
            )}
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* Officer Switch: cap, face, chest rocker, uniform, legs */}
        <g>
          {/* legs + shoes */}
          <rect x={306} y={214} width={8} height={34} rx={4} fill="#1e40af" />
          <rect x={326} y={214} width={8} height={34} rx={4} fill="#1e40af" />
          <ellipse cx={310} cy={248} rx={9} ry={4.5} fill="#0f172a" />
          <ellipse cx={330} cy={248} rx={9} ry={4.5} fill="#0f172a" />
          {/* body plate */}
          <rect x={296} y={120} width={48} height={100} rx={14} fill="#f8fafc" stroke="#64748b" strokeWidth={3} />
          {/* police cap */}
          <path d="M 292 122 L 292 110 Q 292 96 320 96 Q 348 96 348 110 L 348 122 Z" fill="#1d4ed8" stroke="#1e40af" strokeWidth={2.5} />
          <rect x={286} y={118} width={68} height={10} rx={5} fill="#1e40af" />
          <circle cx={320} cy={109} r={5} fill="#fbbf24" stroke="#b45309" strokeWidth={1.6} />
          {/* face */}
          <circle cx={310} cy={140} r={3.4} fill="#334155" />
          <circle cx={330} cy={140} r={3.4} fill="#334155" />
          <path d="M 311 150 Q 320 158 329 150" stroke="#334155" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <circle cx={303} cy={149} r={4} fill="#fda4af" opacity={0.8} />
          <circle cx={337} cy={149} r={4} fill="#fda4af" opacity={0.8} />
          {/* the chest rocker (tips with the state) */}
          <g transform={go ? 'rotate(9 320 184)' : 'rotate(-9 320 184)'} style={{ transition: motion ? 'transform .25s ease-out' : 'none' }}>
            <rect x={306} y={168} width={28} height={32} rx={7} fill={go ? '#4ade80' : '#f87171'} stroke={go ? '#15803d' : '#b91c1c'} strokeWidth={2.4} />
            <line x1={312} y1={go ? 186 : 176} x2={328} y2={go ? 176 : 186} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
          </g>
          {/* waving arm */}
          <path d="M 298 156 Q 276 150 266 134" stroke="#1d4ed8" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={264} cy={130} r={5.5} fill="#fde68a" />
          {/* sign arm */}
          <path d="M 342 156 Q 366 150 378 138" stroke="#1d4ed8" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={380} cy={136} r={5.5} fill="#fde68a" />
          {/* the traffic paddle */}
          <g transform={`translate(388 100)`} className={motion && go ? 'cq-pop' : ''}>
            <line x1={-4} y1={32} x2={4} y2={14} stroke="#7c2d12" strokeWidth={5} strokeLinecap="round" />
            <circle cx={0} cy={-4} r={25} fill={go ? '#22c55e' : '#ef4444'} stroke={go ? '#15803d' : '#b91c1c'} strokeWidth={3.5} />
            <circle cx={0} cy={-4} r={19} fill="#ffffff" opacity={0.22} />
            {go ? (
              <path d="M -9 -4 L -3 3 L 10 -10" stroke="#ffffff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M 0 -14 L 0 -1 M 0 6 L 0 9" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
            )}
          </g>
        </g>

        {!go && motion && (
          <text x={252} y={108} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {go && motion && (
          <>
            <text x={230} y={112} fontSize={18} className="cq-float">✨</text>
            <text x={452} y={96} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>⚡</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${go ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 2 · switch-bridge (l0-13) */

const SB2_HINT = L(
  'Turn the switch ON and OFF to watch its inner bridge react!',
  'کلید رو روشن/خاموش کن تا واکنش پلِ داخلش رو ببینی!',
);
const SB2_OFF = L(
  'The bridge went up and a gap fell between the wires — the circuit is open, the electrons stopped and the light is off! 🔴',
  'پل بالا رفت و بین سیم‌ها فاصله افتاد — مدار باز شد، الکترون‌ها ایستادند و چراغ خاموشه! 🔴',
);
const SB2_ON = L(
  'The bridge came down and connected — the circuit is closed and the electrons pass through happily: the light is on! 🟢',
  'پل پایین اومد و وصل شد — مدار بسته شد و الکترون‌ها با شادی رد می‌شن: چراغ روشنه! 🟢',
);
const SB2_CHIP = L('the inner bridge', 'پلِ داخل کلید');
const SB2_IN = 'M 578 82 L 578 56 L 368 56 L 368 196';
const SB2_OUT = 'M 292 196 L 292 40 L 84 40 L 84 146';
const SB2_RET = 'M 84 226 L 84 272 L 570 272 L 570 258';

/** Page 2: the cutaway of the switch — pressing it drops the metal bridge down
 *  onto the two contact pads (closed circuit, flowing electrons, lit LED);
 *  pressing again lifts the bridge and opens a gap (open circuit, darkness). */
export function SwitchBridgeScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [on, setOn] = useState(false);

  const tap = () => {
    setOn((was) => {
      const next = !was;
      if (next) {
        sfx.click();
        window.setTimeout(() => sfx.powerup(), 200);
        window.setTimeout(() => sfx.sparkle(), 560);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = on ? SB2_ON : SB2_OFF;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cutaway cartoon light switch showing the metal bridge inside closing the gap so glowing electrons can flow to a happy lit LED bulb', 'برشِ کلیدِ کارتونی که پلِ فلزیِ داخلش رو نشون میده: با بسته شدن فاصله، الکترون‌های درخشان به لامپ ال‌دی‌دیِ خوشحال می‌رسن'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🎛️ {tx(SB2_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={300} rx={280} ry={12} fill="#e2e8f0" />

        {/* the outer wires */}
        <path d="M 578 88 L 578 56 L 368 56 L 368 150" fill="none" stroke="#ef4444" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 292 150 L 292 40 L 84 40 L 84 152" fill="none" stroke="#334155" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 84 226 L 84 272 L 570 272 L 570 258" fill="none" stroke="#334155" strokeWidth={5.5} strokeLinecap="round" />

        {/* the battery (right): bumpy ➕ top, flat ➖ bottom */}
        <g>
          <rect x={562} y={76} width={32} height={12} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
          <rect x={552} y={88} width={52} height={18} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={540} y={106} width={76} height={138} rx={14} fill="#4ade80" stroke="#15803d" strokeWidth={3.2} />
          <rect x={540} y={106} width={76} height={26} rx={13} fill="#86efac" opacity={0.55} />
          <rect x={532} y={244} width={92} height={16} rx={5} fill="#334155" stroke="#1e293b" strokeWidth={2} />
          <text x={578} y={100} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#1e293b">+</text>
          <text x={578} y={256} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f8fafc">−</text>
          <circle cx={562} cy={160} r={3.2} fill="#14532d" />
          <circle cx={594} cy={160} r={3.2} fill="#14532d" />
          <path d="M 568 174 Q 578 182 588 174" stroke="#14532d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>

        {/* the LED (left) */}
        <g>
          {on && motion && (
            <circle cx={84} cy={192} r={40} fill="#fde047" opacity={0.28}>
              <animate attributeName="r" values="36;46;36" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          {/* legs into the return wire */}
          <rect x={71} y={216} width={6} height={22} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          <rect x={91} y={216} width={6} height={22} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          {/* dome */}
          <path d="M 60 214 L 60 168 Q 60 156 84 156 Q 108 156 108 168 L 108 214 Z"
            fill={on ? '#fef08a' : '#f8fafc'} stroke={on ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
          <rect x={56} y={214} width={56} height={9} rx={4.5} fill="#94a3b8" />
          {/* face */}
          <circle cx={72} cy={184} r={3.4} fill={on ? '#92400e' : '#94a3b8'} />
          <circle cx={96} cy={184} r={3.4} fill={on ? '#92400e' : '#94a3b8'} />
          {on ? (
            <path d="M 72 196 Q 84 208 96 196" stroke="#92400e" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 76 198 Q 84 192 92 198" stroke="#94a3b8" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          )}
          <circle cx={62} cy={198} r={4.5} fill="#fda4af" opacity={0.8} />
          <circle cx={106} cy={198} r={4.5} fill="#fda4af" opacity={0.8} />
          {!on && <text x={114} y={168} fontSize={13}>💤</text>}
        </g>

        {/* the electrons: queued on the red wire, then flowing around the loop */}
        {!on && [488, 452, 416].map((x, i) => (
          <g key={`q-${i}`} transform={`translate(${x} 56)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}
        {!on && <text x={386} y={92} fontSize={15}>⛔</text>}
        {on && [0, 1].map((i) => (
          <g key={`in-${i}`}>
            {motion && (
              <animateMotion key={`sbi-${i}`} dur="2.1s" begin={`-${(i * 1.05).toFixed(2)}s`} repeatCount="indefinite" path={SB2_IN} />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}
        {on && [0, 1].map((i) => (
          <g key={`out-${i}`}>
            {motion && (
              <animateMotion key={`sbo-${i}`} dur="2.2s" begin={`-${(0.5 + i * 1.1).toFixed(2)}s`} repeatCount="indefinite" path={SB2_OUT} />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}
        {on && [0, 1].map((i) => (
          <g key={`ret-${i}`}>
            {motion && (
              <animateMotion key={`sbr-${i}`} dur="2.3s" begin={`-${(0.9 + i * 1.15).toFixed(2)}s`} repeatCount="indefinite" path={SB2_RET} />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}

        {/* the open-top switch housing (drawn after the electrons so they
            really disappear "inside" it) */}
        <path d="M 262 150 L 262 244 Q 262 252 270 252 L 390 252 Q 398 252 398 244 L 398 150"
          fill="#f1f5f9" stroke="#475569" strokeWidth={5} strokeLinecap="round" />
        {/* the wire stubs inside the housing */}
        <path d="M 368 150 L 368 212" stroke="#ef4444" strokeWidth={5} strokeLinecap="round" />
        <path d="M 292 208 L 292 150" stroke="#334155" strokeWidth={5} strokeLinecap="round" />

        {/* the two contact pads */}
        <rect x={278} y={206} width={28} height={13} rx={4} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
        <rect x={354} y={206} width={28} height={13} rx={4} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={2} />
        {on && (
          <>
            <circle cx={292} cy={206} r={8} fill="#fde047" opacity={0.55} />
            <circle cx={368} cy={206} r={8} fill="#fde047" opacity={0.55} />
          </>
        )}

        {/* the metal bridge — flat when ON, lifted when OFF */}
        <g transform={on ? 'rotate(0 296 202)' : 'rotate(-24 296 202)'} style={{ transition: motion ? 'transform .3s ease-out' : 'none' }}>
          <rect x={288} y={198} width={78} height={9} rx={4.5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={318} y={188} width={8} height={12} rx={3} fill="#ef4444" />
          <circle cx={322} cy={184} r={5} fill="#ef4444" stroke="#b91c1c" strokeWidth={1.6} />
        </g>
        {!on && (
          <g>
            <path d="M 368 188 L 368 178" stroke="#ef4444" strokeWidth={2.4} strokeDasharray="3 3" strokeLinecap="round" />
            <circle cx={368} cy={172} r={7} fill="none" stroke="#ef4444" strokeWidth={2.4} />
            <line x1={363} y1={167} x2={373} y2={177} stroke="#ef4444" strokeWidth={2.4} strokeLinecap="round" />
          </g>
        )}

        {/* the inner-bridge chip */}
        <g>
          <rect x={392} y={166} width={124} height={26} rx={13} fill="#ffffff" stroke="#475569" strokeWidth={2.2} />
          <text x={454} y={183.5} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(SB2_CHIP)}</text>
        </g>

        {!on && motion && (
          <text x={238} y={188} fontSize={20} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {on && motion && (
          <>
            <text x={252} y={110} fontSize={18} className="cq-float">✨</text>
            <text x={416} y={120} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>⚡</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${on ? 'text-teal-700' : 'text-rose-600'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------------- page 3 · switch-family (l0-13) */

const SF3_HINT = L(
  'Tap the push button to ring the news bell!',
  'روی دکمه فشاری بزن تا زنگ اخبار به صدا دربیاد!',
);
const SF3_IDLE = L(
  'The smiling switch team is ready — tap the push button to ring the bell! 🔔',
  'تیم کلیدهای خندان آماده‌ست — روی دکمهٔ فشاری بزن تا زنگ به صدا دربیاد! 🔔',
);
const SF3_BELL = L(
  'Ding-dong! The push button works only while your finger rests on it — just like the doorbell at home! 🔔',
  'دینگ‌دونگ! دکمهٔ فشاری فقط وقتی کار می‌کنه که انگشتت روش باشه — درست مثل زنگِ درِ خونه! 🔔',
);
const SF3_NAME_ROCKER = L('the rocker (seesaw)', 'کلید راکر (الاکلنگی)');
const SF3_NAME_PUSH = L('the push button', 'دکمه فشاری');
const SF3_NAME_SLIDE = L('the slide switch', 'کلید کشویی');

/** Page 3: the switch family photo — a rocker that tips like a seesaw, a push
 *  button that rings the bell while pressed (auto-release), and a slide switch
 *  that glides left/right; every member is tappable. */
export function SwitchFamilyScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [rocker, setRocker] = useState(false);
  const [slideRight, setSlideRight] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ringing, setRinging] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    for (const t of timers.current) window.clearTimeout(t);
  }, []);

  const pressPush = () => {
    if (pressed) return;
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
    setPressed(true);
    setRinging(true);
    sfx.blip();
    timers.current.push(window.setTimeout(() => sfx.blip(), 230));
    timers.current.push(window.setTimeout(() => setPressed(false), 700));
    timers.current.push(window.setTimeout(() => setRinging(false), 1500));
  };

  const status = ringing ? SF3_BELL : SF3_IDLE;

  const keyTap = (fn: () => void) => (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A playful cartoon group photo of three smiling switch characters: a rocker switch, a push button and a sliding switch', 'عکسِ دسته‌جمعیِ کارتونیِ سه کلیدِ خندان: کلید راکر، دکمهٔ فشاری و کلید کشویی'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🔔 {tx(SF3_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <ellipse cx={320} cy={294} rx={286} ry={13} fill="#e2e8f0" />
        {/* the little stage */}
        <rect x={40} y={272} width={560} height={10} rx={5} fill="#cbd5e1" opacity={0.6} />

        {/* ---- the rocker switch (right) ---- */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(SF3_NAME_ROCKER)}
          onClick={() => {
            setRocker((w) => !w);
            sfx.click();
          }}
          onKeyDown={keyTap(() => {
            setRocker((w) => !w);
            sfx.click();
          })}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <rect x={442} y={142} width={76} height={112} rx={12} fill="#f8fafc" stroke="#94a3b8" strokeWidth={3} />
          <circle cx={464} cy={164} r={3.2} fill="#475569" />
          <circle cx={496} cy={164} r={3.2} fill="#475569" />
          <path d="M 466 174 Q 480 184 494 174" stroke="#475569" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <circle cx={456} cy={174} r={3.6} fill="#fda4af" opacity={0.8} />
          <circle cx={504} cy={174} r={3.6} fill="#fda4af" opacity={0.8} />
          <g transform={rocker ? 'rotate(11 480 210)' : 'rotate(-11 480 210)'} style={{ transition: motion ? 'transform .22s ease-out' : 'none' }}>
            <rect x={458} y={192} width={44} height={38} rx={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.6} />
            <line x1={466} y1={rocker ? 220 : 200} x2={494} y2={rocker ? 200 : 220} stroke="#0c4a6e" strokeWidth={3.4} strokeLinecap="round" />
          </g>
          <rect x={420} y={262} width={120} height={24} rx={12} fill="#ffffff" stroke="#0369a1" strokeWidth={2} />
          <text x={480} y={278.5} fontSize={11.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(SF3_NAME_ROCKER)}</text>
        </g>

        {/* ---- the push button (center) ---- */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(SF3_NAME_PUSH)}
          onClick={pressPush}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              pressPush();
            }
          }}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {/* the bell above */}
          <g transform={`translate(320 118)`}>
            {ringing && motion && (
              <animateTransform attributeName="transform" type="rotate" values="-16 0 26;16 0 26;-16 0 26" dur="0.32s" repeatCount="4" additive="sum" />
            )}
            <path d="M -20 22 Q -20 -8 0 -8 Q 20 -8 20 22 Z" fill="#fbbf24" stroke="#b45309" strokeWidth={2.6} />
            <rect x={-24} y={20} width={48} height={8} rx={4} fill="#b45309" />
            <circle cx={0} cy={-12} r={4.5} fill="#b45309" />
            <circle cx={0} cy={33} r={4} fill="#b45309" />
          </g>
          {ringing && (
            <g className={motion ? 'cq-pop' : ''}>
              <rect x={366} y={96} width={106} height={26} rx={13} fill="#fef9c3" stroke="#ca8a04" strokeWidth={2.2} />
              <text x={419} y={113.5} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#a16207">🔔 دینگ‌دونگ!</text>
            </g>
          )}
          {/* the doorbell body */}
          <rect x={282} y={168} width={76} height={88} rx={14} fill="#fef3c7" stroke="#d97706" strokeWidth={3} />
          <circle cx={304} cy={190} r={3.2} fill="#92400e" />
          <circle cx={336} cy={190} r={3.2} fill="#92400e" />
          <path d="M 306 200 Q 320 210 334 200" stroke="#92400e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <circle cx={296} cy={200} r={3.6} fill="#fda4af" opacity={0.8} />
          <circle cx={344} cy={200} r={3.6} fill="#fda4af" opacity={0.8} />
          {/* the button itself (sinks when pressed) */}
          <g transform={pressed ? 'translate(0 4)' : ''} style={{ transition: motion ? 'transform .12s ease-out' : 'none' }}>
            <circle cx={320} cy={228} r={19} fill={pressed ? '#dc2626' : '#ef4444'} stroke="#b91c1c" strokeWidth={3} />
            <circle cx={314} cy={222} r={6} fill="#ffffff" opacity={0.3} />
          </g>
          <rect x={252} y={262} width={136} height={24} rx={12} fill="#ffffff" stroke="#b91c1c" strokeWidth={2} />
          <text x={320} y={278.5} fontSize={11.5} fontWeight="bold" textAnchor="middle" fill="#b91c1c">{tx(SF3_NAME_PUSH)}</text>
        </g>

        {/* ---- the slide switch (left) ---- */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(SF3_NAME_SLIDE)}
          onClick={() => {
            setSlideRight((w) => !w);
            sfx.click();
          }}
          onKeyDown={keyTap(() => {
            setSlideRight((w) => !w);
            sfx.click();
          })}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <rect x={116} y={168} width={88} height={88} rx={14} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={3} />
          <circle cx={142} cy={192} r={3.2} fill="#475569" />
          <circle cx={178} cy={192} r={3.2} fill="#475569" />
          <path d="M 144 202 Q 160 212 176 202" stroke="#475569" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <circle cx={134} cy={202} r={3.6} fill="#fda4af" opacity={0.8} />
          <circle cx={186} cy={202} r={3.6} fill="#fda4af" opacity={0.8} />
          {/* the slot + the sliding knob */}
          <rect x={134} y={220} width={52} height={14} rx={7} fill="#cbd5e1" />
          <circle cx={slideRight ? 172 : 148} cy={227} r={11} fill="#a855f7" stroke="#7e22ce" strokeWidth={2.6}
            style={{ transition: motion ? 'cx .25s ease-out' : 'none' }} />
          <rect x={88} y={262} width={144} height={24} rx={12} fill="#ffffff" stroke="#7e22ce" strokeWidth={2} />
          <text x={160} y={278.5} fontSize={11.5} fontWeight="bold" textAnchor="middle" fill="#7e22ce">{tx(SF3_NAME_SLIDE)}</text>
        </g>

        {motion && !ringing && (
          <text x={320} y={86} fontSize={19} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {ringing && motion && (
          <>
            <text x={236} y={104} fontSize={17} className="cq-float">🎵</text>
            <text x={414} y={146} fontSize={15} className="cq-float" style={{ animationDelay: '0.3s' }}>🎵</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${ringing ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* -------------------------------------------- page 4 · switch-position (l0-13) */

const SX4_HINT = L(
  'Move the switch around and try different spots!',
  'کلید رو حرکت بده و جاگذاری‌های مختلف رو امتحان کن!',
);
const SX4_STATIONS = [
  L('Station 1 — right beside the battery! From every spot of the road the switch gives the orders! 🚦', 'ایستگاه ۱ — کنارِ باتری! کلید از هر جای جاده فرمان میده! 🚦'),
  L('Station 2 — the middle of the road! The circuit is still closed and the lamp is still on! ✨', 'ایستگاه ۲ — وسطِ جاده! باز هم مدار بسته‌ست و چراغ روشنه! ✨'),
  L('Station 3 — right beside the lamp! It works here too — the switch only needs to stand on the electrons\u2019 main road! 💡', 'ایستگاه ۳ — کنارِ لامپ! اینجا هم کار می‌کنه — مهم فقط اینه که کلید سرِ راهِ اصلی الکترون‌ها باشه! 💡'),
];
const SX4_OFF = L(
  'The switch went OFF: the bridge lifted, the road opened and the electrons stopped — no battery energy is wasted! 🔋💤',
  'کلید خاموش شد: پل بالا رفت، جاده باز شد و الکترون‌ها ایستادند — هیچ انرژی‌ای از باتری هدر نمیره! 🔋💤',
);
const SX4_MOVE = L('move the switch to the next spot', 'کلید رو به ایستگاه بعدی ببر');
const SX4_POWER = L('turn the switch ON or OFF', 'کلید رو روشن یا خاموش کن');
const SX4_ON_LABEL = L('ON', 'روشن');
const SX4_OFF_LABEL = L('OFF', 'خاموش');
const SX4_STATION_X = [462, 322, 182] as const;

/** Page 4: the circuit map — tap the switch and it hops between three spots on
 *  the wire road (the lamp stays lit everywhere); tap the ON/OFF chip and the
 *  inner bridge lifts, everything stops and the battery's energy is saved. */
export function SwitchPositionScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [station, setStation] = useState(0);
  const [on, setOn] = useState(true);

  const move = () => {
    setStation((s) => {
      const next = (s + 1) % 3;
      sfx.whoosh();
      return next;
    });
  };

  const toggle = () => {
    setOn((was) => {
      const next = !was;
      if (next) {
        sfx.powerup();
        window.setTimeout(() => sfx.sparkle(), 400);
      } else {
        sfx.click();
      }
      return next;
    });
  };

  const status = on ? SX4_STATIONS[station] : SX4_OFF;
  const sx = SX4_STATION_X[station];

  const keyTap = (fn: () => void) => (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A cartoon circuit loop with a battery, a lamp and a switch that can sit at different spots along the wire road', 'حلقهٔ مدارِ کارتونی با باتری، لامپ و کلیدی که می‌تونه جای‌های مختلفی سرِ راهِ سیم باشه'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🗺️ {tx(SX4_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <ellipse cx={320} cy={302} rx={280} ry={12} fill="#e2e8f0" />

        {/* the loop road (top / right into the battery / bottom) */}
        <path d="M 578 86 L 578 76 L 100 76 L 100 84" fill="none" stroke="#ef4444" strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 97 236 L 97 262 L 570 262 L 570 258" fill="none" stroke="#334155" strokeWidth={5.5} strokeLinecap="round" />

        {/* the three station marks */}
        {SX4_STATION_X.map((x, i) => (
          <circle key={`st-${i}`} cx={x} cy={76} r={34} fill="none"
            stroke={station === i ? '#38bdf8' : '#cbd5e1'} strokeWidth={station === i ? 3 : 2}
            strokeDasharray="5 6" opacity={station === i ? 0.9 : 0.55} />
        ))}

        {/* the battery (right) */}
        <g>
          <rect x={562} y={76} width={32} height={12} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
          <rect x={552} y={88} width={52} height={18} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={540} y={106} width={76} height={138} rx={14} fill="#4ade80" stroke="#15803d" strokeWidth={3.2} />
          <rect x={540} y={106} width={76} height={26} rx={13} fill="#86efac" opacity={0.55} />
          <rect x={532} y={244} width={92} height={16} rx={5} fill="#334155" stroke="#1e293b" strokeWidth={2} />
          <text x={578} y={100} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#1e293b">+</text>
          <text x={578} y={256} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f8fafc">−</text>
          <circle cx={562} cy={160} r={3.2} fill="#14532d" />
          <circle cx={594} cy={160} r={3.2} fill="#14532d" />
          <path d="M 568 174 Q 578 182 588 174" stroke="#14532d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          {on && motion && <text x={620} y={140} fontSize={13}>💪</text>}
          {!on && motion && <text x={620} y={140} fontSize={13}>💤</text>}
        </g>

        {/* the lamp (left, in the loop) */}
        <g>
          {on && motion && (
            <circle cx={100} cy={140} r={38} fill="#fde047" opacity={0.28}>
              <animate attributeName="r" values="34;44;34" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <rect x={87} y={164} width={6} height={58} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          <rect x={107} y={164} width={6} height={58} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.4} />
          <path d="M 76 162 L 76 116 Q 76 88 100 88 Q 124 88 124 116 L 124 162 Z"
            fill={on ? '#fef08a' : '#f8fafc'} stroke={on ? '#eab308' : '#cbd5e1'} strokeWidth={3.2} />
          <rect x={72} y={162} width={56} height={9} rx={4.5} fill="#94a3b8" />
          <circle cx={88} cy={132} r={3.4} fill={on ? '#92400e' : '#94a3b8'} />
          <circle cx={112} cy={132} r={3.4} fill={on ? '#92400e' : '#94a3b8'} />
          {on ? (
            <path d="M 88 144 Q 100 156 112 144" stroke="#92400e" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M 92 146 Q 100 140 108 146" stroke="#94a3b8" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          )}
          <circle cx={78} cy={146} r={4.5} fill="#fda4af" opacity={0.8} />
          <circle cx={122} cy={146} r={4.5} fill="#fda4af" opacity={0.8} />
          {!on && <text x={132} y={118} fontSize={13}>💤</text>}
        </g>

        {/* the electrons on the top road */}
        {on && [0, 1, 2].map((i) => (
          <g key={`fl-${i}`}>
            {motion && (
              <animateMotion key={`sx-${i}`} dur="2.6s" begin={`-${(i * 0.87).toFixed(2)}s`} repeatCount="indefinite" path="M 560 76 L 120 76" />
            )}
            <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
          </g>
        ))}
        {!on && [sx + 104, sx + 140].map((x, i) => (
          <g key={`q-${i}`} transform={`translate(${x} 76)`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={8.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
              <circle cx={2.4} cy={-1.5} r={1.5} fill="#0c4a6e" />
            </g>
          </g>
        ))}
        {!on && <text x={sx + 66} y={62} fontSize={14}>⛔</text>}

        {/* the traveling switch */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(SX4_MOVE)}
          onClick={move}
          onKeyDown={keyTap(move)}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <g transform={`translate(${sx} 76)`} style={{ transition: motion ? 'transform .45s ease-in-out' : 'none' }}>
            <rect x={-34} y={-26} width={68} height={52} rx={11} fill="#f8fafc" stroke="#475569" strokeWidth={3} />
            <circle cx={0} cy={-14} r={4.5} fill={on ? '#22c55e' : '#ef4444'} />
            <rect x={-26} y={-3} width={14} height={11} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.6} />
            <rect x={12} y={-3} width={14} height={11} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.6} />
            <g transform={on ? 'rotate(0 -18 2)' : 'rotate(-22 -18 2)'} style={{ transition: motion ? 'transform .3s ease-out' : 'none' }}>
              <rect x={-22} y={-2} width={42} height={8} rx={4} fill="#94a3b8" stroke="#64748b" strokeWidth={1.8} />
            </g>
          </g>
          {motion && (
            <text x={sx} y={122} fontSize={17} textAnchor="middle">
              👆
              <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
            </text>
          )}
        </g>

        {/* the ON/OFF chip (top-left) */}
        <g
          role="button"
          tabIndex={0}
          aria-label={tx(SX4_POWER)}
          onClick={toggle}
          onKeyDown={keyTap(toggle)}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          <rect x={36} y={26} width={132} height={34} rx={17} fill="#ffffff"
            stroke={on ? '#16a34a' : '#dc2626'} strokeWidth={2.6} />
          <text x={58} y={48.5} fontSize={15} textAnchor="middle">{on ? '🟢' : '🔴'}</text>
          <text x={128} y={48.5} fontSize={13} fontWeight="bold" textAnchor="middle" fill={on ? '#15803d' : '#b91c1c'}>
            {on ? tx(SX4_ON_LABEL) : tx(SX4_OFF_LABEL)}
          </text>
        </g>

        {on && motion && (
          <>
            <text x={196} y={44} fontSize={16} className="cq-float">✨</text>
            <text x={470} y={140} fontSize={14} className="cq-float" style={{ animationDelay: '0.4s' }}>⚡</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${on ? 'text-teal-700' : 'text-rose-600'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ---------------------------------------------- page 1 · treasure-map (l0-14) */

const TM1_HINT = L(
  'Tap the scroll to turn the pictures into the secret symbols!',
  'روی طومار بزن تا عکس‌ها به نمادهای رازآلود تبدیل بشن!',
);
const TM1_MAGIC = L(
  'Wow! The real things turned into the engineers\u2019 secret symbols! ✨',
  'شاهکار شد! وسایل واقعی تبدیل به نمادهای رازآلود مهندسان شدن! ✨',
);
const TM1_NAME_BATTERY = L('battery', 'باتری');
const TM1_NAME_SWITCH = L('switch', 'کلید');
const TM1_NAME_LED = L('LED', 'لامپ LED');

/** Page 1: the engineers' treasure map — three real parts (battery, switch,
 *  LED) sit on an old scroll; one tap and the scroll becomes a blueprint and
 *  every part morphs into its simple line symbol. */
export function TreasureMapScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [morphed, setMorphed] = useState(false);

  const tap = () => {
    setMorphed((was) => {
      const next = !was;
      if (next) {
        sfx.open();
        window.setTimeout(() => sfx.sparkle(), 500);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('An old magical treasure map scroll whose drawings turn into glowing simple circuit symbols', 'یک طومار قدیمی جادویی که نقاشی‌هایش به نمادهای سادهٔ درخشان مدار تبدیل می‌شوند'))}
      />
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-amber-50"
        role="button"
        tabIndex={0}
        aria-label={tx(morphed ? TM1_MAGIC : TM1_HINT)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the scroll: parchment → blueprint */}
        <rect x={36} y={38} width={568} height={244} rx={10}
          fill={morphed ? '#dbeafe' : '#f3e5c0'} stroke={morphed ? '#93c5fd' : '#d3b98a'} strokeWidth={3.5}
          style={{ transition: motion ? 'fill .5s ease, stroke .5s ease' : 'none' }} />
        {/* blueprint grid (after the magic) */}
        {morphed && [88, 138, 188, 238].map((y) => (
          <line key={`gy-${y}`} x1={56} y1={y} x2={584} y2={y} stroke="#bfdbfe" strokeWidth={1.6} />
        ))}
        {morphed && [116, 216, 316, 416, 516].map((x) => (
          <line key={`gx-${x}`} x1={x} y1={54} x2={x} y2={266} stroke="#bfdbfe" strokeWidth={1.6} />
        ))}
        {/* rolled ends */}
        <rect x={22} y={30} width={26} height={260} rx={13} fill="#e2cfa0" stroke="#c9ab74" strokeWidth={2.6} />
        <rect x={592} y={30} width={26} height={260} rx={13} fill="#e2cfa0" stroke="#c9ab74" strokeWidth={2.6} />
        <ellipse cx={35} cy={46} rx={7} ry={9} fill="#c9ab74" />
        <ellipse cx={605} cy={274} rx={7} ry={9} fill="#c9ab74" />

        {/* wires of the mini schematic (after morph) */}
        {morphed && (
          <g stroke="#0284c7" strokeWidth={3.5} strokeLinecap="round" fill="none">
            <path d="M 584 210 L 536 210" />
            <path d="M 448 210 L 366 210" />
            <path d="M 274 210 L 218 210" />
            <path d="M 128 210 L 56 210" />
          </g>
        )}

        {/* ---- the REAL parts (before morph) ---- */}
        {!morphed && (
          <g>
            {/* real battery (right) */}
            <g>
              <ellipse cx={470} cy={214} rx={40} ry={7} fill="#e2e8f0" />
              <rect x={464} y={122} width={14} height={9} rx={2.5} fill="#94a3b8" />
              <rect x={458} y={130} width={26} height={8} rx={3} fill="#64748b" />
              <rect x={446} y={138} width={50} height={72} rx={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={3} />
              <rect x={446} y={138} width={50} height={15} rx={7.5} fill="#7dd3fc" opacity={0.6} />
              <circle cx={462} cy={164} r={3} fill="#0c4a6e" />
              <circle cx={480} cy={164} r={3} fill="#0c4a6e" />
              <path d="M 465 175 Q 471 181 477 175" stroke="#0c4a6e" strokeWidth={2.2} fill="none" strokeLinecap="round" />
            </g>
            {/* real switch (middle): base + tilted lever */}
            <g>
              <ellipse cx={320} cy={214} rx={40} ry={7} fill="#e2e8f0" />
              <rect x={288} y={196} width={64} height={16} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2.4} />
              <rect x={294} y={192} width={13} height={8} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
              <rect x={333} y={192} width={13} height={8} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1.5} />
              <g transform="rotate(-30 300 192)">
                <rect x={298} y={186} width={40} height={7} rx={3.5} fill="#f59e0b" stroke="#b45309" strokeWidth={1.8} />
              </g>
            </g>
            {/* real LED (left): red dome + legs */}
            <g>
              <ellipse cx={170} cy={214} rx={36} ry={7} fill="#e2e8f0" />
              <rect x={158} y={186} width={7} height={26} rx={3} fill="#94a3b8" />
              <rect x={176} y={186} width={7} height={26} rx={3} fill="#94a3b8" />
              <path d="M 148 190 L 148 164 Q 148 138 170.5 138 Q 193 138 193 164 L 193 190 Z"
                fill="#f87171" stroke="#b91c1c" strokeWidth={3} />
              <ellipse cx={162} cy={152} rx={7} ry={4.5} fill="#fecaca" opacity={0.85} />
            </g>
          </g>
        )}

        {/* ---- the SECRET symbols (after morph) ---- */}
        {morphed && (
          <g>
            {/* battery symbol (right): long thin line + short thick line */}
            <g className={motion ? 'cq-pop' : ''}>
              <line x1={536} y1={188} x2={536} y2={232} stroke="#0f172a" strokeWidth={3.5} strokeLinecap="round" />
              <line x1={514} y1={197} x2={514} y2={223} stroke="#0f172a" strokeWidth={8} strokeLinecap="round" />
              <circle cx={514} cy={239} r={3.4} fill="#0f172a" />
              <text x={546} y={180} fontSize={17} fontWeight="bold" fill="#b45309">+</text>
              <text x={494} y={245} fontSize={17} fontWeight="bold" fill="#334155">−</text>
            </g>
            {/* switch symbol (middle): two dots + open tilted bridge */}
            <g className={motion ? 'cq-pop' : ''} style={{ animationDelay: '0.15s' }}>
              <circle cx={274} cy={210} r={5} fill="#0f172a" />
              <circle cx={366} cy={210} r={5} fill="#0f172a" />
              <line x1={278} y1={210} x2={318} y2={178} stroke="#0f172a" strokeWidth={4} strokeLinecap="round" />
            </g>
            {/* LED symbol (left): triangle pointing left + bar + two light arrows */}
            <g className={motion ? 'cq-pop' : ''} style={{ animationDelay: '0.3s' }}>
              <path d="M 218 190 L 218 230 L 184 210 Z" fill="#fbbf24" stroke="#0f172a" strokeWidth={3.2} strokeLinejoin="round" />
              <line x1={178} y1={188} x2={178} y2={232} stroke="#0f172a" strokeWidth={4} strokeLinecap="round" />
              <g stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" fill="none">
                <line x1={200} y1={178} x2={182} y2={158} />
                <path d="M 190 158 L 181 157 L 182 166" strokeLinejoin="round" />
                <line x1={216} y1={168} x2={204} y2={144} />
                <path d="M 211 143 L 203 143 L 205 152" strokeLinejoin="round" />
              </g>
            </g>
            {/* small name chips under each symbol */}
            <rect x={486} y={262} width={86} height={24} rx={12} fill="#ffffff" stroke="#0284c7" strokeWidth={2} />
            <text x={529} y={278.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(TM1_NAME_BATTERY)}</text>
            <rect x={277} y={236} width={86} height={24} rx={12} fill="#ffffff" stroke="#0284c7" strokeWidth={2} />
            <text x={320} y={252.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(TM1_NAME_SWITCH)}</text>
            <rect x={128} y={262} width={86} height={24} rx={12} fill="#ffffff" stroke="#0284c7" strokeWidth={2} />
            <text x={171} y={278.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(TM1_NAME_LED)}</text>
          </g>
        )}

        {!morphed && motion && (
          <text x={320} y={96} fontSize={22} textAnchor="middle">
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {morphed && motion && (
          <>
            <text x={96} y={76} fontSize={20} className="cq-float">✨</text>
            <text x={556} y={96} fontSize={16} className="cq-float" style={{ animationDelay: '0.4s' }}>⭐</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${morphed ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(morphed ? TM1_MAGIC : TM1_HINT)}
      </p>
    </div>
  );
}

/* --------------------------------------- page 2 · battery-wire-symbol (l0-14) */

const BW2_HINT = L(
  'Tap the LONG line to see the positive (+) sign!',
  'روی خطِ بلند بزن تا علامت مثبت (+) رو ببینی!',
);
const BW2_PLUS = L(
  'The longer, thinner line is the positive pole (+)! Now tap the short one… 👉',
  'خطِ بلندتر و نازک‌تر = قطب مثبت (+)! حالا روی خطِ کوتاه بزن… 👉',
);
const BW2_DONE = L(
  'The battery symbol is decoded: long line ➕, short line ➖! And wires are just straight lines! 🎉',
  'نمادِ باتری رازگشایی شد: خطِ بلند ➕ و خطِ کوتاه ➖! و سیم‌ها هم فقط خطِ صاف‌اند! 🎉',
);
const BW2_TAP_PLUS = L('tap the long line (positive)', 'روی خطِ بلند بزن (مثبت)');
const BW2_TAP_MINUS = L('tap the short line (negative)', 'روی خطِ کوتاه بزن (منفی)');
const BW2_PLUS_CHIP = L('➕ Positive (long line)', '➕ قطب مثبت (خطِ بلند)');
const BW2_MINUS_CHIP = L('➖ Negative (short line)', '➖ قطب منفی (خطِ کوتاه)');
const BW2_NUB_CHIP = L('bumpy top = ➕', 'سرِ قلمبه = ➕');
const BW2_FLAT_CHIP = L('flat bottom = ➖', 'تهِ صاف = ➖');
const BW2_WIRE_CHIP = L('wires = straight lines', 'سیم‌ها = خط‌های صاف');

/** Page 2: the real AA battery next to its schematic symbol — tap the long
 *  thin line to reveal + and the short thick line to reveal −, and see that
 *  wires are drawn as simple straight lines meeting at a dot. */
export function BatteryWireSymbolScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [found, setFound] = useState({ plus: false, minus: false });

  const reveal = (which: 'plus' | 'minus', sound: () => void) => {
    setFound((prev) => {
      if (prev[which]) return prev;
      sound();
      const next = { ...prev, [which]: true };
      if (next.plus && next.minus) {
        window.setTimeout(() => sfx.fanfare(), 260);
        window.setTimeout(() => sfx.sparkle(), 640);
      }
      return next;
    });
  };

  const status = found.plus && found.minus ? BW2_DONE : found.plus ? BW2_PLUS : BW2_HINT;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A realistic cartoon AA battery standing next to its clean schematic symbol of two parallel lines, one long thin and one short thick', 'یک باتری قلمی واقعی کارتونی که کنار نماد خطی‌اش با دو خط موازی ایستاده — یکی بلند و نازک، یکی کوتاه و ضخیم'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🔋 {tx(BW2_HINT)}</p>
      <svg viewBox="0 0 640 320" className="block w-full select-none rounded-2xl border-2 border-slate-200 bg-sky-50" role="img" aria-label={tx(status)}>
        <ellipse cx={320} cy={300} rx={280} ry={11} fill="#e2e8f0" />

        {/* the real AA battery (right) */}
        <g>
          <ellipse cx={486} cy={292} rx={54} ry={9} fill="#e2e8f0" />
          <rect x={478} y={128} width={16} height={10} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.6} />
          <rect x={470} y={137} width={32} height={9} rx={4} fill="#64748b" />
          <rect x={456} y={146} width={60} height={144} rx={12} fill="#38bdf8" stroke="#0369a1" strokeWidth={3.2} />
          <rect x={456} y={146} width={60} height={26} rx={13} fill="#7dd3fc" opacity={0.6} />
          <rect x={466} y={222} width={40} height={14} rx={3} fill="#e0f2fe" opacity={0.75} />
          <circle cx={474} cy={178} r={3.2} fill="#0c4a6e" />
          <circle cx={498} cy={178} r={3.2} fill="#0c4a6e" />
          <path d="M 478 190 Q 486 197 494 190" stroke="#0c4a6e" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <circle cx={466} cy={194} r={4.4} fill="#fda4af" opacity={0.8} />
          <circle cx={506} cy={194} r={4.4} fill="#fda4af" opacity={0.8} />
          {/* the bumpy-top / flat-bottom chips (appear with their symbol side) */}
          {found.plus && (
            <g className={motion ? 'cq-pop' : ''}>
              <rect x={384} y={112} width={142} height={26} rx={13} fill="#ffffff" stroke="#16a34a" strokeWidth={2.2} />
              <text x={455} y={129.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(BW2_NUB_CHIP)}</text>
            </g>
          )}
          {found.minus && (
            <g className={motion ? 'cq-pop' : ''}>
              <rect x={384} y={262} width={142} height={26} rx={13} fill="#ffffff" stroke="#475569" strokeWidth={2.2} />
              <text x={455} y={279.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(BW2_FLAT_CHIP)}</text>
            </g>
          )}
        </g>

        {/* the schematic symbol (left): long thin line on top, short thick below */}
        <g>
          {/* wire stubs going up and down from the symbol */}
          <line x1={170} y1={148} x2={170} y2={104} stroke="#64748b" strokeWidth={4} strokeLinecap="round" />
          <circle cx={170} cy={100} r={4.5} fill="#0f172a" />
          <line x1={170} y1={244} x2={170} y2={278} stroke="#64748b" strokeWidth={4} strokeLinecap="round" />
          <circle cx={170} cy={282} r={4.5} fill="#0f172a" />

          {/* the long thin line = positive (tappable) */}
          <g
            role="button"
            tabIndex={0}
            aria-label={tx(BW2_TAP_PLUS)}
            onClick={() => reveal('plus', sfx.blip)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                reveal('plus', sfx.blip);
              }
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <rect x={106} y={166} width={128} height={17} rx={2} fill="#38bdf8" opacity={0.001} />
            <line x1={112} y1={174.5} x2={228} y2={174.5} stroke="#0f172a" strokeWidth={3.5} strokeLinecap="round" />
            {found.plus && (
              <g className={motion ? 'cq-pop' : ''}>
                <circle cx={170} cy={140} r={17} fill="#22c55e" stroke="#15803d" strokeWidth={2.6} />
                <text x={170} y={147} fontSize={19} fontWeight="bold" textAnchor="middle" fill="#ffffff">+</text>
              </g>
            )}
          </g>

          {/* the short thick line = negative (tappable) */}
          <g
            role="button"
            tabIndex={0}
            aria-label={tx(BW2_TAP_MINUS)}
            onClick={() => reveal('minus', sfx.pop)}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                reveal('minus', sfx.pop);
              }
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <rect x={130} y={203} width={80} height={22} rx={2} fill="#38bdf8" opacity={0.001} />
            <line x1={136} y1={214} x2={204} y2={214} stroke="#0f172a" strokeWidth={8} strokeLinecap="round" />
            {found.minus && (
              <g className={motion ? 'cq-pop' : ''}>
                <circle cx={170} cy={252} r={17} fill="#f87171" stroke="#b91c1c" strokeWidth={2.6} />
                <text x={170} y={259} fontSize={19} fontWeight="bold" textAnchor="middle" fill="#ffffff">−</text>
              </g>
            )}
          </g>
        </g>

        {/* the wire lesson (bottom-left): two straight wires meeting at a dot */}
        <g>
          <line x1={62} y1={296} x2={150} y2={296} stroke="#0f172a" strokeWidth={3.4} strokeLinecap="round" />
          <circle cx={154} cy={296} r={5} fill="#0f172a" />
          <line x1={158} y1={296} x2={256} y2={296} stroke="#0f172a" strokeWidth={3.4} strokeLinecap="round" />
          <text x={160} y={286} fontSize={11.5} fontWeight="bold" textAnchor="middle" fill="#64748b">{tx(BW2_WIRE_CHIP)}</text>
        </g>

        {/* label chips for the two symbol lines */}
        {found.plus && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={30} y={26} width={190} height={26} rx={13} fill="#ffffff" stroke="#16a34a" strokeWidth={2.2} />
            <text x={125} y={43.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#15803d">{tx(BW2_PLUS_CHIP)}</text>
          </g>
        )}
        {found.minus && (
          <g className={motion ? 'cq-pop' : ''}>
            <rect x={30} y={58} width={190} height={26} rx={13} fill="#ffffff" stroke="#475569" strokeWidth={2.2} />
            <text x={125} y={75.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(BW2_MINUS_CHIP)}</text>
          </g>
        )}

        {!found.plus && motion && (
          <text x={252} y={162} fontSize={19}>
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {found.plus && !found.minus && motion && (
          <text x={244} y={226} fontSize={19}>
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {found.plus && found.minus && motion && (
          <>
            <text x={262} y={92} fontSize={20} className="cq-float">🎉</text>
            <text x={520} y={104} fontSize={16} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${found.plus && found.minus ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* --------------------------------------- page 3 · switch-led-symbol (l0-14) */

const SL3_HINT = L(
  'Tap the tilted bridge to straighten it and let the glowing arrows fly!',
  'روی پلِ کج بزن تا صاف بشه و فلش‌های نورانی بیرون بیایند!',
);
const SL3_CLOSED = L(
  'The bridge straightened (closed switch), the circuit connected and the light arrows jumped out of the LED! 💡',
  'پل صاف شد (کلیدِ بسته)، مدار وصل شد و فلش‌های نور از LED پرید بیرون! 💡',
);
const SL3_OPEN_CHIP = L('tilted bridge = open switch', 'پلِ کج = کلیدِ باز');
const SL3_CLOSED_CHIP = L('straight bridge = closed switch', 'پلِ صاف = کلیدِ بسته');
const SL3_LED_CHIP = L('triangle + line + arrows = LED', 'مثلث + خط + فلش‌ها = LED');
const SL3_RUN = 'M 452 210 L 96 210';

/** Page 3: the switch and LED schematic symbols on one wire — tap the open
 *  tilted bridge and it straightens onto the wire; electrons run and the two
 *  tiny light arrows shoot out of the triangle+line LED symbol. */
export function SwitchLedSymbolScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [closed, setClosed] = useState(false);

  const tap = () => {
    setClosed((was) => {
      const next = !was;
      if (next) {
        sfx.click();
        window.setTimeout(() => sfx.powerup(), 240);
        window.setTimeout(() => sfx.sparkle(), 620);
      } else {
        sfx.whoosh();
      }
      return next;
    });
  };

  const status = closed ? SL3_CLOSED : SL3_HINT;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('The schematic symbols of a switch drawn like an open tilted bridge and an LED drawn like a triangle with a line and two tiny glowing arrows', 'نماد مداریِ کلید مثل یک پلِ کج‌وباز و نماد LED مثل یک مثلث با یک خط و دو فلش نورانی کوچک'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🎛️ {tx(SL3_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        <ellipse cx={320} cy={296} rx={280} ry={11} fill="#e2e8f0" />

        {/* the wire: battery symbol → switch → LED → left arrow end */}
        <path d="M 548 210 L 452 210" fill="none" stroke="#64748b" strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 390 210 L 276 210" fill="none" stroke="#64748b" strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 216 210 L 100 210" fill="none" stroke="#64748b" strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 88 210 L 102 202 M 88 210 L 102 218" stroke="#64748b" strokeWidth={4} strokeLinecap="round" fill="none" />

        {/* the small battery symbol feeding the wire (far right) */}
        <g>
          <line x1={566} y1={190} x2={566} y2={230} stroke="#0f172a" strokeWidth={3.4} strokeLinecap="round" />
          <line x1={548} y1={198} x2={548} y2={222} stroke="#0f172a" strokeWidth={7.5} strokeLinecap="round" />
          <text x={574} y={186} fontSize={13} fontWeight="bold" fill="#b45309">+</text>
          <text x={528} y={244} fontSize={13} fontWeight="bold" fill="#334155">−</text>
        </g>

        {/* the switch symbol: two dots + bridge (straightens on tap) */}
        <g>
          <circle cx={452} cy={210} r={6} fill="#0f172a" />
          <circle cx={390} cy={210} r={6} fill="#0f172a" />
          <g transform={closed ? 'rotate(0 452 210)' : 'rotate(-26 452 210)'}
            style={{ transition: motion ? 'transform .3s ease-out' : 'none' }}>
            <line x1={452} y1={210} x2={390} y2={210} stroke="#f59e0b" strokeWidth={5.5} strokeLinecap="round" />
          </g>
          {!closed && motion && (
            <text x={432} y={164} fontSize={19} textAnchor="middle">
              👆
              <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
            </text>
          )}
        </g>

        {/* the LED symbol: triangle pointing left + perpendicular line + arrows */}
        <g>
          {closed && motion && (
            <circle cx={232} cy={210} r={34} fill="#fde047" opacity={0.3}>
              <animate attributeName="r" values="30;42;30" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <path d="M 262 186 L 262 234 L 226 210 Z"
            fill={closed ? '#fbbf24' : '#f1f5f9'} stroke="#0f172a" strokeWidth={3.4} strokeLinejoin="round"
            style={{ transition: motion ? 'fill .3s ease' : 'none' }} />
          <line x1={218} y1={186} x2={218} y2={234} stroke="#0f172a" strokeWidth={4.5} strokeLinecap="round" />
          {/* the two tiny light arrows (fly out when closed) */}
          {closed && (
            <g stroke="#f59e0b" strokeWidth={3.4} strokeLinecap="round" fill="none">
              <g>
                <line x1={250} y1={176} x2={224} y2={148} />
                <path d="M 234 147 L 223 147 L 224 158" strokeLinejoin="round" />
                <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" repeatCount="indefinite" />
              </g>
              <g>
                <line x1={272} y1={162} x2={252} y2={130} />
                <path d="M 261 129 L 250 130 L 253 140" strokeLinejoin="round" />
                <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" begin="0.3s" repeatCount="indefinite" />
              </g>
            </g>
          )}
        </g>

        {/* the electrons: one waiting, then three running to the left */}
        {!closed && (
          <g transform="translate(486 210)">
            <g className={motion ? 'cq-float' : ''} style={{ animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            </g>
          </g>
        )}
        {closed && [0, 1, 2].map((i) => (
          <g key={`run-${i}`}>
            {motion && (
              <animateMotion key={`sl-${i}`} dur="2s" begin={`-${(i * 0.66).toFixed(2)}s`} repeatCount="indefinite" path={SL3_RUN} />
            )}
            <circle cx={0} cy={0} r={9} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
            <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
            <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* label chips */}
        <g>
          <rect x={352} y={96} width={196} height={26} rx={13} fill="#ffffff"
            stroke={closed ? '#16a34a' : '#dc2626'} strokeWidth={2.2}
            style={{ transition: motion ? 'stroke .3s ease' : 'none' }} />
          <text x={450} y={113.5} fontSize={12.5} fontWeight="bold" textAnchor="middle"
            fill={closed ? '#15803d' : '#b91c1c'}>{tx(closed ? SL3_CLOSED_CHIP : SL3_OPEN_CHIP)}</text>
        </g>
        <g>
          <rect x={128} y={266} width={208} height={26} rx={13} fill="#ffffff" stroke="#0284c7" strokeWidth={2.2} />
          <text x={232} y={283.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">{tx(SL3_LED_CHIP)}</text>
        </g>

        {closed && motion && (
          <>
            <text x={116} y={148} fontSize={17} className="cq-float">✨</text>
            <text x={520} y={152} fontSize={15} className="cq-float" style={{ animationDelay: '0.4s' }}>⚡</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${closed ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}

/* ------------------------------------------------- page 4 · map-trace (l0-14) */

const MT4_HINT = L(
  'Drag your finger along the map lines to follow the electrons\u2019 full loop!',
  'انگشتت رو روی خط‌های نقشه بکش تا مسیر دور زدن الکترون رو ببینی!',
);
const MT4_STEPS = [
  L('Step 1 — from the negative pole, walk along the wire until you reach the switch! 🎛️', 'پلهٔ ۱ — از قطب منفی روی خطِ سیم راه برو تا برسی به کلید! 🎛️'),
  L('Step 2 — keep walking on the map… here is the resistor! 🚧', 'پلهٔ ۲ — روی نقشه راه برو… اینجا مقاومته! 🚧'),
  L('Step 3 — climb up and meet the LED! 💡', 'پلهٔ ۳ — بالا برو و به لامپ LED برس! 💡'),
  L('Step 4 — follow the line back to the battery\u2019s positive pole! ➕', 'پلهٔ ۴ — خط رو دنبال کن و برگرد به قطب مثبتِ باتری! ➕'),
] as const;
const MT4_DONE = L(
  'The loop is complete! You read the map like a real engineer and the circuit works 100 percent! ⚡',
  'دور کامل شد! مثل یک مهندس واقعی نقشه رو خوندی و مدارت ۱۰۰٪ کار می‌کنه! ⚡',
);
const MT4_START = L('start: the negative pole ➖', 'شروع: قطب منفی ➖');
const MT4_NAME_SWITCH = L('1. the switch 🎛️', '۱. کلید 🎛️');
const MT4_NAME_RESISTOR = L('2. the resistor 🚧', '۲. مقاومت 🚧');
const MT4_NAME_LED = L('3. the LED 💡', '۳. لامپ LED 💡');
const MT4_NAME_PLUS = L('4. the positive pole ➕', '۴. قطب مثبت ➕');
/** the journey: − (battery bottom-right) → switch → resistor → up → LED → + */
const MT4_HOPS = [
  'M 578 254 L 578 292 L 400 292',
  'M 400 292 L 184 292',
  'M 184 292 L 64 292 L 64 84 L 214 84',
  'M 214 84 L 576 84 L 578 86 L 578 136',
] as const;
const MT4_SEGS = [
  'M 578 240 L 578 292 L 400 292',
  'M 400 292 L 184 292',
  'M 184 292 L 64 292 L 64 84 L 214 84',
  'M 214 84 L 576 84 L 578 86 L 578 140',
] as const;
const MT4_DURS = [1.4, 1.5, 2.6, 2.4] as const;
const MT4_STOPS = [
  { x: 400, y: 292 },
  { x: 184, y: 292 },
  { x: 214, y: 84 },
  { x: 578, y: 140 },
] as const;

/** Page 4: reading the circuit map — every tap walks the little electron one
 *  leg further along the glowing blue map (− → switch → resistor → LED → +);
 *  when the loop is complete the whole map celebrates. */
export function MapTraceScene({ image }: { image: string }) {
  const { tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const [step, setStep] = useState(0);
  const [flying, setFlying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    for (const t of timers.current) window.clearTimeout(t);
  }, []);

  const tap = () => {
    if (flying) return;
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
    if (step >= 4) {
      setStep(0);
      sfx.whoosh();
      return;
    }
    const dur = MT4_DURS[step];
    const nextStep = step + 1;
    setStep(nextStep);
    setFlying(true);
    sfx.whoosh();
    timers.current.push(
      window.setTimeout(() => {
        setFlying(false);
        sfx.blip();
        if (nextStep >= 4) {
          window.setTimeout(() => sfx.fanfare(), 250);
          window.setTimeout(() => sfx.sparkle(), 650);
        }
      }, motion ? dur * 1000 : 700),
    );
  };

  const done = step >= 4;
  const status = done ? MT4_DONE : step === 0 ? MT4_START : MT4_STEPS[step - 1];
  const chips = [MT4_NAME_SWITCH, MT4_NAME_RESISTOR, MT4_NAME_LED, MT4_NAME_PLUS] as const;
  const stop = step > 0 ? MT4_STOPS[step - 1] : null;

  return (
    <div className="space-y-3">
      <StoryImage
        src={image}
        alt={tx(L('A smiling child engineer tracing a glowing blue circuit map with a finger', 'کودکِ مهندسِ خندانی که با انگشتش نقشهٔ آبیِ درخشانِ مدار را دنبال می‌کند'))}
      />
      <p className="text-center text-sm font-bold text-slate-500">🧭 {tx(MT4_HINT)}</p>
      <svg
        viewBox="0 0 640 320"
        className="block w-full cursor-pointer select-none rounded-2xl border-2 border-slate-200 bg-sky-50"
        role="button"
        tabIndex={0}
        aria-label={tx(status)}
        onClick={tap}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            tap();
          }
        }}
        style={{ outline: 'none' }}
      >
        {/* the glowing blue map lines */}
        <path d="M 578 240 L 578 292 L 64 292 L 64 84 L 578 84 L 578 140"
          fill="none" stroke="#7dd3fc" strokeWidth={12} strokeLinecap="round" opacity={0.35} />
        <path d="M 578 240 L 578 292 L 64 292 L 64 84 L 578 84 L 578 140"
          fill="none" stroke="#0ea5e9" strokeWidth={4.5} strokeLinecap="round" />

        {/* the walked part of the journey (bright overlay) */}
        {MT4_SEGS.slice(0, step).map((seg, i) => (
          <path key={`seg-${i}`} d={seg} fill="none" stroke="#0284c7" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        ))}

        {/* the station rings */}
        {MT4_STOPS.map((s, i) => (
          <circle key={`st-${i}`} cx={s.x} cy={s.y} r={26} fill="none"
            stroke={step > i ? '#0284c7' : '#93c5fd'} strokeWidth={step > i ? 3.4 : 2.4}
            strokeDasharray={step > i ? undefined : '5 6'} opacity={step > i ? 0.95 : 0.6} />
        ))}

        {/* the battery on the right edge: bumpy + top, flat − bottom */}
        <g>
          <rect x={562} y={124} width={32} height={17} rx={5} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
          <rect x={548} y={140} width={60} height={116} rx={12} fill="#38bdf8" stroke="#0369a1" strokeWidth={3.2} />
          <rect x={548} y={140} width={60} height={22} rx={11} fill="#7dd3fc" opacity={0.6} />
          <rect x={540} y={234} width={76} height={14} rx={4.5} fill="#334155" stroke="#1e293b" strokeWidth={2} />
          <text x={578} y={118} fontSize={13} fontWeight="bold" textAnchor="middle" fill="#b45309">+</text>
          <text x={578} y={262} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#f8fafc">−</text>
          <circle cx={566} cy={178} r={3} fill="#0c4a6e" />
          <circle cx={590} cy={178} r={3} fill="#0c4a6e" />
          <path d="M 570 190 Q 578 197 586 190" stroke="#0c4a6e" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </g>

        {/* station 1: the switch symbol (open bridge on the bottom road) */}
        <g>
          <circle cx={376} cy={292} r={5.5} fill="#0f172a" />
          <circle cx={424} cy={292} r={5.5} fill="#0f172a" />
          <g transform={step >= 1 ? 'rotate(0 424 292)' : 'rotate(-24 424 292)'}
            style={{ transition: motion ? 'transform .3s ease-out' : 'none' }}>
            <line x1={424} y1={292} x2={376} y2={292} stroke="#0f172a" strokeWidth={4.5} strokeLinecap="round" />
          </g>
          <text x={400} y={318} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(L('switch', 'کلید'))}</text>
        </g>

        {/* station 2: the resistor (four-band bar on the bottom road) */}
        <g>
          <rect x={152} y={282} width={64} height={20} rx={7} fill="#fbbf24" stroke="#b45309" strokeWidth={2.4} />
          <rect x={163} y={282} width={7} height={20} fill="#ef4444" />
          <rect x={176} y={282} width={7} height={20} fill="#ef4444" />
          <rect x={189} y={282} width={7} height={20} fill="#7c3aed" />
          <rect x={202} y={282} width={7} height={20} fill="#d4af37" />
          <text x={184} y={318} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(L('resistor', 'مقاومت'))}</text>
        </g>

        {/* station 3: the LED symbol (triangle + line, on the top road) */}
        <g>
          {step >= 3 && motion && (
            <circle cx={228} cy={84} r={30} fill="#fde047" opacity={0.32}>
              <animate attributeName="r" values="26;38;26" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
          <path d="M 258 62 L 258 106 L 226 84 Z"
            fill={step >= 3 ? '#fbbf24' : '#f1f5f9'} stroke="#0f172a" strokeWidth={3.2} strokeLinejoin="round"
            style={{ transition: motion ? 'fill .3s ease' : 'none' }} />
          <line x1={219} y1={62} x2={219} y2={106} stroke="#0f172a" strokeWidth={4.2} strokeLinecap="round" />
          {step >= 3 && (
            <g stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" fill="none">
              <line x1={248} y1={50} x2={228} y2={28} />
              <path d="M 236 27 L 227 27 L 229 37" strokeLinejoin="round" />
              <line x1={268} y1={40} x2={252} y2={16} />
              <path d="M 259 15 L 250 16 L 254 25" strokeLinejoin="round" />
            </g>
          )}
          <text x={228} y={126} fontSize={12} fontWeight="bold" textAnchor="middle" fill="#334155">{tx(L('LED', 'لامپ LED'))}</text>
        </g>

        {/* the traveling electron */}
        {step === 0 && !flying && (
          <g transform="translate(578 266)">
            <g className={motion ? 'cq-float' : ''} style={{ animationDuration: '2.6s' }}>
              <circle cx={0} cy={0} r={9.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        )}
        {flying && motion && (
          <g>
            <animateMotion key={`hop-${step}`} dur={`${MT4_DURS[step - 1]}s`} repeatCount="1" fill="freeze" path={MT4_HOPS[step - 1]} />
            <circle cx={0} cy={0} r={10} fill="#38bdf8" stroke="#0369a1" strokeWidth={2.2} />
            <circle cx={-3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <circle cx={3} cy={-1.8} r={1.8} fill="#0c4a6e" />
            <path d="M -3 2.4 Q 0 5 3 2.4" stroke="#0c4a6e" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        )}
        {stop && !flying && (
          <g transform={`translate(${stop.x} ${stop.y})`}>
            <g className={motion ? 'cq-float' : ''} style={{ animationDuration: '2.8s' }}>
              <circle cx={0} cy={0} r={9.5} fill="#38bdf8" stroke="#0369a1" strokeWidth={2} />
              <circle cx={-2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <circle cx={2.6} cy={-1.6} r={1.6} fill="#0c4a6e" />
              <path d="M -2.6 2.2 Q 0 4.4 2.6 2.2" stroke="#0c4a6e" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        )}

        {/* the arrival chip */}
        {step > 0 && (
          <g className={motion ? 'cq-pop' : ''} key={`chip-${step}`}>
            <rect x={30} y={26} width={200} height={26} rx={13} fill="#ffffff" stroke="#0284c7" strokeWidth={2.2} />
            <text x={130} y={43.5} fontSize={12.5} fontWeight="bold" textAnchor="middle" fill="#0369a1">
              {tx(chips[step - 1])}
            </text>
          </g>
        )}

        {step === 0 && motion && (
          <text x={500} y={286} fontSize={19}>
            👆
            <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
          </text>
        )}
        {done && motion && (
          <>
            <text x={150} y={140} fontSize={21} className="cq-float">🎉</text>
            <text x={430} y={56} fontSize={16} className="cq-float" style={{ animationDelay: '0.4s' }}>✨</text>
          </>
        )}
      </svg>
      <p className={`text-center text-sm font-extrabold ${done ? 'text-teal-700' : 'text-slate-500'}`}>
        {tx(status)}
      </p>
    </div>
  );
}
