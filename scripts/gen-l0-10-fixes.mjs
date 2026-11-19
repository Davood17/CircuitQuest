/**
 * Regeneration fix for lesson l0-10 image #4 (battery family).
 * First attempt showed 4 cylinders + two human children — no flat coin cell
 * and no box battery, but page 4 is exactly about the battery SHAPES
 * (pencil / coin / book). Regenerated with explicit shape language and
 * "no humans". The rejected first version is kept in scripts/img-backups/l0-10/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-10';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-10';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const FIXES = [
  {
    file: '4-battery-family.png',
    prompt:
      'Charming 3D cartoon group photo of exactly four smiling battery characters standing ' +
      'side by side like a family portrait, absolutely no humans and no children: first a ' +
      'tall slim cylindrical pencil battery, second a tiny flat round silver coin disc ' +
      'battery shaped like a button lying low near the ground, third a sturdy rectangular ' +
      'box shaped battery with two round snap terminals on its top, fourth a medium green ' +
      'cylindrical battery with two green circular refresh arrows on its body, all four ' +
      'with cute smiling faces, Pixar animation style, cozy friendly atmosphere, ' + NO_TEXT,
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
  if (fs.existsSync(out)) fs.copyFileSync(out, bak);
}
let ok = true;
for (const spec of FIXES) ok = generate(spec) && ok;
process.exit(ok ? 0 : 1);
