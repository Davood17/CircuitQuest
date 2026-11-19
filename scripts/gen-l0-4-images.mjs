/**
 * Generates the 5 story illustrations for lesson l0-4
 * («مدار چیست؟ (جاده جادویی و حلقه بسته)») from the user's English image
 * prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-4-images.mjs   (FORCE=1 to regenerate)
 *
 * Documented deviations (same policy as l0-2 / l0-3):
 *  - a short "no text" tail is appended to every prompt (models bake garbled
 *    typography otherwise — burned us on l0-2 #4);
 *  - #2 and #3: the battery sits on the RIGHT of the loop so the circuit
 *    reads right-to-left like the Persian page (and like the interactive
 *    SVG strip below the picture);
 *  - #4: the battery station is placed on the right (first in RTL order);
 *  - #5: "a green checkmark button" became "a big shiny green checkmark
 *    badge" (a button would bake English text) and the app's cute teacher
 *    ROBOT was added, since the robot replaced the teacher everywhere.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-4';
const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-racetrack.png',
    prompt:
      'A vibrant 3D cartoon illustration of a circular racetrack path shaped like a ' +
      'simple electric circuit, where cute smiling blue electron characters dressed as ' +
      'racecar drivers are running around the closed loop, a little checkered start flag ' +
      'on the side of the track, Pixar animation style, warm glowing colors, ' +
      'kid-friendly educational graphic, ' + NO_TEXT,
  },
  {
    // NOTE: battery on the RIGHT side of the loop so the flow reads RTL.
    file: '2-closed-circuit.png',
    prompt:
      'Colorful 3D cartoon rendering of a complete closed electric circuit, showing a ' +
      'smiling battery on the right side, transparent wires with glowing blue electrons ' +
      'flowing continuously around the connected loop, and a bright happy glowing LED ' +
      'bulb at the top, clear connected loop with no gaps, Pixar style, cheerful ' +
      'educational UI, ' + NO_TEXT,
  },
  {
    // NOTE: battery on the right, the break/gap in the upper part of the loop.
    file: '3-open-circuit.png',
    prompt:
      'Playful 3D cartoon illustration of an open electric circuit, showing a gap and ' +
      'break in the upper part of the wire loop where cute blue electron characters are ' +
      'stopped and looking confused, near a drawn-up bridge icon, a smiling battery on ' +
      'the right side, and an unlit sleeping LED bulb with closed eyes, bright Pixar ' +
      'style, clear contrast with a closed circuit, ' + NO_TEXT,
  },
  {
    // NOTE: battery station on the right (first station in RTL reading order).
    file: '4-stations-map.png',
    prompt:
      'Interactive kids map style 3D illustration showing four friendly circuit ' +
      'stations connected in a colorful loop: a cute smiling battery station on the ' +
      'right, a copper wire road, a traffic-light switch gate, and a glowing LED lamp ' +
      'house, fantasy cartoon map for children, cute cartoon vector style for ' +
      'elementary education, ' + NO_TEXT,
  },
  {
    // NOTE: robot added (robot replaces the teacher), "Correct button" → checkmark badge.
    file: '5-circuit-trophy.png',
    prompt:
      'Celebratory quiz screen for a children\u2019s learning app, featuring a glowing ' +
      'golden trophy shaped like a closed circuit loop, sparkling stars, confetti, a ' +
      'friendly cute robot with big happy eyes celebrating, a big shiny green checkmark ' +
      'badge, bright gamified interface, Pixar style, ' + NO_TEXT,
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
