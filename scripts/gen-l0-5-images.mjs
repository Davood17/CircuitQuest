/**
 * Generates the 5 story illustrations for lesson l0-5
 * («مدار باز و مدار بسته (پل جاده)») from the user's English image
 * prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-5-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 / l0-3 / l0-4):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise — burned us on l0-2 #4);
 *  - #1/#2: the electron cars queue on the RIGHT and cross toward the LEFT so
 *    the journey reads right-to-left like the Persian page;
 *  - #5: the "green 'Correct' button" became "a big shiny green checkmark
 *    badge" (a button would bake English text) and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-5';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-drawbridge.png',
    prompt:
      'A charming 3D cartoon illustration for kids showing a colorful toy drawbridge ' +
      'over a glowing stylized purple river, the drawbridge raised open, small cute ' +
      'blue electron characters driving tiny toy cars lined up and waiting on the ' +
      'right side of the river, Pixar animation style, warm glowing sunlight, ' +
      'cheerful and friendly interface, ' + NO_TEXT,
  },
  {
    // NOTE: cars cross from the right (start) to the left (LED home) — RTL journey.
    file: '2-bridge-closed.png',
    prompt:
      'Vibrant 3D cartoon showing a toy drawbridge fully lowered and connected over a ' +
      'river, a line of smiling blue electron car characters driving across safely ' +
      'from the right side toward a large glowing happy LED light bulb waiting on the ' +
      'left side, bright green safety indicator light, Pixar style, clear educational ' +
      'graphic for kids, ' + NO_TEXT,
  },
  {
    file: '3-bridge-open.png',
    prompt:
      'Playful 3D cartoon rendering of a toy drawbridge raised open with a gap in the ' +
      'middle of the road, cute blue electron car characters stopped on the right ' +
      'side holding tiny red stop signs, and a sleeping unlit LED light bulb with ' +
      'closed eyes on the left in the background, Pixar animation style, clear visual ' +
      'contrast with a closed circuit, ' + NO_TEXT,
  },
  {
    // NOTE: glowing bulb on the RIGHT (the ON result the child reads first in RTL),
    // dark bulb on the left.
    file: '4-switch-keeper.png',
    prompt:
      'Cute 3D illustration of a friendly cartoon light switch character dressed as a ' +
      'bridge conductor with a little conductor cap, standing beside a toy circuit ' +
      'with a glowing bright bulb on the right side and a dark sleeping bulb on the ' +
      'left side, Pixar style, colorful and simple educational interface, ' + NO_TEXT,
  },
  {
    // NOTE: robot added (robot replaces the teacher), "Correct button" → checkmark badge.
    file: '5-bridge-trophy.png',
    prompt:
      'Celebratory completion screen for a kids science app, featuring a glowing ' +
      'golden trophy shaped like a bridge with a glowing lightbulb on top, floating ' +
      'stars, confetti, a friendly cute robot with big happy eyes celebrating, a big ' +
      'shiny green checkmark badge, cheerful gamified UI, Pixar style, ' + NO_TEXT,
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
