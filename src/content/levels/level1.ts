import type { Lesson } from '../types';
import { c, w, doc, g, L } from '../helpers';

const ledLoop9V = (r = 470) =>
  doc(
    [
      c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
      c('resistor', 'r1', { params: { resistance: r }, x: 380, y: 220 }),
      c('led', 'led1', { x: 600, y: 220 }),
    ],
    [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'led1', 'anode'), w('w3', 'led1', 'cathode', 'b1', 'neg')],
  );

export const LEVEL1_LESSONS: Lesson[] = [
  {
    id: 'l1-1',
    levelId: 'level1',
    title: L('What is a breadboard? (The amazing holey board)', 'بردبورد چیست؟ (تختهٔ سوراخ‌دار شگفت‌انگیز)'),
    emoji: '🍞',
    difficulty: 1,
    minutes: 7,
    objectives: [L('Know how breadboard rows connect', 'بفهم سوراخ‌های بردبورد چطور به هم وصل‌اند')],
    screens: [
      {
        type: 'explain',
        title: L('A town for parts', 'شهری برای قطعه‌ها'),
        body: L(
          'A breadboard is a board with hundreds of holes. Hidden inside, groups of holes are already connected in rows — no soldering needed! You plug parts in and they instantly share a connection, like neighbors on the same street.',
          'بردبورد تخته‌ای است پر از سوراخ. زیرِ این سوراخ‌ها، پنهانی سیم‌هایی هست که چندتا از آن‌ها را به هم وصل کرده. قطعه‌ها را فقط فرو می‌کنی و فوراً به هم وصل می‌شوند — نه سیم‌پیچی، نه لحیم! مثل همسایه‌هایی که یک خیابان دارند.',
        ),
        scene: { kind: 'breadboard-map' },
        tip: L('Power rails run along the sides (marked + and −); rows connect across the middle valley.', 'خط‌های + و − در لبه‌های تخته هستند؛ سوراخ‌های هر ردیف فقط تا وسطِ تخته به هم وصل‌اند.'),
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Why is it called a BREADboard?', 'چرا اسمش «بردبورد» (تختهٔ نان) است؟'),
        options: [
          L('Early inventors built circuits on wooden bread-cutting boards', 'مخترع‌های قدیم مدارها را روی تختهٔ برشِ نان می‌ساختند'),
          L('It smells like bread', 'بوی نان می‌دهد'),
          L('It is edible', 'خوردنی است'),
          L('Nobody knows', 'کسی نمی‌داند'),
        ],
        answer: 0,
        explanation: L('True story! Radio fans used kitchen bread boards before plastic boards existed.', 'واقعی است! قدیم‌ها مدارهای رادیویی‌شان را روی تختهٔ برشِ نانِ آشپزخانه می‌ساختند!'),
      },
      {
        type: 'trueFalse',
        prompt: L('Breadboards need soldering to connect parts.', 'برای وصل‌کردن قطعه‌ها روی بردبورد، لحیم لازم است.'),
        answer: false,
        explanation: L('That is the whole point — plug in, no solder!', 'برعکس! فقط قطعه را فرو می‌کنی؛ نه سیم، نه لحیم.'),
      },
      {
        type: 'mcq',
        prompt: L('The + and − lines along the edge are called…', 'خط‌های + و − در لبهٔ بردبورد چه نام دارند؟'),
        options: [L('Power rails', 'خط‌های برق'), L('Rivers', 'رودها'), L('Zippers', 'زیپ‌ها'), L('Ladders', 'نردبان‌ها')],
        answer: 0,
        explanation: L('Power rails feed + and − to the whole board.', 'این خط‌ها + و − را به همه‌جای تخته می‌رسانند.'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l1-2',
    levelId: 'level1',
    title: L('Wiring & connections on the breadboard', 'سیم‌کشی و اتصالات روی بردبورد'),
    emoji: '🧷',
    difficulty: 1,
    minutes: 6,
    objectives: [L('Connect parts neatly with wires', 'قطعه‌ها را تمیز با سیم وصل کن')],
    screens: [
      {
        type: 'explain',
        title: L('Roads for electrons', 'جاده‌های الکترون'),
        body: L(
          'Jumper wires are the roads of your circuit town. They come in many colors — smart builders use red for + paths and black for − paths, and any color in between. Short, neat wires make circuits easy to check.',
          'سیم‌ها جاده‌های مدار تو هستند. رنگ‌شان هم قاعده دارد: سیمِ قرمز برای مسیرِ + و سیمِ مشکی برای مسیرِ −. سیم‌های کوتاه و مرتب کارت را تمیز نگه می‌دارند و اگر خراب شد، راحت پیدایش می‌کنی.',
        ),
        scene: { kind: 'wire-tips' },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('What color wire is usually used for the − path?', 'برای مسیرِ − معمولاً از چه سیمی استفاده می‌شود؟'),
        options: [L('Black', 'مشکی'), L('Yellow', 'زرد'), L('Pink', 'صورتی'), L('Green', 'سبز')],
        answer: 0,
        explanation: L('Black = − (ground), red = +. A helpful tradition!', 'مشکی یعنی − و قرمز یعنی +. این رسم کمک‌مان می‌کند اشتباه نکنیم.'),
      },
      {
        type: 'trueFalse',
        prompt: L('Neat, short wires make troubleshooting easier.', 'سیم‌های کوتاه و مرتب، عیب‌یابی را آسان‌تر می‌کنند.'),
        answer: true,
        explanation: L('Tidy circuits = fewer mistakes hidden in the spaghetti.', 'مدارِ مرتب = خطای پنهانِ کمتر!'),
      },

      {
        type: 'mcq',
        prompt: L('How do you connect two parts that sit far apart on the breadboard?', 'دو قطعه که در بردبورد از هم دور نشسته‌اند را چطور به هم وصل می‌کنی؟'),
        options: [
          L('🧵 With a jumper wire pushed into the holes of the right rows', '🧵 با یک سیم جامپر که داخل سوراخ‌های ردیف درست فرو می‌رود'),
          L('🩹 By sticking them together with tape', '🩹 با چسباندن آن‌ها به هم با چسب'),
          L('👆 By pressing them against each other with a finger', '👆 با فشار دادن آن‌ها به هم با انگشت'),
        ],
        answer: 0,
        explanation: L('Right! The jumper wires are our little bridges: each one plugs into a hole in the same row as the pin and carries the current across the board!', 'درست است! سیم‌های جامپر پل‌های کوچولوی ما هستند: هر کدام داخل سوراخِ همان ردیفِ پایه فرو می‌روند و جریان را از روی برد عبور می‌دهند!'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l1-3',
    levelId: 'level1',
    title: L('Light your first LED on the breadboard', 'روشن‌کردن اولین LED روی بردبورد'),
    emoji: '💡',
    difficulty: 1,
    minutes: 8,
    objectives: [L('Identify LED legs A and K', 'پایه‌های A و K ال‌ای‌دی را بشناس'), L('Never connect an LED without a resistor', 'بدون مقاومت به ال‌ای‌دی وصل نکن')],
    screens: [
      {
        type: 'explain',
        title: L('One-way light', 'نوری که فقط یک‌طرفه روشن می‌شود'),
        body: L(
          'An LED is a one-way valve for current: it only lights when current flows from its anode (A, long leg) to its cathode (K, short leg, flat side). Backwards = dark. Each color also needs its own push: red glows from ~1.8 V, blue needs ~3 V.',
          'ال‌ای‌دی مثل دری است که فقط به یک سمت باز می‌شود. جریان باید از پایهٔ بلند (A = آند) وارد شود و از پایهٔ کوتاه (K = کاتد) بیرون برود؛ برعکس بزنی، روشن نمی‌شود. هر رنگ ال‌ای‌دی هم به اندازهٔ فشارِ خودش لازم دارد: قرمز از حدود ۱٫۸ ولت روشن می‌شود، آبی حدود ۳ ولت می‌خواهد.',
        ),
        scene: { kind: 'led-anatomy' },
        tip: L('Technical term: the needed push is the forward voltage (Vf).', 'اسم علمیِ این فشارِ لازم، «ولتاژ روبه‌جلو» (Vf) است.'),
      },
      {
        type: 'build',
        title: L('Build: flip it!', 'بساز: برگردانش!'),
        body: L(
          'This LED is wired BACKWARDS. Run the circuit, read the warning, then rotate the LED 180° (select it → Rotate) until it glows.',
          'این ال‌ای‌دی برعکس وصل شده! مدار را روشن کن، پیام هشدار را بخوان، بعد ال‌ای‌دی را انتخاب کن و با دکمهٔ چرخش برگردانش تا روشن شود.',
        ),
        task: {
          brief: L('Fix the reversed LED so it lights up safely.', 'ال‌ای‌دیِ برعکس را درست کن تا روشن شود.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 380, y: 220 }),
              c('led', 'led1', { x: 600, y: 220, rotation: 180 }),
            ],
            [w('w1', 'b1', 'pos', 'r1', 'a'), w('w2', 'r1', 'b', 'led1', 'cathode'), w('w3', 'led1', 'anode', 'b1', 'neg')],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Read the diagnostic card — it tells you the LED is backwards.', 'کارتِ هشدار را بخوان؛ می‌گوید ال‌ای‌دی برعکس است.'),
            L('Select the LED and press Rotate once (180°).', 'ال‌ای‌دی را انتخاب کن و یک‌بار روی دکمهٔ چرخش بزن.'),
            L('A (long leg) must face the + side through the resistor.', 'پایهٔ بلند (A) باید سمتِ + باشد.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('How do you spot the cathode (K)?', 'کاتد (K) را چطور پیدا کنیم؟'),
        options: [L('Short leg + flat side', 'پایهٔ کوتاه + لبهٔ صاف'), L('It is warm', 'گرم است'), L('It is the shiny one', 'براق‌تر است'), L('It is magnetic', 'آهن‌ربایی است')],
        answer: 0,
        explanation: L('Short leg and the flat rim mark the cathode.', 'پایهٔ کوتاه و لبهٔ صاف، نشانه‌های کاتد هستند.'),
      },
      {
        type: 'trueFalse',
        prompt: L('An LED connected backwards will still glow.', 'ال‌ای‌دی برعکس هم روشن می‌شود.'),
        answer: false,
        explanation: L('One-way valve: backwards = no light.', 'برعکس بزنی، هیچ نوری ندارد؛ چون فقط از یک سمت رد می‌شود.'),
      },
      {
        type: 'mcq',
        prompt: L('Which needs the BIGGEST push (forward voltage)?', 'کدام‌یک قوی‌ترین فشار را می‌خواهد؟'),
        options: [L('Blue LED', 'ال‌ای‌دی آبی'), L('Red LED', 'ال‌ای‌دی قرمز'), L('Yellow LED', 'ال‌ای‌دی زرد'), L('All equal', 'همه برابر')],
        answer: 0,
        explanation: L('Blue ≈ 3.0 V, red ≈ 1.8 V. Higher energy color = bigger push.', 'آبی حدود ۳ ولت و قرمز حدود ۱٫۸ ولت می‌خواهد؛ هرچه رنگ پرانرژی‌تر، فشارِ بیشتر.'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l1-4',
    levelId: 'level1',
    title: L('Real resistors & the secret of the color bands', 'مقاومت واقعی و راز نوارهای رنگی'),
    emoji: '🎨',
    difficulty: 2,
    minutes: 8,
    objectives: [L('Read simple resistor color bands', 'نوارهای رنگی مقاومت را بخوان')],
    screens: [
      {
        type: 'explain',
        title: L('The rainbow code', 'کدِ رنگین‌کمانی'),
        body: L(
          'Resistors wear colored stripes that spell their value: each color is a digit (black=0, brown=1, red=2 …). Red-Red-Brown = 2, 2, ×10 = 220 Ω — the classic LED partner! Gold band at the end means ±5% accuracy.',
          'روی مقاومت‌ها نوارهای رنگی هست که مقدارشان را نشان می‌دهند؛ مثل کدِ رنگی. هر رنگ یک عدد است: سیاه=۰، قهوه‌ای=۱، قرمز=۲ و…. مثلاً قرمز-قرمز-قهوه‌ای می‌شود ۲،۲ ضربدر ۱۰؛ یعنی ۲۲۰ اهم — مقاومتِ همیشگیِ ال‌ای‌دی! نوارِ طلاییِ آخر هم یعنی دقتِ خوب.',
        ),
        scene: { kind: 'color-code' },
        tip: L('You do not need to memorize all colors now — the app always shows the value.', 'لازم نیست الان همهٔ رنگ‌ها را حفظ کنی؛ اپ همیشه مقدارِ مقاومت را نشان می‌دهد.'),
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Red-Red-Brown equals…', 'قرمز-قرمز-قهوه‌ای می‌شود…'),
        options: [L('220 Ω', '۲۲۰ اهم'), L('22 Ω', '۲۲ اهم'), L('2200 Ω', '۲۲۰۰ اهم'), L('2.2 Ω', '۲٫۲ اهم')],
        answer: 0,
        explanation: L('2, 2, ×10 → 220 Ω.', '۲، ۲، ×۱۰ → ۲۲۰ اهم.'),
      },
      {
        type: 'mcq',
        prompt: L('What does the resistor do for the LED?', 'مقاومت برای ال‌ای‌دی چه می‌کند؟'),
        options: [L('Limits the current', 'جریان را کم نگه می‌دارد'), L('Makes it brighter forever', 'برای همیشه روشنش می‌کند'), L('Changes its color', 'رنگش را عوض می‌کند'), L('Nothing', 'هیچ کاری نمی‌کند')],
        answer: 0,
        explanation: L('It keeps the current below the LED safe limit (~20 mA).', 'جریان را زیرِ حدِ امن (حدود ۲۰ میلی‌آمپر) نگه می‌دارد.'),
      },

      {
        type: 'identify',
        prompt: L('Which part is this — the one whose color bands you just learned to read?', 'این قطعه کدام است — همان که خط‌های رنگی‌اش را تازه خواندن یاد گرفتی؟'),
        partType: 'resistor',
        options: [
          L('The resistor', 'مقاومت'),
          L('The LED', 'ال‌ای‌دی'),
          L('The switch', 'کلید'),
        ],
        answer: 0,
        explanation: L('Yes! The body with the colorful secret-code bands is the resistor — and now you can decode how many ohms it is!', 'آره! بدنه‌ای که خط‌های رنگیِ کد مخفی دارد مقاومت است — و حالا می‌توانی رمزگشایی کنی که چند اُهم است!'),
      },
    ],
    unlockLessonIds: [],
  },
  {
    id: 'l1-5',
    levelId: 'level1',
    title: L('Types of switches (rocker switch & push button)', 'انواع کلیدها (کلید راکر و دکمهٔ فشاری)'),
    emoji: '🔘',
    difficulty: 1,
    minutes: 8,
    objectives: [L('Wire a switch in series', 'کلید را پشت‌سرِ قطعه‌ها وصل کن'), L('Use a momentary push button', 'از دکمهٔ لحظه‌ای استفاده کن')],
    screens: [
      {
        type: 'explain',
        title: L('Control the loop', 'مدار را کنترل کن'),
        body: L(
          'A switch is a door you place INSIDE the loop. Anywhere in the loop works — before or after the LED — because the current is the same everywhere in a single loop. Designers put switches where fingers can reach them!',
          'کلید را هر جای مسیر بگذاری کار می‌کند؛ قبل یا بعد از ال‌ای‌دی فرقی ندارد، چون جریان در تمامِ یک مسیر به یک اندازه است. فقط باید داخلِ راهِ برق باشد، نه کنارش! برای همین کلید را جایی می‌گذارند که دست برسد.',
        ),
        scene: { kind: 'switch-door' },
      },
      {
        type: 'explain',
        title: L('Only while you press', 'فقط تا وقتی فشار می‌دهی'),
        body: L(
          'A push button is a switch with a spring: it closes ONLY while your finger presses it, then pops open. Doorbells, keyboards and game controllers all use momentary buttons like this.',
          'دکمهٔ فشاری مثل کلید است با این فرق: فقط وقتی فشارش می‌دهی وصل می‌شود و تا رهایش کنی، دوباره قطع می‌شود. زنگِ در، کیبورد و دستهٔ بازی همه همین دکمه‌ها را دارند.',
        ),
        scene: { kind: 'button-press' },
      },
      {
        type: 'build',
        title: L('Build: press the light', 'بساز: با فشار، روشن'),
        body: L(
          'Wire the button in the loop and RUN. Then PRESS AND HOLD the button on the canvas — the LED glows only while pressed!',
          'دکمه را داخل مسیر سیم‌کشی کن و مدار را روشن کن. بعد روی دکمه انگشتت را نگه دار: ال‌ای‌دی فقط تا وقتی که فشار می‌دهی روشن می‌ماند!',
        ),
        task: {
          brief: L('Make the LED light only while the button is pressed.', 'کاری کن ال‌ای‌دی فقط وقتی دکمه را فشار می‌دهی روشن شود.'),
          goal: g.and(g.battery(), g.buttonPresent(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 220 }),
              c('button', 'bt1', { x: 330, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 520, y: 220 }),
              c('led', 'led1', { x: 700, y: 220 }),
            ],
            [],
          ),
          allowed: ['battery', 'button', 'resistor', 'led'],
          hints: [
            L('Connect all four parts into one big loop.', 'هر چهار قطعه را در یک مسیرِ بزرگ وصل کن.'),
            L('Use the WIRE tool: tap a pin, then tap the next pin.', 'ابزار «سیم» را بردار: روی یک پایه بزن، بعد روی پایهٔ بعدی.'),
            L('When running, press-and-hold the button — do not just tap.', 'وقتی مدار روشن است، دکمه را فشار بده و نگه دار؛ سریع برداری!'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'trueFalse',
        prompt: L('A switch only works if it is placed right after the battery.', 'کلید فقط اگر درستِ بعد از باتری باشد کار می‌کند.'),
        answer: false,
        explanation: L('Anywhere in the loop works — current is the same everywhere in a series loop.', 'برعکس! هر جای مسیر باشد کار می‌کند؛ جریان همه‌جا به یک اندازه است.'),
      },
      {
        type: 'mcq',
        prompt: L('Closing the switch makes the loop…', 'روشن‌کردن کلید، مسیرِ برق را…'),
        options: [L('Complete — current flows', 'کامل می‌کند — برق رد می‌شود'), L('Empty — current stops', 'قطع می‌کند — برق می‌ایستد'), L('Double the voltage', 'دوبرابر ولتاژ'), L('Colder', 'سردتر')],
        answer: 0,
        explanation: L('Closed switch = bridge down = complete loop.', 'کلیدِ روشن = پلِ پایین = مسیرِ کامل.'),
      },
      {
        type: 'mcq',
        prompt: L('A push button differs from a switch because it…', 'فرقِ دکمهٔ فشاری با کلید در این است که…'),
        options: [L('Stays closed only while pressed', 'فقط وقتی فشارش می‌دهی وصل می‌ماند'), L('Is always closed', 'همیشه وصل است'), L('Adds voltage', 'ولتاژ اضافه می‌کند'), L('Glows in the dark', 'در تاریکی می‌درخشد')],
        answer: 0,
        explanation: L('Momentary = only during the press.', 'یعنی لحظه‌ای کار می‌کند: فقط تا وقتی انگشتت رویش است.'),
      },
      {
        type: 'trueFalse',
        prompt: L('A keyboard key is a kind of push button.', 'کلیدِ کیبورد، نوعی دکمهٔ فشاری است.'),
        answer: true,
        explanation: L('Every tap is a quick press of a tiny button.', 'هر بار که کلیدی را می‌زنی، یک دکمهٔ ریز را فشار داده‌ای.'),
      },
    ],
    unlockLessonIds: ['l0-5'],
  },

  {
    id: 'l1-6',
    levelId: 'level1',
    title: L('Combining batteries (more power & more volts)', 'ترکیب باتری‌ها (افزایش قدرت و ولتاژ)'),
    emoji: '🔋',
    difficulty: 1,
    minutes: 6,
    objectives: [L('Combine batteries in series for more volts', 'باتری‌ها را پشت‌سرِ هم ببند تا ولت بیشتر شود')],
    screens: [
      {
        type: 'explain',
        title: L('Stack the tanks', 'مخزن‌ها را روی هم بگذار'),
        body: L(
          'Two 1.5 V batteries in a row (series) push like ONE 3 V battery: the pushes add up! That is why a TV remote with two AA batteries has 3 V. Four of them = 6 V. But watch out — more volts also means more current through your parts.',
          'دو باتری ۱٫۵ ولتی را پشت‌سرِ هم بگذاری، فشارشان با هم جمع می‌شود: مثل یک باتری ۳ ولتی! برای همین ریموتِ تلویزیون که دو باتری قلمی دارد، ۳ ولت است. چهار تا می‌شود ۶ ولت. ولی حواست باشد: ولتِ بیشتر، جریانِ بیشتری هم از قطعه‌ها رد می‌کند.',
        ),
        scene: { kind: 'battery-stack' },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Two 1.5 V batteries in series give…', 'دو باتری ۱٫۵ ولتیِ پشت‌سرِ هم چند ولت می‌دهند؟'),
        options: [L('3 V', '۳ ولت'), L('1.5 V', '۱٫۵ ولت'), L('0.75 V', '۰٫۷۵ ولت'), L('9 V', '۹ ولت')],
        answer: 0,
        explanation: L('Series pushes add: 1.5 + 1.5 = 3 V.', 'فشارشان جمع می‌شود: ۱٫۵ + ۱٫۵ = ۳ ولت.'),
      },
      {
        type: 'trueFalse',
        prompt: L('More voltage usually means more current in the same circuit.', 'در همان مدار، ولتاژِ بیشتر معمولاً یعنی جریانِ بیشتر.'),
        answer: true,
        explanation: L('Stronger push → stronger flow.', 'فشارِ بیشتر، جریانِ بیشتر.'),
      },

      {
        type: 'mcq',
        prompt: L('Three 1.5 V batteries stacked in series give how many volts in total?', 'سه باتری ۱.۵ ولتی که سری پشت هم بچینیم، در کل چند ولت می‌دهند؟'),
        options: [
          L('⚡ 4.5 volts — the voltages add up', '⚡ ۴.۵ ولت — ولتاژها با هم جمع می‌شوند'),
          L('🔋 Still only 1.5 volts', '🔋 باز هم فقط ۱.۵ ولت'),
          L('📉 Less than 1.5 volts', '📉 کمتر از ۱.۵ ولت'),
        ],
        answer: 0,
        explanation: L('Great math, engineer! In a series stack the voltages add up: 1.5 + 1.5 + 1.5 = 4.5 volts — a stronger push for the electrons!', 'حساب باهوشی بود مهندس! در چینش سری، ولتاژها جمع می‌شوند: ۱.۵ + ۱.۵ + ۱.۵ = ۴.۵ ولت — هولِ قوی‌تری برای الکترون‌ها!'),
      },
    ],
    unlockLessonIds: [],
  },

  {
    id: 'l1-7',
    levelId: 'level1',
    title: L('Chapter grand project: build a cool craft (a flashlight or a siren)', 'پروژهٔ بزرگ فصل: ساخت یک کاردستی جالب (مثل چراغ‌قوه یا آژیر)'),
    emoji: '🛠️',
    difficulty: 2,
    minutes: 10,
    objectives: [L('Combine everything from Level 1', 'همه‌چیزِ سطح ۱ را با هم استفاده کن')],
    screens: [
      {
        type: 'build',
        title: L('Build: a proper flashlight circuit', 'بساز: مدارِ واقعی چراغ‌قوه'),
        body: L(
          'Time to build like a pro: battery → switch → resistor → LED, one complete loop, all wired by YOU. Then run it and flip the switch.',
          'حالا مثل یک مهندس واقعی بساز: باتری، کلید، مقاومت و ال‌ای‌دی را در یک مسیرِ کامل سیم‌کشی کن. بعد روشنش کن و کلید را بزن!',
        ),
        task: {
          brief: L('Build the full flashlight loop: 9V battery, switch, 470 Ω resistor, LED.', 'چراغ‌قوهٔ کامل را بساز: باتری ۹ ولت، کلید، مقاومت ۴۷۰ اهم و ال‌ای‌دی.'),
          goal: g.and(g.battery(), g.switchPresent(), g.switchClosed(), g.ledOn('led1'), g.ledCurrentSafe('led1')),
          startCircuit: doc([], []),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('Lay the four parts in a row first, then wire pin to pin.', 'اول چهار قطعه را پشت‌سرِ هم بچین، بعد با ابزار سیم به هم وصلشان کن.'),
            L('Remember the LED direction: A toward +.', 'جهت ال‌ای‌دی یادت نرود: پایهٔ بلند (A) سمتِ +.'),
            L('Run it, then close the switch. Check the mA on the LED: 10–20 is perfect.', 'روشنش کن و کلید را بزن. عدد mA روی ال‌ای‌دی باید بین ۱۰ تا ۲۰ باشد.'),
          ],
        },
      },
      { type: 'quiz' },
      { type: 'reward' },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L('Which order is a valid flashlight loop?', 'کدام مسیر برای چراغ‌قوه درست است؟'),
        options: [
          L('Battery → switch → resistor → LED → back to battery', 'باتری ← کلید ← مقاومت ← ال‌ای‌دی ← برگشت به باتری'),
          L('Battery → LED → battery (no resistor, no switch)', 'باتری ← ال‌ای‌دی ← باتری (بدون مقاومت و کلید)'),
          L('Only a switch and LED', 'فقط کلید و ال‌ای‌دی'),
          L('Two separate loops', 'دو مسیرِ جدا'),
        ],
        answer: 0,
        explanation: L('Complete loop + control + protection + light = a real design.', 'مسیرِ کامل + کلید + مقاومت = یک چراغ‌قوهٔ واقعی.'),
      },
      {
        type: 'trueFalse',
        prompt: L('Checking the mA reading helps you confirm the LED is safe.', 'دیدن عدد mA کمک می‌کند مطمئن شوی ال‌ای‌دی امن است.'),
        answer: true,
        explanation: L('10–20 mA = happy LED.', '۱۰ تا ۲۰ میلی‌آمپر یعنی ال‌ای‌دی در حالتِ امن است.'),
      },

      {
        type: 'mcq',
        prompt: L('Your flashlight build is done, you press the button — but the LED stays dark. What does a real engineer check FIRST?', 'چراغ‌قوه‌ات را ساختی، دکمه را می‌زنی — ولی LED خاموش می‌ماند. یک مهندس واقعی اول چه چیزی را بررسی می‌کند؟'),
        options: [
          L('🔍 The battery and the wire connections around the loop', '🔍 باتری و اتصال سیم‌ها دور حلقه'),
          L('😢 Starts crying immediately', '😢 فوری شروع به گریه می‌کند'),
          L('🗑️ Throws everything away and starts from zero', '🗑️ همه‌چیز را دور می‌ریزد و از صفر شروع می‌کند'),
        ],
        answer: 0,
        explanation: L('That is the engineer way! Nine times out of ten the trouble is a loose wire or a dead battery — trace the loop calmly, station by station!', 'این روشِ مهندس‌هاست! نه بار از ده بار، مشکل یک سیمِ جاافتاده یا باتریِ خالی است — با آرامش حلقه را ایستگاه‌به‌ایستگاه دنبال کن!'),
      },
    ],
    unlockLessonIds: ['l1-3', 'l1-5'],
  },
];
