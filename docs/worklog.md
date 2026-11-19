# Worklog

---
Task ID: 1
Agent: main (Super Z)
Task: Phase 1 — architecture design for the educational electronics app (CircuitQuest, working title)

Work Log:
- Probed environment: Node v24.19.0 / npm 11.17.0 available; Flutter SDK NOT installed; no Android toolchain → web-native TS stack chosen, Capacitor planned for Android packaging (Phase 3).
- Designed complete architecture: stack rationale (why not Flutter), layered architecture, folder structure, Dexie storage schema, MNA-based circuit simulation engine spec (real solver, not scripted animation), component registry pattern, Zod-validated content architecture, navigation map, M0–M7 roadmap (MVP = M0–M5, Levels 0–2), dependency list.
- Wrote full architecture to /home/z/my-project/ARCHITECTURE.md (460 lines, sections A–J + cross-cutting policies).

Stage Summary:
- Phase 1 deliverable complete: ARCHITECTURE.md awaiting user approval.
- NO implementation started (per user instruction: WAIT after Phase 1).
- Phase 2 (upon approval): M0 scaffold + M1 engine core first; engine must be pure TS under src/engine/** with Vitest golden tests.
- Key decisions: Next.js 16 + React 19 + TS strict; Tailwind 4 design tokens; Zustand; Dexie (player-keyed, cloud-ready); next-intl (en now, fa-ready RTL); content = typed data modules; simulator = simplified MNA + Newton-Raphson + backward Euler caps; diagnostics engine = "explain, don't punish".

---
Task ID: 2 (Phase 2 — M1 Engine Core)
Agent: main (Super Z)
Task: Build + verify the pure-TS circuit simulation engine

Work Log:
- Wrote src/engine/: types.ts (CircuitDoc, PartDef, DeviceModel, GoalExpr, SimSnapshot), core/mna.ts (dense MNA, partial-pivot Gauss, freeze-phase, VCCS stamp), devices.ts (13 models: battery w/ 0.5Ω rint, resistor, LED PWL per color, diode, switch, button, capacitor backward-Euler, potentiometer, LDR, buzzer, motor, NPN transistor VCCS model, ammeter, wire-as-1mΩ-edge), netlist.ts (union-find nets, coincident-pin merge, wires as edges → per-wire currents), simulator.ts (NR loop ≤50 iters, transient ticks, measureVoltage/measureResistance w/ zeroed sources + 1mA test), diagnostics.ts (short/open/overcurrent/reversed/floating/success), goals.ts (JSON DSL evaluator + builder helpers).
- Fixed 4 real bugs during TDD: `Number(0)||3` zeroed-battery fallback; const `switched` in transistor; stale-ib oscillation → replaced dependent current source with VCCS (gm=β/RBE stamped into G) + saturation hysteresis (0.2/0.35V) + unsaturate-on-conduction-loss; wires now stay as 1mΩ edges (not unioned) so every wire has a defined current for flow animation.
- Wrote 16 golden tests in src/tests/engine.test.ts (vitest + alias config): ALL PASS. Verified: divider 6.000V, LED (Vs−Vf)/R ±5%, open/short/reversed/overcurrent diags, capacitor V(τ)≈63%, series/parallel, pot sweep, transistor sat ic≈19mA, battery sag, ammeter, touching-pins, ohmmeter, LDR.

Stage Summary:
- M1 COMPLETE. Engine is pure TS (no React/DOM), offline-safe, <1ms typical solve.
- Note: skill constraint — user sees only `/` route → single-page app with hash routing (mobile-app style); screens as components.
- Next: parts SVG visuals → design tokens/i18n/stores → lab editor → content → gamification.

---
Task ID: 3 (Phase 2 — M0–M6 full build)
Agent: main (Super Z)
Task: Implement the complete CircuitQuest app (single-page, hash-routed per skill constraint)

Work Log:
- Parts layer: registry.ts (13 parts w/ pins/params/models), visuals.tsx (original SVG art for all parts incl. LED glow, switch lever, motor rotor, pot slider, LDR arrows, transistor SAT/ON/OFF badge).
- Engine hardening during browser E2E: (1) wires stay as 1mΩ edges → per-wire currents for flow animation; (2) floating-pins diagnostic rewritten → isolatedPins = pins with no wire & no coincident partner (netMembers are per-pin by design); (3) VCCS transistor model (gm=β/RBE stamped into G) removed stale-ib NR oscillation; sat hysteresis 0.2/0.35V; unsaturate on conduction loss.
- UI: CircuitView (renderer + wire bezier + flow dashes w/ direction & speed ∝ I), MiniLab (live-sim demos with sliders), LabScreen (palette/canvas/wire-tool/place-tool/props sheet/zoom-pan/multimeter V·A·Ω incl. SPICE-style ohmmeter, diagnostics cards, task banners + progressive hints, celebration overlay, buzzer WebAudio), Quiz (mcq/tf/identify/diagnose + explanations + retry), LessonPlayer (7 screen types, gating: build task done + quiz ≥70%), scenes.tsx (25 original educational SVG scenes), Home/Learn/Projects/ProjectPlayer/Challenges/Progress/Profile/Settings, hash router (stable snapshot), i18n (en catalog + fa-ready), stores (zustand persist: settings/progress/lab), gamification (XP curve 8 tiers, 12 badge rules, daily streak, adaptive perf scores).
- Browser E2E (agent-browser): home renders; lab: placed battery+resistor+LED via pointer events, wired loop, RUN → LED glows, 21 mA badge, flow dashes, success card «LED running happily»; task mode from lesson l0-3 → solved → «Task complete!» + back-to-lesson gating ✓; quiz 3/3 → reward → lesson complete → XP 70 (+50 lesson, +20 perfect quiz), badges first-spark+first-lesson, streak day 1. Fixed during E2E: lucide ZoomIn names, router getSnapshot caching (infinite loop), setTool clobbering placingType, place-mode event swallowing, sim power sync, i18n key lesson→learn, multimeter reading → state pattern (react-hooks rules).
- Final: lint clean, 21/21 tests, 0 console errors on clean load.

Stage Summary:
- MVP (M0–M5) + M6 projects complete: 30 lessons (L0 12, L1 9, L2 9), 8 challenges (3 troubleshooting), 7 projects, 12 badges, 25 scenes, full lab w/ 13 parts + multimeter + diagnostics engine.
- Known scope notes: Levels 3–7 content attaches via content/levels (architecture ready); PWA service worker + Persian catalog = next iteration; breadboard part = stretch (skipped, coincident-pin wiring covers the concept).
- Screenshots in download/screenshots/.

---
Task ID: 4 (گام ۱ — Persian-first localization)
Agent: main (Super Z)
Task: Fully Persianize the app (fa default, RTL, Vazirmatn) — step 1 of user-requested incremental delivery

Work Log:
- Downloaded Vazirmatn v33 woff2 (Regular/Bold/Black) → public/fonts, wired via @font-face + body font-family + theme --font-sans.
- layout.tsx: lang="fa" dir="rtl" default, Persian metadata/title; Shell (page.tsx) syncs html lang/dir from settings (fa↔en toggles dir rtl/ltr live).
- Created src/lib/i18n/fa.ts — full 200-key Persian catalog (kid-friendly tone); i18n provider: fa registered, t() auto-converts digits to Persian when lang=fa, new tx() resolver for bilingual LocaleText content, toFaDigits helper exported.
- en.ts: added 8 new keys (notFound/moreLevelsSoon/moreSoon/xpNoHints/claimReward/simRuns/importInvalid/…), removed obsolete languageFaSoon + typo key.
- Wired tx() everywhere content LocaleText was rendered .en: main.tsx, activities.tsx, LessonPlayer, Quiz, CircuitView(MiniLab), LabScreen. Replaced hardcoded strings (Claim reward, +50 XP no hints, Lab runs, Invalid file, Level 3–7 notes, Lesson/Project not found, material names → part.*.name keys).
- stores: settings default language 'fa'; progress default name «کاوشگر»; lab.ts LabTask.briefKey:string → brief:LocaleText (task not persisted → no migration needed).
- RTL fixes: .cq-flip-rtl utility ([dir=rtl] scaleX(-1)) on all directional arrows (LessonPlayer back/next/open-lab, ProjectPlayer back); verified computed transform matrix(-1,...) live. Logical classes (ms/me/start/end) already used — no physical-class breakage found.
- Persian digits applied: t() vars, home XP, learn counters, StatCard numbers, progress %/٪, hint ۱/۳; multimeter LCD + part values intentionally stay Latin (real-instrument convention).
- Settings language row: functional فارسی/English toggle (tested both directions: dir+catalog swap live).

Verification (agent-browser E2E, fresh localStorage):
- Home: سلام کاوشگر!، سطح ۰·کاوشگر الکترونیک، چالش روزانه «از صفر تا نور» (fa از content L()) ✅
- Lesson l0-1 full loop: explain fa body → animation → demo → quiz 3/3 (mcq+trueFalse fa prompts/options/explanations, «۳ از ۳ درست بود») → reward → finish → back to path ۱/۳۰ ✅
- Lab: challenge banner fa, palette fa (انرژی/پایه/…, باتری), placed battery via pointer, RUN → open-circuit diag fa; troubleshoot challenge «مدارِ ساکت» prebuilt circuit + fa banner + fa diagnostic ✅; multimeter panel fa (V/A/Ω + hint) ✅
- Settings/Progress fa ✅; zero console/page errors; bun lint clean; 21/21 vitest pass.

Stage Summary:
- App is now Persian-first (fa default, RTL, Vazirmatn) with English switchable. ~700 content strings were already bilingual via L(en,fa) — now actually consumed.
- REMAINING (گام ۲, awaiting user confirmation): scenes.tsx SVG illustration labels still English (~20 labels: safety poster, switch door, material test, water pipes, symbol grid); PWA/service-worker untouched; Capacitor untouched.
- Screenshots: download/screenshots/fa-*.png (home, lesson, quiz, lab-challenge, lab-trouble, settings, progress, learn-path).

---
Task ID: 5 (گام — رفع دو مشکل گزارش‌شدهٔ کاربر)
Agent: main (Super Z)
Task: 1) ابزار سیم آزمایشگاه کار نمی‌کند  2) آموزش فارسی سخت/نامفهوم است — ساده‌سازی کامل

Work Log:
- ROOT CAUSE wire bug: store `startPlacing(null)` always reset tool→'select', so the wire tool button (setTool('wire') + startPlacing(null)) instantly clobbered itself → tool never active. Fixed in stores/lab.ts (only 'place'→'select' transition resets).
- Wire UX hardening (LabScreen.tsx): pointer-capture on draft start (drag-to-wire now works on touch+mouse; same-pin pointerup lands on nearest pin under pointer), tapping empty canvas cancels an unfinished draft, try/catch around setPointerCapture.
- BONUS runtime crashes found & fixed during typecheck: (a) MiniLab missing `const raf = useRef(0)` → ALL lesson demo screens (l0-6/8/10, l2-5) crashed on mount; (b) DIODE_VF/DIODE_RON undefined in devices.ts → placing a دیود threw ReferenceError; (c) LabTask.allowed missing in store type.
- Type hygiene: PartState +voltage/dischargeCurrent/taper; BadgeDef imported from content/types; SetFn/GetFn proper signatures. Remaining tsc errors are pre-existing engine/registry looseness (runtime-verified OK) — cleanup item for a later step.
- Persian simplification pass (~250 strings, kid-friendly): replaced translationese vocabulary everywhere — هُل→فشار، شارش→جریان/عبور، نارسانا→عایق، بادیگارد→محافظ، بوزر→بوق‌زن، سرخورنده→بازوی متحرک، پل‌کشوی→پل analogy; short sentences, conversational tone, consistent «راهِ برق/مسیر» wording, clarified باز/بسته switch terms with (روشن/خاموش) glosses. Files: level0/1/2.ts (all 30 lessons incl. quizzes+hints+briefs), challenges.ts (8), projects.ts (7).
- CONTENT BUG fixed: l0-4 diagnose quiz had a logically wrong answer key (circuit shows an OPEN switch but correct answer claimed "it should glow") → rewritten to test the open switch honestly.
- scenes.tsx: fully de-hardcoded — Label accepts LocaleText, all ~60 illustration labels bilingual via txText (safety poster rules, material names, symbol names, detective steps, water-pipes captions…); ElectronFlow anim captions mapped via FLOW_CAPTIONS; safety poster + symbol grid use lang-aware rendering.
- fa.ts catalog: simplified diag.*/goal.*/quiz.wrong/ammeterHint/ohmHint/tapPinToStart (now explains tap-tap AND drag)/aboutBody/safetyBody.
- E2E verified (agent-browser, real clicks + synthetic pointers + real mouse drag): wire tool activates (hint visible), battery+resistor+LED placed, 3 wires tap-tap wired, RUN → diag «ال‌ای‌دی با جریانِ امن دارد قشنگ می‌درخشد», wireCurrents ≈5.2mA ((3−1.8)/230 ✓ physics), 4th wire via drag-release works (current splits). Lesson l0-2 renders simplified fa body + fa SVG labels. Clean console after reload; 21/21 vitest; eslint clean.

Stage Summary:
- Both reported problems fixed & verified in browser. Screenshots: download/screenshots/fix-wire-working.png, fix-lesson-fa.png.
- Known leftovers (next steps, not yet started): pre-existing engine/registry type looseness; PWA service worker; Capacitor packaging; levels 3–7 content.

---
Task ID: 6 (گام — استانداردسازی ترتیب آموزش بر اساس جزوه‌های کاربر)
Agent: main (Super Z)
Task: «اول بچه باید بداند LED و مقاومت چیست، بعد مدار» — restructure Level 0 to the standard order; new component-intro lessons in the handout style (one-line definition + «مثل چی؟» + real-life examples + friendly picture).

Work Log:
- Read both uploaded PDFs (جلسه 1 مقدماتی، دنیای مقاومت ها) and extracted the teaching standard: quoted one-line definitions, everyday analogy («مثل چی؟»), real-life examples, «یادت باشد» key facts, component photo+symbol, hands-on circuits only AFTER components are known.
- Audited old Level 0: l0-3 «مدار چیست؟» (full LED build) was unlocked from lesson 1 — LED/resistor/switch never introduced before it; battery lesson came AFTER circuits. Confirmed user complaint.
- Rewrote src/content/levels/level0.ts completely: 16 lessons, clean linear unlock chain l0-1→…→l0-16. New order: electronics → electricity → MEET THE PARTS (battery l0-3 w/ voltage demo, wire l0-4 NEW, LED l0-5 NEW, resistor l0-6 NEW, switch l0-7 NEW) → circuit l0-8 (first build now AFTER parts are known) → safety → open/closed → conductors → current → voltage → resistance concept → power → symbols.
- New intro lessons follow handout style: definition in quotes, «مثل چی؟» analogy, «کجاها می‌بینیمش؟», «یادت باشد» (long leg = +), pointer to next lesson. Bodies use \n line breaks.
- LessonPlayer: added whitespace-pre-line to explain/animation/demo/build body <p> so \n renders as breaks (handout-bullet feel).
- level1.ts: two unlock refs updated 'l0-4'→'l0-10' (open/closed circuits). content/index.ts: level0 description updated to match new order.
- Fixed syntax error (missing paren in l0-5 objective). vitest 21/21 PASS (content integrity: unique ids, unlock refs resolve, quiz keys valid, build circuits compile). eslint clean on changed files.
- Browser E2E (agent-browser): learn path shows 16 lessons in new order with sequential locking; seeded progress l0-1..4 → LED lesson unlocks; new lesson renders scene + multiline body correctly; zero console errors. Screenshot: download/screenshots/std-lesson-led.png.
- NOTE: lesson ids changed (old progress for level0 no longer matches — dev-stage acceptable).

Stage Summary:
- Level 0 now follows the standard pedagogy the user demanded: parts BEFORE circuits.
- REMAINING for next steps: apply the same «مثل چی؟» simplification pass to Levels 1–2 lesson bodies; levels 3–7 content; PWA/Capacitor.

---
Task ID: 7 (گام — بازسازی تصاویر سیم و حرکت الکترون‌ها)
Agent: main (Super Z)
Task: «تصویر توضیح سیم بی‌ربط بود» + «حرکت الکترون‌ها افتضاح بود» — مدل متحرک بر اساس تصویر آپلودی کاربر (ChatGPT Image Sep 3) + صحنه‌های الکترون جدید.

Work Log:
- New shared SVG pieces in scenes.tsx: Electron (blue dot with − + animateMotion, negative-begin = no start pile-up), ElectronsOnPath, Tag (handout-style green pill), Pointer (dashed line + blue dot).
- NEW WireAnatomyScene ('wire-anatomy'): animated model of the user's uploaded handout image — blue title pill «سیم برق چیست؟», yellow one-line definition, copper strand bundle (8 rods + round cut ends) with electrons flowing inside (clipped), white insulator tube, red outer cover, 3 color-coded tags + dashed pointers (مس/عایق/روکش), pink «یادت باشد» tip box with 💡. All labels bilingual.
- REWROTE ElectronFlowScene: real-looking circuit — battery (push pulse ring) + glowing LED + red/dark jumper-style curved wires; 9 electrons (−) travel the full loop through wires/LED/battery; magnifier zoom bubble «داخلِ سیم» showing copper band + moving electrons, dashed link to the wire.
- IMPROVED WireZoomScene (l0-2): copper gradient band + fixed atoms («هیچ‌وقت جابه‌جا نمی‌شوند») + electrons walking past them.
- SimpleLoopScene (l0-8): orange dots → blue electrons on the closed loop path.
- BUG FIX: FLOW_CAPTIONS was missing 'current running inside a wire' → l0-4 animation screen showed raw ENGLISH caption in fa mode. Added bilingual caption.
- level0.ts l0-4: explain scene wire-zoom→wire-anatomy; animation body now points at the blue electrons (fa+en).
- Verified: vitest 21/21, eslint clean, agent-browser E2E — l0-4 explain (wire-anatomy renders handout-style), l0-4 animation (circuit + electrons + fa caption «جریان برق داخلِ سیم در حال دویدن است»), l0-2 explain+animation, l0-8 loop; zero console errors.
- Screenshots: download/screenshots/wire-anatomy-explain.png, wire-electron-flow.png, wire-zoom-l0-2.png, electron-river-l0-2.png, simple-loop-l0-8-s1b.png.

Stage Summary:
- Wire + electron visuals now match the handout standard: 3-layer wire anatomy with tags, electrons as blue − particles inside copper and inside a real circuit.
- User may still want a raster/AI-generated poster variant of the wire image inside the lesson — PNG kept at upload/ for possible direct embedding next.

---
Task ID: 8 (گام — بازطراحی صفحهٔ اصلی برای کودکان ۶ تا ۱۲ سال)
Agent: main (Super Z)
Task: بازطراحی HOME طبق بریف کاربر — حفظ ساختار و هویت فعلی، بار شناختی کمتر، گیمیفیکیشن واقعی، Mascot، نقشهٔ مسیر، دکمه‌های واضح.

Work Log:
- NEW Mascot component (src/components/mascot/Mascot.tsx): ربات دوستانهٔ فیروزه‌ای با چشم‌های بزرگ، پلک‌زدن، دست تکان‌دهنده و آنتنِ درخشان؛ احترام به تنظیم motion.
- HEADER: «⭐ سطح ۱ — جرقه‌زن» (1-indexed) + «⭐ ۰ / ۲۰۰ XP» + نوار طلایی + «✨ {xp} XP تا سطح بعد!».
- SAFETY: بنر کوتاه دوستانه با Mascot و حبابِ گفتگو («قهرمان مدار، یادت نره!» + پریز ممنوع همچنان صریح).
- NEW «🗺️ مسیر من»: نقشهٔ عمودی ۵ ایستگاه (۳ سطح واقعی + 🤖 ربات‌ساز + 🏆 استاد الکترونیک قفل)؛ ایستگاه فعلی با نبض (cq-path-pulse) + 📍اینجا هستی! + مینی‌پروگرس؛ اتصال‌خط چین سبز برای مراحل تمام‌شده.
- CONTINUE card: نوار عنوان فیروزه‌ای + «درس {a} از {b}» + ⏱ + مینی‌پروگرس + دکمهٔ بزرگ «▶ ادامه بده».
- CHALLENGE card: عنوان کوتاه‌تر (چالش امروز) +brief یک‌خطی + SVG مدارِ درخشان + چیپ طلایی 🎯+۵۰XP + دکمهٔ گرد طلایی «شروع چالش ←» (جهت‌آگاه RTL/LTR).
- PROJECT card: FlashlightArt SVG کارتونی + معادلهٔ قطعه‌ها 🔋+💡+🔌→🔦 + 🧩۴ قطعه/⏱۱۵ دقیقه/⭐سختی (از levelId) + دکمهٔ «بسازش!».
- BADGES: مدال‌های طلایی با حلقهٔ کهربایی و سایهٔ ملایم برای کسب‌شده‌ها؛ قفل‌ها: خاکستری+خط‌چین+🔒+ راهنمای تک‌خطی؛ حالت خالی با Mascot تشویق‌گر.
- TAB BAR: آیکون آزمایش‌ها FlaskConical→CircuitBoard؛ برچسب fa «آزمایش‌ها».
- i18n: ۱۷ کلید جدید fa/en (home.xpOf, safetyTitle/Body, path*, lessonOf, go, xpReward, startChallenge, buildIt, parts, easy/medium/hard) + بازنویسی عنوان سطح‌ها (جرقه‌زن…استاد الکترونیک) + xpToNext با «!».
- globals.css: keyframes cq-path-pulse.
- Fixed TS18047 (nextLesson closure narrowing). tsc/eslint clean on changed files; vitest 21/21; no console errors; E2E screenshots: home-redesign-full/vp1/vp2/vp3.png.

Stage Summary:
- Home now answers «کجاییم؟/چیکار کنم؟/چه می‌گیرم؟» در چند ثانیه؛ رنگ‌ها معنادار (فیروزه‌ای=یادگیری، بنفش=چالش، طلایی=جایزه/اقدام).
- Next candidates: react به XP/badge با انیمیشن Mascot، نسخهٔ انگلیسی چک شود، بقیهٔ صفحات هماهنگ شوند.

---
Task ID: 9 (گام — تبدیل صفحهٔ اول درس «الکترونیک چیست؟» به تجربهٔ کشف تعاملی)
Agent: main (Super Z)
Task: بازطراحی صفحهٔ اول درس l0-1 طبق بریف کاربر — حفظ هویت بصری، حس «باز کردن وسایل و کشف قطعات»، Exploded View تعاملی، Mascot، مأموریت کشف با XP.

Work Log:
- NEW screen type: `{ type: 'discovery' }` در Screen union (content/types.ts) + case در LessonPlayer → `<DeviceDiscovery lessonId>`.
- NEW src/components/lesson/device-art.tsx: ۵ وسیلهٔ کارتونی SVG (گوشی/ماشین/کنسول/زنگ/ربات) با سبک Flat+Soft3D و خط دور دوستانه + نشان برق کوچک روی هر وسیله.
- NEW src/components/lesson/part-art.tsx: کتابخانهٔ ۱۵ قطعهٔ SVG (battery/board/chip/screen/camera/speaker/motor/wires/lamp/control/dpad/bell/key/sensor/plugs).
- NEW src/components/lesson/DeviceDiscovery.tsx: صفحه = سؤال کنجکاوی → ۵ کارت وسیله (grid-cols-5) روی مسیر PCB کودکانه (PcbTrace: traceهای فیروزه‌ای + pad + سیلیکون تزئینی + الکترون متحرک) → مأموریت کشف (نقطه‌ها + شمارنده) → متن کوتاه درس + ۴ چید نتیجه → CTA کهربایی بزرگ (باز می‌کند وسیلهٔ کشف‌نشدهٔ بعدی) → می‌دونستی؟.
- Exploded View overlay: مرحلهٔ بسته (زوم + «داره بازش می‌کنیم…») → بدنهٔ بازشده (دو نیمه با spring جدا می‌شوند + جرقه) → نردبان زیگزاگی قطعات با اسپاین خط‌چین + pad + الکترون؛ هر قطعه: hit-area بزرگ، pill اسم، حالت انتخاب (قاب کهربایی خط‌چین + dim بقیه) → کارت آبی توضیح کوتاه. Mascot در فوتر با حباب ۳ حالته (وای! → روی هر قطعه بزن → آفرین!). دکمهٔ «✕ برگشت»، قفل اسکرول body، احترام به تنظیم motion (instant exploded).
- progress store: `discoveries` (lessonId:deviceId→ts) + `discoveryXp` + اکشن‌های discoverDevice/awardDiscoveryXp؛ XP مأموریت (+۵۰) فقط یک‌بار بعد از کشف هر ۵ وسیله (useEffect در کامپوننت). رفع باگ pre-existing TS در checkBadges (set updater → partial).
- i18n: ۲۶ کلید جدید discovery.* در fa.ts و en.ts (سؤال، مأموریت، شمارنده با رقم فارسی خودکار، CTA، می‌دونستی، حباب‌های Mascot…). نام وسیله‌ها/قطعه‌ها و توضیحات LocaleText داخل کامپوننت (الگوی scenes).
- level0.ts l0-1: صفحهٔ explain (صحنهٔ everyday) → صفحهٔ discovery؛ بقیهٔ صفحات (انیمیشن/آزمونک/جایزه) دست‌نخورده.
- FIX رندر: CSS width/height روی <svg> تودرتو اعمال نمی‌شد → attrs صریح w={100} h={80} در PartArt. FIX bidi «+50 XP» → «+۵۰ امتیاز» با t('lesson.xpEarned'). اضافه: hit-area rect شفاف برای لمس راحت کودک، keyframe cq-wiggle برای 🔍.
- E2E (agent-browser): صفحهٔ اصلی fa (۰ از ۵) → کلیک گوشی → بسته/بازشده → انتخاب باتری (هایلایت+کارت+حباب) → برگشت (✓ سبز + ۱ از ۵ + persist در cq-progress) → کشف ۴ وسیلهٔ بعدی → ۵ از ۵ + 🏆 + xp=50 خودکار + discoveryXp[l0-1] → بعدی → صفحهٔ انیمیشن سالم → EN کامل (Back/Inside the Smartphone/Chip…) → reduce-motion (۶ قطعه بلافاصله) → دسکتاپ ۱۲۸۰ و موبایل ۴۲۰ → صفر خطای کنسول. lint پاک، ۲۱/۲۱ vitest.
- Screenshots: download/screenshots/disc-*.png (main/phone-exploded2/part-selected2/back-check/mission-trophy/en-part/reduced-motion/desktop-main/final-full).

Stage Summary:
- صفحهٔ اول درس از «متن + تصویر ثابت» به چرخهٔ «می‌بیند → کنجکاو → لمس → باز می‌شود → قطعه‌ها → مفهوم → XP → وسیلهٔ بعدی» تبدیل شد؛ هویت بصری (فیروزه‌ای/بنفش/زرد/آبی/قرمز، گرد، کارتونی) حفظ شد.
- EverydayScene در scenes.tsx دیگر توسط هیچ درسی استفاده نمی‌شود (نگه داشته شد؛ کاندید حذف در پاک‌سازی بعدی).
- ایده‌های بعدی: سروصدای باز شدن (وب‌آدیو)، نشانِ جدید «مهندس کنجکاو» در badges، اعمال همین الگوی کشف برای درس‌های معرفی قطعه.

---
Task ID: 10 (گام — بستهٔ انتقال کامل پروژه به لپ‌تاپ)
Agent: main (Super Z)
Task: ساخت یک ZIP قابل‌حمل از کل برنامه برای ادامهٔ کار با OpenCoder / GLM روی لپ‌تاپ کاربر

Work Log:
- ساخت فایل HANDOFF دوزبانه‌محور `AGENTS.md` در ریشه (فارسی): راهنمای اجرا از صفر، شناخت ۶۰ ثانیه‌ای پروژه، ساختار پوشه‌ها، وضعیت فعلی (۹ مرحلهٔ worklog)، ایده‌های صف بعد، ۸ قاعدهٔ طلایی برای ایجنت‌های AI، نکات ریز.
- افزودن `.env.example` با مسیر نسبی قابل‌حمل (file:./db/custom.db) چون .env سندباکس مسیر مطلق دارد.
- اسکریپت `scripts/make-zip.sh`: موقتاً .env را به مسیر نسبی تبدیل → zip → بازگردانی .env اصلی.
- ZIP نهایی: download/CircuitQuest-full-2026-09-05.zip (18M، 904 فایل، integrity OK).
- شامل: src کامل، .git (تاریخچهٔ ۶۶۶ آبجکت)، db/custom.db، bun.lock، همهٔ کانفیگ‌ها، AGENTS.md/ARCHITECTURE.md/worklog.md، اسکرین‌شات‌ها، upload (جزوه‌ها + تصویر مرجع)، .env با مسیر نسبی.
- مستثنی: node_modules (1.3G)، .next (136M)، skills/ و .zscripts/ (داخلی سندباکس)، tool-results، *.zip.
- تأیید: صفر فایل از پوشه‌های مستثنی در zip؛ ۱۱۴ فایل src و .git موجود؛ .env سندباکس دست‌نخورده بازگشت.

Stage Summary:
- بستهٔ انتقال آماده است؛ روی لپ‌تاپ فقط `bun install` (یا npm install) + `npx prisma generate` + `npm run db:push` + `npm run dev` کافی است.
- AGENTS.md نقطهٔ ورود ایجنت‌های AI (OpenCoder/GLM) روی لپ‌تاپ است؛ زنجیرهٔ دانش در ARCHITECTURE.md + worklog.md حفظ شده.

---
Task ID: 11 (گام — صدای تجربهٔ کشف + نشان «مهندس کنجکاو»)
Agent: main (Super Z)
Task: تکمیل دو آیتم صفِ کار Task 9: سروصدای باز شدن وسایل (WebAudio) و نشان جدید «مهندس کنجکاو» (قول بریف اولیه: 🏆 + ⭐۵۰XP حالا واقعاً مدال می‌گیرد)

Work Log:
- NEW src/lib/sfx.ts: کیت SFX کوچک WebAudio بدون فایل صوتی (همه سنتز می‌شوند): pop (تپ وسیله، sweep 460→830Hz)، open (پاکت‌بازشو sawtooth آهسته + آرپژ C6·E6·G6)، blip (انتخاب قطعه 880→1245Hz)، fanfare (آرپژ C5·E5·G5·C6 برای پایان مأموریت). درگاه صدا از settings.sound (خواندن vanilla از zustand)، resume خودکار AudioContext روی ژست کاربر، try/catch سراسری — هرگز کرش نمی‌کند.
- settings.ts: پیش‌فرض sound false → true (اپ کودکانه؛ سوییچ «افکت‌های صوتی» همچنان در تنظیمات). کاربران فعلی با تنظیم ذخیره‌شده دست‌نخورده می‌مانند.
- DeviceDiscovery.tsx: pop در openDevice، open در لحظهٔ باز شدن بدنه (750ms timeout؛ در reduce-motion بلافاصله هنگام mount)، blip در onSelect قطعه، fanfare در همان useEffect اعطای XP مأموریت.
- نشان «مهندس کنجکاو»: BadgeContext +discoveryMissions؛ ctx = تعداد lessonIdهایی که discoveryXp دارند (یعنی مأموریت کامل شده)؛ badge جدید id=curious-engineer، emoji 🧰، rule discoveryMissions>=1 — بعد از first-lesson درج شد. awardDiscoveryXp از قبل checkBadges را صدا می‌زند → اعطای خودکار و بازگشتی برای کاربران قدیمی در اولین رویداد بعدی.
- کارت قهرمان صفحهٔ کشف: چیپ طلایی «🧰 نشانِ «مهندس کنجکاو» گرفتی!» وقتی نشان باشد (discovery.badgeEarned — کلید جدید fa/en).
- E2E (agent-browser، localStorage تازه): تپ گوشی → بازشدن → انتخاب باتری → برگشت (۱ از ۵) → کنسول/ماشین/زنگ/ربات → ۵ از ۵ + 🏆 + ⭐+۵۰ امتیاز + چیپ 🧰 → store: xp=50، badges['curious-engineer'] ثبت، ۵ discovery؛ خانه: مدال 🧰 در «نشان‌های اخیر»؛ پروفایل: نشان کسب‌شده در گرید؛ EN: «Curious Engineer» سالم؛ تنظیمات: سوییچ صدا checked برای کاربر تازه. صفر خطای کنسول/صفحه؛ lint پاک؛ ۲۱/۲۱ vitest.
- Screenshots: download/screenshots/sfx-open-exploded.png، sfx-part-selected.png، sfx-mission-badge.png، sfx-home-badge.png، sfx-profile-badges.png.

Stage Summary:
- چرخهٔ کشف حالا کامل حسی است: ببین → لمس کن → بشنو (پاپ/بازشو/بلیپ/فانفار) → قطعه‌ها → مفهوم → XP → مدال 🧰 → وسیلهٔ بعدی. حجم صداها ≤0.07 و کوتاه — مناسب کودک.
- نکته: sfx قابل استفادهٔ مجدد در کل اپ است (مثلاً برای جواب آزمونک یا موفقیت آزمایشگاه).
- صف بعد: الگوی discovery برای درس‌های معرفی قطعه (باتری/سیم/LED/مقاومت/کلید)، ساده‌سازی L1-2، PWA/Capacitor.

---
Task ID: 12 (گام — تجربهٔ سه‌بعدی «کشف داخل ربات» با Zoom-XRay-Exploded)
Agent: main (Super Z)
Task: کلیک روی 🤖 ربات در صفحهٔ درس → نمای سه‌بعدی تعاملی واقعی (نه Mockup) طبق بریف کاربر؛ تصاویر مرجع آپلودی فقط به‌عنوان مرجع بصری مدل استفاده شد (در UI نمایش داده نشدند).

Work Log:
- پکیج‌ها: three@0.185 + @react-three/fiber@9.7 + @react-three/drei@10.7 + @types/three (سازگار React 19).
- NEW src/components/lesson/robot3d/parts-data.ts: ۶ قطعه (board/battery/motor/led/sensor/wires) با name/desc دوزبانه + موقعیت base (بسته) و open (منفجر) — بدون import سه‌بعدی تا chunk صحنه lazy بماند.
- NEW robot3d/Robot3DScene.tsx (default export برای dynamic ssr:false): مدل ربات کارتونی فیروزه‌ای از پریمیتیوها (RoundedBox/کپسول/کره) مطابق مرجع — سر گرد با چشم‌های سفید بزرگ + لبخند torus + آنتن زرد درخشان + گوش‌ها، تنه با پنل جلو/عقب، بازوهای کپسولی با شانه و دست، پاها + کفهٔ گرد، یقه.
  - زوم مرحله‌ای پیوسته از فاصلهٔ دوربین (OrbitControls dolly با wheel/pinch): reveal=smoothstep(5.6→3.2) شفاف‌شدن X-Ray بدنه، explode=smoothstep(3.6→2.55) جدا شدن لایه‌ها؛ هر دو LATCH (یک‌طرفه مثل جریان کشف مرجع، باز هم چرخش/زوم آزاد).
  - ۴ مرحله برای UI: ۰ بسته + «🔍 روی ربات زوم کن…»، ۱ «بیشتر زوم کن 👆»، ۲ «بدنه دارد باز می‌شود…»، ۳ «روی هر قطعه بزن…».
  - Exploded: سر بالا، پنل جلو پایین-جلو با چرخش -۰.۷rad (درِ باز)، بازوها به پهلو، قطعات در ردیف جلو بدون هم‌پوشانی (باتری زرد/مشکی افقی مطابق مرجع، برد سبز با تراشه و پین طلایی، موتور فلزی با شفت، LED گنبدی با پایه، سنسور چشمی، سیم‌های TubeGeometry قرمز/مشاه روی منحنی CatmullRom) + dolly سینمایی یک‌باره به d=6.0 و بالاتر رفتن target هنگام باز شدن کامل.
  - انتخاب قطعه: hit-sphere نامرئی بزرگ (مناسب انگشت کودک) + گارد tap-vs-drag (Δpointerdown>8px نادیده) + قطعه به سمت دوربین می‌آید (focus=cam+dir·clamp(d/2))، scale 1.28، emissive کهربایی نبضی، بقیه dim 0.25؛ onPointerMissed → لغو انتخاب.
  - Pills نام قطعه‌ها (drei Html، pointer-events none) فقط در نمای منفجر + ✓ سبز برای کشف‌شده‌ها؛ بدون فایل HDR/asset — نور Hemisphere+2 Directional + ContactShadows، کاملاً آفلاین.
- NEW robot3d/RobotDiscovery.tsx: اوورلی شیت (هم‌خانوادهٔ ExplodedOverlay): هدر (برگشت + «🤖 داخل ربات را کشف کن!» + چیپ «کشف: n از ۶»)، بوم سه‌بعدی، hint شناور مراحل ۰/۱، بنر 🏆 «ربات را کامل کشف کردی!» + ⭐+۵۰ امتیاز، فوتر (Mascot با ۳ حباب start/wow/tap + کارت آبی قطعهٔ انتخابی در فوتر — الگوی ۲بعدی؛ قابل‌اعتماد و RTL) + نوار hint. scene با next/dynamic ssr:false لود می‌شود.
- progress store: +robotParts (key=lessonId:partId) و +robotXp و اکشن‌های discoverRobotPart/awardRobotXp (XP یک‌بار per lesson + markActiveDay + checkBadges).
- DeviceDiscovery: شاخهٔ ربات → RobotDiscovery (بقیهٔ وسایل ۲بعدی می‌مانند)؛ discoverDevice قبلاً ✓ کارت ربات و شمارندهٔ ۵تایی را ثبت می‌کند.
- sfx: pop (باز کردن از قبل) + open (اولین X-Ray در مرحله ۲) + blip (انتخاب قطعه) + fanfare (۶/۶).
- i18n: ۱۲ کلید robot3d.* در fa/en.
- E2E (agent-browser): باز شدن ۳بعدی (canvas رندر، صفر خطا) → زوم سینتتیک WheelEvent روی canvas (۴ مرحله hint عوض شد) → X-Ray → انفجار کامل با pills → کلیک باتری (بیرون آمدن + Glow) → کلیک ۵ قطعهٔ دیگر → ۶/۶ + بنر 🏆 + ⭐+۵۰ → persist تأیید (۶ robotParts + robotXp[l0-1] + xp=50 + discoveries[l0-1:robot]) → drag rotate (چرخش واقعی دوربین) → موبایل ۳۹۰px (کامل) → کنسول: فقط هشدار deprecated THREE.Clock از داخل three (غیرمسدودکننده). lint پاک، ۲۱/۲۱ vitest.
- اصلاحات حین E2E: خروج قطعات به ردیف جلو (پنل دیگری می‌پوشاند)، tilt پنل -۰.۷، کارت توضیح از Html سه‌بعدی به فوتر منتقل شد (کلیپ‌شدن RTL حل شد)، انتخاب به wrapper منتقل (controlled)، رفع react-hooks/refs (نوشتن ref در render → useEffect).
- Screenshots: download/screenshots/robot3d-stage0-closed/stage1/stage2-xray/stage3-exploded/battery-focus/board-card/complete/rotated/mobile-stage0/mobile-exploded.png.

Stage Summary:
- تجربهٔ «کشف داخل ربات» کاملاً تعاملی و سه‌بعدی شد: بسته → زوم → X-Ray → Exploded → انتخاب → توضیح → 🏆+۵۰XP؛ دقیقاً چرخهٔ ۷ State بریف، واقعی و لمس‌پذیر. تصویر مرجع فقط الگوی ظاهری مدل شد و هیچ‌جا در UI نمایش/کپی نشد.
- الگوی صحنه (پریمیتیو + reveal پیوسته از زوم) برای وسیله‌های بعدی (ماشین/کنسول) هم قابل استفادهٔ مجدد است.
- صف بعد: همین الگو برای ماشین (کاپوت + موتور + باتری)، بهبود عنوان موبایل دوخطی، حذف هشدار THREE.Clock (صبر برای fix drei)، PWA/Capacitor.

---
Task ID: 13
Agent: main (Super Z)
Task: نسخهٔ واقعی‌سازیشدهٔ ربات سه‌بعدی — مطابق مراحل تصویر مرجع (ربات ۱ تا ۵) + قطعات الکترونیکی واقعی به‌جای کارتونی + کیفیت بالاتر رندر

Work Log:
- تصویر مرجع کاربر (upload/582a4bf6….jfif) فقط برای شناخت ظاهر/مراحل استفاده شد و هیچ‌جا در UI نمایش یا کپی نشد.
- Robot3DScene.tsx بازنویسی کامل (v2):
  * «ربات ۲» واقعی: به‌جای شبح‌کردن کل پوسته، حالا جل‌صندوقیِ واقعی است — تنه از ۵ پنل مجزا + آستر تیرهٔ داخلی (BackSide) ساخته شد و درِ جلو لولادار است که با زوم مثل پل باز می‌شود (hinge در لبهٔ پایین، rotation.x با reveal) و بعد محو می‌شود؛ بقیهٔ بدنهٔ مات می‌ماند (دقیقاً مثل تصویر مرجع).
  * قطعات واقعی (نه کارتونی): برد مدار با بافت Canvas رویه‌ای (FR4 سبز تیره + مس‌های ردزنی + ویاهای طلایی + ابریشکی CQ-R1/MCU/C3 + سوراخ‌های پیچ)، MCU با ۲۴ پین طلایی که هنگام انتخاب با نور کهربایی می‌درخشد (مثل ربات ۴ مرجع)، خازن الکترولیتی با کلاه استیل، کریستال کوارتز، پین‌هدر با پین‌های طلایی، مقاومت‌ها؛ باتری ۱۸۶۵۰ (غلاف آبی + نوار زرد + کلاه‌های استیل + باتون + براکت‌های هولدر)، موتور DC گیربکس‌دار (کان فلزی + بل سر + هوزینگ گیربکس با پیچ‌های استیل + شافت)، سنسور اولتراسونیک HC-SR04 (PCB آبی + دو کانال آلومینیومی)، LED پنج میلی‌متری (گنبد نیمه‌شفاف + پایه داخلی + فلنج + دو پایه)، سیم‌ها با هوزینگ دوشاخه.
  * «ربات ۵»: کال‌اوت‌های خط‌چین + برچسب RTL در دو ستون مطلق (چپ/راست) با فاصلهٔ عمودی تضمین‌شده؛ ✓ سبز روی قطعات کشف‌شده؛ در موبایل ستون‌ها جمع‌وجورتر (compact بر اساس عرض بوم).
  * کیفیت رندر: Environment رویه‌ای آفلاین با Lightformer (بدون HDR شبکه‌ای) برای انعکاس PBR فلزات، ACES tone mapping، dpr [1,1.6]، ContactShadows 256، smoothness بالاتر، هالهٔ نور additive (sprite) برای قطعهٔ انتخاب‌شده.
  * تعامل: shellها onClick با stopPropagation گرفتند تا قطعهٔ پنهان از پشت بدنه قابل انتخاب نباشد؛ موقعیت اولیهٔ shellها در JSX ست شد تا فریم اول بدون به‌هم‌ریختگی باشد؛ چیدمان exploded عمودی/افقی بازتر شد تا مثل ربات ۳ مرجع، قطعات با فاصلهٔ تمیز دیده شوند.
- parts-data.ts: پایه/بازشدن جدید قطعات (board/battery/motor/led/sensor/wires) برای فضای داخلی واقعی و پشتهٔ انفجاری تمیز.
- RobotDiscovery.tsx: sfx.open در اولین ورود به مرحلهٔ ۲ (بازشدن درِ جل‌صندوقی).
- E2E (agent-browser): بستهٔ زیبا → زوم (WheelEvent سینتتیک) → بازشدن در جلو + «وای! 😮» → انفجار کامل با کال‌اوت‌های شش‌گانه → فوکوس برد با MCU طلایی درخشان + کارت فوتر → کلیک شش قطعه → ۶/۶ + 🏆 + ⭐+۵۰ (persist تأیید: ۶ robotParts + robotXp[l0-1] + xp=50) → درگ چرخش → موبایل ۳۹۰px کامل → lint پاک، ۲۱/۲۱ vitest.
- نکتهٔ فنی مهم: در تَبِ هدلس، rAF به‌شدت throttle می‌شود و انیمیشن‌ها کند دیده می‌شوند (مشکل تست است نه محصول)؛ یک‌بار «Context Lost» WebGL در جلسهٔ طولانی هدلس رخ داد که با کاهش dpr/سایه و بارگذاری تازه برطرف شد — روی GPU واقعی محتمل نیست. اسکرین‌شات‌های نهایی: download/screenshots/r3-v2-*.png (۱۳ عکس از هر ۵ مرحلهٔ تصویر مرجع + موبایل + چرخش).

Stage Summary:
- تجربهٔ «داخل ربات» حالا دقیقاً ۵ مرحلهٔ تصویر مرجع را دارد: ربات ۱ (بسته) → ۲ (بازشدن واقعی در و دیدن قطعات داخل بدنه) → ۳ (انفجار پشته‌ای تمیز) → ۴ (فوکوس قطعه با درخشش MCU و کارت توضیح) → ۵ (خطوط راهنما + برچسب‌ها). قطعات داخلی واقعی و لمس‌پذیر شدند و کیفیت رندر بالا رفت.
- قدم بعدی صف‌شده: همین الگو برای ماشین/کنسول، حذف هشدار THREE.Clock، PWA/Capacitor.

---
Task ID: 14
Agent: main (Super Z)
Task: بستهٔ انتقال به‌روزشده (Task 10→14) + پاسخ به سؤال کاربر دربارهٔ زبان برنامه

Work Log:
- AGENTS.md به‌روزرسانی شد به وضعیت Task 13: جدول فناوری (three.js/sfx)، ساختار پوشه (robot3d)، وضعیت فعلی (کشف سه‌بعدی + نسخهٔ واقعی ربات)، صف بعد جدید، قواعد طلایی ۹–۱۱ (سه‌بعدی/ssr:false/بدون asset شبکه‌ای/تصویر مرجع ممنوع در UI، صدا فقط sfx.ts، ذخیرهٔ پیشرفت robotParts) و استثنای «قطعات واقعی‌نما» در قاعدهٔ هویت بصری.
- ZIP تازه با scripts/make-zip.sh ساخته شد: download/CircuitQuest-full-2026-09-11.zip (45MB، ۱۰۷۳ فایل، integrity OK).
- تأیید محتوا: robot3d/*، sfx.ts، .git/HEAD، فونت‌های Vazirmatn، ۱۳ اسکرین‌شات r3-v2، worklog (۱۳ تسک)، db/custom.db، .env با مسیر نسبی file:./db/custom.db (سندباکس سالم بازگشت).
- ZIP قدیمی ۲۰۲۶-۰۹-۰۵ (فاقد Task 11–13) حذف شد تا کاربر اشتباهاً نسخهٔ عقب را نگیرد.

Stage Summary:
- بستهٔ انتقال اکنون کامل و هم‌گام با آخرین وضعیت (ربات سه‌بعدی واقعی‌سازی‌شده) است؛ روی لپ‌تاپ: bun install (یا npm install) → npx prisma generate → npm run db:push → npm run dev.
- نقطهٔ ورود ایجنت AI روی لپ‌تاپ: AGENTS.md (فارسی).

---
Task ID: 15
Agent: main (Super Z)
Task: تصمیم کاربر — حذف کامل حالت سه‌بعدی ربات؛ جایگزینی آینده با صفحه‌های مصور ZIP مرجع (در انتظار دسترسی فایل) + واقعی‌سازی ۵ تصویر وسیله‌ها

Work Log:
- تلاش دانلود ZIP گوگل‌درایو کاربر (id=1rBp-rk8…) → HTTP 401 / صفحهٔ ورود گوگل؛ فایل «با هر کسی که لینک را دارد» به اشتراک گذاشته نشده است. به کاربر اطلاع داده شد تنظیم اشتراک را عوض کند. فایل تلاشی در upload/user-ref.zip ذخیره شد (HTML خطا؛ پاک شدنی).
- حذف کامل ۳بعدی (طبق تصمیم قطعی کاربر، مستقل از ZIP):
  * DeviceDiscovery.tsx: شاخهٔ robot→RobotDiscovery حذف شد؛ ربات حالا مثل بقیهٔ وسایل از ExplodedOverlay دوبعدی استفاده می‌کند.
  * پوشهٔ src/components/lesson/robot3d/ (Robot3DScene/RobotDiscovery/parts-data) حذف شد.
  * progress.ts: robotParts/robotXp + discoverRobotPart/awardRobotXp حذف شد (persist قدیمی بی‌ضرر نادیده گرفته می‌شود).
  * i18n fa/en: ۱۱ کلید robot3d.* حذف شد.
  * package.json/bun.lock: three + @react-three/fiber + @react-three/drei + @types/three حذف شدند (bun remove).
- تأیید: tsc روی کد اپ پاک (فقط خطاهای pre-existing engine/sandbox)، eslint پاک، vitest ۲۱/۲۱.
- E2E دودی: درس l0-1 → صفحهٔ کشف → کلیک ربات → نمای انفجاری دوبعدی سالم (برگشت/قطعات/بدون خطای کنسول). اسکرین‌شات: download/screenshots/task15-robot-2d-exploded.png.

Stage Summary:
- اپ سبک‌تر شد (بدون three.js ~۱.۲MB)؛ ربات دوباره مثل ۴ وسیلهٔ دیگر دوبعدی است.
- منتظر: ZIP مرجع کاربر (صفحه‌های مصور هر وسیله + ۵ تصویر واقعی وسیله‌ها) برای ساخت صفحه‌های جدید جایگزین.

---
Task ID: 16
Agent: main (Super Z)
Task: جایگزینی تجربهٔ کشف با «صفحه‌های مصور» مطابق ۵ تصویر مرجع کاربر (گوشی/کنسول/ربات/ماشین/زنگ) — حذف نهایی ۳بعدی + واقعی‌سازی ۵ کارت وسیله

Work Log:
- ZIP/RAR مرجع کاربر از گوگل‌درایو دانلود شد (پس از عمومی‌کردن اشتراک؛ ۸.۷MB RAR) و در upload/ref-pages/elec استخراج شد: ۵ صفحهٔ طراحی‌شده (گوشی، کنسول، ربات، ماشین، زنگ الکتریکی).
- برش دارایی‌ها با scripts/ref-crops.py (PIL، مختصات‌یابی با grid overlay): ۱۵ نمای وسیله (کامل/داخلی/انفجاری ×۵) + ۳۳ عکس قطعه واقعی → public/ref/** (۴.۷MB). دو دور اصلاح (حذف برچسب‌های سبز بالای نماها + لبه‌های کارت مجاور). contact sheet QA در tool-results/crops/.
- دادهٔ جدید device-pages-data.ts: ۵ وسیله × (۳ نما + ۳۴ قطعهٔ دوزبانه با emoji/عکس/توضیح کودکانه). فیلد photo تایپ‌شده. استثنا: بدنه و قاب گوشی از full.png استفاده می‌کند (در ردیف قطعات مرجع نبود).
- DeviceDiscovery.tsx بازنویسی کامل: کارت‌های صفحهٔ اول حالا عکس واقعی وسیله‌ها (aspect-square + object-contain)؛ ExplodedOverlay/NamePill/PartArt/DeviceClosedArt حذف؛ PcbTrace حفظ شد.
- DevicePageOverlay جدید مطابق مرجع: هدر (برگشت + «داخل {name} را کشف کن!» + چیپ «کشف: n از m»)؛ هیرو سه‌نما کنارهم با pill سبز «نمای کامل/داخلی/انفجاری» (موبایل: snap-x)؛ سایدبار «قطعات {name}» فقط دسکتاپ (کلیک → اسکرول به کارت + انتخاب)؛ ردیف کارت‌های قطعه با عکس/نام/توضیح — لمس → ✓ سبز + blip + شمارنده/نقطه‌ها/نوار پیشرفت؛ همه پیدا شوند → بنر 🏆 + fanfare؛ فوتر: Mascot (۳ حباب بر اساس پیشرفت) + پنل «قطعات کشف‌شده» + CTA کهربایی «آماده ادامه» (دسکتاپ ستونی، موبایل ردیفی).
- progress store: +devicePartFinds (کلید lessonId:deviceId:partId) + findDevicePart — مأموریت/XP/نشان ۲بعدی قبلی دست‌نخورده.
- i18n: ۱۳ کلید devicePage.* در fa/en.
- فیکس‌ها: fanfare از setState-in-effect به tapPart منتقل (react-hooks/set-state-in-effect)؛ disableهای بی‌استفاده حذف؛ کلید chip پیشرفت اصلاح؛ xs: breakpoint ناموجود حذف.
- E2E (agent-browser): صفحهٔ اصلی با ۵ عکس واقعی → صفحهٔ گوشی (ساختار کامل) → لمس ۸ قطعه (UI + persist ۸ devicePartFinds) → ۸/۸ + بنر → برگشت ✓ → ۴ وسیلهٔ دیگر با تپ انبوه سایدبار → ۵/۵ + 🏆 + xp=50 + نشان curious-engineer → صفحهٔ ربات با قطعات واقعی → موبایل ۳۹۰px + EN کامل → عکس case فیکس شد (404 → full.png) → صفر خطای کنسول. lint پاک، tsc اپ پاک، ۲۱/۲۱ vitest.
- Screenshots: download/screenshots/task16-*.png (main-realistic / phone-page / phone-complete / mission-complete / robot-parts / mobile-en-phone / mobile-en-fixed).

Stage Summary:
- تجربهٔ کشف حالا دقیقاً همان صفحه‌های مصور مرجع کاربر است: عکس واقعی وسیله در کارت، صفحهٔ سه‌نما + کارت‌های قطعهٔ واقعی + Mascot + مأموریت؛ بدون three.js و بدون آرت کارتونی در این بخش.
- نکته: تصاویر مرجع کاربر فقط به‌عنوان منبع برش asset استفاده شدند (طراحی صفحه با HTML/CSS خود اپ بازسازی شد تا دوزبانه/RTL/قابل‌تعامل بماند).
- صف بعد: PWA/Capacitor، اعمال الگوی کشف به درس‌های قطعه‌ها، ساده‌سازی L1-2.

---
Task ID: 17
Agent: main (Super Z)
Task: رفع سراسری مشکل چیدمان تصاویر در کل سیستم Device Discovery — قاب تصویر مشترک برای همهٔ وسیله‌ها/قطعه‌ها (بدون تغییر هویت بصری و تعامل‌ها)

Work Log:
- تشخیص با E2E واقعی (اسکرین‌شات قبل از رفع، ۵ وسیله × دسکتاپ/موبایل): (۱) کارت‌های سه‌نما به ارتفاع سایدبار قطعات کشیده می‌شدند (stretch در flex) → ~۳۰۰px فضای مرده زیر هر عکس؛ (۲) قرصِ برچسب نماها روی خود تصویر overlay بود و سرِ ربات/قطعه‌ها را می‌پوشاند؛ (۳) ارتفاع‌های پیکسلی ثابت (h-40/h-44/h-52 و h-24/h-28) + نسبت‌های تصویر ۰٫۷۱–۱٫۵۶ → انداز بصری ناهماهنگ بین وسیله‌ها؛ (۴) چند برش asset، نوار/چیپ سبز کارت مجاور صفحهٔ مرجع را همراه خود داشتند (bell/full، phone/full، robot/full، phone/internal، car parts×۵، console/screen، robot/board، bell/case)؛ (۵) هر نقطهٔ رندر CSS خودش را داشت → ناسازگاری ساختاری.
- NEW src/components/lesson/DeviceImageContainer.tsx — تنها قاب تصویر سیستم کشف: باکس نسبت‌ثابت با CSS aspect-ratio (IMG_RATIO.view=۴/۳ برای سه‌نما، IMG_RATIO.square=۱/۱ برای قطعه/بندانگشت/کارت خانه)، img مطلق inset-0 با object-contain (کامل، وسط‌چین H+V، بدون کشش/برش/سرریز)، پرِ استاندارد (none/xs/sm/md)، overflow-hidden، کاملاً واکنش‌گرا (اندازه از عرض والد؛ صفر مختصات پیکسلی وسیله‌محور).
- DeviceDiscovery.tsx — هر ۵ نقطهٔ رندر روی قاب مشترک: ViewCard بازنویسی شد (کارت flex-col؛ تصویر در قاب ۴/۳ + نوار زیرنویس فیروزه‌ای زیر عکس — برچسب دیگر هرگز روی تصویر نمی‌افتد)؛ ردیف هیرو با items-start + سایدبار lg:max-h-[248px] با اسکرول داخلی (کارت‌ها دیگر با سایدبار کشیده نمی‌شوند)؛ بندانگشت‌های سایدبار w-7 با قاب ۱/۱؛ کارت‌های قطعه با باکس مربع ۱/۱ (چرخ/باتری/PCB همه کامل و هم‌مقیاس)؛ کارت‌های خانهٔ ۵ وسیله با قاب ۱/۱.
- پاک‌سازی asset (بدون دست زدن به خودِ اشیا): سه اسکریپت — strip-profiler/edge-visualizer (عیب‌یابی)، fix-ref-junk.py + fix-ref-junk2.py (پرکردن ناحیه‌ای چیپ‌های سبز با نمونهٔ bg وارسی‌شده)، fix-ref-junk3.py (پاک‌ساز مؤلفه‌محور: فقط اجزای متصلِ کاملاً محصور در حلقهٔ ۲۶px لبه و کوچک‌تر از ۲۶۰۰px حذف می‌شوند — قطعات اصلی که به داخل کشیده می‌شوند با این ساختار محافظت می‌شوند؛ با diff گیت و شیت مقایسه‌ای تأیید شد هیچ جزء واقعی حذف نشده، فقط لبه‌های کارت مجاور/چیپ‌ها). نگاشت عکس↔قطعه در device-pages-data.ts هم بازبینی شد (همه درست؛ استثنای مستند case گوشی از full.png).
- E2E بعد از رفع (agent-browser): دسکتاپ ۱۲۸۰ و موبایل ۳۹۰ برای هر ۵ وسیله — سه‌نما هم‌ارتفاع/کامل/وسط‌چین، بدون فضای مرده، بدون همپوشانی برچسب؛ لمس قطعه (✓+رینگ+شمارنده+نوار)، پرش سایدبار، تکمیل ۸/۸ با بنر 🎉 + حباب Mascot؛ مأموریت ۵/۵ + ⭐۵۰ + نشان 🧰 سالم؛ صفر خطا/هشدار کنسول. lint پاک؛ tsc کد اپ پاک (خطای قدیمی registry.ts دست‌نخورده)؛ vitest ۲۱/۲۱.
- Screenshots: download/screenshots/task17-after-{home,robot,console,car,bell,phone,robot-mobile}.png (قبل‌ها: diag-before-*.png برای مقایسه).

Stage Summary:
- چیدمان تصویر حالا یک قرارداد سیستم است نه CSS پراکنده: وسیلهٔ پنجم، ششم و… به‌طور خودکار همان هندسهٔ سه‌نما/قطعه را می‌گیرند؛ تنها کافی است در device-pages-data.ts ثبت شوند.
- هیچ قابلیتی تغییر نکرد: کشف، سه‌نماها، انتخاب قطعه، توضیح‌ها، پیشرفت، XP/نشان، RTL، ناوبری و ظاهر همان است؛ فقط قاب تصویر درست شد. (۳بعدی طبق تصمیم قبلی کاربر در Task 15 حذف شده و در این تسک تغییری نکرده.)
- صف بعد: الگوی کشف برای درس‌های قطعه‌ها، ساده‌سازی L1-2، PWA/Capacitor.

---
Task ID: 18
Agent: main (Super Z)
Task: جایگزینی تصاویر بد برش‌خوردهٔ قطعه‌ها با برش‌های دستی کاربر (ZIP گوگل‌درایو) + بازی مینی «تار تا لمس کنی» برای نام/توضیح قطعه‌ها

Work Log:
- ZIP/RAR کاربر (2.5MB) از لینک گوگل‌درایو دانلود و استخراج شد: ۵ پوشهٔ فارسی (ربات/زنگ/ماشین/کنسول/گوشی) = ۳۳ کارت کامل برش‌خورده توسط خود کاربر (عکس + نام + توضیح در قاب کارت).
- نگاشت بصری ۳۳ فایل با شیت‌های مقایسه‌ای (tool-results/user-parts-sheets/) به شناسه‌های قطعه در device-pages-data.ts انجام شد — تعدادها دقیقاً ۱:۱ (ربات ۷، زنگ ۷، ماشین ۶، کنسول ۶، گوشی ۷ + قاب از full.png).
- scripts/analyze-user-parts.py + find-name-rows.py: چون پس‌زمینهٔ کارت گرادیانی است، تحلیل تک‌مرحله‌ای شکست خورد؛ راه‌حل: میانهٔ هر سطر به‌عنوان bg + تشخیص «سطر نام» از طریق آیکون فیروزه‌ای کنار نام (گروه‌های سطری teal، ادغام شکاف ≤۱۵px، آخرین گروه = سطر نام). برای هر ۳۳ تصویر یک گروه نام پیدا شد.
- scripts/extract-user-part-photos.py: از هر کارت فقط ناحیهٔ عکس (بالای سطر نام − ۶px) جدا، لبه‌های ۴px (حاشیهٔ کارت/گوشه‌های گرد) حذف، bbox-trim با پد ۶px و ذخیره در public/ref/{dev}/parts/{id}.png (مسیرها بدون تغییر → صفر تغییر در data). نسخهٔ قبلی در upload/old-parts-backup بکاپ شد. شیت‌های installed-*.png برای QA بصری: همهٔ اشیا کامل، بدون متن، بدون حاشیهٔ کارت همسایه.
- DeviceDiscovery.tsx — حالت تار/نمایان: state جدید revealed (Set از pidها)؛ tapPart هر لمس/کلیک کارت (و پرش از سایدبار) را به revealed اضافه می‌کند. سطر نام (ایموجی+نام) و پاراگراف توضیح تا قبل از لمس blur-[5px] + opacity-70 + select-none، پس از لمس blur-0 با transition ۳۰۰ms. aria-label کارت همچنان نام+توضیح کامل است (دسترس‌پذیری سالم)؛ aria-hidden روی متن تار.
- دست‌نخورده‌ها: نمای full/internal/exploded، سایدبار (نام‌ها آنجا نمایان می‌ماند — ایندکس)، مأموریت/XP/نشان، پیشرفت، RTL، ناوبری، طراحی کارت‌ها.
- E2E (agent-browser): دسکتاپ ۱۲۸۰ — هر ۵ وسیله: کارت‌ها تار شروع می‌شوند، لمس → متن واضح + حلقهٔ کهربایی + ✓ سایدبار (ربات/LED، گوشی/باتری، کنسول/باتری، ماشین/باتری، زنگ/باتری)؛ موبایل ۳۹۰ — ربات لمس+نمایان، اسنپ‌اسکرول سالم؛ EN (localStorage cq-settings.language=en) — متن انگلیسی تار→نمایان درست؛ صفر خطای کنسول/صفحه. tsc اپ پاک (فقط خطاهای قدیمی examples/skills/registry.ts)، eslint پاک، vitest ۲۱/۲۱.
- Screenshots: download/screenshots/task18-*.png (home / robot-blurred / robot-led-revealed / phone-battery-revealed / console-battery-revealed / car-battery-revealed / bell-battery-revealed / mobile-robot / mobile-robot-revealed / mobile-en-robot / mobile-en-revealed).

Stage Summary:
- تصاویر قطعه‌ها حالا دقیقاً برش‌های دستی خود کاربر است: هر عکس کامل، وسط‌چین، بدون بریدگی — در همان قاب مشترک DeviceImageContainer (Task 17) بدون هیچ هک وسیله‌محور.
- تعامل جدید طبق درخواست کاربر: نوشتهٔ نام/توضیح هر قطعه تار است و با کلیک/لمس همان کارت به‌نرمی نمایان می‌شود (بازی حدس زدن برای کودک؛ لمس دوباره چیزی را مخفی نمی‌کند، وضعیت ✓ و پیشرفت دست‌نخورده است).
- نکته: متن داخل تصاویر کارت‌های کاربر به عکس‌ها چسبیده بود؛ ناحیهٔ عکس بدون متن استخراج شد تا حالت دوزبانه (فا/en) و HTML موجود حفظ شود — متن توضیح همچنان از دیتای دوزبانهٔ اپ رندر می‌شود.

---
Task ID: 19
Agent: main (Super Z)
Task: بازطراحی کامل محتوای درس «الکترونیک چیست؟» از اسلاید ۲ تا ۱۰ — سند محتوا و ساختار آموزشی (بدون تغییر کد/Asset)

Work Log:
- کاربر درخواست کرد اسلاید دوم فعلی («کارکردن برق را ببین» با انیمیشن electron-flow) به‌کلی کنار گذاشته شود (محتوایش متعلق به درس «برق چیست» است) و مسیر آموزشی از اسلاید ۲ به بعد از صفر طراحی شود؛ تصاویر بعداً خودش می‌سازد و فعلاً فقط محتوا + پیشنهاد تصویر می‌خواهد.
- تحلیل ساختار فعلی l0-1 در src/content/levels/level0.ts: screens = discovery / animation(کارکردن برق) / quiz / reward — اسلاید اول (کشف ۵ وسیله) و quiz/reward خارج از دامنهٔ بازطراحی‌اند.
- نقش «معلم ابتدایی» و نوشتن ۹ اسلاید جدید (۲ تا ۱۰) با اصل بار شناختی (یک مفهوم در هر اسلاید): الکترونیک همه‌جا هست! / پس الکترونیک چیست؟ / الکترونیک در زندگی ما / داخل وسیله چه خبر است؟ / قطعات با هم کار می‌کنند / مدار چیست؟ / وقتی مدار کامل باشد / کدام مدار روشن می‌کند (بازی) / حالا یک قدم جلوتر (پل به درس بعدی). هر اسلاید: هدف، متن نهایی قابل نمایش، پیشنهاد تصویر، متن روی تصویر، تعامل، پل به بعدی. مفهوم «انرژی» بدون اسلاید جداگانه در اسلایدهای ۶ و ۹ پوشش داده شد (توجیه در سند).
- سند Word فارسی RTL ساخته شد: scripts/lesson-doc-helpers.js + lesson-doc-slides-a.js + lesson-doc-slides-b.js + gen-lesson-redesign-docx.js (کتابخانه docx) — جلد R4 (Top Color Block) با پالت DM-1 و تطبیق RTL (پدهای متقارن، پاراگراف bidi، start-alignment، شمارش عنوان فارسی pt×11)، سه سکشن (جلد بدون شماره / فهرست با اعداد رومی / متن با اعداد عربی از ۱)، TOC + hint + PageBreak، جدول RTL «پوشش اهداف» (visuallyRightToLeft)، کارت‌های خاکستری‌فیروزه‌ای برای متن‌های قابل نمایش، فونت Tahoma با sizeComplexScript/rightToLeft در همهٔ runها.
- پس‌پردازش: add_toc_placeholders.py --auto (exit 0) + scripts/patch-lesson-docx.py (حذف pgNumType خالی + پچ instrText فوترها: Roman/arabic بر اساس نگاشت sectPr→rels) + postcheck.py = 0 خطا (۱ هشدار مجاز: PageBreak انتهای فهرست که طبق راهنمای TOC الزامی است).
- بازبینی بصری PDF (LibreOffice): جلد/فهرست/متن/جدول سالم و RTL؛ tofuهای محدود فقط artifact فونت Tahoma-نبودن در این محیط لینوکسی است (لایهٔ متنی سند سالم است؛ در Word کاربر Tahoma بومی است) — به همین دلیل فهرست مسیر از bullet به خطوط سادهٔ لیستی تبدیل شد و ایموجی از پاراگراف‌های توصیح حذف (در متن‌های قابل نمایش کودک حفظ شد).
- هیچ تغییری در کد اپ/محتوا/Asset ایجاد نشد؛ خروجی: download/lesson-redesign-l0-1-fa.docx (۱۱ صفحه).

Stage Summary:
- سند بازطراحی آمادهٔ بازبینی کاربر است: متن نهایی ۹ اسلاید + پیشنهاد تصویر هر اسلاید + تعامل‌ها + نقشهٔ مسیر + جدول پوشش ۶ هدف آموزشی اعلام‌شده.
- گام بعد پس از تأیید کاربر: طراحی تصاویر طبق پیشنهادها، سپس پیاده‌سازی اسلایدها در ساختار screens درس l0-1 (حذف اسلاید فعلی دوم و درج ۹ اسلاید جدید + اتصال تعامل‌ها).

---
Task ID: 20
Agent: main (Super Z)
Task: پیاده‌سازی بازطراحی درس «الکترونیک چیست؟» (l0-1) در اپ — حذف اسلاید دوم (انیمیشن «کارکردن برق را ببین») و ساخت اسلایدهای جدید از توضیحات کاربر (شروع از «اسلاید سه» سند؛ بدون اسلاید مستقل «مدار چیست؟»)

Work Log:
- طبق دستور کاربر: صفحه «کارکردن برق را ببین» (electron-flow، متعلق به درس «برق چیست») از l0-1 حذف شد؛ محتوای جدید از بخش «اسلاید سه» توضیحات کاربر ساخته شد («الکترونیک همه‌جا هست!» ساخته نشد — کار آن را صفحه کشف وسیله‌ها بر عهده دارد) و اسلاید «مدار چیست؟» طبق قانون کاربر وجود ندارد؛ واژهٔ «مدار» فقط در متن اسلاید «وقتی مدار کامل باشد...» به‌نرمی معرفی می‌شود.
- src/content/levels/level0.ts — ساختار جدید l0-1 (۹ صفحه): discovery → «پس الکترونیک چیست؟» (+تیپ فرمول) → «الکترونیک در زندگی ما» (+سؤال) → «داخل یک وسیلهٔ الکترونیکی چه خبر است؟» (فهرست باتری/برد/سیم/چراغ/کلید) → «قطعه‌ها با هم کار می‌کنند» (+سؤال) → «وقتی مدار کامل باشد...» (+سؤال) → quiz → «حالا یک قدم جلوتر!» (پل به «برق چیست؟») → reward. minutes ۵→۸؛ objectives به ۴ هدف گسترش یافت. متن‌ها دوزبانه (fa/en) با صدای معلم ابتدایی و جملات کوتاه؛ «جریان» حذف شد (موضوع درس بعد).
- src/content/types.ts — فیلد ask?: LocaleText برای اسکرین explain (کارت سؤال تأملی بدون نمره)؛ نوع سؤال جدید circuitPick با variants: CircuitSchematic ('open'|'closed'|'same-pin') برای آزمون تصویری «کدام مدار چراغ را روشن می‌کند؟».
- src/components/lesson/LessonPlayer.tsx — رندر کارت سؤال 🤔 (teal) برای explain های دارای ask.
- src/components/lesson/Quiz.tsx + CircuitPickArt.tsx (جدید) — گزینه‌های circuitPick به‌صورت سه نقاشی شماتیک SVG دست‌ساز بزرگ و کودک‌پسند (باز/حلقهٔ کامل/دو سیم از یک سر باتری)؛ لامپ در همه خاموش تا پاسخ لو نرود. دلیل: روتر آرنجی CircuitView در حلقهٔ دوجزئی سیم‌ها را روی هم می‌اندازد و گزینه‌ها قابل‌تفکیک نبودند (با E2E ثابت شد)؛ CircuitPickArt الگوی device-art/part-art را ادامه می‌دهد. CircuitView برای diagnose دست‌نخورده ماند.
- آزمونک جدید l0-1 (۴ سؤال): mcq تعریف الکترونیک / trueFalse کنسول / mcq باتری=منبع انرژی (جایگزین سؤال «نقطه‌های درخشان» وابسته به اسلاید حذف‌شده) / circuitPick «کدام مدار چراغ را روشن می‌کند؟» با پاسخ درست B.
- src/tests/content.test.ts — چک صحت circuitPick (answer < variants.length)؛ رفع خطای قدیمی TS در همین فایل (narrowing داخل closure → startCircuit در const؛ خطا از قبل موجود بود و با فیلترهای قبلی پنهان می‌شد).
- scripts/lesson-doc-*.js + gen-lesson-redesign-docx.js — هدر eslint-disable برای require های Node (اسکریپت‌های سند Task 19؛ lint کل ریپو را قرمز کرده بودند).
- E2E (agent-browser): دسکتاپ ۱۲۸۰ — پیمایش کامل ۹ صفحه، پاسخ هر ۴ سؤال (شمايار عمدی غلط در circuitPick → ❌ + توضیح کوتاه؛ سپس درست → ✅ سبز روی گزینهٔ B)؛ موبایل ۳۹۰ — اسلاید داخل-وسیله و سه نقاشی مدار بزرگ و قابل‌تفکیک؛ EN — اسلایدها و آزمون انگلیسی سالم؛ بازگشت زبان به fa. صفر خطای کنسول/صفحه.
- tsc اپ پاک، eslint پاک (۰ خطا)، vitest ۲۱/۲۱.
- Screenshots: download/screenshots/task20-*.png (s2-definition / s3-life / s4-inside / s5-team / s6-circuit / q1-answer / q4-circuits / q4-wrong-reveal / quiz-summary / s7-bridge / s8-reward / mobile-s4-inside / mobile-q4-circuits / mobile-q4-correct / en-s2-definition).

Stage Summary:
- درس «الکترونیک چیست؟» حالا از اسلاید ۲ به بعد کاملاً نو است: یک مفهوم در هر اسلاید، زبان معلم ابتدایی، بدون «جریان» و بدون تعریف مستقل «مدار»؛ اسلاید دومِ قبلی حذف شد تا مال درس «برق چیست» باشد.
- جای تصویرهای اختصاصی هر اسلاید خالی است (طبق قرار، کاربر خودش می‌سازد و وارد می‌کند)؛ اسلایدها فعلاً با تیپ/کارت سؤال/فهرست قطعه‌ها خوانا هستند و آزمون تصویری با هنر SVG خود اپ کاملاً کار می‌کند.
- گام بعد پیشنهادی: کاربر تصویر هر اسلاید را طبق [تصویر پیشنهادی] پاسخ قبلی/سند طراحی کند؛ افزودن فیلد تصویر به explain و اتصال آن در LessonPlayer یک قدم کوچک است.

---
Task ID: final-zip
Agent: Super Z (main)
Task: ساخت فایل زیپ نهایی از کل برنامه CircuitQuest

Work Log:
- اسکریپت scripts/make-zip.sh اصلاح شد: حذف .git (۱۳۰مگ)، حذف پوشه download، تاریخ بر اساس Asia/Tehran
- زیپ نهایی ساخته و integrity آن تأیید شد
- زیپ‌های قدیمی (09-05، 09-11، 09-24) از download حذف شدند
- .env داخل زیپ به مسیر نسبی file:./db/custom.db تبدیل شد (قابل حمل برای لپ‌تاپ)

Stage Summary:
- خروجی نهایی: download/CircuitQuest-FINAL-2026-09-25.zip (29MB، 397 فایل)
- شامل: src، public (فونت‌ها و تصاویر قطعات)، prisma، db/custom.db، upload (منابع کاربر)، مستندات، bun.lock
- خارج شده: node_modules، .next، .git، tool-results، download، زیپ‌ها

---
Task ID: cleanup-full
Agent: Super Z (main)
Task: پاکسازی کامل پروژه — حذف فایل‌های زائد و کد مرده + رفع باگ‌های TypeScript

Work Log:
- تایپ‌چک: از ۲۸۰+ خطا به صفر رسید. ریشه‌ها: (۱) تعریف موازی DeviceModel/Solution در types.ts و devices.ts — Solution به types.ts منتقل و در devices.ts re-export شد و امضای update یکسان شد؛ (۲) تداخل نام import/کلاس MNASystem در core/mna.ts — ایمپورت با نام مستعار MNASystemSpec؛ (۳) فیلدهای conducting/light/rpm/mode به PartState در parts/visuals.tsx اضافه شد (خروجی‌های واقعی مدل‌ها).
- کد مرده حذف شد: src/components/lesson/robot3d/ (Robot3DScene+RobotDiscovery؛ به three/@react-three وابسته بود که اصلاً نصب نبود و جایی import نمی‌شد) + examples/websocket (تمپلیت با خطای socket.io).
- ۴۲ کامپوننت ui/ تمپلیت shadcn که هیچ‌جا استفاده نمی‌شدند حذف شدند (فقط button/input/switch/slider/toaster/toast ماندند) + hooks/use-mobile (فقط مصرفش sidebar حذف‌شده بود).
- package.json از ۶۵ به ۱۶ وابستگی رسید (۴۹ پکیج بی‌استفاده: dnd-kit، tanstack، ۲۳ عدد radix، docx، next-auth، next-intl، sharp، zod، z-ai-web-dev-sdk و...)؛ name به circuitquest و version 1.0.0؛ اسکریپت‌های test و typecheck اضافه شد. bun install → ۵۱ پکیج حذف، lockfile سالم.
- فایل‌های زائد حذف شدند: tool-results/ (۲۱مگ آرتیفکت ابزارها)، mini-services/ (خالی)، tests/ (اسکریپت‌های infra سندباکس)، dev.log، tsconfig.tsbuildinfo، upload/user-parts.zip، upload/old-parts-backup/، upload/user-parts-staged/ و ۱۹ اسکریپت یک‌بارمصرف scripts/ (dbg-*، ref-*، lesson-doc-* و... — فقط make-zip.sh ماند).
- tsconfig: skills و tool-results به exclude اضافه شدند.
- make-zip.sh: استثنای *.tsbuildinfo هم اضافه شد.
- تأیید نهایی: tsc صفر خطا، eslint پاک، vitest ۲۱/۲۱، سرور dev روی 3000 پاسخ ۲۰۰ با محتوای فارسی سالم و بدون خطای لاگ.

Stage Summary:
- پروژه جم‌وجور شد: زیپ نهایی از ۲۹مگ/۳۹۷فایل به ۲۲مگ/۲۲۲فایل رسید.
- خروجی: download/CircuitQuest-FINAL-2026-09-25.zip (بازنویسی‌شده با کد پاکسازی‌شده)
- رفتار اپ تغییر نکرد — همهٔ تغییرات حذف کد مرده/تایپ بود؛ موتور شبیه‌ساز و درس‌ها دست‌نخورده.

---
Task ID: lesson-l0-1-robot
Agent: Super Z (main)
Task: بازنویسی اسلایدهای ۲ به بعد درس «الکترونیک چیست؟» طبق متن دقیق کاربر + ربات معلم جدید

Work Log:
- src/content/types.ts — فیلد speaker?: 'robot' به اسکرین explain و rewardBadge?: LocaleText به Lesson اضافه شد.
- src/components/lesson/RobotSpeech.tsx (جدید) — ربات معلم با حباب گفتگو و افکت ماشین‌نویس (۲ نویسه/۲۴ms)؛ کلیک = نمایش فوری؛ تنظیم reduce-motion = متن کامل بلافاصله؛ با key=text در هر اسلاید از نو تایپ می‌کند.
- src/components/lesson/scenes.tsx — سه صحنهٔ تعاملی جدید: electron-wire (سیم شفاف با ۸ الکترون خندان؛ لمس سیم/دکمه = دویدن الکترون‌ها + برچسب جریان برق)، circuit-road (جادهٔ سبز گرد با باتری و LED؛ دکمه = افتادن پل در شکاف، نورانی شدن چراغ و حرکت الکترون‌ها در کل حلقه؛ دوباره = قطع)، hero-team (۵ قهرمان کارتونی با چهره: باتری/سیم/کلید/LED/موتور؛ لمس هر کدام صدای مخصوص + انیمیشن کار + جملهٔ خودش). ثبت در رجیستری Scene.
- src/lib/sfx.ts — صداهای سنتز‌شدهٔ جدید: beep (ربات)، powerup (باتری)، whoosh (سیم)، click (کلید)، sparkle (LED)، whirr (موتور)، applause (دست زدن — burst نویز فیلترشده)؛ همگی زیر ۰.۰۹ ولوم و تابع تنظیم صدا.
- src/components/lesson/LessonPlayer.tsx — اسکرین‌های speaker:'robot' با عنوان + حباب ربات + صحنه + کارت tip/ask رندر می‌شوند؛ اسکرین reward مدال افتخار درس (rewardBadge) را زیر تروفی نشان می‌دهد.
- src/components/lesson/Quiz.tsx — پاسخ درست = صدای دست زدن (sfx.applause).
- src/content/levels/level0.ts — درس l0-1 از اسلاید ۲ به بعد کاملاً با متن دقیق کاربر بازنویسی شد (۷ صفحه): discovery → راز بزرگ: الکترون‌ها 🕵️‍♂️ → جادهٔ جادویی: مدار 🛣️ → قهرمان‌های کوچک مدار 🦸 → جادوی کنترل: الکترونیک 🧠 → مسابقه → مدال. متن ربات دوزبانه (fa دقیقاً متن کاربر، en ترجمهٔ کودکانه). آزمون = فقط سؤال مسابقهٔ کاربر (کلید/باتری/لامپ LED، پاسخ کلید). rewardBadge = «مدال افتخارِ «مهندس کوچک»». objectives با محتوای جدید هماهنگ شد.
- src/tests/content.test.ts — حداقل تعداد سؤال آزمون از ۲ به ۱ کاهش یافت (طرح تک‌سؤالی مسابقهٔ کاربر).
- E2E (agent-browser): دسکتاپ ۱۲۸۰ — هر ۷ صفحه پیمایش شد؛ تایپ ربات (۷۳ نویسه در ۱ثانیه) تأیید شد؛ سیم لمس شد → الکترون‌ها دویدند؛ پل وصل شد → چراغ درخشید؛ هر ۵ قهرمان لمس شد؛ مسابقه با «🔴 کلید» درست answered → «آفرین مهندس کوچک!» + مدال «مهندس کوچک» روی صفحهٔ پایان. موبایل ۳۹۰ — اسلاید ۲ سالم. صفر خطای کنسول/صفحه.
- tsc پاک، eslint پاک، vitest ۲۱/۲۱. زیپ نهایی بازسازی شد: download/CircuitQuest-FINAL-2026-09-26.zip (۲۲مگ).

Stage Summary:
- ربات معلم از این به بعد نقش معلم را دارد (کامپوننت RobotSpeech قابل استفاده در همهٔ درس‌های بعدی با speaker:'robot').
- متن‌های اسلایدهای ۲ تا ۵ دقیقاً مطابق متن کاربر است؛ تعامل‌ها: انیمیشن الکترون، پل مدار، قهرمان‌های صدا‌دار؛ آزمون تک‌سؤالی + مدال مهندس کوچک با دست‌زدن.

---
Task ID: curriculum-restructure
Agent: main (Super Z)
Task: بازآرایی ساختار سه فصل درسی طبق ساختار نهایی کاربر (ترتیب، ادغام، حذف، عناوین جدید)

Work Log:
- level0.ts — از ۱۶ به ۱۴ درس با ترتیب جدید کاربر: ایمنی→درس ۳ (l0-3)، مدار چیست؟→درس ۴ (l0-4)، سه‌گانهٔ ولتاژ/جریان/مقاومت→درس‌های ۷-۹، قطعه‌ها→درس‌های ۱۰-۱۳، نمادها→۱۴. درس «توان» حذف شد؛ دو درس مقاومت (l0-6+l0-14 قدیم) در درس جدید «مقاومت (جادهٔ تنگ و باریک)» 🚧 ادغام شدند (مفهوم لولهٔ تنگ اول، بعد قطعهٔ نگهبان + دموی «تنگی را حس کن» + آزمون ۵سؤالی بدون تکرار). شناسه‌ها با جایگاه جدید هم‌تراز شدند (l0-1…l0-14) و زنجیرهٔ unlock خطی بازنویسی شد.
- اصلاح ارجاع‌های متنی ناشی از جابه‌جایی: متن «حالا باتری و سیم و … را می‌شناسی» در درس مدار حذف/بازنویسی شد؛ «مقاومت را در درس بعدی می‌شناسی» در درس LED به «درس‌های بعدی» تغییر کرد؛ ارجاع «Level 2» نوارهای رنگی به فصل «ساخت‌گر مدار» اصلاح شد.
- level1.ts — از ۹ به ۷ درس: مولتی‌متر به فصل ۳ منتقل شد؛ «کلید در عمل» + «دکمهٔ فشاری» در درس «انواع کلیدها (کلید راکر و دکمهٔ فشاری)» 🔘 ادغام شدند (۲ اسکرین + بیلد «با فشار روشن» + ۴ سؤال). عناوین جدید: بردبورد چیست؟/سیم‌کشی روی بردبورد/روشن‌کردن اولین LED 💡/مقاومت واقعی 🎨/ترکیب باتری‌ها 🔋/پروژهٔ بزرگ فصل 🛠️ (محتوای چراغ‌قوه با عنوان جدید هم‌خوان است).
- level2.ts — ۹ درس: مولتی‌متر = درس ۱ «ابزار جادویی کارآگاه: مولتی‌متر» 🔍 (levelId به level2 تغییر کرد)؛ درس «توان» حذف شد؛ عناوین کارآگاهی: سری (قطار الکترون‌ها) 🚂/موازی (جاده‌های چندمسیره) 🛣️/کارآگاه ولتاژ 📏/کارآگاه جریان 🧮/قانون اهم 🦸‍♂️/چرا LED به مقاومت نیاز دارد؟/اتاق عیب‌یابی 🕵️/پروژهٔ بزرگ کارآگاه 🏆. محتوای درس ۹ (پتانسیومتر) به‌عنوان placeholder ماند و با کامنت TODO(user-script) علامت خورد تا اسکریپت کاربر برسد.
- unlockهای فصل ۳ بازنگری شدند: کارآگاه ولتاژ←مولتی‌متر(l2-1)، جریان←ولتاژ(l2-4)، اهم←l2-4+l2-5، عیب‌یابی←سری+موازی(l2-2,l2-3)، پروژه←l2-6+l2-8.
- badges.ts — نشان «ساخت‌گر مدار» حالا با ۷ درس جدید l1-1…l1-7 محاسبه می‌شود.
- index.ts — توضیحات سه فصل با ترتیب/محتوای جدید هماهنگ شد (مولتی‌متر از فصل ۲ به توضیح فصل ۳ منتقل و به‌روزرسانی شد).
- اسکریپت‌های یک‌بارمصرف در scripts/ ذخیره شدند: reorder-level0.py، delete-temp-level0.py، prune-levels.py.
- تأیید: tsc صفر خطا، eslint پاک، vitest ۲۱/۲۱ (تست یکپارچگی محتوا: شناسه‌های یکتا، resolve شدن همهٔ prereqs، سالم بودن build goals). E2E مرورگر: خانه ۰/۱۴، نقشهٔ هر ۳ فصل با عناوین/ایموجی/قفل‌گذاری درست؛ درس‌های l2-1 (مولتی‌متر) و l1-5 و l0-9 (ادغامی) باز و رندر درست؛ صفر خطای کنسول.

Stage Summary:
- مسیر یادگیری اکنون دقیقاً مطابق ساختار نهایی کاربر است: کاوشگر ۱۴، ساخت‌گر ۷، کارآگاه ۹ (مجموع ۳۰ درس؛ قبلاً ۳۴ بود).
- شناسهٔ درس‌ها با جایگاه جدید یکی است؛ پیشرفت ذخیره‌شدهٔ قبلی روی درس‌های جابه‌جا شده ریست می‌شود (پیش از انتشار، بی‌خطر).
- محتوای اسلایدها دست‌نخورده ماند (طبق خواستهٔ کاربر)؛ منتظر اسکریپت محتوای هر درس از کاربر هستیم. تنها استثنا: درس ۹ فصل ۳ placeholder است و کامنت TODO دارد.

---
Task ID: l0-2-story
Agent: main (Super Z)
Task: Lesson l0-2 «برق چیست؟» — implement the user's 5 new-format story pages (robot narrator, AI illustrations, hands-on scenes, explorer quiz + medal). Only l0-2 touched; all other lessons untouched.

Work Log:
- Generated 5 AI illustrations from the user's English prompts (1344x768) via scripts/gen-l0-2-images.mjs (z-ai CLI, retry x3) -> public/images/lessons/l0-2/{1-room-wake,2-electrons,3-power-journey,4-safe-danger,5-quiz-party}.png. Regenerated #4 once (first output baked in Chinese text); noted deviations: sides swapped on #4 (kitten right / lion left) to match the RTL layout the user described, owl-teacher replaced by the app robot on #5 per the "robot replaces teacher" rule.
- New file src/components/lesson/story-scenes.tsx: 5 interactive scenes — RoomWakeScene (toggle switch: dark room + zzz -> bright + sparkles, sfx powerup/sparkle/click), ElectronRaceScene (hold/drag the wire: 7 cute SVG electron runners with lanterns dash, sfx whoosh), PowerJourneyScene (RTL drag strip plant->pylons->underground->home with lit stations, blips, fanfare + «برق به خانه رسید!», keyboard slider a11y; illustration mirrored via .cq-scene-flip so the journey reads RTL), SafeDangerScene (two tappable cards: battery-kitten safe green vs socket-lion danger red, sfx sparkle/click), CelebrationScene (trophy image + CSS confetti .cq-fall).
- scenes.tsx registry: +5 additive cases (room-wake, electron-race, power-journey, safe-danger, celebration).
- content/types.ts (additive): quiz screen gains optional title/body/speaker/scene; reward gains optional scene. LessonPlayer quiz/reward cases render these optionals (other lessons unaffected — fallbacks preserved).
- globals.css (additive): .cq-float, @keyframes cq-fall + .cq-fall, .cq-scene-flip.
- level0.ts: rewrote ONLY the l0-2 block — 4 robot-narrated explain pages with the user's exact Persian texts + EN translations, page 5 = quiz screen («آزمون کاوشگر شجاع! 🏆🎮» + robot intro) with the user's 1-question MCQ, rewardBadge «مدال افتخارِ «کاوشگر برق»», celebration scene on reward; objectives updated to the lesson's 3 stated goals.
- Browser-verified end-to-end with agent-browser (pages 1-6, all interactions incl. wake toggle, electron race via keyboard hold, journey drag to completion, card tap, quiz answer + feedback, medal screen); fixed journey completion threshold 0.999 -> 0.97 after live-testing.
- Verification: tsc 0 errors, vitest 21/21, eslint clean, dev.log clean, l0-1 spot-checked untouched.

Stage Summary:
- l0-2 is now the first "new-format" story lesson: 6 screens = 4 picture pages + quiz + reward; all user texts verbatim (fa), bilingual L(en,fa).
- Reusable pieces for the next lessons: story-scenes.tsx scene kinds, quiz/reward optional schema extensions, confetti/flip CSS helpers, scripts/gen-l0-2-images.mjs as the image-generation template (images live in public/images/lessons/<lesson-id>/).
- Awaiting the user's content for the remaining lessons (one by one, as they said they'd provide).

---
Task ID: l0-3-safety-story
Agent: Super Z (main)
Task: Lesson l0-3 «قوانین ایمنی مهندس کوچولو» — implement the user's 5 new-format safety pages (robot narrator, AI illustrations from the user's English prompts, hands-on scenes, oath + 1-question quiz + golden medal). Scope isolation: ONLY l0-3 touched (l0-1/l0-2 spot-checked untouched).

Work Log:
- Generated 5 AI illustrations from the user's exact English prompts (1344x768) via scripts/gen-l0-3-images.mjs (z-ai CLI, retry x3) -> public/images/lessons/l0-3/{1-shield,2-battery-socket,3-short-circuit,4-tidy-desk,5-medal-party}.png. Documented deviations: battery placed on the RIGHT in #2 (RTL reading), #5 "Correct button"→green checkmark badge (avoid baked English text) + app robot added (robot replaced the teacher); all prompts got the no-text tail.
- story-scenes.tsx (+4 additive scenes, ~470 lines): ShieldUnlockScene (4 padlocks around a golden SVG shield open one-by-one in RTL order, shackle springs open w/ CSS transform-box, sfx.open→sparkle+fanfare on 4th; user's exact CTA «روی سپر بزن تا قفل قانون اول باز بشه!»), BatterySocketScene (tap battery → big green ✅ pop + pulsing halo; tap socket → SVG animateTransform shake remount + 💢 + red caption), ShortCircuitScene (hot state: red wire, fast red electrons, sweaty worried battery + 🔥 + heat waves; lamp is ALWAYS mounted and CSS-transitions from hover into the wire gap → calm blue electrons, happy battery, glowing lamp; toggleable back via «دوباره سیم رو خالی کن»; fixed initial hover-lamp clipping by moving y 6→18/20 and mounting lamp once for a real drop animation), TidyDeskScene (SVG workbench w/ towel+tools; 🥤🍪🧸 clutter taps away w/ scale-out transition, keyboard a11y, fanfare-once in useEffect; «میز مهندسی آماده شد!»).
- scenes.tsx registry: +4 additive cases (shield-unlock, battery-socket, short-circuit, tidy-desk). No CSS changes (reused cq-float/cq-pop).
- level0.ts: rewrote ONLY the l0-3 block — 4 robot-narrated explain pages with the user's exact Persian texts (fa verbatim: مدال طلایی، غول پریز، اتصال کوتاه، میز تمیز) + kid EN translations; page 5 = quiz screen titled «دریافت مدال افتخار ایمنی! 🏅🏆» with the robot oath «من یک مهندس کوچولوی بااحتیاط هستم و فقط با باتری کار می‌کنم!»; reward = celebration scene w/ 5-medal-party.png; rewardBadge «مدال طلاییِ ایمنی»; objectives = the 3 golden rules; quiz = the user's single MCQ (⚡ short circuit = correct, 💡 = distractor) with medal-unlock explanation; minutes 5→6.
- Fixed TS (missing LocaleText import, dup useRef decl) and moved TidyDesk celebration sfx into useEffect.
- E2E (agent-browser, viewport 1280 + 390 + EN): page1 4 locks open → done CTA; page2 battery ✅ + socket 💢 shake; page3 hover lamp visible → fix → glowing lamp + happy battery → undo works; page4 3 clutters removed → success caption; page5 quiz correct (A) → «درست است!» + applause (sfx.applause prewired in Quiz.tsx) → reward screen w/ medal image + badge «مدال طلایی ایمنی» + 3 objectives checked; EN pages 1/3/4/5 verified; mobile 390 pages 1+4 verified. Zero page/console errors. l0-2 spot-checked unchanged.
- tsc 0 errors, eslint clean, vitest 21/21. (Lesson completed in dev DB progress — l0-1..l0-3 now done there.)

Stage Summary:
- l0-3 is the second new-format story lesson: 6 screens = 4 picture pages + oath/quiz + medal reward; user texts verbatim (fa), bilingual everywhere.
- Reusable safety scenes now exist for any future lesson (shield-unlock/battery-socket/short-circuit/tidy-desk) alongside the l0-2 set; image template script per lesson: scripts/gen-l0-3-images.mjs.
- Awaiting the user's page-by-page content for the next lessons (l0-4 مدار چیست؟ and onward) — same pipeline will apply.

---
Task ID: l0-4-circuit-story
Agent: Super Z (main)
Task: Lesson l0-4 «مدار چیست؟ (جاده جادویی و حلقه بسته)» — implement the user's 5 new-format story pages (robot narrator, AI illustrations from the user's English prompts, hands-on scenes, 1-question quiz + «مهندس راه‌ساز مدار» medal). Scope isolation: ONLY l0-4 touched (l0-2/l0-3 spot-checked untouched in browser).

Work Log:
- Generated 5 AI illustrations from the user's exact English prompts (1344x768) via scripts/gen-l0-4-images.mjs (z-ai CLI, retry x3) -> public/images/lessons/l0-4/{1-racetrack,2-closed-circuit,3-open-circuit,4-stations-map,5-circuit-trophy}.png. Documented deviations (same policy as l0-2/l0-3): no-text tail on every prompt; #2/#3 battery placed on the RIGHT so the loop reads RTL; #4 battery station on the right (first in RTL order); #5 "green checkmark button" → green checkmark badge (avoid baked English text) + the app's cute teacher robot added (robot replaces the teacher). Visual QA of all 5: no garbled text, correct orientation, open-circuit pic has bridge-up icon + sleeping bulb.
- story-scenes.tsx (+4 additive scenes, ~640 lines, shared LoopBattery/LoopLed parts): RaceStartScene (oval racetrack SVG, 6 helmeted electron racers idle on the starting grid w/ engine wobble behind the 🏁 flag on the right; button = user's exact CTA «روی پرچم استارت بزن...» → animateMotion laps 2.4s + waving flag + 💨; toggle stop), TraceCircuitScene (drag/keyboard around a circular loop: unwrapped-angle tracker reveals a glowing copper path via pathLength dash trick mirrored for RTL; quarters → LED lights + fanfare + 7 electrons race + happy battery; live Persian-digit percent caption), FixCircuitScene (open circuit: gap on the LEFT arc via 4-segment dasharray, 4 queued electrons holding 🛑 behind the gap, pulsing red dashed warning + ❌, worried sweaty battery, sleeping LED 💤; tap either pulsing loose end (a11y buttons) or the CTA button → bridge arc springs across the gap (dashoffset spring), cap A slides to B, electrons dash the whole loop, LED wakes; toggle to re-open; focus outline suppressed on SVG tap targets), CircuitStationsScene (2×2 RTL grid: 🔋 پمپ انرژی / 🧵 جادهٔ حرکت / 🚦 دروازهٔ جاده / 💡 مصرف‌کنندهٔ انرژی — tap reveals the user's exact job line + per-station sfx (powerup/whoosh/click/sparkle); all 4 → «جادهٔ مدار کامل شد!» + fanfare).
- scenes.tsx registry: +4 additive cases (race-start, trace-circuit, fix-circuit, circuit-stations) + imports. No CSS changes (reused cq-float/cq-pop).
- level0.ts: rewrote ONLY the l0-4 block — 4 robot-narrated explain pages with the user's verbatim Persian texts (racetrack analogy, closed circuit = bridge down, open circuit = bridge up, the 4 stations list) + kid EN translations; markdown ** emphasis stripped (body renders as plain text, «» quotes kept); page 5 = quiz screen titled «آزمون کاوشگر هوشمند مدار! 🏆🎮» with the user's robot intro; quiz = the user's exact single MCQ (correct = 🔴 جاده باز میشه; explanation awards the medal); rewardBadge «مدال افتخارِ «مهندس راه‌ساز مدار»»; reward = celebration scene w/ 5-circuit-trophy.png; objectives = closed-loop concept / closed-vs-open / 4 stations; minutes 7. Removed the old build task + now-unused batteryLedLoose const (old format replaced by user's new-format script; diagnoseGap etc. still used by l0-5 and the L0_QUIZ_CIRCUITS export).
- E2E (agent-browser, 1280 + 390 + EN): page1 race start/stop ✓; page2 real pointer drag around the loop → full glow, LED halo, electrons ✓; page3 tap-to-connect → bridge/queue/LED states + reopen ✓ (fixed lingering focus ring on the SVG tap target); page4 all 4 stations reveal jobs ✓; page5 correct answer → «درست است!» + applause + medal explanation → reward screen with badge «مهندس راه‌ساز مدار» + 3 objectives checked ✓; EN pages verified LTR; mobile 390 pages 1/3 + race verified. Zero console/page errors.
- Verification: tsc 0 errors in touched files (pre-existing unrelated errors in examples/websocket + robot3d due to uninstalled three/socket.io — untouched legacy experiments, app never imports them), eslint clean, vitest 21/21, dev.log clean. l0-2 (room-wake) and l0-3 (shield-unlock) spot-checked rendering untouched.

Stage Summary:
- l0-4 is the third new-format story lesson (6 screens = 4 picture pages + quiz + reward); all user texts verbatim (fa), bilingual everywhere.
- Reusable circuit scenes now exist alongside the l0-2/l0-3 sets: race-start, trace-circuit (circular RTL drag-trace with dash-reveal), fix-circuit (gap-closing bridge), circuit-stations; image template per lesson: scripts/gen-l0-4-images.mjs.
- Awaiting the user's page-by-page content for the next lessons (l0-5 onward) — same pipeline applies.

---
Task ID: lessons-bugfix-dialogue
Agent: Super Z (main)
Task: رفع باگ درس‌های جدید (l0-1..l0-4)، بازتولید تصاویر خراب، سیستم دیالوگ خط‌به‌خط لمسی برای ربات، و بهبود گرافیک متن/حباب/ربات — بدون تغییر هیچ متن اسلایدی.

Work Log:
- Bug-hunt مرورگری همهٔ صفحه‌های l0-1..l0-4 (دسکتاپ + موبایل): همهٔ تعامل‌ها سالم (اتاق خواب/بیدار، مسابقهٔ الکترون، سفر برق، کارت امن/خطرناک، آزمون+مدال، قفل‌های سپر، اتصال کوتاه، میز مرتب، پیست مسابقه، ردیابی حلقه، پل گپ، ۴ ایستگاه). صفر خطای کنسول. باگ‌ها همگی تصویری بودند.
- تصاویر بازتولید شدند (scripts/gen-image-fixes.mjs؛ نسخه‌های قدیمی در scripts/img-backups/):
  1) l0-2/3-power-journey — پریز خانه شبیه صورت عجیب بود → نیروگاه/دکل/خانه با پنجرهٔ روشنِ تمیز؛
  2) l0-2/4-safe-danger — سپر سبز ✅ سمت شیر (خطرناک) بود → سپر سمت بچه‌گربه/باتری (امن، راست RTL) + مثلث‌های هشدار سمت شیر؛
  3) l0-3/1-shield — سپر فوتورئال خاکستری → سپر طلایی با پس‌زمینهٔ پاستلی رنگی هماهنگ با اپ (چیدمان مرکزی برای قفل‌های SVG حفظ شد)؛
  4) l0-3/4-tidy-desk — میز فوتورئال بدون شخصیت → ربات مهندس بامزه پشت میز مرتب کارتونی؛
  5) l0-4/3-open-circuit — باتری دورنگ عجیب → یک باتری کاراکتر نارنجی/مشکی با چهرهٔ نگران.
- سیستم دیالوگ (خواستهٔ اصلی کاربر): src/lib/dialogue.ts جدید — splitDialogue متن معلم را فقط در مرز جمله/پاراگراف/آیتم لیست به خط‌های کوتاه (سقف نرم ۹۶ نویسه) می‌شکند؛ تضمین verbatim با تست واحد src/tests/dialogue.test.ts (join خط‌ها == متن اصلی برای همهٔ صفحه‌های ربات fak+en؛ آیتم‌های «۱./1./🧼» یک‌تکه می‌مانند) — vitest 24/24.
- RobotSpeech.tsx بازنویسی شد: فقط یک خط در حباب؛ لمس حباب/ربات → تمام‌کردن تایپ خط فعلی، لمس بعدی → خط بعد (sfx.blip)؛ نقطه‌چین پیشرفت خط‌ها + راهنمای «👆 بزن تا ادامه…» (i18n: lesson.tapMore/robotName/robotSays fa+en)؛ تگ نام «🤖 رباتِ مهندس» روی حباب؛ حباب گرادیانی با سایر بازیگوش؛ reduced-motion تایپ‌رایتر را خاموش می‌کند؛ کیبورد Space/Enter هم advance می‌کند.
- Mascot.tsx: prop اختیاری talking — دهن باز/بسته هنگام حرف زدن + باب نرم بدن (فقط وقتی motion فعال است؛ بقیهٔ صفحات دست‌نخورده).
- LessonPlayer.tsx: شاخهٔ explain-robot — نوار گرادیانی تزئینی زیر تیتر + کارت tip/ask کمی پولیش‌تر. شاخهٔ غیرربات و بقیهٔ صفحات بدون تغییر.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (خطاهای ui/* از قبل بی‌ربط و نصب‌نشده)، eslint پاک، vitest 24/24، مرور E2E دوبارهٔ l0-1..l0-4 با حباب جدید (دسکتاپ ۱۲۸۰ + موبایل ۳۹۰)، خطای کنسول صفر، l0-5 (غیررباتی) spot-check: دقیقاً مثل قبل.

Stage Summary:
- ربات معلم حالا خط‌به‌خط و لمس‌به‌لمس حرف می‌زند (صفحه شلوغ نمی‌شود)، متن‌ها حرف‌به‌حرف همان متن‌های کاربر است؛ ۵ تصویر خراب تعویض شد؛ گرافیک حباب/تیتر/ربات بهتر شد.
- فایل‌های تغییریافته: src/lib/dialogue.ts (جدید)، src/components/lesson/RobotSpeech.tsx، src/components/mascot/Mascot.tsx، src/components/lesson/LessonPlayer.tsx، src/lib/i18n/{en,fa}.ts، src/tests/dialogue.test.ts (جدید)، scripts/gen-image-fixes.mjs (جدید)، ۵ تصویر در public/images/lessons/.
- هیچ متن یا اسلایدی تغییر نکرد؛ درس‌های دیگر فقط از حباب جدید بهره می‌برند (خواستهٔ صریح کاربر).

---
Task ID: l0-5-bridge-dialog
Agent: Super Z (main)
Task: درس l0-5 «مدار باز و مدار بسته (پل جاده)» با اسکریپت جدید کاربر + بازطراحی دیالوگ ربات (حذف تایپ‌رایتر، گروه‌خط‌های لمسی) — بدون تغییر حتی یک حرف از متن‌های اسلاید.

Work Log:
- بررسی worklog و کد: مرورگر/سرور سالم بود (پورت ۳۰۰۰، GET / 200)؛ «پیش‌نمایش زنده» مشکل سرور نداشت — با agent-browser رندر واقعی تأیید شد (تایتل، اسنپ‌شات، صفر خطای کنسول). احتمالاً قطعی موقت بوده.
- دیالوگ (انتخاب از دو گزینهٔ کاربر «چند خط یکجا» یا «همه یکجا»): گزینهٔ اول پیاده شد — src/lib/dialogue.ts تابع groupDialogue (گروه‌های حداکثر ۲ خطی، سقف نرم ۱۷۰ نویسه؛ تضمین verbatim: join خط‌ها == متن اصلی). RobotSpeech.tsx بازنویسی شد: تایپ‌رایتر کاملاً حذف؛ هر لمس → گروه بعدی با cq-pop و تأخیر پله‌ای ۱۱۰ms؛ نقاط پیشرفت به‌ازای هر گروه؛ دکمهٔ لمس و hint فقط وقتی ادامه هست؛ کیبورد Space/Enter؛ burst دهان ربات ۶۴۰ms پس از هر لمس (Mascot talking) — بدون setState در effect (رفع خطای eslint react-hooks/set-state-in-effect؛ burst داخل handler).
- تست‌ها: dialogue.test.ts دو describe جدید برای groupDialogue (verbatim برای همهٔ صفحه‌های رobot fa+en، جفت‌شدن خط‌های کوتاه، تکه‌ماندن آیتم‌های لیست، خالی نبودن خروجی). vitest ۲۷/۲۷.
- تصاویر l0-5 (scripts/gen-l0-5-images.mjs از پرامپت‌های دقیق انگلیسی کاربر + دم no-text؛ خروجی 1344x768 در public/images/lessons/l0-5/): ۱-drawbridge (نسخهٔ اول ماشین‌ها روی آب بود → scripts/gen-l0-5-fixes.mjs بازتولید: صف ماشین‌ها روی خشکی سمت راست ✓)، ۲-bridge-closed ✓، ۳-bridge-open (نسخهٔ اول متن STOP داشت؛ نسخهٔ دوم لامپ روشن/بدون گپ بود؛ نسخهٔ سوم نهایی: گپ + لامپ خاموش خاکستری + تابلوهای اکتاگون خالی + سبک پیکساری ✓)، ۴-switch-keeper ✓، ۵-bridge-trophy (ربات + کاپ روی پل + تیک سبز، بدون متن ✓). نسخه‌های قدیمی در scripts/img-backups/l0-5/.
- صحنه‌های تعاملی جدید در story-scenes.tsx (~۵۶۰ خط، فقط افزودنی): BridgeRiver/BridgeBanks/BridgeTower/BridgeDeck (چرخش CSS با زنجیرهٔ translate-rotate-translate برای استقلال از transform-origin مرورگرها)/BridgeLamp (خانهٔ نور)/BridgeCar (الکترونِ راننده). چهار صحنه: bridge-move (صفحهٔ ۱: پایین/بالا بردن پل + عبور ماشین + کشتی 🚢 هنگام بازبودن؛ sfx.open/whoosh/sparkle)، bridge-cross (صفحهٔ ۲: لمس هر ۵ ماشین → عبور پله‌ای؛ LED از اولین رسیدن روشن؛ fanfare پس از ۵/۵)، bridge-open (صفحهٔ ۳: پل باز + صف ۴ ماشین با 🛑 + هشدار قرمز → پایین‌بردن → عبور پله‌ای؛ قابل برگشت)، bridge-switch (صفحهٔ ۴: شخصیت کلید با کلاه مأمور پل + اهرم ON/OFF → همزمان پل+لامپ+ماشین؛ چهرهٔ خندان/خواب). رجیستری scenes.tsx: +۴ case.
- level0.ts: فقط بلوک l0-5 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون حذف طبق رویهٔ درس‌های قبل — + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🟢 بسته) و بازخورد مدال «مهندس پل‌ساز مدار»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «مهندس پل‌ساز مدار»»؛ objectives جدید؛ unlock l0-4 ثابت). diagnoseOpenSwitch همچنان در L0_QUIZ_CIRCUITS صادر می‌شود (بدون شکستن).
- تأیید: tsc صفر خطا در فایل‌های تغییریافته/جدید (خطاهای ui/* از قبل بی‌ربط)، eslint پاک، vitest ۲۷/۲۷، E2E مرورگر: هر ۶ صفحهٔ l0-5 (دیالوگ ۴ گروهی + هر ۴ صحنه + آزمون + مدال)، EN (بعد از reload rehydrate)، موبایل ۳۹۰ (صفحهٔ مدال)، لود مجدد l0-2 برای رگرسیون دیالوگ ✓، صفر خطای کنسول، dev.log پاک.

Stage Summary:
- ربات حالا به‌جای تایپ‌رایتر، هر بار ۱–۲ خط کوتاه را یکجا با انیمیشن پاپ نشان می‌دهد و با لمس ادامه می‌دهد (انتخاب من از دو گزینهٔ کاربر: چند خط در هر لمس — صفحه شلوغ نمی‌شود و هیچ انتظاری برای تایپ وجود ندارد).
- l0-5 پنجمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «مهندس پل‌ساز مدار».
- فایل‌ها: src/lib/dialogue.ts، src/components/lesson/RobotSpeech.tsx، src/tests/dialogue.test.ts، src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-5-images.mjs، scripts/gen-l0-5-fixes.mjs، ۵ تصویر l0-5.

---
Task ID: l0-6-conductor-insulator
Agent: Super Z (main)
Task: درس l0-6 «رسانا و عایق (کدام وسایل برق را رد می‌کنند؟)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-6-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-6/): نسخهٔ اولِ ۴ تصویر مشکل داشت → scripts/gen-l0-6-fixes.mjs: #۱ لوگوی «S» سوپرمن داشت و سیم نداشت (→ شوالیهٔ کروم فلزی با نشان آذرخش + نگهبان لاستیکی سپردار)؛ #۲ لوله نقره‌ای و جهت چپ→راست بود (→ سرسرهٔ مسی نارنجی با مسیر راست→چپ RTL)؛ #۳ ژاکت روی شخصیت بود نه سیم (→ کابل مسی با الکترون‌ها در دو سر + کودک روپوش‌پوش + دست امن)؛ #۴ سبک عکس واقعی بدون کلید (→ لامپ کارتونی خندان + کلید طلایی که شکاف را می‌بندد + مداد). #۵ (مدال + سپر/آذرخش + ربات) از ابتدا خوب بود. نسخه‌های اول در scripts/img-backups/l0-6/.
- صحنه‌های تعاملی جدید در story-scenes.tsx (~۶۸۰ خط، فقط افزودنی): ConductorInsulatorScene (صفحهٔ ۱: لمس هر شخصیت → حلقهٔ دعوت حذف + ستاره + معرفی در خط وضعیت؛ sfx pop/blip)، CopperSlideScene (صفحهٔ ۲: نگه‌داشتن اشاره‌گر/کیبورد روی SVG → animateMotion الکترون‌ها روی بزیر بِزیهٔ لولهٔ مسی + لامپ مقصد روشن + whoosh پله‌ای؛ رها کردن → توقف)، PlasticRaincoatScene (صفحهٔ ۳: دکمهٔ دوعاملی → کت پلاستیکی با transition CSS روی سیم می‌نشیند + دست کودک نزدیک می‌شود + ✅؛ حالت لخت ⚠️ پالس‌دار)، MaterialLabScene (صفحهٔ ۴: سه چیپ کلید/مداد/گیره → وسیله در شکاف مدار می‌نشیند؛ کلید و گیره فلزی → LED روشن خندان، مداد → LED خواب 💤؛ شکاف فقط در سیم بالایی — سیم پایینی پیوسته). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها.
- دو باگ در کد جدید خودم پیدا و رفع شد: (۱) الکترون‌های داخل سیم با cq-float به گوشهٔ SVG می‌پریدند (CSS transform روی transform attribute غلبه می‌کند) → تودرتویی outer-position/inner-float مثل الگوی ShortLamp موجود؛ (۲) شکاف دوم در سیم پایینی مدار آزمایشگاه که هیچ‌وقت بسته نمی‌شد → سیم پایینی پیوسته شد و حلقهٔ دعوت به شکاف بالایی منتقل شد.
- level0.ts: فقط بلوک l0-6 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داور و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل — + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🛡️ عایق) و بازخورد مدال «شناسگر مواد و ایمنی»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «شناسگر مواد و ایمنی»»؛ objectives جدید؛ emoji 🛡️؛ unlock l0-5 ثابت). درس‌های دیگر و diagnoseOpenSwitch دست‌نخورده.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (خطاهای robot3d/ui/examples از قبل بی‌ربط)، eslint پاک، vitest ۲۷/۲۷، E2E مرورگر: هر ۶ صفحهٔ l0-6 فارسی (دیالوگ گروهی + هر ۴ صحنه شامل hold-testing سرسره و هر ۳ وسیلهٔ آزمایشگاه + آزمون درست + مدال)، EN (بعد از reload rehydrate)، موبایل ۳۹۰، رگرسیون l0-5 و مسیر یادگیری، صفر خطای کنسول، زبان به فارسی برگردانده شد.

Stage Summary:
- l0-6 ششمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «شناسگر مواد و ایمنی».
- استعارهٔ محوری: رسانا = دوستِ برق/بزرگراه صاف، عایق = نگهبان ایمنی/سپر — متن معلم حرف‌به‌حرف در حباب ربات؛ برچسب‌های صحنه‌ها افزوده‌های کوتاه دوزبانه با همان لحن.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-6-images.mjs، scripts/gen-l0-6-fixes.mjs، ۵ تصویر l0-6 (+۴ بکاپ).

---
Task ID: l0-7-voltage
Agent: Super Z (main)
Task: درس l0-7 «ولتاژ (فشار و انرژی برق)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-7-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-7/): انحراف‌های مستند — #۱ قهرمان «ولتاژ» بدون تگ اسم + هل‌دادن الکترون‌ها به سمت چپ (RTL)؛ #۲ برج آب سمت راست و باتری سمت چپ؛ #۳ بدون برچسب 1.5V (متن نمی‌پزد؛ اعداد ولت در صحنهٔ SVG خودمان) + قلمی راست/کتابی چپ؛ #۵ «دکمهٔ تیک سبز» → نشان تیک سبز + ربات معلم. نسخهٔ اول #۲ دو منبع آب داشت و فواره از منبعِ روی پشت‌بام بود → scripts/gen-l0-7-fixes.mjs بازتولید: فقط یک منبع روی برج بلند + فوارهٔ پرشار از پایهٔ برج + پاشش روی زمین ✓ (نسخهٔ اول در scripts/img-backups/l0-7/).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی، ~۷۵۰ خط): VoltageHeroScene (صفحهٔ ۱: لمس SVG → حباب «یالا بچه‌ها، با قدرت به جلو بدوید!» + تلیشهٔ قهرمان + الکترون‌ها دو مرحله تا لامپ → مرحلهٔ سوم رسیدن/لامپ روشن/ستاره؛ لمس بعدی ریست؛ transition transform روی g بیرونیِ الکترون‌ها)، WaterPressureScene (صفحهٔ ۲: دکمهٔ سه‌سطحی — گروه مخزن با transition transform بالا می‌رود، ستون و لولهٔ سقوط با transition CSS y/height کش می‌آیند، فواره کوتاه→قوس→فوران + قطره‌ها، الکترون‌های animateMotion روی حلقه با dur 2.6→1.5→0.8s و کلید remount با level، لامپ کم‌نور→روشن→پرنور + برچسب دو نیمه)، BatteryDuoScene (صفحهٔ ۳: دو چیپ → باتری انتخابی با transition به سینی وسط می‌غلتد و دیگری منتظر می‌ماند؛ قلمی = لامپ خواب‌آلود کم‌نور + 🌙، کتابی = لامپ خندان پرنور + هالهٔ تپنده + ✨؛ برچسب‌های «۱.۵ ولت/۹ ولت» همراه باتری‌ها حرکت می‌کنند)، HappyLedScene (صفحهٔ ۴: سه چیپ 😴کم/😄مناسب/⛔۲۲۰ ولت — کم = چراغ خواب با z، مناسب = لبخند + هاله‌های تپنده + رگه‌ها، ۲۲۰ = چهرهٔ جاخورده + حلقهٔ قرمز خط‌چین + پریز با ⛔ و 🌊 + هشدار ایمنی). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها.
- دو باگ در کد جدید خودم پیدا و رفع شد: (۱) cq-float روی همان gِ دارای transform attribute قهرمان → شناور به (۰,۰) می‌پرید (همان دام l0-6) → تودرتویی outer-translate/inner-float؛ (۲) برچسب‌های دو نیمهٔ صحنهٔ آب در y=306 از viewBox 320 بیرون می‌زدند → به بالا منتقل و سقف مخزن با کاهش سفر (LEVEL_Y=[216,178,140]) پایین آمد. ضمناً چشم‌های قهرمان که روی پیشانی‌بند افتاده بودند پایین‌تر رفتند.
- level0.ts: فقط بلوک l0-7 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل — + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🌊 هل‌دادن) و بازخورد مدال «استاد ولتاژ و فشار برق»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد ولتاژ و فشار برق»»؛ objectives جدید؛ emoji 📈→⚡؛ unlock l0-6 ثابت). درس‌های دیگر و صحنه‌های قدیمی water-tanks/electron-flow دست‌نخورده.
- تست دیالوگ یک بار شکست خورد: پاراگراف ⚠️ ترجمهٔ انگلیسی من ۲۲۷ نویسه بود (آیتم‌های ایموجی‌دار یک‌تکه می‌مانند، سقف تست ۲۲۰) → فقط ترجمهٔ EN کوتاه شد (متن فارسی کاربر دست‌نخورده) → ۲۷/۲۷.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (خطاهای robot3d/ui از قبل بی‌ربط)، eslint پاک، vitest ۲۷/۲۷، E2E مرورگر: هر ۶ صفحهٔ l0-7 فارسی (دیالوگ گروهی + هر ۴ صحنه با همهٔ حالت‌ها + آزمون درست + «پایان» + مدال «استاد ولتاژ و فشار برق»)، EN با rehydrate، موبایل ۳۹۰، رگرسیون l0-6 (و l0-5 دست‌نخورده)، صفر خطای کنسول، زبان به فارسی برگردانده شد.

Stage Summary:
- l0-7 هفتمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد ولتاژ و فشار برق».
- استعارهٔ محوری: ولتاژ = قهرمانِ هل‌دهنده / فشار آبِ منبعِ بلند — متن معلم حرف‌به‌حرف در حباب ربات؛ یادآوری ایمنی ۲۲۰ ولت هم به‌صورت تعاملی (چیپ ⛔) تجربه می‌شود.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-7-images.mjs، scripts/gen-l0-7-fixes.mjs، ۵ تصویر l0-7 (+۱ بکاپ).

---
Task ID: l0-8-current
Agent: Super Z (main)
Task: درس l0-8 «جریان (شدت و تعداد الکترون‌های در حال دویدن)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-8-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-8/): انحراف‌های مستند — #۱ دونده‌های الکترونی به سمت چپ می‌دوند (RTL)؛ #۲ پرامپت انگلیسی کاربر جویبار=چپ/رودخانه=راست بود ولی مشخصهٔ فارسی صفحه صریحاً راست=جویبار/چپ=رودخانه می‌گفت → طبق مشخصهٔ فارسی (همان سیاست RTL مقایسهٔ l0-7)؛ #۴ قهرمان ولتاژ باید همان شخصیت l0-7 باشد؛ #۵ «نماد آمپرسنج (A)» → دیال آمپرسنجی بدون حرف + «دکمهٔ Correct سبز» → نشان تیک سبز + ربات معلم. نسخهٔ اول #۲ (رودخانهٔ واحد با دو توله‌سگ!) و #۴ (قهرمان قرمزِ ناهماهنگ با l0-7) مردود شد → scripts/gen-l0-8-fixes.mjs بازتولید: #۲ اسپلیت‌اسکرین واقعی با خط‌چین عمودی و بدون حیوان، #۴ همان قهرمان آبی‌پوش/شنل‌قرمز/نشان آذرخشِ l0-7 که تیم دونده‌ها را به چپ هول می‌دهد ✓ (نسخه‌های اول در scripts/img-backups/l0-8/).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ۳۶۱۸ به ~۴۲۴۶ خط): RaceFinishScene (صفحهٔ ۱: هر لمسِ SVG → دوندهٔ بعدی از صف راست با transition از خط پایانِ شطرنجی می‌گذرد و بیرون می‌رود + حباب شمارش فارسی ۱..۵ با cq-pop بالای خط + پرچم سبز→رز؛ ۵/۵ → fanfare+sparkle+🎉؛ لمس بعدی ریست؛ الکترون‌ها از VoltElectron موجود)، RiverBrookScene (صفحهٔ ۲: دکمهٔ سه‌سطحی — دستهٔ شیر با rotate 0/65/130 درجه، جویبار با strokeWidth 7/13/21 و قطره‌های animateMotion 2.6/1.5/0.85s و حوضِ بزرگ‌شونده؛ نیمهٔ چپ: حلقهٔ سیم با ۳/۵/۷ الکترون و dur 2.8/1.7/0.95s + لامپ خواب→روشن→پرنور؛ برچسب‌های «آب/سیم») — پیوند مستقیم «آبِ بیشتر = جریان بیشتر»، AmpereDetectiveScene (صفحهٔ ۳: لمس SVG → فاز counting: عقربهٔ ساعتِ کارآگاه با CSS transition می‌چرخد، حباب‌های شمارش ۱..۶ پله‌ای ۲۷۰ms بالای دروازهٔ خط‌چین با blip، بعد فاز done: چیپ نتیجهٔ «۶ الکترون در ۱ ثانیه!» + دروازهٔ رز + sparkle؛ تایمرها در ref با cleanup در unmount؛ باز لمس → شمارش جدید؛ کارآگاه SVG محلی AmpDetective با ذره‌بین/کلاه/ساعت)، VoltageCurrentTeamScene (صفحهٔ ۴: دکمهٔ سه‌سطحی — قهرمانِ VoltageHero موجود با pushing=level>0، حلقهٔ استادیوم با ۳/۵/۷ دونده و dur 3.2/1.9/1.05s، چیپ شمارندهٔ «دونده‌ها: ۳/۵/۷»، 💨 در لِوِل ۲ + ✨). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها (race-finish/river-brook/ampere-detective/voltage-current-team).
- نکتهٔ فنی: reuse مستقیم VoltElectron و VoltageHero از همین ماژول (بدون تغییر امضای آن‌ها)؛ الگوی remount با key={level-i} برای animateMotion مثل WaterPressureScene.
- level0.ts: فقط بلوک l0-8 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل — + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🏃‍♂️ تعداد و شدت حرکت الکترون‌ها در سیم) و بازخورد مدال «کارآگاه و شمارشگر جریان»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «کارآگاه و شمارشگر جریان»»؛ objectives جدید ۴تایی؛ title جدید با عنوان دقیق کاربر؛ emoji 🌊 ماند؛ unlock l0-7 ثابت). دموی قدیمی l0-8 (water-pipes + squeeze-the-pipe) و آزمون سه‌سؤالی قدیمی حذف شد — جایگزین کامل با اسکریپت کاربر. درس‌های دیگر و صحنه‌های قدیمی water-pipes/compare-brightness دست‌نخورده.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود examples/websocket و ui/* بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید — همهٔ خط‌ها زیر سقف ۲۲۰ و آیتم‌های ایموجی‌دار یک‌تکه)، E2E مرورگر: هر ۶ صفحهٔ l0-8 فارسی (دیالوگ گروهی + صحنهٔ مسابقه تا ۵/۵ با fanfare + رودخانه تا لِوِل ۲ + شمارش کارآگاه ۱..۶ + چیپ نتیجه + تیم تا ۷ دونده + آزمون درست + مدال «کارآگاه و شمارشگر جریان»)، EN با rehydrate (تیتر/دیالوگ/صحنه‌ها/آزمون)، موبایل ۳۹۰ (صفحهٔ ۱)، رگرسیون l0-7 موبایل ✓، مسیر یادگیری عنوان جدید را نشان می‌دهد، صفر خطای کنسول، زبان به فارسی برگردانده شد.
- نکتهٔ E2E: دکمهٔ «بعدی» خلاصهٔ آزمون فقط onDone را صدا می‌زند (رفتار قدیمی همهٔ درس‌ها)؛ پیشروی به صفحهٔ مدال با «بعدی» فوتر است — تغییر کد لازم نداشت.

Stage Summary:
- l0-8 هشتمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «کارآگاه و شمارشگر جریان».
- استعارهٔ محوری: جریان = تعداد و شدت دونده‌ها / رودخانهٔ خروشان در برابر جویبارِ آرام — متن معلم حرف‌به‌حرف در حباب ربات؛ برچسب‌های صحنه‌ها افزوده‌های کوتاه دوزبانه با همان لحن.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-8-images.mjs، scripts/gen-l0-8-fixes.mjs، ۵ تصویر l0-8 (+۲ بکاپ).

---
Task ID: l0-9-resistance
Agent: Super Z (main)
Task: درس l0-9 «مقاومت (جاده تنگ و باریک)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-9-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-9/): انحراف‌های مستند — #۱ دونده‌های الکترونی به چپ و نگهبان مقاومت در تنگه؛ #۲ پرامپت انگلیسی شیلنگ=چپ/مقاومت=راست بود ولی مشخصهٔ فارسی صریحاً راست=شیلنگ/چپ=مقاومت می‌گفت → طبق مشخصهٔ فارسی (سیاست RTL مقایسهٔ l0-7/l0-8)؛ #۴ «نماد اهم Ω» حذف شد (متن می‌پزد) و ذره‌بین روی خود نوارهاست؛ #۵ «جام با نماد Ω» → جایزه به شکل خود مقاومت با تاج + «دکمهٔ تیک سبز» → نشان تیک سبز + ربات معلم. نسخه‌های اول #۴ (نوارها کپ شده بود) و #۵ (جام ساده + دکمه‌های فلش اضافه) مردود شدند → scripts/gen-l0-9-fixes.mjs + scripts/gen-l0-9-fix5.mjs (تلاش سوم #۵ با توصیف مستقیم «جایزه = خود مقاومت روی سکو با تاج») ✓ (نسخه‌های اول در scripts/img-backups/l0-9/).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل به ~۴۹۰۰ خط): NarrowRoadScene (صفحهٔ ۱: لمس SVG → حالت آروم: جاده در میانه تنگ می‌شود، الکترون‌ها از ۶تای سریع (0.9s) به ۳تای منظم (2.6s) remount می‌شوند، حبابِ نقل‌قولِ دقیق کاربر «آروم‌تر بچه‌ها!...» ۱.۸ ثانیه، بازوی «ایست» نگهبان بالا می‌رود، لامپ مقصد روشن؛ لمس بعدی برگشت)، PinchPipeScene (صفحهٔ ۲: دکمهٔ سه‌سطحی — دو پنجهٔ رنگ‌پوست با transition به середیهٔ شیلنگ نزدیک می‌شوند (gap 30/20/11)، رگهٔ آب 10/6/3px و قطره‌های 2.4/3.4/4.6s و حوض کوچک‌شونده؛ نیمهٔ چپ: مقاومتِ چهارنواره روی حلقهٔ سیم + الکترون‌های ۶/۴/۲ با dur 1.3/1.9/2.7s + لامپ پرنور→کم‌نور→خواب؛ 🤏 در لِوِل ۲)، LedBodyguardScene (صفحهٔ ۳: دوعاملی — بدون مقاومت: ۶ الکترونِ غرنده (0.8s) + LED قرمزِ داغ با چشم‌های × و دود 💨 و حلقهٔ هشدار پالس‌دار و ⚠️؛ با مقاومت: بادیگاردِ چهارنواره با شنل قرمز و سپر آبی رو به موج + ۲ الکترونِ آروم + LED خندان با هالهٔ تپنده)، ColorBandsScene (صفحهٔ ۴: مقاومت بزرگ SVG با ۴ نوار واقعی قرمز-قرمز-قهوه‌ای-طلایی (۲۲۰Ω)؛ هر نوار role=button با کیبورد هم؛ لمس هر نوار → چیپ معنی («قرمز = ۲»، «قهوه‌ای = ×۱۰»، «طلایی = ±۵٪») + عدد زیر نوار؛ ۴/۴ → چیپ نتیجه «۲۲ × ۱۰ = ۲۲۰ اُهم (Ω)!» + fanfare+sparkle). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها (narrow-road/pinch-pipe/led-bodyguard/color-bands).
- یک باگ در کد جدید خودم پیدا و رفع شد: در ColorBandsScene تابع reveal از seen داخل closure می‌خواند — چند ضربهٔ سریع (تست E2E هم‌زمان ۴ نوار را کلیک کرد) state قبلی را نابود می‌کرد و فقط نوار آخر می‌ماند → functional update (setSeen(prev=>…)) با sfx داخل updater (همان الگوی RaceFinishScene)؛ تست مجدد: هر ۴ چیپ + نتیجه ✓.
- level0.ts: فقط بلوک l0-9 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت و ایتالیک حذف طبق رویهٔ درس‌های قبل — + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🛑 کنترل و کم کردن جریان) و بازخورد مدال «استاد و ترمزشناس مدار»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد و ترمزشناس مدار»»؛ objectives جدید ۴تایی؛ title با عنوان دقیق کاربر «جاده تنگ و باریک»؛ emoji 🚧 ماند؛ unlock l0-8 ثابت). درس قدیمی merge‌شده (لولهٔ تنگ + بادیگارد + دموی MiniLab + ۵ سؤال قدیمی) کامل جایگزین شد؛ صحنه‌های قدیمی water-pipes/bodyguard برای درس‌های دیگر دست‌نخورده ماندند.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود examples/ui بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید)، E2E مرورگر: هر ۶ صفحهٔ l0-9 فارسی (دیالوگ گروهی + سرعت‌گیر با حباب نقل‌قول + شیلنگ تا لِوِل ۲ + بادیگارد LED در هر دو حالت + هر ۴ نوار رنگی با نتیجهٔ ۲۲۰ اُهم + آزمون درست + مدال «استاد و ترمزشناس مدار»)، EN با rehydrate (تیتر/دیالوگ/راهنما/نوارها)، موبایل ۳۹۰ (صفحهٔ ۱)، رگرسیون l0-8 ✓، مسیر یادگیری عنوان جدید، صفر خطای کنسول، زبان به فارسی برگردانده شد.

Stage Summary:
- l0-9 نهمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد و ترمزشناس مدار» — سه‌گانهٔ V-I-R فصل کاوشگر کامل شد.
- استعارهٔ محوری: مقاومت = جادهٔ تنگ و سرعت‌گیرِ مهربون / لولهٔ باریک شیلنگ / بادیگاردِ LED / کد رازآلودِ نوارهای رنگی (۲۲۰ اُهم واقعی) — متن معلم حرف‌به‌حرف در حباب ربات.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-9-images.mjs، scripts/gen-l0-9-fixes.mjs، scripts/gen-l0-9-fix5.mjs، ۵ تصویر l0-9 (+۳ بکاپ).

---
Task ID: l0-10-battery
Agent: Super Z (main)
Task: درس l0-10 «باتری چیست؟ (ایستگاه انرژی)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-10-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-10/): انحراف‌های مستند — #۱ الکترون‌های کوچولو سمت چپِ باتری انرژی می‌گیرند (RTL)؛ #۳ برچسب‌های (+)/(-) حذف شدند (متن نمی‌پزد؛ فقط سرِ قلمبهٔ برجسته و تهِ صاف پهن — برچسب‌های +/− در صحنهٔ SVG خودمان)؛ #۴ «باتری ۹ ولت» بدون رقم («باتری جعبه‌ای مستحکم»)؛ #۵ «دکمهٔ Correct سبز» → نشان تیک سبز + ربات معلم (همان سیاست l0-7/8/9 #5). نسخهٔ اول #۴ مردود شد (۴ استوانه + دو کودک انسانی — نه سکه‌ایِ تخت نه کتابی؛ شکل‌ها آموزشِ همین صفحه‌اند) → scripts/gen-l0-10-fixes.mjs؛ تلاش دوم هنوز جعبه نبود → scripts/gen-l0-10-fix4b.mjs با توصیف مستقیم «مکعب‌ مستطیل، قطعاً نه استوانه» → قلمی + سکه‌ای تخت + جعبه‌ای با دو ترمینال فشاری + سبز قابل‌شارژ ✓ (نسخه‌های اول در scripts/img-backups/l0-10/).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ~۴۸۹۲ به ~۵۵۹۰ خط): BatteryBackpackScene (صفحهٔ ۱: لمس SVG → فلپ کوله‌پشتی با rotate -150 باز می‌شود، ستاره‌های ⭐ cq-float بیرون می‌پرند، ۳ الکترونِ خستهٔ کم‌رمق به دونده‌های پرانرژی remount می‌شوند (dur 1.5s)، لامپ مقصد روشن؛ لمس بعدی برگشت)، BatteryFactoryScene (صفحهٔ ۲: فاز idle/mixing/done با تایمر در ref و cleanup — هر لمس: ۴ قطرهٔ شیمیایی رنگی یکی‌یکی (۳۸۰ms، blip) به جرقهٔ آبی تبدیل می‌شوند، بعد چیپ «انرژی شیمیایی ← انرژی الکتریکی!» cq-pop + جریان نو روی جاده + لامپ روشن؛ در mixing لمس بی‌اثر؛ لمس در done ریست)، BatteryTerminalsScene (صفحهٔ ۳: حلقهٔ کامل از قطب منفیِ تهِ صافِ پهن تا قطب مثبتِ سرِ قلمبه — هر لمس یک دونده با animateMotion one-shot (fill=freeze، dur 3s، در !motion تایمر ۷۰۰ms) می‌فرستد؛ صف راست کم می‌شود، لامپ با اولین رسیدن روشن، رسیده‌ها با ⚡ روی سیمِ بالا کنار + می‌مانند؛ ۳/۳ → fanfare+sparkle؛ در پرواز لمس بی‌اثر؛ لمس بعد از اتمام ریست؛ چیپ‌های «➕ قطب مثبت (سرِ قلمبه)» و «➖ قطب منفی (تهِ صاف)» + نماد‌های +/− روی بدنه)، BatteryFamilyScene (صفحهٔ ۴: ۴ خواهر و برادر قابل‌لمس (role=button + کیبورد) — قلمیِ آبی/سکه‌ایِ تختِ نقره‌ای/کتابیِ نارنجی با دو ترمینال فشاری/قابل‌شارژِ سبز با 🔄 — لمس هرکدام → چیپ نام+ولتاژ (۱.۵/۳/۹/۱.۲ ولت) cq-pop؛ ۴/۴ → چیپ «خانوادهٔ باتری کامل شد! 🎉» + fanfare+sparkle + یادآوری ایمنی در خط وضعیت). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها (battery-backpack/battery-factory/battery-terminals/battery-family).
- دو باگ در کد جدید خودم پیدا و رفع شد: (۱) `!open(0)` باقی‌مانده از صحنهٔ ۱ داخل BatteryFactoryScene (open آنجا اصلاً وجود ندارد) → به شرطِ فازِ ساده تبدیل شد؛ (۲) الگوی رنگی قبلی ColorBands رعایت شد: reveal با functional update و sfx داخل updater تا ضربه‌های هم‌زمان state را نابود نکنند (E2E هر ۴ باتری را هم‌زمان کلیک کرد — هر ۴ چیپ + نتیجه درست آمد).
- level0.ts: فقط بلوک l0-10 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل، شماره‌های «1.» و «2.» طبق سابقهٔ l0-2/l0-4/l0-6 حفظ شد + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: ➖ قطب منفی (تهِ صاف باتری)) و بازخورد مدال «استاد باتری‌شناس»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد باتری‌شناس»»؛ objectives جدید ۴تایی؛ title دقیق کاربر «باتری چیست؟ (ایستگاه انرژی)»؛ emoji 🔋 ماند؛ minutes 6→8 هماهنگ با فرمت جدید؛ unlock l0-9 ثابت). دموی قدیمی battery-anatomy + ولتاژ-دایال demo + آزمون سه‌سؤالی قدیمی کامل حذف شد — doc/c/w همچنان توسط ثابت‌های ماژول و L0_QUIZ_CIRCUITS استفاده می‌شوند (import بدون تغییر سالم ماند). درس‌های دیگر و صحنهٔ قدیمی battery-anatomy در رجیستری دست‌نخورده ماندند.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود examples/ui بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید — همهٔ خط‌ها زیر سقف ۲۲۰ و آیتم‌های ایموجی‌دار یک‌تکه)، E2E مرورگر: هر ۶ صفحهٔ l0-10 فارسی (دیالوگ گروهی + کوله‌پشتی باز با ستاره‌ها + کارخانه تا تبدیل هر ۴ قطره و چیپ تبدیل + هر ۳ دوندهٔ حلقهٔ قطب‌ها با ⚡ و مدال پایان + هر ۴ باتری با چیپ ولتاژ و نتیجه + آزمون درست «۱ از ۱» + مدال «استاد باتری‌شناس»)، EN با rehydrate (تیتر/دیالوگ/صحنه‌ها/آزمون/چیپ «Pencil (AA): 1.5 V»)، موبایل ۳۹۰ (صفحهٔ ۱ + تعامل)، رگرسیون l0-9 (سرعت‌گیر ✓)، مسیر یادگیری «باتری چیست؟ (ایستگاه انرژی) ~۸ دقیقه» بعد از مقاومت، صفر خطای کنسول، زبان به فارسی برگردانده شد.
- نکتهٔ E2E: دکمهٔ خلاصهٔ آزمون در این درس «پایان» است (نه «بعدی») و بعدش «بعدی» فوتر پیش می‌برد — رفتار قدیمی همهٔ درس‌ها، تغییر کد لازم نداشت.

Stage Summary:
- l0-10 دهمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد باتری‌شناس».
- استعارهٔ محوری: باتری = ایستگاهِ انرژیِ کوچک و سفری / کوله‌پشتیِ خوراکیِ الکترون‌ها / قلک جادویی — متن معلم حرف‌به‌حرف در حباب ربات؛ قطب‌ها به‌صورت تجربهٔ تعاملی (سفر از ➖ صاف تا ➕ قلمبه).
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-10-images.mjs، scripts/gen-l0-10-fixes.mjs، scripts/gen-l0-10-fix4b.mjs، ۵ تصویر l0-10 (+۲ بکاپ).

---
Task ID: l0-11-wire
Agent: Super Z (main)
Task: درس l0-11 «سیم چیست؟ (بزرگراه الکترون‌ها)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-11-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-11/): انحراف‌های مستند — #۱ و #۲ ماشین‌های الکترونی/سرخوردن به سمت چپ (RTL)؛ #۳ تیک سبز به‌صورت نشانِ تیک ساده (سمبل، نه متن)؛ #۵ «دکمهٔ Correct سبز» → نشان تیک سبز + ربات معلم (همان سیاست l0-7…l0-10 #5). نسخهٔ اول #۳ مردود شد (بچه با کلاه فضانوردی قرمز — نه سیم نه روپوش!) → scripts/gen-l0-11-fixes.mjs (روپوشِ قرمزِ پرسونا سیم را در آغوش گرفته — قابل قبول ولی بدون دست کودک) → scripts/gen-l0-11-fix3b.mjs با ترکیب‌بندی قیدشده: کابل قرمزِ افقی با چهرهٔ خندان + رشته‌های مسی در سرِ چپ + دستِ کودک وسط + تیک سبز ✓ بی‌نقص (نسخه‌های اول در scripts/img-backups/l0-11/).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ~۵۵۸۹ به ~۶۱۶۴ خط): WireHighwayScene (صفحهٔ ۱: لمس SVG → چراغ راهنما قرمز→سبز با هاله، ۶ ماشینِ الکترونیِ دو رنگ در دو بانده با animateMotion به چپ (dur 3.2/4.1s، remount با key، پارک→حرکت)، لامپ مقصد روشن + 💨✨؛ لمس بعدی توقف)، CopperHeartScene (صفحهٔ ۲: ۴ رشتهٔ مسیِ موج‌دار از کدر (#b45309) به براق (#fbbf24 + هالهٔ پهن + خطِ هایلایت) با transition؛ ۳ الکترونِ منتظرِ سرِ راست → سرخوردن مثل سرسره روی مسیرهای راست‌به‌چپِ همان رشته‌ها (dur 2.4-3.4s)؛ چیپ «مس = رسانای عالی»؛ روکش قرمزِ برشی در دو سرِ لوله)، SafetyJacketScene (صفحهٔ ۳: روپوش قرمزِ خندان با آستین از بالا با translateY transition روی سیمِ سه‌رشته‌ای مسی می‌آید؛ بدون روپوش: ۲ الکترونِ فراری با خط‌چین پرش + چیپ ⚠️ + وضعیت رز؛ با روپوش: ۳ الکترونِ مهارشده زیر روپوش می‌دوند (روپوش بعد از الکترون‌ها رسم می‌شود تا بپوشاندشان) + چیپ ✅ کنار دستِ کودکِ ثابت (کف دست + ۳ انگشت)؛ لمس بعدی برگشت)، ClipJumperScene (صفحهٔ ۴: سه‌فازی hover→open→bitten — فک‌های سوسماری سبز با rotate ±30/32 درجه باز می‌شوند، مجموعهٔ گیره+سیمِ دُم با translateY(34) ease-in «تُق» پایین می‌آید و روی پایهٔ ترمینال می‌گیرد؛ لامپ روشن + ۳ الکترون روی سیم دُم به سمت بالا-راست + ✨⚡؛ بردبورد کوچک با ۱۶ سوراخ و دو جامپرِ قرمز/آبی با نوک فلزی + چیپ «جامپر» پایین-چپ، چیپ «گیره سوسماری» بالا). رجیستری scenes.tsx: +۴ case و ایمپورت‌ها (wire-highway/copper-heart/safety-jacket/clip-jumper).
- یک اشتباه خودم حین کار پیدا و رفع شد: در ایمپورت scenes.tsx به‌اشتباه BatteryTerminalsScene را دوباره اضافه کردم (از l0-10 از قبل بود) → ردیف تکراری حذف شد؛ tsc تأیید کرد.
- level0.ts: فقط بلوک l0-11 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🚀 چون مس رسانای عالیه) و بازخورد مدال «استاد و بزرگراه‌شناس مدار»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد و بزرگراه‌شناس مدار»»؛ objectives جدید ۴تایی؛ title دقیق کاربر؛ emoji 🧵 ماند؛ minutes 5→8 هماهنگ با فرمت جدید؛ unlock l0-10 ثابت). دموی قدیمی wire-anatomy + انیمیشن electron-flow + آزمون سه‌سؤالی قدیمی کامل حذف شد؛ صحنهٔ قدیمی wire-anatomy در رجیستری برای درس‌های دیگر دست‌نخورده ماند.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود examples/ui بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید)، E2E مرورگر: هر ۶ صفحهٔ l0-11 فارسی (دیالوگ گروهی + بزرگراه تا سبز شدن چراغ + درخشش مس با سرسرهٔ الکترون‌ها + روپوش در هر دو حالت + گیره تا گازگرفتن و روشن‌شدن لامپ + آزمون درست «۱ از ۱» + مدال «استاد و بزرگراه‌شناس مدار»)، EN با rehydrate (تیتر/دیالوگ/صحنه‌ها/آزمون + تعامل EN «Traffic is flowing!»)، موبایل ۳۹۰ (صفحهٔ ۱ + تعامل)، رگرسیون l0-10 (کوله‌پشتی ✓)، مسیر یادگیری «سیم چیست؟ (بزرگراه الکترون‌ها) ~۸ دقیقه» بعد از باتری، صفر خطای کنسول، زبان به فارسی برگردانده شد.

Stage Summary:
- l0-11 یازدهمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد و بزرگراه‌شناس مدار».
- استعارهٔ محوری: سیم = بزرگراهِ اختصاصیِ الکترون‌ها / قلبِ مسیِ درخشان / روپوشِ ایمنیِ پلاستیکی / گیره سوسماری و جامپر — متن معلم حرف‌به‌حرف در حباب ربات.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-11-images.mjs، scripts/gen-l0-11-fixes.mjs، scripts/gen-l0-11-fix3b.mjs، ۵ تصویر l0-11 (+۲ بکاپ).

---
Task ID: l0-12-led
Agent: Super Z (main)
Task: درس l0-12 «ال‌دی‌دی (LED) چیست؟ (قهرمان نور)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-12-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-12/): انحراف‌های مستند — #۲ علامت‌های متنی (+)/(-) روی پایه‌ها حذف شدند (پایهٔ بلند/کوتاه + فلش‌های یک‌طرفه ماندند؛ برچسب +/− در صحنهٔ SVG خودمان)؛ #۵ «دکمهٔ Correct سبز» → نشان تیک سبز + ربات معلم (همان سیاست l0-7…l0-11 #5). نسخه‌های مردود: #۲ دور ۱ لامپ رشته‌ای با پیچ Waslnormal بود و دور ۲ هم لامپ پیچی بدون پایه → scripts/gen-l0-12-fixes.mjs (#۴ هم دور ۱ «پسر ابرقهرمان انسانی» بود بدون مقاومت — همان ردِ l0-10 #4؛ دور ۲ مقاومتِ راه‌راهِ شنل‌پوش با سپر ✓ قبول) و scripts/gen-l0-12-fix2b.mjs (#۲ دور ۳ با ترکیب‌بندی کاملاً مقیدشده: گنبد قرمز + دو پایهٔ سیمیِ راست که چپ دو برابر بلندتر + الکترون‌های خندان روی سیم ✓ قبول). #۱ و #۳ و #۵ دور اول قبول شدند. نسخه‌های اول در scripts/img-backups/l0-12/.
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ~۶۱۶۴ به ~۶۸۹۹ خط): LedHeroScene (صفحهٔ ۱: لمس SVG → ۷ پرتو رنگین‌کمانی پشت کلاه جادوگر با نبض opacity، ۳ الکترونِ منتظر به جریان ورودی remount می‌شوند (animateMotion dur 2.2s به سمت پایهٔ راست، RTL)، هالهٔ طلایی + ✨⭐؛ لمس بعدی خاموش)، LedLegsScene (صفحهٔ ۲: سه‌فازی idle→wrong→right — لمس اول LED برعکس جا می‌خورد (پایه‌ها swap می‌شوند، الکترون‌ها پشت ⛔ می‌ایستند، دهانِ خطِ بی‌تفاوت، «ناراحت نیست فقط خاموشه»)، لمس دوم درست جا می‌خورد (پایهٔ بلند در لولهٔ ➕ قرمز از باتریِ سرقلمبه، پایهٔ کوتاه در لولهٔ ➖ تاریک، ۲ الکترون ورودی + ۲ خروجی repeat، هاله + ✨⚡)، لمس سوم ریست؛ چیپ‌های «➕ پایهٔ بلندتر»/«➖ پایهٔ کوتاه‌تر» فقط در حالت معلق)، LedRainbowScene (صفحهٔ ۳: ۵ خواهر و برادر قابل‌لمس دست‌درهم (قرمز/سبز/آبی/زرد/بنفش، role=button + کیبورد) — لمس هرکدام → گنبد به رنگ خودش روشن + هاله + چیپ رنگ (🔴 قرمز…) cq-pop؛ ۵/۵ → چیپ «رنگین‌کمانِ LEDها کامل شد! 🎉» + fanfare+sparkle؛ reveal با functional update و sfx داخل updater)، LedResistorScene (صفحهٔ ۴: قبل از محافظ ۴ الکترونِ تند (dur 0.85s) + LED صورتیِ داغ با لرزش animateTransform ±۲ درجه + 💢💨 + چیپ ⚠️؛ لمس → مقاومتِ ابرقهرمانِ راه‌راه با شنل و سپر⭐ از بالا فرود می‌آید (translate transition 0.45s)، الکترون‌ها آروم (۳ عدد، dur 2.6s)، LED طلاییِ خندان با هاله + حبابِ نقل‌قول «آروم وارد بشید تا دوستمون آسیب نبینه!»؛ لمس بعدی برگشت). رجیستری scenes.tsx: +۴ ایمپورت و +۴ case (led-hero/led-legs/led-rainbow/led-resistor). صحنه‌های قدیمی از جمله led-anatomy دست‌نخورده ماندند.
- level0.ts: فقط بلوک l0-12 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون، ستارهٔ بولت و * ایتالیکِ نقل‌قول حذف طبق رویهٔ درس‌های قبل، شماره‌های «1.» و «2.» طبق سابقهٔ l0-2…l0-11 حفظ شد + «یک‌طرفه‌ است» با همان نیم‌فاصلهٔ کاربر + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: ➕ پایهٔ بلندتر (قطب مثبت)) و بازخورد مدال «استاد و قهرمان نور»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد و قهرمان نور»»؛ objectives جدید ۴تایی؛ title دقیق کاربر با «ال‌دی‌دی» (نسخهٔ قدیمی «ال‌ای‌دی» بود)؛ emoji 💡 ماند؛ minutes 6→8 هماهنگ با فرمت جدید؛ unlock l0-11 ثابت). آزمون‌های سه‌تاییِ قدیمی (mcq/trueFalse/mcq) کامل حذف شدند — کاربر فقط یک سؤال داده بود.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود examples/robot3d بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید + صفحهٔ آزمون)، E2E مرورگر: هر ۶ صفحهٔ l0-12 فارسی (دیالوگ گروهی حرف‌به‌حرف + قهرمان نور تا هاله و پرتوها + برعکس/درست با ⛔ و ۴ الکترون جاری + هر ۵ رنگ با چیپ و «رنگین‌کمانِ LEDها کامل شد! 🎉» + مقاومت تا فرود و حباب نقل‌قول + آزمون درست «۱ از ۱» + مدال «استاد و قهرمان نور» با هر ۴ هدف)، EN با rehydrate (تیتر «What is an LED? (The light hero)»/دیالوگ/صحنه‌ها/چیپ‌های Red…Purple/آزمون + توضیح «Bravo, my clever explorer!…»)، موبایل ۳۹۰ (بدون سرریز افقی + تعامل روشن‌شدن)، رگرسیون l0-11 (بزرگراه: ۶ ماشین متحرک ✓)، مسیر یادگیری «ال‌دی‌دی (LED) چیست؟ (قهرمان نور) ~۸ دقیقه» بین سیم و کلید (۱۱→۱۲→۱۳)، صفر خطای کنسول، زبان به فارسی برگردانده شد. اسکرین‌شات‌های صحنه‌ها در scripts/e2e-l0-12/.
- نکتهٔ E2E: همان رفتار قدیمی l0-10 — «بررسی» → «بعدی» صفحه → دکمهٔ «پایان» خلاصه → «بعدی» فوتر؛ دو «بعدی» هم‌زمان روی صفحه (حباب دیالوگ + فوتر) → همیشه آخری فوتر است.

Stage Summary:
- l0-12 دوازدهمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد و قهرمان نور».
- استعارهٔ محوری: LED = جادوگرِ کوچولوی نور / خیابان یک‌طرفهٔ پایه‌بلند-پایه‌کوتاه / رنگین‌کمان ۵ رنگ / محافظِ شنل‌پوشِ مقاومت — متن معلم حرف‌به‌حرف در حباب ربات.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-12-images.mjs، scripts/gen-l0-12-fixes.mjs، scripts/gen-l0-12-fix2b.mjs، ۵ تصویر l0-12 (+۳ بکاپ).

---
Task ID: l0-13-switch
Agent: Super Z (main)
Task: درس l0-13 «کلید چیست؟ (پلیس راهنما)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر.

Work Log:
- تصاویر (scripts/gen-l0-13-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-13/): انحراف‌های مستند — #۱ متنِ «GO» روی تابلو حذف شد (تابلوی پدالیِ سبزِ ساده ماند؛ نمادِ تابلو در صحنهٔ SVG خودمان)؛ #۵ «ربانِ تیک سبز» به‌صورت نشانِ تیک سبز ماند (سمبل، نه متن — همان سیاست l0-7…l0-12 #5) + ربات معلم اضافه شد. هر ۵ تصویر دور اول قبول شدند (بدون بکاپ).
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ~۶۸۹۹ به ~۷۶۹۱ خط): SwitchPoliceScene (صفحهٔ ۱: پلیسِ کلید با کلاه راهنمایی و راکرِ سینه‌ای که با وضعیت می‌چرخد — لمس SVG → تابلوی پدالی قرمزِ ✋ به سبزِ تیک cq-pop تبدیل می‌شود، ۳ الکترونِ منتظر به جریان remount می‌شوند (animateMotion dur 2.2s روی جادهٔ راه‌راه، RTL)، چراغِ روی پایه روشن + هالهٔ نبض‌دار + ✨⚡)، SwitchBridgeScene (صفحهٔ ۲: برشِ کلید با بدنهٔ U باز از بالا — لمس → پلِ فلزی با دستگیرهٔ قرمز حول لولای چپ از ‎-24° به ۰° می‌آید (transition 0.3s)، پدهای نقره‌ای هاله می‌گیرند، ۲+۲+۲ الکترون روی سه مسیر IN/OUT/RET جاری می‌شوند و واقعاً پشت بدنه پنهان می‌شوند (ترتیب رسم)، LED طلایی + ⛔ و حلقهٔ شکاف قرمز در حالت باز)، SwitchFamilyScene (صفحهٔ ۳: سه عضو قابل‌لمس role=button + کیبورد — راکرِ الاکلنگی ±۱۱° می‌چرخد، دکمهٔ فشاری ۴px فرو می‌رود و زنگ بالای سرش می‌لرزد (animateTransform ±16° ×4) + چیپ «🔔 دینگ‌دونگ!» cq-pop + sfx.blip دوبل (دینگ-دونگ) + آزادسازی خودکار ۷۰۰ms با تایمرهای useRef و cleanup، کلید کشویی دستگیرهٔ بنفش را با transition cx جابه‌جا می‌کند؛ چیپ نام فارسی/انگلیسی زیر هر عضو)، SwitchPositionScene (صفحهٔ ۴: حلقهٔ مدار با ۳ ایستگاهِ خط‌چین — لمس کلیدِ مسافر → هاپ به ایستگاه بعدی (translate transition 0.45s، whoosh، نشانگر ایستگاه آبی می‌شود) و چراغ همه‌جا روشن می‌ماند؛ چیپ ON/OFF مستقل → پلِ داخلی ‎-22° بالا می‌رود، ⛔ و صفِ الکترون کنار کلید، باتری 💤 و LED 💤، نشانِ «روشن/خاموش» سبز/قرمز). رجیستری scenes.tsx: +۴ ایمپورت و +۴ case (switch-police/switch-bridge/switch-family/switch-position). صحنهٔ قدیمی switch-door در رجیستری دست‌نخورده ماند.
- level0.ts: فقط بلوک l0-13 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت حذف طبق رویهٔ درس‌های قبل، «میشه/میفتند/دکمه فشاری» با همان املای کاربر + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🔴 جاده باز میشه) و بازخورد مدال «استاد و پلیس راهنمای مدار»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد و پلیس راهنمای مدار»»؛ objectives جدید ۴تایی؛ title دقیق کاربر؛ emoji 🚪 → 🚦 (استعارهٔ قدیمیِ «در» حذف شده بود و کاربر 🚦 را در تیتر صفحهٔ ۱ آورده بود)؛ minutes 5→8 هماهنگ با فرمت جدید؛ unlock l0-12 ثابت). آزمون سه‌تاییِ قدیمی (mcq/trueFalse/mcq) کامل حذف شد — کاربر فقط یک سؤال داده بود.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود robot3d بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته (یک خطای react-hooks/refs روی keyTap(pressPush) با inline‌کردن onKeyDown رفع شد)، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید + صفحهٔ آزمون)، E2E مرورگر: هر ۶ صفحهٔ l0-13 فارسی (دیالوگ گروهی حرف‌به‌حرف با poller زمان‌بندی + تابلوی سبز تا روشن‌شدن چراغ + پل تا اتصال و جریان ۳ مسیره + دینگ‌دونگ با چیپ و لرزش زنگ + راکر/کشویی + ایستگاه ۲ و ۳ + خاموشی و 💤 باتری + آزمون درست «۱ از ۱» + مدال «استاد و پلیس راهنمای مدار» با اهداف)، EN با rehydrate (تیتر «What is a switch? (The traffic officer)»/هر ۴ صفحه دیالوگ/آزمون «You got 1/1 correct» + «The Master and Circuit-Police Medal»/تعامل EN «The green GO sign is up!…»)، موبایل ۳۹۰ (سرریز افقی صفر + تعامل)، رگرسیون l0-12 (قهرمان نور روشن ✓)، مسیر یادگیری «کلید چیست؟ (پلیس راهنما) ~۸ دقیقه» بین LED و نمادها (۱۱→۱۲→۱۳→۱۴)، صفر خطای کنسول، زبان به فارسی برگردانده شد. اسکرین‌شات‌ها در scripts/e2e-l0-13/.
- نکتهٔ E2E: دکمهٔ ادامهٔ دیالوگ در EN «👆 Tap for more…» است (نه Tap to continue)؛ فوترِ بعدی/Next دیالوگِ ناتمام را رد می‌کند و مستقیم صفحهٔ بعد می‌رود؛ جملات بلندِ پاراگراف‌ها بین خطوط حباب split می‌شوند — بررسی verbatim باید جمله‌به‌جمله یا با pollerِ متنِ انباشته باشد.

Stage Summary:
- l0-13 سیزدهمین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد و پلیس راهنمای مدار».
- استعارهٔ محوری: کلید = پلیسِ راهنمای مدار / پلِ بازشوندهٔ داخل کلید / خانوادهٔ راکر-فشاری-کشویی / جایگاهِ آزاد روی جادهٔ الکترون‌ها — متن معلم حرف‌به‌حرف در حباب ربات.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-13-images.mjs، ۵ تصویر l0-13.

---
Task ID: l0-14-symbols
Agent: Super Z (main)
Task: درس l0-14 «نقشه و نمادهای مدار (زبان رازآلود مهندسان)» با اسکریپت دقیق کاربر (۵ صفحه) — بدون تغییر حتی یک حرف از متن‌های اسلاید؛ بدون دست‌زدن به درس‌های دیگر. پایان فصل کاوشگر الکترونیک.

Work Log:
- تصاویر (scripts/gen-l0-14-images.mjs از پرامپت‌های انگلیسی دقیق کاربر + دم no-text؛ 1344x768 در public/images/lessons/l0-14/): انحراف‌های مستند — #۲ حروف (+)/(-) درخواست نشد (متن نمی‌پزد؛ کنتراست خطِ بلند-نازک/کوتاه-ضخیم ماند؛ نشان‌های +/− در صحنهٔ SVG خودمان)؛ #۵ «دکمهٔ Correct سبز» → نشان تیک سبز (سمبل، نه متن) + ربات معلم (همان سیاست l0-7…l0-13 #5). نسخه‌های اول #۲ (+ غول‌پیکر به‌جای دو خط موازی!) و #۳ (عروسکِ دکمه‌ای + حلقهٔ مثلثی بدون پلِ کج و فلش) مردود شدند → scripts/gen-l0-14-fixes.mjs با ترکیب‌بندی مقیدشده («دو خطِ عمودیِ موازیِ کوتاه: بلندترِ نازک + کوتاه‌ترِ ضخیم مثل کتاب درسی» / «سیمِ افقی با شکاف و اهرمِ کجِ معلق مثل پلِ باز + مثلث با خط عمود و دو فلش نورانی») ✓ هر دو قبول (نسخه‌های اول در scripts/img-backups/l0-14/). #۱ طومار کهن با ردپای مدار درخشان، #۴ کودکِ نقشه‌خوان روی تبلت و #۵ جامِ نقشهٔ آبی + تیک سبز + ربات دور اول قبول شدند.
- صحنه‌های تعاملی جدید در story-scenes.tsx (فقط افزودنی؛ فایل از ~۷۶۹۵ به ~۸۴۷۵ خط): TreasureMapScene (صفحهٔ ۱: لمس SVG → طومارِ پارچمنت با CSS transition به نقشهٔ خط‌دار آبی (شبکهٔ blueprint) تبدیل می‌شود، ۳ وسیلهٔ واقعی (باتری خندان/کلید با اهرم کج/LED گنبدی) محو و نمادهای خطی‌شان با cq-pop پله‌ای (0/0.15/0.3s) ظاهر می‌شوند: باتری=دو خط عمودی موازی (+ بلند نازک، − کوتاه ضخیم)، کلید=دو نقطه + پلِ کجِ باز، LED=مثلث رو به چپ + خط عمود + دو فلش طلایی؛ چیپ نام فارسی/انگلیسی زیر هر نماد؛ sfx.open + sparkle)، BatteryWireSymbolScene (صفحهٔ ۲: باتری قلمی واقعی (راست) در برابر نمادش (چپ، دو خط افقی موازی روی هم)؛ هر خط role=button + کیبورد — لمس خطِ بلند → دایرهٔ سبزِ + بالای آن + چیپ «سرِ قلمبه = ➕»، لمس خطِ کوتاه → دایرهٔ سرخِ − زیر آن + چیپ «تهِ صاف = ➖»؛ درس سیم پایین: دو خط صاف که با نقطه به هم می‌رسند + برچسب «سیم‌ها = خط‌های صاف»؛ ۲/۲ → fanfare+sparkle؛ reveal با functional update و sfx داخل updater (الگوی ضدریس l0-9/l0-10))، SwitchLedSymbolScene (صفحهٔ ۳: نماد کلید (دو نقطه + اهرم نارنجیِ کج ‎-26°) و نماد LED (مثلث رو به چپ + خط عمود) روی یک سیم با باتری نمادین سرِ راست؛ لمس SVG → اهرم با rotate transition صاف می‌شود، ۳ الکترونِ خندان با animateMotion راست‌به‌چپ (dur 2s) جاری می‌شوند، مثلث طلایی + هالهٔ تپنده + دو فلش نورانی با opacity pulse بیرون می‌پرند؛ چیپ «پلِ کج = کلیدِ باز» ↔ «پلِ صاف = کلیدِ بسته» (سبز/سرخ) + چیپ «مثلث + خط + فلش‌ها = LED»)، MapTraceScene (صفحهٔ ۴: نقشهٔ حلقهٔ آبیِ درخشان (زیرِ پهن #7dd3fc + روکش #0ea5e9) با باتری عمودیِ راست (+ سرِ قلمبه بالا، − تهِ صاف پایین) و ۴ ایستگاهِ خط‌چین — هر لمس الکترون را یک پله جلو می‌برد (animateMotion one-shot fill=freeze، durهای 1.4/1.5/2.6/2.4s، قفلِ flying با تایمر ref + cleanup): − ➔ کلید (پلِ کج که با رسیدن صاف می‌شود) ➔ مقاومتِ چهارنواره ➔ بالا از سمت چپ ➔ LED (مثلث + فلش‌ها + هاله) ➔ قطب مثبت؛ سگمنتِ طی‌شده با روکش تیره‌تر #0284c7 هایلایت، حلقهٔ ایستگاه پر می‌شود، چیپ شماره‌دار «۱. کلید 🎛️…۴. قطب مثبت ➕» با cq-pop؛ ۴/۴ → fanfare+sparkle + چیپ پایان؛ لمس بعدی ریست). رجیستری scenes.tsx: +۴ ایمپورت و +۴ case با کامنت l0-14 (treasure-map/battery-wire-symbol/switch-led-symbol/map-trace). صحنهٔ قدیمی symbol-grid در رجیستری دست‌نخورده ماند.
- نکتهٔ فنی: در MapTraceScene الگوی TERM3 (l0-10) با nextStep بسته‌شده در closure (به‌جای خواندن state داخل تایمر) بازنویسی شد تا fanfareِ پایان دقیقاً بعد از پلهٔ ۴ بیاید؛ در TreasureMapScene از transitionِ CSSِ fill/stroke برای طومار استفاده شد (بدون remount).
- level0.ts: فقط بلوک l0-14 بازنویسی شد (فرمت جدید: ۴ صفحهٔ ربات‌روایت با متن‌های کاربر حرف‌به‌حرف — فقط ** مارک‌داون و ستارهٔ بولت/ایتالیک حذف طبق رویهٔ درس‌های قبل، شماره‌های «1.» و «2.» و زیرخط‌های «خط بلندتر… ➔ قطب مثبت (+)» حفظ شد + ترجمهٔ انگلیسی بچه‌گانه؛ صفحهٔ ۵ آزمون با سؤال و دو گزینهٔ دقیق کاربر (پاسخ: 🔋 دو تا خط موازی (یکی بلند برای مثبت، یکی کوتاه برای منفی)) و بازخورد مدال «استاد نقشه‌خوانی و مهندس مدار»؛ reward با تصویر جشن؛ rewardBadge «مدال افتخارِ «استاد نقشه‌خوانی و مهندس مدار»»؛ objectives جدید ۴تایی؛ title و emoji 🔤 قدیمی دقیقاً ماند؛ minutes 6→8 هماهنگ با فرمت جدید؛ unlock l0-13 ثابت). آزمون چهارسؤالیِ قدیمی (identify×3 + mcq) و دموی symbol-grid کامل حذف شدند — کاربر فقط یک سؤال داده بود.
- تأیید: tsc صفر خطا در فایل‌های تغییریافته (فقط خطاهای ازقبل‌موجود ui/* بی‌ربط)، eslint پاک روی ۳ فایل تغییریافته، vitest ۲۷/۲۷ (شامل verbatim دیالوگ fa+en برای هر ۴ صفحهٔ جدید + صفحهٔ آزمون)، E2E مرورگر: هر ۶ صفحهٔ l0-14 فارسی (دیالوگ گروهی حرف‌به‌حرف + طومار تا نقشهٔ آبی با ۳ نماد و چیپ‌ها + خطِ بلند/کوتاه با + و − و درس سیم + پلِ کج تا صاف‌شدن و فلش‌های نور + هر ۴ پرش نقشه تا «دور کامل شد!…۱۰۰٪» + آزمون درست «۱ از ۱» + مدال «استاد نقشه‌خوانی و مهندس مدار» با هر ۴ هدف)، EN با rehydrate (تیتر «The engineers' treasure map!»/دیالوگ/چیپ‌های switch…resistor/آزمون + «Master of map-reading and circuit engineer»/مدال EN)، موبایل ۳۹۰ (بدون سرریز افقی قبل و بعد از تعامل + طومار)، رگرسیون l0-13 (پلیس راهنما تا تابلوی سبز ✓)، مسیر یادگیری «نقشه و نمادهای مدار (زبان رازآلود مهندسان) ~۸ دقیقه» به‌عنوان درس ۱۴، صفر خطای کنسول، زبان به فارسی برگردانده شد. اسکرین‌شات‌ها در scripts/e2e-l0-14/.
- نکتهٔ E2E: SVG.role=button با dispatchEvent(new MouseEvent('click')) قابل لمس است (svg.click() وجود ندارد)؛ رفتار «بعدی» فوتر مثل درس‌های قبل: دیالوگِ ناتمام را رد می‌کند؛ درس با «پایان» خلاصهٔ آزمون + «بعدی» فوتر به مدال می‌رسد.

Stage Summary:
- l0-14 چهاردهمین و آخرین درس فرمت-جدید فصل کاوشگر شد: ۶ صفحه = ۴ صفحهٔ تصویری تعاملی + آزمون + مدال «استاد نقشه‌خوانی و مهندس مدار» — فصل کاوشگر الکترونیک (۱۴ درس) کامل شد.
- استعارهٔ محوری: نمادها = زبان رازآلودِ نقشهٔ گنجِ مهندسان / طومارِ پارچمنت → نقشهٔ خط‌دار آبی / دو خطِ موازی به‌جای باتری / پلِ کج‌وباز به‌جای کلید / مثلث+خط+فلش‌های نور به‌جای LED / دورِ کاملِ نقشه‌خوانی از ➖ تا ➕ — متن معلم حرف‌به‌حرف در حباب ربات.
- فایل‌ها: src/components/lesson/story-scenes.tsx، src/components/lesson/scenes.tsx، src/content/levels/level0.ts، scripts/gen-l0-14-images.mjs، scripts/gen-l0-14-fixes.mjs، ۵ تصویر l0-14 (+۲ بکاپ).
