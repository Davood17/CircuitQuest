/**
 * Generates the 5 story illustrations for lesson l0-2 («برق چیست؟»)
 * from the user's English image prompts (16:9 → 1344x768), via the z-ai CLI.
 *
 * Usage:  bun scripts/gen-l0-2-images.mjs   (FORCE=1 to regenerate)
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/z/my-project/public/images/lessons/l0-2';
const SIZE = '1344x768'; // closest supported size to 16:9

const IMAGES = [
  {
    file: '1-room-wake.png',
    prompt:
      "Cute 3D cartoon style illustration of a cozy child's bedroom coming to life, " +
      'with playful glowing light sparks floating like friendly magical fairies, ' +
      'illuminating a desk lamp, a TV, and a toy robot with cheerful smiling cartoon faces, ' +
      'Pixar animation style, vibrant bright colors, friendly and warm atmosphere, ' +
      'no text, no words, no letters',
  },
  {
    file: '2-electrons.png',
    prompt:
      'Playful 3D animation illustration of microscopic adorable bright blue glowing ' +
      'electron characters with smiling eyes, running together in a neat line inside a ' +
      'clear transparent wire tube, holding tiny glowing yellow star-shaped energy lanterns, ' +
      'Pixar character design style, clean and child-friendly, no text, no words, no letters',
  },
  {
    file: '3-power-journey.png',
    prompt:
      'Simple colorful kids infographic style illustration showing a friendly green power ' +
      'plant with windmills, electric power pylons across cute green hills, leading directly ' +
      'to a cheerful cartoon house with a power socket, cute vector storybook art for children, ' +
      'bright pastel colors, no text, no words, no letters',
  },
  {
    // NOTE: sides swapped vs. the raw prompt (kitten on the RIGHT) so the split
    // matches the RTL page layout described by the user (safe = right, danger = left).
    file: '4-safe-danger.png',
    prompt:
      'Educational split-screen cartoon visual for kids: on the right side, an adorable ' +
      'fluffy sleeping kitten sitting next to a AA battery with a bright green safety shield badge; ' +
      'on the left side, a strong cartoon lion sitting near a home wall socket with a red ' +
      'caution triangle icon; clear visual contrast, cute children book illustration style. ' +
      'Absolutely no text anywhere: no words, no letters, no writing, no typography, no labels, ' +
      'no captions, no characters from any language, completely textless picture',
  },
  {
    // NOTE: the narrating character is the app's teacher ROBOT (robot replaced the teacher).
    file: '5-quiz-party.png',
    prompt:
      'Vibrant celebratory quiz completion screen for a kids educational app, featuring a ' +
      'friendly cute robot with big happy eyes holding a glowing golden trophy, floating ' +
      'stars, confetti, bright green checkmark badge with a battery icon, colorful UI game ' +
      'style, no text, no words, no letters',
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
let ok = true;
for (const spec of IMAGES) {
  const out = path.join(OUT_DIR, spec.file);
  if (fs.existsSync(out) && fs.statSync(out).size > 10_000 && process.env.FORCE !== '1') {
    console.log(`SKIP ${spec.file} already exists (FORCE=1 to regenerate)`);
    continue;
  }
  ok = generate(spec) && ok;
}
process.exit(ok ? 0 : 1);
