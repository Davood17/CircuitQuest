'use client';

/**
 * RobotDiscovery — full-screen overlay hosting the 3D robot experience.
 * Simple kid UI: title, discovery counter (0/6), stage hints, mascot bubbles,
 * back button, and the 🏆 +50 XP completion banner. The 3D canvas itself
 * lives in Robot3DScene (client-only, dynamically imported).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { Mascot } from '@/components/mascot/Mascot';
import { sfx } from '@/lib/sfx';
import { ROBOT_PARTS } from './parts-data';

const Robot3DScene = dynamic(() => import('./Robot3DScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="animate-pulse text-lg font-black text-teal-600">🤖 …</p>
    </div>
  ),
});

const ROBOT_XP = 50;
const PART_COUNT = 6;

export function RobotDiscovery({ lessonId, onClose }: { lessonId: string; onClose: () => void }) {
  const { t, tx } = useI18n();
  const anim = useSettings((s) => s.motion);
  const progress = useProgress();
  const [stage, setStage] = useState(0);
  const prevStage = useRef(0);
  const [mascot, setMascot] = useState<'start' | 'wow' | 'tap'>('start');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const discovered = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const key of Object.keys(progress.robotParts)) {
      if (key.startsWith(`${lessonId}:`)) map[key.slice(lessonId.length + 1)] = true;
    }
    return map;
  }, [progress.robotParts, lessonId]);
  const foundCount = Object.keys(discovered).length;
  const done = foundCount === PART_COUNT;

  // lock page scroll while the overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleStage = (s: number) => {
    if (s >= 2 && prevStage.current < 2) sfx.open(); // chest hatch opens
    prevStage.current = s;
    setStage(s);
    if (s >= 2) setMascot((m) => (m === 'start' ? 'wow' : m));
    if (s >= 3) setMascot('tap');
  };

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (id === null) return;
    sfx.blip();
    progress.discoverRobotPart(lessonId, id);
    const s = useProgress.getState();
    const total = Object.keys(s.robotParts).filter((k) => k.startsWith(`${lessonId}:`)).length;
    if (total === PART_COUNT && !s.robotXp[lessonId]) {
      progress.awardRobotXp(lessonId, ROBOT_XP);
      sfx.fanfare();
    }
  };

  const bubble =
    mascot === 'start' ? t('robot3d.mascotStart') : mascot === 'wow' ? t('robot3d.mascotWow') : t('robot3d.mascotTap');

  const hint = stage <= 1 ? t('robot3d.zoomBottom') : stage === 2 ? t('robot3d.hint2') : t('robot3d.hint3');

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-[2px] sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl border-2 border-white bg-gradient-to-b from-sky-50 to-teal-50 shadow-2xl sm:h-[90dvh] sm:max-h-[780px] sm:max-w-md sm:rounded-3xl"
        initial={anim ? { y: 90, scale: 0.92, opacity: 0 } : false}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 90, opacity: 0 }}
        transition={anim ? { type: 'spring', bounce: 0.3, duration: 0.55 } : { duration: 0 }}
      >
        {/* header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-white bg-white/80 px-3 py-2.5 backdrop-blur">
          <button
            onClick={onClose}
            aria-label={t('discovery.back')}
            className="flex h-10 items-center gap-1.5 rounded-full bg-slate-100 pl-3 pr-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <X className="h-4.5 w-4.5" /> {t('discovery.back')}
          </button>
          <p className="flex-1 text-center text-[17px] font-black text-slate-800">{t('robot3d.title')}</p>
          <span
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11.5px] font-extrabold transition-colors ${
              done ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-teal-200 bg-white text-teal-700'
            }`}
            role="status"
          >
            {t('robot3d.count', { n: foundCount })}
          </span>
        </header>

        {/* 3D stage */}
        <div className="relative min-h-0 flex-1">
          <Robot3DScene
            motion={anim}
            exploded={stage >= 3}
            discovered={discovered}
            selected={selectedId}
            onSelect={handleSelect}
            onStageChange={handleStage}
          />

          {/* floating hint for the first two zoom stages */}
          <AnimatePresence>
            {stage <= 1 && (
              <motion.p
                key="floatHint"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="pointer-events-none absolute inset-x-4 top-3 rounded-full bg-white/85 px-3 py-1.5 text-center text-[12.5px] font-extrabold text-teal-700 shadow-sm"
              >
                {stage === 0 ? t('robot3d.hint0') : t('robot3d.hint1')}
              </motion.p>
            )}
          </AnimatePresence>

          {/* completion banner */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={anim ? { scale: 0.5, opacity: 0, y: -14 } : false}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={anim ? { type: 'spring', bounce: 0.5, duration: 0.6 } : { duration: 0 }}
                className="pointer-events-none absolute inset-x-6 top-12 rounded-2xl border-2 border-amber-300 bg-white/95 p-3 text-center shadow-xl"
                role="status"
              >
                <p className="text-2xl">🏆</p>
                <p className="font-black text-amber-900">{t('robot3d.complete')}</p>
                {progress.robotXp[lessonId] && (
                  <p className="text-sm font-extrabold text-amber-600">⭐ {t('lesson.xpEarned', { xp: ROBOT_XP })}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* footer: mascot + selected-part card + bottom hint */}
        <footer className="shrink-0 space-y-2 border-t border-white bg-white/80 p-3 backdrop-blur">
          <div className="flex items-end gap-2">
            <div className="-mb-1 shrink-0">
              <Mascot size={54} />
            </div>
            <motion.div
              key={bubble}
              initial={anim ? { opacity: 0, y: 8, scale: 0.96 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative flex-1 rounded-2xl border-2 border-teal-200 bg-teal-50 px-3 py-2 text-[13px] font-bold leading-snug text-teal-900"
            >
              {bubble}
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            {selectedId ? (
              <motion.div
                key="part-card"
                initial={anim ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.28 }}
                className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50 p-2.5"
                role="status"
              >
                {(() => {
                  const p = ROBOT_PARTS.find((q) => q.id === selectedId);
                  if (!p) return null;
                  return (
                    <>
                      <span className="text-3xl" aria-hidden="true">{p.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-black text-sky-900">{tx(p.name)}</p>
                        <p className="text-[13px] font-semibold leading-snug text-slate-600">{tx(p.desc)}</p>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <p
                key="hint-bar"
                className="rounded-full bg-teal-600/10 py-1.5 text-center text-[12px] font-extrabold text-teal-700"
                aria-live="polite"
              >
                {hint}
              </p>
            )}
          </AnimatePresence>
        </footer>
      </motion.div>
    </motion.div>
  );
}
