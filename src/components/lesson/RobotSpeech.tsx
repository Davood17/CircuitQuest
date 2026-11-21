'use client';

/**
 * RobotTeacher — the friendly circuit-hero robot who narrates the lessons.
 *
 * The robot speaks in SHORT dialogue lines: a small group of 1–2 lines lives
 * in the speech bubble at a time, and the child taps the robot or the bubble
 * to reveal the next group — so the screen never turns into a wall of text.
 * There is NO typewriter waiting: each group pops in instantly with a
 * playful bounce (per-line stagger), and the robot's mouth moves for a short
 * "speaking burst" as if it just said the line out loud. The "reduce motion"
 * setting shows the lines plainly, without the bounce.
 *
 * Lines are split from the ORIGINAL script at sentence / paragraph boundaries
 * only — not a single character of the teacher's words is ever changed.
 * The parent re-mounts it (key=text) on every new screen.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mascot } from '@/components/mascot/Mascot';
import { useSettings } from '@/stores/settings';
import { useI18n } from '@/lib/i18n';
import { sfx } from '@/lib/sfx';
import { groupDialogue } from '@/lib/dialogue';

export function RobotSpeech({ text, onDone }: { text: string; onDone?: () => void }) {
  const motion = useSettings((s) => s.motion);
  const { t } = useI18n();
  const chunks = useMemo(() => groupDialogue(text), [text]);

  const [idx, setIdx] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const talkTimer = useRef<number | null>(null);

  // stop the mouth when the screen changes
  useEffect(() => () => {
    if (talkTimer.current) window.clearTimeout(talkTimer.current);
  }, []);

  // the whole speech has been heard → unlock the gate (lesson "next" button)
  const heardAll = idx >= chunks.length - 1;
  useEffect(() => {
    if (heardAll) onDone?.();
  }, [heardAll, onDone]);

  const cur = chunks[Math.min(idx, chunks.length - 1)] ?? [];
  const hasMore = idx < chunks.length - 1;

  /** tap: pop the next group of lines into the bubble + a speaking burst */
  const advance = useCallback(() => {
    if (idx >= chunks.length - 1) return;
    sfx.blip(); // little robot voice on every new group
    setIdx(idx + 1);
    // the robot "says" the new group out loud: a short mouth-moving burst
    setSpeaking(true);
    if (talkTimer.current) window.clearTimeout(talkTimer.current);
    talkTimer.current = window.setTimeout(() => setSpeaking(false), 640);
  }, [idx, chunks.length]);

  const advanceKey = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      advance();
    }
  };

  return (
    <div
      className="flex items-start gap-2.5 select-none"
      onClick={advance}
      onKeyDown={advanceKey}
      role="button"
      tabIndex={0}
      aria-label={t('lesson.robotSays')}
    >
      {/* the robot — its mouth moves while it "speaks"; a glow-dot invites the tap */}
      <div className="relative shrink-0 pt-0.5">
        <Mascot size={64} talking={speaking} />
        {hasMore && (
          <span
            aria-hidden
            className="absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-300" />
            <span className="relative text-[9px] leading-none">👆</span>
          </span>
        )}
      </div>

      {/* speech bubble — one small group of dialogue lines at a time */}
      <div className="relative flex-1 min-w-0 rounded-3xl rounded-ss-md border-2 border-teal-200/90 bg-gradient-to-b from-white to-teal-50/70 px-4 pt-3.5 pb-2 shadow-[0_3px_0_0_rgba(13,148,136,0.14)]">
        {/* name tag */}
        <span className="absolute -top-3 start-4 rounded-full border border-teal-200 bg-white px-2 py-0.5 text-[11px] font-extrabold text-teal-600 shadow-sm">
          🤖 {t('lesson.robotName')}
        </span>

        <div className="min-h-14 space-y-1 py-0.5">
          {cur.map((lineText, i) => (
            <p
              key={`${idx}-${i}`}
              className={`text-[15px] leading-6 sm:text-[16.5px] sm:leading-7 font-bold text-slate-700 ${motion ? 'cq-pop' : ''}`}
              style={motion && i > 0 ? { animationDelay: `${i * 110}ms` } : undefined}
            >
              {lineText}
            </p>
          ))}
        </div>

        {/* footer: group dots + tap hint (only when the robot has more to say) */}
        {chunks.length > 1 && (
          <div className="mt-1 flex items-center gap-1.5 border-t border-teal-100/70 pt-1.5">
            {chunks.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? 'w-3.5 bg-teal-500' : i < idx ? 'w-1.5 bg-teal-300' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
            {hasMore && (
              <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-extrabold text-teal-600 animate-pulse">
                👆 {t('lesson.tapMore')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
