/**
 * Generates the 5 story illustrations for lesson l0-12
 * («ال‌دی‌دی (LED) چیست؟ (قهرمان نور)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-12-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-11):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #2: the "(+)"/"(-)" text marks on the legs were dropped (text does not
 *    bake well) — the long leg / short leg and the one-way arrows stay, and
 *    our own SVG scene draws the +/− labels;
 *  - #5: the "green 'Correct' checkmark button" became a big shiny green
 *    checkmark badge and the app's cute teacher ROBOT was added, since the
 *    robot replaced the teacher everywhere (same as l0-7 … l0-11 #5).
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-12';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-led-hero.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing a cute smiling LED light bulb ' +
      'character floating magically while sparkling with colorful rainbow light rays, ' +
      'Pixar animation style, warm glowing background, fun educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: the "(+)"/"(-)" text marks dropped — long leg vs short leg + arrows only.
    file: '2-led-legs.png',
    prompt:
      'Cute 3D educational rendering of a cartoon LED bulb character with one clearly long ' +
      'metal leg and one clearly short metal leg, with tiny glowing blue arrows showing the ' +
      'one-way direction of the electron flow, Pixar aesthetic, bright colorful layout, ' + NO_TEXT,
  },
  {
    file: '3-led-rainbow.png',
    prompt:
      'Playful 3D cartoon group illustration of colorful LED bulb characters in red, green, ' +
      'blue and yellow glowing together like a friendly rainbow team, Pixar style, vivid ' +
      'bright lighting effects, ' + NO_TEXT,
  },
  {
    file: '4-led-resistor.png',
    prompt:
      'Charming 3D cartoon illustration of a superhero resistor standing beside a glowing ' +
      'happy LED light bulb, holding a tiny protective energy shield, Pixar style, friendly ' +
      'educational design, ' + NO_TEXT,
  },
  {
    // NOTE: "Correct button" → green checkmark badge; teacher robot added (same as l0-7…l0-11 #5).
    file: '5-led-medal.png',
    prompt:
      'Celebratory completion screen for a kids science app, featuring a shiny golden trophy ' +
      'shaped like a glowing colorful LED bulb, floating stars, confetti, a friendly cute ' +
      'robot with big happy eyes celebrating, a big shiny green checkmark badge, gamified ' +
      'children UI, Pixar style, ' + NO_TEXT,
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
