import { describe, expect, it } from 'vitest';
import { groupDialogue, splitDialogue } from '@/lib/dialogue';
import { ALL_LESSONS } from '@/content';

/** every robot-narrated line pair (en + fa) in the whole curriculum */
function robotBodies(): Array<{ lesson: string; lang: 'en' | 'fa'; text: string }> {
  const out: Array<{ lesson: string; lang: 'en' | 'fa'; text: string }> = [];
  for (const lesson of ALL_LESSONS) {
    for (const screen of lesson.screens) {
      if (screen.type === 'explain' && screen.speaker === 'robot') {
        out.push({ lesson: lesson.id, lang: 'en', text: screen.body.en });
        if (screen.body.fa) out.push({ lesson: lesson.id, lang: 'fa', text: screen.body.fa });
      }
      if (screen.type === 'quiz' && screen.speaker === 'robot' && screen.body) {
        out.push({ lesson: lesson.id, lang: 'en', text: screen.body.en });
        if (screen.body.fa) out.push({ lesson: lesson.id, lang: 'fa', text: screen.body.fa });
      }
    }
  }
  return out;
}

describe('robot dialogue splitting', () => {
  it('keeps the teacher\u2019s words verbatim for every robot screen (fa + en)', () => {
    const bodies = robotBodies();
    expect(bodies.length).toBeGreaterThan(20); // l0-1..l0-4 narrate every page

    for (const { lesson, lang, text } of bodies) {
      const lines = splitDialogue(text);
      // no empty lines, and the joined lines equal the original (whitespace aside)
      expect(lines.length, `${lesson} ${lang}`).toBeGreaterThan(0);
      const joined = lines.join('\n').replace(/\s+/g, ' ').trim();
      const original = text.replace(/\s+/g, ' ').trim();
      expect(joined, `${lesson} ${lang}`).toBe(original);
      // a "line" must never regress into a wall of text
      for (const line of lines) {
        expect(line.length, `${lesson} ${lang}: ${line.slice(0, 30)}`).toBeLessThan(220);
      }
    }
  });

  it('keeps numbered and emoji list items as single lines', () => {
    const lines = splitDialogue(
      'توی هر مدار جادویی، ۴ تا ایستگاه اصلی داریم:\n\n1. 🔋 پمپ انرژی (باتری): الکترون‌ها رو هول میده تا حرکت کنند.\n2. 🧵 جادهٔ حرکت (سیم‌های مس): مسیر رفت و آمد الکترون‌ها هستند.',
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('1. 🔋 پمپ انرژی (باتری): الکترون‌ها رو هول میده تا حرکت کنند.');
    expect(lines[2]).toBe('2. 🧵 جادهٔ حرکت (سیم‌های مس): مسیر رفت و آمد الکترون‌ها هستند.');
  });

  it('merges very short neighbours and never returns an empty list', () => {
    expect(splitDialogue('Kids! Electricity has two faces. You must know both!')).toEqual([
      'Kids! Electricity has two faces. You must know both!',
    ]);
    expect(splitDialogue('   ')).toEqual(['']);
    expect(splitDialogue('')).toEqual(['']);
  });
});

describe('robot dialogue grouping (bubble chunks)', () => {
  it('keeps the teacher\u2019s words verbatim across the chunks for every robot screen (fa + en)', () => {
    const bodies = robotBodies();
    expect(bodies.length).toBeGreaterThan(20); // l0-1..l0-5 narrate every page

    for (const { lesson, lang, text } of bodies) {
      const chunks = groupDialogue(text);
      expect(chunks.length, `${lesson} ${lang}`).toBeGreaterThan(0);

      // re-joining every chunk (in order) must reproduce the original text
      const joined = chunks.flat().join('\n').replace(/\s+/g, ' ').trim();
      const original = text.replace(/\s+/g, ' ').trim();
      expect(joined, `${lesson} ${lang}`).toBe(original);

      // bubble comfort: at most 2 lines per chunk, and no oversized chunk
      for (const chunk of chunks) {
        expect(chunk.length, `${lesson} ${lang}`).toBeLessThanOrEqual(2);
        const size = chunk.join(' ').length;
        expect(size, `${lesson} ${lang}`).toBeLessThan(230);
      }
    }
  });

  it('pairs short lines and keeps long/list lines alone', () => {
    // two medium sentences (each over the 96-char merge cap) → one chunk of two lines
    const paired = groupDialogue(
      'توی دنیای الکترونیک ما یک پل جادویی داریم که از روی رودخانهٔ بنفش رد میشه! ' +
        'الکترون‌های کوچولو ماشین‌های پرانرژی‌ای هستند که می‌خوان از روی این پل رد بشن!',
    );
    expect(paired).toHaveLength(1);
    expect(paired[0]).toHaveLength(2);

    // the two ON/OFF contrast bullets fit side-by-side in one bubble
    // (each stays a whole line — never merged into one paragraph line)
    const listed = groupDialogue(
      '🟢 وقتی کلید رو روشن (ON) می‌کنید: پل پایین میاد ➔ مدار بسته میشه ➔ چراغ روشن میشه!\n\n🔴 وقتی کلید رو خاموش (OFF) می‌کنید: پل بالا میره ➔ مدار باز میشه ➔ چراغ خاموش میشه!',
    );
    expect(listed).toHaveLength(1);
    expect(listed[0]).toEqual([
      '🟢 وقتی کلید رو روشن (ON) می‌کنید: پل پایین میاد ➔ مدار بسته میشه ➔ چراغ روشن میشه!',
      '🔴 وقتی کلید رو خاموش (OFF) می‌کنید: پل بالا میره ➔ مدار باز میشه ➔ چراغ خاموش میشه!',
    ]);
  });

  it('never returns an empty grouping', () => {
    expect(groupDialogue('')).toEqual([['']]);
    expect(groupDialogue('   ')).toEqual([['']]);
  });
});
