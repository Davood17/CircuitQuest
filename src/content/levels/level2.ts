import type { Lesson } from '../types';
import { c, w, doc, g, L } from '../helpers';

export const LEVEL2_LESSONS: Lesson[] = [
  {
    // moved from level 1 per the user's curriculum: the multimeter opens the Detective chapter
    id: 'l2-1',
    levelId: 'level2',
    title: L("The detective's magic tool: the multimeter", 'ابزار جادویی کارآگاه: مولتی‌متر'),
    emoji: '🔍',
    difficulty: 2,
    minutes: 8,
    objectives: [L('Measure voltage with probes', 'ولتاژ را با مولتی‌متر بسنج')],
    screens: [
      {
        type: 'explain',
        title: L('The detective tool', 'ابزارِ کارآگاهی'),
        body: L(
          'A multimeter measures voltage (V), current (A) and resistance (Ω) — the three clues of every circuit mystery. In this app: open the multimeter, pick Voltage, and tap two points. The meter shows the push between them.',
          'مولتی‌متر ابزارِ کارآگاهیِ ماست: سه چیز را می‌سنجد — ولتاژ (V)، جریان (A) و مقاومت (Ω). در این اپ: مولتی‌متر را باز کن، حالت V را بزن و روی دو نقطه از مدار بزن؛ فشارِ برق بین آن دو را نشان می‌دهد.',
        ),
        scene: { kind: 'multimeter-face' },
      },
      {
        type: 'build',
        title: L('Build: probe the battery', 'بساز: باتری را اندازه بگیر'),
        body: L(
          'Open the multimeter (V mode), tap the battery + pin and then the − pin. A 9 V battery should read about 9 volts.',
          'مولتی‌متر را باز کن و حالت V را بزن. اول روی پایهٔ + باتری بزن، بعد روی پایهٔ −. باید حدود ۹ ولت نشان دهد.',
        ),
        task: {
          brief: L('Measure the battery voltage with the multimeter probes.', 'ولتاژ باتری را با مولتی‌متر اندازه بگیر.'),
          goal: g.and(g.probeWithin(8.5, 9.5), g.usedMultimeter()),
          startCircuit: doc([c('battery', 'b1', { params: { voltage: 9 }, x: 300, y: 200 })], []),
          allowed: ['battery'],
          hints: [
            L('Tap the multimeter button to open it, choose Voltage.', 'دکمهٔ مولتی‌متر (بالای صفحه) را بزن تا باز شود و حالت V را انتخاب کن.'),
            L('Tap probe A on the + pin, probe B on the − pin.', 'اول روی پایهٔ + بزن (پروب اول)، بعد روی − (پروب دوم).'),
            L('The reading should be ≈ 9 V (a tiny bit less, because of internal resistance).', 'عدد باید حدود ۹ ولت باشد؛ یک‌ذره کمتر هم طبیعی است.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Which is NOT a multimeter mode?', 'کدام حالتِ مولتی‌متر نیست؟'),
        options: [L('Brightness', 'درخشش'), L('Voltage', 'ولتاژ'), L('Current', 'جریان'), L('Resistance', 'مقاومت')],
        answer: 0,
        explanation: L('V, A, Ω — brightness is not on the dial.', 'مولتی‌متر V و A و Ω دارد؛ «درخشش» ندارد!'),
      },
      {
        type: 'trueFalse',
        prompt: L('To measure voltage you touch the two probes to two points.', 'برای سنجیدن ولتاژ، دو پروب را روی دو نقطه می‌گذاریم.'),
        answer: true,
        explanation: L('Voltage is measured ACROSS two points, in parallel.', 'ولتاژ همیشه بینِ دو نقطه سنجیده می‌شود؛ مدار هم باید روشن بماند.'),
      },

      {
        type: 'mcq',
        prompt: L('Voltage is measured in volts (V). Which reading mode do you pick on the multimeter dial?', 'ولتاژ با یکای ولت (V) سنجیده می‌شود. روی صفحهٔ مولتی‌متر کدام حالت را انتخاب می‌کنی؟'),
        options: [
          L('⚡ The V mode (voltage)', '⚡ حالت V (ولتاژ)'),
          L('🌊 The A mode (current)', '🌊 حالت A (جریان)'),
          L('🚧 The Ω mode (resistance)', '🚧 حالت Ω (مقاومت)'),
        ],
        answer: 0,
        explanation: L('Exactly! Each detective mission has its own mode: V for the push, A for the flow, Ω for the brake. Pick the right tool before you probe!', 'دقیقاً! هر مأموریت کارآگاهی حالت خودش را دارد: V برای فشار، A برای جریان، Ω برای ترمز. قبل از پروب زدن ابزار درست را بردار!'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l2-2',
    levelId: 'level2',
    title: L('Series circuits (the electron train)', 'مدارهای سری (قطار الکترون‌ها)'),
    emoji: '🚂',
    difficulty: 2,
    minutes: 9,
    objectives: [L('Build a series circuit', 'مدارِ سری بساز'), L('Predict what happens to brightness', 'حدس بزن نور چه می‌شود')],
    screens: [
      {
        type: 'explain',
        title: L('One after another', 'یکی پشتِ دیگری'),
        body: L(
          'In a series circuit, parts sit in a single line: the same current marches through ALL of them, one after another. Add more parts and they share the battery push — two LEDs in series with 9 V get about 4.5 V each, so each glows dimmer.',
          'در مدارِ سری، قطعه‌ها پشت‌سرِ هم قرار می‌گیرند و همهٔ جریان از تک‌تکِ آن‌ها رد می‌شود. ولی ولتاژِ باتری بین‌شان تقسیم می‌شود: دو ال‌ای‌دیِ سری با باتری ۹ ولت، هرکدام حدود ۴٫۵ ولت می‌گیرند؛ برای همین هر دو کم‌نورتر می‌درخشند.',
        ),
        scene: { kind: 'series-parallel', props: { mode: 'series' } },
        tip: L('In series: same CURRENT through every part; voltages share.', 'قانونِ سری: جریانِ همهٔ قطعه‌ها یکی است، ولی ولتاژ بین‌شان تقسیم می‌شود.'),
      },
      {
        type: 'build',
        title: L('Build: two in a row', 'بساز: دوتا پشت‌سرهم'),
        body: L(
          'Build one loop with TWO LEDs in series (plus a resistor). Run it — both glow, but dimmer than one LED alone.',
          'یک مسیر بساز که دو ال‌ای‌دی پشت‌سرِ هم باشند (با مقاومت). روشنش کن: هر دو روشن می‌شوند ولی کم‌نورتر از وقتی که یکی بود.',
        ),
        task: {
          brief: L('Light two LEDs in series with one resistor and a 9 V battery.', 'دو ال‌ای‌دی را پشت‌سرِ هم با یک مقاومت و باتری ۹ ولت روشن کن.'),
          goal: g.and(g.battery(), g.present('led', 2), g.ledOn('led1'), g.ledOn('led2'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 120, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 220 }, x: 330, y: 220 }),
              c('led', 'led1', { x: 530, y: 220 }),
              c('led', 'led2', { x: 710, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('One loop: battery → resistor → LED1 → LED2 → back to battery.', 'یک مسیر: باتری ← مقاومت ← ال‌ای‌دی ۱ ← ال‌ای‌دی ۲ ← برگشت به باتری.'),
            L('Keep both LEDs pointing the same way around the loop.', 'هر دو ال‌ای‌دی را یک‌طرفه بچین (پایهٔ بلندِ هر دو سمتِ +).'),
            L('With two red LEDs (~1.8 V each) try 220–330 Ω.', 'برای دو ال‌ای‌دی قرمز، مقاومت ۲۲۰ یا ۳۳۰ اهم خوب است.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('In a series circuit, the current through every part is…', 'در مدارِ سری، جریانی که از قطعه‌ها رد می‌شود…'),
        options: [L('The same', 'همه‌جا یکسان است'), L('Different', 'فرق دارد'), L('Zero', 'صفر است'), L('Infinite', 'بی‌نهایت است')],
        answer: 0,
        explanation: L('One path → one current everywhere.', 'فقط یک راه هست؛ پس همه‌جا یک جریان.'),
      },
      {
        type: 'mcq',
        prompt: L('Two identical LEDs in series compared to one alone are…', 'دو ال‌ای‌دیِ سری در مقایسه با یک ال‌ای‌دیِ تنها…'),
        options: [L('Dimmer each', 'هرکدام کم‌نورتر'), L('Brighter each', 'هرکدام درخشان‌تر'), L('Off', 'خاموش'), L('Same brightness', 'همان‌قدر درخشان')],
        answer: 0,
        explanation: L('They share the battery voltage, so each gets less push.', 'ولتاژِ باتری را بین خودشان تقسیم می‌کنند؛ پس هرکدام فشارِ کمتری می‌گیرند.'),
      },
      {
        type: 'trueFalse',
        prompt: L('If one part of a series loop disconnects, everything stops.', 'اگر یک قطعه از مسیرِ سری جدا شود، همه‌چیز می‌ایستد.'),
        answer: true,
        explanation: L('One single path: break it anywhere = no current at all.', 'چون فقط یک راه هست؛ یک‌جایش قطع شود، دیگر هیچ جریانی رد نمی‌شود.'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l2-3',
    levelId: 'level2',
    title: L('Parallel circuits (the many-road junction)', 'مدارهای موازی (جاده‌های چندمسیره)'),
    emoji: '🛣️',
    difficulty: 2,
    minutes: 9,
    objectives: [L('Build a parallel circuit', 'مدارِ موازی بساز'), L('Compare parallel vs series brightness', 'نورِ موازی و سری را مقایسه کن')],
    screens: [
      {
        type: 'explain',
        title: L('Many roads', 'چند راهِ جدا'),
        body: L(
          'In a parallel circuit, parts sit side by side, each on its OWN branch between the same two points. Every branch gets the FULL battery voltage — so parallel LEDs glow at full brightness. Your house is wired in parallel: every lamp gets the full 220 V!',
          'در مدارِ موازی، هر قطعه شاخهٔ خودش را دارد و همهٔ شاخه‌ها بین دو نقطهٔ مشترک وصل‌اند. نکتهٔ جالب: هر شاخه، ولتاژِ کاملِ باتری را می‌گیرد؛ پس ال‌ای‌دی‌ها تمام‌نور می‌درخشند. برقِ خانه‌تان هم موازی است: هر لامپ برقِ کامل را می‌گیرد و با خاموش‌شدنِ یکی، بقیه روشن می‌مانند.',
        ),
        scene: { kind: 'series-parallel', props: { mode: 'parallel' } },
        tip: L('In parallel: same VOLTAGE across every branch; currents add up.', 'قانونِ موازی: ولتاژِ همهٔ شاخه‌ها یکی است؛ جریان‌های شاخه‌ها با هم جمع می‌شوند.'),
      },
      {
        type: 'build',
        title: L('Build: side by side', 'بساز: کنار هم'),
        body: L(
          'Give each LED its own branch with its own resistor. Both should glow BRIGHTLY — brighter than your series build!',
          'برای هر ال‌ای‌دی یک شاخهٔ جدا با مقاومتِ خودش بساز. هر دو باید تمام‌نور بدرخشند — درخشان‌تر از مدارِ سری!',
        ),
        task: {
          brief: L('Light two LEDs in parallel, each with its own resistor.', 'دو ال‌ای‌دی را موازی روشن کن؛ هرکدام با مقاومتِ خودش.'),
          goal: g.and(g.battery(), g.present('led', 2), g.ledOn('led1'), g.ledOn('led2'), g.ledCurrentSafe('led1'), g.ledCurrentSafe('led2'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 120, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 340, y: 120 }),
              c('led', 'led1', { x: 560, y: 120 }),
              c('resistor', 'r2', { params: { resistance: 470 }, x: 340, y: 280 }),
              c('led', 'led2', { x: 560, y: 280 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Battery + goes to BOTH resistors; both LEDs return to battery −.', '+ باتری به هر دو مقاومت وصل شود و پایهٔ دیگرِ هر دو شاخه به − برگردد.'),
            L('Each branch: + → resistor → LED → −. Two separate stories, same ending.', 'هر شاخه این‌طوری است: + ← مقاومت ← ال‌ای‌دی ← −. دو راهِ جدا که از یک جا شروع می‌شوند و به یک جا می‌رسند.'),
            L('Check both mA readings — each branch should stay under 20 mA.', 'هر دو عدد mA را چک کن؛ هر شاخه باید زیر ۲۰ بماند.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('In parallel, every branch gets…', 'در مدارِ موازی، هر شاخه می‌گیرد…'),
        options: [L('The full battery voltage', 'ولتاژِ کاملِ باتری'), L('Half the voltage always', 'همیشه نصفِ ولتاژ'), L('No current', 'هیچ جریانی'), L('Only 1 V', 'فقط ۱ ولت')],
        answer: 0,
        explanation: L('That is why parallel LEDs glow at full brightness.', 'برای همین است که ال‌ای‌دی‌های موازی تمام‌نور می‌درخشند.'),
      },
      {
        type: 'diagnose',
        prompt: L('Two LEDs in SERIES look dim. What fix makes them bright?', 'دو ال‌ای‌دیِ سری کم‌نورند. چه کار کنی که درخشان شوند؟'),
        circuit: doc(
          [
            c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 200 }),
            c('resistor', 'r1', { params: { resistance: 220 }, x: 330, y: 200 }),
            c('led', 'led1', { x: 520, y: 200 }),
            c('led', 'led2', { x: 690, y: 200 }),
          ],
          [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'led1', 'anode'), w('w3', 'led1', 'cathode', 'led2', 'anode'), w('w4', 'led2', 'cathode', 'b1', 'neg')],
        ),
        options: [
          L('Rewire them in parallel, each with its own resistor', 'موازیشان کن؛ هرکدام با مقاومتِ خودش'),
          L('Remove the resistor completely', 'مقاومت را کلاً بردار'),
          L('Use a 1.5 V battery', 'باتری ۱٫۵ ولتی بگذار'),
          L('It is impossible', 'غیرممکن است'),
        ],
        answer: 0,
        explanation: L('Parallel gives each LED the full 9 V (with its own resistor for safety).', 'در حالتِ موازی، هر ال‌ای‌دی ولتاژِ کامل را می‌گیرد (البته هرکدام با مقاومتِ خودش).'),
      },
      {
        type: 'trueFalse',
        prompt: L('Homes are wired in parallel.', 'برقِ خانه‌ها موازی سیم‌کشی می‌شود.'),
        answer: true,
        explanation: L('Every device gets full voltage and works independently.', 'هر وسیله برقِ کامل می‌گیرد و کارِ هرکدام مستقل از بقیه است.'),
      },
    ],
    unlockLessonIds: ['l2-2'],
  },
  {
    id: 'l2-4',
    levelId: 'level2',
    title: L('Voltage detective (measuring the push)', 'کارآگاه ولتاژ (اندازه‌گیری فشار برق)'),
    emoji: '📏',
    difficulty: 2,
    minutes: 8,
    objectives: [L('Measure voltage across parts', 'ولتاژِ دو سرِ قطعه‌ها را بسنج')],
    screens: [
      {
        type: 'explain',
        title: L('Voltage lives ACROSS parts', 'ولتاژ بینِ دو نقطه است'),
        body: L(
          'Voltage is always a difference between TWO points. In a series loop the battery push splits: some across the resistor, some across the LED. Add them up and you get the battery voltage back — voltage always balances!',
          'ولتاژ همیشه «بینِ دو نقطه» معنا دارد؛ مثل ارتفاع: می‌گوییم کوه از دریاچه چقدر بلندتر است. در مسیرِ سری، فشارِ باتری بین قطعه‌ها تقسیم می‌شود: بخشی دو سرِ مقاومت و بخشی دو سرِ ال‌ای‌دی می‌افتد. این دو عدد را جمع کنی، می‌شود ولتاژِ باتری!',
        ),
        scene: { kind: 'voltage-share' },
      },
      {
        type: 'build',
        title: L('Build: hunt the volts', 'بساز: شکار ولت‌ها'),
        body: L(
          'Run the circuit, open the multimeter (Voltage), and measure across the resistor and across the LED. The two readings should add up to ≈ 9 V.',
          'مدار را روشن کن، مولتی‌متر را در حالت V باز کن و دو پایهٔ ال‌ای‌دی را بسنج؛ بعد دو پایهٔ مقاومت را. جمعِ دو عدد باید حدود ۹ شود.',
        ),
        task: {
          brief: L('Measure the LED voltage: expect about 1.8 V (a red LED doing its job).', 'ولتاژِ دو سرِ ال‌ای‌دی را اندازه بگیر: باید حدود ۱٫۸ ولت شود.'),
          goal: g.and(g.probeWithin(1.5, 2.1), g.usedMultimeter()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 370, y: 220 }),
              c('led', 'led1', { x: 590, y: 220 }),
            ],
            [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'led1', 'anode'), w('w3', 'led1', 'cathode', 'b1', 'neg')],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Voltmeter mode → tap one LED pin, then the other LED pin.', 'در حالت V، روی یک پایهٔ ال‌ای‌دی بزن و بعد روی پایهٔ دیگرش.'),
            L('An LED that is ON holds its forward voltage: ~1.8 V for red.', 'ال‌ای‌دیِ روشن همیشه حدود ۱٫۸ ولت (قرمز) نگه می‌دارد.'),
            L('Do not worry about probe order — the meter shows absolute values.', 'ترتیبِ زدنِ پایه‌ها مهم نیست؛ عدد همیشه مثبت نشان داده می‌شود.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Series drops: battery 9 V, LED takes 1.8 V. The resistor takes…', 'باتری ۹ ولت است و ال‌ای‌دی ۱٫۸ ولت برمی‌دارد. سهمِ مقاومت چقدر است؟'),
        options: [L('7.2 V', '۷٫۲ ولت'), L('9 V', '۹ ولت'), L('1.8 V', '۱٫۸ ولت'), L('0 V', '۰ ولت')],
        answer: 0,
        explanation: L('Drops add up to the source: 9 = 1.8 + 7.2.', 'سهم‌ها با هم می‌شوند ولتاژِ باتری: ۱٫۸ + ۷٫۲ = ۹.'),
      },
      {
        type: 'trueFalse',
        prompt: L('You measure voltage by placing probes at two points.', 'برای سنجیدن ولتاژ، دو پروب را روی دو نقطه می‌گذاریم.'),
        answer: true,
        explanation: L('Across two points, never breaking the loop.', 'درست؛ بدون این‌که مدار را باز کنیم.'),
      },

      {
        type: 'mcq',
        prompt: L('In a series loop, the voltages across the parts add up to what number?', 'در حلقهٔ سری، ولتاژهای روی قطعات به چه عددی جمع می‌شوند؟'),
        options: [
          L('🔋 Exactly the battery voltage', '🔋 دقیقاً ولتاژ باتری'),
          L('0️⃣ Always zero', '0️⃣ همیشه صفر'),
          L('✖️ Twice the battery voltage', '✖️ دو برابر ولتاژ باتری'),
        ],
        answer: 0,
        explanation: L('Beautiful — that is the voltage detective rule! The battery hands out its whole voltage to the parts of the loop: their shares always add up to it exactly.', 'قشنگ بود — این قانون کارآگاه ولتاژ است! باتری تمام ولتاژش را بین قطعه‌های حلقه پخش می‌کند: سهم‌ها همیشه دقیقاً به آن جمع می‌شوند.'),
      },
    ],
    unlockLessonIds: ['l2-1'],
  },
  {
    id: 'l2-5',
    levelId: 'level2',
    title: L('Current detective (measuring the flow)', 'کارآگاه جریان (اندازه‌گیری سرعت برق)'),
    emoji: '🧮',
    difficulty: 2,
    minutes: 8,
    objectives: [L('Measure current in-line with the ammeter', 'جریان را با آمپرمتر داخل مسیر بسنج')],
    screens: [
      {
        type: 'explain',
        title: L('Current flows THROUGH', 'جریان از «درونِ» قطعه می‌گذرد'),
        body: L(
          'Unlike voltage, current is measured THROUGH the path: you must open the loop and insert the ammeter in-line, so the same current flows through the meter. (Voltage probes just touch; the ammeter becomes part of the road.)',
          'جریان را نمی‌شود از دور اندازه گرفت؛ آمپرمتر باید خودش بخشی از مسیر شود: جای یکی از سیم‌ها، آمپرمتر را می‌گذاریم تا همان جریان از درونش رد شود. (ولتاژ را فقط با لمسِ دو نقطه می‌گرفتیم؛ جریان فرق دارد!)',
        ),
        scene: { kind: 'ammeter-inline' },
      },
      {
        type: 'build',
        title: L('Build: insert the ammeter', 'بساز: آمپرمتر را داخل مسیر بگذار'),
        body: L(
          'Wire the ammeter IN SERIES in the loop, run it, and read the current. With 9 V and 470 Ω expect ≈ 15 mA.',
          'آمپرمتر را داخل مسیر بگذار (پشت‌سرِ بقیه)، مدار را روشن کن و عددش را بخوان. با باتری ۹ ولت و مقاومت ۴۷۰ اهم، حدود ۱۵ میلی‌آمپر می‌شود.',
        ),
        task: {
          brief: L('Measure the loop current with the ammeter in-line.', 'جریانِ مدار را با آمپرمتر اندازه بگیر.'),
          goal: g.and(g.has('a1'), g.currentWithin('a1', 8, 22), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 360, y: 220 }),
              c('led', 'led1', { x: 570, y: 220 }),
              c('ammeter', 'a1', { x: 760, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'resistor', 'led', 'ammeter'],
          hints: [
            L('All four parts in ONE loop — the ammeter is just another series part.', 'هر چهار قطعه در یک مسیر باشند؛ آمپرمتر هم مثل بقیه پشت‌سرِ هم.'),
            L('The ammeter shows its own mA reading when running.', 'آمپرمتر وقتی مدار روشن باشد، عدد mA را روی خودش نشان می‌دهد.'),
            L('≈ 15 mA? Perfect — the same current flows through every part.', 'حدود ۱۵ میلی‌آمپر؟ عالی! همین جریان از همهٔ قطعه‌ها رد می‌شود.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('To measure current you must…', 'برای اندازه‌گیری جریان باید…'),
        options: [L('Open the loop and insert the meter in-line', 'آمپرمتر را داخلِ مسیر بگذاری'), L('Touch two probes to the battery', 'دو پروب را روی باتری بگذاری'), L('Turn everything off', 'همه‌چیز را خاموش کنی'), L('Use two ammeters', 'دو آمپرمتر بگذاری')],
        answer: 0,
        explanation: L('Current must flow THROUGH the meter.', 'جریان باید از درونِ آمپرمتر رد شود.'),
      },
      {
        type: 'trueFalse',
        prompt: L('In a series loop, the ammeter reads the same wherever you insert it.', 'در مسیرِ سری، آمپرمتر هرجا بگذاری همان عدد را نشان می‌دهد.'),
        answer: true,
        explanation: L('Series current is identical everywhere.', 'چون جریانِ مسیرِ سری همه‌جا یکسان است.'),
      },

      {
        type: 'mcq',
        prompt: L('A happy, well-protected LED usually carries a current of about…', 'یک LEDِ سالم و خوب‌محافظت‌شده معمولاً جریانی حدود… دارد؟'),
        options: [
          L('🐜 10 to 20 milliamps', '🐜 ۱۰ تا ۲۰ میلی‌آمپر'),
          L('🐘 5 full amps', '🐘 ۵ آمپر کامل'),
          L('💧 About 100 milliamps', '💧 حدود ۱۰۰ میلی‌آمپر'),
        ],
        answer: 0,
        explanation: L('Right! The little LED is happy with a small, calm ant-sized current (10–20 mA). A fat amp-level current would fry it instantly!', 'درست است! LED کوچولوی ما با جریانِ کم و آرومِ مورچه‌سایز (۱۰ تا ۲۰ میلی‌آمپر) خوشحال است. جریانِ فیل‌سایزِ آمپری، یک‌دفعه نانی‌اش می‌کند!'),
      },
    ],
    unlockLessonIds: ['l2-4'],
  },
  {
    id: 'l2-6',
    levelId: 'level2',
    title: L("Ohm's law (voltage, current & resistance — best friends)", 'قانون اهم (دوستی ولتاژ، جریان و مقاومت)'),
    emoji: '🦸‍♂️',
    difficulty: 2,
    minutes: 9,
    objectives: [L('Use V = I × R', 'از فرمول V = I × R استفاده کن')],
    screens: [
      {
        type: 'explain',
        title: L('The magic triangle', 'مثلثِ جادویی'),
        body: L(
          'Ohm discovered the rule that ties our three friends together: V = I × R. Push (voltage) equals flow (current) times squeeze (resistance). Cover the one you want: I = V ÷ R, or R = V ÷ I. With it you can PREDICT circuits before building them!',
          'آقای «اهم» یک قانونِ جادویی کشف کرد که این سه را به هم وصل می‌کند: V = I × R. یعنی: فشار (ولتاژ) = جریان × مقاومت. با این قانون می‌توانی قبل از ساختنِ مدار، دقیقاً پیش‌بینی کنی چه می‌شود! اگر یکی از سه‌تا را خواستی: I = V ÷ R یا R = V ÷ I.',
        ),
        scene: { kind: 'ohm-triangle' },
        tip: L('9 V ÷ 470 Ω = 0.019 A = 19 mA — exactly what your ammeter showed!', 'مثال: ۹ ÷ ۴۷۰ = ۰٫۰۱۹ آمپر؛ یعنی ۱۹ میلی‌آمپر — دقیقاً همان عددی که آمپرمتر نشان داد!'),
      },
      {
        type: 'demo',
        title: L('Play with the law', 'با قانون بازی کن'),
        body: L('Change the resistor. The simulator computes I = V ÷ R live — check the mA!', 'مقاومت را عوض کن؛ شبیه‌ساز همان لحظه فرمولِ I = V ÷ R را حساب می‌کند. به mA نگاه کن!'),
        demo: {
          circuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 380, y: 210 }),
            ],
            [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'b1', 'neg')],
          ),
          controls: [
            { componentId: 'r1', param: 'resistance', label: L('R (Ω)', 'R (Ω)'), min: 100, max: 2000, step: 10 },
            { componentId: 'b1', param: 'voltage', label: L('V (volts)', 'V (ولت)'), min: 1.5, max: 9, step: 1.5 },
          ],
          watch: ['r1'],
          caption: L('I = V ÷ R — the mA badge on the battery obeys Ohm every time.', 'I = V ÷ R — عددِ mA روی باتری همیشه از قانونِ اهم پیروی می‌کند.'),
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('9 V across 900 Ω gives a current of…', '۹ ولت با مقاومتِ ۹۰۰ اهم، چند جریان می‌دهد؟'),
        options: [L('10 mA', '۱۰ میلی‌آمپر'), L('90 mA', '۹۰ میلی‌آمپر'), L('1 A', '۱ آمپر'), L('0.1 mA', '۰٫۱ میلی‌آمپر')],
        answer: 0,
        explanation: L('I = 9 ÷ 900 = 0.01 A = 10 mA.', 'I = ۹ ÷ ۹۰۰ = ۰٫۰۱ آمپر = ۱۰ میلی‌آمپر.'),
      },
      {
        type: 'mcq',
        prompt: L('You want LESS current. Do you…', 'جریانِ کمتری می‌خواهی. چه می‌کنی؟'),
        options: [L('Increase R', 'مقاومت را بیشتر می‌کنی'), L('Decrease R', 'مقاومت را کم می‌کنی'), L('Add more LEDs', 'ال‌ای‌دی بیشتری می‌گذاری'), L('Nothing can help', 'هیچ راهی نیست')],
        answer: 0,
        explanation: L('I = V ÷ R: bigger R → smaller I.', 'چون I = V ÷ R؛ مقاومتِ بیشتر یعنی جریانِ کمتر.'),
      },
      {
        type: 'trueFalse',
        prompt: L('Ohm\'s law: V = I × R.', 'قانون اهم: V = I × R.'),
        answer: true,
        explanation: L('The most used formula in electronics!', 'پرکاربردترین فرمول الکترونیک!'),
      },
    ],
    unlockLessonIds: ['l2-4', 'l2-5'],
  },
  {
    id: 'l2-7',
    levelId: 'level2',
    title: L('Why does the LED need a resistor? (Rescue the LED from burning!)', 'چرا LED به مقاومت نیاز دارد؟ (نجات LED از سوختن!)'),
    emoji: '🛡️',
    difficulty: 2,
    minutes: 8,
    objectives: [L('See an LED fail without a resistor', 'ببین ال‌ای‌دی بدون مقاومت چه می‌شود'), L('Calculate a safe resistor', 'مقاومتِ امن را حساب کن')],
    screens: [
      {
        type: 'explain',
        title: L('The LED is greedy', 'ال‌ای‌دی حریص است!'),
        body: L(
          'Here is a secret: an LED takes whatever current it can get. Connect one straight to 9 V and the current rockets way past 20 mA — real LEDs burn out! The resistor is the LED\'s bodyguard: R = (Vbattery − Vf) ÷ Isafe. For 9 V, red LED: (9 − 1.8) ÷ 0.02 = 360 Ω → use 470 Ω for margin.',
          'یک راز: ال‌ای‌دی حریص است! هر جریانی که بتوانید بهش می‌خورد. اگر مستقیم به باتری ۹ ولت وصلش کنی، جریان خیلی زیاد می‌شود و ال‌ای‌دی واقعی می‌سوزد. مقاومت، محافظِ ال‌ای‌دی است. فرمولش: R = (ولتاژِ باتری − ولتاژِ ال‌ای‌دی) ÷ جریانِ امن. برای ۹ ولت و ال‌ای‌دیِ قرمز: (۹ − ۱٫۸) ÷ ۰٫۰۲ = ۳۶۰ اهم؛ ما ۴۷۰ اهم می‌گذاریم تا مطمئن‌تر باشد.',
        ),
        scene: { kind: 'bodyguard' },
      },
      {
        type: 'build',
        title: L('Build: rescue the LED', 'بساز: نجاتِ ال‌ای‌دی'),
        body: L(
          'This LED has NO resistor — run it and read the warning! Then add a resistor in series to bring the current back under 20 mA.',
          'این ال‌ای‌دی مقاومت ندارد! مدار را روشن کن و هشدار را بخوان. بعد یک مقاومت داخل مسیر اضافه کن تا جریان به زیر ۲۰ میلی‌آمپر برگردد.',
        ),
        task: {
          brief: L('Add a resistor so the LED current lands in the safe 2–20 mA zone.', 'یک مقاومت اضافه کن تا جریانِ ال‌ای‌دی به محدودهٔ امن (۲ تا ۲۰ میلی‌آمپر) برود.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 170, y: 220 }),
              c('led', 'led1', { x: 470, y: 220 }),
            ],
            [w('w1', 'b1', 'pos', 'led1', 'anode'), w('w2', 'led1', 'cathode', 'b1', 'neg')],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Run it first: the diagnostic card screams "overcurrent".', 'اول روشنش کن: کارتِ هشدار می‌گوید جریان خیلی زیاد است.'),
            L('Pick the WIRE tool? No — pick a RESISTOR from the parts panel.', 'از پنلِ قطعه‌ها، «مقاومت» را بردار و روی صفحه بگذار.'),
            L('Wire it in series anywhere in the loop. 470 Ω is a great choice.', 'آن را هر جای مسیر، پشت‌سرِ بقیه وصل کن. مقدارِ ۴۷۰ اهم عالی است.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('LED bodyguard formula: R =', 'فرمولِ محافظِ ال‌ای‌دی: R ='),
        options: [L('(Vbattery − Vf) ÷ Isafe', '(ولتاژ باتری − ولتاژ ال‌ای‌دی) ÷ جریانِ امن'), L('Vbattery × 100', 'ولتاژ باتری × ۱۰۰'), L('Any value is fine', 'هر عددی خوب است'), L('Vf ÷ Vbattery', 'ولتاژ ال‌ای‌دی ÷ ولتاژ باتری')],
        answer: 0,
        explanation: L('(9 − 1.8) ÷ 0.02 A = 360 Ω minimum → we chose 470 Ω.', '(۹ − ۱٫۸) ÷ ۰٫۰۲ = ۳۶۰ اهم؛ حداقلِ لازم. ما ۴۷۰ گذاشتیم تا مطمئن‌تر باشد.'),
      },
      {
        type: 'mcq',
        prompt: L('Without a resistor on 9 V, an LED…', 'بدون مقاومت روی ۹ ولت، ال‌ای‌دی…'),
        options: [L('Draws destructive current', 'جریانِ زیادی می‌کشد و می‌سوزد'), L('Stays cool and happy', 'خنک و خوشحال می‌ماند'), L('Changes color', 'رنگ عوض می‌کند'), L('Uses no current', 'جریانی نمی‌کشد')],
        answer: 0,
        explanation: L('Real LEDs would burn out — our simulator warns you instead.', 'ال‌ای‌دی واقعی می‌سوزد؛ شبیه‌سازِ ما به‌جای سوزاندن، هشدار می‌دهد!'),
      },

      {
        type: 'trueFalse',
        prompt: L('The LED bodyguard formula: resistor = (battery voltage − LED voltage) ÷ the current we allow.', 'فرمول بادیگارد LED: مقاومت = (ولتاژ باتری − ولتاژ LED) ÷ جریانی که اجازه می‌دهیم.'),
        answer: true,
        explanation: L('Exactly the rescue formula! Whatever the battery pushes but the LED cannot use, the resistor must politely eat up as ohms.', 'دقیقاً فرمول نجات است! هرچه باتری هول می‌کند ولی LED نمی‌تواند استفاده کند، مقاومت باید مؤدبانه با اُهم‌هایش بخورد!'),
      },
    ],
    unlockLessonIds: ['l2-6'],
  },

  {
    id: 'l2-8',
    levelId: 'level2',
    title: L("The troubleshooting room (why won't my circuit work?)", 'اتاق عیب‌یابی (چرا مدارم کار نمی‌کنه؟)'),
    emoji: '🕵️',
    difficulty: 2,
    minutes: 9,
    objectives: [L('Follow a detective method for broken circuits', 'مثل کارآگاه مدارِ خراب را بررسی کن')],
    screens: [
      {
        type: 'explain',
        title: L('Think like a detective', 'مثل کارآگاه فکر کن'),
        body: L(
          'Every broken circuit tells a story. Follow the steps: 1) What SHOULD happen? 2) Run it and OBSERVE. 3) Read the diagnostics — they are your witness statements. 4) Change ONE thing at a time. 5) Test again. Real engineers fix circuits exactly this way!',
          'هر مدارِ خراب یک داستان دارد. مثل کارآگاه قدم‌به‌قدم جلو برو: ۱) اول فکر کن چه انتظاری داری. ۲) مدار را روشن کن و خوب نگاه کن. ۳) کارت‌های هشدار را بخوان؛ سرنخ‌های تو هستند. ۴) هر بار فقط یک چیز را عوض کن. ۵) دوباره امتحان کن. مهندس‌های واقعی هم دقیقاً همین‌طور مدار تعمیر می‌کنند!',
        ),
        scene: { kind: 'detective-steps' },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Best first step when a circuit is dead?', 'وقتی مدار اصلاً کار نمی‌کند، اولین قدم چیست؟'),
        options: [L('Check the loop is complete and the battery is in', 'ببین مسیر کامل است و باتری سرِ جایش هست'), L('Throw away the LED', 'ال‌ای‌دی را دور بیندازی'), L('Add more batteries', 'باتری بیشتری اضافه کنی'), L('Shake it', 'تکانش بدهی')],
        answer: 0,
        explanation: L('Complete loop first, then measure, then change one thing.', 'اول مسیرِ کامل، بعد اندازه‌گیری، بعد فقط یک تغییر در هر آزمایش.'),
      },
      {
        type: 'mcq',
        prompt: L('How many things should you change between tests?', 'بین هر دو آزمایش، چند چیز را عوض می‌کنی؟'),
        options: [L('Exactly one', 'دقیقاً یکی'), L('All at once', 'همه با هم'), L('At least three', 'حداقل سه‌تا'), L('None, just re-run', 'هیچ، فقط دوباره روشن می‌کنی')],
        answer: 0,
        explanation: L('One change per test = you always know what worked.', 'هر بار یک تغییر، تا بدانی دقیقاً کدام تغییر جواب داد.'),
      },

      {
        type: 'trueFalse',
        prompt: L('A good detective never changes everything at once — one careful change per test tells you exactly what fixed it.',
                  'کارآگاهِ خوب هیچ‌وقت همه‌چیز را با هم عوض نمی‌کند — هر بار یک تغییرِ دقیق، دقیقاً می‌گوید چه چیزی مشکل را حل کرد.'),
        answer: true,
        explanation: L('That is the golden detective rule: change one thing, run, observe. Your notes and your brain stay clean and smart!',
                       'این قانون طلایی کارآگاهی است: یک چیز را عوض کن، اجرا کن، ببین. دفترچه و مغزت تمیز و باهوش می‌ماند!'),
      },
    ],
    unlockLessonIds: ['l2-2', 'l2-3'],
  },
  {
    // TODO(user-script): content of this grand project (find & fix a broken circuit)
    // is pending — the screens/quiz below are placeholders from the old dimmer lesson.
    id: 'l2-9',
    levelId: 'level2',
    title: L('Detective grand project: find & fix a broken circuit', 'پروژهٔ بزرگ کارآگاه: عیب‌یابی و تعمیر یک مدار خراب'),
    emoji: '🏆',
    difficulty: 3,
    minutes: 12,
    objectives: [L('Find and fix a broken circuit like a real detective', 'مثل یک کارآگاه واقعی مدارِ خراب را پیدا و تعمیر کن')],
    screens: [
      {
        type: 'explain',
        title: L('Meet the potentiometer', 'پتانسیومتر را بشناس'),
        body: L(
          'A potentiometer is an adjustable voltage divider — a resistor with a sliding wiper. Turn the knob and the wiper taps a different point: more or less voltage out. Volume knobs, light dimmers and joystick axes are all potentiometers!',
          'پتانسیومتر مقاومتی است که با دست کم و زیاد می‌شود؛ داخلش یک بازوی متحرک روی نوارِ مقاومت می‌لغزد. دسته را بچرخانی، ولتاژِ خروجی کم و زیاد می‌شود. ولومِ صدا، کم‌نورسازِ چراغ و اهرمِ جوی‌استیک همه پتانسیومترند!',
        ),
        scene: { kind: 'pot-demo' },
      },
      {
        type: 'build',
        title: L('Build: LED dimmer', 'بساز: کم‌نورسازِ ال‌ای‌دی'),
        body: L(
          'Wire the potentiometer (pins A and B across the battery, W to the LED through a resistor), run it, and slide the position. The LED should smoothly dim and brighten.',
          'پتانسیومتر را سیم‌کشی کن: پایه‌های A و B به دو سرِ باتری، و پایهٔ W از راه مقاومت به ال‌ای‌دی. مدار را روشن کن و اسلایدر روی پتانسیومتر را بکش؛ نورِ ال‌ای‌دی باید نرم کم و زیاد شود.',
        ),
        task: {
          brief: L('Control the LED brightness with the potentiometer slider (run mode).', 'نورِ ال‌ای‌دی را با اسلایدرِ پتانسیومتر کم و زیاد کن.'),
          goal: g.and(g.has('pot1'), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
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
          hints: [
            L('A and B are the ends: wire them to + and −. W is the wiper.', 'A و B دو سرِ مقاومت‌اند: به + و − وصل می‌شوند. W بازوی متحرک است.'),
            L('W → resistor → LED → back to −. Now sliding changes the push.', 'W ← مقاومت ← ال‌ای‌دی ← برگشت به −. حالا با کشیدنِ اسلایدر، نور عوض می‌شود.'),
            L('Run the circuit, then drag the % slider on the potentiometer itself.', 'مدار را روشن کن و بعد اسلایدرِ روی خودِ پتانسیومتر را بکش.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('A potentiometer is basically…', 'پتانسیومتر در واقع چه چیزی است؟'),
        options: [L('An adjustable voltage divider', 'یک مقاومتِ قابلِ تنظیم'), L('A second battery', 'باتری دوم'), L('A tiny motor', 'موتور ریز'), L('A louder buzzer', 'بوق بلندتر')],
        answer: 0,
        explanation: L('The wiper taps a sliding point on a resistance.', 'بازوی متحرکش، نقطه‌ای متغیر روی مقاومت را برمی‌دارد.'),
      },
      {
        type: 'trueFalse',
        prompt: L('Volume knobs are potentiometers.', 'ولومِ صدا یک پتانسیومتر است.'),
        answer: true,
        explanation: L('Sliding the wiper changes the signal level — exactly like your dimmer.', 'بازوی متحرک، سطحِ سیگنال را کم و زیاد می‌کند؛ دقیقاً مثل کم‌نورسازِ تو.'),
      },

      {
        type: 'mcq',
        prompt: L('A circuit that used to work is now dead. What is the FIRST thing the circuit detective checks?', 'مداری که قبلاً کار می‌کرد حالا خاموش است. کارآگاه مدار اول از همه چه چیزی را بررسی می‌کند؟'),
        options: [
          L('🔋 The battery and every connection in the loop', '🔋 باتری و تمام اتصال‌های حلقه'),
          L('🛒 Buys ten new parts right away', '🛒 فوراً ده قطعهٔ نو می‌خرد'),
          L('🔊 Turns the volume up to hear it better', '🔊 صدا را بلند می‌کند تا بهتر بشنود'),
        ],
        answer: 0,
        explanation: L('Calm detective work wins! First the power source, then the loop, station by station — most dead circuits come back to life with one refixed wire!', 'کارآگاهیِ باآرامش برنده است! اول منبع انرژی، بعد حلقه، ایستگاه‌به‌ایستگاه — بیشتر مدارهای مُرده با یک سیمِ دوباره‌وصل‌شده به زندگی برمی‌گردند!'),
      },
    ],
    unlockLessonIds: ['l2-6', 'l2-8'],
  },
];
