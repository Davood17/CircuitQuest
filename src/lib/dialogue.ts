/**
 * Robot-teacher dialogue splitting.
 *
 * The robot speaks in SHORT lines. The bubble shows a small GROUP of lines at
 * a time (usually two) — they appear at once with a playful pop, and the child
 * taps for the next group. Lines are split from the ORIGINAL script at
 * sentence / paragraph boundaries only — never a character changed.
 */

/** soft cap: merge short neighbours, never let a "line" become a paragraph again */
const SOFT_MAX = 96;

/** a block that starts like a list item ("1. …" / "۱. …" / "🧼 …") stays one line */
const LIST_START = /^\s*([0-9\u06f0-\u06f9]+[.،)\-]|[•–—*]|\p{Extended_Pictographic})/u;

/** sentence enders across fa/en: . ! ? ؟ ؛ … */
const SENTENCE_END = /(?<=[.!?؟؛…])\s+/;

/**
 * Split the robot's script into short dialogue lines.
 * Verbatim guarantee: we only ever split at whitespace that FOLLOWS a sentence
 * ender (or at hard line breaks) — the characters themselves are untouched.
 */
export function splitDialogue(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\n+/)) {
    const block = raw.trim();
    if (!block) continue;

    // numbered / emoji list items are already kid-sized — keep them whole
    if (LIST_START.test(block)) {
      out.push(block);
      continue;
    }

    const sentences = block.split(SENTENCE_END).filter(Boolean);
    let buf = '';
    for (const s of sentences) {
      if (buf && buf.length + s.length + 1 > SOFT_MAX) {
        out.push(buf);
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) out.push(buf);
  }
  return out.length ? out : [text.trim()];
}

/**
 * Group the short dialogue lines into bubble-sized chunks: up to `per` lines
 * per chunk, as long as the chunk stays comfortably readable (soft char cap).
 * Verbatim guarantee: the lines themselves are untouched — only the grouping
 * changes, so joining every chunk's lines still reproduces the original text.
 */
export function groupDialogue(text: string, per = 2, maxChars = 170): string[][] {
  const lines = splitDialogue(text);
  const chunks: string[][] = [];
  let cur: string[] = [];
  let len = 0;
  for (const line of lines) {
    if (cur.length > 0 && (cur.length >= per || len + line.length + 1 > maxChars)) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(line);
    len += line.length + (len > 0 ? 1 : 0);
  }
  if (cur.length > 0) chunks.push(cur);
  return chunks.length > 0 ? chunks : [[text.trim()]];
}
