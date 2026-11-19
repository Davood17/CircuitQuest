/**
 * Round 3 for lesson l0-12 — only #2 again (round 2 still drew a screw-base
 * bulb with no legs; backup in scripts/img-backups/l0-12/).
 * The page teaches exactly ONE thing: the LED has TWO straight metal legs of
 * different lengths — so the composition is fully constrained this time.
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

const SPEC = {
  file: '2-led-legs.png',
  prompt:
    'Cute 3D educational render for kids of an electronic LED component standing upright in ' +
    'the center: on top a small shiny rounded red dome like a little hat, and from under the ' +
    'dome exactly two long straight thin silver wire legs stick downward side by side, the ' +
    'left wire leg twice as long as the right wire leg, a few small glowing blue round ' +
    'electron dots with tiny smiling faces march in a single direction along a glossy wire ' +
    'toward the two legs, plain pastel mint studio background, Pixar aesthetic, bright ' +
    'kid-friendly colors, an electronic part, absolutely no light bulb, no screw base, no ' +
    'glass bulb, no lamp, ' + NO_TEXT,
};

function generate(spec, attempt = 1) {
  const out = path.join(OUT_DIR, spec.file);
  const res = spawnSync('z-ai', ['image', '--prompt', spec.prompt, '--output', out, '--size', SIZE], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (res.status === 0 && fs.existsSync(out) && fs.statSync(out).size > 10_000) {
    console.log(`OK  ${spec.file} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
    return true;
  }
  const err = (res.stderr?.toString() || res.stdout?.toString() || 'unknown').trim().split('\n').pop();
  if (attempt < 3) {
    console.warn(`..  ${spec.file} attempt ${attempt} failed (${err}) — retrying`);
    return generate(spec, attempt + 1);
  }
  console.error(`ERR ${spec.file} failed after 3 attempts: ${err}`);
  return false;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });
const out = path.join(OUT_DIR, SPEC.file);
if (fs.existsSync(out)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(out, path.join(BACKUP_DIR, `${stamp}-${SPEC.file}`));
}
process.exit(generate(SPEC) ? 0 : 1);
