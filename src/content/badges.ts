import type { BadgeDef } from './types';
import { L } from './helpers';

export const BADGES: BadgeDef[] = [
  {
    id: 'first-spark',
    emoji: '✨',
    title: L('First Spark', 'اولین جرقه'),
    description: L('Run your first circuit in the lab', 'اولین مدارت را در آزمایشگاه اجرا کردی'),
    rule: (c) => c.simRuns >= 1,
  },
  {
    id: 'first-lesson',
    emoji: '🎯',
    title: L('Student of Sparks', 'دانش‌آموز جرقه‌ها'),
    description: L('Complete your first lesson', 'اولین درس را کامل کردی'),
    rule: (c) => c.lessons >= 1,
  },
  {
    id: 'curious-engineer',
    emoji: '🧰',
    title: L('Curious Engineer', 'مهندس کنجکاو'),
    description: L('Explore inside all 5 devices', 'داخل هر ۵ وسیله را کشف کردی'),
    rule: (c) => c.discoveryMissions >= 1,
  },
  {
    id: 'led-master',
    emoji: '💡',
    title: L('LED Master', 'استاد ال‌ای‌دی'),
    description: L('Light up LEDs in 3 different lessons', 'در ۳ درس، ال‌ای‌دی را روشن کردی'),
    rule: (c) => c.lessons >= 3,
  },
  {
    id: 'quiz-ace',
    emoji: '🧠',
    title: L('Quiz Ace', 'تیزهوش آزمون'),
    description: L('Get a perfect score on 3 quizzes', 'در ۳ آزمون نمرهٔ کامل گرفت'),
    rule: (c) => c.perfectQuizzes >= 3,
  },
  {
    id: 'builder-1',
    emoji: '🔨',
    title: L('Builder', 'سازنده'),
    description: L('Complete your first project', 'اولین پروژه را کامل کردی'),
    rule: (c) => c.projects >= 1,
  },
  {
    id: 'troubleshooter',
    emoji: '🔍',
    title: L('Troubleshooter', 'عیب‌یاب'),
    description: L('Solve 3 broken-circuit challenges', '۳ چالش مدار خراب را حل کردی'),
    rule: (c) => c.challenges >= 3,
  },
  {
    id: 'lab-regular',
    emoji: '🧪',
    title: L('Lab Regular', 'آزمایشگاه‌گرد'),
    description: L('Run circuits 10 times', '۱۰ بار مدار اجرا کردی'),
    rule: (c) => c.simRuns >= 10,
  },
  {
    id: 'streak-3',
    emoji: '🔥',
    title: L('On Fire', 'داغ‌داغ'),
    description: L('Learn 3 days in a row', '۳ روز پشت سر هم یاد گرفتی'),
    rule: (c) => c.streak >= 3,
  },
  {
    id: 'streak-7',
    emoji: '🌟',
    title: L('Week Wizard', 'جادوگر هفته'),
    description: L('Learn 7 days in a row', '۷ روز پشت سر هم یاد گرفتی'),
    rule: (c) => c.streak >= 7,
  },
  {
    id: 'circuit-builder',
    emoji: '🔌',
    title: L('Circuit Builder', 'ساخت‌گر مدار'),
    description: L('Finish the Circuit Builder level', 'سطح «ساخت‌گر مدار» را تمام کردی'),
    rule: (c) =>
      ['l1-1', 'l1-2', 'l1-3', 'l1-4', 'l1-5', 'l1-6', 'l1-7'].every(c.lessonDone),
  },
  {
    id: 'detective',
    emoji: '🕵️',
    title: L('Circuit Detective', 'کارآگاه مدار'),
    description: L('Reach level 3: Circuit Detective', 'به سطح ۳ «کارآگاه مدار» رسیدی'),
    rule: (c) => c.tier >= 2,
  },
  {
    id: 'master-tier',
    emoji: '👑',
    title: L('Electronics Master', 'استاد الکترونیک'),
    description: L('Reach the final tier', 'به آخرین سطح رسیدی'),
    rule: (c) => c.tier >= 7,
  },
];
