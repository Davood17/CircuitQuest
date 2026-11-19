/**
 * Generates the 5 story illustrations for lesson l0-8
 * («جریان (شدت و تعداد الکترون‌های در حال دویدن)») from the user's English
 * image prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-8-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-7):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the electron runners run toward the LEFT side of the picture (the
 *    RTL journey every lesson picture follows);
 *  - #2: the user's English prompt puts the small brook on the left and the
 *    big river on the right, but their Persian page spec explicitly says
 *    right = small brook, left = big energetic river — we follow the Persian
 *    spec so the comparison reads right-to-left like the page (same policy
 *    as l0-7 #2);
 *  - #4: the voltage hero pushes the runner team toward the LEFT (RTL);
 *  - #5: the "Ampere meter symbol (A)" became an ammeter-style dial WITHOUT
 *    the letter (a letter would bake text) and the "green 'Correct' button"
 *    became a big shiny green checkmark badge; the app's cute teacher ROBOT
 *    was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-8';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: runners cross the finish line toward the LEFT (RTL journey).
    file: '1-race-finish.png',
    prompt:
      'A lively 3D cartoon illustration for kids showing a colorful checkered finish ' +
      'line on a race track inside a glowing electric circuit wire, where a group of ' +
      'cute smiling blue electron characters are running past it toward the left side ' +
      'of the picture, Pixar animation style, bright vivid colors, fun educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: small brook on the RIGHT, big river on the LEFT — the Persian page
    // spec (RTL comparison), opposite of the raw English prompt.
    file: '2-river-brook.png',
    prompt:
      'Cute 3D educational split comparison for children: on the right side a small ' +
      'calm brook with a few dripping water drops, on the left side a wide energetic ' +
      'cartoon river flowing with strong currents and many sparkling drops, Pixar ' +
      'aesthetic, bright colorful layout, ' + NO_TEXT,
  },
  {
    file: '3-ampere-detective.png',
    prompt:
      'Playful 3D cartoon of a friendly detective character wearing a hat, holding a ' +
      'magnifying glass and a stopwatch, counting tiny cute smiling blue electron ' +
      'characters running inside a transparent circuit pipe, Pixar style, bright ' +
      'light effects, ' + NO_TEXT,
  },
  {
    // NOTE: the hero pushes the team toward the LEFT (RTL journey).
    file: '4-voltage-current-team.png',
    prompt:
      'Charming 3D illustration showing a friendly strong superhero with a glowing ' +
      'lightning emblem gently pushing a large team of cheerful running blue electron ' +
      'characters along a circuit track road toward the left side of the picture, ' +
      'showing teamwork between pressure and current flow, Pixar animation style, ' + NO_TEXT,
  },
  {
    // NOTE: ammeter-style dial without the letter A; "Correct button" → green
    // checkmark badge; teacher robot added (same as l0-7 #5).
    file: '5-current-medal.png',
    prompt:
      'Celebratory completion screen for a kids educational science app, featuring a ' +
      'shiny golden trophy topped with a round ammeter-style gauge dial with a ' +
      'lightning mark, floating stars, confetti, a friendly cute robot with big happy ' +
      'eyes celebrating, a big shiny green checkmark badge, gamified children UI, ' +
      'Pixar style, ' + NO_TEXT,
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
