import type { Lesson } from '../types';
import { c, w, doc, g, L } from '../helpers';

/**
 * LEVEL 0 — "کاوشگر الکترونیک" (14 lessons, user-approved final order):
 * 1-2 concepts (electronics, electricity) → 3 safety → 4-5 the circuit
 * (loop idea + open/closed) → 6 conductors → 7-9 the V/I/R trio
 * → 10-13 the parts (battery, wire, LED, switch) → 14 circuit symbols.
 * Lesson ids match positions (l0-1 … l0-14); the old power lesson was removed.
 */

// closed-loop LED circuit (battery → switch → resistor → LED → back)
const ledSwitchLoop = doc(
  [
    c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 150 }),
    c('switch', 'sw1', { x: 300, y: 150 }),
    c('resistor', 'r1', { params: { resistance: 470 }, x: 460, y: 150 }),
    c('led', 'led1', { x: 620, y: 150 }),
  ],
  [
    w('w1', 'b1', 'pos', 'sw1', 'a'),
    w('w2', 'sw1', 'b', 'r1', 'a'),
    w('w3', 'r1', 'b', 'led1', 'anode'),
    w('w4', 'led1', 'cathode', 'b1', 'neg'),
  ],
);

// loop with an open switch (diagnose quiz)
const diagnoseOpenSwitch = doc(
  [
    c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 180 }),
    c('switch', 'sw1', { x: 320, y: 180 }),
    c('led', 'led1', { x: 500, y: 180 }),
  ],
  [
    w('w1', 'b1', 'pos', 'sw1', 'a'),
    w('w2', 'sw1', 'b', 'led1', 'anode'),
    w('w3', 'led1', 'cathode', 'b1', 'neg'),
  ],
);

// loop with a missing return wire (diagnose quiz)
const diagnoseGap = doc(
  [
    c('battery', 'b1', { params: { voltage: 9 }, x: 140, y: 180 }),
    c('resistor', 'r1', { params: { resistance: 220 }, x: 340, y: 180 }),
    c('led', 'led1', { x: 540, y: 180 }),
  ],
  [w('w1', 'b1', 'pos', 'r1', 'a')],
);

/**
 * LEVEL 0 — standard teaching order (following the printed kid handouts):
 * first "what is electricity?", then MEET each part one by one
 * (battery, wire, LED, resistor, switch) with a one-line definition,
 * a "مثل چی؟" everyday example and a friendly picture —
 * and ONLY THEN the first circuit build, concepts after.
 */
export const LEVEL0_LESSONS: Lesson[] = [
  // ------------------------------------------------ 1. electronics (redesigned)
  // «فصل اول: کاوشگر الکترونیک» — new-format lesson (user spec, Nov 2026):
  // calm intro page (no extra animation) → simple-vs-smart challenge →
  // the toy-hospital build challenge → problem-based 3-question MCQ quiz →
  // the Smart Electronics Explorer medal. The next button stays locked until
  // the child has heard the whole teacher speech AND finished each mission.
  {
    id: 'l0-1',
    levelId: 'level0',
    title: L('What is electronics? (Commanding the magic particles)', 'الکترونیک چیست؟ (فرماندهی به ذرات جادویی)'),
    emoji: '⚡',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Know the difference between simple electricity and smart electronics', 'فرقِ برقِ ساده و الکترونیکِ هوشمند را بدانی'),
      L('Give a robot commands: its light color and its speed', 'به یک ربات فرمان بدهی: رنگ نورش و سرعتش را'),
      L('See why a device needs an electronic brain to be controllable', 'بفهمی یک وسیله برای فرمان‌پذیری به مغز الکترونیکی نیاز دارد'),
      L('Rebuild a toy car with battery, brain, wires and motor', 'ماشین اسباب‌بازی را با باتری، مغز، سیم و موتور بسازی'),
    ],
    screens: [
      {
        // page 1 — welcome to the world of commanding (conceptual, calm:
        // NO interactive animation on purpose, so the child focuses on the idea)
        type: 'explain',
        speaker: 'robot',
        title: L('Welcome to the world of commanding! 👋', 'آشنایی با دنیای فرماندهی! 👋'),
        body: L(
          'Hello, hero explorer! Welcome to the first step of our amazing journey!\n\nHave you ever wondered how, when you press a button on the game controller, the car on the TV moves left and right exactly the way you want? Or how a toy can talk?\n\nThe secret behind all of this magic is one word: electronics!\n\nElectronics means learning the language of commanding electricity! It means we do not just switch electricity on and off — we tell it exactly what job to do for us.',
          'سلام کاوشگر قهرمان! خوش اومدی به اولین گام از سفر شگفت‌انگیزمون!\n\nتا حالا فکر کردی چطوری وقتی دکمهٔ دستهٔ بازی رو فشار میدی، ماشین توی تلویزیون دقیقاً همون‌طوری که تو می‌خوای به چپ و راست می‌ره؟ یا چطوری یک اسباب‌بازی می‌تونه حرف بزنه؟\n\nراز همهٔ این جادوها یک کلمه است: «الکترونیک»!\n\nالکترونیک یعنی یاد گرفتن زبانِ فرماندهی به جریان برق! یعنی ما فقط برق رو روشن و خاموش نمی‌کنیم، بلکه بهش دستور می‌دیم دقیقاً چه کاری برای ما انجام بده.',
        ),
        scene: { kind: 'command-intro' },
        nextLabel: L('Enter the challenge! ⚡', 'ورود به چالش! ⚡'),
      },
      {
        // page 2 — challenge: simple electricity vs smart electronics
        type: 'explain',
        speaker: 'robot',
        title: L('Simple electricity vs. smart electronics 🤖', 'چالش «برق ساده» در برابر «الکترونیک هوشمند» 🤖'),
        body: L(
          'What is the difference between simple electricity and electronics? Come and test it yourself in this challenge!\n\nOn the right side is simple electricity; can you make the lamp sing a song or glow dimly for us?\n\nNow go to the left side and set the robot so it dances with light and moves gently at the same time!',
          'فرقِ برق ساده با الکترونیک چیه؟ بیا توی این چالش خودت امتحان کنی!\n\nسمت راست برقِ ساده است؛ ببین می‌تونی کاری کنی لامپ برامون آهنگ بزنه یا کم‌نور بشه؟\n\nحالا برو سمت چپ و ربات رو جوری تنظیم کن که هم‌زمان با رقص نور، آروم حرکت کنه!',
        ),
        scene: { kind: 'simple-vs-smart' },
      },
      {
        // page 3 — the toy hospital: rebuild the RC car
        type: 'explain',
        speaker: 'robot',
        title: L('The toy surgery room 🏥🚗', 'چالش اتاق تشریح اسباب‌بازی 🏥🚗'),
        body: L(
          'This remote-control car has gone dead and does not work!\n\nIf we only connect the battery to it, it becomes a simple motor: its wheels spin non-stop and the car goes out of control!\n\nSo that we can steer it left and right with the game controller, it needs an electronic brain. Put the parts in their right places so the car becomes smart!',
          'این ماشین کنترلی خاموش شده و کار نمی‌کنه!\n\nاگر فقط باتری بهش وصل کنیم، مثل یک موتور ساده فقط چرخ‌هاش بی‌وقفه می‌چرخند و از کنترل خارج میشه!\n\nبرای این‌که بتونیم با دستهٔ بازی بهش فرمان چپ و راست بدیم، به مغز الکترونیکی نیاز داریم. قطعات رو درست سر جاشون بگذار تا ماشین هوشمند بشه!',
        ),
        scene: { kind: 'toy-hospital' },
      },
      {
        // page 4 — the quiz room: 3 problem-based multiple-choice questions
        type: 'quiz',
        title: L('The Explorer Quiz Room 🏆', 'اتاق آزمون و چالش سنجش دانش 🏆'),
        body: L(
          'Now it is quiz time, explorer! Answer the three questions and collect your shining stars!',
          'حالا وقتِ آزمون کاوشگره! به سه سؤال جواب بده و ستاره‌های درخشان رو جمع کن!',
        ),
        speaker: 'robot',
      },
      { type: 'reward', scene: { kind: 'medal-party' } },
    ],
    quiz: [
      {
        // q1 — conceptual
        type: 'mcq',
        prompt: L(
          'What is the MAIN difference between «electronics» and «ordinary electricity»?',
          'تفاوت اصلی «الکترونیک» با «برق معمولی» در چیست؟',
        ),
        options: [
          L('🔴 Electronics means giving electricity commands and programs so it does many different jobs.', '🔴 الکترونیک یعنی به جریان برق دستور و برنامه می‌دیم تا کارهای مختلف انجام بده.'),
          L('🟡 Electronics only means turning on very big lamps.', '🟡 الکترونیک فقط یعنی روشن کردن لامپ‌های خیلی بزرگ.'),
          L('🔵 There is no difference; both mean the same thing.', '🔵 هیچ تفاوتی ندارند و هر دو یک معنی را می‌دهند.'),
        ],
        answer: 0,
        explanation: L(
          'Exactly! In electronics we do not just switch the current on and off — we COMMAND it: play a song, glow dimly, or drive a robot!',
          'دقیقاً! در الکترونیک فقط جریان برق رو روشن و خاموش نمی‌کنیم؛ بهش فرمان می‌دیم: آهنگ بزنه، کم‌نور بشه یا یک ربات رو حرکت بده!',
        ),
      },
      {
        // q2 — analytical
        type: 'mcq',
        prompt: L(
          'A toy robot turns on, but when we press its control buttons it shows no reaction at all! Which part do you think is broken?',
          'یک ربات اسباب‌بازی روشن می‌شود اما وقتی دکمه‌های کنترلی را می‌زنیم هیچ واکنشی نشان نمی‌دهد! فکر می‌کنی کدام بخشش مشکل دارد؟',
        ),
        options: [
          L('🔴 The battery wires have come off.', '🔴 سیم‌های باتری کنده شده‌اند.'),
          L('🟡 Its commanding / electronic brain does not work.', '🟡 بخش فرمان‌دهی و الکترونیکی (مغز) دستگاه کار نمی‌کند.'),
          L('🔵 The plastic body of the robot is broken.', '🔵 بدنهٔ پلاستیکی ربات شکسته است.'),
        ],
        answer: 1,
        explanation: L(
          'Good thinking! The robot turns on, so the battery and its wires are fine — but the commands never reach it. So the electronic brain, the part that gives commands, is the problem!',
          'چه تحلیل خوبی! ربات روشن می‌شود یعنی باتری و سیم‌هایش سالم‌اند — اما فرمان‌ها به گوشش نمی‌رسند؛ پس مغزِ فرمان‌دهیِ دستگاه مشکل دارد!',
        ),
      },
      {
        // q3 — practical
        type: 'mcq',
        prompt: L(
          'Which of the following devices uses the science of «electronics» to control and become smart?',
          'در کدام‌یک از وسایل زیر از «علم الکترونیک» برای کنترل و هوشمندسازی استفاده شده است؟',
        ),
        options: [
          L('🔴 A simple flashlight that only has an on/off button.', '🔴 یک چراغ‌قوهٔ ساده که فقط یک دکمهٔ روشن/خاموش دارد.'),
          L('🟡 A wooden spoon.', '🟡 یک قاشق غذاخوری چوبی.'),
          L('🔵 A mobile phone or a tablet.', '🔵 یک گوشی تلفن همراه یا تبلت.'),
        ],
        answer: 2,
        explanation: L(
          'Yes! A phone or tablet sends thousands of commands to the electric current: light, sound, pictures and games — and that is exactly what electronics means!',
          'آره! گوشی و تبلت هزاران فرمان به جریان برق می‌دهند: نور، صدا، تصویر و بازی — و این دقیقاً یعنی الکترونیک!',
        ),
      },
    ],
    rewardBadge: L('Smart Electronics Explorer Medal', 'مدال «کاوشگر هوشمند الکترونیک»'),
    unlockLessonIds: [],
  },

  // --------------------------------------------------------- 2. electricity
  // New-format story lesson (user-written content): 4 robot-narrated picture
  // pages, each with a hands-on scene (see components/lesson/story-scenes.tsx),
  // then the brave-explorer quiz and the «کاوشگر برق» medal.
  {
    id: 'l0-2',
    levelId: 'level0',
    title: L('What is electricity? (The secret of the tiny workers)', 'برق چیست؟ (راز کارگرهای ریزه‌میزه)'),
    emoji: '🔋',
    difficulty: 1,
    minutes: 6,
    objectives: [
      L('Learn what electricity is', 'یاد بگیری برق چیست'),
      L('See how electricity travels', 'بفهمی برق چطور حرکت می‌کنه'),
      L('Tell safe battery power from dangerous wall power', 'فرق برق امنِ باتری و برق خطرناکِ پریز رو یاد بگیری'),
    ],
    screens: [
      {
        // page 1 — the magic that wakes devices up
        type: 'explain',
        speaker: 'robot',
        title: L('The magic that wakes devices up! 🪄✨', 'جادوی بیدار شدن وسایل! 🪄✨'),
        body: L(
          'Have you ever noticed how, at night, the room lights up the moment we flip the light switch? Or how a toy starts moving and singing when we press its button?\n\nElectricity is like a magical, lovable energy that flows inside things and wakes them up from their sleep!\n\nWithout electricity, the TV, the fridge, the room lamp — even robots — are all asleep. But the moment electricity reaches them, they wake up and start working!',
          'تا حالا دیدید وقتی شب‌ها کلید برق رو می‌زنیم، اتاق یهو روشن میشه؟ یا وقتی دکمه اسباب‌بازی رو فشار میدیم، شروع به حرکت و خوندن می‌کنه؟\n\nبرق مثل یک انرژی جادویی و دوست‌داشتنیه که داخل وسایل میره و اون‌ها رو از خواب بیدار می‌کنه!\n\nبدون برق، تلویزیون، یخچال، چراغ اتاق و حتی ربات‌ها همگی خوابند؛ اما همین که برق بهشون می‌رسه، بیدار میشن و کارشون رو شروع می‌کنند!',
        ),
        scene: { kind: 'room-wake', props: { image: '/images/lessons/l0-2/1-room-wake.png' } },
      },
      {
        // page 2 — the tiny glowing workers (electrons)
        type: 'explain',
        speaker: 'robot',
        title: L('The little energetic friends! 🏃‍♂️⚡', 'دوست‌های کوچولوی پرانرژی! 🏃‍♂️⚡'),
        body: L(
          "Now let's see what this electricity is made of.\n\nImagine billions and billions of tiny, tiny smiling friends, each holding a lantern full of light! These little friends are called electrons.\n\nWhen the electrons hold hands and run through the wires like schoolkids, one behind another, they make electric current. The faster they run, the more energy they deliver to our devices!",
          'حالا می‌خوایم ببینیم این برق از چی درست شده؟\n\nتصور کنید میلیاردها دوست بسیار بسیار ریز و خندان وجود دارند که مشعل‌های پر از نور دستشونه! به این دوست‌های کوچولو میگیم الکترون.\n\nوقتی این الکترون‌ها دست همدیگه رو می‌گیرند و توی سیم‌ها مثل بچه‌های مدرسه‌ای پشت سر هم میدوند، جریان برق می‌سازند. هرچی تندتر بدوند، انرژی بیشتری به وسایل می‌رسونند!',
        ),
        scene: { kind: 'electron-race', props: { image: '/images/lessons/l0-2/2-electrons.png' } },
      },
      {
        // page 3 — the long journey from the power plant to our wall socket
        type: 'explain',
        speaker: 'robot',
        title: L('How does electricity reach our home? 🚂⚡', 'برق چطور به خانه ما می‌رسه؟ 🚂⚡'),
        body: L(
          'Electricity takes a very long journey to reach our home!\n\n1. First it is born in the big house of electricity (the power plant).\n2. Then it rides the very tall pylons and long wires along the roads.\n3. It passes through the underground wires and arrives at the socket on the wall of our home!\n\nNow the electricity waits for us to plug a device into the socket — or connect a battery — so it can step into our circuits.',
          'برق برای رسیدن به خانه ما یک سفر خیلی طولانی انجام میده!\n\n۱. اول توی خانه بزرگ برق (نیروگاه) متولد میشه.\n۲. بعد سوار دکل‌ها و سیم‌های خیلی بلند توی جاده‌ها میشه.\n۳. از توی سیم‌های زیرزمین می‌گذره و می‌رسه به پریز روی دیوار خانه ما!\n\nحالا برق منتظره تا ما یک وسیله رو بزنیم به پریز یا باتری رو وصل کنیم تا وارد مدارهای ما بشه.',
        ),
        scene: { kind: 'power-journey', props: { image: '/images/lessons/l0-2/3-power-journey.png' } },
      },
      {
        // page 4 — the two faces of electricity: tame battery vs. mighty wall socket
        type: 'explain',
        speaker: 'robot',
        title: L('The two different faces of electricity! 🐱🦁', 'دو روی متفاوتِ برق! 🐱🦁'),
        body: L(
          'Kids! Electricity has two faces, and you absolutely must know them both:\n\n🐱 Battery power (tame and gentle): this power is very weak, harmless and kind — just like an adorable little kitten. In ALL of our experiments we use batteries only. It is completely safe.\n\n🦁 Wall-socket power (very strong): this power is like a big, mighty lion! We must never touch the wall sockets or the wires at home, because they are for grown-ups only, and they are dangerous.',
          'بچه‌ها! برق دو مدل داره که حتماً باید اون‌ها رو بشناسیم:\n\n🐱 برق باتری (برق رام‌شده و آروم): این برق خیلی کم‌قدرت، بی‌خطر و مهربونه! درست مثل یک بچه گربه ملوس. ما توی تمام آزمایش‌هامون فقط و فقط از باتری استفاده می‌کنیم و کاملاً امنه.\n\n🦁 برق پریز دیوار (برق خیلی قوی): این برق مثل یک شیر بزرگ و پرقدرته! اصلاً نباید به پریز دیوار یا سیم‌های خانه دست بزنیم چون فقط مخصوص بزرگترهاست و خطر داره.',
        ),
        scene: { kind: 'safe-danger', props: { image: '/images/lessons/l0-2/4-safe-danger.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: wake the lamp up! ⏰💡', 'تمرین ساختنی: بیدار کردن چراغ! ⏰💡'),
        body: L('The poor lamp is fast asleep and only you can wake it! One wire of the road is already laid — finish the journey of the electrons and watch the magic moment when the lamp opens its eyes!', 'لامپِ بیچاره خواب عمیقی است و فقط تو می‌توانی بیدارش کنی! یک سیمِ جاده از قبل کشیده شده — سفر الکترون‌ها را کامل کن و لحظهٔ جادویی باز شدن چشم چراغ را تماشا کن!'),
        task: {
          brief: L('Finish the road so the sleeping lamp wakes up and glows.', 'جاده را کامل کن تا لامپِ خواب بیدار شود و بدرخشد.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 3 }, x: 130, y: 190 }),
              c('resistor', 'r1', { params: { resistance: 220 }, x: 370, y: 190 }),
              c('led', 'led1', { x: 580, y: 190 }),
            ],
            [
              w('w1', 'b1', 'pos', 'r1', 'a'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('From the second leg of the resistor, run a wire to the long leg of the LED.', 'از پایهٔ دوم مقاومت، یک سیم تا پایهٔ بلند LED بکش.'),
            L('Finally return home: short leg of the LED → the − side of the battery.', 'آخرش برگرد خانه: پایهٔ کوتاه LED → پایهٔ − باتری.'),
          ],
        },
      },
      {
        // page 5 — the brave explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L("The brave explorer's quiz! 🏆🎮", 'آزمون کاوشگر شجاع! 🏆🎮'),
        speaker: 'robot',
        body: L(
          "Well done, clever explorers! Now it's time to see who learned today's lesson best.",
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه ببینم کی درس امروز رو خوب یاد گرفته؟',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-2/5-quiz-party.png' } },
      },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L(
          'When we build our experiments and circuits, which electricity do we use — the safe and kind one?',
          'برای آزمایش‌ها و ساخت مدارهای خودمون، از کدوم برق استفاده می‌کنیم که امن و مهربونه؟',
        ),
        options: [
          L('🔋 Battery power (gentle kitten)', '🔋 برق باتری (بچه گربه آروم)'),
          L('🔌 Wall-socket power (mighty lion)', '🔌 برق پریز دیوار (شیر پرقدرت)'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, brave explorer! 🏅 We only use battery power — it is tame and safe, like a little kitten. Wall-socket power is like a mighty lion: for grown-ups only! The «Electricity Explorer» medal is yours!',
          'آفرین کاوشگر شجاع! 🏅 ما فقط از برق باتری استفاده می‌کنیم؛ چون مثل بچه گربه آروم و امنه. برق پریز دیوار مثل شیر پرقدرته و فقط مخصوص بزرگ‌ترهاست! مدال «کاوشگر برق» مال توست!',
        ),
      },

      {
        type: 'trueFalse',
        prompt: L('When the electrons hold hands and run through the wires together, it is called «electric current».', 'وقتی الکترون‌ها دست هم را می‌گیرند و با هم در سیم‌ها می‌دوند، به آن «جریان برق» می‌گوییم.'),
        answer: true,
        explanation: L('Yes! Those billions of tiny runners moving together make the electric current — the faster they run, the more energy they bring!', 'آره! میلیاردها دوندهٔ کوچولو که با هم می‌دوند، جریان برق را می‌سازند — هرچی تندتر بدوند، انرژی بیشتری می‌آورند!'),
      },
      {
        type: 'mcq',
        prompt: L('Where is electricity born, before it travels a long way to our home?', 'برق قبل از این‌که سفر طولانی کند و به خانهٔ ما برسد، کجا متولد می‌شود؟'),
        options: [
          L('🏭 In the big house of electricity (the power plant)', '🏭 در خانهٔ بزرگ برق (نیروگاه)'),
          L('🔌 In the wall socket of our home', '🔌 در پریز دیوار خانهٔ ما'),
          L('🧊 Inside the fridge', '🧊 داخل یخچال'),
        ],
        answer: 0,
        explanation: L('Right! Electricity is born in the power plant, then rides the tall pylons and the underground wires until it reaches our wall socket!', 'درست است! برق در نیروگاه متولد می‌شود، بعد سوار دکل‌های بلند و سیم‌های زیرزمین می‌شود تا به پریز خانهٔ ما برسد!'),
      },
    ],
    rewardBadge: L('Electricity Explorer Medal', 'مدال افتخارِ «کاوشگر برق»'),
    unlockLessonIds: [],
  },

  // -------------------------------------------------------------- 3. safety (moved early per user curriculum)
  {
    id: 'l0-3',
    levelId: 'level0',
    title: L("The little engineer's safety rules", 'قوانین ایمنی مهندس کوچولو'),
    emoji: '🛡️',
    difficulty: 1,
    minutes: 6,
    objectives: [
      L('I only work with batteries — never wall outlets', 'فقط با باتری کار می‌کنم، نه پریز دیوار'),
      L('I never short-circuit a battery', 'هرگز باتری را اتصال کوتاه نمی‌کنم'),
      L('I keep my desk tidy and my hands dry', 'میزم مرتب و دست‌هام خشکه'),
    ],
    screens: [
      {
        // page 1 — the golden safety medal with its 4 rule-locks
        type: 'explain',
        speaker: 'robot',
        title: L('The Golden Safety Medal! 🛡️✨', 'مدال طلاییِ ایمنی! 🛡️✨'),
        body: L(
          'Hello to my brave and clever little engineers!\n\nDid you know that all the great scientists and inventors of the world learn one big secret before building robots and rockets? That secret is «safety»!\n\nToday we are not just going to experiment; we are going to learn 4 golden rules to pin the shining Safety Medal onto our chests. Are you ready to learn the safety rules and become a real engineer?',
          'سلام به مهندس‌های شجاع و باهوش من!\n\nمی‌دونستید همهٔ دانشمندها و مخترع‌های بزرگ دنیا، قبل از ساختن ربات‌ها و موشک‌ها، یک راز بزرگ رو یاد می‌گیرند؟ اون راز «ایمنی» است!\n\nامروز قرار نیست فقط آزمایش کنیم؛ قراره ۴ تا قانون طلایی رو یاد بگیریم تا مدال درخشان ایمنی رو روی سینه‌مون بچسبونیم. آماده‌اید قوانین ایمنی رو یاد بگیرید و یک مهندس واقعی بشید؟',
        ),
        scene: { kind: 'shield-unlock', props: { image: '/images/lessons/l0-3/1-shield.png' } },
      },
      {
        // page 2 — rule 1: batteries only, never the wall-socket giant
        type: 'explain',
        speaker: 'robot',
        title: L('Rule 1: The wall-socket giant is forbidden! 🔌⛔', 'قانون اول: غول پریز دیوار ممنوع! 🔌⛔'),
        body: L(
          'The first and most important rule of little engineers: the electricity for ALL of our experiments comes ONLY from batteries!\n\nThe sockets on the walls of our house are like very strong and angry giants — connecting a wire to them is very dangerous.\n\nWe never, ever put any wire or thing into a wall socket. Little batteries are the kind and 100% safe friends of all our experiments!',
          'اولین و مهم‌ترین قانون مهندس‌های کوچولو اینه: برق تمام آزمایش‌های ما فقط و فقط از باتری میاد!\n\nپریزهای روی دیوار خانه مثل غول‌های خیلی قوی و عصبانی هستند که وصل کردن سیم به اون‌ها بسیار خطرناکه.\n\nما هیچ‌وقت هیچ سیم یا وسیله‌ای رو داخل پریز دیوار نمی‌کنیم. باتری‌های کوچک دوست‌های مهربان و ۱۰۰٪ امن ما در تمام آزمایش‌ها هستند!',
        ),
        scene: { kind: 'battery-socket', props: { image: '/images/lessons/l0-3/2-battery-socket.png' } },
      },
      {
        // page 3 — rule 2: the secret of the short circuit
        type: 'explain',
        speaker: 'robot',
        title: L('Rule 2: The secret of the short circuit! ⚡🔥', 'قانون دوم: راز اتصال کوتاه! ⚡🔥'),
        body: L(
          'Never connect the two ends of a battery (+ and −) directly together with an empty wire!\n\nThis is called a short circuit. When it happens, the electrons run around with no purpose, the wire and the battery get hot, and the battery\u2019s energy runs out very fast!\n\nThere should always be a part like a lamp, an LED or a motor in the middle of the path, to control the speed of the electrons and use up their energy!',
          'هیچ‌وقت دو سر باتری (مثبت و منفی) رو مستقیماً با یک سیم خالی به هم وصل نکنید!\n\nبه این کار می‌گیم اتصال کوتاه. وقتی این اتفاق می‌افته، الکترون‌ها بی‌هدف میدوند، سیم و باتری داغ میشن و انرژی باتری سریع تموم میشه!\n\nهمیشه باید قطعه‌ای مثل لامپ، LED یا موتور وسط مسیر باشه تا سرعت الکترون‌ها رو کنترل کنه و انرژی‌شون رو استفاده کنه!',
        ),
        scene: { kind: 'short-circuit', props: { image: '/images/lessons/l0-3/3-short-circuit.png' } },
      },
      {
        // page 4 — rule 3: clean desk and dry hands
        type: 'explain',
        speaker: 'robot',
        title: L('Rule 3: A clean and dry work desk! 💧❌', 'قانون سوم: میز کار تمیز و خشک! 💧❌'),
        body: L(
          'Water and electricity never become friends! That is why for every engineering experiment:\n\n🧼 Dry hands: before touching the parts, dry your hands really well.\n\n🧹 Tidy desk: work on a dry and uncluttered desk.\n\n👄 Nothing near the mouth: never take the tiny parts and wires near your mouth.\n\nWhen our work desk is clean and dry, we work exactly like the great scientists!',
          'آب و برق هیچ‌وقت با هم دوست نمیشن! برای همین برای هر آزمایش مهندسی:\n\n🧼 دست‌ها خشک: قبل از دست زدن به قطعات، دست‌هاتون رو خوب خشک کنید.\n\n🧹 میز مرتب: روی یک میز خشک و خلوت کار کنید.\n\n👄 دهان ممنوع: قطعات کوچولو و سیم‌ها رو هیچ‌وقت نزدیک دهان نبرید.\n\nوقتی میز کارمون تمیز و خشک باشه، درست مثل دانشمندهای بزرگ کار می‌کنیم!',
        ),
        scene: { kind: 'tidy-desk', props: { image: '/images/lessons/l0-3/4-tidy-desk.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: rescue the dangerous circuit! 🚨', 'تمرین ساختنی: نجات مدار خطرناک! 🚨'),
        body: L('Watch out, safety engineer! Somebody connected the two ends of the battery with a bare wire — a short circuit! The battery is getting hot. Delete that dangerous wire, then build a safe road through the resistor and the LED!', 'مواظب باش مهندس ایمنی! یک‌ نفر دو سر باتری را با سیم خالی وصل کرده — اتصال کوتاه! باتری دارد داغ می‌شود. آن سیم خطرناک را حذف کن و بعد یک جادهٔ امن از مقاومت و LED بساز!'),
        task: {
          brief: L('Remove the short circuit and light the LED the safe way.', 'اتصال کوتاه را بردار و LED را به روش امن روشن کن.'),
          goal: g.and(g.noShort(), g.ledOn('led1'), g.ledCurrentSafe('led1')),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 240 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 400, y: 240 }),
              c('led', 'led1', { x: 620, y: 240 }),
            ],
            [
              w('w0', 'b1', 'pos', 'b1', 'neg'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('First select the dangerous wire that goes from + to − of the battery and delete it!', 'اول سیم خطرناکی که از + به − باتری می‌رود را انتخابش کن و حذفش کن!'),
            L('Now build the safe road: battery → resistor → LED → back to the battery.', 'حالا جادهٔ امن را بساز: باتری → مقاومت → LED → برگشت به باتری.'),
          ],
        },
      },
      {
        // page 5 — the little engineer's oath + the medal quiz (user's exact question)
        type: 'quiz',
        title: L('Receive the Safety Honor Medal! 🏅🏆', 'دریافت مدال افتخار ایمنی! 🏅🏆'),
        speaker: 'robot',
        body: L(
          'Bravo, my champion explorers! You have learned all the safety rules.\n\nNow put your hand on your chest and read this oath: «I am a careful little engineer, and I only work with batteries!»\n\nNow it is time to unlock your Safety Medal by answering the question below!',
          'آفرین به کاوشگرهای قهرمان من! شما تمام قوانین ایمنی رو یاد گرفتید.\n\nحالا دستت رو بگذار روی سینه‌ات و این سوگند رو بخون: «من یک مهندس کوچولوی بااحتیاط هستم و فقط با باتری کار می‌کنم!»\n\nحالا وقتشه با پاسخ به سوال زیر، مدال ایمنی رو آزاد کنی!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-3/5-medal-party.png' } },
      },
    ],
    quiz: [
      {
        type: 'mcq',
        prompt: L(
          'If we connect the two ends of a battery directly with a wire and put no lamp in between, what happens?',
          'اگر دو سر باتری رو مستقیماً با سیم به هم وصل کنیم و هیچ لامپی وسطش نباشه، چه اتفاقی می‌افته؟',
        ),
        options: [
          L('⚡ A short circuit happens and the battery gets hot!', '⚡ اتصال کوتاه میشه و باتری داغ میشه!'),
          L('💡 The lamp turns on by itself!', '💡 لامپ خودبه‌خود روشن میشه!'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, champion! ⚡ That is called a short circuit: the electrons dash around with no purpose, the wire and battery get hot. A part like a lamp must always sit in the middle of the path. The Golden Safety Medal is now yours! 🏅',
          'آفرین قهرمان! ⚡ به این اتفاق میگن اتصال کوتاه: الکترون‌ها بی‌هدف میدوند و سیم و باتری داغ میشه. همیشه باید یک قطعه مثل لامپ وسط مسیر باشه. مدال طلاییِ ایمنی حالا مال توست! 🏅',
        ),
      },

      {
        type: 'trueFalse',
        prompt: L('Little engineers ONLY experiment with batteries — we never put anything into the wall socket.', 'مهندس‌های کوچولو فقط و فقط با باتری آزمایش می‌کنند — هیچ‌وقت چیزی داخل پریز دیوار نمی‌گذاریم.'),
        answer: true,
        explanation: L('Correct, my careful engineer! Wall-socket power is like a mighty lion — only for grown-ups. Our kind friend is the little battery!', 'درسته مهندس بااحتیاط من! برق پریز مثل شیر پرقدرته و فقط مخصوص بزرگ‌ترها. دوست مهربان ما باتری کوچولوئه!'),
      },
      {
        type: 'mcq',
        prompt: L('Before touching the parts and building a circuit, what should our hands be like?', 'قبل از دست زدن به قطعات و ساختن مدار، دست‌هایمان باید چطور باشند؟'),
        options: [
          L('🧼 Completely dry', '🧼 کاملاً خشک'),
          L('💧 Wet and fresh', '💧 خیس و تازه'),
          L('🧴 Oily and soft', '🧴 چرب و نرم'),
        ],
        answer: 0,
        explanation: L('Yes! Water and electricity never become friends — dry hands keep us safe, just like the great scientists!', 'آره! آب و برق هیچ‌وقت با هم دوست نمی‌شوند — دست خشک ما را ایمن نگه می‌دارد، درست مثل دانشمندهای بزرگ!'),
      },
      {
        type: 'mcq',
        prompt: L('Which one describes the work desk of a real little engineer?', 'کدام گزینه، میز کار یک مهندس کوچولوی واقعی را توصیف می‌کند؟'),
        options: [
          L('🧹 Dry, tidy, and tiny parts far from the mouth', '🧹 خشک، مرتب و قطعات کوچک دور از دهان'),
          L('🌧️ Wet and crowded with everything', '🌧️ خیس و شلوغ از وسایل'),
          L('✂️ Chewing the wires while working', '✂️ جویدن سیم‌ها هنگام کار'),
        ],
        answer: 0,
        explanation: L('Bravo! A clean, dry desk and nothing near the mouth — that is exactly how professional engineers work every day!', 'آفرین! میز تمیز و خشک و هیچ‌چیز نزدیک دهان — مهندس‌های حرفه‌ای دقیقاً هر روز همین‌طور کار می‌کنند!'),
      },
    ],
    rewardBadge: L('The Golden Safety Medal', 'مدال طلاییِ ایمنی'),
    unlockLessonIds: ['l0-2'],
  },

  // --------------------------------------------------- 4. the circuit (new-format story lesson)
  // User-written content: 4 robot-narrated picture pages with hands-on scenes
  // (see components/lesson/story-scenes.tsx), then the smart-explorer quiz and
  // the «مهندس راه‌ساز مدار» medal.
  {
    id: 'l0-4',
    levelId: 'level0',
    title: L('What is a circuit? (The magic road & the closed loop)', 'مدار چیست؟ (جادهٔ جادویی و حلقهٔ بسته)'),
    emoji: '🔄',
    difficulty: 1,
    minutes: 7,
    objectives: [
      L('Understand that electrons need a closed, round road (a circuit)', 'بفهم الکترون‌ها به یک مسیر گرد و بسته (مدار) نیاز دارند'),
      L('Tell closed and open circuits apart', 'مدار بسته و مدار باز رو از هم تشخیص بده'),
      L('Name the 4 main stations of every circuit', '۴ ایستگاه اصلی هر مدار رو نام ببر'),
    ],
    screens: [
      {
        // page 1 — the round magic road: the racetrack analogy
        type: 'explain',
        speaker: 'robot',
        title: L('The round magic road! 🛣️✨', 'جادهٔ جادوییِ گرد! 🛣️✨'),
        body: L(
          'Hello, my clever explorers!\n\nHave you ever seen a toy-car track or the school running field, which is a completely closed circle or oval? The cars start from the start line, go around, and come right back to where they began.\n\nOur energetic electrons are exactly like that! To run and work, they need a completely closed and round path — we call it an «electric circuit».\n\n«Circuit» means going around and around! The electrons set off from one side of the battery, dash inside the wires, and come right back to the battery.',
          'سلام به کاوشگرهای باهوش من!\n\nتا حالا پیست ماشین‌بازی یا زمین دوومیدانی مدرسه رو دیدید که یک دایره یا بیضیِ کاملاً بسته‌ است؟ ماشین‌ها از خط شروع راه میفتند، دور می‌زنند و دوباره برمی‌گردند به جای اولشون.\n\nالکترون‌های پرانرژی ما هم دقیقاً همین‌طورند! اون‌ها برای دویدن و کار کردن به یک مسیرِ کاملاً بسته و گرد نیاز دارند که بهش می‌گیم «مدار الکتریکی».\n\n«مدار» یعنی چرخیدن و دور زدن! الکترون‌ها از یک طرف باتری راه میفتند، توی سیم‌ها می‌دوند و دوباره برمی‌گردند به باتری.',
        ),
        scene: { kind: 'race-start', props: { image: '/images/lessons/l0-4/1-racetrack.png' } },
      },
      {
        // page 2 — the closed circuit: the bridge is down
        type: 'explain',
        speaker: 'robot',
        title: L('Closed circuit; the healthy, smooth road! 🟢🚗', 'مدار بسته؛ جادهٔ سالم و هموار! 🟢🚗'),
        body: L(
          'Now, when do you think the room lamp turns on, or a toy motor starts spinning?\n\nWhen our road has no break or gap at all! We call this complete road a «closed circuit».\n\nIn a closed circuit, all the wires, the battery and the parts are firmly connected to each other. The electrons can zoom around with no obstacle, give their energy to the lamp and light it up! Just like a bridge that is completely down and cars cross the river easily.',
          'حالا فکر می‌کنید کی چراغ اتاق روشن میشه یا موتور اسباب‌بازی شروع به چرخیدن می‌کنه؟\n\nوقتی که جادهٔ ما هیچ شکستگی یا فاصله‌ای نداشته باشه! به این جادهٔ کامل می‌گیم «مدار بسته».\n\nتوی مدار بسته، تمام سیم‌ها، باتری و قطعات محکم به هم وصل شده‌اند. الکترون‌ها می‌تونند بدون هیچ مانعی دور بزنند، به چراغ انرژی بدند و اون رو روشن کنند! درست مثل پلی که کاملاً پایین اومده و ماشین‌ها راحت از روی رودخانه می‌گذرند.',
        ),
        scene: { kind: 'trace-circuit', props: { image: '/images/lessons/l0-4/2-closed-circuit.png' } },
      },
      {
        // page 3 — the open circuit: the bridge is up
        type: 'explain',
        speaker: 'robot',
        title: L('Open circuit; the broken road! 🔴🛑', 'مدار باز؛ جادهٔ قطع‌شده! 🔴🛑'),
        body: L(
          'But what if the road gets cut somewhere? For example a wire breaks, or we turn the switch off?\n\nWe call this road an «open circuit»!\n\nWhen the road opens, it is exactly like the bridge over the river being pulled up! The electrons stop in front of the broken road and cannot continue. That is why the electric current stops and the lamp goes off!\n\nSo whenever a lamp is off, it means the electrons\u2019 road is open somewhere!',
          'اما اگر یک جای این جاده قطع بشه چی؟ مثلاً یک سیم در بره، یا کلید رو خاموش کنیم؟\n\nبه این جاده می‌گیم «مدار باز»!\n\nوقتی جاده باز بشه، درست مثل اینه که پلِ روی رودخانه بالا رفته باشه! الکترون‌ها جلوی جادهٔ قطع‌شده متوقف می‌شن و نمی‌تونند ادامه بدند. برای همین، جریان برق قطع میشه و لامپ هم خاموش میشه!\n\nپس هروقت چراغی خاموشه، معنیش اینه که جاده الکترون‌ها یک جا باز شده!',
        ),
        scene: { kind: 'fix-circuit', props: { image: '/images/lessons/l0-4/3-open-circuit.png' } },
      },
      {
        // page 4 — the 4 important stations of every circuit
        type: 'explain',
        speaker: 'robot',
        title: L('The important stations of the circuit road! 🚉⚡', 'ایستگاه‌های مهم در جادهٔ مدار! 🚉⚡'),
        body: L(
          'In every magic circuit we have 4 main stations — without them the road is not complete:\n\n1. 🔋 The energy pump (the battery): it pushes the electrons so they move.\n2. 🧵 The moving road (the copper wires): they are the path the electrons travel on.\n3. 🚦 The road gate (the switch): it opens and closes the road.\n4. 💡 The energy user (the lamp or motor): it takes the electrons\u2019 energy and makes light or motion.',
          'توی هر مدار جادویی، ۴ تا ایستگاه اصلی داریم که بدون اون‌ها جاده کامل نمیشه:\n\n1. 🔋 پمپ انرژی (باتری): الکترون‌ها رو هول میده تا حرکت کنند.\n2. 🧵 جادهٔ حرکت (سیم‌های مس): مسیر رفت و آمد الکترون‌ها هستند.\n3. 🚦 دروازهٔ جاده (کلید): جاده رو باز و بسته می‌کنه.\n4. 💡 مصرف‌کننده انرژی (لامپ یا موتور): انرژی الکترون‌ها رو می‌گیره و نور یا حرکت می‌سازه.',
        ),
        scene: { kind: 'circuit-stations', props: { image: '/images/lessons/l0-4/4-stations-map.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: close the circle! 🔄', 'تمرین ساختنی: دایره را ببند! 🔄'),
        body: L('The road is almost finished — but one piece is missing and the gate (the switch) is still open! Complete the circle of the electrons and close the gate to let the runners through!', 'جاده تقریباً تمام است — ولی یک تکه‌اش گم شده و دروازه (کلید) هم هنوز باز است! دایرهٔ الکترون‌ها را کامل کن و دروازه را ببند تا دونده‌ها رد شوند!'),
        task: {
          brief: L('Add the missing return wire and close the switch so the LED lights up.', 'سیمِ برگشتِ جاافتاده را اضافه کن و کلید را ببند تا LED روشن شود.'),
          goal: g.and(g.ledOn('led1'), g.noShort(), g.switchClosed()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 200 }),
              c('switch', 'sw1', { x: 300, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 470, y: 200 }),
              c('led', 'led1', { x: 640, y: 200 }),
            ],
            [
              w('w1', 'b1', 'pos', 'sw1', 'a'),
              w('w2', 'sw1', 'b', 'r1', 'a'),
              w('w3', 'r1', 'b', 'led1', 'anode'),
            ],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('One wire is missing: from the short leg of the LED back to the − of the battery.', 'یک سیم کم داری: از پایهٔ کوتاه LED برگرد به پایهٔ − باتری.'),
            L('The gate is open! Tap the switch to close it, then run the circuit.', 'دروازه باز است! روی کلید بزن تا بسته شود، بعد مدار را روشن کن.'),
          ],
        },
      },
      {
        // page 5 — the smart explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The smart circuit explorer\u2019s quiz! 🏆🎮', 'آزمون کاوشگر هوشمند مدار! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Well done, my step-by-step explorers! Now it is time to show how well you learned the secret of the electric roads!',
          'آفرین به کاوشگرهای گام‌به‌گام من! حالا وقتشه نشون بدید چقدر خوب راز جاده‌های الکتریکی رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-4/5-circuit-trophy.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'When we turn the light switch off so the room lamp goes dark, what happens to the electrons\u2019 road?',
          'وقتی کلید برق رو خاموش می‌کنیم تا چراغ اتاق خاموش بشه، جادهٔ الکترون‌ها چه تغییری می‌کنه؟',
        ),
        options: [
          L('🔴 The road opens (open circuit) and the electrons stop.', '🔴 جاده باز میشه (مدار باز) و الکترون‌ها متوقف میشن.'),
          L('🟢 The road closes (closed circuit) and the electrons run faster.', '🟢 جاده بسته میشه (مدار بسته) و الکترون‌ها سریع‌تر میدوند.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, champion! 🔴 When we turn the switch off, the electrons\u2019 road opens and they stop — that is why the lamp goes dark. The «Circuit Road-Builder Engineer» medal is now yours! 🏅',
          'آفرین قهرمان! 🔴 وقتی کلید رو خاموش می‌کنیم، جادهٔ الکترون‌ها باز میشه و اون‌ها متوقف میشن؛ برای همین چراغ خاموش میشه. حالا مدال «مهندس راه‌ساز مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'diagnose',
        prompt: L('Everything is ready, but the lamp will not light up. Look at the road carefully — why?', 'همه‌چیز آماده است ولی لامپ روشن نمی‌شود. خوب به جاده نگاه کن — چرا؟'),
        circuit: diagnoseGap,
        options: [
          L('🛑 The road is incomplete — the return wire back to the battery is missing!', '🛑 جاده ناقص است — سیم برگشت به باتری وصل نشده است!'),
          L('🔋 The battery is empty', '🔋 باتری خالی شده است'),
          L('💡 The lamp is broken', '💡 لامپ خراب است'),
        ],
        answer: 0,
        explanation: L('Sharp eyes, engineer! The loop is not closed yet: the electrons have no way back to the battery, so they all stand still. Complete the circle and the lamp will shine!', 'چشم‌های تیزبینی داری مهندس! حلقه هنوز بسته نشده: الکترون‌ها راهی برای برگشت به باتری ندارند و همه سر جایشان ایستاده‌اند. دایره را کامل کن تا لامپ روشن شود!'),
      },
      {
        type: 'trueFalse',
        prompt: L('A «closed circuit» means the road is complete with no gaps — and that is when the lamp lights up.', '«مدار بسته» یعنی جاده کامل و بدون شکاف است — و همان وقتی است که چراغ روشن می‌شود.'),
        answer: true,
        explanation: L('Exactly! A closed, gap-free road lets the electrons zoom around and hand their energy to the lamp!', 'دقیقاً! جادهٔ بسته و بی‌شکاف به الکترون‌ها اجازه می‌دهد دور بزنند و انرژی‌شان را به لامپ بدهند!'),
      },
      {
        type: 'mcq',
        prompt: L('Which one is NOT one of the 4 main stations of a circuit?', 'کدام‌یک از ۴ ایستگاه اصلی مدار نیست؟'),
        options: [
          L('🌸 A flower pot', '🌸 یک گلدان'),
          L('🔋 The energy pump (the battery)', '🔋 پمپ انرژی (باتری)'),
          L('🚦 The road gate (the switch)', '🚦 دروازهٔ جاده (کلید)'),
        ],
        answer: 0,
        explanation: L('So funny — and so right! A flower pot has no job in our circuit. The real stations are the battery, the wires, the switch and the lamp (or motor)!', 'چه بامزه — و چه درست! گلدان توی مدار ما هیچ کاری ندارد. ایستگاه‌های واقعی عبارت‌اند از باتری، سیم‌ها، کلید و لامپ (یا موتور)!'),
      },
    ],
    rewardBadge: L('The Circuit Road-Builder Engineer Medal', 'مدال افتخارِ «مهندس راه‌ساز مدار»'),
    unlockLessonIds: ['l0-3'],
  },

  // ------------------ 5. open vs closed circuits (new-format story lesson)
  // User-written content: 4 robot-narrated picture pages around the moving
  // road-bridge analogy (see components/lesson/story-scenes.tsx), then the
  // bridge-builder quiz and the «مهندس پل‌ساز مدار» medal.
  {
    id: 'l0-5',
    levelId: 'level0',
    title: L('Open & closed circuits (the road bridge)', 'مدار باز و مدار بسته (پلِ جاده)'),
    emoji: '🌉',
    difficulty: 1,
    minutes: 7,
    objectives: [
      L('Tell closed and open circuits apart with the bridge story', 'با داستان پل، مدار بسته و مدار باز رو از هم تشخیص بده'),
      L('Explain that in a closed circuit current flows and lamps light up', 'بگو توی مدار بسته برق جریان داره و چراغ‌ها روشن می‌شن'),
      L('Use the switch as the commander of the road bridge', 'کلید برق رو مثل فرماندهٔ پل جاده به کار ببر'),
    ],
    screens: [
      {
        // page 1 — the tale of the magic road bridge
        type: 'explain',
        speaker: 'robot',
        title: L('The tale of the magic road bridge! 🌉✨', 'داستان پل جادویی جاده! 🌉✨'),
        body: L(
          'Hello to my explorer engineers!\n\nHave you ever watched a video or a picture of moving bridges over rivers? The ones that lift up when a ship wants to pass, and come back down when the cars want to cross!\n\nIn the world of electronics we have exactly one magic bridge! Our electrons are little energetic cars that want to cross this bridge.\n\nToday we want to see how raising and lowering this bridge turns lamps on and off!',
          'سلام به مهندس‌های کاوشگر من!\n\nتا حالا فیلم یا تصویر پل‌های متحرک روی رودخانه‌ها رو دیدید؟ همون پل‌هایی که وقتی کشتی می‌خواد رد بشه، بالا میرن و وقتی ماشین‌ها می‌خوان رد بشن، می‌ان پایین!\n\nتوی دنیای الکترونیک هم ما دقیقاً یک پل جادویی داریم! الکترون‌های ما ماشین‌های کوچولوی پرانرژی هستند که می‌خوان از روی این پل رد بشن.\n\nامروز می‌خوایم ببینیم چطور با بالا و پایین بردن این پل، چراغ‌ها رو روشن و خاموش می‌کنیم!',
        ),
        scene: { kind: 'bridge-move', props: { image: '/images/lessons/l0-5/1-drawbridge.png' } },
      },
      {
        // page 2 — the bridge comes down: the closed circuit
        type: 'explain',
        speaker: 'robot',
        title: L('The bridge came down; the circuit closed! 🟢💡', 'پل پایین آمد؛ مدار بسته شد! 🟢💡'),
        body: L(
          'Look! When the bridge comes all the way down and the two sides of the road connect, what happens?\n\nThe road becomes completely smooth and flat! The electron cars happily hold hands, quickly cross the bridge, and arrive at the house of light (the LED lamp).\n\nWhen the road is completely connected and gapless like this, we call it a «closed circuit». In a closed circuit, electricity flows and the lamps turn on!',
          'نگاه کنید! وقتی پل کاملاً پایین می‌آید و دو طرف جاده به هم وصل می‌شن، چه اتفاقی می‌افته؟\n\nجاده کاملاً صاف و هموار میشه! ماشین‌های الکترون با خوشحالی دست همدیگه رو می‌گیرند، سریع از روی پل رد می‌شن و می‌رسن به خانهٔ نور (لامپ LED).\n\nوقتی جاده این‌طوری کاملاً وصل و بی‌فاصله‌ است، بهش می‌گیم «مدار بسته». توی مدار بسته، برق جریان داره و چراغ‌ها روشن می‌شن!',
        ),
        scene: { kind: 'bridge-cross', props: { image: '/images/lessons/l0-5/2-bridge-closed.png' } },
      },
      {
        // page 3 — the bridge goes up: the open circuit
        type: 'explain',
        speaker: 'robot',
        title: L('The bridge went up; the circuit opened! 🔴🛑', 'پل بالا رفت؛ مدار باز شد! 🔴🛑'),
        body: L(
          'Now what if the bridge goes up and a big gap and hole opens in the middle of the road?\n\nThe electron cars stop in front of the bridge! They cannot jump or fly through the air, so they all quietly stand still.\n\nWhen the road is cut and a gap opens between the wires, we call it an «open circuit». In an open circuit, the electrons do not move and the lamp stays dark!',
          'حالا اگر پل بالا بره و وسط جاده یک فاصله و شکاف بزرگ بیفته چی؟\n\nماشین‌های الکترون جلوی پل متوقف می‌شن! اون‌ها نمی‌تونند بپرند یا از روی هوا رد بشن، پس همگی آروم می‌ایستند.\n\nوقتی جاده قطع بشه و بین سیم‌ها فاصله بیفته، بهش می‌گیم «مدار باز». توی مدار باز، الکترون‌ها حرکت نمی‌کنند و چراغ خاموش می‌مونه!',
        ),
        scene: { kind: 'bridge-open', props: { image: '/images/lessons/l0-5/3-bridge-open.png' } },
      },
      {
        // page 4 — the power switch: the clever keeper of the bridge
        type: 'explain',
        speaker: 'robot',
        title: L('The power switch; the commander of the road bridge! 🎛️⚡', 'کلید برق؛ فرماندهٔ پل جاده! 🎛️⚡'),
        body: L(
          'Did you know you have dozens of magic bridges in your home?\n\nEvery time you press the power switch on the wall or the flashlight switch, you are actually giving the order to raise or lower the bridge!\n\n🟢 When you turn the switch ON: the bridge comes down ➔ the circuit closes ➔ the lamp turns on!\n\n🔴 When you turn the switch OFF: the bridge goes up ➔ the circuit opens ➔ the lamp turns off!',
          'می‌دونستید شما توی خونه‌تون ده‌ها پل جادویی دارید؟\n\nهروقت کلید برق روی دیوار یا کلید چراغ‌قوه رو فشار می‌دید، در واقع دارید فرمان بالا و پایین رفتن پل رو می‌دید!\n\n🟢 وقتی کلید رو روشن (ON) می‌کنید: پل پایین میاد ➔ مدار بسته میشه ➔ چراغ روشن میشه!\n\n🔴 وقتی کلید رو خاموش (OFF) می‌کنید: پل بالا میره ➔ مدار باز میشه ➔ چراغ خاموش میشه!',
        ),
        scene: { kind: 'bridge-switch', props: { image: '/images/lessons/l0-5/4-switch-keeper.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: build the bridge! 🌉', 'تمرین ساختنی: پل را بساز! 🌉'),
        body: L('The electrons are stuck! The road has a gap and the bridge keeper is missing. Take a switch from the box, place it in the gap and close it — the bridge comes down and the light returns!', 'الکترون‌ها گیر کرده‌اند! جاده شکاف دارد و پل‌بان هم نیست. از جعبه یک کلید بردار، داخل شکاف بگذار و ببندش — پل پایین می‌آید و نور برمی‌گردد!'),
        task: {
          brief: L('Add a switch to the gap and close it so the LED lights up.', 'داخل شکافِ جاده یک کلید اضافه کن و ببندش تا LED روشن شود.'),
          goal: g.and(g.switchPresent(), g.switchClosed(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 400, y: 200 }),
              c('led', 'led1', { x: 620, y: 200 }),
            ],
            [
              w('w1', 'b1', 'pos', 'r1', 'a'),
              w('w2', 'r1', 'b', 'led1', 'anode'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led', 'switch'],
          hints: [
            L('Pick the switch from the parts palette and drop it into the gap of the road.', 'کلید را از جعبهٔ قطعات بردار و داخل شکافِ جاده بگذار.'),
            L('Wire it in: short leg of the LED → switch → back to the − of the battery. Then close it!', 'سیم‌کشیش کن: پایهٔ کوتاه LED → کلید → برگشت به − باتری. بعد ببندش!'),
          ],
        },
      },
      {
        // page 5 — the bridge-builder's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The bridge-builder engineer\u2019s quiz! 🏆🎮', 'آزمون مهندس پل‌ساز! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my champion explorers! Now it is time to show how well you learned the secret of the electron road bridges!',
          'آفرین به کاوشگرهای قهرمان من! حالا وقتشه نشون بدید چقدر خوب راز پل‌های جادهٔ الکترون رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-5/5-bridge-trophy.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'When we press the flashlight button and its beautiful light turns on, in which state is the electrons\u2019 road?',
          'وقتی دکمهٔ چراغ‌قوه رو فشار می‌دیم و نور قشنگش روشن میشه، جادهٔ الکترون‌ها توی چه حالتی قرار گرفته؟',
        ),
        options: [
          L('🟢 The bridge has come down and the circuit is closed.', '🟢 پل پایین اومده و مدار بسته است.'),
          L('🔴 The bridge has gone up and the circuit is open.', '🔴 پل بالا رفته و مدار باز است.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my bridge-builder engineer! 🟢 When we press the switch, the bridge comes down, the circuit closes, and the current flows — that is why the flashlight shines so beautifully. The «Circuit Bridge-Builder Engineer» medal is now yours! 🏅',
          'آفرین به مهندس پل‌ساز من! 🟢 وقتی کلید رو فشار می‌دیم، پل پایین میاد، مدار بسته میشه و برق جریان پیدا می‌کنه؛ برای همین چراغ‌قوه نور قشنگی میده. حالا مدال «مهندس پل‌ساز مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'diagnose',
        prompt: L('All the wires look connected, but the flashlight is dark. Who is the culprit?', 'همهٔ سیم‌ها وصل به نظر می‌رسند ولی چراغ‌قوه خاموش است. مقصر کیست؟'),
        circuit: diagnoseOpenSwitch,
        options: [
          L('🔴 The switch is open — it lifted the bridge up!', '🔴 کلید باز است — پل را بالا برده است!'),
          L('🔋 The battery is upside down', '🔋 باتری برعکس وصل شده'),
          L('😴 The lamp is sleepy', '😴 لامپ خوابش برده'),
        ],
        answer: 0,
        explanation: L('Detective genius! The open switch is the lifted bridge: the road has a gap, the electrons cannot cross, and the lamp stays dark. Close the switch and the light comes on!', 'نابغهٔ کارآگاه! کلید باز یعنی پل بالا رفته: جاده شکاف دارد، الکترون‌ها نمی‌توانند رد شوند و لامپ خاموش می‌ماند. کلید را ببند تا نور بیاید!'),
      },
      {
        type: 'circuitPick',
        prompt: L('Which circuit picture lights the lamp up?', 'کدام تصویر مدار، لامپ را روشن می‌کند؟'),
        variants: ['open', 'closed', 'same-pin'],
        answer: 1,
        explanation: L('Perfect choice! Only the closed circuit — the bridge fully down — completes the electrons road and lights the lamp. The open circuit and the loose same-pin wire leave the road broken!', 'انتخاب عالی! فقط مدار بسته — با پلِ کاملاً پایین — جادهٔ الکترون‌ها را کامل می‌کند و لامپ را روشن می‌کند. مدار باز و سیمِ جاافتاده در یک پایه، جاده را قطع نگه می‌دارند!'),
      },
      {
        type: 'trueFalse',
        prompt: L('The switch is like the road bridge: ON means the bridge is down, OFF means the bridge is up.', 'کلید مثل پل جاده است: روشن (ON) یعنی پل پایین است، خاموش (OFF) یعنی پل بالا رفته.'),
        answer: true,
        explanation: L('Exactly! That little bridge inside the switch decides whether the electron cars may cross or must wait!', 'دقیقاً! همان پل کوچولوی داخل کلید تصمیم می‌گیرد که ماشین‌های الکترون اجازهٔ عبور دارند یا باید منتظر بمانند!'),
      },
    ],
    rewardBadge: L('The Circuit Bridge-Builder Engineer Medal', 'مدال افتخارِ «مهندس پل‌ساز مدار»'),
    unlockLessonIds: ['l0-4'],
  },

  // ------------------ 6. conductors & insulators (new-format story lesson)
  // User-written content: 4 robot-narrated picture pages around the
  // «دوستانِ برق vs نگهبان‌های ایمنی» analogy (see components/lesson/
  // story-scenes.tsx), then the material-explorer quiz and the
  // «شناسگر مواد و ایمنی» medal.
  {
    id: 'l0-6',
    levelId: 'level0',
    title: L('Conductors & insulators (what passes electricity?)', 'رسانا و عایق (کدام وسایل برق را رد می‌کنند؟)'),
    emoji: '🛡️',
    difficulty: 1,
    minutes: 7,
    objectives: [
      L('Tell the friends of electricity (conductors) and the safety guards (insulators) apart', 'دوستانِ برق (رساناها) و نگهبانانِ ایمنی (عایق‌ها) رو از هم تشخیص بده'),
      L('Give examples: copper, iron, aluminum and gold / plastic, wood, rubber, glass and fabric', 'مثال بزن: مس، آهن، آلومینیوم و طلا / پلاستیک، چوب، لاستیک، شیشه و پارچه'),
      L('Test objects with the detective experiment to see which ones pass electricity', 'با آزمایش کارآگاهی وسایل رو بیازما تا ببینی کدوم‌ها برق رو رد می‌کنند'),
      L('Explain why wires wear a colorful plastic safety coat', 'بگو چرا سیم‌ها روکش پلاستیکی رنگی دارند'),
    ],
    screens: [
      {
        // page 1 — the friends of electricity and the guards of electricity
        type: 'explain',
        speaker: 'robot',
        title: L('The friends of electricity and the guards of electricity! 🚪🛡️', 'دوستانِ برق و نگهبانانِ برق! 🚪🛡️'),
        body: L(
          'Hello to my clever and curious explorers!\n\nHave you ever noticed why electric wires are wrapped in colorful plastic layers? Or why screwdriver bodies are plastic but their tips are metal?\n\nIn the world of objects we have two very important and amazing groups:\n\n1. 🚀 Conductors (friends of electricity): materials that, like smooth traffic-free highways, let the electrons pass through them easily.\n2. 🛡️ Insulators (safety guards): materials that stop the electrons from moving and do not let electricity pass through them, so our hands stay safe!\n\nToday we are going to become material detectives and get to know these two groups completely.',
          'سلام به کاوشگرهای باهوش و کنجکاو من!\n\nتا حالا دقت کردید چرا سیم‌های برق رو با لایه‌های پلاستیکیِ رنگارنگ می‌پوشونند؟ یا چرا بدنهٔ پیچ‌گوشتی‌ها پلاستیکیه اما سرشون فلزیه؟\n\nدر دنیای وسایل، ما دو گروه خیلی مهم و شگفت‌انگیز داریم:\n\n1. 🚀 رساناها (دوست‌های برق): موادی که مثل جاده‌های صاف و بدون ترافیک، به الکترون‌ها اجازه می‌دند به‌راحتی از داخلشون رد بشن.\n2. 🛡️ عایق‌ها (نگهبان‌های ایمنی): موادی که جلوی حرکت الکترون‌ها رو می‌گیرند و اجازه نمیدند برق ازشون بگذره تا دست‌های ما آسیب نبینه!\n\nامروز قراره کارآگاهِ مواد بشیم و این دو گروه رو کاملاً بشناسیم.',
        ),
        scene: { kind: 'conductor-insulator' },
      },
      {
        // page 2 — conductors: the smooth highway of the electrons
        type: 'explain',
        speaker: 'robot',
        title: L('Conductors; the smooth highway of the electrons! ⚡🚴‍♂️', 'رساناها؛ بزرگراهِ هموارِ الکترون‌ها! ⚡🚴‍♂️'),
        body: L(
          'Materials that let electricity pass through them easily are called «conductors».\n\nOur energetic electrons are in love with metals! Materials like copper, iron, aluminum and gold work like a perfectly smooth race track for the electrons.\n\nThat is exactly why the inside of every electric wire and toy is made of thin copper strands — so the electrons can run through them at the speed of light, reach the lamps or the motors, and turn them on!',
          'به موادی که برق رو به‌راحتی از خودشون عبور می‌دند، «رسانا» می‌گیم.\n\nالکترون‌های پرانرژی ما عاشقِ فلزات هستند! موادی مثل مس، آهن، آلومینیوم و طلا مثل یک پیست مسابقهٔ کاملاً صاف برای الکترون‌ها عمل می‌کنند.\n\nبرای همینه که داخل تمام سیم‌های برق و اسباب‌بازی‌ها از رشته‌های باریکِ مس ساخته شده تا الکترون‌ها بتونند با سرعت نور توی اون‌ها بدوند، به چراغ‌ها یا موتورها برسند و اون‌ها رو روشن کنند!',
        ),
        scene: { kind: 'copper-slide' },
      },
      {
        // page 3 — insulators: the safety shields of the little engineer
        type: 'explain',
        speaker: 'robot',
        title: L('Insulators; the safety shields of the little engineer! 🧱🧤', 'عایق‌ها؛ سپرهای ایمنیِ مهندس کوچولو! 🧱🧤'),
        body: L(
          'But now imagine if all the wires were bare metal — how could we touch them without the danger of an electric shock?\n\nThis is where «insulators» come to our help! Materials like plastic, wood, rubber, glass and fabric do not let the electrons pass through them.\n\nInsulators are wrapped around the metal wires like a raincoat or a safety coat, so the electricity stays inside the wire and can never hurt our hands!',
          'اما حالا فکر کنید اگر تمام سیم‌ها فلزی و لخت بودند، چطور می‌تونستیم بدون خطرِ برق‌گرفتگی به اون‌ها دست بزنیم؟\n\nاینجاست که «عایق‌ها» به کمک ما می‌آیند! موادی مثل پلاستیک، چوب، لاستیک، شیشه و پارچه اجازه نمیدند الکترون‌ها از داخلشون رد بشن.\n\nعایق‌ها مثل یک لباس بارانی یا روپوش ایمنی دور سیم‌های فلزی کشیده می‌شن تا برق داخل سیم بمونه و به دست ما آسیبی نرسونه!',
        ),
        scene: { kind: 'plastic-raincoat' },
      },
      {
        // page 4 — the detective laboratory: what passes electricity?
        type: 'explain',
        speaker: 'robot',
        title: L('The detective laboratory; what passes electricity? 🔍💡', 'آزمایشگاه کارآگاه؛ چی برق رو رد می‌کنه؟ 🔍💡'),
        body: L(
          'Now how can we find out whether an object is a conductor or an insulator? With a very simple detective experiment!\n\nWe just build a circuit with a gap (an open road). Then we place different objects in the middle of this gap:\n\n🔑 A metal key or a coin: the lamp lights up! ➔ (it is a conductor)\n✏️ A wooden pencil or a plastic ruler: the lamp stays dark! ➔ (it is an insulator)\n📎 A metal paperclip: the lamp lights up! ➔ (it is a conductor)',
          'حالا چطور بفهمیم یک وسیله رسانا است یا عایق؟ با یک آزمایش کارآگاهی خیلی ساده!\n\nکافیه مداری بسازیم که یک فاصله (جاده باز) داشته باشه. حالا وسایل مختلف رو می‌گذاریم وسط این فاصله:\n\n🔑 کلید فلزی یا سکه: چراغ روشن میشه! ➔ (رسانا است)\n✏️ مداد چوبی یا خط‌کش پلاستیکی: چراغ خاموش می‌مونه! ➔ (عایق است)\n📎 گیره کاغذ فلزی: چراغ روشن میشه! ➔ (رسانا است)',
        ),
        scene: { kind: 'material-lab' },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the detective circuit! 🔍', 'تمرین ساختنی: مدار کارآگاه! 🔍'),
        body: L('Time to build your own detective machine! A circuit with a gate: when the gate closes, the lamp lights up. Later you can put mystery materials in the gate place and see which ones let the electricity pass!', 'وقشه ماشین کارآگاهی خودت را بسازی! مداری با یک دروازه: وقتی دروازه بسته شود، چراغ روشن می‌شود. بعداً می‌توانی موادِ ناشناس را جای دروازه بگذاری و ببینی کدام‌ها برق را رد می‌کنند!'),
        task: {
          brief: L('Build the gate circuit: close the switch and the LED must light up.', 'مدارِ دروازه را بساز: کلید را ببند و LED باید روشن شود.'),
          goal: g.and(g.switchClosed(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 3 }, x: 150, y: 210 }),
              c('switch', 'sw1', { x: 330, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 220 }, x: 500, y: 210 }),
              c('led', 'led1', { x: 670, y: 210 }),
            ],
            [
            ],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('Run a road all the way around: battery + → switch → resistor → long leg of the LED.', 'یک جاده کامل بکش: + باتری → کلید → مقاومت → پایهٔ بلند LED.'),
            L('Close the loop back to − of the battery, then close the switch — the lamp must light!', 'حلقه را به − باتری برگردان، بعد کلید را ببند — چراغ باید روشن شود!'),
          ],
        },
      },
      {
        // page 5 — the material-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The material-explorer quiz! 🏆🎮', 'آزمون کاوشگر مواد! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my curious explorers! Now it is time to show how well you learned the secret of conductors and insulators!',
          'آفرین به کاوشگرهای کنجکاو من! حالا وقتشه نشون بدید چقدر خوب راز رساناها و عایق‌ها رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-6/5-material-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'Why do they cover electric metal wires with a colorful plastic layer?',
          'چرا روی سیم‌های فلزی برق رو با یک لایه پلاستیک رنگی می‌پوشونند؟',
        ),
        options: [
          L('🛡️ Because plastic is an insulator and doesn\u2019t let electricity reach our hands and become dangerous.', '🛡️ چون پلاستیک عایق است و نمی‌ذاره برق به دست ما بخوره و خطر داشته باشه.'),
          L('🚀 Because plastic makes the electrons run much faster.', '🚀 چون پلاستیک باعث میشه الکترون‌ها خیلی تندتر بدوند.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my material explorer! 🛡️ Plastic is an insulator — like a safety coat it blocks the electricity so it can never reach your hands. The «Material & Safety Spotter» medal is now yours! 🏅',
          'آفرین به کاوشگر مواد من! 🛡️ پلاستیک عایقه و مثل روپوش ایمنی نمی‌ذاره برق به دست‌هات بخوره. حالا مدال «شناسگر مواد و ایمنی» مال توست! 🏅',
        ),
      },

      {
        type: 'mcq',
        prompt: L('In the detective experiment, which object placed in the gap makes the lamp light up?', 'در آزمایش کارآگاهی، کدام وسیله را وسط فاصلهٔ مدار بگذاریم تا چراغ روشن شود؟'),
        options: [
          L('🔑 A metal key or coin', '🔑 کلید فلزی یا سکه'),
          L('✏️ A wooden pencil', '✏️ مداد چوبی'),
          L('📏 A plastic ruler', '📏 خط‌کش پلاستیکی'),
        ],
        answer: 0,
        explanation: L('Yes, detective! Metal things are conductors — they let the electrons pass and the lamp lights up. Wood and plastic are insulators: the lamp stays dark!', 'آره کارآگاه! وسایل فلزی رسانا هستند — به الکترون‌ها اجازهٔ عبور می‌دهند و چراغ روشن می‌شود. چوب و پلاستیک عایق‌اند: چراغ خاموش می‌ماند!'),
      },
      {
        type: 'trueFalse',
        prompt: L('Copper, iron, aluminum and gold are conductors; plastic, wood, rubber and glass are insulators.', 'مس، آهن، آلومینیوم و طلا رسانا هستند؛ پلاستیک، چوب، لاستیک و شیشه عایق.'),
        answer: true,
        explanation: L('Perfectly memorized, my material expert! Metals pass electricity easily, and those five safety-guard materials block it!', 'عالی حفظ شد، متخصص مواد من! فلزها برق را راحت رد می‌کنند و آن پنج نگهبانِ ایمنی جلویش را می‌گیرند!'),
      },
    ],
    rewardBadge: L('The Material & Safety Spotter Medal', 'مدال افتخارِ «شناسگر مواد و ایمنی»'),
    unlockLessonIds: ['l0-5'],
  },

  // ------------------------------------------------------------- 7. voltage
  // User-written content: 4 robot-narrated picture pages around the
  // «ولتاژ = هل‌دهندهٔ الکترون‌ها» water-pressure analogy (see components/
  // lesson/story-scenes.tsx), then the voltage-explorer quiz and the
  // «استاد ولتاژ و فشار برق» medal.
  {
    id: 'l0-7',
    levelId: 'level0',
    title: L('Voltage (the push of electricity)', 'ولتاژ (فشار و انرژی برق)'),
    emoji: '⚡',
    difficulty: 1,
    minutes: 7,
    objectives: [
      L('Say what pushes the electrons forward in the wire: the voltage', 'بگو چه چیزی الکترون‌ها رو توی سیم به جلو هول میده: ولتاژ'),
      L('Tell the roof water-tank story: higher tank = stronger pressure', 'داستان منبع آبِ پشت‌بام رو تعریف کن: منبعِ بالاتر یعنی فشارِ بیشتر'),
      L('Read the volt number on batteries: 1.5 V is gentle, 9 V is strong', 'عدد ولت روی باتری‌ها رو بخون: ۱.۵ ولت نرم و آروم، ۹ ولت پرقدرت'),
      L('Say why we only experiment with safe battery voltages, never the 220 V wall socket', 'بگو چرا فقط با ولتاژهای امنِ باتری آزمایش می‌کنیم و هرگز سراغ پریز ۲۲۰ ولت نمی‌ریم'),
    ],
    screens: [
      {
        // page 1 — the big pusher of the electrons
        type: 'explain',
        speaker: 'robot',
        title: L('The big pusher of the electrons! 🌊⚡', 'هل‌دهندهٔ بزرگِ الکترون‌ها! 🌊⚡'),
        body: L(
          'Hello to my energetic explorers!\n\nHave you ever wondered why the electrons start running in the wire? What shoves them forward?\n\nThe name of this pushing force is «voltage» or «electric pressure»!\n\nVoltage is like a kind and strong hero standing behind the electrons, giving them energy and saying: «Come on kids, run forward with power!» The bigger the voltage, the harder the electrons get pushed forward!',
          'سلام به کاوشگرهای پرانرژی من!\n\nتا حالا فکر کردید چرا الکترون‌ها توی سیم شروع به دویدن می‌کنند؟ چه چیزی اون‌ها رو به جلو هول میده؟\n\nاسم این نیروی هول‌دهنده «ولتاژ» یا «فشار برق» است!\n\nولتاژ مثل یک قهرمان مهربون و قوی پشت سر الکترون‌هاست که بهشون انرژی میده و می‌گه: «یالا بچه‌ها، با قدرت به جلو بدوید!» هرچی ولتاژ بیشتر باشه، الکترون‌ها با فشار و قدرت بیشتری به جلو هول داده می‌شن!',
        ),
        scene: { kind: 'voltage-hero', props: { image: '/images/lessons/l0-7/1-voltage-hero.png' } },
      },
      {
        // page 2 — the secret of the water tank and the electric pressure
        type: 'explain',
        speaker: 'robot',
        title: L('The secret of the water tank and the electric pressure! 🚰🏰', 'راز منبع آب و فشار برق! 🚰🏰'),
        body: L(
          'To learn voltage really well, let\u2019s think about a water tank on the roof!\n\nWhen we put the water tank very high, the water rushes out of the tap with a lot of pressure.\nBut if the water tank is low, the water comes out very calm and low-pressure.\n\nVoltage is exactly like that water pressure! A battery is like a high-pressure water tank that pushes the electrons into the wire with force, so the lamps turn on stronger and shinier!',
          'برای این‌که ولتاژ رو خیلی عالی یاد بگیریم، بیاین به منبع آب روی پشت‌بام فکر کنیم!\n\nوقتی منبع آب رو خیلی بالا می‌گذاریم، آب با فشار زیادی از شیر بیرون می‌ریزه.\nاما اگر منبع آب پایین باشه، آب خیلی آروم و کم‌فشار میاد.\n\nولتاژ هم دقیقاً همین فشار آب است! باتری مثل یک منبع آبِ پرفشاره که الکترون‌ها رو با فشار وارد سیم می‌کنه تا چراغ‌ها محکم‌تر و درخشان‌تر روشن بشن!',
        ),
        scene: { kind: 'water-pressure', props: { image: '/images/lessons/l0-7/2-water-battery.png' } },
      },
      {
        // page 3 — the 1.5-volt battery vs the 9-volt battery
        type: 'explain',
        speaker: 'robot',
        title: L('The 1.5-volt battery vs the 9-volt battery! 🔋⚡', 'باتری ۱.۵ ولت در برابر باتری ۹ ولت! 🔋⚡'),
        body: L(
          'We measure voltage with the unit «volt» (V). On every battery a number is written that shows how strong its push is:\n\n🔋 The AA battery (1.5 volts): a soft, gentle push for small jobs like watches and remotes!\n📦 The block battery (9 volts): a strong, powerful push for turning on sirens and bigger circuits!\n\nThe bigger the volt number on a battery, the stronger its electric pressure!',
          'ما ولتاژ رو با یکای «ولت» (V) اندازه‌گیری می‌کنیم. روی تمام باتری‌ها یک عدد نوشته شده که قدرت هول دادن اون‌ها رو نشون میده:\n\n🔋 باتری قلمی (۱.۵ ولت): یک هول دادنِ نرم و آروم برای کارهای کوچک مثل ساعت و کنترل!\n📦 باتری کتابی (۹ ولت): یک هول دادنِ پرقدرت و قوی برای روشن کردن آژیرها و مدارهای بزرگتر!\n\nهرچی عدد ولت روی باتری بیشتر باشه، یعنی قدرت و فشار برقش بیشتره!',
        ),
        scene: { kind: 'battery-duo', props: { image: '/images/lessons/l0-7/3-battery-duo.png' } },
      },
      {
        // page 4 — the right voltage: a bright and happy light (+ the 220 V safety rule)
        type: 'explain',
        speaker: 'robot',
        title: L('The right voltage; a bright and happy light! 💡✨', 'ولتاژ مناسب؛ نورِ درخشان و شاد! 💡✨'),
        body: L(
          'Now what happens if the voltage gets too low or too high?\n\n😴 Very low voltage: the electrons move slowly and the lamp turns very dim and sleepy.\n😄 Just the right voltage: the electrons move at a good speed and the lamp turns completely bright and happy!\n\n⚠️ Safety reminder: the wall socket is 220 volts! That is like a very, very dangerous ocean wave — touching it is dangerous. We only use the low, safe battery voltages (1.5–9 V)!',
          'حالا چه اتفاقی می‌افته اگر ولتاژ کم یا زیاد بشه؟\n\n😴 ولتاژ خیلی کم: الکترون‌ها آروم می‌رن و چراغ خیلی کم‌نور و بی‌حال میشه.\n😄 ولتاژ مناسب: الکترون‌ها با سرعت خوب می‌رن و چراغ کاملاً پرنور و شاد میشه!\n\n⚠️ یادآوری ایمنی: ولتاژ پریز دیوار ۲۲۰ ولته! این ولتاژ مثل یک موجِ اقیانوسیِ خیلی خیلی دقیقه و برای همین دست زدن بهش خطرناکه. ما در آزمایش‌هامون فقط از ولتاژهای کم و امنِ باتری‌ها (۱.۵ تا ۹ ولت) استفاده می‌کنیم!',
        ),
        scene: { kind: 'happy-led', props: { image: '/images/lessons/l0-7/4-happy-led.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the power boost! 🚀', 'تمرین ساختنی: تقویت قدرت! 🚀'),
        body: L('The circuit is complete, but the lamp is weak and sleepy… the 1.5 V battery pushes too softly! Tap the battery, open its properties and switch it to the strong 9 V push — watch the light jump awake!', 'مدار کامل است ولی چراغ بی‌حال و کم‌نور است… باتری ۱.۵ ولت خیلی نرم هول می‌دهد! روی باتری بزن، ویژگی‌هایش را باز کن و به هولِ قویِ ۹ ولت تغییرش بده — ببین نور چطور بیدار می‌شود!'),
        task: {
          brief: L('Change the battery from 1.5 V to 9 V so the LED shines bright.', 'باتری را از ۱.۵ ولت به ۹ ولت تغییر بده تا LED پرنور شود.'),
          goal: g.and(g.ledOn('led1'), g.voltageAcross('b1', 8, 10), g.ledCurrentSafe('led1')),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 1.5 }, x: 150, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 390, y: 200 }),
              c('led', 'led1', { x: 610, y: 200 }),
            ],
            [
              w('w1', 'b1', 'pos', 'r1', 'a'),
              w('w2', 'r1', 'b', 'led1', 'anode'),
              w('w3', 'led1', 'cathode', 'b1', 'neg'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Tap the battery once — its property buttons appear under the canvas.', 'یک بار روی باتری بزن — دکمه‌های ویژگی‌اش زیر صفحه ظاهر می‌شوند.'),
            L('Choose the 9 V button — the strongest push of the family!', 'دکمهٔ ۹ ولت را انتخاب کن — قوی‌ترین هولِ خانواده!'),
          ],
        },
      },
      {
        // page 5 — the voltage-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The voltage-explorer quiz! 🏆🎮', 'آزمون کاوشگر ولتاژ! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my champion explorers! Now it is time to show how well you learned the secret of voltage and electric pressure!',
          'آفرین به کاوشگرهای قهرمان من! حالا وقتشه نشون بدید چقدر خوب راز ولتاژ و فشار برق رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-7/5-voltage-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'What is the main job of «voltage» in an electric circuit?',
          'وظیفهٔ اصلی «ولتاژ» در مدار الکتریکی چیست؟',
        ),
        options: [
          L('🌊 It pushes the electrons forward with pressure and power.', '🌊 الکترون‌ها رو با فشار و قدرت به جلو هول میده.'),
          L('🛑 It stops the electrons from running.', '🛑 جلوی دویدن الکترون‌ها رو می‌گیره.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my champion explorer! 🌊 Voltage is the kind, strong pusher — it gives the electrons energy and shoves them forward so the lamps can shine. The «Master of Voltage & Electric Pressure» medal is now yours! 🏅',
          'آفرین به کاوشگر قهرمان من! 🌊 ولتاژ همون هل‌دهندهٔ مهربون و قویه که به الکترون‌ها انرژی میده و اون‌ها رو به جلو هول میده تا چراغ‌ها روشن بشن. حالا مدال «استاد ولتاژ و فشار برق» مال توست! 🏅',
        ),
      },

      {
        type: 'mcq',
        prompt: L('Which battery is the stronger pusher?', 'کدام باتری هول‌دهندهٔ قوی‌تری دارد؟'),
        options: [
          L('📦 The 9-volt block battery', '📦 باتری کتابی ۹ ولت'),
          L('🔋 The 1.5-volt pencil battery', '🔋 باتری قلمی ۱.۵ ولت'),
          L('🤝 Both push exactly the same', '🤝 هر دو دقیقاً یک‌قدر هول می‌دهند'),
        ],
        answer: 0,
        explanation: L('Right! The bigger the volt number, the stronger the electric pressure — 9 volts pushes the electrons much harder than 1.5 volts!', 'درست است! هرچه عدد ولت بیشتر باشد، فشار برق بیشتر است — ۹ ولت، الکترون‌ها را خیلی محکم‌تر از ۱.۵ ولت هول می‌دهد!'),
      },
      {
        type: 'trueFalse',
        prompt: L('Like a roof water tank: a higher tank means stronger water pressure — and a higher voltage means a stronger push.', 'مثل منبع آب پشت‌بام: منبع بالاتر یعنی فشار آب بیشتر — و ولتاژ بالاتر یعنی هول دادنِ قوی‌تر.'),
        answer: true,
        explanation: L('Exactly the engineer way of thinking! Voltage is the electric pressure, just like the height of the water tank!', 'دقیقاً مثل روش فکر کردن مهندس‌ها! ولتاژ همان فشار برق است، درست مثل ارتفاع منبع آب!'),
      },
      {
        type: 'mcq',
        prompt: L('The wall socket has a very strong voltage. What do we do with it?', 'پریز دیوار ولتاژ خیلی قوی دارد. با آن چه می‌کنیم؟'),
        options: [
          L('⛔ We never touch it — 220 volts is only for grown-ups!', '⛔ هیچ‌وقت دست نمی‌زنیم — ۲۲۰ ولت فقط مخصوص بزرگ‌ترهاست!'),
          L('✋ We touch it just a little', '✋ فقط کمی دست می‌زنیم'),
          L('🔌 We plug wires into it for our experiments', '🔌 برای آزمایش‌هایمان سیم داخلش می‌کنیم'),
        ],
        answer: 0,
        explanation: L('Safety first, champion! 220 volts is like a huge ocean wave — we only ever experiment with the safe little battery voltages (1.5 to 9 volts)!', 'ایمنی اول، قهرمان! ۲۲۰ ولت مثل موج عظیم اقیانوس است — ما فقط با ولتاژهای کم و امنِ باتری (۱.۵ تا ۹ ولت) آزمایش می‌کنیم!'),
      },
    ],
    rewardBadge: L('The Voltage & Electric Pressure Master Medal', 'مدال افتخارِ «استاد ولتاژ و فشار برق»'),
    unlockLessonIds: ['l0-6'],
  },

  // ------------------------------------------------------------- 8. current
  // User-written content: 4 robot-narrated picture pages around the
  // «جریان = تعداد و شدت دونده‌ها» race/river analogy (see components/lesson/
  // story-scenes.tsx), then the current-explorer quiz and the
  // «کارآگاه و شمارشگر جریان» medal.
  {
    id: 'l0-8',
    levelId: 'level0',
    title: L('Current (the number and strength of the running electrons)', 'جریان (شدت و تعداد الکترون‌های در حال دویدن)'),
    emoji: '🌊',
    difficulty: 1,
    minutes: 7,
    objectives: [
      L('Say what «current» means: the number and strength of the electrons running together in the wire', 'بگو «جریان» یعنی چه: تعداد و شدت الکترون‌هایی که با هم توی سیم می‌دوند'),
      L('Tell the river story: a tiny brook is a small current, a big rushing river is a big current', 'داستان رودخانه رو تعریف کن: جویبار کوچولو یعنی جریان کم، رودخانهٔ خروشان یعنی جریان زیاد'),
      L('Name the unit for counting the runners: the ampere (A), and milliamps (mA) for tiny LED currents', 'یکای شمارش دونده‌ها رو بگو: آمپر (A) و برای جریان‌های کوچولوی LED، میلی‌آمپر (mA)'),
      L('Explain how voltage and current work as a team: a bigger push sets more runners off', 'تیم ولتاژ و جریان رو توضیح بده: هولِ بیشتر، دونده‌های بیشتری رو راه می‌ندازه'),
    ],
    screens: [
      {
        // page 1 — the running race and the crowded electron train
        type: 'explain',
        speaker: 'robot',
        title: L('The running race and the crowded electron train! 🏃‍♂️🏃‍♀️⚡', 'مسابقهٔ دو و قطارِ شلوغِ الکترون‌ها! 🏃‍♂️🏃‍♀️⚡'),
        body: L(
          'Hello to my energetic explorers!\n\nRemember in the last lesson we said voltage is like a strong hero shoving the electrons forward?\n\nNow we say «current» for the number and strength of the electrons running together in the wire!\n\nImagine the PE bell has rung and the kids are running one behind another on the track. The more kids cross the finish line in one second, the BIGGER current we have!',
          'سلام به کاوشگرهای پرانرژی من!\n\nیادته در درس قبل گفتیم ولتاژ مثل یک قهرمان قویه که الکترون‌ها رو به جلو هول میده؟\n\nحالا به تعداد و شدت الکترون‌هایی که دارند با هم توی سیم می‌دوند می‌گیم «جریان»!\n\nتصور کنید زنگ ورزش خورده و بچه‌ها پشت سر هم دارند روی خط دوومیدانی می‌دوند. هرچی تعداد بچه‌هایی که در یک ثانیه از خط پایان رد می‌شن بیشتر باشه، یعنی جریان بیشتری داریم!',
        ),
        scene: { kind: 'race-finish', props: { image: '/images/lessons/l0-8/1-race-finish.png' } },
      },
      {
        // page 2 — the secret of the rushing river and the calm brook
        type: 'explain',
        speaker: 'robot',
        title: L('The secret of the rushing river and the calm brook! 🌊💧', 'راز رودخانهٔ خروشان و جویبارِ آرام! 🌊💧'),
        body: L(
          'To understand current like a real engineer, let\u2019s look at water:\n\n💧 A tiny brook: the water moves very little and very calmly (a small current).\n🌊 A big rushing river: a huge amount of water passes with great strength (a big current)!\n\nIn an electric circuit too, when we turn on powerful devices like a hair dryer or big motors, very many electrons move together — the electric current is very big!',
          'برای این‌که جریان رو مثل یک مهندس واقعی درک کنیم، بیاین به آب نگاه کنیم:\n\n💧 جویبار کوچک: آب خیلی کم و آروم حرکت می‌کنه (جریان کم).\n🌊 رودخانهٔ بزرگ و خروشان: حجم خیلی زیادی از آب با شدت زیاد رد میشه (جریان زیاد)!\n\nدر مدار الکتریکی هم وقتی وسایل پرقدرت مثل سشوار یا موتورهای بزرگ رو روشن می‌کنیم، الکترون‌های خیلی زیادی با هم حرکت می‌کنند، یعنی جریان برق خیلی زیاده!',
        ),
        scene: { kind: 'river-brook', props: { image: '/images/lessons/l0-8/2-river-brook.png' } },
      },
      {
        // page 3 — the ampere: the electron-counting stopwatch
        type: 'explain',
        speaker: 'robot',
        title: L('The ampere; the electron-counting stopwatch! ⏱️🔢', 'آمپر؛ ساعتِ شمارشِ الکترون‌ها! ⏱️🔢'),
        body: L(
          'How can we measure the electric current? With the unit «ampere» (Ampere or A)!\n\nImagine a clever detective with a watch in his hand standing beside the wire. He counts how many billion electrons pass in front of him in ONE second!\n\n🐜 Milliampere (mA): for very small currents, like a sweet little LED.\n🐘 Ampere (A): for big, powerful currents like cars and large devices!',
          'ما چطور می‌تونیم جریان برق رو اندازه‌گیری کنیم؟ با یکای «آمپر» (Ampere یا A)!\n\nتصور کنید یک کارآگاه هوشمند با یک ساعت توی دستش کنار سیم ایستاده. اون می‌شمره که در یک ثانیه چند میلیارد الکترون از جلوش رد می‌شن!\n\n🐜 میلی‌آمپر (mA): برای جریان‌های خیلی کوچک مثل یک LED نازنین.\n🐘 آمپر (A): برای جریان‌های بزرگ و پرقدرت مثل ماشین‌ها و وسایل بزرگ!',
        ),
        scene: { kind: 'ampere-detective', props: { image: '/images/lessons/l0-8/3-ampere-detective.png' } },
      },
      {
        // page 4 — the amazing team: voltage and current
        type: 'explain',
        speaker: 'robot',
        title: L('The amazing team; voltage and current! 🤝⚡', 'تیم شگفت‌انگیز؛ ولتاژ و جریان! 🤝⚡'),
        body: L(
          'Now what is the link between voltage and current? They are two close friends who always work together:\n\n🦸‍♂️ Voltage: the pusher (the pressure of electricity).\n🏃‍♂️ Current: the number of runners (the strength of electricity).\n\nWhen we turn the voltage (the push) up, the electrons set off faster and in bigger numbers, so the current grows too! Like pressing the end of a water hose so the water bursts out harder!',
          'حالا ارتباط بین ولتاژ و جریان چیه؟ اون‌ها دو تا دوست صمیمی هستند که همیشه با هم کار می‌کنند:\n\n🦸‍♂️ ولتاژ: هل‌دهنده است (فشار برق).\n🏃‍♂️ جریان: تعداد دونده‌هاست (شدت برق).\n\nوقتی ولتاژ (هول دادن) رو بیشتر می‌کنیم، الکترون‌ها با سرعت و تعداد بیشتری راه میفتند و در نتیجه جریان هم زیاد میشه! مثل وقتی که انتهای شیلنگ آب رو فشار میدی تا آب با شدت بیشتری بیرون بریزه!',
        ),
        scene: { kind: 'voltage-current-team', props: { image: '/images/lessons/l0-8/4-voltage-current-team.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: count the runners! 🔢', 'تمرین ساختنی: شمارش دونده‌ها! 🔢'),
        body: L('The circuit is glowing — but how many electron runners are passing? The counting machine (the ammeter) is on the bench, still unplugged! Insert it into the road and read the number of the runners!', 'مدار دارد می‌درخشد — ولی چند تا دوندهٔ الکترون دارند رد می‌شوند؟ ماشینِ شمارش (آمپرسنج) روی میز است ولی هنوز وصل نیست! آن را داخل جاده بگذار و عدد دونده‌ها را بخوان!'),
        task: {
          brief: L('Insert the ammeter into the loop and keep the LED shining.', 'آمپرسنج را داخل حلقه بگذار و LED را روشن نگه دار.'),
          goal: g.and(g.present('ammeter'), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 200 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 340, y: 200 }),
              c('ammeter', 'am1', { x: 520, y: 200 }),
              c('led', 'led1', { x: 690, y: 200 }),
            ],
            [
              w('w1', 'b1', 'pos', 'r1', 'a'),
              w('w2', 'led1', 'cathode', 'b1', 'neg'),
            ],
          ),
          allowed: ['battery', 'resistor', 'ammeter', 'led'],
          hints: [
            L('The gap is between the resistor and the LED: wire resistor → ammeter → long leg of the LED.', 'شکاف بین مقاومت و LED است: سیم بکش مقاومت → آمپرسنج → پایهٔ بلند LED.'),
            L('The ammeter counts every runner that passes through it — just like the detective with the stopwatch!', 'آمپرسنج هر دونده‌ای که از داخلش رد می‌شود را می‌شمارد — درست مثل کارآگاه با کرنومترش!'),
          ],
        },
      },
      {
        // page 5 — the current-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The current-explorer quiz! 🏆🎮', 'آزمون کاوشگر جریان! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the secret of the electric current!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز جریان برق رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-8/5-current-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'What does «electric current» mean in a circuit?',
          'معنی «جریان برق» در مدار چیست؟',
        ),
        options: [
          L('🏃‍♂️ The number and strength of the electrons moving in the wire.', '🏃‍♂️ تعداد و شدت حرکت الکترون‌ها در سیم.'),
          L('🛑 All the lamps turning completely off.', '🛑 خاموش شدن کامل چراغ‌ها.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! 🏃‍♂️ Current is the number and strength of the electrons running together in the wire — the «Current Detective & Counter» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! 🏃‍♂️ جریان یعنی تعداد و شدت حرکت الکترون‌هایی که با هم توی سیم می‌دوند؛ حالا مدال «کارآگاه و شمارشگر جریان» مال توست! 🏅',
        ),
      },

      {
        type: 'mcq',
        prompt: L('With which unit do we measure the electric current?', 'جریان برق را با چه یکایی می‌سنجیم؟'),
        options: [
          L('⏱️ The ampere (A)', '⏱️ آمپر (A)'),
          L('🌊 The volt (V)', '🌊 ولت (V)'),
          L('🚧 The ohm (Ω)', '🚧 اُهم (Ω)'),
        ],
        answer: 0,
        explanation: L('Correct! The ampere counts how many billions of electron runners pass in one second. Volt is the push, and ohm belongs to the resistor!', 'درست است! آمپر می‌شمارد که در یک ثانیه چند میلیارد دوندهٔ الکترون رد می‌شوند. ولت فشار است و اُهم مال مقاومت!'),
      },
      {
        type: 'trueFalse',
        prompt: L('A tiny calm brook is like a small current, and a big rushing river is like a big current.', 'جویبار کوچولوی آروم مثل جریان کم است و رودخانهٔ بزرگ خروشان مثل جریان زیاد.'),
        answer: true,
        explanation: L('Beautiful picture! Many electrons rushing together — that is a big current, exactly like the rushing river!', 'تصویر قشنگی بود! الکترون‌های زیاد که با هم هجوم می‌آورند — این یعنی جریان زیاد، درست مثل رودخانهٔ خروشان!'),
      },
      {
        type: 'mcq',
        prompt: L('If we turn the voltage (the push) up, what happens to the current (the runners)?', 'اگر ولتاژ (هول دادن) را بیشتر کنیم، با جریان (دونده‌ها) چه می‌شود؟'),
        options: [
          L('🏃‍♂️ More runners set off — the current grows!', '🏃‍♂️ دونده‌های بیشتری راه می‌افتند — جریان زیاد می‌شود!'),
          L('🛑 The runners all stop', '🛑 دونده‌ها همه می‌ایستند'),
          L('🙅 Nothing changes at all', '🙅 هیچ تغییری نمی‌کند'),
        ],
        answer: 0,
        explanation: L('Yes — they are a team! A bigger push sends more runners off at once, so the current grows. Voltage and current always work together!', 'آره — آن‌ها یک تیم‌اند! هولِ بیشتر، دونده‌های بیشتری را با هم راه می‌اندازد و جریان زیاد می‌شود. ولتاژ و جریان همیشه با هم کار می‌کنند!'),
      },
    ],
    rewardBadge: L('The Current Detective & Counter Medal', 'مدال افتخارِ «کارآگاه و شمارشگر جریان»'),
    unlockLessonIds: ['l0-7'],
  },

  // ---------------------------------------------------------- 9. resistance
  // User-written content: 4 robot-narrated picture pages around the
  // «مقاومت = جادهٔ تنگ و سرعت‌گیر» analogy (see components/lesson/
  // story-scenes.tsx), then the resistance-explorer quiz and the
  // «استاد و ترمزشناس مدار» medal.
  {
    id: 'l0-9',
    levelId: 'level0',
    title: L('Resistance (the narrow road)', 'مقاومت (جاده تنگ و باریک)'),
    emoji: '🚧',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Say what the resistor does: a kind narrow road that slows the electron runners', 'بگو مقاومت چیکار می‌کنه: یک جادهٔ تنگ و مهربون که دونده‌های الکترونی رو آروم می‌کنه'),
      L('Tell the hose story: a pinched pipe means less water, a resistor means less current', 'داستان شیلنگ رو تعریف کن: لولهٔ باریک یعنی آب کمتر، مقاومت یعنی جریان کمتر'),
      L('Say why the LED needs its bodyguard: a big current would burn it', 'بگو چرا LED به بادیگارد نیاز داره: جریانِ خیلی زیاد می‌سوزونتش'),
      L('Name the unit of resistance: the ohm (Ω), written as colorful bands on the body', 'یکای مقاومت رو بگو: اُهم (Ω) که با خط‌های رنگی روی بدنه نوشته می‌شه'),
    ],
    screens: [
      {
        // page 1 — the kind guard and the electrons' brake
        type: 'explain',
        speaker: 'robot',
        title: L('The kind guard and the electrons\u2019 brake! 🛑🚴‍♂️', 'نگهبانِ مهربان و ترمزِ الکترون‌ها! 🛑🚴‍♂️'),
        body: L(
          'Hello to my champion explorers!\n\nHave you seen how cars or bikes go super fast on a wide, smooth road? But when they reach a narrow road or a speed bump, they have to slow down?\n\nA part called the resistor is exactly like a kind narrow road and speed bump!\n\nWhen the electrons run too fast and too crowded, the resistor stops them and says: «Slow down kids! Go gently so you don\u2019t hurt the parts!»',
          'سلام به کاوشگرهای قهرمان من!\n\nتا حالا دیدید وقتی جاده خیلی پهن و صافه، ماشین‌ها یا دوچرخه‌ها خیلی تند می‌رن؟ اما وقتی به یک جادهٔ تنگ یا سرعت‌گیر می‌رسن، مجبور می‌شن آروم‌تر حرکت کنند؟\n\nقطعه‌ای به اسم مقاومت دقیقاً مثل یک جادهٔ تنگ و سرعت‌گیر مهربونه!\n\nوقتی الکترون‌ها خیلی تند و با تعداد زیاد بدوند، مقاومت جلوشون رو می‌گیره و می‌گه: «آروم‌تر بچه‌ها! یواش‌تر برید تا به قطعات آسیب نرسونید!»',
        ),
        scene: { kind: 'narrow-road', props: { image: '/images/lessons/l0-9/1-resistor-guard.png' } },
      },
      {
        // page 2 — the secret of the narrow pipe
        type: 'explain',
        speaker: 'robot',
        title: L('The secret of the narrow, tight pipe! 🚰🤏', 'رازِ لولهٔ تنگ و باریک! 🚰🤏'),
        body: L(
          'Let\u2019s look at water again!\n\nIf we have a very wide hose, lots of water rushes out. But if we press the middle of the hose a little with our hand, or put a narrow pipe in it, the water comes out much less and more controlled.\n\nThe resistor in an electric circuit is exactly that narrow pipe! It never lets too much current rush through at once, and it keeps an eye on everything.',
          'بیاین دوباره به آب نگاه کنیم!\n\nاگر یک شیلنگ خیلی پهن داشته باشیم، آب با حجم زیاد بیرون می‌ریزه. اما اگر وسط شیلنگ رو با دست کمی فشار بدیم یا یک لولهٔ باریک بگذاریم، آب خیلی کمتر و کنترل‌شده‌تر میاد.\n\nمقاومت توی مدار الکتریکی دقیقاً همین لولهٔ تنگه! اون اجازه نمیده جریان برقِ زیادی یک‌دفعه رد بشه و همه‌چیز رو زیر نظر داره.',
        ),
        scene: { kind: 'pinch-pipe', props: { image: '/images/lessons/l0-9/2-pipe-resistor.png' } },
      },
      {
        // page 3 — the LED's rescue hero
        type: 'explain',
        speaker: 'robot',
        title: L('The rescue hero of the little LED! 🦸‍♂️💡', 'فرشتهٔ نجاتِ LED کوچولو! 🦸‍♂️💡'),
        body: L(
          'Why do we need resistors in our circuits?\n\nBecause some parts, like the LED, are very delicate and sensitive! If a very big, fast electric current reaches the LED directly, it gets so hot that it burns out and goes dark!\n\nBut when we put a resistor before the LED, like a kind bodyguard it blocks the big current so the LED stays on happily with its beautiful light.',
          'چرا ما توی مدارها به مقاومت نیاز داریم؟\n\nچون بعضی قطعات مثل LED خیلی ظریف و حساس هستند! اگر جریان برقِ خیلی زیاد و پرسرعت مستقیم به LED برسه، اون‌قدر داغ میشه که می‌سوزه و خواموش میشه!\n\nاما وقتی یک مقاومت قبل از LED می‌گذاریم، مثل یک بادیگارد مهربون جلوی جریان زیاد رو می‌گیره تا LED با خیال راحت و نور قشنگش روشن بمونه.',
        ),
        scene: { kind: 'led-bodyguard', props: { image: '/images/lessons/l0-9/3-led-bodyguard.png' } },
      },
      {
        // page 4 — the colorful secret code lines
        type: 'explain',
        speaker: 'robot',
        title: L('The colorful lines; the secret codes! 🎨🔍', 'خط‌های رنگارنگ؛ کدهای رازآلود! 🎨🔍'),
        body: L(
          'If you look at a real resistor, you will see a few pretty colored lines on its body (like red, gold, brown)!\n\nThese colored lines are the resistor\u2019s secret language — they tell the engineers how strong this resistor is and how much it can hold the electricity back!\n\nThe unit for measuring resistance is called the «ohm» (Ohm or Ω).',
          'اگر به یک مقاومت واقعی نگاه کنید، روی بدنهٔ اون چند تا خط رنگیِ قشنگ (مثل قرمز، طلایی، قهوه‌ای) می‌بینید!\n\nاین خط‌های رنگی، زبان رازآلودِ مقاومت هستند که به مهندس‌ها می‌گن این مقاومت چقدر قویه و چقدر می‌تونه جلوی برق رو بگیره!\n\nیکای اندازه‌گیری مقاومت هم «اُهم» (Ohm یا Ω) نام داره.',
        ),
        scene: { kind: 'color-bands', props: { image: '/images/lessons/l0-9/4-color-bands.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: hire the bodyguard! 🦸‍♂️', 'تمرین ساختنی: استخدام بادیگارد! 🦸‍♂️'),
        body: L('Emergency! The LED is connected straight to the 9 V battery with no guard — the poor thing is getting a flood of electrons and will burn! Take the resistor and stand it between the battery and the LED, like a true bodyguard!', 'اضطراری! LED مستقیم به باتری ۹ ولتی وصل شده و هیچ محافظی ندارد — بیچاره سیلِ الکترون‌ها را می‌گیرد و می‌سوزد! مقاومت را بردار و مثل یک بادیگارد واقعی، بین باتری و LED بگذارش!'),
        task: {
          brief: L('Protect the LED: add the resistor so the current becomes calm and safe.', 'از LED محافظت کن: مقاومت را اضافه کن تا جریان آروم و امن شود.'),
          goal: g.and(g.present('resistor'), g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 420, y: 130 }),
              c('led', 'led1', { x: 650, y: 210 }),
            ],
            [
              w('w1', 'b1', 'pos', 'led1', 'anode'),
              w('w2', 'led1', 'cathode', 'b1', 'neg'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('First remove the direct wire from + of the battery to the LED — the flood must stop!', 'اول سیمِ مستقیم از + باتری به LED را بردار — سیل باید بایستد!'),
            L('Now put the guard in the road: battery → resistor → long leg of the LED.', 'حالا نگهبان را سر جاده بگذار: باتری → مقاومت → پایهٔ بلند LED.'),
          ],
        },
      },
      {
        // page 5 — the resistance-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The resistance-explorer quiz! 🏆🎮', 'آزمون کاوشگر مقاومت! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the secret of the resistor!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز مقاومت رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-9/5-resistance-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'What is the main job of the «resistor» in an electric circuit?',
          'وظیفهٔ اصلی «مقاومت» در مدار الکتریکی چیست؟',
        ),
        options: [
          L('🛑 Controlling and reducing the current so the parts don\u2019t burn.', '🛑 کنترل و کم کردن جریان برق تا قطعات نسوزند.'),
          L('🔌 Turning the battery completely off.', '🔌 خاموش کردن کامل باتری.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! 🛑 The resistor is the kind speed bump — it controls and calms the current so delicate parts like the LED never burn. The «Circuit Brake Master» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! 🛑 مقاومت همون سرعت‌گیرِ مهربونه که جریان رو کنترل و آروم می‌کنه تا قطعه‌های ظریفی مثل LED هیچ‌وقت نسوزن؛ حالا مدال «استاد و ترمزشناس مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'identify',
        prompt: L('Who is this kind guard with the colorful secret-code lines on its body?', 'این نگهبان مهربان با خط‌های رنگیِ کد مخفی روی بدنه‌اش کیست؟'),
        partType: 'resistor',
        options: [
          L('The resistor', 'مقاومت'),
          L('The LED lamp', 'لامپ LED'),
          L('The battery', 'باتری'),
        ],
        answer: 0,
        explanation: L('Well spotted! This is the resistor: the kind speed bump that calms the electrons down, and its colored bands tell how strong it is!', 'چه چشم‌هایی داری! این مقاومت است: سرعت‌گیر مهربانی که الکترون‌ها را آروم می‌کند و خط‌های رنگی‌اش می‌گویند چقدر قوی است!'),
      },
      {
        type: 'trueFalse',
        prompt: L('The unit of resistance is the ohm (Ω), written with those pretty colored bands on the body.', 'یکای مقاومت اُهم (Ω) است که با همان خط‌های رنگی قشنگ روی بدنه نوشته می‌شود.'),
        answer: true,
        explanation: L('Exactly! Engineers read the color bands like a secret code and know right away how many ohms each resistor has!', 'دقیقاً! مهندس‌ها خط‌های رنگی را مثل یک کد مخفی می‌خوانند و فوراً می‌فهمند هر مقاومت چند اُهم است!'),
      },
      {
        type: 'mcq',
        prompt: L('What happens if a very big, fast current rushes into the delicate LED with no guard?', 'اگر جریانِ خیلی زیاد و پرسرعت بدون محافظ به LED ظریف برسد چه می‌شود؟'),
        options: [
          L('🔥 It gets so hot that it burns out and goes dark!', '🔥 آن‌قدر داغ می‌شود که می‌سوزد و خاموش می‌شود!'),
          L('✨ It shines twice as beautifully', '✨ دو برابر قشنگ‌تر می‌درخشد'),
          L('🤖 It turns into a robot', '🤖 تبدیل به ربات می‌شود'),
        ],
        answer: 0,
        explanation: L('That is why the LED always needs its bodyguard! The resistor stands in front and says: come in slowly, so my delicate friend stays safe!', 'برای همین LED همیشه به بادیگارد نیاز دارد! مقاومت جلویش می‌ایستد و می‌گوید: آروم بیایید تا دوست ظریف‌مان سالم بماند!'),
      },
    ],
    rewardBadge: L('The Circuit Brake Master Medal', 'مدال افتخارِ «استاد و ترمزشناس مدار»'),
    unlockLessonIds: ['l0-8'],
  },

  // ------------------------------------------------- 10. battery
  {
    id: 'l0-10',
    levelId: 'level0',
    title: L('What is a battery? (The energy station)', 'باتری چیست؟ (ایستگاه انرژی)'),
    emoji: '🔋',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Say what a battery is: a small, travel-sized energy station — a full snack backpack for the electrons', 'بگو باتری چیه: یک ایستگاهِ انرژیِ کوچک و سفری — یک کوله‌پشتیِ پر از خوراکی برای الکترون‌ها'),
      L('Tell the battery\u2019s secret: its special chemicals turn the stored energy into electric current', 'راز باتری رو تعریف کن: مواد شیمیاییِ مخصوصِ درونش، انرژیِ ذخیره‌شده رو به جریان برق تبدیل می‌کنن'),
      L('Know the two terminals: the electrons start their trip from the negative (flat) end and come back to the positive (bumpy) end', 'دو قطب باتری رو بشناس: الکترون‌ها سفرشون رو از قطب منفی (تهِ صاف) شروع می‌کنن و به قطب مثبت (سرِ قلمبه) برمی‌گردن'),
      L('Name the battery family: pencil, coin, book and rechargeable — and never open their shell', 'اعضای خانوادهٔ باتری رو نام ببر: قلمی، سکه‌ای، کتابی و قابل شارژ — و هیچ‌وقت پوسته‌شون رو باز نکن'),
    ],
    screens: [
      {
        // page 1 — the little house of energy
        type: 'explain',
        speaker: 'robot',
        title: L('The little house of energy! 🔋🎒', 'خانهٔ کوچولوی انرژی! 🔋🎒'),
        body: L(
          'Hello to my clever explorers!\n\nHave you ever wondered why toys, flashlights or the TV remote work without being plugged into the wall socket?\n\nBecause they carry a small, travel-sized energy station with them — we call it a battery!\n\nA battery is like a backpack full of power snacks for the electrons! When we connect it to a circuit, the tired electrons grab its energy backpack and dash through the wires to wake up the lamps and motors!',
          'سلام به کاوشگرهای باهوش من!\n\nتا حالا فکر کردید چرا اسباب‌بازی‌ها، چراغ‌قوه‌ها یا کنترل تلویزیون بدون این‌که به پریز برق روی دیوار وصل باشند کار می‌کنند؟\n\nچون اون‌ها یک ایستگاهِ انرژیِ کوچک و سفری همراه خودشون دارند که بهش می‌گیم «باتری»!\n\nباتری مثل یک کوله‌پشتی پر از خوراکی‌های مقوی برای الکترون‌هاست! وقتی باتری رو به مدار وصل می‌کنیم، الکترون‌های خسته می‌آیند، کوله‌پشتی پر از انرژی‌شون رو برمی‌دارند و با قدرت توی سیم‌ها می‌دوند تا چراغ‌ها و موتورها رو بیدار کنند!',
        ),
        scene: { kind: 'battery-backpack', props: { image: '/images/lessons/l0-10/1-battery-backpack.png' } },
      },
      {
        // page 2 — the magical factory inside the battery
        type: 'explain',
        speaker: 'robot',
        title: L('The magical factory inside the battery! 🧪✨', 'کارخانهٔ جادوییِ داخل باتری! 🧪✨'),
        body: L(
          'Now, what secret do you think is hiding inside this little station?\n\nIf we look inside a battery, we do not see ready-made electricity! There are special chemical materials in there.\n\nWhen these chemicals get together, they play a fun game: they turn chemical energy into electrical energy — electricity!\n\nSo the battery is like a magical piggy bank: it stores the energy, and whenever we complete the circuit, it sets the energy free as electric current!',
          'حالا فکر می‌کنید داخل این ایستگاه کوچولو چه رازی قایم شده؟\n\nاگر داخل باتری رو نگاه کنیم، برقِ آماده نمی‌بینیم! بلکه مواد شیمیایی مخصوصی اونجا هستند.\n\nاین مواد شیمیایی وقتی کنار هم قرار می‌گیرند، یک بازی جالب انجام می‌دند و انرژی شیمیایی رو به انرژی الکتریکی (برق) تبدیل می‌کنند!\n\nپس باتری مثل یک قلک جادوییه که انرژی رو ذخیره می‌کنه و هروقت مدار رو کامل کنیم، اون رو به صورت جریان برق آزاد می‌کنه!',
        ),
        scene: { kind: 'battery-factory', props: { image: '/images/lessons/l0-10/2-battery-factory.png' } },
      },
      {
        // page 3 — the start and finish stations: positive and negative
        type: 'explain',
        speaker: 'robot',
        title: L('The start and finish stations: positive and negative! 🏁🧭', 'ایستگاه شروع و پایان؛ مثبت و منفی! 🏁🧭'),
        body: L(
          'On every battery there are two very important signs that we must learn to know:\n\n1. ➕ Positive terminal (the positive end): the end of the battery with a small, plump bump on it!\n2. ➖ Negative terminal (the negative end): the end of the battery that is completely flat and wide!\n\nOur energetic electrons always start their trip from the negative terminal (−), dash through the wires, light up the lamp, and finally come back to the positive terminal (+) to get recharged!',
          'روی تمام باتری‌ها دو تا علامت خیلی مهم وجود داره که حتماً باید اون‌ها رو بشناسیم:\n\n1. ➕ قطب مثبت (پایانه مثبت): سرِ باتری که یک برآمدگی کوچک و قلمبه داره!\n2. ➖ قطب منفی (پایانه منفی): تهِ باتری که کاملاً صاف و پهنه!\n\nالکترون‌های پرانرژی ما همیشه سفرشون رو از قطب منفی (➖) شروع می‌دند، توی سیم‌ها می‌دوند، چراغ رو روشن می‌کنند و در نهایت برمی‌گردند به قطب مثبت (➕) تا دوباره شارژ بشند!',
        ),
        scene: { kind: 'battery-terminals', props: { image: '/images/lessons/l0-10/3-battery-terminals.png' } },
      },
      {
        // page 4 — the big battery family
        type: 'explain',
        speaker: 'robot',
        title: L('The big battery family! 🔋📦', 'خانوادهٔ بزرگ باتری‌ها! 🔋📦'),
        body: L(
          'Batteries are made in many different shapes and sizes:\n\n🔋 Pencil batteries (AA and AAA): for the TV remote and small toys.\n🔘 Coin batteries: for wristwatches and very thin devices!\n📦 Book batteries (9 volts): for stronger circuits and alarms.\n🔄 Rechargeable batteries: whenever their energy runs out, we can charge them up again!\n\n⚠️ Safety reminder: never open a battery\u2019s shell; as long as they are healthy, batteries are our kind friends!',
          'باتری‌ها در شکل‌ها و اندازه‌های مختلفی ساخته می‌شن:\n\n🔋 باتری قلمی و نیم‌قلمی (AA و AAA): برای کنترل تلویزیون و اسباب‌بازی‌های کوچک.\n🔘 باتری سکه‌ای: برای ساعت‌های مچی و وسایل خیلی باریک!\n📦 باتری کتابی (۹ ولت): برای مدارهای قدرتمندتر و آژیرها.\n🔄 باتری‌های قابل شارژ: که هروقت انرژی‌شون تموم شد، می‌تونیم دوباره اون‌ها رو شارژ کنیم!\n\n⚠️ یادآوری ایمنی: هیچ‌وقت پوستهٔ باتری رو باز نکنید؛ باتری‌ها تا زمانی که سالم باشند دوست‌های مهربان ما هستند!',
        ),
        scene: { kind: 'battery-family', props: { image: '/images/lessons/l0-10/4-battery-family.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the start and finish stations! 🏁', 'تمرین ساختنی: ایستگاه شروع و پایان! 🏁'),
        body: L('Every electron trip has a start and a finish: they leave from the flat, negative end of the battery and run all the way back to the bumpy, positive end. Build the trip with your own hands!', 'هر سفرِ الکترون یک شروع و یک پایان دارد: از تهِ صاف و منفیِ باتری راه می‌افتند و همهٔ مسیر را می‌دوند تا سرِ قلمبه و مثبت برگردند. سفر را با دست‌های خودت بساز!'),
        task: {
          brief: L('Wire the trip: from − of the battery, around through the parts, back to +.', 'سفر را سیم‌کشی کن: از − باتری، دور تا دورِ قطعات، برگشت به +.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 400, y: 220 }),
              c('led', 'led1', { x: 630, y: 220 }),
            ],
            [
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Remember the golden rule: start at − of the battery, pass through the resistor, enter the LED from the long leg.', 'قانون طلایی را یادت باشد: از − باتری شروع کن، از مقاومت رد شو، از پایهٔ بلند وارد LED شو.'),
            L('The trip ends at + of the battery — that is the finish station of every runner!', 'سفر در + باتری تمام می‌شود — ایستگاه پایانِ همهٔ دونده‌ها همان‌جاست!'),
          ],
        },
      },
      {
        // page 5 — the battery-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The battery-explorer quiz! 🏆🎮', 'آزمون کاوشگر باتری! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the secret of the energy stations!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز ایستگاه‌های انرژی رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-10/5-battery-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'Which side of the battery do the electrons start their circuit trip from?',
          'الکترون‌ها سفر خودشون در مدار رو از کدام سمت باتری شروع می‌کنند؟',
        ),
        options: [
          L('➖ The negative terminal (the flat end of the battery)', '➖ قطب منفی (تهِ صاف باتری)'),
          L('➕ The positive terminal (the bumpy top of the battery)', '➕ قطب مثبت (سرِ قلمبه باتری)'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! ➖ The energetic electrons always start their trip from the negative terminal (the flat end), dash through the wires and return to the positive terminal (the bumpy top) to recharge. The «Battery Master» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! ➖ الکترون‌های پرانرژی همیشه سفرشون رو از قطب منفی (تهِ صاف باتری) شروع می‌دن، توی سیم‌ها می‌دون و برای شارژِ دوباره به قطب مثبت (سرِ قلمبه) برمی‌گردن؛ حالا مدال «استاد باتری‌شناس» مال توست! 🏅',
        ),
      },

      {
        type: 'mcq',
        prompt: L('Which member of the battery family works inside a wristwatch?', 'کدام عضو خانوادهٔ باتری‌ها داخل ساعت مچی کار می‌کند؟'),
        options: [
          L('🔘 The little coin battery', '🔘 باتری سکه‌ای کوچولو'),
          L('📦 The big 9-volt block battery', '📦 باتری کتابی بزرگ ۹ ولت'),
          L('🔋 The tall pencil battery', '🔋 باتری قلمی بلند'),
        ],
        answer: 0,
        explanation: L('Right! Watches are thin and delicate, so they need the tiny coin battery. The big block battery is for loud sirens and stronger circuits!', 'درست است! ساعت‌ها نازک و ظریف‌اند و باتری سکه‌ای ریز می‌خواهند. باتری کتابی بزرگ برای آژیرهای بلند و مدارهای قوی‌تر است!'),
      },
      {
        type: 'trueFalse',
        prompt: L('Inside a battery there is no ready-made electricity — special chemicals store the energy and turn it into electric current.', 'داخل باتری برقِ آماده وجود ندارد — مواد شیمیایی مخصوص انرژی را ذخیره می‌کنند و به جریان برق تبدیل می‌شوند.'),
        answer: true,
        explanation: L('You know the battery secret now! It is like a magical piggy bank: it saves chemical energy and releases it as electricity when the circuit closes!', 'حالا راز باتری را می‌دانی! مثل یک قلک جادویی است: انرژی شیمیایی را پس‌انداز می‌کند و وقتی مدار بسته شود، آن را به صورت برق آزاد می‌کند!'),
      },
    ],
    rewardBadge: L('The Battery Master Medal', 'مدال افتخارِ «استاد باتری‌شناس»'),
    unlockLessonIds: ['l0-9'],
  },

  // ---------------------------------------------------- 11. wire
  {
    id: 'l0-11',
    levelId: 'level0',
    title: L('What is a wire? (The electron highway)', 'سیم چیست؟ (بزرگراه الکترون‌ها)'),
    emoji: '🧵',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Say what a wire is: the electrons\u2019 own smooth highway that connects all the circuit parts', 'بگو سیم چیه: بزرگراهِ صاف و اختصاصیِ الکترون‌ها که همهٔ قطعات مدار رو به هم وصل می‌کنه'),
      L('Name the wire\u2019s shiny heart: thin copper strands — a great conductor the electrons love to run on', 'قلبِ درخشانِ سیم رو نام ببر: رشته‌های باریکِ مسی — یک رسانای عالی که الکترون‌ها عاشق دویدن روش هستن'),
      L('Tell why the plastic jacket matters: it keeps the electrons inside the wire and our hands safe', 'فایدهٔ روپوش پلاستیکی رو تعریف کن: الکترون‌ها رو توی سیم نگه می‌داره و دستامون رو ایمن نگه می‌داره'),
      L('Know the two wire kinds in our lab: alligator-clip wires and breadboard jumper wires', 'دو نوع سیمِ آزمایشگاهمون رو بشناس: سیم‌های گیره سوسماری و سیم‌های جامپرِ بردبورد'),
    ],
    screens: [
      {
        // page 1 — the electrons' private highway
        type: 'explain',
        speaker: 'robot',
        title: L('The electrons\u2019 private highway! 🛣️⚡', 'بزرگراهِ اختصاصیِ الکترون‌ها! 🛣️⚡'),
        body: L(
          'Hello to my clever explorers!\n\nHave you watched the cars moving on a wide, smooth highway? Without hitting any obstacles, they easily and quickly reach their destination.\n\nAn electric wire is exactly that: a private highway just for the electrons!\n\nWithout wires, the energetic electrons would have no way to reach the lamp, the motor or the buzzer. Like golden bridges and roads, wires connect all the circuit parts so the electrons can finish their trip!',
          'سلام به کاوشگرهای باهوش من!\n\nتا حالا به ماشین‌هایی که توی یک بزرگراهِ چندبانده و صاف حرکت می‌کنند نگاه کردید؟ اون‌ها بدون این‌که به موانع بخورند، راحت و تند به سمت مقصدشون می‌رن.\n\nسیم برق دقیقاً همین بزرگراهِ اختصاصی برای الکترون‌هاست!\n\nبدون سیم، الکترون‌های پرانرژی هیچ راهی برای رفتن به سمت لامپ، موتور یا زنگ ندارند. سیم‌ها مثل پل‌ها و جاده‌های طلایی، تمام قطعات مدار رو به هم وصل می‌کنند تا الکترون‌ها بتونند سفرشون رو کامل کنند!',
        ),
        scene: { kind: 'wire-highway', props: { image: '/images/lessons/l0-11/1-wire-highway.png' } },
      },
      {
        // page 2 — the wire's shiny copper heart
        type: 'explain',
        speaker: 'robot',
        title: L('The wire\u2019s shiny heart: copper strands! 🪙✨', 'قلبِ درخشانِ سیم؛ رشته‌های مس! 🪙✨'),
        body: L(
          'If we look inside a wire, what do we see?\n\nThin, shiny, reddish strands made of copper metal!\n\nCopper is one of the electrons\u2019 best friends (a great conductor). Electrons love running on the copper strands because nothing rough or blocking stands in their way!\n\nThat is why almost all the wires in the world are made of copper strands, so electricity travels easily!',
          'اگر به داخل یک سیم نگاه کنیم، چی می‌بینیم؟\n\nرشته‌های باریک، درخشان و سرخ‌رنگی از جنس «فلز مس»!\n\nمس یکی از بهترین دوست‌های الکترون‌هاست (یک رسانای عالی). الکترون‌ها عاشق دویدن روی رشته‌های مس هستند چون هیچ زبری یا مانعی جلوی پاشون نیست!\n\nبرای همینه که تقریباً تمام سیم‌های دنیا از رشته‌های مس ساخته می‌شن تا برق به‌راحتی منتقل بشه.',
        ),
        scene: { kind: 'copper-heart', props: { image: '/images/lessons/l0-11/2-copper-heart.png' } },
      },
      {
        // page 3 — the wire's safety jacket
        type: 'explain',
        speaker: 'robot',
        title: L('The wire\u2019s safety jacket! 🧥🛡️', 'روپوشِ ایمنیِ سیم! 🧥🛡️'),
        body: L(
          'Why do they pull plastic layers in red, blue, green and black over the copper strands?\n\nThis plastic layer is called the wire\u2019s safety jacket (its insulator)!\n\nPlastic does not let the electrons jump out of the wire! The jacket lets us hold the wires with our hands with no danger, build circuits, and be sure the electricity will not touch us.',
          'چرا روی رشته‌های فلزیِ مس، لایه‌های پلاستیکی به رنگ‌های قرمز، آبی، سبز و سیاه می‌کشند؟\n\nاین لایهٔ پلاستیکی روپوش ایمنی و عایقِ سیم نام داره!\n\nپلاستیک اجازه نمیده الکترون‌ها از سیم بیرون بپرند! این روپوش باعث میشه ما بتونیم سیم‌ها رو بدون هیچ خطری با دستامون بگیریم، مدار بسازیم و مطمئن باشیم که برق به دست ما نمی‌خوره.',
        ),
        scene: { kind: 'safety-jacket', props: { image: '/images/lessons/l0-11/3-safety-jacket.png' } },
      },
      {
        // page 4 — alligator clips and jumper wires
        type: 'explain',
        speaker: 'robot',
        title: L('Alligator-clip wires and jumper wires! 🐊🔌', 'سیم‌های گیره‌دار و سیم‌های سوراخ‌دار! 🐊🔌'),
        body: L(
          'In our world of experiments, wires come in different lovely shapes:\n\n🐊 Alligator-clip wires: wires whose two ends open and close like a little crocodile\u2019s mouth so they can easily grip the parts!\n📌 Jumper wires (breadboard): straight, pointy wires that slide easily into the holes of a breadboard.\n\nWith these kind wires, connecting parts feels just like playing with building blocks!',
          'در دنیای آزمایش‌های ما، سیم‌ها شکل‌های دوست‌داشتنیِ متفاوتی دارند:\n\n🐊 سیم‌های گیره سوسماری: سیم‌هایی که دو سرشون مثل دهان یک سوسمار کوچولو باز و بسته میشه تا راحت به قطعات متصل بشن!\n📌 سیم‌های جامپر (بردبورد): سیم‌های صاف و نوک‌تیزی که راحت توی سوراخ‌های بردبورد فرو می‌رن.\n\nبا این سیم‌های مهربون، وصل کردن قطعات درست مثل بازی با بلاک‌های ساختنی می‌مونه!',
        ),
        scene: { kind: 'clip-jumper', props: { image: '/images/lessons/l0-11/4-clip-jumper.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the electron highway! 🛣️', 'تمرین ساختنی: بزرگراه الکترون‌ها! 🛣️'),
        body: L('Four stations, zero roads! You are the highway builder today: lay the golden roads between the battery, the button, the guard and the LED. Then press and HOLD the button — the light only shines while your finger is on it!', 'چهار ایستگاه، صفر جاده! امروز تو سازندهٔ بزرگراه هستی: جاده‌های طلایی را بین باتری، دکمه، نگهبان و LED بکش. بعد دکمه را فشار بده و نگه‌دار — نور فقط تا وقتی انگشتت رویش است می‌درخشد!'),
        task: {
          brief: L('Build the whole highway so the LED lights while the button is pressed.', 'کل بزرگراه را بساز تا LED وقتی دکمه فشار داده شود روشن شود.'),
          goal: g.and(g.buttonPresent(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 210 }),
              c('button', 'bt1', { x: 310, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 490, y: 210 }),
              c('led', 'led1', { x: 670, y: 210 }),
            ],
            [
            ],
          ),
          allowed: ['battery', 'button', 'resistor', 'led'],
          hints: [
            L('Wire the whole loop: + of the battery → button → resistor → long leg of the LED → back to −.', 'کل حلقه را سیم‌کشی کن: + باتری → دکمه → مقاومت → پایهٔ بلند LED → برگشت به −.'),
            L('Run the circuit, then press and hold the button on the canvas — the lamp obeys your finger!', 'مدار را روشن کن، بعد دکمه روی صفحه را فشار بده و نگه‌دار — چراغ فرمان انگشتت را اجرا می‌کند!'),
          ],
        },
      },
      {
        // page 5 — the wire-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The wire-explorer quiz! 🏆🎮', 'آزمون کاوشگر سیم! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the secret of the wires and the electron highways!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز سیم‌ها و بزرگراه‌های الکترون رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-11/5-wire-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'Why do electric wires use metal «copper» strands inside?',
          'چرا داخل سیم‌های برق از رشته‌های فلزی «مس» استفاده میشه؟',
        ),
        options: [
          L('🚀 Because copper is a great conductor and the electrons run through it easily.', '🚀 چون مس یک رسانای عالیه و الکترون‌ها راحت توی اون می‌دوند.'),
          L('🛑 Because copper blocks the electrons\u2019 movement and stops them.', '🛑 چون مس جلوی حرکت الکترون‌ها رو می‌گیره و اون‌ها رو متوقف می‌کنه.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! 🚀 Copper is a great conductor — the electrons love running on its shiny strands because nothing blocks their way. The «Circuit Highway Master» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! 🚀 مس یک رسانای عالیه؛ الکترون‌ها عاشق دویدن روی رشته‌های درخشانِ مسی هستن چون هیچ مانعی سر راهشون نیست؛ حالا مدال «استاد و بزرگراه‌شناس مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'trueFalse',
        prompt: L('The colorful plastic jacket of a wire is its insulator — it keeps the electricity inside and our hands safe.', 'روپوش پلاستیکی رنگی سیم، عایق آن است — برق را داخل سیم نگه می‌دارد و دست‌های ما را ایمن می‌کند.'),
        answer: true,
        explanation: L('Exactly! Without that safety jacket we could never hold the wires — the plastic is the kind guard of our hands!', 'دقیقاً! بدون آن روپوش ایمنی هیچ‌وقت نمی‌توانستیم سیم‌ها را بگیریم — پلاستیک نگهبان مهربان دست‌های ماست!'),
      },
      {
        type: 'mcq',
        prompt: L('What is special about alligator-clip wires?', 'سیم‌های گیره‌دار (سوسماری) چه ویژگی‌ای دارند؟'),
        options: [
          L('🐊 Their two ends open and close like a little crocodile mouth and grip the parts', '🐊 دو سرشان مثل دهان سوسمار کوچولو باز و بسته می‌شود و قطعات را می‌گیرد'),
          L('🎨 They are always green', '🎨 همیشه سبز رنگ‌اند'),
          L('🧲 They stick to the table by themselves', '🧲 خودشان به میز می‌چسبند'),
        ],
        answer: 0,
        explanation: L('Yes! Those clever little crocodile mouths make connecting parts as easy as playing with building blocks!', 'آره! آن دهان‌های سوسماری باهوش، وصل کردن قطعات را به آسانیِ بازی با بلاک‌های ساختنی تبدیل می‌کنند!'),
      },
      {
        type: 'mcq',
        prompt: L('For plugging into the little holes of a breadboard, which wires do we use?', 'برای فرو کردن در سوراخ‌های ریز بردبورد، از کدام سیم‌ها استفاده می‌کنیم؟'),
        options: [
          L('📌 Straight, pointy jumper wires', '📌 سیم‌های جامپرِ صاف و نوک‌تیز'),
          L('🐊 Alligator-clip wires', '🐊 سیم‌های گیره‌دار سوسماری'),
          L('📺 TV cables', '📺 کابل تلویزیون'),
        ],
        answer: 0,
        explanation: L('Correct! The straight pointy jumper wires slide right into the breadboard holes and hold firmly!', 'درست است! سیم‌های جامپر صاف و نوک‌تیز راحت داخل سوراخ‌های بردبورد می‌روند و محکم می‌مانند!'),
      },
    ],
    rewardBadge: L('The Circuit Highway Master Medal', 'مدال افتخارِ «استاد و بزرگراه‌شناس مدار»'),
    unlockLessonIds: ['l0-10'],
  },

  // ----------------------------------------------------- 12. LED
  {
    id: 'l0-12',
    levelId: 'level0',
    title: L('What is an LED? (The light hero)', 'ال‌دی‌دی (LED) چیست؟ (قهرمان نور)'),
    emoji: '💡',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Say what an LED is: the tiny kind wizard that turns the electrons\u2019 energy into beautiful colorful light', 'بگو ال‌دی‌دی چیه: جادوگرِ کوچولوی مهربونی که انرژی الکترون‌ها رو به نورهای قشنگ و رنگارنگ تبدیل می‌کنه'),
      L('Know the LED\u2019s two legs: the longer leg (+) loves the battery\u2019s positive side and the shorter leg (−) loves the negative side', 'دو پایهٔ ال‌دی‌دی رو بشناس: پایهٔ بلندتر (➕) عاشقِ قطب مثبت باتریه و پایهٔ کوتاه‌تر (➖) عاشقِ قطب منفی'),
      L('Tell why the LED is one-way: electrons may only enter from the long leg — backwards it stays off but never gets sad', 'یک‌طرفه بودن ال‌دی‌دی رو تعریف کن: الکترون‌ها فقط از پایهٔ بلند وارد می‌شن — برعکس جا بخوره خاموش می‌مونه ولی ناراحت نمی‌شه'),
      L('Say why the LED always needs its guard: the resistor sets the electrons\u2019 speed so the LED never burns', 'بگو چرا ال‌دی‌دی همیشه محافظ می‌خواد: مقاومت سرعتِ الکترون‌ها رو تنظیم می‌کنه تا ال‌دی‌دی هیچ‌وقت نسوزه'),
    ],
    screens: [
      {
        // page 1 — the shining hero of light
        type: 'explain',
        speaker: 'robot',
        title: L('The shining hero of light! 💡✨', 'قهرمانِ درخشانِ نور! 💡✨'),
        body: L(
          'Hello to my energetic explorers!\n\nHave you ever looked at the tiny colorful lights on toys, remote controls, flashlights or even the TV?\n\nThese little hero lamps are called «LED»!\n\nAn LED is like a kind little wizard: when the energetic electrons enter it, it takes their energy and turns it into very beautiful, shiny and colorful lights (red, green, blue, yellow)!',
          'سلام به کاوشگرهای پرانرژی من!\n\nتا حالا به چراغ‌های کوچولو و رنگارنگ روی اسباب‌بازی‌ها، کنترل‌ها، چراغ‌قوه‌ها یا حتی تلویزیون نگاه کردید؟\n\nبه این لامپ‌های کوچولو و قهرمان می‌گیم «LED» (ال‌دی‌دی)!\n\nال‌دی‌دی مثل یک جادوگر کوچولوی مهربونه که وقتی الکترون‌های پرانرژی واردش می‌شن، انرژی اون‌ها رو می‌گیره و به نورهای خیلی قشنگ، درخشان و رنگارنگ (قرمز، سبز، آبی، زرد) تبدیل می‌کنه!',
        ),
        scene: { kind: 'led-hero', props: { image: '/images/lessons/l0-12/1-led-hero.png' } },
      },
      {
        // page 2 — the secret of the long and short legs
        type: 'explain',
        speaker: 'robot',
        title: L('The secret of the long and short legs! 🦵📏', 'راز پایه‌های پای دراز و کوتاه! 🦵📏'),
        body: L(
          'If you look at a real LED, you will see it has two metal legs that are different in size:\n\n1. ➕ The longer leg (the positive one): it loves the battery\u2019s positive side!\n2. ➖ The shorter leg (the negative one): it loves the battery\u2019s negative side!\n\nAn LED is like a one-way street! The electrons may only enter from the long leg and leave from the short leg. If you put the LED backwards in the circuit, it will not get sad — but it will not light up either!',
          'اگر به یک LED واقعی نگاه کنید، می‌بینید که دو تا پایهٔ فلزی داره که اندازه‌شون با هم فرق می‌کنه:\n\n1. ➕ پایهٔ بلندتر (قطب مثبت): عاشقِ قطب مثبت باتریه!\n2. ➖ پایهٔ کوتاه‌تر (قطب منفی): عاشقِ قطب منفی باتریه!\n\nLED مثل یک سرسبیل یا خیابان یک‌طرفه‌ است! الکترون‌ها فقط می‌تونند از پایهٔ بلند وارد بشند و از پایهٔ کوتاه بیرون برن. اگر LED رو برعکس توی مدار بگذارید، ناراحت نمیشه ولی روشن هم نمیشه!',
        ),
        scene: { kind: 'led-legs', props: { image: '/images/lessons/l0-12/2-led-legs.png' } },
      },
      {
        // page 3 — the colorful world of LEDs
        type: 'explain',
        speaker: 'robot',
        title: L('The rainbow of LEDs is everywhere! 🌈🔍', 'رنگین‌کمانِ LEDها همه جا هستند! 🌈🔍'),
        body: L(
          'Did you know that LEDs are both the lowest-energy-using and the coolest lamps in the world?\n\nUnlike the old lamps that got very hot, LEDs never burn your hand at all and take very little energy from the battery.\n\nThey exist in every color and are used in traffic lights, phone screens, flashlights and robots!',
          'می‌دونستید LEDها هم کم‌مصرف‌ترین و هم خنک‌ترین لامپ‌های دنیا هستند؟\n\nبرخلاف لامپ‌های قدیمی که خیلی داغ می‌شدند، LEDها اصلاً دست شما رو نمی‌سوزونند و انرژی خیلی کمی از باتری می‌گیرند.\n\nاون‌ها در تمام رنگ‌ها وجود دارند و توی چراغ‌های راهنمایی، صفحهٔ گوشی، چراغ‌قوه‌ها و ربات‌ها استفاده می‌شن!',
        ),
        scene: { kind: 'led-rainbow', props: { image: '/images/lessons/l0-12/3-led-rainbow.png' } },
      },
      {
        // page 4 — the LED's personal guard
        type: 'explain',
        speaker: 'robot',
        title: L('The LED\u2019s personal guard! 🦸‍♂️🛡️', 'محافظِ شخصیِ LED! 🦸‍♂️🛡️'),
        body: L(
          'Kids! Our LED is very delicate and precious.\n\nIf the electrons rush into the LED with very high speed and pressure (with no control), it may get hot and burn out!\n\nThat is why the LED always has a close friend and guard named the «resistor». The resistor stands in front of the LED to set the electrons\u2019 speed and says: «Come in slowly so my friend stays safe!»',
          'بچه‌ها! LED ما بسیار ظریف و نازنینه.\n\nاگر الکترون‌ها با سرعت و فشار خیلی زیاد (بدون کنترل) وارد LED بشن، ممکنه داغ بشه و بسوزه!\n\nبرای همین، LED همیشه یک دوست صمیمی و محافظ به اسم «مقاومت» همراه خودش داره. مقاومت جلوی LED می‌ایسته تا سرعت الکترون‌ها رو تنظیم کنه و بگه: «آروم وارد بشید تا دوستمون آسیب نبینه!»',
        ),
        scene: { kind: 'led-resistor', props: { image: '/images/lessons/l0-12/4-led-resistor.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the backwards LED! 🔧', 'تمرین ساختنی: LEDِ برعکس! 🔧'),
        body: L('Hmm… the road is complete and the battery is fresh, but the LED stays dark! Look carefully: its two wires are on the WRONG legs — the electrons are knocking on the short leg, and nobody may enter from there! Pull off the two wires of the LED and connect them the right way around!', 'هممم… جاده کامله و باتری هم تازه‌ست، ولی LED خاموش مانده! خوب نگاه کن: دو سیمش به پایه‌های اشتباه وصل شده‌اند — الکترون‌ها دارند درِ پایهٔ کوتاه را می‌کوببند و از آنجا ورود ممنوع است! دو سیمِ LED را جدا کن و برعکس وصل‌شان کن!'),
        task: {
          brief: L('Rewire the LED the right way so it finally lights up.', 'سیم‌های LED را درست وصل کن تا بالاخره روشن شود.'),
          goal: g.and(g.ledOn('led1'), g.ledCurrentSafe('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 150, y: 220 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 390, y: 220 }),
              c('led', 'led1', { x: 620, y: 220, rotation: 180 }),
            ],
            [
              w('w1', 'b1', 'pos', 'r1', 'a'),
              w('w2', 'r1', 'b', 'led1', 'cathode'),
              w('w3', 'led1', 'anode', 'b1', 'neg'),
            ],
          ),
          allowed: ['battery', 'resistor', 'led'],
          hints: [
            L('Delete the two wires that go to the LED — they are on the wrong legs.', 'دو سیمی که به LED وصل‌اند را حذف کن — به پایه‌های اشتباه وصل‌اند.'),
            L('The right way: resistor → the LONG leg of the LED, and the SHORT leg → back to − of the battery.', 'مسیر درست: مقاومت → پایهٔ بلند LED، و پایهٔ کوتاه → برگشت به − باتری.'),
          ],
        },
      },
      {
        // page 5 — the LED-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The LED-explorer quiz! 🏆🎮', 'آزمون کاوشگر LED! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the secret of the light hero!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز قهرمان نور رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-12/5-led-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'Which leg should the electrons enter the LED from to light it up?',
          'الکترون‌ها برای روشن کردن LED باید از کدام پایه وارد بشند؟',
        ),
        options: [
          L('➕ The longer leg (the positive one)', '➕ پایهٔ بلندتر (قطب مثبت)'),
          L('➖ The shorter leg (the negative one)', '➖ پایهٔ کوتاه‌تر (قطب منفی)'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! ➕ The electrons may only enter the LED from the longer leg (the positive one) and leave from the shorter one — the LED is a one-way street! The «Master and Hero of Light» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! ➕ الکترون‌ها فقط از پایهٔ بلندتر (قطب مثبت) وارد ال‌دی‌دی می‌شن و از پایهٔ کوتاه‌تر (قطب منفی) بیرون می‌آن — ال‌دی‌دی مثل خیابان یک‌طرفه است! حالا مدال «استاد و قهرمان نور» مال توست! 🏅',
        ),
      },

      {
        type: 'identify',
        prompt: L('Who is this tiny hero that turns electron energy into beautiful colorful light?', 'این قهرمان کوچولو که انرژی الکترون‌ها را به نور رنگارنگ قشنگ تبدیل می‌کند کیست؟'),
        partType: 'led',
        options: [
          L('The LED lamp', 'لامپ LED'),
          L('The resistor', 'مقاومت'),
          L('The ammeter', 'آمپرسنج'),
        ],
        answer: 0,
        explanation: L('Yes! This little wizard takes the running electrons energy and turns it into shiny red, green, blue or yellow light!', 'آره! این جادوگر کوچولو انرژی الکترون‌های دونده را می‌گیرد و به نور درخشان قرمز، سبز، آبی یا زرد تبدیل می‌کند!'),
      },
      {
        type: 'trueFalse',
        prompt: L('If we place the LED backwards in the circuit, it does not burn — it just stays off, because it is a one-way street!', 'اگر LED را برعکس در مدار بگذاریم، نمی‌سوزد — فقط خاموش می‌ماند، چون خیابان یک‌طرفه است!'),
        answer: true,
        explanation: L('Exactly! The electrons may only enter from the long leg. Backwards, they simply cannot get in — so the LED politely stays dark!', 'دقیقاً! الکترون‌ها فقط از پایهٔ بلند اجازهٔ ورود دارند. برعکس که باشند، اصلاً نمی‌توانند وارد شوند — پس LED با ادب خاموش می‌ماند!'),
      },
      {
        type: 'mcq',
        prompt: L('Why do people all around the world love LEDs so much?', 'چرا مردم سراسر دنیا این‌قدر عاشق LEDها هستند؟'),
        options: [
          L('❄️ They use very little energy and never get hot enough to burn your hand', '❄️ انرژی خیلی کمی مصرف می‌کنند و هیچ‌وقت آن‌قدر داغ نمی‌شوند که دستت را بسوزانند'),
          L('🔥 They get burning hot like old lamps', '🔥 مثل لامپ‌های قدیمی خیلی داغ می‌شوند'),
          L('🎵 They play music in the dark', '🎵 در تاریکی موزیک پخش می‌کنند'),
        ],
        answer: 0,
        explanation: L('Right! LEDs are both the lowest-energy and the coolest lamps in the world — that is why they shine in traffic lights, phones and robots!', 'درست است! LEDها هم کم‌مصرف‌ترین و هم خنک‌ترین لامپ‌های دنیا هستند — برای همین در چراغ‌های راهنمایی، گوشی‌ها و ربات‌ها می‌درخشند!'),
      },
    ],
    rewardBadge: L('The Master and Hero of Light Medal', 'مدال افتخارِ «استاد و قهرمان نور»'),
    unlockLessonIds: ['l0-11'],
  },

  // ----------------------------------------------- 13. switch
  {
    id: 'l0-13',
    levelId: 'level0',
    title: L('What is a switch? (The traffic officer)', 'کلید چیست؟ (پلیس راهنما)'),
    emoji: '🚦',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Meet the switch: the kind traffic officer of our circuit who decides when the running electrons may go and when they must rest', 'با کلید آشنا شو: پلیسِ مهربانِ مدار ما که تصمیم می‌گیره الکترون‌های دونده کِی اجازه دارند راه بیفتند و کِی باید استراحت کنند'),
      L('Tell the ON/OFF secret: pressing the switch drops its inner bridge down (closed = light on) and pressing again lifts it up (open = light off)', 'راز روشن و خاموش رو تعریف کن: فشردن کلید پلِ داخلش رو پایین میاره (بسته = چراغ روشن) و فشردنِ دوباره پل رو بالا میبره (باز = چراغ خاموش)'),
      L('Know the switch family: the rocker (the seesaw), the push button (the doorbell) and the slide switch (the flashlight)', 'خانوادهٔ کلیدها رو بشناس: راکر (الاکلنگی)، دکمهٔ فشاری (زنگ در) و کلید کشویی (چراغ‌قوه)'),
      L('Say why the switch works from any spot on the wire road and why it is the battery\u2019s good friend that saves its energy', 'بگو چرا کلید هر جای جادهٔ سیم کار می‌کنه و چرا دوستِ خوبِ باتریه و انرژیش رو حفظ می‌کنه'),
    ],
    screens: [
      {
        // page 1 — the kind policeman and the road's guard
        type: 'explain',
        speaker: 'robot',
        title: L('The kind policeman and the road\u2019s guard! 🔴🟢🚦', 'پلیسِ مهربان و نگه‌بانِ جاده! 🔴🟢🚦'),
        body: L(
          'Hello to my clever explorers!\n\nHave you ever seen the big crossroads of the city where a traffic officer or a traffic light stands? When the light is red, all the cars stop, and when it turns green, the cars go!\n\nThe piece called the «switch» is exactly the traffic officer of our electric circuit!\n\nThe switch decides when the running electrons may go and light up the lamps, and when they must stand still gently and rest!',
          'سلام به کاوشگرهای باهوش من!\n\nتا حالا چهارراه‌های بزرگ شهر رو دیدید که یک پلیس راهنمایی یا چراغ راهنما اونجا ایستاده؟ وقتی چراغ قرمزه، همه ماشین‌ها می‌ایستند و وقتی سبز میشه، ماشین‌ها راه میفتند.\n\nقطعه‌ای به اسم «کلید» (Switch) دقیقاً پلیس راهنمای مدار الکتریکی ماست!\n\nکلید تصمیم می‌گیره که الکترون‌های دونده کِی اجازه دارند راه بیفتند و چراغ‌ها رو روشن کنند، و کِی باید آروم بایستند و استراحت کنند!',
        ),
        scene: { kind: 'switch-police', props: { image: '/images/lessons/l0-13/1-switch-police.png' } },
      },
      {
        // page 2 — the command of ON and OFF (the inner bridge)
        type: 'explain',
        speaker: 'robot',
        title: L('The command of ON and OFF (ON / OFF)! 🎛️⚡', 'فرمانِ روشن و خاموش (ON / OFF)! 🎛️⚡'),
        body: L(
          'How does the switch control the electrons\u2019 road? Very simple:\n\n🟢 ON mode (the closed switch): when we press the switch, the bridge inside comes down and connects to the wire! The circuit closes, the electrons pass through happily and the light turns on!\n\n🔴 OFF mode (the open switch): when we press the switch again, the bridge goes up and a gap falls between the wires. The circuit opens, the electrons stop and the light turns off!',
          'کلید چطوری جاده الکترون‌ها رو کنترل می‌کنه؟ خیلی ساده:\n\n🟢 حالت روشن (ON - کلید بسته): وقتی کلید رو فشار میدیم، پلِ داخل کلید پایین میاد و به سیم متصل میشه! مدار بسته میشه و الکترون‌ها با شادی رد می‌شن و چراغ روشن میشه!\n\n🔴 حالت خاموش (OFF - کلید باز): وقتی دوباره کلید رو فشار میدیم، پل بالا میره و یک فاصله بین سیم‌ها می‌افته. مدار باز میشه، الکترون‌ها می‌ایستند و چراغ خاموش میشه!',
        ),
        scene: { kind: 'switch-bridge', props: { image: '/images/lessons/l0-13/2-switch-bridge.png' } },
      },
      {
        // page 3 — the different shapes of switches
        type: 'explain',
        speaker: 'robot',
        title: L('The different shapes of switches! 🔘🎚️', 'شکل‌های مختلفِ کلیدها! 🔘🎚️'),
        body: L(
          'Switches exist all around us in different shapes and models:\n\n🔴 The rocker switch (the seesaw): the same switches on the wall or on the power strip that tip from this side to that side like a seesaw!\n\n🔘 The push button (Push Button): like the doorbell button at home or the gamepad buttons that work as long as your finger rests on them!\n\n🎚️ The slide switch (Slide Switch): like the flashlight button that slides left and right!',
          'کلیدها در شکل‌ها و مدل‌های مختلفی دور و بر ما وجود دارند:\n\n🔴 کلید راکر (الاکلنگی): همون کلیدهای روی دیوار یا محافظ برق که مثل الاکلنگ این‌طرف و آن‌طرف می‌شن!\n\n🔘 دکمه فشاری (Push Button): مثل دکمهٔ زنگ در خانه یا دکمه‌های دستهٔ بازی که تا انگشتت رو روش می‌ذاری کار می‌کنه!\n\n🎚️ کلید کشویی (Slide Switch): مثل دکمهٔ چراغ‌قوه‌ها که به سمت چپ و راست سُر می‌خوره!',
        ),
        scene: { kind: 'switch-family', props: { image: '/images/lessons/l0-13/3-switch-family.png' } },
      },
      {
        // page 4 — where should we put the switch?
        type: 'explain',
        speaker: 'robot',
        title: L('Where should we put the switch? 🗺️💡', 'کلید رو کجا بگذاریم؟ 🗺️💡'),
        body: L(
          'Did you know that we can place the switch anywhere along the wire\u2019s way?\n\nIt does not matter whether we put the switch before the lamp or after the lamp! What matters is that the switch stands on the electrons\u2019 main road.\n\nWhen the switch is off, the whole road stops and no energy is wasted from the battery. The switch is the battery\u2019s good friend too, because it does not let the battery\u2019s energy finish for nothing!',
          'آیا می‌دونستید کلید رو می‌تونیم هر جایی سرِ راهِ سیم قرار بدیم؟\n\nفرقی نمی‌کنه کلید رو قبل از لامپ بگذاریم یا بعد از لامپ! مهم اینه که کلید سر راه جادهٔ اصلی الکترون‌ها باشه.\n\nوقتی کلید خاموش باشه، کل جاده متوقف میشه و هیچ انرژی‌ای از باتری هدر نمیره. کلید دوستِ خوبِ باتری هم هست، چون نمی‌ذاره انرژی باتری بیهوده تموم بشه!',
        ),
        scene: { kind: 'switch-position', props: { image: '/images/lessons/l0-13/4-switch-position.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: the commander of light! 🚦', 'تمرین ساختنی: فرماندهٔ نور! 🚦'),
        body: L('A true commander decides when the light comes on! Put the traffic officer — the switch — on the road of the electrons, wire the whole loop, and then command: switch ON, light ON!', 'فرماندهٔ واقعی تصمیم می‌گیرد نور کِی روشن شود! پلیس راهنما — کلید — را سر جادهٔ الکترون‌ها بگذار، کل حلقه را سیم‌کشی کن و بعد فرمان بده: کلید بسته، چراغ روشن!'),
        task: {
          brief: L('Wire the loop with the switch in it, close it, and light the LED.', 'حلقه را با کلید داخلش سیم‌کشی کن، ببندش و LED را روشن کن.'),
          goal: g.and(g.switchPresent(), g.switchClosed(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 210 }),
              c('switch', 'sw1', { x: 320, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 510, y: 210 }),
              c('led', 'led1', { x: 680, y: 210 }),
            ],
            [
            ],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('The officer can stand anywhere on the road — before the lamp or after it. Wire the full circle!', 'پلیس هر جای جاده می‌تواند بایستد — قبل از لامپ یا بعد از آن. دایرهٔ کامل را سیم‌کشی کن!'),
            L('Now command: tap the switch to close it, run the circuit — light ON!', 'حالا فرمان بده: روی کلید بزن تا بسته شود، مدار را روشن کن — نور روشن!'),
          ],
        },
      },
      {
        // page 5 — the switch-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The Switch-explorer quiz! 🏆🎮', 'آزمون کاوشگر کلید! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever explorers! Now it is time to show how well you learned the command secret and the circuit policeman!',
          'آفرین به کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب راز فرماندهی و پلیس مدار رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-13/5-switch-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'When the power switch goes to the OFF mode, what happens in the circuit?',
          'وقتی کلید برق در حالت خاموش (OFF) قرار می‌گیره، چه اتفاقی در مدار می‌افته؟',
        ),
        options: [
          L('🔴 The road opens (the circuit opens) and the electrons stop moving.', '🔴 جاده باز میشه (مدار باز) و حرکت الکترون‌ها متوقف میشه.'),
          L('🟢 The battery gets hot and the electrons run even faster.', '🟢 باتری داغ میشه و الکترون‌ها تندتر میدوند.'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! 🔴 When the switch goes OFF, the bridge goes up, the road opens and the electrons stop — not even a little of the battery\u2019s energy is wasted! The «Master and Circuit-Police» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! 🔴 وقتی کلید خاموش (OFF) میشه، پل بالا میره، جاده باز میشه و الکترون‌ها می‌ایستند — حتی ذره‌ای از انرژی باتری هم هدر نمیره! حالا مدال «استاد و پلیس راهنمای مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'identify',
        prompt: L('Who is this kind traffic officer standing on the electrons road?', 'این پلیس راهنمای مهربان که سر جادهٔ الکترون‌ها ایستاده کیست؟'),
        partType: 'switch',
        options: [
          L('The switch', 'کلید'),
          L('The battery', 'باتری'),
          L('The LED lamp', 'لامپ LED'),
        ],
        answer: 0,
        explanation: L('Yes! The switch is the traffic officer: it opens and closes the road and decides when the electrons may run and when they must rest!', 'آره! کلید همان پلیس راهنماست: جاده را باز و بسته می‌کند و تصمیم می‌گیرد الکترون‌ها کِی بدوند و کِی استراحت کنند!'),
      },
      {
        type: 'mcq',
        prompt: L('The doorbell button at home belongs to which member of the switch family?', 'دکمهٔ زنگ در خانه، به کدام عضو خانوادهٔ کلیدها تعلق دارد؟'),
        options: [
          L('🔘 The push button — it works only while your finger presses it', '🔘 دکمهٔ فشاری — فقط تا وقتی انگشتت روی آن است کار می‌کند'),
          L('⚖️ The rocker switch that tips like a seesaw', '⚖️ کلید راکر که مثل الاکلنگ می‌خورد'),
          L('🎚️ The slide switch that slides left and right', '🎚️ کلید کشویی که چپ و راست سُر می‌خورد'),
        ],
        answer: 0,
        explanation: L('Exactly! The doorbell rings only while you press — that is the magic of the push button!', 'دقیقاً! زنگ در فقط تا وقتی فشار می‌دهی صدا می‌دهد — این جادوی دکمهٔ فشاری است!'),
      },
      {
        type: 'trueFalse',
        prompt: L('We can place the switch anywhere along the wire road — before the lamp or after it, it works the same.', 'کلید را می‌توانیم هر جای جادهٔ سیم بگذاریم — قبل از لامپ یا بعد از آن، یکسان کار می‌کند.'),
        answer: true,
        explanation: L('Right, engineer! What matters is that the switch stands on the main road of the electrons. And when it is OFF, no battery energy is wasted!', 'درست است مهندس! مهم این است که کلید روی جادهٔ اصلی الکترون‌ها باشد. و وقتی خاموش است، هیچ انرژی‌ای از باتری هدر نمی‌رود!'),
      },
    ],
    rewardBadge: L('The Master and Circuit-Police Medal', 'مدال افتخارِ «استاد و پلیس راهنمای مدار»'),
    unlockLessonIds: ['l0-12'],
  },

  // -------------------------------------------------------------- 14. circuit symbols
  {
    id: 'l0-14',
    levelId: 'level0',
    title: L('Circuit maps & symbols (the engineers\u2019 secret language)', 'نقشه و نمادهای مدار (زبان رازآلود مهندسان)'),
    emoji: '🔤',
    difficulty: 1,
    minutes: 8,
    objectives: [
      L('Meet the engineers\u2019 secret treasure-map language: simple drawing symbols that everyone anywhere in the world can read', 'با زبان رازآلودِ نقشهٔ گنجِ مهندسان آشنا شو: نمادهای سادهٔ نقاشی‌مانند که هر کس توی هر جای دنیا می‌فهمد'),
      L('Draw the wire (a straight line) and the battery (two parallel lines: long = +, short = \u2212) symbols', 'نماد سیم (یک خطِ صاف) و نماد باتری (دو خطِ موازی: بلند = + و کوتاه = −) رو بکش'),
      L('Draw the switch (an open tilted bridge) and the LED (a triangle with a line and two light arrows) symbols', 'نماد کلید (پلِ کج‌وباز) و نماد LED (مثلث با یک خط و دو فلشِ نور) رو بکش'),
      L('Read a real circuit map: trace the full loop from the negative pole through the switch, the resistor and the LED back to the positive pole', 'یک نقشهٔ واقعی مدار رو بخون: دورِ کامل رو از قطب منفی تا کلید و مقاومت و LED و برگشت به قطب مثبت دنبال کن'),
    ],
    screens: [
      {
        // page 1 — the engineers' treasure map
        type: 'explain',
        speaker: 'robot',
        title: L('The engineers\u2019 treasure map! 📜🧭', 'نقشهٔ گنجِ مهندسان! 📜🧭'),
        body: L(
          'Hello to my clever explorers!\n\nHave you ever seen a treasure map in pirate stories, or the city road maps? On a map, instead of drawing the real trees or the big buildings, they use small and tidy little signs.\n\nElectronics engineers all around the world also have their own secret language and special treasure map!\n\nInstead of drawing the real, complicated shape of a battery or a lamp, they use simple drawing-like symbols, so that anyone anywhere in the world who sees the map quickly understands how to build the circuit!',
          'سلام به کاوشگرهای باهوش من!\n\nتا حالا نقشهٔ گنج توی داستان‌های دزدان دریایی یا نقشهٔ راه‌های شهر رو دیدید؟ روی نقشه به جای کشیدن درخت‌های واقعی یا ساختمون‌های بزرگ، از علامت‌های کوچولو و خلوت استفاده می‌کنند.\n\nمهندس‌های الکترونیک هم توی سراسر دنیا یک زبان رازآلود و نقشهٔ گنجِ مخصوص به خودشون دارند!\n\nاون‌ها به جای کشیدن شکلِ واقعی و پیچیدهٔ باتری یا لامپ، از نمادهای سادهٔ نقاشی‌مانند استفاده می‌کنند تا هر کس توی هر جای دنیا نقشه رو دید، سریع بفهمه چطوری مدار رو بسازه!',
        ),
        scene: { kind: 'treasure-map', props: { image: '/images/lessons/l0-14/1-treasure-map.png' } },
      },
      {
        // page 2 — the battery and wire symbols
        type: 'explain',
        speaker: 'robot',
        title: L('The battery and wire symbols; secret lines! 🔋📏', 'نماد باتری و سیم؛ خط‌های رازآلود! 🔋📏'),
        body: L(
          'Let\u2019s learn the first secret symbols:\n\n1. 📏 Wires: very simple! They are just a straight, flat line. When two wires connect to each other, the lines meet each other.\n2. 🔋 Battery: instead of drawing the complete picture of a battery, we use two parallel lines (one long and one short)!\nThe longer and thinner line ➔ the positive pole (+)\nThe shorter and thicker line ➔ the negative pole (-)\n\nSee how simple and pretty it is?',
          'بیاین اولین نمادهای رازآلود رو یاد بگیریم:\n\n1. 📏 سیم‌ها: خیلی ساده! فقط یک خطِ صاف و راست هستند. وقتی دو تا سیم به هم وصل می‌شن، خط‌ها به هم می‌رسند.\n2. 🔋 باتری: به جای کشیدن عکس کامل باتری، از دو تا خط موازی (یکی بلند و یکی کوتاه) استفاده می‌کنیم!\nخط بلندتر و نازک‌تر ➔ قطب مثبت (+)\nخط کوتاه‌تر و ضخیم‌تر ➔ قطب منفی (-)\n\nدیدید چقدر ساده و قشنگه؟',
        ),
        scene: { kind: 'battery-wire-symbol', props: { image: '/images/lessons/l0-14/2-battery-wire-symbol.png' } },
      },
      {
        // page 3 — the switch and LED symbols
        type: 'explain',
        speaker: 'robot',
        title: L('The switch and LED symbols; the bridge and the glowing arrows! 🎛️💡', 'نماد کلید و LED؛ پل و فلش‌های نورانی! 🎛️💡'),
        body: L(
          'Now let\u2019s go to two more exciting symbols:\n\n1. 🔴 Switch: it is drawn like an open, tilted bridge! When the switch is open, the line is lifted and has not reached the wire; when the switch closes, the line falls onto the wire!\n2. 💡 LED lamp: a small triangle with a perpendicular line in front of it, and two tiny arrows that spray light outward! These arrows mean light is being made right here!',
          'حالا بریم سراغ دو تا نماد هیجان‌انگیز دیگه:\n\n1. 🔴 کلید: مثل یک پلِ کج‌وباز کشیده میشه! وقتی کلید بازه، خط کجه و به سیم نرسیده؛ وقتی کلید بسته میشه، خط روی سیم می‌افته!\n2. 💡 لامپ LED: یک مثلث کوچک که جلوش یک خط عمودیه و دو تا فلش کوچک ازش نور به بیرون می‌پاشند! این فلش‌ها یعنی اینجا نور درخشان تولید میشه!',
        ),
        scene: { kind: 'switch-led-symbol', props: { image: '/images/lessons/l0-14/3-switch-led-symbol.png' } },
      },
      {
        // page 4 — reading the map like a real engineer
        type: 'explain',
        speaker: 'robot',
        title: L('Read the map like a real engineer! 📐🧭', 'مثل یک مهندس واقعی نقشه رو بخون! 📐🧭'),
        body: L(
          'Now, if they put a map in front of you, how do you build the circuit from it?\n\nJust like reading a book! You put your finger on the wire line at the battery\u2019s negative pole, you walk until you reach the switch, then you walk to the resistor and the LED, and finally you come back to the battery\u2019s positive pole!\n\nWhen this loop becomes complete, it means you read the map correctly and your circuit works 100 percent!',
          'حالا اگر یک نقشه جلوتون بگذارند، چطوری از روی اون مدار می‌سازید؟\n\nدرست مثل خوندن کتاب! انگشتت رو از قطب منفی باتری روی خطِ سیم می‌گذاری، میری تا برسی به کلید، بعد میری به مقاومت و LED و در نهایت برمی‌گردی به قطب مثبت باتری!\n\nوقتی این دور کامل بشه، یعنی نقشه رو درست خوندید و مدارتون ۱۰۰٪ کار می‌کنه!',
        ),
        scene: { kind: 'map-trace', props: { image: '/images/lessons/l0-14/4-trace-map.png' } },
      },
      {
        // end-of-lesson mini-build
        type: 'build',
        title: L('Mini-build: build from the treasure map! 📜', 'تمرین ساختنی: ساخت از روی نقشهٔ گنج! 📜'),
        body: L('The final test of real engineers: reading the map! Here is the loop drawn in the secret symbol language: − battery → switch → resistor → LED → + battery. Build it exactly like the map says!', 'آزمونِ آخرِ مهندس‌های واقعی: خواندن نقشه! این هم حلقه به زبان رازآلود نمادها: − باتری → کلید → مقاومت → LED → + باتری. دقیقاً مثل نقشه‌اش بساز!'),
        task: {
          brief: L('Follow the map loop and build the circuit exactly as drawn.', 'حلقهٔ نقشه را دنبال کن و مدار را دقیقاً همان‌طور که کشیده شده بساز.'),
          goal: g.and(g.switchClosed(), g.ledOn('led1'), g.noShort()),
          startCircuit: doc(
            [
              c('battery', 'b1', { params: { voltage: 9 }, x: 130, y: 210 }),
              c('switch', 'sw1', { x: 320, y: 210 }),
              c('resistor', 'r1', { params: { resistance: 470 }, x: 510, y: 210 }),
              c('led', 'led1', { x: 680, y: 210 }),
            ],
            [
            ],
          ),
          allowed: ['battery', 'switch', 'resistor', 'led'],
          hints: [
            L('Put your finger on the map at − of the battery and trace it: switch, resistor, long leg of the LED…', 'انگشتت را روی نقشه بگذار، روی − باتری، و دنبالش برو: کلید، مقاومت، پایهٔ بلند LED…'),
            L('Finish the loop back at + of the battery, close the switch — and the treasure lights up!', 'حلقه را در + باتری تمام کن، کلید را ببند — و گنج روشن می‌شود!'),
          ],
        },
      },
      {
        // page 5 — the map-explorer's quiz (user's exact question) + medal
        type: 'quiz',
        title: L('The map-explorer quiz! 🏆🎮', 'آزمون کاوشگر نقشه! 🏆🎮'),
        speaker: 'robot',
        body: L(
          'Bravo to my clever engineers and explorers! Now it is time to show how well you learned the engineers\u2019 secret language!',
          'آفرین به مهندس‌ها و کاوشگرهای باهوش من! حالا وقتشه نشون بدید چقدر خوب زبان رازآلود مهندسان رو یاد گرفتید!',
        ),
      },
      {
        type: 'reward',
        scene: { kind: 'celebration', props: { image: '/images/lessons/l0-14/5-symbols-medal.png' } },
      },
    ],
    quiz: [
      {
        // exactly the user's single competition question
        type: 'mcq',
        prompt: L(
          'On the circuit map, how is the «battery» symbol drawn?',
          'روی نقشهٔ مدار، نماد «باتری» چطوری کشیده میشه؟',
        ),
        options: [
          L('🔋 Two parallel lines (one long for positive, one short for negative)', '🔋 دو تا خط موازی (یکی بلند برای مثبت، یکی کوتاه برای منفی)'),
          L('🔴 A big circle with two wings', '🔴 یک دایرهٔ بزرگ با دو تا بال'),
        ],
        answer: 0,
        explanation: L(
          'Bravo, my clever explorer! 🔋 The battery is drawn as two parallel lines — the long, thin line for the positive pole and the short, thick line for the negative pole! The «Master of map-reading and circuit engineer» medal is now yours! 🏅',
          'آفرین به کاوشگر باهوش من! 🔋 باتری با دو تا خط موازی کشیده میشه — خطِ بلند و نازک برای قطب مثبت و خطِ کوتاه و ضخیم برای قطب منفی! حالا مدال «استاد نقشه‌خوانی و مهندس مدار» مال توست! 🏅',
        ),
      },

      {
        type: 'mcq',
        prompt: L('How is the LED symbol drawn on the circuit map?', 'نماد LED روی نقشهٔ مدار چطور کشیده می‌شود؟'),
        options: [
          L('🔺 A small triangle with a line in front and two light arrows', '🔺 یک مثلث کوچک با یک خط جلویش و دو فلش نور'),
          L('⭕ A big round circle', '⭕ یک دایرهٔ بزرگ گرد'),
          L('📏 Two parallel straight lines', '📏 دو خط موازی صاف'),
        ],
        answer: 0,
        explanation: L('Correct! The triangle shows the one-way direction, the line is the barrier, and the two little arrows say: light is being born right here!', 'درست است! مثلث جهت یک‌طرفه را نشان می‌دهد، خط سدِ مسیر است و دو فلش کوچولو می‌گویند: همین‌جا نور تولید می‌شود!'),
      },
      {
        type: 'trueFalse',
        prompt: L('In the battery symbol, the long thin line means the positive pole (+).', 'در نماد باتری، خطِ بلند و نازک یعنی قطب مثبت (+).'),
        answer: true,
        explanation: L('Exactly! Long thin line = positive, short thick line = negative. Now you can read the battery on any map in the world!', 'دقیقاً! خط بلند و نازک = مثبت، خط کوتاه و ضخیم = منفی. حالا می‌توانی باتری را روی هر نقشه‌ای در دنیا بخوانی!'),
      },
      {
        type: 'mcq',
        prompt: L('How is an OPEN switch drawn on the map?', 'کلیدِ باز روی نقشه چطور کشیده می‌شود؟'),
        options: [
          L('🌉 Like a tilted bridge that has not reached the wire yet', '🌉 مثل پل کجی که هنوز به سیم نرسیده'),
          L('⭕ Like a closed circle', '⭕ مثل یک دایرهٔ بسته'),
          L('⭐ Like a star', '⭐ مثل یک ستاره'),
        ],
        answer: 0,
        explanation: L('Yes! When the switch closes, the tilted line falls onto the wire and the road becomes complete — just like our bridge story!', 'آره! وقتی کلید بسته می‌شود، خطِ کج روی سیم می‌افتد و جاده کامل می‌شود — درست مثل داستان پل ما!'),
      },
    ],
    rewardBadge: L('The Map-Reading Master and Circuit-Engineer Medal', 'مدال افتخارِ «استاد نقشه‌خوانی و مهندس مدار»'),
    unlockLessonIds: ['l0-13'],
  },
];

