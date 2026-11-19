/**
 * Regenerates 2 flawed illustrations of lesson l0-8 (same policy as the
 * l0-5/l0-6/l0-7 fixes scripts). First versions kept in scripts/img-backups/l0-8/.
 *
 *  - #2: the model ignored the "split comparison" and added two puppies —
 *    the prompt now says SPLIT SCREEN with a vertical divider and NO animals.
 *  - #4: the voltage hero must be THE SAME character as lesson l0-7's hero
 *    (blue suit, red cape, yellow lightning emblem) with a friendly smile,
 *    and the electron team runs toward the LEFT (RTL journey).
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-8';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-8';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';
const NO_ANIMALS = 'No animals at all: no dogs, no puppies, no pets, only the water and the landscape';

const FIXES = [
  {
    file: '2-river-brook.png',
    prompt:
      'Cute 3D educational SPLIT SCREEN comparison illustration for children, the picture ' +
      'divided into two halves by a clear vertical white dashed line in the middle: the ' +
      'RIGHT half shows a small narrow calm brook with only a few tiny water drops ' +
      'trickling over pebbles, the LEFT half shows a very wide rushing cartoon river with ' +
      'lots of sparkling blue water flowing fast with small waves, same landscape style on ' +
      'both sides, Pixar aesthetic, bright colorful kid-friendly layout, ' + NO_ANIMALS + ', ' + NO_TEXT,
  },
  {
    file: '4-voltage-current-team.png',
    prompt:
      'Charming 3D cartoon illustration for kids: the exact same friendly superhero as a ' +
      'classic voltage mascot — a strong round cartoon hero wearing a BLUE superhero suit ' +
      'with a red cape and a big yellow lightning bolt emblem on his chest, smiling ' +
      'kindly — standing behind a large team of cute smiling blue electron characters, ' +
      'gently pushing them forward so the whole team runs together toward the LEFT side ' +
      'of the picture along a glowing circuit track road, Pixar animation style, warm ' +
      'bright colors, ' + NO_TEXT,
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
