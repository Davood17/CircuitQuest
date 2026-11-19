/**
 * Targeted re-generation of the two defective l0-5 illustrations:
 *  - #1 drawbridge: cars were floating/driving ON the river and the deck was
 *    not raised → force "deck raised up with a gap", "cars waiting in line on
 *    the asphalt road on the dry riverbank, not on the water";
 *  - #3 bridge-open: the stop sign had baked English "STOP" text → force
 *    "completely blank red octagon signs, no letters at all".
 * Old versions are backed up to scripts/img-backups/l0-5/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-5';
const BACKUP = '/home/z/my-project/scripts/img-backups/l0-5';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const FIXES = [
  {
    file: '3-bridge-open.png',
    prompt:
      'Adorable soft Pixar-style 3D cartoon for a children picture book, bright cheerful ' +
      'pastel colors, sky-blue background with fluffy clouds and green grass hills: a ' +
      'cute little toy drawbridge deck raised straight up like an open gate leaving a ' +
      'clean empty GAP in the middle of a friendly cartoon road. Three round chubby ' +
      'cute blue electron toy cars with big expressive sad cartoon eyes and mouths ' +
      'stopped in a queue on the right side of the gap, each holding a tiny completely ' +
      'blank plain red octagon sign with no letters at all. Far on the left side a big ' +
      'cute LED light bulb character with a face, switched OFF: pale gray glass, closed ' +
      'sleeping eyes, small sad mouth, no glow at all. Same cute toy style as a Pixar ' +
      'kids animation still, ' + NO_TEXT,
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

fs.mkdirSync(BACKUP, { recursive: true });
let ok = true;
for (const spec of FIXES) {
  const out = path.join(OUT_DIR, spec.file);
  if (fs.existsSync(out)) {
    fs.copyFileSync(out, path.join(BACKUP, spec.file));
  }
  ok = generate(spec) && ok;
}
process.exit(ok ? 0 : 1);
