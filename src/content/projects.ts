import type { Project } from './types';
import { c, w, doc, g, L } from './helpers';

export const PROJECTS: Project[] = [
  {
    id: 'p-flashlight',
    levelId: 'level1',
    title: L('Pocket flashlight', 'چراغ‌قوهٔ جیبی'),
    emoji: '🔦',
    intro: L(
      'Build the classic first project: your own flashlight circuit. It combines everything from Level 0 into one real, working design.',
      'اولین پروژهٔ کلاسیک را بساز: چراغ‌قوهٔ خودت! همه‌چیزِ سطح ۰ را در یک مدارِ واقعی و کارا جمع می‌کند.',
    ),
    objective: L('A switchable, safe LED light on a 9 V battery.', 'چراغِ ال‌ای‌دیِ امن که با کلید روشن و خاموش می‌شود.'),
    materials: ['battery', 'switch', 'resistor', 'led'],
    steps: [
      {
        instruction: L('Place the battery, then wire the switch to its + side.', 'باتری را بگذار و کلید را با سیم به + آن وصل کن.'),
        task: {
          brief: L('Battery + → switch.', '+ باتری به کلید وصل شود.'),
          goal: g.and(g.battery(), g.switchPresent()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
              c('switch', 'sw1', { x: 360, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 550, y: 220 }),
              c('led', 'led1', { x: 740, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [L('Tap the WIRE tool, then tap + and switch pin a.', 'ابزار «سیم» را بردار؛ اول روی پایهٔ + باتری بزن، بعد روی پایهٔ کلید.')],
        },
      },
      {
        instruction: L('Continue the loop: switch → resistor → LED → back to −.', 'مسیر را ادامه بده: کلید ← مقاومت ← ال‌ای‌دی ← برگشت به −.'),
        task: {
          brief: L('Complete the full flashlight loop.', 'مسیرِ کاملِ چراغ‌قوه را کامل کن.'),
          goal: g.and(g.battery(), g.switchClosed(), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
              c('switch', 'sw1', { x: 360, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 550, y: 220 }),
              c('led', 'led1', { x: 740, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('sw1.b → r1.a → led1.anode, and led1.cathode → b1.neg.', 'از کلید به مقاومت، از مقاومت به ال‌ای‌دی و از پایهٔ دیگرِ ال‌ای‌دی به − باتری.'),
            L('Then run and close the switch!', 'بعد مدار را روشن کن و کلید را بزن!'),
          ],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('LED never lights', 'ال‌ای‌دی اصلاً روشن نمی‌شود'),
        cause: L('LED is backwards or the switch is open', 'ال‌ای‌دی برعکس است یا کلید خاموش است'),
        fix: L('Rotate the LED 180°, or tap the switch to close it.', 'ال‌ای‌دی را با چرخش برگردان یا کلید را روشن کن.'),
      },
      {
        symptom: L('Warning: too much current', 'هشدار: جریان خیلی زیاد'),
        cause: L('Resistor missing or wrong value', 'مقاومت نیست یا مقدارش اشتباه است'),
        fix: L('Use a 470 Ω resistor in series.', 'یک مقاومت ۴۷۰ اهم داخل مسیر بگذار.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-push-light',
    levelId: 'level1',
    title: L('Push-button light', 'چراغِ دکمه‌ای'),
    emoji: '🔘',
    intro: L(
      'Like a laptop keyboard backlight: the LED only glows while the button is held.',
      'مثل نورِ کیبورد لپ‌تاپ: ال‌ای‌دی فقط تا وقتی دکمه را نگه داشته‌ای روشن می‌ماند.',
    ),
    objective: L('A momentary light controlled by a push button.', 'چراغی که فقط با نگه‌داشتنِ دکمه روشن می‌شود.'),
    materials: ['battery', 'button', 'resistor', 'led'],
    steps: [
      {
        instruction: L('Build the full loop with the button in series, then run and hold it.', 'مسیرِ کامل را با دکمه بساز؛ بعد مدار را روشن کن و دکمه را نگه دار.'),
        task: {
          brief: L('LED glows only while the button is pressed.', 'ال‌ای‌دی فقط وقتی دکمه فشار داده شده روشن شود.'),
          goal: g.and(g.buttonPresent(), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
              c('button', 'bt1', { x: 340, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 530, y: 220 }),
              c('led', 'led1', { x: 720, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'button', 'resistor', 'led'],
          hints: [L('All four parts in one loop; run, then press-and-hold the button.', 'هر چهار قطعه در یک مسیر؛ مدار را روشن کن و دکمه را فشار بده و نگه دار.')],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('LED stays on forever', 'ال‌ای‌دی همیشه روشن می‌ماند'),
        cause: L('A wire bypasses the button', 'سیمی از کنارِ دکمه میان‌بر زده'),
        fix: L('Remove any wire that connects the two button sides directly.', 'سیمی که دو سمتِ دکمه را مستقیم وصل می‌کند را حذف کن.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-two-led',
    levelId: 'level2',
    title: L('Twin lamp', 'چراغ دوقلو'),
    emoji: '🪢',
    intro: L(
      'Wire two LEDs in PARALLEL, each with its own resistor — both at full brightness, like ceiling lights in a room.',
      'دو ال‌ای‌دی را موازی ببند، هرکدام با مقاومتِ خودش — هر دو تمام‌نور، مثل چراغ‌های سقفِ یک اتاق.',
    ),
    objective: L('Two independent, bright, safe LED branches.', 'دو شاخهٔ جدا که هر دو درخشان و امن باشند.'),
    materials: ['battery', 'resistor', 'led'],
    steps: [
      {
        instruction: L('Branch 1: battery + → 470 Ω → LED1 → battery −.', 'شاخهٔ ۱: + باتری ← مقاومت ۴۷۰ اهم ← ال‌ای‌دی ۱ ← − باتری.'),
        task: {
          brief: L('First LED branch complete and glowing.', 'شاخهٔ اول کامل شود و روشن شود.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1')),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 350, y: 130 }),
              c('led', 'led1', { x: 570, y: 130 }),
              c('resistor', 'r2', { params: { resistance: 470 }, x: 350, y: 290 }),
              c('led', 'led2', { x: 570, y: 290 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [L('Only wire r1 and led1 in this step — leave branch 2 alone.', 'در این مرحله فقط مقاومت و ال‌ای‌دیِ اول را سیم بزن؛ شاخهٔ دوم فعلاً بماند.')],
        },
      },
      {
        instruction: L('Branch 2: same pattern for r2 and led2. Both LEDs now glow bright.', 'شاخهٔ ۲: همان الگو برای مقاومت و ال‌ای‌دیِ دوم. حالا هر دو تمام‌نورند.'),
        task: {
          brief: L('Both branches glowing in parallel.', 'هر دو شاخه به‌صورتِ موازی روشن شوند.'),
          goal: g.and(g.ledOn('led1'), g.ledOn('led2'), g.ledCurrentSafe('led1'), g.ledCurrentSafe('led2')),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 350, y: 130 }),
              c('led', 'led1', { x: 570, y: 130 }),
              c('resistor', 'r2', { params: { resistance: 470 }, x: 350, y: 290 }),
              c('led', 'led2', { x: 570, y: 290 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [L('Copy branch 1: + → r2.a, r2.b → led2.anode, led2.cathode → −.', 'شاخهٔ اول را تکرار کن: + ← مقاومت ۲ ← ال‌ای‌دی ۲ ← −.')],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('Both LEDs dim like series', 'هر دو کم‌نورند، مثل مدارِ سری'),
        cause: L('LEDs chained in one line instead of parallel branches', 'ال‌ای‌دی‌ها پشت‌سرِ هم بسته شده‌اند، نه شاخهٔ موازی'),
        fix: L('Each branch must start at + and end at − independently.', 'هر شاخه باید جدا از + شروع شود و جدا به − برسد.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-traffic-light',
    levelId: 'level2',
    title: L('Mini traffic light', 'چراغ راهنمای مینی'),
    emoji: '🚦',
    intro: L(
      'The classic! Three colored LEDs — red, yellow, green — each with its own switch, like a real intersection controller.',
      'پروژهٔ کلاسیک! سه ال‌ای‌دی رنگی — قرمز، زرد، سبز — هرکدام با کلیدِ خودش، مثل چراغ راهنمای واقعی.',
    ),
    objective: L('Switch each light on and off like a traffic controller.', 'هر چراغ را جداگانه روشن و خاموش کن.'),
    materials: ['battery', 'switch', 'resistor', 'led'],
    steps: [
      {
        instruction: L('Build three parallel branches: each = switch → 470 Ω → its LED.', 'سه شاخهٔ موازی بساز: هر شاخه = کلید ← مقاومت ۴۷۰ اهم ← ال‌ای‌دیِ خودش.'),
        task: {
          brief: L('Light the red branch via its switch.', 'شاخهٔ قرمز را با کلیدش روشن کن.'),
          goal: g.and(g.ledOn('ledR'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 110, y: 200 }),
              c('switch', 'swR', { x: 320, y: 100 }),
              c('resistor', 'rR', { params: { resistance: 470 }, x: 500, y: 100 }),
              c('led', 'ledR', { x: 690, y: 100, params: { color: 'red' } }),
              c('switch', 'swY', { x: 320, y: 200 }),
              c('resistor', 'rY', { params: { resistance: 470 }, x: 500, y: 200 }),
              c('led', 'ledY', { x: 690, y: 200, params: { color: 'yellow' } }),
              c('switch', 'swG', { x: 320, y: 300 }),
              c('resistor', 'rG', { params: { resistance: 470 }, x: 500, y: 300 }),
              c('led', 'ledG', { x: 690, y: 300, params: { color: 'green' } }),
            ],
            [],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [L('Wire one branch fully first: + → swR → rR → ledR → −.', 'اول یک شاخه را کامل سیم بزن: + ← کلید ← مقاومت ← ال‌ای‌دی ← −.')],
        },
      },
      {
        instruction: L('Wire the yellow and green branches too. Then run the show!', 'شاخه‌های زرد و سبز را هم سیم بزن. بعد نمایش را شروع کن!'),
        task: {
          brief: L('All three branches wired; close any switch to light its color.', 'هر سه شاخه سیم‌کشی شوند؛ هر کلید را روشن کنی، رنگِ خودش روشن می‌شود.'),
          goal: g.and(g.ledOn('ledR'), g.ledOn('ledY'), g.ledOn('ledG'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 110, y: 200 }),
              c('switch', 'swR', { x: 320, y: 100 }),
              c('resistor', 'rR', { params: { resistance: 470 }, x: 500, y: 100 }),
              c('led', 'ledR', { x: 690, y: 100, params: { color: 'red' } }),
              c('switch', 'swY', { x: 320, y: 200 }),
              c('resistor', 'rY', { params: { resistance: 470 }, x: 500, y: 200 }),
              c('led', 'ledY', { x: 690, y: 200, params: { color: 'yellow' } }),
              c('switch', 'swG', { x: 320, y: 300 }),
              c('resistor', 'rG', { params: { resistance: 470 }, x: 500, y: 300 }),
              c('led', 'ledG', { x: 690, y: 300, params: { color: 'green' } }),
            ],
            [],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [L('Close all three switches while running.', 'وقتی مدار روشن است، هر سه کلید را روشن کن.')],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('Closing one switch lights the wrong color', 'روشن‌کردنِ یک کلید، رنگِ دیگری را روشن می‌کند'),
        cause: L('Branch wires crossed between rows', 'سیم‌های شاخه‌ها بین ردیف‌ها عوض شده'),
        fix: L('Each branch: its own switch → its own resistor → its own LED.', 'هر شاخه باید با کلید، مقاومت و ال‌ای‌دیِ خودش باشد.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-night-light',
    levelId: 'level2',
    title: L('Automatic night light', 'چراغ خواب خودکار'),
    emoji: '🌙',
    intro: L(
      'Use the light sensor (LDR): when the room gets dark, the LED glows — just like real night lights.',
      'از حس‌گرِ نور (LDR) استفاده کن: وقتی اتاق تاریک می‌شود، ال‌ای‌دی روشن می‌شود — مثل چراغ‌خواب‌های واقعی.',
    ),
    objective: L('An LED that brightens as the LDR "sees" darkness.', 'ال‌ای‌دی‌ای که با تاریک‌شدنِ محیط، روشن‌تر می‌شود.'),
    materials: ['battery', 'ldr', 'resistor', 'led'],
    steps: [
      {
        instruction: L(
          'Wire: battery + → LDR → LED → −. The LDR and LED form a divider that changes with light.',
          'سیم‌کشی: + باتری ← حس‌گرِ نور ← ال‌ای‌دی ← −. با تغییرِ نور، تقسیمِ برق بین این دو عوض می‌شود.',
        ),
        task: {
          brief: L('Slide the LDR light level down — the LED should get BRIGHTER in the dark.', 'سطحِ نورِ حس‌گر را کم کن — ال‌ای‌دی در تاریکی باید درخشان‌تر شود.'),
          goal: g.and(g.has('ldr1'), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
              c('ldr', 'ldr1', { x: 360, y: 220 }),
              c('led', 'led1', { x: 570, y: 220 }),
            ],
            [w('w1', 'b1', 'pos', 'ldr1', 'a'), w('w2', 'ldr1', 'b', 'led1', 'anode'), w('w3', 'led1', 'cathode', 'b1', 'neg')],
          ),
          allowed: ['battery', 'ldr', 'resistor', 'led'],
          hints: [
            L('Run the circuit first.', 'اول مدار را روشن کن.'),
            L('Select the LDR and drag its Light slider toward dark (0).', 'حس‌گرِ نور را انتخاب کن و اسلایدرِ نورش را به سمتِ تاریکی (۰) بکش.'),
            L('Dark LDR = big resistance = less current… so flip the order: put the LDR on the − side and try again!', 'حس‌گر در تاریکی مقاومتش خیلی زیاد می‌شود و جریان کم می‌شود… پس جای حس‌گر و ال‌ای‌دی را عوض کن و دوباره امتحان!'),
          ],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('LED gets brighter with MORE light', 'ال‌ای‌دی با نورِ بیشتر، درخشان‌تر می‌شود'),
        cause: L('LDR position in the divider', 'جای حس‌گرِ نور در مدار برعکس است'),
        fix: L('Swap the LDR and LED positions (or wire LDR between LED and −).', 'جای حس‌گر و ال‌ای‌دی را عوض کن (یا حس‌گر را بین ال‌ای‌دی و − بگذار).'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-variable-brightness',
    levelId: 'level2',
    title: L('Studio dimmer', 'کم‌نورساز استودیو'),
    emoji: '🎚️',
    intro: L(
      'A potentiometer gives you smooth manual control of LED brightness — like a real lighting desk.',
      'پتانسیومتر کنترلِ نرمِ نورِ ال‌ای‌دی را به دستت می‌دهد — مثل میزِ نورِ واقعی.',
    ),
    objective: L('Slide from dark to bright without any clicks.', 'از خاموش تا روشن، بدون هیچ پله‌ای.'),
    materials: ['battery', 'potentiometer', 'resistor', 'led'],
    steps: [
      {
        instruction: L(
          'Wire: + → pot(A), pot(B) → −. Then pot(W) → 220 Ω → LED → −.',
          'سیم‌کشی: + ← پایهٔ A پتانسیومتر، پایهٔ B ← −. بعد پایهٔ W ← مقاومت ۲۲۰ اهم ← ال‌ای‌دی ← −.',
        ),
        task: {
          brief: L('Slide the pot and make the LED smoothly change brightness.', 'اسلایدر را بکش تا نورِ ال‌ای‌دی نرم کم و زیاد شود.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 220 }),
              c('potentiometer', 'pot1', { x: 350, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 220 }, x: 560, y: 220 }),
              c('led', 'led1', { x: 750, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'potentiometer', 'resistor', 'led'],
          hints: [L('Run, then drag the % slider on the pot itself.', 'مدار را روشن کن و بعد اسلایدرِ روی پتانسیومتر را بکش.')],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('No change when sliding', 'با کشیدنِ اسلایدر، تغییری نمی‌کند'),
        cause: L('Wiper (W) not wired to the LED path', 'پایهٔ W به مسیرِ ال‌ای‌دی وصل نیست'),
        fix: L('Check W goes to the resistor → LED path.', 'ببین W به مسیرِ مقاومت ← ال‌ای‌دی وصل است.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-transistor-switch',
    levelId: 'level2',
    title: L('Transistor: the tiny switch', 'ترانزیستور: کلیدِ ریز'),
    emoji: '🧿',
    intro: L(
      'A transistor lets a TINY base current control a BIG collector current — one gentle finger controlling a giant lever.',
      'ترانزیستور یعنی با یک جریانِ خیلی کوچک، یک جریانِ بزرگ را کنترل کنی — مثل این‌که با یک انگشت، اهرمی غول‌پیکر را تکان بدهی!',
    ),
    objective: L('Switch the LED with a transistor driving it.', 'ال‌ای‌دی را با ترانزیستور روشن کن.'),
    materials: ['battery', 'resistor', 'transistor', 'led'],
    steps: [
      {
        instruction: L(
          'Wire two paths: ① base path: + → 10 kΩ → B. ② LED path: + → 470 Ω → LED → C. Emitter → −.',
          'دو مسیر بساز: ① مسیرِ پایه: + ← مقاومت ۱۰ کیلواهم ← پایهٔ B. ② مسیرِ ال‌ای‌دی: + ← مقاومت ۴۷۰ اهم ← ال‌ای‌دی ← پایهٔ C. پایهٔ E هم به − برود.',
        ),
        task: {
          brief: L('Transistor ON → LED glows. Check the SAT badge on the transistor.', 'ترانزیستور روشن شود ← ال‌ای‌دی بدرخشد. نشانِ SAT روی ترانزیستور را ببین.'),
          goal: g.and(g.has('q1'), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 220 }),
              c('resistor', 'rb', { params: { resistance: 10_000 }, x: 340, y: 120 }),
              c('transistor', 'q1', { x: 540, y: 220 }),
              c('resistor', 'rc', { params: { resistance: 470 }, x: 340, y: 320 }),
              c('led', 'led1', { x: 540, y: 360 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'transistor', 'led'],
          hints: [
            L('Base path: + → rb.a; rb.b → q1.base; q1.emitter → −.', 'مسیرِ پایه: + ← مقاومتِ بزرگ؛ خروجیِ مقاومت ← پایهٔ B؛ پایهٔ E ← −.'),
            L('LED path: + → rc.a; rc.b → led1.anode; led1.cathode → q1.collector.', 'مسیرِ ال‌ای‌دی: + ← مقاومتِ دیگر؛ خروجی‌اش ← پایهٔ بلندِ ال‌ای‌دی؛ پایهٔ کوتاهِ ال‌ای‌دی ← پایهٔ C ترانزیستور.'),
            L('Run it — the transistor badge should say SAT and the LED glow.', 'مدار را روشن کن؛ نشانِ ترانزیستور باید SAT شود و ال‌ای‌دی بدرخشد.'),
          ],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('LED dark, transistor shows OFF', 'ال‌ای‌دی خاموش، ترانزیستور OFF نشان می‌دهد'),
        cause: L('Base path missing or resistor too big', 'مسیرِ پایه نیست یا مقاومتش خیلی بزرگ است'),
        fix: L('Check + → 10 kΩ → B → E → − chain exists.', 'ببین زنجیرهٔ + ← مقاومت ۱۰ کیلواهم ← B ← E ← − کامل است.'),
      },
    ],
    xp: 100,
  },
  {
    id: 'p-buzzer-alarm',
    levelId: 'level2',
    title: L('Door alarm', 'زنگ در'),
    emoji: '🚪',
    intro: L(
      'A buzzer + push button = your room alarm. Press to sound the alarm — future versions will make it automatic!',
      'بوق‌زن + دکمهٔ فشاری = زنگِ اتاقِ تو! فشار بده تا آژیر بدهد — در نسخه‌های بعدی خودکارش می‌کنیم!',
    ),
    objective: L('Buzzer sounds while the button is pressed.', 'بوق‌زن تا وقتی دکمه فشار داده شده صدا بدهد.'),
    materials: ['battery', 'button', 'buzzer'],
    steps: [
      {
        instruction: L('Wire: + → button → buzzer(+) , buzzer(−) → −. Run, then hold the button.', 'سیم‌کشی: + ← دکمه ← بوق‌زن(+) و بوق‌زن(−) ← −. مدار را روشن کن و دکمه را نگه دار.'),
        task: {
          brief: L('Make the buzzer sound.', 'بوق‌زن را صدا بینداز.'),
          goal: g.and(g.buzzerOn('bz1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
              c('button', 'bt1', { x: 340, y: 220 }),
              c('buzzer', 'bz1', { x: 520, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'button', 'buzzer'],
          hints: [L('Mind the buzzer polarity: + side toward the button.', 'قطبیتِ بوق‌زن را رعایت کن: سرِ + سمتِ دکمه.')],
        },
      },
    ],
    troubleshooting: [
      {
        symptom: L('Buzzer silent even when pressed', 'با فشار هم بوق‌زن بی‌صدا است'),
        cause: L('Not enough current or reversed buzzer', 'جریان کم است یا بوق‌زن برعکس بسته شده'),
        fix: L('Check polarity and use a 9 V battery.', 'قطبیت را بررسی کن و از باتری ۹ ولت استفاده کن.'),
      },
    ],
    xp: 100,
  },
];
