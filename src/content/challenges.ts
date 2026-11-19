import type { Challenge } from './types';
import { c, w, doc, g, L } from './helpers';

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch-led-from-scratch',
    kind: 'build',
    title: L('From zero to light', 'از صفر تا نور'),
    emoji: '💡',
    brief: L('Empty workbench. Build a safe LED circuit from scratch: battery, resistor, LED — one loop.', 'میز کارت خالی است. یک مدارِ امنِ ال‌ای‌دی از صفر بساز: باتری، مقاومت و ال‌ای‌دی در یک مسیر.'),
    startCircuit: doc([], []),
    goal: g.and(g.battery(), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
    hints: [
      L('Place the three parts in a row first.', 'اول سه قطعه را پشت‌سرِ هم روی صفحه بگذار.'),
      L('Wire: + → resistor → LED(A) , LED(K) → −.', 'سیم‌کشی: + ← مقاومت ← ال‌ای‌دی(A) و ال‌ای‌دی(K) ← −.'),
      L('Run it — aim for 10–20 mA on the LED.', 'مدار را روشن کن؛ عددِ mA روی ال‌ای‌دی باید ۱۰ تا ۲۰ باشد.'),
    ],
    daily: true,
  },
  {
    id: 'ch-open-switch',
    kind: 'troubleshoot',
    title: L('The silent circuit', 'مدارِ ساکت'),
    emoji: '🤫',
    brief: L('This circuit refuses to glow. Find out why and fix it.', 'این مدار روشن نمی‌شود. دلیلش را پیدا کن و درستش کن!'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
        c('switch', 'sw1', { x: 340, y: 220 }),
        c('resistor', 'r1', { params: { resistance: 470 }, x: 540, y: 220 }),
        c('led', 'led1', { x: 740, y: 220 }),
      ],
      [w('w1', 'b1', 'pos', 'sw1', 'a'), w('w2', 'sw1', 'b', 'r1', 'a'), w('w3', 'r1', 'b', 'led1', 'anode'), w('w4', 'led1', 'cathode', 'b1', 'neg')],
    ),
    goal: g.and(g.ledOn('led1'), g.noShort()),
    hints: [
      L('Run it and read the diagnostic card.', 'مدار را روشن کن و کارتِ هشدار را بخوان.'),
      L('The loop is complete… but is the switch closed?', 'مسیر کامل است… اما کلید روشن است؟'),
      L('Tap the switch while running to close it.', 'وقتی مدار روشن است، روی خودِ کلید بزن تا روشن شود.'),
    ],
    daily: true,
  },
  {
    id: 'ch-reversed-led',
    kind: 'troubleshoot',
    title: L('The stubborn LED', 'ال‌ای‌دیِ لجباز'),
    emoji: '🙃',
    brief: L('Battery, resistor, LED — all connected, yet dark. Something is facing the wrong way.', 'باتری، مقاومت و ال‌ای‌دی همه وصل‌اند ولی ال‌ای‌دی تاریک است. یک چیزی برعکس بسته شده!'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
        c('resistor', 'r1', { params: { resistance: 470 }, x: 360, y: 220 }),
        c('led', 'led1', { x: 570, y: 220, rotation: 180 }),
      ],
      [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'led1', 'cathode'), w('w3', 'led1', 'anode', 'b1', 'neg')],
    ),
    goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1')),
    hints: [
      L('The diagnostic card says "LED is backwards".', 'کارتِ هشدار می‌گوید: «ال‌ای‌دی برعکس است».'),
      L('Current must enter at A (anode) and leave at K (cathode).', 'جریان باید از پایهٔ بلند (A) وارد و از پایهٔ کوتاه (K) خارج شود.'),
      L('Select the LED → Rotate once.', 'ال‌ای‌دی را انتخاب کن و یک‌بار روی چرخش بزن.'),
    ],
    daily: true,
  },
  {
    id: 'ch-missing-resistor',
    kind: 'troubleshoot',
    title: L('Too much of a good thing', 'زیادیِ خوب، خودش بد است'),
    emoji: '🔥',
    brief: L('This LED is being fed way too much current. Save it!', 'به این ال‌ای‌دی جریانِ خیلی زیادی می‌رسد. نجاتش بده!'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 180, y: 220 }),
        c('led', 'led1', { x: 450, y: 220 }),
      ],
      [w('w1', 'b1', 'pos', 'led1', 'anode'), w('w2', 'led1', 'cathode', 'b1', 'neg')],
    ),
    goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
    hints: [
      L('The mA badge on the LED is dangerously high.', 'عدد mA روی ال‌ای‌دی خیلی بالاست؛ خطرناک است.'),
      L('What part limits current? It is missing here.', 'کدام قطعه جریان را کم می‌کند؟ اینجا نیست!'),
      L('Add a 470 Ω resistor in series anywhere in the loop.', 'یک مقاومت ۴۷۰ اهم بردار و هر جای مسیر، پشت‌سرِ بقیه وصلش کن.'),
    ],
    daily: true,
  },
  {
    id: 'ch-broken-wire',
    kind: 'troubleshoot',
    title: L('The missing link', 'سیمِ گمشده'),
    emoji: '⛓️',
    brief: L('Everything looks right, but the loop is broken somewhere.', 'همه‌چیز درست به نظر می‌رسد، ولی راهِ برق یک‌جا قطع است.'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
        c('resistor', 'r1', { params: { resistance: 470 }, x: 360, y: 220 }),
        c('led', 'led1', { x: 570, y: 220 }),
      ],
      [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'led1', 'cathode', 'b1', 'neg')],
    ),
    goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1')),
    hints: [
      L('Follow the current: from + through every part back to −.', 'مسیرِ برق را دنبال کن: از + ، از همهٔ قطعه‌ها رد شود و به − برگردد.'),
      L('The resistor and LED are not connected to each other.', 'مقاومت و ال‌ای‌دی به هم وصل نیستند!'),
      L('Wire r1.b to led1.anode.', 'پایهٔ مقاومت را با ابزار سیم به پایهٔ بلندِ ال‌ای‌دی وصل کن.'),
    ],
    daily: false,
  },
  {
    id: 'ch-pot-dim',
    kind: 'build',
    title: L('Mood lighting', 'نورِ دلخواه'),
    emoji: '🎨',
    brief: L('Build a dimmer: potentiometer controls one LED. Then slide it to ~50% brightness.', 'یک کم‌نورساز بساز: پتانسیومتر نورِ ال‌ای‌دی را کم و زیاد می‌کند. بعد اسلایدر را حدود ۵۰٪ بگذار.'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
        c('potentiometer', 'pot1', { x: 360, y: 220 }),
        c('resistor', 'r1', { params: { resistance: 330 }, x: 570, y: 220 }),
        c('led', 'led1', { x: 760, y: 220 }),
      ],
      [],
    ),
    goal: g.and(g.ledOn('led1'), g.wiperInRange('pot1', 2, 6), g.noShort()),
    hints: [
      L('A→+, B→−, W→resistor→LED→−.', 'A به +، B به −، و W از راه مقاومت به ال‌ای‌دی و بعد به −.'),
      L('Run, then drag the % slider on the potentiometer.', 'مدار را روشن کن و بعد اسلایدرِ روی پتانسیومتر را بکش.'),
      L('Wiper voltage between 2–6 V lights the LED at medium brightness.', 'وقتی ولتاژِ خروجی بین ۲ تا ۶ ولت باشد، ال‌ای‌دی متوسط روشن می‌شود.'),
    ],
    daily: false,
  },
  {
    id: 'ch-two-parallels',
    kind: 'build',
    title: L('Twin lights', 'چراغ‌های دوقلو'),
    emoji: '👯',
    brief: L('Make BOTH LEDs glow at full brightness — remember what parallel circuits do.', 'هر دو ال‌ای‌دی را تمام‌نور کن — یادت هست مدارِ موازی چه کار می‌کند؟'),
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
    goal: g.and(g.ledOn('led1'), g.ledOn('led2'), g.ledCurrentSafe('led1'), g.ledCurrentSafe('led2')),
    hints: [
      L('Each branch needs its own path from + to −.', 'هر شاخه مسیرِ خودش را از + تا − می‌خواهد.'),
      L('Branch 1: + → r1 → led1 → −. Branch 2: same with r2, led2.', 'شاخهٔ ۱: + ← مقاومت ۱ ← ال‌ای‌دی ۱ ← −. شاخهٔ ۲: همین با مقاومت ۲ و ال‌ای‌دی ۲.'),
      L('Both LEDs bright = parallel success.', 'هر دو تمام‌نور شدند؟ یعنی موازی را درست بستی!'),
    ],
    daily: false,
  },
  {
    id: 'ch-button-alarm',
    kind: 'build',
    title: L('SOS buzzer', 'بوقِ اضطراری'),
    emoji: '🚨',
    brief: L('Build a doorbell: pressing the button makes the buzzer sound.', 'یک زنگ در بساز: با فشارِ دکمه، بوق‌زن صدا بدهد.'),
    startCircuit: doc(
      [
        c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
        c('button', 'bt1', { x: 340, y: 220 }),
        c('buzzer', 'bz1', { x: 520, y: 220 }),
      ],
      [],
    ),
    goal: g.and(g.buzzerOn('bz1'), g.noShort()),
    hints: [
      L('Loop: + → button → buzzer(+) , buzzer(−) → −.', 'مسیر: + ← دکمه ← بوق‌زن(+) و بوق‌زن(−) ← −.'),
      L('The buzzer has polarity: + goes toward the button.', 'بوق‌زن قطبیت دارد: سرِ + باید سمتِ دکمه باشد.'),
      L('Run it, then press and HOLD the button.', 'مدار را روشن کن و بعد دکمه را فشار بده و نگه دار.'),
    ],
    daily: false,
  },
];
