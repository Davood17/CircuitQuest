/**
 * Regenerates 2 flawed illustrations of lesson l0-9 (same policy as the
 * l0-5…l0-8 fixes scripts). First versions kept in scripts/img-backups/l0-9/.
 *
 *  - #4: the colorful bands were cropped at the bottom of the frame — the
 *    whole striped resistor body must be visible in the middle of the frame.
 *  - #5: the model ignored the resistor-shaped trophy (plain cup + extra UI
 *    arrow buttons) — the trophy itself must BE a cute resistor with bands.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-9';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-9';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const FIXES = [
  {
    file: '4-color-bands.png',
    prompt:
      'Charming 3D cartoon rendering of one single cute happy resistor component ' +
      'character: a small rounded beige cylinder standing upright in the middle of the ' +
      'frame, fully visible from top to bottom, with a wire coming out of each end and ' +
      'FOUR wide colorful horizontal stripes painted around its belly (red, red, brown, ' +
      'gold), big friendly eyes on its upper body, holding a magnifying glass up to its ' +
      'own colorful stripes like a proud detective, soft simple background, Pixar ' +
      'style, friendly educational design, ' + NO_TEXT,
  },
  {
    file: '5-resistance-medal.png',
    prompt:
      'Celebratory completion screen for a kids educational science app: the golden ' +
      'trophy itself is shaped like a cute cylindrical resistor component with a beige ' +
      'body, four wide colorful stripes (red, red, brown, gold) around its middle, two ' +
      'little wire legs, and a smiling face, standing on a golden base; around it ' +
      'floating stars, confetti, a friendly cute white robot with big happy eyes ' +
      'celebrating, and one big shiny green checkmark badge; simple bright background, ' +
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

fs.mkdirSync(BACKUP_DIR, { recursive: true });
for (const spec of FIXES) {
  const out = path.join(OUT_DIR, spec.file);
  const bak = path.join(BACKUP_DIR, spec.file);
  if (fs.existsSync(out) && !fs.existsSync(bak)) fs.copyFileSync(out, bak);
  generate(spec);
}
