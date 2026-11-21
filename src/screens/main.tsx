'use client';

import { useMemo, useState } from 'react';
import {
  LEVELS, ALL_LESSONS, LESSON_MAP, LEVEL_MAP, nextLessonAfter, isLevelUnlocked, isLessonUnlocked,
  PROJECTS, BADGES,
} from '@/content';
import { L } from '@/content/helpers';
import { TIER_XP, tierFromXp, useProgress } from '@/stores/progress';
import { useSettings, type TextSize } from '@/stores/settings';
import { useI18n, toFaDigits } from '@/lib/i18n';
import { navigate } from '@/lib/router';
import { CHALLENGES } from '@/content/challenges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Mascot } from '@/components/mascot/Mascot';
import {
  Flame, Play, Lock, CheckCircle2, Settings as Gear, Trophy, Zap, Download, Upload,
  ShieldAlert, BookOpen, FlaskConical, Wrench, Home as HomeIcon, Hammer, ArrowLeft, ArrowRight,
} from 'lucide-react';

const AVATARS = ['⚡', '🔧', '💡', '🚀', '🦊', '🐼', '🐙', '🌟'];

/** locale-aware digits: Persian numerals in fa, Latin digits everywhere else */
function digits(lang: string, n: number | string): string {
  return lang === 'fa' ? toFaDigits(String(n)) : String(n);
}

// ------------------------------------------------------------------ HOME

/** journey stations on the home map: real levels first, then dream stations */
const PATH_STATIONS = [
  { id: 'level0', emoji: '🔋' },
  { id: 'level1', emoji: '🔌' },
  { id: 'level2', emoji: '🔍' },
  { id: 'future-robot', emoji: '🤖', title: L('Robot Maker', 'ربات‌ساز') },
  { id: 'future-master', emoji: '🏆', title: L('Electronics Master', 'استاد الکترونیک') },
];

/** tiny glowing circuit → LED sketch for the daily-challenge card */
function ChallengeArt() {
  return (
    <svg viewBox="0 0 92 56" width={76} className="shrink-0" aria-hidden="true">
      <rect x="4" y="32" width="18" height="14" rx="3" fill="#fde047" stroke="#a16207" strokeWidth="2" />
      <path d="M 13 32 V 14 H 62" stroke="#e9d5ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 13 46 H 62" stroke="#e9d5ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 62 14 V 46" stroke="#e9d5ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="66" cy="30" r="8" fill="#fbbf24">
        <animate attributeName="opacity" values="1;0.45;1" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="66" cy="30" r="12.5" fill="none" stroke="#fde047" strokeWidth="2">
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <text x="80" y="35" fontSize="14">✨</text>
    </svg>
  );
}

/** big cartoon flashlight: parts → a real tool you build yourself */
function FlashlightArt() {
  return (
    <svg viewBox="0 0 104 60" width={84} className="shrink-0" aria-hidden="true">
      <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
        <line x1="90" y1="16" x2="97" y2="11" />
        <line x1="92" y1="25" x2="100" y2="25" />
        <line x1="90" y1="34" x2="97" y2="39" />
      </g>
      <rect x="24" y="18" width="40" height="20" rx="6" fill="#475569" stroke="#334155" strokeWidth="2" />
      <line x1="32" y1="20" x2="32" y2="36" stroke="#334155" strokeWidth="2" />
      <line x1="38" y1="20" x2="38" y2="36" stroke="#334155" strokeWidth="2" />
      <path d="M 64 20 L 78 12 L 78 44 L 64 36 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <ellipse cx="78" cy="28" rx="4.5" ry="13" fill="#fde047" stroke="#d97706" strokeWidth="2">
        <animate attributeName="opacity" values="1;0.6;1" dur="1.6s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="30" cy="42" r="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <text x="6" y="52" fontSize="13">🔋</text>
    </svg>
  );
}

function PartChip({ children, hot }: { children: React.ReactNode; hot?: boolean }) {
  return (
    <span className={`rounded-xl px-2 py-1 text-lg leading-none ${hot ? 'bg-amber-100' : 'bg-slate-100'}`}>
      {children}
    </span>
  );
}

export function HomeScreen() {
  const { t, tx, lang } = useI18n();
  const progress = useProgress();
  const tier = tierFromXp(progress.xp);
  const nextXp = TIER_XP[Math.min(tier + 1, TIER_XP.length - 1)];
  const prevXp = TIER_XP[tier];
  const pct = Math.min(100, Math.round(((progress.xp - prevXp) / Math.max(1, nextXp - prevXp)) * 100));
  const Fwd = lang === 'fa' ? ArrowLeft : ArrowRight;

  const completed = useMemo(() => new Set(Object.keys(progress.completedLessons)), [progress.completedLessons]);
  const nextLesson = nextLessonAfter(completed);
  const nextLessonId = nextLesson?.id ?? '';
  const nextLevel = nextLesson ? LEVEL_MAP.get(nextLesson.levelId) : undefined;
  const nextLessonIdx = nextLevel ? nextLevel.lessons.findIndex((l) => l.id === nextLessonId) : -1;
  const nextLevelDone = nextLevel ? nextLevel.lessons.filter((l) => completed.has(l.id)).length : 0;

  const recentBadges = useMemo(
    () => BADGES.filter((b) => progress.badges[b.id]).slice(-4),
    [progress.badges],
  );
  const lockedBadges = useMemo(() => BADGES.filter((b) => !progress.badges[b.id]).slice(0, 3), [progress.badges]);

  // daily challenge: deterministic pick by date
  const daily = useMemo(() => {
    const day = new Date().toISOString().slice(0, 10);
    const pool = CHALLENGES.filter((c) => c.daily && !progress.solvedChallenges[c.id]);
    const all = pool.length > 0 ? pool : CHALLENGES;
    let h = 0;
    for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return all[h % all.length];
  }, [progress.solvedChallenges]);

  const recommendedProject = PROJECTS.find((p) => !progress.completedProjects[p.id]) ?? PROJECTS[0];
  const projectEstMin = Math.max(10, recommendedProject.steps.length * 5);
  const projectDiffKey = recommendedProject.levelId === 'level0' ? 'home.easy' : recommendedProject.levelId === 'level1' ? 'home.medium' : 'home.hard';

  // path stations state
  const curLevelId = nextLesson?.levelId ?? 'level0';
  const stations = PATH_STATIONS.map((st) => {
    const level = LEVEL_MAP.get(st.id);
    const done = level ? level.lessons.filter((l) => completed.has(l.id)).length : 0;
    return {
      ...st,
      title: st.title ?? level?.title,
      isLevel: Boolean(level),
      complete: level ? done === level.lessons.length : false,
      done,
      total: level?.lessons.length ?? 0,
      current: st.id === curLevelId,
    };
  });

  return (
    <div className="pb-6">
      {/* ═══ HEADER: who am I · what level · how far to next ═══ */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-5 rounded-b-3xl max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ screen: 'profile' })}
            className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl"
            aria-label={t('profile.title')}
          >
            {progress.avatar}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-extrabold truncate">{t('home.welcome', { name: progress.name })}</p>
            <p className="text-sm font-extrabold text-amber-300">⭐ {t('home.level', { n: tier + 1, tier: t(`tier.${tier}`) })}</p>
          </div>
          <button
            onClick={() => navigate({ screen: 'settings' })}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            aria-label={t('nav.settings')}
          >
            <Gear className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-end text-xs font-extrabold mb-1.5">
            <span className="flex items-center gap-1">⭐ {t('home.xpOf', { a: progress.xp, b: nextXp })}</span>
            <span className="flex items-center gap-1 text-orange-200">
              <Flame className="w-3.5 h-3.5" /> {t('home.streak', { n: progress.streak.current })}
            </span>
          </div>
          <div className="h-3.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all relative"
              style={{ width: `${Math.max(8, pct)}%` }}
            />
          </div>
          <p className="text-xs text-amber-200 mt-1.5 font-extrabold">✨ {t('home.xpToNext', { xp: Math.max(0, nextXp - progress.xp) })}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* ═══ SAFETY — mascot's short friendly reminder ═══ */}
        <div className="flex items-center gap-3 rounded-3xl bg-amber-50 border-2 border-amber-200 p-3">
          <Mascot size={54} className="shrink-0" />
          <div className="flex-1 min-w-0 rounded-2xl bg-white/90 px-3.5 py-2.5">
            <p className="text-sm font-extrabold text-amber-900 leading-snug">⚡ {t('home.safetyTitle')}</p>
            <p className="text-[13px] font-bold text-amber-800 leading-snug mt-0.5">🔋 {t('home.safetyBody')}</p>
          </div>
        </div>

        {/* ═══ MY JOURNEY — small playful map ═══ */}
        <section>
          <h2 className="font-extrabold mb-2 flex items-center gap-1.5">🗺️ {t('home.pathTitle')}</h2>
          <div className="rounded-3xl bg-white border-2 border-slate-100 shadow-sm p-4">
            {stations.map((st, i) => (
              <div key={st.id}>
                {i > 0 && (
                  <div
                    className={`w-0 ms-[27px] border-s-2 border-dashed h-4 ${stations[i - 1].complete ? 'border-emerald-300' : 'border-slate-200'}`}
                  />
                )}
                <button
                  onClick={() => st.isLevel && navigate({ screen: 'learn' })}
                  className={`w-full flex items-center gap-3 rounded-2xl p-1.5 text-start transition-colors ${
                    st.current ? 'bg-teal-50' : st.isLevel ? 'hover:bg-slate-50' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      st.complete
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : st.current
                          ? 'bg-teal-600 text-white ring-4 ring-teal-200 cq-path-pulse'
                          : st.isLevel
                            ? 'bg-white border-2 border-slate-200'
                            : 'bg-slate-100 border-2 border-dashed border-slate-200'
                    }`}
                  >
                    {st.complete ? '✓' : st.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block font-extrabold leading-tight truncate text-[15px] ${st.isLevel ? '' : 'text-slate-500'}`}>
                      {st.title ? tx(st.title) : ''}
                    </span>
                    {st.isLevel ? (
                      <span className="flex items-center gap-2 mt-1">
                        <span className="h-1.5 flex-1 max-w-[150px] rounded-full bg-slate-200 overflow-hidden">
                          <span
                            className={`block h-full rounded-full ${st.complete ? 'bg-emerald-500' : 'bg-teal-500'}`}
                            style={{ width: `${Math.round((st.done / st.total) * 100)}%` }}
                          />
                        </span>
                        <span className={`text-[11px] font-extrabold ${st.complete ? 'text-emerald-600' : 'text-teal-700'}`}>
                          {digits(lang, st.done)}/{digits(lang, st.total)}
                        </span>
                      </span>
                    ) : (
                      <span className="block text-[11px] font-bold text-slate-400 mt-0.5">{t('home.pathSoon')}</span>
                    )}
                  </span>
                  {st.current ? (
                    <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 rounded-full px-2 py-1 shrink-0">📍 {t('home.youAreHere')}</span>
                  ) : st.complete ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : i === stations.length - 1 ? (
                    <span className="text-xl shrink-0">🚩</span>
                  ) : !st.isLevel ? (
                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 rounded-full px-2 py-1 shrink-0">🔒 {t('home.pathSoon')}</span>
                  ) : null}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ CONTINUE LEARNING — the main CTA ═══ */}
        {nextLesson && nextLevel && (
          <button
            onClick={() => navigate({ screen: 'lesson', id: nextLesson.id })}
            className="w-full text-start rounded-3xl bg-white border-2 border-teal-100 shadow-md shadow-teal-900/10 overflow-hidden active:scale-[0.99] transition-transform"
          >
            <div className="bg-teal-50 px-5 pt-3 pb-2 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <p className="text-xs font-extrabold text-teal-700">{t('home.continue')}</p>
            </div>
            <div className="px-5 pb-4 pt-2">
              <p className="font-extrabold text-xl leading-snug">{nextLesson.emoji} {tx(nextLesson.title)}</p>
              <div className="flex items-center gap-2 mt-1.5 text-xs font-bold text-slate-500">
                <span>{t('home.lessonOf', { a: nextLessonIdx + 1, b: nextLevel.lessons.length })}</span>
                <span className="text-slate-300">•</span>
                <span>⏱ {t('learn.minutes', { n: nextLesson.minutes })}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 mt-2.5 overflow-hidden">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.round((nextLevelDone / nextLevel.lessons.length) * 100)}%` }} />
              </div>
              <div className="mt-3.5 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center gap-2 font-extrabold text-base shadow-sm">
                <Play className="w-5 h-5 fill-white" /> {t('home.go')}
              </div>
            </div>
          </button>
        )}

        {/* ═══ DAILY CHALLENGE — mission = purple, action/reward = gold ═══ */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-violet-800 text-white p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-violet-200">⚡ {t('home.daily')}</p>
            <span className="rounded-full bg-amber-400 text-violet-950 text-xs font-extrabold px-3 py-1.5 shrink-0">
              🎯 {t('home.xpReward', { n: 50 })}
            </span>
          </div>
          <p className="text-lg font-extrabold mt-2 leading-snug">{daily.emoji} {tx(daily.title)}</p>
          <p className="text-[13px] font-bold text-violet-100 leading-relaxed mt-1 line-clamp-2">{tx(daily.brief)}</p>
          <div className="flex items-center gap-3 mt-4">
            <ChallengeArt />
            <Button
              className="flex-1 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-violet-950 font-extrabold text-base shadow-lg shadow-amber-500/30"
              onClick={() => navigate({ screen: 'challenges' })}
            >
              {t('home.startChallenge')} <Fwd className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>

        {/* ═══ SUGGESTED PROJECT — a real thing you can build ═══ */}
        <button
          onClick={() => navigate({ screen: 'project', id: recommendedProject.id })}
          className="w-full text-start rounded-3xl bg-white border-2 border-amber-100 shadow-md shadow-amber-900/10 overflow-hidden active:scale-[0.99] transition-transform"
        >
          <div className="bg-amber-50/70 px-5 pt-4 pb-3">
            <p className="text-xs font-extrabold text-amber-600">🔧 {t('home.recommended')}</p>
            <p className="font-extrabold text-lg leading-snug mt-0.5">{recommendedProject.emoji} {tx(recommendedProject.title)}</p>
          </div>
          <div className="px-5 pb-4 pt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <PartChip>🔋</PartChip>
              <span className="font-extrabold text-slate-400">+</span>
              <PartChip>💡</PartChip>
              <span className="font-extrabold text-slate-400">+</span>
              <PartChip>🔌</PartChip>
              <Fwd className="w-4 h-4 text-slate-400 mx-0.5" />
              <PartChip hot>🔦</PartChip>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] font-extrabold text-slate-500">
              <span>🧩 {t('home.parts', { n: recommendedProject.materials.length })}</span>
              <span>⏱ {t('learn.minutes', { n: projectEstMin })}</span>
              <span>⭐ {t(projectDiffKey)}</span>
            </div>
            <div className="flex items-center gap-3 mt-3.5">
              <FlashlightArt />
              <div className="flex-1 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center gap-2 font-extrabold text-base shadow-sm">
                <Hammer className="w-5 h-5" /> {t('home.buildIt')}
              </div>
            </div>
          </div>
        </button>

        {/* ═══ BADGES — medals to earn, locked ones to crave ═══ */}
        <section>
          <h2 className="font-extrabold mb-2 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" /> {t('home.badges')}
          </h2>
          {recentBadges.length === 0 ? (
            <div className="flex items-center gap-3 rounded-3xl bg-white border-2 border-dashed border-slate-200 p-3">
              <Mascot size={54} className="shrink-0" />
              <p className="text-sm font-bold text-slate-500 flex-1 min-w-0">{t('home.noBadges')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {recentBadges.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 shadow-[0_3px_10px_rgba(217,119,6,0.15)] p-2.5 text-center"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-b from-amber-200 to-amber-400 flex items-center justify-center text-xl shadow-inner">
                    {b.emoji}
                  </div>
                  <p className="text-[10px] font-extrabold text-amber-900 leading-tight mt-1.5">{tx(b.title)}</p>
                </div>
              ))}
              {lockedBadges.map((b) => (
                <div key={b.id} className="relative rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 p-2.5 text-center">
                  <span className="absolute top-1 end-1 text-[10px]">🔒</span>
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-200/70 flex items-center justify-center text-xl grayscale opacity-60">
                    {b.emoji}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight mt-1.5">{tx(b.title)}</p>
                  <p className="text-[9px] font-bold text-slate-400 leading-tight mt-0.5 line-clamp-1">{tx(b.description)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ FOOTER — the mascot signs off and closes the page ═══ */}
        <footer className="pt-4 pb-1 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-2.5" aria-hidden="true">
            <span className="h-px w-10 bg-slate-200" />
            <Mascot size={30} />
            <span className="h-px w-10 bg-slate-200" />
          </div>
          <p className="text-[11px] font-bold text-slate-400">{t('home.footer')}</p>
        </footer>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ LEARN

export function LearnScreen() {
  const { t, tx, lang } = useI18n();
  const completedLessons = useProgress((s) => s.completedLessons);
  const completed = useMemo(() => new Set(Object.keys(completedLessons)), [completedLessons]);

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1">{t('learn.title')}</h1>
      <p className="text-sm text-slate-500 font-semibold mb-5">
        {digits(lang, completed.size)}/{digits(lang, ALL_LESSONS.length)} {t('progress.lessons')}
      </p>
      <div className="space-y-6">
        {LEVELS.map((level) => {
          const unlocked = isLevelUnlocked(level, completed);
          const done = level.lessons.filter((l) => completed.has(l.id)).length;
          return (
            <section key={level.id} className={!unlocked ? 'opacity-60' : ''}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold">
                  {level.index}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold leading-tight">{tx(level.title)}</p>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-1">{tx(level.description)}</p>
                </div>
                <div className="text-xs font-extrabold text-teal-700">{digits(lang, done)}/{digits(lang, level.lessons.length)}</div>
              </div>
              <div className="grid gap-2">
                {level.lessons.map((lesson) => {
                  const lessonUnlocked = isLessonUnlocked(lesson.id, completed);
                  const isDone = completed.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      disabled={!lessonUnlocked}
                      onClick={() => navigate({ screen: 'lesson', id: lesson.id })}
                      className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3 text-start transition-all active:scale-[0.99] ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200'
                          : lessonUnlocked
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-100 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0">
                        {lessonUnlocked ? lesson.emoji : <Lock className="w-5 h-5 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold leading-tight truncate">{tx(lesson.title)}</p>
                        <p className="text-[11px] font-semibold text-slate-500">{t('learn.minutes', { n: lesson.minutes })}</p>
                      </div>
                      {isDone ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      ) : lessonUnlocked ? (
                        <Play className="w-5 h-5 text-teal-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        <div className="rounded-2xl bg-slate-100 border border-dashed p-4 text-center text-sm font-semibold text-slate-400">
          🔜 {t('learn.moreLevelsSoon')}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ PROGRESS

export function ProgressScreen() {
  const { t, tx, lang } = useI18n();
  const progress = useProgress();
  const tier = tierFromXp(progress.xp);
  const completed = new Set(Object.keys(progress.completedLessons));
  const quizValues = Object.values(progress.quizScores);
  const quizAvg = quizValues.length
    ? Math.round(quizValues.reduce((a, q) => a + q.bestPct, 0) / quizValues.length)
    : 0;

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-extrabold">{t('progress.title')}</h1>

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Zap className="w-5 h-5 text-amber-500" />} label={t('progress.xp')} value={progress.xp} />
        <StatCard icon={<Flame className="w-5 h-5 text-rose-500" />} label={t('progress.streak')} value={progress.streak.longest} />
        <StatCard icon={<BookOpen className="w-5 h-5 text-teal-600" />} label={t('progress.lessons')} value={completed.size} />
        <StatCard icon={<Wrench className="w-5 h-5 text-violet-600" />} label={t('progress.projects')} value={Object.keys(progress.completedProjects).length} />
        <StatCard icon={<Trophy className="w-5 h-5 text-amber-500" />} label={t('progress.quizAvg')} value={lang === 'fa' ? `${toFaDigits(String(quizAvg))}٪` : `${quizAvg}%`} />
        <StatCard icon={<FlaskConical className="w-5 h-5 text-sky-600" />} label={t('progress.simRuns')} value={progress.stats.simRuns} />
      </div>

      <section>
        <h2 className="font-extrabold mb-2">{t('progress.mastery')}</h2>
        <div className="space-y-2">
          {LEVELS.map((level) => {
            const done = level.lessons.filter((l) => completed.has(l.id)).length;
            const pct = Math.round((done / level.lessons.length) * 100);
            return (
              <div key={level.id} className="rounded-2xl bg-white border p-3">
                <div className="flex justify-between text-sm font-bold mb-1.5">
                  <span>{lang === 'fa' ? toFaDigits(String(level.index)) : level.index}. {tx(level.title)}</span>
                  <span className="text-teal-700">{lang === 'fa' ? `${toFaDigits(String(pct))}٪` : `${pct}%`}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-extrabold mb-2">{t('progress.badges')}</h2>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const earned = progress.badges[b.id];
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-3 text-center ${earned ? 'bg-white border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}
                title={tx(b.description)}
              >
                <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>{b.emoji}</div>
                <p className="text-[11px] font-bold mt-1 leading-tight">{tx(b.title)}</p>
                {!earned && <p className="text-[9px] text-slate-400 mt-0.5"><Lock className="inline w-3 h-3" /></p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  const { lang } = useI18n();
  const shown = typeof value === 'number' && lang === 'fa' ? toFaDigits(String(value)) : value;
  return (
    <div className="rounded-2xl bg-white border p-3">
      {icon}
      <p className="text-xl font-extrabold mt-1 tabular-nums">{shown}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// ------------------------------------------------------------------ PROFILE

export function ProfileScreen() {
  const { t } = useI18n();
  const progress = useProgress();
  const [importMsg, setImportMsg] = useState('');

  const exportData = () => {
    const data = JSON.stringify(useProgress.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circuitquest-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = progress.importJson(String(reader.result));
      setImportMsg(ok ? t('profile.imported') : t('profile.importInvalid'));
      window.setTimeout(() => setImportMsg(''), 2500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-extrabold">{t('profile.title')}</h1>

      <div className="rounded-3xl bg-white border p-5 space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-600">{t('profile.name')}</label>
          <Input className="mt-1.5 h-12 text-lg font-bold" value={progress.name} onChange={(e) => progress.setName(e.target.value.slice(0, 24))} />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-600">{t('profile.avatar')}</label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => progress.setAvatar(a)}
                className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border-2 ${progress.avatar === a ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border p-5 space-y-3">
        <Button variant="outline" className="w-full h-12 font-bold" onClick={exportData}>
          <Download className="w-5 h-5 me-2" /> {t('profile.export')}
        </Button>
        <label className="block">
          <span className="sr-only">{t('profile.import')}</span>
          <div className="w-full h-12 rounded-md border border-input bg-background font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-accent">
            <Upload className="w-5 h-5" /> {t('profile.import')}
          </div>
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
        </label>
        {importMsg && <p className="text-sm font-bold text-teal-700">{importMsg}</p>}
        <Button
          variant="destructive"
          className="w-full h-12 font-bold"
          onClick={() => {
            if (confirm(t('profile.resetConfirm'))) progress.resetAll();
          }}
        >
          {t('profile.reset')}
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ SETTINGS

export function SettingsScreen() {
  const { t, lang } = useI18n();
  const settings = useSettings();

  return (
    <div className="p-4 pb-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-extrabold">{t('settings.title')}</h1>

      <div className="rounded-3xl bg-white border p-5 space-y-4">
        <SettingRow label={t('settings.sound')}>
          <Switch checked={settings.sound} onCheckedChange={settings.setSound} />
        </SettingRow>
        <SettingRow label={t('settings.motion')} desc={t('settings.motionDesc')}>
          <Switch checked={settings.motion} onCheckedChange={settings.setMotion} />
        </SettingRow>
        <SettingRow label={t('settings.contrast')}>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(v) => {
              settings.setHighContrast(v);
              document.documentElement.setAttribute('data-cq-contrast', v ? 'high' : 'normal');
            }}
          />
        </SettingRow>
        <SettingRow label={t('settings.textSize')}>
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as TextSize[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  settings.setTextSize(s);
                  document.documentElement.style.fontSize = s === 'small' ? '14px' : s === 'medium' ? '16px' : '19px';
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold ${settings.textSize === s ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {t(`common.${s}`)}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label={t('settings.language')}>
          <div className="flex gap-1">
            <button
              onClick={() => settings.setLanguage('fa')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${lang === 'fa' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              فارسی
            </button>
            <button
              onClick={() => settings.setLanguage('en')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold ${lang === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              English
            </button>
          </div>
        </SettingRow>
      </div>

      <div className="rounded-3xl bg-teal-50 border border-teal-200 p-5">
        <h2 className="font-extrabold text-teal-900 flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5" /> {t('settings.safetyTitle')}
        </h2>
        <p className="text-sm text-teal-900 font-semibold leading-relaxed">{t('settings.safetyBody')}</p>
      </div>

      <div className="rounded-3xl bg-white border p-5">
        <h2 className="font-extrabold mb-2">{t('settings.about')}</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{t('settings.aboutBody')}</p>
        <p className="text-xs text-slate-400 mt-3">ماجرای مدار (CircuitQuest) v1.0 · {t('app.tagline')}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-bold">{label}</p>
        {desc && <p className="text-xs text-slate-400 font-semibold">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export { HomeIcon };
