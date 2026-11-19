/**
 * Round 2 for lesson l0-12 — regenerates the two rejected illustrations.
 *
 * Rejected in round 1 (backups in scripts/img-backups/l0-12/):
 *  - #2: a screw-base incandescent bulb with scattered arrows — the whole
 *        page is about the TWO metal legs of different lengths, so the LED
 *        component with two straight legs must be shown explicitly;
 *  - #4: a HUMAN superhero boy next to a plain bulb and no resistor at all
 *        (humans were already rejected in l0-10 #4) — the resistor must be
 *        the personified component itself (striped cylinder + cape + shield).
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-12';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-12';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no numbers, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '2-led-legs.png',
    prompt:
      'Cute 3D educational rendering of an electronic LED component for kids: a small glossy ' +
      'red dome on top of two straight thin metal legs, the left leg clearly much longer than ' +
      'the right leg, tiny glowing blue arrows marching in one direction along a wire toward ' +
      'the LED component, definitely NOT a screw light bulb, clean bright studio background, ' +
      'Pixar aesthetic, bright colorful kid-friendly layout, ' + NO_TEXT,
  },
  {
    file: '4-led-resistor.png',
    prompt:
      'Charming 3D cartoon illustration for kids of a cute personified resistor component ' +
      'character: a small beige cylinder with colorful stripes and thin metal legs, a kind ' +
      'smiling face, wearing a tiny red superhero cape and holding a small round glowing ' +
      'energy shield, standing guard beside a happy glowing LED bulb character with a cute ' +
      'smiling face, Pixar style, friendly educational design, no humans, ' + NO_TEXT,
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
fs.mkdirSync(BACKUP_DIR, { recursive: true });
let ok = true;
for (const spec of IMAGES) {
  const out = path.join(OUT_DIR, spec.file);
  // back up the rejected version before overwriting
  if (fs.existsSync(out)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(out, path.join(BACKUP_DIR, `${stamp}-${spec.file}`));
  }
  ok = generate(spec) && ok;
}
process.exit(ok ? 0 : 1);
