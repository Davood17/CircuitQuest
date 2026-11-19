/**
 * Round 2 for lesson l0-14 images #2 and #3 (round 1 rejected):
 *  - #2 was a giant "+" sculpture instead of the schematic symbol →
 *    regenerating with an explicitly constrained composition: two short
 *    VERTICAL PARALLEL STROKES (taller-thin + shorter-thick) next to a
 *    realistic AA battery, drawn like a simple line diagram on paper.
 *  - #3 was two toys (button + triangle ring) without the open-bridge lever,
 *    the perpendicular line or the light arrows → regenerating with explicit
 *    "line-drawing on white paper" framing.
 *
 * Usage:  bun scripts/gen-l0-14-fixes.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-14';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '2-battery-wire-symbol.png',
    prompt:
      'Cute 3D educational comparison for kids, clean split layout on a soft pastel background: ' +
      'on the right a realistic cartoon AA battery standing upright with its rounded nub on top; ' +
      'on the left the electrical schematic symbol of a battery drawn like a simple flat line diagram: ' +
      'two short vertical parallel strokes side by side with a small gap between them, ' +
      'the first stroke taller and thin, the second stroke shorter and noticeably thicker, ' +
      'just like in an electronics textbook diagram, Pixar aesthetic, bright cheerful lighting, ' + NO_TEXT,
  },
  {
    file: '3-switch-led-symbol.png',
    prompt:
      'Playful 3D kids illustration of two electrical schematic symbols drawn as bold rounded 3D lines on a soft pastel background: ' +
      'on the right the switch symbol: a horizontal wire that breaks in the middle, with a small tilted lever line hovering open above the gap like a tiny open drawbridge; ' +
      'on the left the LED symbol: a small triangle outline whose tip touches a short straight perpendicular line, with two tiny glowing arrows flying away from the triangle, ' +
      'soft glow effects, vivid colors, Pixar style, ' + NO_TEXT,
  },
];

function generate({ file, prompt }, attempt = 1) {
  const out = path.join(OUT_DIR, file);
  const res = spawnSync('z-ai', ['image', '--prompt', prompt, '--output', out, '--size', SIZE], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (res.status === 0 && fs.existsSync(out) && fs.statSync(out).size > 10_000) {
    console.log(`OK  ${file} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
    return true;
  }
  const err = (res.stderr?.toString() || res.stdout?.toString() || 'unknown').trim().split('\n').pop();
  if (attempt < 3) {
    console.warn(`..  ${file} attempt ${attempt} failed (${err}) — retrying`);
    return generate({ file, prompt }, attempt + 1);
  }
  console.error(`ERR ${file} failed after 3 attempts: ${err}`);
  return false;
}

let ok = true;
for (const spec of IMAGES) ok = generate(spec) && ok;
process.exit(ok ? 0 : 1);
