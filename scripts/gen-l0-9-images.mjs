/**
 * Generates the 5 story illustrations for lesson l0-9
 * («مقاومت (جاده تنگ و باریک)») from the user's English image prompts
 * (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-9-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 … l0-8):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise);
 *  - #1: the electrons run toward the LEFT side of the picture and the
 *    resistor controller stands at the narrow section (RTL journey, like
 *    every lesson picture);
 *  - #2: the user's English prompt puts the water pipe on the left and the
 *    resistor on the right, but their Persian page spec explicitly says
 *    right = the pinched hose, left = the resistor narrowing the electron
 *    passage — we follow the Persian spec so the comparison reads
 *    right-to-left like the page (same policy as l0-7 #2 / l0-8 #2);
 *  - #4: the "glowing Ohm symbol (Ω)" is dropped (a symbol bakes as garbled
 *    text) — the magnifying glass simply hovers over the colorful bands;
 *  - #5: the "trophy with an Ohm symbol (Ω)" became a resistor-shaped trophy
 *    with colorful bands (no letter), the "green 'Correct' checkmark button"
 *    became a big shiny green checkmark badge, and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-9';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    // NOTE: electrons run toward the LEFT; the resistor guards the narrow section.
    file: '1-resistor-guard.png',
    prompt:
      'A vibrant 3D cartoon illustration for kids showing a friendly cute resistor ' +
      'component character with colorful stripes acting like a cheerful traffic ' +
      'controller standing at a narrow section of a glowing circuit wire road, gently ' +
      'slowing down running blue electron characters so they move calmly and in order ' +
      'toward the left side of the picture, Pixar animation style, warm bright colors, ' +
      'fun educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: pinched hose on the RIGHT, resistor on the LEFT — the Persian page
    // spec (RTL comparison), opposite of the raw English prompt.
    file: '2-pipe-resistor.png',
    prompt:
      'Cute 3D educational split screen comparison illustration for children, the ' +
      'picture divided into two halves by a clear vertical white dashed line in the ' +
      'middle: on the right side a flexible garden water hose being squeezed narrow ' +
      'in the middle by a child hand so only a small calm stream comes out, on the ' +
      'left side a striped electronic resistor component narrowing the passage for ' +
      'cute blue electron characters inside a transparent wire, only a few calm ' +
      'electrons pass through, Pixar aesthetic, bright colorful kid-friendly layout, ' + NO_TEXT,
  },
  {
    // NOTE: the electron surge flows toward the LEFT (RTL); the hero shields
    // the LED standing to the LEFT of the surge.
    file: '3-led-bodyguard.png',
    prompt:
      'Playful 3D cartoon showing a brave superhero resistor character with a striped ' +
      'body and a big friendly shield standing protectively in front of a delicate ' +
      'smiling LED light bulb on its left side, shielding it safely from a big rushing ' +
      'surge of blue electron energy coming from the right side of the picture, Pixar ' +
      'animation style, glowing effects, vivid colors, ' + NO_TEXT,
  },
  {
    // NOTE: no Ohm symbol (a symbol would bake as garbled text); the magnifying
    // glass simply hovers over the colorful bands.
    file: '4-color-bands.png',
    prompt:
      'Charming 3D cartoon rendering of a cute happy resistor character with a rounded ' +
      'beige body wearing colorful striped bands (red, red, brown, gold), holding a ' +
      'big magnifying glass over its own colorful bands, curious detective pose, ' +
      'Pixar style, friendly educational design, ' + NO_TEXT,
  },
  {
    // NOTE: resistor-shaped trophy with color bands, no Ω letter; "Correct
    // button" → green checkmark badge; teacher robot added (same as l0-7 #5).
    file: '5-resistance-medal.png',
    prompt:
      'Celebratory completion screen for a kids educational science app, featuring a ' +
      'shiny golden trophy shaped like a cylindrical resistor component with colorful ' +
      'bands, floating stars, confetti, a friendly cute robot with big happy eyes ' +
      'celebrating, a big shiny green checkmark badge, gamified children UI, Pixar ' +
      'style, ' + NO_TEXT,
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
