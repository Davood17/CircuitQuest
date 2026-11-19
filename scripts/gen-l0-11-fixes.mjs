/**
 * Regeneration fix for lesson l0-11 image #3 (safety jacket).
 * First attempt showed a kid in a red space helmet holding a green checkmark —
 * no wire and no jacket at all. Regenerated with the WIRE as the explicit
 * main subject. The rejected first version is kept in scripts/img-backups/l0-11/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-11';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-11';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const FIXES = [
  {
    file: '3-safety-jacket.png',
    prompt:
      'Playful 3D cartoon for kids, the main subject is a thick electric cable wire laid ' +
      'horizontally across the picture: its middle part is wrapped in a cute bright red ' +
      'plastic insulating jacket shaped like a cozy little coat with a friendly smiling ' +
      'face on the jacket, both wire ends show shiny copper strands sticking out, a small ' +
      'child hand gently and safely grips the middle of the red jacketed wire, a big shiny ' +
      'green checkmark badge floats beside them, Pixar animation style, clear educational ' +
      'visual, ' + NO_TEXT,
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
