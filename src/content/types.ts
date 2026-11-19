import type { CircuitDoc, GoalExpr } from '@/engine/types';

/** A user-facing string. English now; Persian drops into `fa` later. */
export interface LocaleText {
  en: string;
  fa?: string;
}

// ---------------------------------------------------------------- visuals

export interface SceneSpec {
  kind: string;
  props?: Record<string, string | number | boolean>;
}

export type AnimSpec = SceneSpec;

export interface DemoControl {
  componentId: string;
  param: string;
  label: LocaleText;
  min?: number;
  max?: number;
  step?: number;
}

export interface DemoSpec {
  /** circuit shown in the mini-lab (read-only, live-simulated) */
  circuit: CircuitDoc;
  controls: DemoControl[];
  /** component ids whose state is highlighted/captioned */
  watch?: string[];
  caption?: LocaleText;
}

export interface TaskSpec {
  brief: LocaleText;
  goal: GoalExpr;
  startCircuit?: CircuitDoc;
  /** restrict the palette to these part types */
  allowed?: string[];
  hints: LocaleText[];
}

// ---------------------------------------------------------------- screens

export type Screen =
  | { type: 'explain'; title: LocaleText; body: LocaleText; scene?: SceneSpec; tip?: LocaleText; /** friendly think-about-it question shown in a card under the body (no scoring) */ ask?: LocaleText; /** when 'robot', the body is spoken by the teacher robot in a speech bubble */ speaker?: 'robot' }
  | { type: 'animation'; title: LocaleText; body?: LocaleText; anim: AnimSpec }
  | { type: 'demo'; title: LocaleText; body?: LocaleText; demo: DemoSpec }
  | { type: 'build'; title: LocaleText; body?: LocaleText; task: TaskSpec }
  | { type: 'discovery' }
  | {
      /** quiz page — new-format lessons may give it a custom title, a robot intro line and a scene */
      type: 'quiz';
      title?: LocaleText;
      body?: LocaleText;
      speaker?: 'robot';
      scene?: SceneSpec;
    }
  | { type: 'reward'; scene?: SceneSpec };

export type Question =
  | { type: 'mcq'; prompt: LocaleText; options: LocaleText[]; answer: number; explanation: LocaleText }
  | { type: 'trueFalse'; prompt: LocaleText; answer: boolean; explanation: LocaleText }
  | { type: 'identify'; prompt: LocaleText; partType: string; options: LocaleText[]; answer: number; explanation: LocaleText }
  | {
      type: 'diagnose';
      prompt: LocaleText;
      circuit: CircuitDoc;
      options: LocaleText[];
      answer: number;
      explanation: LocaleText;
    }
  | {
      /** pick the circuit picture that does the job; options are simple kid-readable schematics */
      type: 'circuitPick';
      prompt: LocaleText;
      variants: CircuitSchematic[];
      answer: number;
      explanation: LocaleText;
    };

/** simple hand-drawn circuit schematics for circuitPick options */
export type CircuitSchematic = 'open' | 'closed' | 'same-pin';

// ---------------------------------------------------------------- entities

export interface Lesson {
  id: string;
  levelId: string;
  title: LocaleText;
  emoji: string;
  difficulty: 1 | 2 | 3;
  minutes: number;
  objectives: LocaleText[];
  screens: Screen[];
  quiz: Question[];
  /** honor title shown on the reward screen when the child passes (e.g. "junior engineer medal") */
  rewardBadge?: LocaleText;
  unlockLessonIds: string[];
}

export interface Level {
  id: string;
  index: number;
  title: LocaleText;
  description: LocaleText;
  theme: string;
  lessons: Lesson[];
}

export interface ProjectStep {
  instruction: LocaleText;
  task: TaskSpec;
}

export interface Project {
  id: string;
  levelId: string;
  title: LocaleText;
  emoji: string;
  intro: LocaleText;
  objective: LocaleText;
  materials: string[];
  steps: ProjectStep[];
  troubleshooting: { symptom: LocaleText; cause: LocaleText; fix: LocaleText }[];
  xp: number;
}

export interface Challenge {
  id: string;
  kind: 'build' | 'troubleshoot';
  title: LocaleText;
  emoji: string;
  brief: LocaleText;
  startCircuit: CircuitDoc;
  goal: GoalExpr;
  hints: LocaleText[];
  daily: boolean;
}

export interface BadgeDef {
  id: string;
  emoji: string;
  title: LocaleText;
  description: LocaleText;
  rule: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  lessons: number;
  projects: number;
  challenges: number;
  perfectQuizzes: number;
  simRuns: number;
  streak: number;
  tier: number;
  hasBadge: (id: string) => boolean;
  lessonDone: (id: string) => boolean;
  /** number of discovery missions fully completed (all devices of a lesson explored) */
  discoveryMissions: number;
}
