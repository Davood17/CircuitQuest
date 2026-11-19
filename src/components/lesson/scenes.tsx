'use client';

/**
 * Original educational SVG scenes. Each scene is self-contained, kid-friendly,
 * and parameterized. Rendered inside lesson screens.
 * All labels are LocaleText (en + fa) — resolved live from the i18n settings.
 */

import { useState } from 'react';
import type { SceneSpec } from '@/content/types';
import { PartVisual } from '@/parts/visuals';
import { useI18n, txText, type LocaleText } from '@/lib/i18n';
import { useSettings } from '@/stores/settings';
import { sfx } from '@/lib/sfx';
import { L } from '@/content/helpers';
import {
  AmpereDetectiveScene,
  BatteryBackpackScene,
  BatteryDuoScene,
  BatteryFactoryScene,
  BatteryFamilyScene,
  BatteryTerminalsScene,
  ColorBandsScene,
  BatterySocketScene,
  BridgeCrossScene,
  BridgeMoveScene,
  BridgeOpenScene,
  BridgeSwitchScene,
  BatteryWireSymbolScene,
  CelebrationScene,
  CircuitStationsScene,
  ClipJumperScene,
  ConductorInsulatorScene,
  CopperHeartScene,
  CopperSlideScene,
  ElectronRaceScene,
  FixCircuitScene,
  HappyLedScene,
  LedBodyguardScene,
  LedHeroScene,
  LedLegsScene,
  LedRainbowScene,
  LedResistorScene,
  MapTraceScene,
  MaterialLabScene,
  PlasticRaincoatScene,
  PowerJourneyScene,
  NarrowRoadScene,
  PinchPipeScene,
  RaceFinishScene,
  RaceStartScene,
  RiverBrookScene,
  TraceCircuitScene,
  RoomWakeScene,
  SafeDangerScene,
  SafetyJacketScene,
  ShieldUnlockScene,
  ShortCircuitScene,
  SwitchBridgeScene,
  SwitchFamilyScene,
  SwitchLedSymbolScene,
  SwitchPoliceScene,
  SwitchPositionScene,
  TidyDeskScene,
  TreasureMapScene,
  VoltageCurrentTeamScene,
  VoltageHeroScene,
  WaterPressureScene,
  WireHighwayScene,
} from './story-scenes';

const INK = '#334155';

function Frame({ children, bg = '#f8fafc' }: { children: React.ReactNode; bg?: string }) {
  return (
    <svg viewBox="0 0 640 360" className="w-full rounded-2xl border bg-white" style={{ background: bg }}>
      {children}
    </svg>
  );
}

const Label = ({
  x,
  y,
  text,
  size = 15,
  color = INK,
  bold = true,
}: {
  x: number;
  y: number;
  text: string | LocaleText;
  size?: number;
  color?: string;
  bold?: boolean;
}) => {
  const { lang } = useI18n();
  const shown = typeof text === 'string' ? text : txText(text, lang);
  return (
    <text x={x} y={y} fontSize={size} fontWeight={bold ? 700 : 400} fill={color} textAnchor="middle">
      {shown}
    </text>
  );
};

const dots = (cx: number, cy: number, r: number, n: number, speed = 1, color = '#f59e0b') => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle key={i} r={4} fill={color}>
        <animateMotion
          dur={`${Math.max(1.2, 4 / speed)}s`}
          repeatCount="indefinite"
          begin={`${(i / n) * (4 / speed)}s`}
          path={`M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`}
        />
      </circle>
    ))}
  </g>
);

/** anim captions arrive as English prop strings — map them to bilingual pairs */

/** A tiny blue electron (−) that travels along an SVG path. */
const Electron = ({ d, dur = 3, begin = 0, r = 6.5 }: { d: string; dur?: number; begin?: number; r?: number }) => (
  <g>
    <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} />
    <circle r={r} fill="#0ea5e9" stroke="#075985" strokeWidth={1.5} />
    <line x1={-r * 0.45} y1={0} x2={r * 0.45} y2={0} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
  </g>
);

/** Several electrons spaced evenly along a path (negative begin → no pile-up at start). */
const ElectronsOnPath = ({ d, n = 6, dur = 3, r = 6.5 }: { d: string; n?: number; dur?: number; r?: number }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <Electron key={i} d={d} dur={dur} begin={-(i / n) * dur} r={r} />
    ))}
  </g>
);

/** Green pill label with white text — like the handout tags. */
const Tag = ({ x, y, text, color = '#16a34a', size = 14 }: { x: number; y: number; text: string | LocaleText; color?: string; size?: number }) => {
  const { lang } = useI18n();
  const shown = typeof text === 'string' ? text : txText(text, lang);
  const w = Math.max(56, shown.length * size * 0.75 + 22);
  return (
    <g>
      <rect x={x - w / 2} y={y - size} width={w} height={size * 2} rx={size} fill={color} />
      <text x={x} y={y + size * 0.45} textAnchor="middle" fontSize={size} fontWeight={700} fill="#fff">{shown}</text>
    </g>
  );
};

/** Dashed pointer from a tag to its target (ends with a small blue dot, like the handout). */
const Pointer = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={1.6} strokeDasharray="4 3" />
    <circle cx={x2} cy={y2} r={3.5} fill="#2563eb" />
  </g>
);

// --------------------------------------------------------------- scene art

function SwitchDoorScene() {
  return (
    <Frame>
      <g transform="translate(200 175)"><PartVisual type="switch" params={{}} state={{ closed: false }} /></g>
      <g transform="translate(430 175)"><PartVisual type="switch" params={{}} state={{ closed: true }} /></g>
      <Label x={200} y={248} text={L('OPEN — bridge up', 'باز — پل بالا')} size={15} color="#dc2626" />
      <Label x={200} y={272} text={L('🚫 no current', '🚫 برق رد نمی‌شود')} size={14} color="#94a3b8" />
      <Label x={430} y={248} text={L('CLOSED — bridge down', 'بسته — پل پایین')} size={15} color="#059669" />
      <Label x={430} y={272} text={L('✅ current flows', '✅ برق رد می‌شود')} size={14} color="#94a3b8" />
      <Label x={320} y={70} text={L('a switch is a bridge for current', 'کلید مثل پلی برای برق است')} size={17} />
    </Frame>
  );
}

function LedAnatomyScene() {
  return (
    <Frame>
      <g transform="translate(320 170) scale(1.8)"><PartVisual type="led" params={{ color: 'red' }} state={{ brightness: 0.9, running: true }} /></g>
      <Label x={175} y={125} text={L('A = anode (long leg)', 'A = آند (پایهٔ بلند)')} size={15} color="#0f766e" />
      <path d="M 195 135 Q 245 150 275 165" stroke="#0f766e" strokeWidth={2.5} fill="none" strokeDasharray="5 4" />
      <Label x={462} y={125} text={L('K = cathode (short + flat)', 'K = کاتد (کوتاه و صاف)')} size={15} color="#b91c1c" />
      <path d="M 448 135 Q 405 150 372 165" stroke="#b91c1c" strokeWidth={2.5} fill="none" strokeDasharray="5 4" />
      <Label x={320} y={310} text={L('current: A → K only. backwards = dark!', 'جریان فقط از A به K. برعکس = خاموش!')} size={16} color="#475569" />
    </Frame>
  );
}

function ColorCodeScene() {
  const bands = [
    { c: '#dc2626', v: '2' }, { c: '#dc2626', v: '2' }, { c: '#78350f', v: '×10' },
  ];
  return (
    <Frame>
      <g transform="translate(320 160) scale(2.6)"><PartVisual type="resistor" params={{ resistance: 220 }} state={{}} /></g>
      {bands.map((b, i) => (
        <g key={i}>
          <circle cx={250 + i * 55} cy={250} r={16} fill={b.c} />
          <text x={250 + i * 55} y={256} fontSize={14} fontWeight={800} textAnchor="middle" fill="#fff">{b.v}</text>
        </g>
      ))}
      <Label x={320} y={305} text={L('red(2) red(2) brown(×10) → 220 Ω', 'قرمز(۲) قرمز(۲) قهوه‌ای(×۱۰) ← ۲۲۰ اهم')} size={17} color="#0f766e" />
      <Label x={320} y={45} text={L('resistors wear their value as colored stripes', 'مقدارِ مقاومت را با نوارهای رنگی نشان می‌دهند')} size={15} color="#475569" />
    </Frame>
  );
}

function ButtonPressScene() {
  return (
    <Frame>
      <g transform="translate(230 170) scale(1.5)"><PartVisual type="button" params={{}} state={{ pressed: false }} /></g>
      <g transform="translate(450 170) scale(1.5)"><PartVisual type="button" params={{}} state={{ pressed: true, running: true }} /></g>
      <Label x={230} y={245} text={L('released → open', 'رها ← قطع')} size={15} color="#dc2626" />
      <Label x={450} y={245} text={L('pressed → closed', 'فشار داده ← وصل')} size={15} color="#059669" />
      <Label x={320} y={70} text={L('momentary: only closed while you press', 'لحظه‌ای: فقط تا وقتی فشار می‌دهی وصل است')} size={16} />
    </Frame>
  );
}

// __PART3__

function BatteryStackScene() {
  return (
    <Frame>
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${240 + i * 10} ${140 + i * -46}) scale(1.7)`}>
          <PartVisual type="battery" params={{ voltage: 1.5 }} state={{}} />
        </g>
      ))}
      <Label x={320} y={270} text={L('1.5 V + 1.5 V = 3 V (pushes add!)', '۱٫۵ + ۱٫۵ = ۳ ولت (فشارها جمع می‌شوند!)')} size={17} color="#0f766e" />
      <Label x={320} y={45} text={L('series batteries stack their pressure', 'باتری‌های پشت‌سرِ هم، فشارشان جمع می‌شود')} size={15} color="#475569" />
    </Frame>
  );
}

function MultimeterFaceScene() {
  return (
    <Frame>
      <rect x={200} y={60} width={240} height={230} rx={24} fill="#f1f5f9" stroke={INK} strokeWidth={4} />
      <rect x={235} y={95} width={170} height={70} rx={10} fill="#0f172a" />
      <text x={320} y={145} fontSize={34} fontWeight={800} textAnchor="middle" fill="#34d399" fontFamily="monospace">9.02</text>
      {['V', 'A', 'Ω'].map((m, i) => (
        <g key={m}>
          <circle cx={260 + i * 60} cy={225} r={20} fill={i === 0 ? '#14b8a6' : '#e2e8f0'} stroke={INK} strokeWidth={2.5} />
          <text x={260 + i * 60} y={232} fontSize={17} fontWeight={800} textAnchor="middle" fill={i === 0 ? '#fff' : INK}>{m}</text>
        </g>
      ))}
      <path d="M 320 290 L 300 330 M 320 290 L 340 330" stroke="#dc2626" strokeWidth={4} strokeLinecap="round" />
      <path d="M 320 290 L 320 335" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <Label x={320} y={352} text={L('red probe · black probe', 'پروب قرمز · پروب مشکی')} size={13} />
      <Label x={320} y={45} text={L('one dial, three superpowers: V · A · Ω', 'یک دستگاه، سه قدرت: V · A · Ω')} size={15} color="#0f766e" />
    </Frame>
  );
}

function WireTipsScene() {
  const rows: { c: string; t: LocaleText }[] = [
    { c: '#dc2626', t: L('red = + path', 'قرمز = مسیر +') },
    { c: '#0f172a', t: L('black = − path', 'مشکی = مسیر −') },
    { c: '#f59e0b', t: L('other colors = signals', 'رنگ‌های دیگر = سیگنال‌ها') },
  ];
  return (
    <Frame>
      {rows.map((r, i) => (
        <g key={i}>
          <path d={`M 100 ${90 + i * 75} H 420`} stroke={r.c} strokeWidth={9} strokeLinecap="round" />
          <Label x={510} y={96 + i * 75} text={r.t} size={16} color="#475569" />
        </g>
      ))}
      <Label x={320} y={330} text={L('short + neat + color-smart = easy to fix', 'کوتاه + مرتب + رنگ‌بندیِ درست = عیب‌یابیِ آسان')} size={16} color="#0f766e" />
    </Frame>
  );
}

function SeriesParallelScene({ mode }: { mode: string }) {
  const series = mode === 'series';
  return (
    <Frame>
      <g transform="translate(120 180)"><PartVisual type="battery" params={{ voltage: 9 }} state={{}} /></g>
      {series ? (
        <>
          <g transform="translate(350 120)"><PartVisual type="led" params={{ color: 'red' }} state={{ brightness: 0.45, running: true }} /></g>
          <g transform="translate(350 240)"><PartVisual type="led" params={{ color: 'red' }} state={{ brightness: 0.45, running: true }} /></g>
          <path d="M 164 180 V 120 H 318 M 382 120 V 165 M 382 195 V 240 H 240 M 204 240 V 180" stroke="#94a3b8" strokeWidth={3.5} fill="none" transform="translate(0 0)" />
          <Label x={520} y={130} text={L('one road', 'یک راه')} size={15} />
          <Label x={520} y={185} text={L('current same everywhere', 'جریان همه‌جا یکسان')} size={15} color="#0f766e" />
          <Label x={520} y={240} text={L('each LED: dimmer', 'هر ال‌ای‌دی: کم‌نورتر')} size={15} color="#b45309" />
        </>
      ) : (
        <>
          <g transform="translate(350 120)"><PartVisual type="led" params={{ color: 'green' }} state={{ brightness: 1, running: true }} /></g>
          <g transform="translate(350 240)"><PartVisual type="led" params={{ color: 'green' }} state={{ brightness: 1, running: true }} /></g>
          <path d="M 164 180 V 120 H 318 M 164 180 V 240 H 318 M 382 120 H 470 V 180 H 164 M 382 240 H 470 V 180" stroke="#94a3b8" strokeWidth={3.5} fill="none" />
          <Label x={520} y={130} text={L('two roads', 'دو راه')} size={15} />
          <Label x={520} y={185} text={L('each gets FULL volts', 'هرکدام ولتاژِ کامل')} size={15} color="#0f766e" />
          <Label x={520} y={240} text={L('both: bright!', 'هر دو: درخشان!')} size={15} color="#15803d" />
        </>
      )}
      <Label x={320} y={340} text={series ? L('SERIES: one after another', 'سری: پشت‌سرِ هم') : L('PARALLEL: side by side', 'موازی: کنار هم')} size={17} color="#334155" />
    </Frame>
  );
}

function VoltageShareScene() {
  return (
    <Frame>
      <g transform="translate(140 180)"><PartVisual type="battery" params={{ voltage: 9 }} state={{ running: true, dischargeCurrent: 0.012 }} /></g>
      <g transform="translate(360 180)"><PartVisual type="resistor" params={{ resistance: 470 }} state={{ voltage: 7.2, current: 0.012, running: true }} /></g>
      <g transform="translate(560 180)"><PartVisual type="led" params={{ color: 'red' }} state={{ brightness: 0.7, voltage: 1.8, running: true }} /></g>
      <Label x={360} y={230} text={L('takes 7.2 V', '۷٫۲ ولت برمی‌دارد')} size={15} color="#b91c1c" />
      <Label x={560} y={230} text={L('takes 1.8 V', '۱٫۸ ولت برمی‌دارد')} size={15} color="#0f766e" />
      <Label x={320} y={310} text={L('7.2 + 1.8 = 9 V — voltage always balances!', '۷٫۲ + ۱٫۸ = ۹ ولت — جمعِ سهم‌ها همیشه می‌شود ولتاژِ باتری!')} size={16} color="#475569" />
      <Label x={320} y={60} text={L('the battery push splits across series parts', 'فشارِ باتری بین قطعه‌های سری تقسیم می‌شود')} size={15} />
    </Frame>
  );
}

function AmmeterInlineScene() {
  return (
    <Frame>
      <g transform="translate(140 180)"><PartVisual type="battery" params={{ voltage: 9 }} state={{ running: true, dischargeCurrent: 0.015 }} /></g>
      <g transform="translate(360 180)"><PartVisual type="resistor" params={{ resistance: 470 }} state={{ running: true }} /></g>
      <g transform="translate(560 180)"><PartVisual type="ammeter" params={{}} state={{ current: 0.015, running: true }} /></g>
      <Label x={320} y={70} text={L('open the loop… insert the ammeter… close it again', 'مسیر را باز کن… آمپرمتر را بگذار… دوباره ببند')} size={15} />
      <Label x={560} y={235} text={L('15 mA', '۱۵ میلی‌آمپر')} size={16} color="#0f766e" />
      <Label x={320} y={310} text={L('the SAME current now flows through the meter — that is the trick!', 'همین جریان از درونِ متر رد می‌شود — این نکتهٔ اصلی است!')} size={15} color="#475569" />
    </Frame>
  );
}

function OhmTriangleScene() {
  return (
    <Frame>
      <path d="M 320 70 L 200 270 H 440 Z" fill="#fef3c7" stroke="#d4a017" strokeWidth={5} />
      <text x={320} y={165} fontSize={64} fontWeight={900} textAnchor="middle" fill="#b45309">V</text>
      <line x1={252} y1={205} x2={388} y2={205} stroke="#b45309" strokeWidth={5} />
      <text x={280} y={255} fontSize={52} fontWeight={900} textAnchor="middle" fill="#b45309">I</text>
      <text x={365} y={255} fontSize={52} fontWeight={900} textAnchor="middle" fill="#b45309">R</text>
      <Label x={320} y={315} text={L('cover what you want:  I = V ÷ R   ·   R = V ÷ I', 'هرکدام را خواستی: I = V ÷ R · R = V ÷ I')} size={16} color="#78350f" />
    </Frame>
  );
}

function BodyguardScene() {
  return (
    <Frame>
      <g transform="translate(320 150) scale(1.9)"><PartVisual type="resistor" params={{ resistance: 470 }} state={{ running: true }} /></g>
      <text x={140} y={160} fontSize={70} textAnchor="middle">🛡️</text>
      <text x={510} y={160} fontSize={60} textAnchor="middle">💡</text>
      <Label x={320} y={250} text={L('R = (V battery − V LED) ÷ I safe', 'R = (ولتاژ باتری − ولتاژ ال‌ای‌دی) ÷ جریانِ امن')} size={17} color="#0f766e" />
      <Label x={320} y={290} text={L('(9 − 1.8) ÷ 0.02 = 360 Ω → choose 470 Ω', '(۹ − ۱٫۸) ÷ ۰٫۰۲ = ۳۶۰ اهم ← ۴۷۰ اهم انتخاب کن')} size={15} color="#475569" />
      <Label x={320} y={60} text={L("the resistor is the LED's bodyguard", 'مقاومت، محافظِ ال‌ای‌دی است')} size={16} />
    </Frame>
  );
}

function DetectiveStepsScene() {
  const steps: { n: number; text: LocaleText }[] = [
    { n: 1, text: L('What SHOULD happen?', 'چه انتظاری داری؟') },
    { n: 2, text: L('Run + observe', 'روشن کن و نگاه کن') },
    { n: 3, text: L('Read diagnostics', 'کارت‌های هشدار را بخوان') },
    { n: 4, text: L('Change ONE thing', 'فقط یکی را عوض کن') },
    { n: 5, text: L('Test again', 'دوباره امتحان کن') },
  ];
  return (
    <Frame bg="#f0fdfa">
      {steps.map((s, i) => (
        <g key={s.n} transform={`translate(90 ${60 + i * 56})`}>
          <circle cx={16} cy={0} r={20} fill={i === 4 ? '#14b8a6' : '#99f6e4'} stroke="#0f766e" strokeWidth={2.5} />
          <text x={16} y={7} fontSize={16} fontWeight={800} textAnchor="middle" fill="#134e4a">{s.n}</text>
          <Label x={250} y={7} text={s.text} size={17} />
        </g>
      ))}
      <text x={520} y={190} fontSize={64} textAnchor="middle">🕵️</text>
    </Frame>
  );
}

function PotDemoScene() {
  return (
    <Frame>
      <g transform="translate(200 160) scale(1.7)"><PartVisual type="potentiometer" params={{ resistance: 10_000 }} state={{ taper: 0.3 }} /></g>
      <g transform="translate(440 160) scale(1.7)"><PartVisual type="potentiometer" params={{ resistance: 10_000 }} state={{ taper: 0.85 }} /></g>
      <Label x={200} y={245} text={L('slider low → less volts out', 'اسلایدر پایین ← ولتاژِ کمتر')} size={14} />
      <Label x={440} y={245} text={L('slider high → more volts out', 'اسلایدر بالا ← ولتاژِ بیشتر')} size={14} />
      <Label x={320} y={310} text={L('the wiper (W) taps a moving point on the resistance', 'بازوی متحرک (W) نقطه‌ای متغیر روی مقاومت را برمی‌دارد')} size={15} color="#475569" />
    </Frame>
  );
}

function BreadboardMapScene() {
  const holes: React.ReactElement[] = [];
  for (let r = 0; r < 5; r++)
    for (let col = 0; col < 12; col++)
      holes.push(<circle key={`t${r}-${col}`} cx={180 + col * 26} cy={110 + r * 22} r={5} fill="#a3a3a3" />);
  for (let r = 0; r < 5; r++)
    for (let col = 0; col < 12; col++)
      holes.push(<circle key={`b${r}-${col}`} cx={180 + col * 26} cy={250 + r * 22} r={5} fill="#a3a3a3" />);
  return (
    <Frame bg="#fffbeb">
      <rect x={150} y={80} width={330} height={220} rx={12} fill="#fefce8" stroke="#a8a29e" strokeWidth={4} />
      {holes}
      {/* highlighted row group */}
      <rect x={168} y={98} width={160} height={70} rx={8} fill="#14b8a6" opacity={0.3} />
      <Label x={248} y={140} text={L('one hidden row', 'یک ردیفِ پنهانِ به‌هم‌وصل')} size={13} color="#134e4a" />
      {/* rails */}
      <rect x={150} y={62} width={330} height={12} rx={6} fill="#ef4444" opacity={0.65} />
      <rect x={150} y={306} width={330} height={12} rx={6} fill="#334155" opacity={0.65} />
      <Label x={320} y={45} text={L('+ rail (red)', 'خطِ + (قرمز)')} size={13} color="#b91c1c" />
      <Label x={320} y={343} text={L('− rail (black)', 'خطِ − (مشکی)')} size={13} />
      <Label x={560} y={195} text={L('plug in →', 'قطعه‌ها را فرو کن ←')} size={15} />
      <Label x={320} y={330} text={L(' ', ' ')} size={10} />
    </Frame>
  );
}

// ------------------------------------------------------- interactive: robot lesson l0-1

/** a smiling, hand-holding electron — the tiny worker of lesson 1 */
const CuteElectronFace = ({ r = 13 }: { r?: number }) => (
  <g>
    <circle r={r} fill="#0ea5e9" stroke="#075985" strokeWidth={2} />
    {/* minus badge on the head — it is an electron after all! */}
    <line x1={-r * 0.3} y1={-r * 0.95} x2={r * 0.3} y2={-r * 0.95} stroke="#e0f2fe" strokeWidth={2.4} strokeLinecap="round" />
    <circle cx={-r * 0.35} cy={-r * 0.22} r={r * 0.2} fill="#fff" />
    <circle cx={r * 0.35} cy={-r * 0.22} r={r * 0.2} fill="#fff" />
    <circle cx={-r * 0.35} cy={-r * 0.22} r={r * 0.09} fill="#0c4a6e" />
    <circle cx={r * 0.35} cy={-r * 0.22} r={r * 0.09} fill="#0c4a6e" />
    <circle cx={-r * 0.6} cy={r * 0.15} r={r * 0.13} fill="#bae6fd" />
    <circle cx={r * 0.6} cy={r * 0.15} r={r * 0.13} fill="#bae6fd" />
    <path d={`M ${-r * 0.32} ${r * 0.28} Q 0 ${r * 0.62} ${r * 0.32} ${r * 0.28}`} stroke="#fff" strokeWidth={r * 0.14} fill="none" strokeLinecap="round" />
  </g>
);

/** slide 2 — smiling electrons inside a transparent wire; tap to make them run */
function ElectronWireScene() {
  const [running, setRunning] = useState(false);
  const { lang } = useI18n();
  const idleXs = [124, 181, 238, 295, 352, 409, 466, 523];
  const n = 8;
  const dur = 2.8;
  const toggle = () => {
    setRunning((r) => !r);
    if (running) sfx.pop();
    else sfx.whoosh();
  };
  return (
    <Frame bg="#f0f9ff">
      <Tag x={320} y={40} color="#0284c7" text={L('the tiny workers: electrons! 🔵', 'کارگرهای ریزه: الکترون‌ها! 🔵')} />

      {/* the transparent wire */}
      <rect x={78} y={138} width={484} height={64} rx={32} fill="#e0f2fe" opacity={0.6} stroke="#7dd3fc" strokeWidth={3} />
      <rect x={92} y={152} width={456} height={36} rx={18} fill="url(#ew-copper)" opacity={0.92} />
      <path d="M 104 150 q 70 -9 140 -6" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.65} fill="none" />
      {/* end terminals */}
      <circle cx={78} cy={170} r={11} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />
      <circle cx={562} cy={170} r={11} fill="#94a3b8" stroke="#64748b" strokeWidth={2} />

      {/* the electrons */}
      {running ? (
        <g>
          {Array.from({ length: n }).map((_, i) => (
            <g key={`run-${i}`}>
              <animateMotion dur={`${dur}s`} begin={`${-(i / n) * dur}s`} repeatCount="indefinite" path="M 100 170 H 540" />
              <CuteElectronFace />
            </g>
          ))}
        </g>
      ) : (
        <g>
          {idleXs.map((x, i) => (
            <g key={`idle-${i}`} transform={`translate(${x} 170)`}>
              <g>
                <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur={`${1.4 + i * 0.12}s`} repeatCount="indefinite" />
                <CuteElectronFace />
              </g>
            </g>
          ))}
        </g>
      )}

      {/* tap target over the wire */}
      <rect x={78} y={128} width={484} height={84} fill="transparent" onClick={toggle} style={{ cursor: 'pointer' }} />

      {running && (
        <Label x={320} y={252} size={15} color="#0369a1" text={L('they hold hands and run together = electric current! ⚡', 'دست همدیگه رو می‌گیرند و تندتند میدوند = جریان برق! ⚡')} />
      )}

      {/* pill button */}
      <g onClick={toggle} style={{ cursor: 'pointer' }} role="button">
        <rect x={140} y={286} width={360} height={44} rx={22} fill={running ? '#0d9488' : '#f59e0b'} />
        <text x={320} y={313} textAnchor="middle" fontSize={14.5} fontWeight={700} fill="#fff">
          {txText(running ? L('stop the little workers! ✋', 'کارگرهای ریزه رو نگه دار! ✋') : L('tap the wire to see the electrons run! 👆', 'بزن روی سیم تا حرکت الکترون‌ها رو ببینی! 👆'), lang)}
        </text>
      </g>

      <defs>
        <linearGradient id="ew-copper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7b06b" />
          <stop offset="1" stopColor="#c96a2b" />
        </linearGradient>
      </defs>
    </Frame>
  );
}

/** slide 3 — the magic round road (circuit): connect the bridge, light the lamp */
function CircuitRoadScene() {
  const motion = useSettings((s) => s.motion);
  const { lang } = useI18n();
  const [connected, setConnected] = useState(false);
  // ⚠️ sweep flag MUST be 0 here: with `A 215 112 0 1 1` the ellipse center
  // resolves to (320, −25.5) — above the canvas — so the electrons ran
  // off-screen instead of around the road. With `1 0` the center is
  // (320, 185.1), the exact ellipse of the drawn road, and the closing Z
  // line runs along the bridge. Verified with the SVG arc-to-center formula.
  const loop = 'M 246.5 79.8 A 215 112 0 1 0 393.5 79.8 Z';
  const toggle = () => {
    const next = !connected;
    setConnected(next);
    sfx.click();
    if (next) window.setTimeout(() => sfx.sparkle(), 380);
  };
  return (
    <Frame bg="#f7fee7">
      <Tag x={320} y={36} color="#16a34a" text={connected ? L('circuit complete — the electrons run around! ⚡', 'مدار کامل شد؛ الکترون‌ها دور مدار میدوند! ⚡') : L('the magic road: the circuit 🛣️', 'جادهٔ جادویی: مدار 🛣️')} />

      {/* lawn */}
      <ellipse cx={320} cy={190} rx={248} ry={142} fill="#ecfdf5" />
      <circle cx={80} cy={70} r={13} fill="#bbf7d0" />
      <circle cx={560} cy={70} r={13} fill="#bbf7d0" />

      {/* the round road with a gap at the top */}
      <path d="M 393.5 79.8 A 215 112 0 1 1 246.5 79.8" fill="none" stroke="#22c55e" strokeWidth={26} strokeLinecap="round" />
      <path d="M 393.5 79.8 A 215 112 0 1 1 246.5 79.8" fill="none" stroke="#ffffff" strokeWidth={3} strokeDasharray="16 13" opacity={0.85} />

      {/* bridge posts */}
      <circle cx={246.5} cy={79.8} r={9} fill="#16a34a" stroke="#15803d" strokeWidth={2} />
      <circle cx={393.5} cy={79.8} r={9} fill="#16a34a" stroke="#15803d" strokeWidth={2} />

      {/* the bridge piece — drops into the gap when connected */}
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform: connected ? 'translateY(0px) rotate(0deg)' : 'translateY(-44px) rotate(-10deg)',
          transition: motion ? 'transform 0.55s ease' : 'none',
          opacity: connected ? 1 : 0.9,
        }}
      >
        <rect x={243} y={68} width={154} height={24} rx={12} fill="#16a34a" stroke="#15803d" strokeWidth={2} />
        <line x1={258} y1={80} x2={382} y2={80} stroke="#fff" strokeWidth={3} strokeDasharray="12 10" opacity={0.85} />
      </g>

      {/* battery — the energy station, standing on the road (left) */}
      <g transform="translate(105 185) rotate(90)">
        <PartVisual type="battery" params={{ voltage: 3 }} state={{}} />
      </g>

      {/* LED — the light hero (right) */}
      {connected && (
        <circle cx={533} cy={185} r={30} fill="#fde047" opacity={0.4}>
          <animate attributeName="r" values="26;40;26" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0.15;0.45" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      <g transform="translate(533 185)">
        <PartVisual type="led" params={{ color: 'red' }} state={connected ? { brightness: 1, running: true } : {}} />
      </g>

      {/* electrons */}
      {connected ? (
        <g>
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={`cr-run-${i}`}>
              <animateMotion dur="4.6s" begin={`${-(i / 6) * 4.6}s`} repeatCount="indefinite" path={loop} />
              <CuteElectronFace r={9.5} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <g transform="translate(246.5 58)">
            <CuteElectronFace r={9.5} />
            <text x={16} y={-10} fontSize={15} fontWeight={700} fill="#0369a1">؟</text>
          </g>
          <g transform="translate(393.5 58)">
            <CuteElectronFace r={9.5} />
            <text x={-16} y={-10} fontSize={15} fontWeight={700} fill="#0369a1">؟</text>
          </g>
        </g>
      )}

      <Label
        x={320}
        y={250}
        size={14.5}
        color={connected ? '#0f766e' : '#475569'}
        text={connected
          ? L('the electrons pass through the lamp → it shines! 💡', 'الکترون‌ها از چراغ رد میشن → چراغ می‌درخشه! 💡')
          : L('the round closed road — just like a toy-car track! 🏎️', 'جادهٔ گرد و بسته — درست مثل پیست ماشین‌بازی! 🏎️')}
      />

      {/* pill button */}
      <g onClick={toggle} style={{ cursor: 'pointer' }} role="button">
        <rect x={110} y={286} width={420} height={44} rx={22} fill={connected ? '#dc2626' : '#16a34a'} />
        <text x={320} y={313} textAnchor="middle" fontSize={14.5} fontWeight={700} fill="#fff">
          {txText(connected ? L('break the road again! ✋', 'جاده رو دوباره قطع کن! ✋') : L('connect the bridge to light the lamp! 💡', 'پل جاده رو وصل کن تا ببینی چطور چراغ روشن میشه! 💡'), lang)}
        </text>
      </g>
    </Frame>
  );
}

/** slide 4 — the five circuit heroes; tap each to hear its sound and see its job */
function HeroTeamScene() {
  const [active, setActive] = useState<string | null>(null);
  const { lang } = useI18n();
  const heroes = [
    { id: 'battery', name: L('battery 🔋', 'باتری 🔋'), say: L('I give the electrons energy so they can run! ⚡', 'من به الکترون‌ها انرژی میدم تا بتونند بدوند! ⚡') },
    { id: 'wire', name: L('wire 🔌', 'سیم 🔌'), say: L('I am the road the electrons run on! 🛣️', 'من جاده‌ام؛ الکترون‌ها روی من میدوند! 🛣️') },
    { id: 'switch', name: L('switch 🔴', 'کلید 🔴'), say: L('I open and close the road, like an officer! 👮', 'من مثل پلیس راهنما جاده رو باز و بسته می‌کنم! 👮') },
    { id: 'led', name: L('LED lamp 💡', 'لامپ LED 💡'), say: L('I turn the electrons\u2019 energy into beautiful light! ✨', 'انرژی الکترون‌ها رو به نور قشنگ تبدیل می‌کنم! ✨') },
    { id: 'motor', name: L('motor ⚙️', 'موتور ⚙️'), say: L('I spin the wheels and the fan! 🌀', 'چرخ‌ها و پنکه رو می‌چرخونم! 🌀') },
  ];
  const heroSound: Record<string, () => void> = {
    battery: sfx.powerup,
    wire: sfx.whoosh,
    switch: sfx.click,
    led: sfx.sparkle,
    motor: sfx.whirr,
  };
  const tap = (id: string) => {
    setActive(id);
    heroSound[id]?.();
  };
  const cx = (i: number) => 320 + (i - 2) * 124;
  const activeHero = heroes.find((h) => h.id === active);

  return (
    <Frame bg="#fefce8">
      <Tag x={320} y={36} color="#d97706" text={L('the amazing team of the circuit! 🦸', 'تیم شگفت‌انگیز مدار! 🦸')} />

      {heroes.map((h, i) => (
        <g key={h.id} transform={`translate(${cx(i)} 0)`} onClick={() => tap(h.id)} style={{ cursor: 'pointer' }} role="button" aria-label={txText(h.name, lang)}>
          {/* card */}
          <rect x={-56} y={62} width={112} height={182} rx={18} fill="#fff" stroke={active === h.id ? '#0d9488' : '#e2e8f0'} strokeWidth={3} />
          <g transform="translate(0 132)">
            <g>
              {active === h.id && (
                <animateTransform attributeName="transform" type="scale" values="1;1.09;1" dur="0.5s" repeatCount="2" />
              )}
              {h.id === 'battery' && <BatteryHero active={active === h.id} />}
              {h.id === 'wire' && <WireHero active={active === h.id} />}
              {h.id === 'switch' && <SwitchHero active={active === h.id} />}
              {h.id === 'led' && <LedHero active={active === h.id} />}
              {h.id === 'motor' && <MotorHero active={active === h.id} />}
            </g>
          </g>
          <Label x={0} y={214} size={14} text={h.name} />
          {active === h.id && <circle cx={0} cy={228} r={5} fill="#14b8a6"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" /></circle>}
        </g>
      ))}

      {/* speech card */}
      <rect x={54} y={262} width={532} height={56} rx={16} fill="#f0fdfa" stroke="#99f6e4" strokeWidth={2.5} />
      <Label
        x={320}
        y={295}
        size={14.5}
        color="#0f766e"
        text={activeHero
          ? activeHero.say
          : L('tap each hero to hear its sound and see its job! 👆', 'روی هر قهرمان بزن تا صدای خودشو بشنوی و کارشو ببینی! 👆')}
      />
    </Frame>
  );
}

/** cute battery hero with a face */
function BatteryHero({ active }: { active: boolean }) {
  return (
    <g>
      {active && (
        <circle r={40} fill="none" stroke="#14b8a6" strokeWidth={3}>
          <animate attributeName="r" values="34;50" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
      <rect x={-12} y={-30} width={24} height={9} rx={3} fill="#0f766e" />
      <rect x={-34} y={-21} width={68} height={46} rx={10} fill="#14b8a6" stroke="#0f766e" strokeWidth={2.5} />
      <rect x={34} y={-9} width={9} height={20} rx={3} fill="#0f766e" />
      <path d="M -6 -14 L 3 -14 L -2 -5 L 6 -5 L -8 12 L -3 0 L -10 0 Z" fill="#fbbf24" stroke="#d97706" strokeWidth={1.2} transform="translate(-16 -2) scale(0.8)" />
      <Face />
    </g>
  );
}

/** cute wire hero with a face badge */
function WireHero({ active }: { active: boolean }) {
  const wave = 'M -44 14 C -24 -26 -4 34 16 -6 C 24 -22 34 -24 44 -14';
  return (
    <g>
      <path d={wave} fill="none" stroke="#f59e0b" strokeWidth={9} strokeLinecap="round" />
      <path d={wave} fill="none" stroke="#fcd34d" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      {active && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <animateMotion dur="1.5s" begin={`${-(i / 3) * 1.5}s`} repeatCount="indefinite" path={wave} />
              <circle r={4.5} fill="#0ea5e9" stroke="#075985" strokeWidth={1.2} />
            </g>
          ))}
        </g>
      )}
      <circle cx={0} cy={4} r={15} fill="#fff" stroke="#f59e0b" strokeWidth={2.5} />
      <Face s={0.9} />
    </g>
  );
}

/** cute switch hero — the lever flips when tapped */
function SwitchHero({ active }: { active: boolean }) {
  return (
    <g>
      <rect x={-42} y={-6} width={84} height={18} rx={9} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={2.5} />
      <circle cx={-30} cy={3} r={6} fill="#64748b" />
      <circle cx={30} cy={3} r={6} fill="#64748b" />
      <g transform="translate(-30 3)">
        <g>
          <line x1={0} y1={0} x2={52} y2={0} stroke="#dc2626" strokeWidth={6.5} strokeLinecap="round" />
          <circle cx={52} cy={0} r={9} fill="#fff" stroke="#dc2626" strokeWidth={2.5} />
          <g transform="translate(52 0)"><Face s={0.62} /></g>
        </g>
        {active && <animateTransform attributeName="transform" type="rotate" values="0;-55;0" dur="0.7s" repeatCount="indefinite" additive="sum" />}
      </g>
    </g>
  );
}

/** cute LED hero — glows when tapped */
function LedHero({ active }: { active: boolean }) {
  return (
    <g>
      {active && (
        <g>
          <circle r={26} fill="#fde047" opacity={0.45}>
            <animate attributeName="r" values="22;34;22" dur="1.1s" repeatCount="indefinite" />
          </circle>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line
              key={a}
              x1={26 * Math.cos((a * Math.PI) / 180)}
              y1={26 * Math.sin((a * Math.PI) / 180)}
              x2={33 * Math.cos((a * Math.PI) / 180)}
              y2={33 * Math.sin((a * Math.PI) / 180)}
              stroke="#f59e0b"
              strokeWidth={3}
              strokeLinecap="round"
            >
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.1s" repeatCount="indefinite" />
            </line>
          ))}
        </g>
      )}
      <circle cx={0} cy={-4} r={18} fill={active ? '#fde047' : '#fecaca'} stroke="#ef4444" strokeWidth={2.5} />
      <rect x={-10} y={12} width={20} height={13} rx={3} fill="#94a3b8" stroke="#64748b" strokeWidth={1.5} />
      <line x1={-5} y1={14} x2={-5} y2={24} stroke="#64748b" strokeWidth={1.5} />
      <line x1={5} y1={14} x2={5} y2={24} stroke="#64748b" strokeWidth={1.5} />
      <Face s={0.85} />
    </g>
  );
}

/** cute motor hero — the blades spin when tapped */
function MotorHero({ active }: { active: boolean }) {
  return (
    <g>
      <circle r={24} fill="#c7d2fe" stroke="#4338ca" strokeWidth={2.5} />
      <g>
        {active && <animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.8s" repeatCount="indefinite" />}
        {[0, 120, 240].map((a) => (
          <line
            key={a}
            x1={10 * Math.cos((a * Math.PI) / 180)}
            y1={10 * Math.sin((a * Math.PI) / 180)}
            x2={21 * Math.cos((a * Math.PI) / 180)}
            y2={21 * Math.sin((a * Math.PI) / 180)}
            stroke="#4338ca"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle r={13} fill="#fff" stroke="#4338ca" strokeWidth={2.2} />
      <Face s={0.8} />
      <ellipse cx={-12} cy={27} rx={7} ry={4} fill="#4338ca" />
      <ellipse cx={12} cy={27} rx={7} ry={4} fill="#4338ca" />
    </g>
  );
}

/** the shared cute face (eyes + smile + cheeks) */
const Face = ({ s = 1 }: { s?: number }) => (
  <g>
    <circle cx={-4.5 * s} cy={-2.5 * s} r={2.3 * s} fill="#334155" />
    <circle cx={4.5 * s} cy={-2.5 * s} r={2.3 * s} fill="#334155" />
    <circle cx={-6.5 * s} cy={2 * s} r={1.7 * s} fill="#fda4af" opacity={0.8} />
    <circle cx={6.5 * s} cy={2 * s} r={1.7 * s} fill="#fda4af" opacity={0.8} />
    <path d={`M ${-4 * s} ${3.5 * s} Q 0 ${7.5 * s} ${4 * s} ${3.5 * s}`} stroke="#334155" strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
  </g>
);

// ------------------------------------------- interactive: lesson l0-1 finale

/** 5-point star polygon points (for the medal) */
const starPoints = (cx: number, cy: number, R: number, r: number) =>
  Array.from({ length: 10 })
    .map((_, i) => {
      const ang = (Math.PI / 5) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? R : r;
      return `${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`;
    })
    .join(' ');

/** twinkling 4-point sparkle */
const Sparkle = ({ x, y, s = 1, d = 1.6, b = 0 }: { x: number; y: number; s?: number; d?: number; b?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -8 L 2.2 -2.2 L 8 0 L 2.2 2.2 L 0 8 L -2.2 2.2 L -8 0 L -2.2 -2.2 Z" fill="#fbbf24">
      <animate attributeName="opacity" values="0.15;1;0.15" dur={`${d}s`} begin={`${b}s`} repeatCount="indefinite" />
    </path>
  </g>
);

/** slide 5 — YOU are the commander: tap a button to command the electrons
 *  (run slow / run fast / make the lamp blink) — electronics in one picture */
function CommandCenterScene() {
  const { lang } = useI18n();
  const [mode, setMode] = useState<'slow' | 'fast' | 'blink' | null>(null);
  const dur = mode === 'slow' ? 7 : mode === 'fast' ? 2.4 : 4.2;
  // full closed ellipse (center 320,180) — a tiny version of the circuit road
  const road = 'M 150 180 A 170 92 0 1 1 490 180 A 170 92 0 1 1 150 180';
  const idle = [30, 90, 150, 210, 270, 330].map((a) => ({
    x: 320 + 170 * Math.cos((a * Math.PI) / 180),
    y: 180 + 92 * Math.sin((a * Math.PI) / 180),
  }));
  const commands: { id: 'slow' | 'fast' | 'blink'; label: LocaleText; fill: string; sound: () => void }[] = [
    { id: 'slow', label: L('🐢 run slow', '🐢 آروم بدوید'), fill: '#0284c7', sound: sfx.blip },
    { id: 'fast', label: L('🏃 run fast', '🏃 تندتند بدوید'), fill: '#d97706', sound: sfx.whoosh },
    { id: 'blink', label: L('💡 blink!', '💡 چشمک بزن!'), fill: '#c026d3', sound: sfx.sparkle },
  ];
  const commandText =
    mode === null
      ? L('you are the commander — tap a button to give a command! 🎖️', 'تو فرمانده‌ای! روی دکمه‌ها بزن تا فرمان بدهی! 🎖️')
      : mode === 'slow'
        ? L('command received: run slow and steady! 🐢', 'فرمان اجرا شد: آروم و پیوسته بدوید! 🐢')
        : mode === 'fast'
          ? L('command received: run super fast! ⚡', 'فرمان اجرا شد: تندتند بدوید! ⚡')
          : L('command received: make the lamp blink! 💡', 'فرمان اجرا شد: چراغ چشمک بزنه! 💡');
  return (
    <Frame bg="#f5f3ff">
      <Tag x={320} y={36} color="#7c3aed" text={L('electronics = commanding the electrons! 🎖️', 'الکترونیک یعنی فرمان دادن به الکترون‌ها! 🎖️')} />

      {/* the round road */}
      <path d={road} fill="none" stroke="#22c55e" strokeWidth={22} strokeLinecap="round" />
      <path d={road} fill="none" stroke="#ffffff" strokeWidth={3} strokeDasharray="14 12" opacity={0.85} />

      {/* battery — pushes on command */}
      {mode && (
        <circle cx={150} cy={180} r={20} fill="none" stroke="#14b8a6" strokeWidth={2.5}>
          <animate attributeName="r" values="18;30" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
      <g transform="translate(150 180) rotate(90)">
        <PartVisual type="battery" params={{ voltage: 3 }} state={{}} />
      </g>

      {/* LED — glows (or blinks) on command */}
      <g>
        {mode === 'blink' && <animate attributeName="opacity" values="1;0.05;1" dur="0.8s" repeatCount="indefinite" />}
        {mode && (
          <circle cx={490} cy={180} r={30} fill="#fde047" opacity={0.4}>
            <animate attributeName="r" values="26;40;26" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0.15;0.45" dur="1.6s" repeatCount="indefinite" />
          </circle>
        )}
        <g transform="translate(490 180)">
          <PartVisual type="led" params={{ color: 'red' }} state={mode ? { brightness: 1, running: true } : {}} />
        </g>
      </g>

      {/* the electrons: waiting for orders, then running at the commanded speed */}
      {mode ? (
        <g key={`run-${mode}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <animateMotion dur={`${dur}s`} begin={`${-(i / 6) * dur}s`} repeatCount="indefinite" path={road} />
              <CuteElectronFace r={9.5} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          {idle.map((p, i) => (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
              <g>
                <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur={`${1.4 + i * 0.12}s`} repeatCount="indefinite" />
                <CuteElectronFace r={9.5} />
              </g>
            </g>
          ))}
        </g>
      )}

      <Label x={320} y={250} size={14.5} color="#5b21b6" text={commandText} />

      {/* command panel */}
      {commands.map((cmd, i) => (
        <g
          key={cmd.id}
          onClick={() => {
            setMode(cmd.id);
            cmd.sound();
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label={txText(cmd.label, lang)}
        >
          <rect
            x={170 + i * 150 - 70}
            y={288}
            width={140}
            height={44}
            rx={22}
            fill={mode === cmd.id ? cmd.fill : '#ffffff'}
            stroke={mode === cmd.id ? cmd.fill : '#e2e8f0'}
            strokeWidth={3}
          />
          <text x={170 + i * 150} y={316} textAnchor="middle" fontSize={14.5} fontWeight={700} fill={mode === cmd.id ? '#fff' : '#475569'}>
            {txText(cmd.label, lang)}
          </text>
        </g>
      ))}
    </Frame>
  );
}

/** lesson l0-1 reward — the medal ceremony: confetti, a big gold medal and
 *  cheering electrons celebrate the finished lesson */
function MedalPartyScene() {
  const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc', '#f472b6'];
  const confetti = Array.from({ length: 14 }).map((_, i) => ({
    x: 42 + ((i * 97) % 556),
    d: 3 + ((i * 7) % 18) / 10,
    b: -((i * 13) % 40) / 10,
    c: colors[i % colors.length],
  }));
  return (
    <Frame bg="#fffbeb">
      <Tag x={320} y={36} color="#f59e0b" text={L('medal ceremony! 🏅🎉', 'مراسم اهدای مدال! 🏅🎉')} />

      {/* falling confetti */}
      {confetti.map((p, i) => (
        <g key={i} transform={`translate(${p.x} 0)`}>
          <g>
            <animateMotion dur={`${p.d}s`} begin={`${p.b}s`} repeatCount="indefinite" path="M 0 -16 q 16 100 0 200 q -16 110 0 220" />
            {i % 3 === 0 ? (
              <circle r={4} fill={p.c} opacity={0.9} />
            ) : (
              <rect x={-4} y={-6} width={8} height={12} rx={2} fill={p.c} opacity={0.9} />
            )}
          </g>
        </g>
      ))}

      {/* glow behind the medal */}
      <circle cx={320} cy={176} r={62} fill="#fde68a" opacity={0.35}>
        <animate attributeName="r" values="58;74;58" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0.2;0.45" dur="2.2s" repeatCount="indefinite" />
      </circle>

      {/* ribbon straps (behind the disc) */}
      <polygon points="298,54 322,140 294,148 274,72" fill="#dc2626" />
      <polygon points="342,54 318,140 346,148 366,72" fill="#2563eb" />

      {/* the big gold medal */}
      <circle cx={320} cy={176} r={50} fill="url(#mp-gold)" stroke="#b45309" strokeWidth={3} />
      <circle cx={320} cy={176} r={38} fill="none" stroke="#fef3c7" strokeWidth={2.5} opacity={0.9} />
      <polygon points={starPoints(320, 176, 24, 10.5)} fill="#fff7ed" stroke="#d97706" strokeWidth={1.5} />

      {/* twinkling sparkles */}
      <Sparkle x={168} y={104} s={1.1} d={1.5} />
      <Sparkle x={472} y={104} s={0.9} d={1.8} b={0.4} />
      <Sparkle x={150} y={218} s={0.8} d={2} b={0.9} />
      <Sparkle x={492} y={218} s={1.2} d={1.6} b={0.2} />

      {/* cheering electrons */}
      {[230, 320, 410].map((x, i) => (
        <g key={x} transform={`translate(${x} 268)`}>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -16;0 0" dur={`${0.85 + i * 0.15}s`} repeatCount="indefinite" />
            <CuteElectronFace r={11} />
          </g>
        </g>
      ))}

      <Label x={320} y={326} size={15} color="#b45309" text={L('the electrons are dancing in your honor! 💙✨', 'الکترون‌ها هم به افتخارِ تو می‌رقصند! 💙✨')} />

      <defs>
        <linearGradient id="mp-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </Frame>
  );
}

// ----------------------------------------------------------------- registry

export function Scene({ spec, animated = true }: { spec: SceneSpec; animated?: boolean }) {
  const kind = spec.kind;
  const p = spec.props ?? {};
  if (!animated) {
    // reduced motion: scenes render but their <animate> elements are stripped by CSS below
  }
  switch (kind) {
    case 'switch-door': return <SwitchDoorScene />;
    case 'led-anatomy': return <LedAnatomyScene />;
    case 'color-code': return <ColorCodeScene />;
    case 'button-press': return <ButtonPressScene />;
    case 'battery-stack': return <BatteryStackScene />;
    case 'multimeter-face': return <MultimeterFaceScene />;
    case 'wire-tips': return <WireTipsScene />;
    case 'series-parallel': return <SeriesParallelScene mode={String(p.mode ?? 'series')} />;
    case 'voltage-share': return <VoltageShareScene />;
    case 'ammeter-inline': return <AmmeterInlineScene />;
    case 'ohm-triangle': return <OhmTriangleScene />;
    case 'bodyguard': return <BodyguardScene />;
    case 'detective-steps': return <DetectiveStepsScene />;
    case 'pot-demo': return <PotDemoScene />;
    case 'breadboard-map': return <BreadboardMapScene />;
    case 'electron-wire': return <ElectronWireScene />;
    case 'circuit-road': return <CircuitRoadScene />;
    case 'hero-team': return <HeroTeamScene />;
    case 'command-center': return <CommandCenterScene />;
    case 'medal-party': return <MedalPartyScene />;
    // interactive story scenes (AI illustration + hands-on action) — see story-scenes.tsx
    case 'room-wake': return <RoomWakeScene image={String(p.image ?? '')} />;
    case 'electron-race': return <ElectronRaceScene image={String(p.image ?? '')} />;
    case 'power-journey': return <PowerJourneyScene image={String(p.image ?? '')} />;
    case 'safe-danger': return <SafeDangerScene image={String(p.image ?? '')} />;
    case 'celebration': return <CelebrationScene image={String(p.image ?? '')} />;
    // l0-3 «قوانین ایمنی مهندس کوچولو» — safety-rule story scenes
    case 'shield-unlock': return <ShieldUnlockScene image={String(p.image ?? '')} />;
    case 'battery-socket': return <BatterySocketScene image={String(p.image ?? '')} />;
    case 'short-circuit': return <ShortCircuitScene image={String(p.image ?? '')} />;
    case 'tidy-desk': return <TidyDeskScene image={String(p.image ?? '')} />;
    // l0-4 «مدار چیست؟ (جاده جادویی و حلقه بسته)» — circuit story scenes
    case 'race-start': return <RaceStartScene image={String(p.image ?? '')} />;
    case 'trace-circuit': return <TraceCircuitScene image={String(p.image ?? '')} />;
    case 'fix-circuit': return <FixCircuitScene image={String(p.image ?? '')} />;
    case 'circuit-stations': return <CircuitStationsScene image={String(p.image ?? '')} />;
    // l0-5 «مدار باز و مدار بسته (پل جاده)» — drawbridge story scenes
    case 'bridge-move': return <BridgeMoveScene image={String(p.image ?? '')} />;
    case 'bridge-cross': return <BridgeCrossScene image={String(p.image ?? '')} />;
    case 'bridge-open': return <BridgeOpenScene image={String(p.image ?? '')} />;
    case 'bridge-switch': return <BridgeSwitchScene image={String(p.image ?? '')} />;
    // l0-6 «رسانا و عایق (کدام وسایل برق را رد می‌کنند؟)» — image-free animated stages
    case 'conductor-insulator': return <ConductorInsulatorScene />;
    case 'copper-slide': return <CopperSlideScene />;
    case 'plastic-raincoat': return <PlasticRaincoatScene />;
    case 'material-lab': return <MaterialLabScene />;

    case 'narrow-road': return <NarrowRoadScene image={String(p.image ?? '')} />;
    case 'pinch-pipe': return <PinchPipeScene image={String(p.image ?? '')} />;
    case 'led-bodyguard': return <LedBodyguardScene image={String(p.image ?? '')} />;
    case 'color-bands': return <ColorBandsScene image={String(p.image ?? '')} />;
    case 'race-finish': return <RaceFinishScene image={String(p.image ?? '')} />;
    case 'river-brook': return <RiverBrookScene image={String(p.image ?? '')} />;
    case 'ampere-detective': return <AmpereDetectiveScene image={String(p.image ?? '')} />;
    case 'voltage-current-team': return <VoltageCurrentTeamScene image={String(p.image ?? '')} />;
    case 'voltage-hero': return <VoltageHeroScene image={String(p.image ?? '')} />;
    case 'water-pressure': return <WaterPressureScene image={String(p.image ?? '')} />;
    case 'battery-duo': return <BatteryDuoScene image={String(p.image ?? '')} />;
    case 'happy-led': return <HappyLedScene image={String(p.image ?? '')} />;
    // l0-10 «باتری چیست؟ (ایستگاه انرژی)» — battery story scenes
    case 'battery-backpack': return <BatteryBackpackScene image={String(p.image ?? '')} />;
    case 'battery-factory': return <BatteryFactoryScene image={String(p.image ?? '')} />;
    case 'battery-terminals': return <BatteryTerminalsScene image={String(p.image ?? '')} />;
    case 'battery-family': return <BatteryFamilyScene image={String(p.image ?? '')} />;
    // l0-11 «سیم چیست؟ (بزرگراه الکترون‌ها)» — wire story scenes
    case 'wire-highway': return <WireHighwayScene image={String(p.image ?? '')} />;
    case 'copper-heart': return <CopperHeartScene image={String(p.image ?? '')} />;
    case 'safety-jacket': return <SafetyJacketScene image={String(p.image ?? '')} />;
    case 'clip-jumper': return <ClipJumperScene image={String(p.image ?? '')} />;
    case 'led-hero': return <LedHeroScene image={String(p.image ?? '')} />;
    case 'led-legs': return <LedLegsScene image={String(p.image ?? '')} />;
    case 'led-rainbow': return <LedRainbowScene image={String(p.image ?? '')} />;
    case 'led-resistor': return <LedResistorScene image={String(p.image ?? '')} />;
    // l0-13 «کلید چیست؟ (پلیس راهنما)» — switch story scenes
    case 'switch-police': return <SwitchPoliceScene image={String(p.image ?? '')} />;
    case 'switch-bridge': return <SwitchBridgeScene image={String(p.image ?? '')} />;
    case 'switch-family': return <SwitchFamilyScene image={String(p.image ?? '')} />;
    case 'switch-position': return <SwitchPositionScene image={String(p.image ?? '')} />;
    // l0-14 «نقشه و نمادهای مدار» — the engineers' secret-language story scenes
    case 'treasure-map': return <TreasureMapScene image={String(p.image ?? '')} />;
    case 'battery-wire-symbol': return <BatteryWireSymbolScene image={String(p.image ?? '')} />;
    case 'switch-led-symbol': return <SwitchLedSymbolScene image={String(p.image ?? '')} />;
    case 'map-trace': return <MapTraceScene image={String(p.image ?? '')} />;
    default:
      return (
        <Frame>
          <Label x={320} y={180} text={`scene: ${kind}`} color="#94a3b8" />
        </Frame>
      );
  }
}

