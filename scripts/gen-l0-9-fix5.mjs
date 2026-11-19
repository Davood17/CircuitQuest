import { spawnSync } from 'node:child_process';
import fs from 'fs';
const OUT = '/home/z/my-project/public/images/lessons/l0-9/5-resistance-medal.png';
const NO_TEXT = 'Absolutely no text anywhere: no words, no letters, no writing, no typography, no labels, no captions, no numbers, no characters from any language, completely textless picture';
const prompt =
  'A cute 3D cartoon award for a kids science app: the main character is a beige ' +
  'cylindrical electronic resistor component with FOUR wide colorful stripes around ' +
  'its middle (red, red, brown, gold), a thin wire leg coming out of its top and ' +
  'bottom, a joyful smiling face with rosy cheeks, standing proudly on a small golden ' +
  'round podium with a tiny golden crown floating above its head; around it: colorful ' +
  'confetti, golden stars, sparkles, and a happy cute white robot clapping; simple ' +
  'bright sky-blue background, gamified children UI, Pixar animation style, ' + NO_TEXT;
const res = spawnSync('z-ai', ['image', '--prompt', prompt, '--output', OUT, '--size', '1344x768'], { stdio: ['ignore','pipe','pipe'] });
console.log(res.status === 0 && fs.statSync(OUT).size > 10000 ? 'OK' : 'FAIL: ' + (res.stderr?.toString()||''));
