import type { Level } from './types';
import { L } from './helpers';
import { LEVEL0_LESSONS } from './levels/level0';
import { LEVEL1_LESSONS } from './levels/level1';
import { LEVEL2_LESSONS } from './levels/level2';

/**
 * Content registry. Levels 3–7 (timing, digital, advanced, final projects)
 * plug in here as additional level files — no app code changes needed.
 */

export const LEVELS: Level[] = [
  {
    id: 'level0',
    index: 0,
    title: L('Electronics Explorer', 'کاوشگر الکترونیک'),
    description: L(
      'First the big ideas — electricity, safety and your first loop — then meet the parts (battery, wire, LED, switch) and the mighty trio: voltage, current, resistance.',
      'اول ایده‌های بزرگ: برق، ایمنی و اولین مدارت — بعد با قطعه‌ها آشنا می‌شوی (باتری، سیم، ال‌ای‌دی، کلید) و سه‌گانهٔ قدرتمند: ولتاژ، جریان و مقاومت.',
    ),
    theme: 'teal',
    lessons: LEVEL0_LESSONS,
  },
  {
    id: 'level1',
    index: 1,
    title: L('Circuit Builder', 'ساخت‌گر مدار'),
    description: L(
      'Real parts, real tools: breadboard, wires, LEDs, resistors, switches and battery packs — plus a grand chapter project.',
      'قطعه‌های واقعی، ابزار واقعی: بردبورد، سیم، ال‌ای‌دی، مقاومت، کلید و باتری‌ها — با پروژهٔ بزرگ فصل.',
    ),
    theme: 'amber',
    lessons: LEVEL1_LESSONS,
  },
  {
    id: 'level2',
    index: 2,
    title: L('Circuit Detective', 'کارآگاه مدار'),
    description: L(
      "The multimeter, series & parallel circuits, voltage & current measurements, Ohm's law and the troubleshooting method.",
      'مولتی‌متر، مدارهای سری و موازی، اندازه‌گیری ولتاژ و جریان، قانون اهم و روش عیب‌یابی.',
    ),
    theme: 'violet',
    lessons: LEVEL2_LESSONS,
  },
  // Levels 3–7: content modules attach here in the next iteration (architecture ready).
];

// ------------------------------------------------------------------ lookups

export const ALL_LESSONS = LEVELS.flatMap((l) => l.lessons);
export const LESSON_MAP = new Map(ALL_LESSONS.map((l) => [l.id, l]));
export const LEVEL_MAP = new Map(LEVELS.map((l) => [l.id, l]));

export function lessonsOfLevel(levelId: string) {
  return LEVEL_MAP.get(levelId)?.lessons ?? [];
}

export function nextLessonAfter(completedIds: Set<string>) {
  for (const lesson of ALL_LESSONS) {
    const prereqOk = lesson.unlockLessonIds.every((id) => completedIds.has(id));
    if (prereqOk && !completedIds.has(lesson.id)) return lesson;
  }
  return null;
}

export function isLessonUnlocked(lessonId: string, completedIds: Set<string>): boolean {
  const lesson = LESSON_MAP.get(lessonId);
  if (!lesson) return false;
  return lesson.unlockLessonIds.every((id) => completedIds.has(id));
}

/** is a whole level visible? (its first lesson's prereqs met, or always for level0) */
export function isLevelUnlocked(level: Level, completedIds: Set<string>): boolean {
  if (level.index === 0) return true;
  return level.lessons.some((l) => isLessonUnlocked(l.id, completedIds));
}

export { CHALLENGES } from './challenges';
export { PROJECTS } from './projects';
export { BADGES } from './badges';
