/** Third attempt for l0-11 #3: pin down the exact composition — a horizontal
 *  red cable, copper strands at the end, ONE small child hand pinching it. */
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
      'Playful 3D cartoon for kids, simple clear composition on a soft pastel background: ' +
      'one thick electric cable lies horizontally across the middle of the picture like a ' +
      'bridge, the cable is wrapped in a glossy bright red plastic insulation jacket and ' +
      'the red jacket has a cute smiling face with rosy cheeks drawn on it, at the left ' +
      'end of the cable the shiny orange copper metal strands peek out of the jacket, one ' +
      'small chubby child hand with tiny fingers safely pinches and holds the middle of ' +
      'the red cable, a big shiny green checkmark badge floats in the upper corner, Pixar ' +
      'animation style, ' + NO_TEXT,
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
  const bak = path.join(BACKUP_DIR, `${spec.file}.attempt2.png`);
  if (fs.existsSync(out)) fs.copyFileSync(out, bak);
}
let ok = true;
for (const spec of FIXES) ok = generate(spec) && ok;
process.exit(ok ? 0 : 1);
