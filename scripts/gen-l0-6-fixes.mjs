/**
 * Regenerates 4 of the 5 l0-6 illustrations that missed the concept:
 *  #1 — baked a Superman "S" trademark + no glowing wire → chrome-metal hero,
 *       plain lightning emblem, holding a glowing golden wire;
 *  #2 — tube rendered silver + journey ran left→right → copper-orange tube,
 *       slide from the upper RIGHT down to the lower LEFT (RTL journey);
 *  #3 — showed kid characters in raincoats instead of the WIRE wearing the
 *       raincoat → one thick copper wire in a plastic raincoat, electrons
 *       inside, child hand safely touching the jacket;
 *  #4 — photorealistic still life without the key/pencil concept → chunky
 *       toy-cartoon circuit, golden key bridging the gap, bulb lit.
 * (Same policy as gen-l0-5-fixes.mjs; originals kept in scripts/img-backups/l0-6/.)
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-6';
const BACKUP_DIR = '/home/z/my-project/scripts/img-backups/l0-6';
const SIZE = '1344x768';
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';

const IMAGES = [
  {
    file: '1-conductor-team.png',
    prompt:
      'A bright 3D cartoon illustration for a children\u2019s educational app showing two ' +
      'friendly mascot characters standing side by side: on the right side a happy hero ' +
      'whose whole body is made of shiny silver chrome metal, with a simple plain yellow ' +
      'lightning bolt emblem on the chest, cheerfully holding up a glowing golden electric ' +
      'wire with both hands; on the left side a cute rounded guard character with a soft ' +
      'teal rubber body holding a big round white safety shield; Pixar animation style, ' +
      'warm glowing colors, simple kid-friendly composition, ' + NO_TEXT,
  },
  {
    file: '2-copper-slide.png',
    prompt:
      'Playful 3D cartoon illustration of cute tiny blue electron characters with happy ' +
      'smiling faces sliding down a shiny copper-orange metal tube like a futuristic water ' +
      'slide, the tube starts high at the upper right corner of the picture and curves ' +
      'down to the lower left corner, the little blue electrons slide from the upper right ' +
      'toward the lower left, warm copper orange metallic reflections, glowing effects, ' +
      'vibrant bright colors, Pixar style, ' + NO_TEXT,
  },
  {
    file: '3-plastic-raincoat.png',
    prompt:
      'Cute 3D cartoon render of one single thick copper electric wire lying on the ground, ' +
      'the middle of the wire is wrapped in a colorful smiling plastic raincoat jacket, ' +
      'tiny glowing blue electron characters with cute faces run safely inside the copper ' +
      'wire, and a small child\u2019s hand gently touches the outside of the plastic ' +
      'raincoat so the hand stays perfectly safe, clean simple composition, Pixar ' +
      'aesthetic, warm kid-friendly colors, ' + NO_TEXT,
  },
  {
    file: '4-material-lab.png',
    prompt:
      'Bright 3D cartoon illustration for a kids science app, a wooden laboratory desk ' +
      'holding a simple chunky toy test circuit made of thick rounded wires: a big cute ' +
      'glowing light bulb character standing on the left, a small green toy battery on the ' +
      'right, and a shiny golden metal key placed in the middle bridging the gap between ' +
      'the two wire ends so the bulb lights up brightly, a wooden pencil lying on the desk ' +
      'next to the circuit, cheerful Pixar style, rounded toy shapes, vibrant colors, ' + NO_TEXT,
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
for (const spec of IMAGES) {
  const out = path.join(OUT_DIR, spec.file);
  const bak = path.join(BACKUP_DIR, spec.file);
  if (fs.existsSync(out) && !fs.existsSync(bak)) fs.copyFileSync(out, bak);
}
let ok = true;
for (const spec of IMAGES) ok = generate(spec) && ok;
process.exit(ok ? 0 : 1);
