'use client';

/**
 * Discovery experience — first screen of lesson l0-1 ("الکترونیک چیست؟").
 * The child sees 5 familiar gadgets (realistic photos from the user's
 * reference pages), taps one, and an illustrated device page opens:
 * full / inside / exploded views side by side + photo part cards,
 * the app mascot as the guide, and the discovery-mission progress.
 * (Task 16 — modeled after the user's 5 reference images; the old
 * cartoon exploded view and the 3D scene were replaced by this page.)
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { Mascot } from '@/components/mascot/Mascot';
import { sfx } from '@/lib/sfx';
import { DeviceImageContainer, IMG_RATIO } from './DeviceImageContainer';
import { DEVICE_PAGES, type DevicePageDef, type DevicePageId } from './device-pages-data';

const MISSION_XP = 50;

// ---------------------------------------------------------------- pcb trace

/** kid-friendly PCB trace strip under the device row (pads align with a 5-col grid) */
function PcbTrace({ found, anim }: { found: boolean[]; anim: boolean }) {
  const { lang } = useI18n();
  const PAD_X = [64, 192, 320, 448, 576];
  return (
    <svg viewBox="0 0 640 88" className="w-full -mt-1" aria-hidden="true">
      <defs>
        <path id="cq-spine" d="M 12 62 H 628" />
      </defs>
      {/* main trace */}
      <path d="M 12 62 H 628" stroke="#99f6e4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 12 62 H 628" stroke="#2dd4bf" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85" />
      {/* decorative bends + chip + resistor silhouettes */}
      <path d="M 106 62 l 14 -12 h 26" fill="none" stroke="#5eead4" strokeWidth="5" strokeLinecap="round" />
      <path d="M 534 62 l -14 -12 h -26" fill="none" stroke="#5eead4" strokeWidth="5" strokeLinecap="round" />
      <rect x="246" y="54" width="26" height="15" rx="3" fill="#64748b" opacity="0.85" />
      <rect x="240" y="57" width="5" height="9" rx="1.5" fill="#94a3b8" />
      <rect x="273" y="57" width="5" height="9" rx="1.5" fill="#94a3b8" />
      <rect x="366" y="55" width="20" height="12" rx="6" fill="#fbbf24" opacity="0.9" />
      <rect x="361" y="58" width="4" height="6" rx="1.5" fill="#d97706" />
      <rect x="387" y="58" width="4" height="6" rx="1.5" fill="#d97706" />
      {/* stubs up to each device + pads */}
      {PAD_X.map((x, i) => (
        <g key={x}>
          <path d={`M ${x} 62 V 34`} stroke="#5eead4" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx={x} cy="26" r="8" fill={found[i] ? '#10b981' : '#14b8a6'} stroke={found[i] ? '#047857' : '#0f766e'} strokeWidth="2.5" />
          <circle cx={x} cy="26" r="2.6" fill="#f0fdfa" />
        </g>
      ))}
      {/* electrons running along the trace */}
      {anim &&
        [0, 1, 2].map((i) => (
          <circle key={i} r="4.5" fill="#0d9488" stroke="#f0fdfa" strokeWidth="1.5">
            <animateMotion dur="3.4s" begin={`${-i * 1.15}s`} repeatCount="indefinite">
              <mpath href="#cq-spine" />
            </animateMotion>
          </circle>
        ))}
      <text x="320" y="84" textAnchor="middle" fontSize="13.5" fontWeight="700" fill="#0f766e">
        {lang === 'fa' ? 'داخل همه‌چیز، برق کار می‌کند ⚙️' : 'electricity works inside all of them ⚙️'}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------- device page

const springIn = { type: 'spring' as const, bounce: 0.32, duration: 0.55 };

/**
 * One hero view (full / internal / exploded). The image lives in the shared
 * DeviceImageContainer (4/3, centered, complete object, never overflows) and
 * the label is a caption strip BELOW the image — so it can never overlap or
 * crop the device, whatever its aspect ratio. Same geometry for every device.
 */
function ViewCard({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-1 min-w-[68%] sm:min-w-0 snap-start flex-col overflow-hidden rounded-2xl border-2 border-sky-100 bg-gradient-to-b from-sky-50 to-white shadow-sm">
      <DeviceImageContainer
        src={src}
        alt={label}
        ratio={IMG_RATIO.view}
        pad="sm"
        rounded="rounded-none"
        className="w-full flex-none"
        eager
      />
      <span className="flex flex-none items-center justify-center gap-1 bg-teal-600 px-2 py-1 text-[11px] font-extrabold text-white" dir="auto">
        <span aria-hidden="true">🔍</span> {label}
      </span>
    </div>
  );
}

/** the illustrated page that opens when a device is tapped (reference design) */
function DevicePageOverlay({
  device,
  lessonId,
  anim,
  onClose,
}: {
  device: DevicePageDef;
  lessonId: string;
  anim: boolean;
  onClose: () => void;
}) {
  const { t, tx } = useI18n();
  const progress = useProgress();
  const [selected, setSelected] = useState<string | null>(null);
  // part texts stay blurred (a little guessing game) until the child taps the card
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const deviceName = tx(device.name);
  const partKey = (pid: string) => `${lessonId}:${device.id}:${pid}`;
  const foundParts = device.parts.map((p) => Boolean(progress.devicePartFinds[partKey(p.id)]));
  const foundCount = foundParts.filter(Boolean).length;
  const allFound = foundCount === device.parts.length;

  const bubble = allFound
    ? t('devicePage.mascotDone')
    : foundCount > 0
      ? t('devicePage.mascotTap')
      : t('devicePage.mascotGreet');

  const tapPart = (pid: string) => {
    const first = progress.findDevicePart(lessonId, device.id, pid);
    setSelected(pid);
    setRevealed((prev) => (prev.has(pid) ? prev : new Set(prev).add(pid)));
    if (first) {
      sfx.blip();
      // this tap completed the whole device? → little fanfare
      if (foundCount + 1 === device.parts.length) sfx.fanfare();
    }
  };

  const jumpToPart = (pid: string) => {
    tapPart(pid);
    const el = cardRefs.current[pid];
    el?.scrollIntoView({ behavior: anim ? 'smooth' : 'auto', block: 'nearest', inline: 'center' });
  };

  const views = [
    { src: device.full, label: t('devicePage.viewFull') },
    { src: device.internal, label: t('devicePage.viewInternal') },
    { src: device.exploded, label: t('devicePage.viewExploded') },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      role="dialog"
      aria-modal="true"
      aria-label={t('devicePage.title', { name: deviceName })}
    >
      <motion.div
        className="relative w-full sm:max-w-5xl max-h-[96dvh] sm:max-h-[92dvh] bg-gradient-to-b from-sky-50/95 to-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-sky-100 flex flex-col overflow-hidden"
        initial={anim ? { y: 60, opacity: 0, scale: 0.98 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={anim ? { y: 40, opacity: 0 } : { opacity: 0 }}
        transition={anim ? springIn : { duration: 0 }}
      >
        {/* header */}
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 pt-3 pb-2 border-b border-sky-100 bg-white/70">
          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-extrabold px-3 py-1.5 shadow-sm transition"
            aria-label={t('discovery.back')}
          >
            <X className="w-4 h-4 cq-flip-rtl" strokeWidth={3} />
            {t('discovery.back')}
          </button>
          <h3 className="flex-1 text-center text-base sm:text-lg font-black text-teal-800 leading-snug" dir="auto">
            <span aria-hidden="true">{device.emoji}</span>{' '}
            {t('devicePage.title', { name: deviceName })}
          </h3>
          <span className="shrink-0 text-xs font-extrabold text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-1 whitespace-nowrap" dir="auto">
            {t('devicePage.foundCount', { n: foundCount, m: device.parts.length })}
          </span>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3">
          {/* hero: parts index (desktop) + the 3 views.
              items-start keeps the view cards sized by THEIR image boxes —
              never stretched to the sidebar height (the old dead-space bug). */}
          <div className="flex items-start gap-3">
            {/* sidebar parts index — desktop only (first in RTL DOM = right edge) */}
            <aside className="hidden lg:flex w-44 shrink-0 flex-col rounded-2xl border-2 border-sky-100 bg-white/80 p-2 lg:max-h-[248px]">
              <p className="text-[13px] font-black text-teal-800 text-center pb-1" dir="auto">
                {t('devicePage.partsOf', { name: deviceName })}
              </p>
              <div className="flex flex-col gap-1 overflow-y-auto">
                {device.parts.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => jumpToPart(p.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-2 py-1 text-start transition active:scale-[0.98] ${
                      foundParts[i]
                        ? 'border-emerald-200 bg-emerald-50/80'
                        : 'border-sky-100 bg-sky-50/60 hover:border-teal-300'
                    } ${selected === p.id ? 'ring-2 ring-amber-300' : ''}`}
                    aria-label={tx(p.name)}
                  >
                    <DeviceImageContainer
                      src={p.photo}
                      alt=""
                      ratio={IMG_RATIO.square}
                      pad="none"
                      rounded="rounded-lg"
                      className="w-7 h-7 shrink-0 bg-white border border-slate-100"
                    />
                    <span className="flex-1 text-[12px] font-extrabold text-slate-700 leading-tight" dir="auto">{tx(p.name)}</span>
                    {foundParts[i] && <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3.5} />}
                  </button>
                ))}
              </div>
            </aside>

            {/* three views */}
            <div className="flex-1 flex gap-2.5 overflow-x-auto sm:overflow-x-visible snap-x pb-1">
              {views.map((v) => (
                <ViewCard key={v.label} src={v.src} label={v.label} />
              ))}
            </div>
          </div>

          {/* hint pill */}
          <p className="text-center text-[13px] font-extrabold text-sky-800 bg-sky-50 border border-sky-200 rounded-full px-3 py-1.5 mx-auto w-fit" dir="auto">
            {t('devicePage.tapHint')}
          </p>

          {/* part cards */}
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1.5 -mx-1 px-1">
            {device.parts.map((p, i) => {
              const isFound = foundParts[i];
              const isSel = selected === p.id;
              return (
                <motion.button
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                  onClick={() => tapPart(p.id)}
                  className={`relative snap-start shrink-0 w-[46%] sm:w-[200px] lg:w-[186px] rounded-2xl border-2 bg-white p-2 text-start transition-all active:scale-[0.97] ${
                    isSel ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]' : isFound ? 'border-emerald-200' : 'border-sky-100 hover:border-teal-300 hover:shadow-sm'
                  }`}
                  initial={anim ? { opacity: 0, y: 14 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                  aria-label={`${tx(p.name)} — ${tx(p.desc)}`}
                >
                  {isFound && (
                    <span className="absolute top-1.5 end-1.5 z-10 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3.5} />
                    </span>
                  )}
                  <DeviceImageContainer
                    src={p.photo}
                    alt=""
                    ratio={IMG_RATIO.square}
                    pad="sm"
                    rounded="rounded-xl"
                    className="w-full bg-gradient-to-b from-sky-50 to-white border border-sky-50"
                  />
                  {/* name + description stay blurred until the card is tapped —
                      tapping reveals them with a smooth unblur (guessing game) */}
                  <span
                    className={`mt-1.5 flex items-center gap-1.5 transition-all duration-300 ease-out ${revealed.has(p.id) ? 'blur-0 opacity-100' : 'blur-[5px] opacity-70 select-none'}`}
                    dir="auto"
                    aria-hidden={!revealed.has(p.id)}
                  >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-[12px]" aria-hidden="true">{p.emoji}</span>
                    <span className="font-black text-[13px] text-slate-800 leading-none" dir="auto">{tx(p.name)}</span>
                  </span>
                  <span
                    className={`block mt-1 text-[11.5px] font-semibold text-slate-500 leading-snug transition-all duration-300 ease-out ${revealed.has(p.id) ? 'blur-0 opacity-100' : 'blur-[5px] opacity-70 select-none'}`}
                    dir="auto"
                    aria-hidden={!revealed.has(p.id)}
                  >
                    {tx(p.desc)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* completion banner */}
          <AnimatePresence>
            {allFound && (
              <motion.div
                className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-2.5 text-center"
                initial={anim ? { scale: 0.7, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={anim ? { type: 'spring', bounce: 0.5, duration: 0.5 } : { duration: 0 }}
              >
                <p className="font-black text-emerald-800" dir="auto">🏆 {t('devicePage.allDone')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* footer: mascot + progress + CTA */}
        <footer className="shrink-0 bg-white border-t border-sky-100 px-3 py-2.5 space-y-2">
          <div className="flex items-end gap-2">
            <div className="shrink-0 -mb-1">
              <Mascot size={56} />
            </div>
            <motion.div
              key={bubble}
              initial={anim ? { opacity: 0, y: 8, scale: 0.96 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative flex-1 rounded-2xl bg-teal-50 border-2 border-teal-200 px-3 py-2 text-[13px] leading-snug font-bold text-teal-900"
              dir="auto"
            >
              {bubble}
            </motion.div>
            {/* progress + CTA — desktop inline */}
            <div className="hidden sm:flex flex-col items-stretch gap-1.5 w-56 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-amber-800" dir="auto">🏆 {t('devicePage.foundParts')}</span>
                <span className="text-[12px] font-black text-amber-900 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5" dir="auto">
                  {t('devicePage.foundCount', { n: foundCount, m: device.parts.length })}
                </span>
              </div>
              <div className="h-2 rounded-full bg-sky-100 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={device.parts.length} aria-valuenow={foundCount}>
                <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${(foundCount / device.parts.length) * 100}%` }} />
              </div>
              <button
                onClick={onClose}
                className="mt-0.5 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-amber-950 font-black text-sm px-4 py-2 shadow-sm transition"
              >
                <span aria-hidden="true">🔍</span> {t('devicePage.ready')}
              </button>
            </div>
          </div>
          {/* progress + CTA — mobile row */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={device.parts.length} aria-valuenow={foundCount}>
              {foundParts.map((f, i) => (
                <span key={i} className={`w-4 h-4 rounded-full flex items-center justify-center ${f ? 'bg-teal-500' : 'bg-white border-2 border-dashed border-teal-300'}`}>
                  {f && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                </span>
              ))}
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-400 active:scale-95 text-amber-950 font-black text-sm px-4 py-2 shadow-sm transition"
            >
              <span aria-hidden="true">🔍</span> {t('devicePage.ready')}
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------- main page

export function DeviceDiscovery({ lessonId }: { lessonId: string }) {
  const { t, tx } = useI18n();
  const anim = useSettings((s) => s.motion);
  const progress = useProgress();
  const [activeId, setActiveId] = useState<DevicePageId | null>(null);

  const found = DEVICE_PAGES.map((d) => Boolean(progress.discoveries[`${lessonId}:${d.id}`]));
  const foundCount = found.filter(Boolean).length;
  const missionDone = foundCount === DEVICE_PAGES.length;
  const xpAwarded = Boolean(progress.discoveryXp[lessonId]);

  // mission XP + badge once, when every device has been explored
  useEffect(() => {
    if (missionDone && !xpAwarded) {
      progress.awardDiscoveryXp(lessonId, MISSION_XP); // triggers checkBadges → curious-engineer
      sfx.fanfare();
    }
  }, [missionDone, xpAwarded, lessonId]);

  // lock page scroll while the overlay is open
  useEffect(() => {
    if (!activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeId]);

  const openDevice = (id: DevicePageId) => {
    sfx.pop();
    progress.discoverDevice(lessonId, id);
    setActiveId(id);
  };

  const openNext = () => {
    const next = DEVICE_PAGES.find((d) => !progress.discoveries[`${lessonId}:${d.id}`]) ?? DEVICE_PAGES[0];
    openDevice(next.id);
  };

  const activeDevice = DEVICE_PAGES.find((d) => d.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      {/* 1 — curiosity question */}
      <h3 className="text-center text-xl sm:text-2xl font-black text-teal-800 leading-relaxed">
        {t('discovery.question')}
      </h3>

      {/* 2 — the five devices on a PCB trace (realistic photos) */}
      <section className="rounded-3xl bg-white border-2 border-teal-100 shadow-sm px-2 pt-3 pb-1" aria-label={t('discovery.question')}>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {DEVICE_PAGES.map((d, i) => {
            const isFound = found[i];
            return (
              <button
                key={d.id}
                onClick={() => openDevice(d.id)}
                className={`group relative flex flex-col items-center gap-0.5 rounded-2xl border-2 p-1.5 sm:p-2 transition-all active:scale-95 ${
                  isFound
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:-translate-y-0.5 hover:shadow-md'
                }`}
                aria-label={`${tx(d.name)} — ${t('discovery.seeInside')}`}
              >
                <span className="relative block w-full">
                  <DeviceImageContainer
                    src={d.full}
                    alt=""
                    ratio={IMG_RATIO.square}
                    pad="xs"
                    rounded="rounded-xl"
                    className="w-full bg-gradient-to-b from-sky-50 to-white border border-sky-100"
                    eager
                  />
                  {isFound ? (
                    <span className="absolute top-0.5 end-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center" aria-label={t('discovery.discovered')}>
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3.5} />
                    </span>
                  ) : (
                    <span className="absolute top-0.5 start-0.5 text-sm sm:text-base cq-wiggle" aria-hidden="true">
                      🔍
                    </span>
                  )}
                </span>
                <span className="text-[10px] sm:text-[12.5px] font-extrabold text-slate-700 leading-none whitespace-nowrap">
                  {d.emoji} {tx(d.name)}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-1.5 sm:px-2 py-[1px] whitespace-nowrap leading-tight">
                  🔍 {t('discovery.seeInside')}
                </span>
              </button>
            );
          })}
        </div>
        <PcbTrace found={found} anim={anim} />
      </section>

      {/* 3 — discovery mission */}
      <section
        className={`rounded-3xl border-2 p-4 transition-colors ${
          missionDone ? 'border-amber-300 bg-amber-50' : 'border-amber-200 bg-amber-50/80'
        }`}
        aria-label={t('discovery.missionTitle')}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-black text-amber-900">{t('discovery.missionTitle')}</p>
          <span className="text-xs font-extrabold text-amber-800 bg-white border border-amber-200 rounded-full px-2.5 py-1 whitespace-nowrap">
            {t('discovery.missionCount', { n: foundCount })}
          </span>
        </div>
        <p className="text-sm font-bold text-amber-800 mt-1">{t('discovery.missionBody')}</p>
        <div className="flex items-center gap-1.5 mt-2.5" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={foundCount}>
          {found.map((f, i) => (
            <span
              key={i}
              className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all ${
                f ? 'bg-amber-400 border-2 border-amber-500 shadow-inner' : 'bg-white border-2 border-dashed border-amber-300'
              }`}
            >
              {f && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={4} />}
            </span>
          ))}
        </div>
        {missionDone && (
          <motion.div
            className="mt-3 rounded-2xl bg-white border-2 border-amber-300 p-3 text-center shadow-sm"
            initial={anim ? { scale: 0.6, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={anim ? { type: 'spring', bounce: 0.5, duration: 0.6 } : { duration: 0 }}
          >
            <p className="text-2xl">🏆</p>
            <p className="font-black text-amber-900">{t('discovery.champion')}</p>
            {xpAwarded && <p className="font-extrabold text-amber-600 text-sm">⭐ {t('lesson.xpEarned', { xp: MISSION_XP })}</p>}
            {progress.badges['curious-engineer'] && (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                <span aria-hidden="true">🧰</span> {t('discovery.badgeEarned')}
              </p>
            )}
          </motion.div>
        )}
      </section>

      {/* 4 — the lesson text */}
      <h2 className="text-2xl font-extrabold leading-snug">{t('discovery.title')}</h2>
      <p className="text-[17px] leading-relaxed text-slate-700 -mt-2">{t('discovery.body1')}</p>
      <p className="text-[17px] font-bold text-teal-800 leading-relaxed -mt-2">{t('discovery.body2')}</p>

      {/* 5 — four outcomes */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: '💡', label: t('discovery.outcomeLight'), cls: 'bg-amber-50 border-amber-200 text-amber-900' },
          { icon: '🔊', label: t('discovery.outcomeSound'), cls: 'bg-teal-50 border-teal-200 text-teal-900' },
          { icon: '🛞', label: t('discovery.outcomeMotion'), cls: 'bg-violet-50 border-violet-200 text-violet-900' },
          { icon: '🤖', label: t('discovery.outcomeRobot'), cls: 'bg-sky-50 border-sky-200 text-sky-900' },
        ].map((o) => (
          <div key={o.label} className={`rounded-2xl border-2 px-3 py-2.5 font-extrabold text-sm flex items-center gap-2 ${o.cls}`}>
            <span className="text-lg" aria-hidden="true">{o.icon}</span>
            {o.label}
          </div>
        ))}
      </div>

      {/* 6 — CTA to open the next undiscovered device */}
      {!missionDone && (
        <motion.button
          onClick={openNext}
          className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-amber-950 font-black text-lg py-3.5 shadow-md transition flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
          aria-label={t('discovery.cta')}
        >
          <span className="text-xl cq-wiggle" aria-hidden="true">🔍</span>
          {t('discovery.cta')}
        </motion.button>
      )}

      {/* 7 — fun fact */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-sm leading-relaxed">
        <p className="font-black text-amber-900">💡 {t('discovery.didYouKnow')}</p>
        <p className="font-semibold text-amber-800 mt-0.5">{t('discovery.didYouKnowBody')}</p>
      </div>

      {/* overlay: the illustrated device page */}
      <AnimatePresence>
        {activeDevice ? (
          <DevicePageOverlay
            key={activeDevice.id}
            device={activeDevice}
            lessonId={lessonId}
            anim={anim}
            onClose={() => setActiveId(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
