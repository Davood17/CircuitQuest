/**
 * Generates the 5 story illustrations for lesson l0-3 («قوانین ایمنی مهندس کوچولو»)
 * from the user's English image prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-3-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise — burned us on l0-2 #4);
 *  - #2: the safe battery is placed on the RIGHT so the comparison reads
 *    right-to-left like the Persian page;
 *  - #5: "green 'Correct' button" became "big shiny green checkmark badge"
 *    (button would bake English text) and the app's cute teacher ROBOT was
 *    added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-3';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-shield.png',
    prompt:
      'A vibrant 3D cartoon illustration of a shiny golden safety shield badge for kids ' +
      'with a small glowing lightbulb icon in the middle, floating sparkles, Pixar ' +
      'animation style, warm glowing light, clean kid-friendly UI, ' + NO_TEXT,
  },
  {
    // NOTE: battery on the RIGHT side so the safe option reads first in RTL layout.
    file: '2-battery-socket.png',
    prompt:
      'A child-friendly 3D visual comparison: on the right side a cheerful smiling AA ' +
      'battery wearing a superhero cape with a big green checkmark, on the left side a ' +
      'household wall power outlet with a red safety prohibition sign, bright Pixar ' +
      'style, educational illustration for kids, ' + NO_TEXT,
  },
  {
    file: '3-short-circuit.png',
    prompt:
      'Playful 3D cartoon showing two scenarios side by side: left side a cartoon ' +
      'battery getting sweaty and hot connected to a bare wire, right side the same ' +
      'battery happy and smiling connected to a glowing colorful LED light bulb, cute ' +
      'Pixar animation style, ' + NO_TEXT,
  },
  {
    file: '4-tidy-desk.png',
    prompt:
      'A bright and cheerful 3D cartoon of a clean, tidy wooden workbench for a child ' +
      'engineer, with organized colorful electronic components like LEDs and batteries, ' +
      'a small dry towel on the side, sunny room background, Pixar aesthetic, ' + NO_TEXT,
  },
  {
    // NOTE: robot added (robot replaces the teacher), "Correct" button → checkmark badge.
    file: '5-medal-party.png',
    prompt:
      'Celebratory completion UI screen for a kids app, featuring a glowing golden ' +
      'safety emblem medal with a green ribbon, sparkling stars, confetti, a friendly ' +
      'cute robot with big happy eyes celebrating, a big shiny green checkmark badge, ' +
      'cheerful gamified children interface, Pixar style, ' + NO_TEXT,
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
