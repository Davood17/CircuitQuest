/**
 * Generates the 5 story illustrations for lesson l0-11
 * («سیم چیست؟ (بزرگراه الکترون‌ها)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-11-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-10):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1 and #2: the electron cars / sliding electrons travel toward the LEFT
 *    side of the picture (RTL journey, like every lesson picture);
 *  - #3: the "green safety checkmark icon" is kept as a plain checkmark shape
 *    (a symbol, not text — same policy as the green checkmark badges);
 *  - #5: the "green 'Correct' checkmark button" became a big shiny green
 *    checkmark badge and the app's cute teacher ROBOT was added, since the
 *    robot replaced the teacher everywhere (same as l0-7 … l0-10 #5).
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-11';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: the electron cars drive toward the LEFT side of the picture (RTL).
    file: '1-wire-highway.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing a colorful futuristic glowing ' +
      'highway with clear lanes inside a transparent wire tube, where tiny smiling blue ' +
      'electron characters are driving cute toy cars along the lanes toward the left side ' +
      'of the picture, Pixar animation style, warm glowing lights, fun educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: the electrons slide toward the LEFT (RTL).
    file: '2-copper-heart.png',
    prompt:
      'Cute 3D educational cutaway view of an electric wire, showing shiny bright reddish ' +
      'copper strands inside like a bundle of gleaming slides, with adorable tiny blue ' +
      'electron characters sliding down the copper strands happily like a playground slide ' +
      'toward the left side of the picture, Pixar aesthetic, bright vivid colors, ' + NO_TEXT,
  },
  {
    // NOTE: checkmark kept as a plain green check shape (a symbol, not text).
    file: '3-safety-jacket.png',
    prompt:
      'Playful 3D cartoon showing a happy copper wire character wearing a cute bright red ' +
      'plastic jacket with a friendly smiling face like cozy safety armor, while a small ' +
      'child hand safely and comfortably holds the wire, a big shiny green checkmark badge ' +
      'floating beside them, Pixar animation style, clear educational visual, ' + NO_TEXT,
  },
  {
    file: '4-clip-jumper.png',
    prompt:
      'Charming 3D cartoon group illustration of friendly colorful wire characters: ' +
      'alligator clip wires with playful smiling crocodile jaw heads wide open, next to ' +
      'straight colorful jumper wires with pointy metal tips standing in a small ' +
      'breadboard, Pixar style, vivid colors, educational toys concept, ' + NO_TEXT,
  },
  {
    // NOTE: "Correct button" → green checkmark badge; teacher robot added (same as l0-7…l0-10 #5).
    file: '5-wire-medal.png',
    prompt:
      'Celebratory completion screen for a kids science app, featuring a shiny golden ' +
      'trophy decorated with a loop of bright copper wire and small lightning bolt shapes, ' +
      'floating stars, confetti, a friendly cute robot with big happy eyes celebrating, a ' +
      'big shiny green checkmark badge, gamified children UI, Pixar style, ' + NO_TEXT,
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
