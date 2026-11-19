/**
 * Generates the 5 story illustrations for lesson l0-7
 * («ولتاژ (فشار و انرژی برق)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-7-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-6):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the "superhero named Voltage" gets NO name tag (a name bakes text);
 *    the hero stands BEHIND the electrons pushing them toward the LEFT end of
 *    the track (RTL journey, like every lesson picture);
 *  - #2: the water-tower side is on the RIGHT and the battery side on the
 *    LEFT so the comparison reads right-to-left like the Persian page;
 *  - #3: the batteries are NOT "labeled 1.5V" (no text) — the SVG scene shows
 *    the volt numbers itself; the AA battery stands on the RIGHT (read first
 *    in RTL) and the square 9 V with the superhero belt on the LEFT;
 *  - #5: the "green checkmark button" became "a big shiny green checkmark
 *    badge" (a button would bake English text) and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-7';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: no name tag on the hero; pushing the electrons to the LEFT (RTL).
    file: '1-voltage-hero.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing a friendly strong superhero ' +
      'character with a glowing lightning emblem on his chest, smiling and pushing small ' +
      'cute blue electron characters forward along a glowing circuit track road, the ' +
      'hero standing behind the electrons pushing them toward the left side of the ' +
      'picture, Pixar animation style, warm bright colors, fun educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: water tower on the RIGHT, battery on the LEFT — RTL comparison.
    file: '2-water-battery.png',
    prompt:
      'Cute 3D educational comparison illustration for children: on the right side a ' +
      'water tank on a tall rooftop tower spraying water with high pressure from a pipe, ' +
      'on the left side a happy battery pushing tiny blue electron characters through a ' +
      'wire with high force toward a glowing light bulb, Pixar aesthetic, bright ' +
      'colorful layout, ' + NO_TEXT,
  },
  {
    // NOTE: no voltage labels (no text); AA on the RIGHT (first in RTL),
    // square 9V with superhero belt on the LEFT.
    file: '3-battery-duo.png',
    prompt:
      'Playful 3D cartoon of a small friendly AA cylinder battery with a cute smiling ' +
      'face standing on the right side, next to a strong tall square 9V block battery ' +
      'wearing a yellow superhero belt with a lightning buckle and a proud smile on the ' +
      'left side, glowing energy aura around both batteries, Pixar style, vivid colors, ' + NO_TEXT,
  },
  {
    file: '4-happy-led.png',
    prompt:
      'Charming 3D cartoon rendering of a happy glowing LED light bulb with a joyful ' +
      'smiling face, glowing warmly and brightly with a golden halo, powered safely by ' +
      'a small friendly battery, Pixar animation style, cozy friendly atmosphere, ' + NO_TEXT,
  },
  {
    // NOTE: "checkmark button" → checkmark badge; teacher robot added.
    file: '5-voltage-medal.png',
    prompt:
      'Celebratory completion screen for a kids educational science app, featuring a ' +
      'shiny golden trophy shaped like a lightning bolt on a pressure gauge, floating ' +
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
