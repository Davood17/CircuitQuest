/**
 * Regenerates image #2 of lesson l0-7 (the water-tank / battery comparison):
 * the first version drew TWO tanks (one on the tower + one on the roof) and
 * the jet came from the roof tank instead of the tall tower.
 * Original kept at scripts/img-backups/l0-7/.
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT = '/home/z/my-project/public/images/lessons/l0-7/2-water-battery.png';
const BACKUP = '/home/z/my-project/scripts/img-backups/l0-7/2-water-battery.png';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const PROMPT =
  'Cute 3D educational comparison illustration for children, split in two halves: ' +
  'on the RIGHT half exactly ONE water tank sits on top of a single tall metal tower, ' +
  'a strong water jet sprays sideways out of a pipe at the bottom of the tower with ' +
  'high pressure, making a big splash on the ground; on the LEFT half a happy smiling ' +
  'battery character pushes tiny cute blue electron characters through a copper wire ' +
  'toward a small glowing light bulb; clean simple composition, Pixar aesthetic, bright ' +
  'colorful kid-friendly layout, ' + NO_TEXT;

fs.mkdirSync(path.dirname(BACKUP), { recursive: true });
if (fs.existsSync(OUT)) fs.copyFileSync(OUT, BACKUP);

for (let attempt = 1; attempt <= 3; attempt++) {
  const res = spawnSync('z-ai', ['image', '--prompt', PROMPT, '--output', OUT, '--size', SIZE], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (res.status === 0 && fs.existsSync(OUT) && fs.statSync(OUT).size > 10_000) {
    console.log(`OK  2-water-battery.png attempt ${attempt} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
    process.exit(0);
  }
  console.warn(`..  attempt ${attempt} failed: ${(res.stderr?.toString() || 'unknown').trim().split('\n').pop()}`);
}
console.error('ERR all attempts failed');
process.exit(1);
