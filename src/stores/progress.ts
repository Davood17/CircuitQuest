'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BADGES } from '@/content/badges';
import type { BadgeDef } from '@/content/types';

export interface LessonRecord {
  completedAt: number;
  attempts: number;
  hintsUsed: number;
  timeSpent: number; // seconds
}

export interface QuizRecord {
  bestPct: number;
  attempts: number;
  lastAt: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: string; // YYYY-MM-DD
}

interface ProgressState {
  name: string;
  avatar: string;
  xp: number;
  completedLessons: Record<string, LessonRecord>;
  quizScores: Record<string, QuizRecord>;
  completedProjects: Record<string, { completedAt: number }>;
  solvedChallenges: Record<string, { completedAt: number; hintsUsed: number }>;
  badges: Record<string, number>; // badgeId → earnedAt
  /** discovery mission (l0-1): `${lessonId}:${deviceId}` → discoveredAt */
  discoveries: Record<string, number>;
  /** discovery mission XP awarded once per lessonId */
  discoveryXp: Record<string, number>;
  /** per-device-page part finds (Task 16): `${lessonId}:${deviceId}:${partId}` → foundAt */
  devicePartFinds: Record<string, number>;
  streak: StreakState;
  stats: { mistakes: number; hintsUsed: number; seconds: number; simRuns: number; perfectQuizzes: number };
  adaptive: Record<string, { perfScore: number; struggle: number }>;
  // actions
  setName: (n: string) => void;
  setAvatar: (a: string) => void;
  addXp: (n: number) => void;
  completeLesson: (lessonId: string, o: { hintsUsed: number; timeSpent: number }) => void;
  recordQuiz: (lessonId: string, pct: number) => void;
  completeProject: (projectId: string) => void;
  solveChallenge: (challengeId: string, hintsUsed: number) => void;
  recordMistake: () => void;
  recordHintUse: () => void;
  recordSimRun: () => void;
  recordTime: (seconds: number) => void;
  markActiveDay: () => void;
  awardBadge: (badgeId: string) => void;
  /** mark a device as explored; returns true if it was the first time */
  discoverDevice: (lessonId: string, deviceId: string) => boolean;
  /** award the discovery-mission XP once per lesson; returns true if awarded now */
  awardDiscoveryXp: (lessonId: string, xp: number) => boolean;
  /** mark a device-page part as found; returns true if it was the first time */
  findDevicePart: (lessonId: string, deviceId: string, partId: string) => boolean;
  updateAdaptive: (lessonId: string, perfScore: number, struggled: boolean) => void;
  resetAll: () => void;
  importJson: (json: string) => boolean;
}

export const XP_REWARDS = { lesson: 50, quizPerfect: 20, project: 100, challengeNoHint: 50 } as const;

/** tier thresholds — index = tier 0..7 */
export const TIER_XP = [0, 200, 500, 900, 1400, 2000, 2700, 3500];

export function tierFromXp(xp: number): number {
  let tier = 0;
  for (let i = 0; i < TIER_XP.length; i++) if (xp >= TIER_XP[i]) tier = i;
  return tier;
}

const today = () => new Date().toISOString().slice(0, 10);

const initial = {
  name: 'کاوشگر',
  avatar: '⚡',
  xp: 0,
  completedLessons: {},
  quizScores: {},
  completedProjects: {},
  solvedChallenges: {},
  badges: {},
  discoveries: {},
  discoveryXp: {},
  devicePartFinds: {},
  streak: { current: 0, longest: 0, lastActiveDay: '' },
  stats: { mistakes: 0, hintsUsed: 0, seconds: 0, simRuns: 0, perfectQuizzes: 0 },
  adaptive: {},
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (name) => set({ name }),
      setAvatar: (avatar) => set({ avatar }),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      completeLesson: (lessonId, o) => {
        const already = get().completedLessons[lessonId];
        set((s) => ({
          completedLessons: {
            ...s.completedLessons,
            [lessonId]: {
              completedAt: already?.completedAt ?? Date.now(),
              attempts: (already?.attempts ?? 0) + 1,
              hintsUsed: (already?.hintsUsed ?? 0) + o.hintsUsed,
              timeSpent: (already?.timeSpent ?? 0) + o.timeSpent,
            },
          },
          xp: s.xp + (already ? 0 : XP_REWARDS.lesson),
          stats: { ...s.stats, hintsUsed: s.stats.hintsUsed + o.hintsUsed, seconds: s.stats.seconds + o.timeSpent },
        }));
        get().markActiveDay();
        checkBadges(set, get);
      },
      recordQuiz: (lessonId, pct) => {
        const prev = get().quizScores[lessonId];
        const perfect = pct === 100 && (!prev || prev.bestPct < 100);
        set((s) => ({
          quizScores: {
            ...s.quizScores,
            [lessonId]: { bestPct: Math.max(prev?.bestPct ?? 0, pct), attempts: (prev?.attempts ?? 0) + 1, lastAt: Date.now() },
          },
          xp: s.xp + (perfect ? XP_REWARDS.quizPerfect : 0),
          stats: { ...s.stats, perfectQuizzes: s.stats.perfectQuizzes + (perfect ? 1 : 0) },
        }));
        checkBadges(set, get);
      },
      completeProject: (projectId) => {
        if (get().completedProjects[projectId]) return;
        set((s) => ({
          completedProjects: { ...s.completedProjects, [projectId]: { completedAt: Date.now() } },
          xp: s.xp + XP_REWARDS.project,
        }));
        get().markActiveDay();
        checkBadges(set, get);
      },
      solveChallenge: (challengeId, hintsUsed) => {
        const prev = get().solvedChallenges[challengeId];
        const bonus = !prev && hintsUsed === 0 ? XP_REWARDS.challengeNoHint : 0;
        set((s) => ({
          solvedChallenges: { ...s.solvedChallenges, [challengeId]: { completedAt: Date.now(), hintsUsed } },
          xp: s.xp + bonus,
        }));
        get().markActiveDay();
        checkBadges(set, get);
      },
      recordMistake: () => set((s) => ({ stats: { ...s.stats, mistakes: s.stats.mistakes + 1 } })),
      recordHintUse: () => set((s) => ({ stats: { ...s.stats, hintsUsed: s.stats.hintsUsed + 1 } })),
      recordSimRun: () => {
        set((s) => ({ stats: { ...s.stats, simRuns: s.stats.simRuns + 1 } }));
        checkBadges(set, get);
      },
      recordTime: (seconds) =>
        set((s) => ({ stats: { ...s.stats, seconds: s.stats.seconds + Math.round(seconds) } })),
      markActiveDay: () => {
        const t = today();
        const st = get().streak;
        if (st.lastActiveDay === t) return;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        const current = st.lastActiveDay === yesterday ? st.current + 1 : 1;
        set({ streak: { current, longest: Math.max(current, st.longest), lastActiveDay: t } });
        checkBadges(set, get);
      },
      awardBadge: (badgeId) => {
        if (get().badges[badgeId]) return;
        set((s) => ({ badges: { ...s.badges, [badgeId]: Date.now() } }));
      },
      discoverDevice: (lessonId, deviceId) => {
        const key = `${lessonId}:${deviceId}`;
        if (get().discoveries[key]) return false;
        set((s) => ({ discoveries: { ...s.discoveries, [key]: Date.now() } }));
        get().markActiveDay();
        return true;
      },
      awardDiscoveryXp: (lessonId, xp) => {
        if (get().discoveryXp[lessonId]) return false;
        set((s) => ({ discoveryXp: { ...s.discoveryXp, [lessonId]: Date.now() }, xp: s.xp + xp }));
        checkBadges(set, get);
        return true;
      },
      findDevicePart: (lessonId, deviceId, partId) => {
        const key = `${lessonId}:${deviceId}:${partId}`;
        if (get().devicePartFinds[key]) return false;
        set((s) => ({ devicePartFinds: { ...s.devicePartFinds, [key]: Date.now() } }));
        get().markActiveDay();
        return true;
      },
      updateAdaptive: (lessonId, perfScore, struggled) =>
        set((s) => {
          const a = s.adaptive[lessonId] ?? { perfScore: 0, struggle: 0 };
          return {
            adaptive: {
              ...s.adaptive,
              [lessonId]: {
                perfScore: Math.max(a.perfScore, perfScore),
                struggle: struggled ? a.struggle + 1 : 0,
              },
            },
          };
        }),
      resetAll: () => set({ ...initial }),
      importJson: (json) => {
        try {
          const data = JSON.parse(json);
          if (typeof data.xp !== 'number') return false;
          set({ ...initial, ...data });
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: 'cq-progress' },
  ),
);

type SetFn = (partial: Partial<ProgressState>) => void;
type GetFn = () => ProgressState;

/** badge rule engine — evaluates badge predicates after progress events */
function checkBadges(set: SetFn, get: GetFn) {
  const s = get();
  const ctx = {
    lessons: Object.keys(s.completedLessons).length,
    projects: Object.keys(s.completedProjects).length,
    challenges: Object.keys(s.solvedChallenges).length,
    perfectQuizzes: s.stats.perfectQuizzes,
    simRuns: s.stats.simRuns,
    streak: s.streak.longest,
    tier: tierFromXp(s.xp),
    hasBadge: (id: string) => Boolean(s.badges[id]),
    lessonDone: (id: string) => Boolean(s.completedLessons[id]),
    discoveryMissions: Object.keys(s.discoveryXp).length,
  };
  for (const badge of BADGES as BadgeDef[]) {
    if (!s.badges[badge.id] && badge.rule(ctx)) {
      set({ badges: { ...s.badges, [badge.id]: Date.now() } });
    }
  }
}
