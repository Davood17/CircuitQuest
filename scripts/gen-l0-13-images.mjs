/**
 * Generates the 5 story illustrations for lesson l0-13
 * («کلید چیست؟ (پلیس راهنما)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-13-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-12):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the text on the police officer's green 'GO' sign was dropped (the
 *    paddle stays green — our own SVG scene draws the sign symbols);
 *  - #5: the "green checkmark ribbon" stayed (a checkmark is a symbol, not
 *    text — same as l0-7 … l0-12 #5) and the app's cute teacher ROBOT was
 *    added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-13';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: the 'GO' lettering on the sign dropped — a plain green paddle instead.
    file: '1-switch-police.png',
    prompt:
      "A vibrant 3D cartoon illustration for kids showing a friendly switch character dressed as a smiling traffic police officer holding a green blank paddle sign " +
      'inside an electric circuit, with cute tiny blue electron characters eagerly waiting to run, ' +
      'Pixar animation style, warm glowing colors, fun educational UI, ' + NO_TEXT,
  },
  {
    file: '2-switch-bridge.png',
    prompt:
      'Cute 3D educational rendering showing the inside mechanism of a cartoon light switch: ' +
      'when pressed down, a metal bridge closes the gap allowing glowing electrons to flow to a happy lit LED bulb, ' +
      'Pixar aesthetic, bright colorful layout, ' + NO_TEXT,
  },
  {
    file: '3-switch-family.png',
    prompt:
      'Playful 3D cartoon group photo of different switch characters: a rocker switch, a push button, and a sliding switch, ' +
      'all with friendly smiling faces, Pixar style, vivid bright lighting effects, ' + NO_TEXT,
  },
  {
    file: '4-switch-position.png',
    prompt:
      'Charming 3D cartoon illustration of a child inserting a toggle switch into a circuit loop, ' +
      'showing how the switch controls the entire circuit from any spot along the wire road, ' +
      'Pixar style, friendly educational design, ' + NO_TEXT,
  },
  {
    // NOTE: teacher robot added; checkmark kept as a symbol (same as l0-7…l0-12 #5).
    file: '5-switch-medal.png',
    prompt:
      'Celebratory completion screen for a kids science app, featuring a shiny golden trophy shaped like a glowing light switch with a green checkmark ribbon, ' +
      'floating stars, confetti, a friendly cute robot with big happy eyes celebrating, ' +
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
