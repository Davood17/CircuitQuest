/**
 * Generates the 5 story illustrations for lesson l0-14
 * («نقشه و نمادهای مدار (زبان رازآلود مهندسان)») from the user's English
 * image prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-14-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-13):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #2: the (+)/(-) pole letters are not requested on the picture (text would
 *    bake garbled) — the long-thin / short-thick line contrast stays and our
 *    own SVG scene draws the +/− badges;
 *  - #5: the green 'Correct' button stayed as a plain green checkmark (a
 *    symbol, not text — same as l0-7 … l0-13 #5) and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-14';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-treasure-map.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing an old magical treasure map scroll transforming into a clear electronic circuit schematic diagram with glowing simple symbols, ' +
      'Pixar animation style, warm golden sunlight, kid-friendly educational graphic, ' + NO_TEXT,
  },
  {
    // NOTE: no (+)/(-) letters requested — only the long-thin vs short-thick line contrast.
    file: '2-battery-wire-symbol.png',
    prompt:
      'Cute 3D educational rendering comparing a realistic cartoon AA battery next to its clean schematic symbol drawn as one long thin line and one short thick line, ' +
      'Pixar aesthetic, bright cheerful layout, ' + NO_TEXT,
  },
  {
    file: '3-switch-led-symbol.png',
    prompt:
      'Playful 3D cartoon illustration showing the circuit symbol for a switch shaped like an open tilted bridge and an LED symbol shaped like a triangle with a line and two tiny glowing light arrows shooting off, ' +
      'Pixar style, glowing effects, vivid colors, ' + NO_TEXT,
  },
  {
    file: '4-trace-map.png',
    prompt:
      'Charming 3D cartoon rendering of a child engineer smiling while tracing a glowing blue circuit schematic diagram on a glowing tablet screen, ' +
      'Pixar style, friendly educational design, ' + NO_TEXT,
  },
  {
    // NOTE: teacher robot added; green checkmark kept as a symbol (same as l0-7…l0-13 #5).
    file: '5-symbols-medal.png',
    prompt:
      'Celebratory completion screen for a kids science app, featuring a shiny golden trophy shaped like a glowing blueprint scroll with circuit symbols, ' +
      'floating stars, confetti, a green checkmark badge, a friendly cute robot with big happy eyes celebrating, ' +
      'gamified children UI, Pixar style, ' + NO_TEXT,
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

fs.mkdirSync(OUT_DIR, { recursive: true });
let ok = true;
for (const spec of IMAGES) {
  const out = path.join(OUT_DIR, spec.file);
  if (fs.existsSync(out) && fs.statSync(out).size > 10_000 && process.env.FORCE !== '1') {
    console.log(`SKIP ${spec.file} already exists (FORCE=1 to regenerate)`);
    continue;
  }
  ok = generate(spec) && ok;
}
process.exit(ok ? 0 : 1);
