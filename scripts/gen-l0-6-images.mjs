/**
 * Generates the 5 story illustrations for lesson l0-6
 * («رسانا و عایق (کدام وسایل برق را رد می‌کنند؟)») from the user's English
 * image prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-6-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 / l0-3 / l0-4 / l0-5):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the metallic conductor hero stands on the RIGHT and the rubber
 *    shield guard on the LEFT, so the pair reads right-to-left like the
 *    Persian page;
 *  - #2: the electrons run from the right end of the copper tube to the
 *    left end (RTL journey);
 *  - #5: the "green checkmark button" became "a big shiny green checkmark
 *    badge" (a button would bake English text) and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-6';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: conductor hero on the RIGHT (read first in RTL), guard on the LEFT.
    file: '1-conductor-team.png',
    prompt:
      'A bright 3D cartoon illustration for a children\u2019s educational app showing two ' +
      'friendly mascot characters standing side by side: a shiny metallic superhero ' +
      'holding a glowing wire standing on the right side, and a cute rubber shield ' +
      'guard character holding a safety shield standing on the left side, Pixar ' +
      'animation style, warm glowing colors, kid-friendly layout, ' + NO_TEXT,
  },
  {
    // NOTE: electrons run from the right end to the left end — RTL journey.
    file: '2-copper-slide.png',
    prompt:
      'Playful 3D cartoon illustration of cute tiny blue electron characters happily ' +
      'sliding and running through a shiny copper wire tube like a futuristic water ' +
      'slide, the electrons moving from the right end of the tube toward the left end, ' +
      'Pixar style, clear transparent view, glowing effects, vibrant bright colors, ' + NO_TEXT,
  },
  {
    file: '3-plastic-raincoat.png',
    prompt:
      'Cute 3D cartoon rendering showing a copper electric wire wearing a colorful ' +
      'protective plastic raincoat, with smiling electron characters safely running ' +
      'inside while a child\u2019s hand safely touches the outside plastic jacket, ' +
      'Pixar aesthetic, warm kid-friendly colors, ' + NO_TEXT,
  },
  {
    file: '4-material-lab.png',
    prompt:
      'Interactive science experiment station for kids in 3D cartoon style, showing ' +
      'an open test circuit on a wooden desk with a glowing LED light bulb, where a ' +
      'shiny golden metal key closes the circuit making the bulb light up, and a ' +
      'wooden pencil lying nearby leaves it unlit, bright Pixar style, cheerful ' +
      'colors, ' + NO_TEXT,
  },
  {
    // NOTE: robot added (robot replaces the teacher), "green checkmark button" → checkmark badge.
    file: '5-material-medal.png',
    prompt:
      'Celebratory completion screen for a kids learning app, featuring a shiny ' +
      'golden medal trophy with a shield and lightning bolt emblem, sparkling stars, ' +
      'confetti, a friendly cute robot with big happy eyes celebrating, a big shiny ' +
      'green checkmark badge, gamified children UI, Pixar style, ' + NO_TEXT,
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
