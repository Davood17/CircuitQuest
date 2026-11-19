/**
 * Generates the 5 story illustrations for lesson l0-10
 * («باتری چیست؟ (ایستگاه انرژی)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-10-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-9):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the tiny blue electrons stand to the LEFT of the battery receiving
 *    its energy (RTL journey, like every lesson picture);
 *  - #3: the "(+)" / "(-)" labels are dropped (labels bake as garbled text,
 *    same policy as l0-9 #4) — the raised bumpy top and the flat wide bottom
 *    alone distinguish the terminals; the +/− labels live in our SVG scene;
 *  - #4: "9V box battery" became "sturdy rectangular box battery" (no digits);
 *  - #5: the "green 'Correct' checkmark button" became a big shiny green
 *    checkmark badge and the app's cute teacher ROBOT was added, since the
 *    robot replaced the teacher everywhere (same as l0-7/l0-8/l0-9 #5).
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-10';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: the little electrons receive the energy on the LEFT side of the battery (RTL).
    file: '1-battery-backpack.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing a friendly cheerful battery ' +
      'character wearing a glowing backpack filled with golden energy stars, handing ' +
      'glowing golden energy star treats to cute tiny blue electron characters standing ' +
      'on the left side of the picture ready to run, Pixar animation style, warm bright ' +
      'lighting, fun educational UI, ' + NO_TEXT,
  },
  {
    file: '2-battery-factory.png',
    prompt:
      'Cute 3D educational cutaway view of a cartoon battery showing its magical inner ' +
      'chemical factory transforming colorful liquid droplets into glowing blue electric ' +
      'energy sparks, the transparent shell revealing the tiny magical factory inside, ' +
      'Pixar aesthetic, bright colorful kid-friendly layout, ' + NO_TEXT,
  },
  {
    // NOTE: no (+)/(-) labels — a raised bumpy top and a flat wide bottom only.
    file: '3-battery-terminals.png',
    prompt:
      'Playful 3D cartoon of a tall smiling battery character with a clearly raised small ' +
      'bumpy top end and a completely flat wide bottom end, with a row of cute blue ' +
      'electron runner characters lining up at the flat bottom end ready to start their ' +
      'race along a glowing wire, Pixar style, vivid colors, ' + NO_TEXT,
  },
  {
    // NOTE: no "9V" digits — a sturdy rectangular box battery instead.
    file: '4-battery-family.png',
    prompt:
      'Charming 3D cartoon group photo of a happy battery family standing together: a ' +
      'tall slim pencil battery, a tiny flat round coin cell battery, and a sturdy ' +
      'rectangular box battery, all smiling together, Pixar animation style, cozy ' +
      'friendly atmosphere, ' + NO_TEXT,
  },
  {
    // NOTE: "Correct button" → green checkmark badge; teacher robot added (same as l0-7/8/9 #5).
    file: '5-battery-medal.png',
    prompt:
      'Celebratory completion screen for a kids educational science app, featuring a ' +
      'shiny golden trophy shaped like a glowing battery with a green ribbon, sparkling ' +
      'stars, confetti, a friendly cute robot with big happy eyes celebrating, a big ' +
      'shiny green checkmark badge, gamified children UI, Pixar style, ' + NO_TEXT,
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
