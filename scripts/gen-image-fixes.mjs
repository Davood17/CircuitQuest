/**
 * Regenerates the 5 buggy story illustrations found in the bug-hunt pass:
 *  - l0-2 #3  the wall socket on the house looked like a weird face → clean plug + glowing windows
 *  - l0-2 #4  the green "safe" shield sat on the LION (danger) side → shield must be on the kitten side
 *  - l0-3 #1  photoreal grey shield, style mismatch → colorful Pixar style, centered (padlocks overlay)
 *  - l0-3 #4  photoreal desk, no character → cute robot engineer tidying a colorful cartoon desk
 *  - l0-4 #3  odd two-tone battery → one friendly battery character
 *
 * Usage:  bun scripts/gen-image-fixes.mjs   (keeps backups in scripts/img-backups/)
 */
import { spawnSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const SIZE = '1344x768'; // closest supported size to 16:9
const NO_TEXT =
  'Absolutely no text anywhere: no words, no letters, no writing, no typography, ' +
  'no labels, no captions, no characters from any language, completely textless picture';
const PIXAR = 'Pixar animation style, soft rounded shapes, cheerful kid-friendly educational illustration';

const JOBS = [
  {
    file: 'public/images/lessons/l0-2/3-power-journey.png',
    // keep the composition: plant right → pylons → house left (flipped to RTL by CSS)
    prompt:
      'Colorful flat-cartoon illustration of the long journey of electricity: a big friendly ' +
      'power station with two wind turbines on one side, tall electricity pylons connected by ' +
      'power lines marching across green hills, and a cozy cute house with warm glowing yellow ' +
      'windows at the other side, a simple white electric wall socket with two small holes on ' +
      'the house wall, blue sky with fluffy clouds, bright cheerful colors, clean vector ' +
      'cartoon style for kids, ' + NO_TEXT,
  },
  {
    file: 'public/images/lessons/l0-2/4-safe-danger.png',
    // FIX: green shield + checkmark on the SAFE (battery kitten) side, red warning signs on the lion side
    prompt:
      'Split-screen cartoon comparison for kids: on the right side a sleepy adorable orange ' +
      'kitten curled up next to a small green battery, with a big shiny green shield with a ' +
      'white checkmark floating above the kitten, soft cream background; on the left side a ' +
      'mighty cartoon lion with a big mane sitting next to a white wall electric socket with a ' +
      'black plug, with red warning triangles floating above the lion; a thin brown line ' +
      'divides the two halves, bright colors, ' + PIXAR + ', ' + NO_TEXT,
  },
  {
    file: 'public/images/lessons/l0-3/1-shield.png',
    // FIX: colorful cartoon style (was photoreal grey), centered shield with room around it
    prompt:
      'A large heroic golden safety shield with a warm glowing lightbulb in its center, ' +
      'standing upright and perfectly centered on a cheerful pastel turquoise background with ' +
      'soft sparkles and tiny stars floating around it, glossy ' + PIXAR + ', ' + NO_TEXT,
  },
  {
    file: 'public/images/lessons/l0-3/4-tidy-desk.png',
    // FIX: cute character + cartoon style (was photoreal), matches the tidy-desk tap game below it
    prompt:
      'A cute little white robot engineer with big happy eyes standing behind a clean tidy ' +
      'wooden work desk, proudly showing a neatly organized desk with a small clear box of ' +
      'colorful electronic parts, a folded towel, a small green battery and a tiny blue ' +
      'breadboard lined up neatly, a sunny window behind, bright cheerful ' + PIXAR + ', ' + NO_TEXT,
  },
  {
    file: 'public/images/lessons/l0-4/3-open-circuit.png',
    // FIX: one single friendly battery (was a weird two-tone stack)
    prompt:
      'Playful 3D cartoon illustration of an open electric circuit on a green circuit board: ' +
      'a crack and gap in the wire path where four sad confused blue electron characters are ' +
      'stopped, a silhouette of a drawn-up bridge in the sky, ONE friendly cartoon battery ' +
      'character with a worried face on the right side, and an unlit sleeping light bulb with ' +
      'closed eyes lying down, warm sunset colors, ' + PIXAR + ', ' + NO_TEXT,
  },
];

function generate({ file, prompt }, attempt = 1) {
  const out = path.join('/home/z/my-project', file);
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

let ok = true;
for (const job of JOBS) ok = generate(job) && ok;
process.exit(ok ? 0 : 1);
