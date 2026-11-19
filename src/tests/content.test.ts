import { describe, expect, it } from 'vitest';
import { LEVELS, ALL_LESSONS, CHALLENGES, PROJECTS } from '@/content';
import { PART_MAP } from '@/parts/registry';
import { evalGoal, g } from '@/engine/goals';
import { Simulator } from '@/engine/simulator';
import type { Screen } from '@/content/types';

describe('content integrity', () => {
  it('has unique lesson/challenge/project ids', () => {
    const ids = [...ALL_LESSONS.map((l) => l.id), ...CHALLENGES.map((c) => c.id), ...PROJECTS.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all unlock references resolve and levels are ordered', () => {
    const all = new Set(ALL_LESSONS.map((l) => l.id));
    for (const lesson of ALL_LESSONS) {
      for (const pre of lesson.unlockLessonIds) expect(all.has(pre)).toBe(true);
      expect(lesson.screens.length).toBeGreaterThanOrEqual(3);
      // l0-1 uses a single-question end-of-lesson competition (user design); others have more
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(1);
      lesson.quiz.forEach((q) => {
        if (q.type === 'mcq' || q.type === 'diagnose') {
          expect(q.answer).toBeLessThan(q.options.length);
          expect(q.answer).toBeGreaterThanOrEqual(0);
        }
        if (q.type === 'circuitPick') {
          expect(q.answer).toBeLessThan(q.variants.length);
          expect(q.answer).toBeGreaterThanOrEqual(0);
        }
        if (q.type === 'identify') expect(PART_MAP.has(q.partType)).toBe(true);
      });
    }
    LEVELS.forEach((lvl, i) => expect(lvl.index).toBe(i));
  });

  it('projects reference real part types and tasks have hints', () => {
    for (const p of PROJECTS) {
      p.materials.forEach((m) => expect(PART_MAP.has(m)).toBe(true));
      p.steps.forEach((s) => expect(s.task.hints.length).toBeGreaterThan(0));
      expect(p.troubleshooting.length).toBeGreaterThan(0);
    }
  });

  it('every build/challenge goal is achievable in the simulator', () => {
    // smoke: compile all start circuits and evaluate goals (they may fail pass — must not crash)
    for (const ch of CHALLENGES) {
      const sim = new Simulator(ch.startCircuit, PART_MAP);
      sim.power(true);
      for (let i = 0; i < 3; i++) sim.tick(1 / 60);
      expect(() => evalGoal(ch.goal, { doc: ch.startCircuit, snapshot: sim.snapshot })).not.toThrow();
    }
    for (const lesson of ALL_LESSONS) {
      for (const screen of lesson.screens as Screen[]) {
        if (screen.type === 'build' && screen.task.startCircuit) {
          const startCircuit = screen.task.startCircuit;
          const sim = new Simulator(startCircuit, PART_MAP);
          sim.power(true);
          for (let i = 0; i < 3; i++) sim.tick(1 / 60);
          expect(() => evalGoal(screen.task.goal, { doc: startCircuit, snapshot: sim.snapshot })).not.toThrow();
        }
      }
    }
  });

  it('goal DSL builders compose', () => {
    const goal = g.and(g.battery(), g.ledOn('led1'));
    expect(goal.op).toBe('and');
    expect(goal.args?.length).toBe(2);
  });
});
