# CircuitQuest — Phase 1 Architecture

> Working title: **CircuitQuest** (rename freely). An offline-first, gamified electronics
> laboratory for beginners aged 8–16. Educational structure informed by the pedagogical
> progression of "Electronics for Kids, 2nd Ed." (Øyvind Nydal Dahl) and the interactive
> circuit-building concept popularized by Tinkercad Circuits. **All explanations, text,
> visuals, exercises, quizzes, and project instructions are 100% original.**

---

## A. Technology Stack (and why)

### Decision: TypeScript web-native stack, packaged for Android with Capacitor

| Layer | Choice | Version |
|---|---|---|
| Framework | **Next.js (App Router) + React** | Next 16 / React 19 |
| Language | **TypeScript (strict mode)** | 5.x |
| Styling / DS | **Tailwind CSS 4 + shadcn/ui primitives** (custom design system on top) | TW 4 |
| Circuit canvas | **Custom SVG renderer** (hand-rolled pointer interaction — no heavy graph lib) | — |
| State | **Zustand** (+ `useSyncExternalStore` for simulator snapshots) | 5 |
| Persistence | **Dexie (IndexedDB)** behind repository interfaces | 4 |
| Content validation | **Zod** schemas, validated at build/test time | 4 |
| i18n | **next-intl** (ICU messages, RTL-ready) | 4 |
| Animation | **Framer Motion**, gated by reduced-motion setting | 12 |
| Icons | **lucide-react** + original SVG component art | — |
| PWA / offline | **Serwist** service worker (all content bundled → fully offline) | — |
| Testing | **Vitest** (engine golden tests + content schema tests) | 3 |
| Native shell | **Capacitor 7** (Phase 3: wraps the same codebase as an Android/iOS app) | 7 |

### Why NOT Flutter (explicit justification)

1. **Immediate runnability.** This build environment has no Flutter SDK and no Android
   toolchain, so a Flutter codebase could not be executed, demonstrated, or verified here —
   it would be un-runnable paper code. The chosen stack produces a live, testable app
   (web preview + installable PWA on Android) in this workspace, today.
2. **One codebase → Android, iOS, Web, Tablet.** The platform requirement explicitly asks
   for later adaptation to iOS/Web/Tablet. React + Capacitor achieves exactly that: the same
   TypeScript code runs as an installable Android app (Capacitor wraps it in a native shell
   with plugin access to haptics, notifications, filesystem) *and* as a web app.
3. **The product is vector-graphics-centric.** The circuit lab is SVG all the way down:
   pins, wires, symbols, hit-testing, zoom/pan. React's declarative model + the DOM's
   built-in pointer/hit-testing makes the editor dramatically simpler and more maintainable
   than hand-rolled `CustomPainter` gesture disambiguation.
4. **Compute is a non-issue.** The simulator solves tiny dense matrices (< 60×60) per frame —
   well under 1 ms on low-end phones. Native performance gains would be unnoticeable.
5. **One language everywhere.** Content schemas, simulation engine, gamification rules, and
   UI are all TypeScript — one type system guarding the whole pipeline.

**Trade-off noted:** if a fully native (non-webview) app is ever mandated, the domain layer
(engine, content schemas) is framework-free TypeScript and the UI layer could be re-skinned;
Capacitor-first is the pragmatic path and is the recommendation.

---

## B. Complete Architecture

### Layer diagram

```
┌─────────────────────────── PRESENTATION ────────────────────────────────────────┐
│  Next.js App Router · React 19 · Tailwind 4 design system                       │
│  Screens: HOME · LEARN · LAB · PROJECTS · CHALLENGES · PROGRESS · PROFILE ·     │
│           SETTINGS                                                              │
│  Lesson Player (screen-type renderer registry)     Lab Editor (SVG canvas)      │
│  Component art (original SVG symbols)              Quiz renderers               │
├─────────────────────────── APPLICATION / STATE ─────────────────────────────────┤
│  Zustand stores: progressStore · labStore · settingsStore · sessionStore        │
│  Simulator binding: rAF loop → snapshot store (useSyncExternalStore)            │
├─────────────────────────── DOMAIN (pure TypeScript, zero framework imports) ────┤
│  circuit-engine/  netlist builder · MNA solver · device models · diagnostics    │
│  gamification/    XP curve · badges · streaks                                   │
│  adaptive/        performance model → hint level & difficulty adjustment        │
│  content/         registry of levels · lessons · projects · challenges ·        │
│                   quizzes + Zod validation                                      │
├─────────────────────────── DATA (offline-first, repository pattern) ────────────┤
│  ProgressRepository ──► LocalDexieRepository (IndexedDB)   [CloudRepository ──► │
│  ContentRepository  ──► bundled TS modules (offline by design)              API │
│  SettingsRepository ──► Dexie + DOM prefs                       later]          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Non-negotiable principles

1. **Content-driven, never hardcoded.** Lessons, quizzes, projects, challenges, badges are
   typed data modules validated by Zod. Adding a lesson = adding a data file. Zero UI edits.
2. **Engine purity.** `src/engine/**` imports no React, no DOM, no Next — pure functions and
   classes. This makes it unit-testable with golden test circuits and portable (could later
   run server-side for teacher dashboards, or in a Web Worker if ever needed).
3. **Repository pattern.** All persistence goes through interfaces keyed by `playerId`, so
   cloud sync (Phase 4+) is an adapter swap, not a rewrite. Player schema is multi-user ready.
4. **Renderer registry.** Every lesson *screen type* and *quiz question type* maps to a
   registered React renderer. New interaction types are additive.
5. **Design tokens.** All colors/spacing/typography are tokens (light, high-contrast, dark).
   No literal colors in components. Enables the accessibility modes and future theming.
6. **No hardcoded user-facing strings.** Everything resolves through next-intl message
   catalogs (`en` now; `fa` later — layouts use logical CSS properties so RTL is free).

---

## C. Folder Structure

```
circuitquest/
├── ARCHITECTURE.md
├── package.json · next.config.ts · tsconfig.json · vitest.config.ts
├── capacitor.config.ts            # (Phase 3 — Android packaging)
├── public/
│   ├── manifest.webmanifest       # PWA manifest (installable on Android)
│   ├── icons/                     # app icons, maskable icons
│   └── art/                       # original SVG: mascot, badges, lesson illustrations
├── src/
│   ├── app/                       # Next.js App Router (route map in section H)
│   │   ├── layout.tsx             # app shell: providers, tab bar, theme, i18n
│   │   ├── page.tsx               # HOME
│   │   ├── learn/…                # path map + lesson player
│   │   ├── lab/…                  # circuit lab
│   │   ├── projects/… challenges/… progress/… profile/… settings/…
│   ├── screens/                   # screen compositions consumed by routes
│   ├── components/
│   │   ├── ui/                    # design system: Button, Card, XPBar, ProgressRing,
│   │   │                          #   BadgeChip, Stepper, Sheet, Dialog, Toast…
│   │   ├── circuit/               # CircuitCanvas, ComponentLayer, WireLayer, PinHandle,
│   │   │                          #   FlowLayer (current animation), MultimeterPanel,
│   │   │                          #   Toolbar, PropertiesPanel, DiagnosticCard
│   │   ├── lesson/                # renderers per screen type (Explain, Animation,
│   │   │                          #   InteractiveDemo, BuildTask, Challenge, Quiz, Reward)
│   │   └── quiz/                  # renderers per question type
│   ├── engine/                    # ★ PURE TS — no React/DOM imports
│   │   ├── core/                  # Matrix (dense, partial-pivot Gauss), Solver (MNA+NR)
│   │   ├── devices/               # battery, resistor, led, switch, button, diode,
│   │   │                          #   capacitor, potentiometer, ldr, buzzer, motor,
│   │   │                          #   transistor (npn), ammeter
│   │   ├── netlist.ts             # editor graph → nets (union-find) → MNA indexing
│   │   ├── simulator.ts           # transient loop (rAF-friendly tick), snapshots, events
│   │   └── diagnostics.ts         # short/open/overstress/reversed → explanation keys
│   ├── components-registry/       # ComponentDefinition per part (see section F)
│   ├── content/
│   │   ├── schema/                # Zod schemas: Level, Lesson, Screen, Question,
│   │   │                          #   Project, Challenge, Badge
│   │   ├── levels/level0.ts … level7.ts
│   │   ├── projects/  challenges/  badges.ts
│   │   ├── locales/en/            # ALL user-facing content strings (en now, fa later)
│   │   └── index.ts               # registry aggregation + loadContent()
│   ├── gamification/              # xp.ts (curve), badges.ts (rule engine), streak.ts
│   ├── adaptive/                  # performance model, hint-level policy
│   ├── lib/
│   │   ├── storage/               # db.ts (Dexie), repositories + interfaces
│   │   ├── i18n/                  # next-intl config, RTL helpers
│   │   ├── audio/                 # optional SFX (gated by settings)
│   │   └── utils/
│   ├── stores/                    # progressStore, labStore, settingsStore
│   └── styles/                    # globals.css, design tokens (light/high-contrast)
└── tests/
    ├── engine/                    # golden netlists (divider, LED current, RC, short…)
    └── content/                   # Zod validation over every lesson/project/challenge
```

---

## D. Data / Local-Storage Structure

**Dexie (IndexedDB), schema v1 — player-keyed for multi-user & cloud sync readiness:**

```ts
players:    { id, name, avatarId, createdAt }
progress:   { playerId (PK), xp, levelTier,
              completedLessons: [{ lessonId, completedAt, attempts, hintsUsed }],
              quizScores:       { [lessonId]: { bestPct, attempts, lastAt } },
              completedProjects:[{ projectId, completedAt }],
              badges:           [{ badgeId, earnedAt }],
              stats:            { totalMistakes, totalHints, secondsByDay: { [date]: s } } }
streaks:    { playerId (PK), current, longest, lastActiveDay, calendar: { [day]: true } }
settings:   { playerId (PK), language, sound, music, reducedMotion, highContrast,
              textSize, haptics }
adaptive:   { key: [playerId+lessonId], perfScore, lastHintLevel, struggleCount }
```

**Repository interfaces** (swap-in cloud adapter later, no UI/domain changes):

```ts
interface ProgressRepository  { load(pid): Promise<Progress>; save(pid, p): Promise<void>;
                                exportJson(pid): Promise<Blob>; importJson(b: Blob): … }
interface SettingsRepository  { load(pid): Promise<Settings>; save(pid, s): … }
```

- First launch = local player created automatically; no account needed (children!).
- Settings JSON export/import included in v1 (parents can back up / migrate devices).
- Schema has `version` field + Dexie upgrade path.

---

## E. Circuit Simulation Architecture

**A real solver — simplified MNA (SPICE-style), not scripted animations.**

### Per-tick pipeline (runs at 60 fps, budget < 1 ms)

```
editor graph ──► netlist builder ──► MNA assembly ──► Newton–Raphson ──► snapshot ──► UI
 (components,     union-find over     G·x = i          (nonlinear        (V, I, device
  wires, pins)    pins & wires →      dense Gauss       LED/diode/        states) →
                  nets                elim. w/ pivot    transistor)       diagnostics
```

- **Nets:** union-find merges pins connected by wires and breadboard-internal groups.
- **Ground:** negative terminal of the first battery; every node gets `Gmin = 1e-9 S` to
  ground so floating circuits stay solvable *and* get flagged ("circuit is not complete").
- **Nonlinear iteration:** Newton–Raphson with damping, ≤ 50 iters, convergence < 1 mV.
  LEDs/diodes are piecewise-linear (off: 1e-9 S leakage; on: `Vf + Ron·I`) with a
  state machine inside the NR loop (switch on if V > Vf, off if I < 0).
- **Capacitors:** backward-Euler companion model (`G = C/Δt`, `Ieq = (C/Δt)·Vprev`),
  Δt = 1/60 s → real exponential charge/discharge curves rendered as animation.
- **Battery** includes 0.5 Ω internal resistance → short circuits produce *finite, large*
  currents (solvable math) and trigger the educational short-circuit warning.

### Device models (educational accuracy, honest simplifications)

| Device | Model | Educational outputs |
|---|---|---|
| Battery (1.5–9 V packs) | Ideal V source + 0.5 Ω internal R | terminal V, source I |
| Resistor (100 Ω–10 kΩ) | Ohm's law | V, I, (power) |
| LED (red/yellow/green/blue) | PWL: Vf 1.8/2.0/2.1/3.0 V, Ron 10 Ω, Imax 20 mA | brightness ∝ I/Imax, reversed-state detection |
| Switch / Push button | R 1 mΩ closed / 1 GΩ open (momentary for button) | state |
| Diode | PWL Vf 0.7 V | polarity teaching |
| Capacitor (10 µF–1000 µF, electrolytic; 0.1–1 µF ceramic) | backward Euler; reversed polarity flagged | charge %, live V(t) curve |
| Potentiometer | two resistors split by slider t ∈ [0,1] | slider position, wiper V |
| LDR | 1 kΩ (bright) ↔ 200 kΩ (dark), driven by a **light slider** in-sim | R now, lux label |
| Buzzer | R = 50 Ω; sounds when I > 5 mA | on/off + intensity |
| Motor | R = 15 Ω; speed ∝ I | rotation animation |
| Transistor NPN (e.g. BC547-class) | educational Ebers-Moll: BE PWL diode (0.7 V) + `Ic = β·Ib` dependent source (β=100), saturation clamp (VCE ≈ 0.2 V → CE ≈ 5 Ω) | Ib, Ic, mode (off/active/sat) |
| Ammeter | 1 mΩ inline readout | branch I |

### Diagnostics engine (the "explain, don't punish" layer)

Every anomaly maps to a localized explanation card, never a dead end:

- **Short circuit** → "The battery is pushing a huge current with nothing holding it back…"
  + hints where the path bypasses the load.
- **Open circuit** → highlights the net with no return path.
- **LED overstress** → "Your LED is getting more than its safe current. Add a resistor."
- **LED reversed** → "LEDs are one-way: current flows anode → cathode. Try flipping it."
- **Reversed electrolytic capacitor**, **floating input pin**, **no current flowing**.

### Multimeter

- **Voltage:** two tap-to-place probes, reading `V(a) − V(b)` live.
- **Current:** student inserts the ammeter component in-line (teaches the real procedure).
- **Resistance:** copies the netlist, zeroes sources, injects a 1 mA test source between
  probes, `R = ΔV/I` (correct SPICE-style technique; hint: "power off before measuring").

### Performance & correctness

- Typical solve < 1 ms (dense Gaussian elimination, partial pivoting).
- Snapshots flow through a tiny external store → only subscribed visual layers re-render.
- **Golden tests:** divider 2:1 · LED current `(Vs−Vf)/R ±5%` · RC time constant τ=RC ·
  open switch = 0 A · short-circuit warning · reversed LED = 0 A.

---

## F. Component Architecture

Single source of truth per part — one file, one `ComponentDefinition`, registered once.
Electrical model, visual, educational metadata, and editor behavior travel together.

```ts
// components-registry/resistor.ts
export const resistorDef: ComponentDefinition<'resistor'> = {
  type: 'resistor',
  category: 'basic',                      // POWER|BASIC|INPUT|OUTPUT|SENSORS|ANALOG|DIGITAL|TOOLS
  labelKey: 'comp.resistor.name',
  eduKey:   'comp.resistor.edu',          // localized kid-friendly explanation
  difficulty: 1,
  pins: [{ id: 'a', x: -30, y: 0 }, { id: 'b', x: 30, y: 0 }],
  params: {
    resistance: { default: 220, options: [100, 220, 330, 1000, 10_000], unit: 'Ω' },
  },
  createModel: (p) => new ResistorModel(p.resistance),   // engine device (pure TS)
  Visual: ResistorSvg,                                    // original SVG symbol + breadboard art
  defaults: { w: 60, h: 24 },
};

// components-registry/led.ts (excerpt)
params: {
  color:      { default: 'red', options: ['red', 'yellow', 'green', 'blue'] },
  maxCurrent: { fixed: 0.02 },             // 20 mA — taught, not editable
},
createModel: (p) => new LedModel(VF[p.color], RON_LED, p.maxCurrent),
```

**Contract:** every definition exposes `pins` (with relative offsets for hit-testing),
`params` (with allowed values → properties panel is generated from this), a pure-TS
`createModel`, an original SVG `Visual`, and localized educational metadata.
**Adding a part = 1 new file + 1 registry line.** The lab toolbar, properties panel,
netlist builder, and content validation all derive from the registry automatically.

The **breadboard** is itself a registry component: its many pins carry internal
connectivity groups (row strips + power rails) that the netlist builder merges —
no special-casing anywhere else in the app.

---

## G. Educational Content Architecture

All 8 levels, every lesson/project/quiz/challenge = **typed, validated data** (Zod),
with strings in `content/locales/en/*` (Persian drops in later as a parallel folder).

```ts
// content/schema/lesson.ts (shape)
Level {
  id, index, titleKey, descriptionKey, themeColor, lessons: Lesson[], projects: []
}
Lesson {
  id, levelId, titleKey, difficulty: 1–3, estimatedMinutes,
  objectives: string[],                        // localized keys
  screens: Screen[],                           // the LEARN→SEE→INTERACT→BUILD→TEST→…loop
  quiz: Question[], xpReward /* 50 */, passPct /* 70 */,
  unlockRequirements: { lessonIds: string[], minTier?: number },
  requiredComponents: ComponentType[],
}
type Screen =
  | { type: 'explain';  visual: VisualSpec }   // short text + original SVG scene
  | { type: 'animation'; anim: AnimSpec }      // e.g. electron-flow, capacitor-charge
  | { type: 'demo';     demo: DemoSpec }       // slider-driven live simulator slice
  | { type: 'build';    task: BuildTaskSpec }  // opens Lab in guided mode w/ checklist
  | { type: 'challenge'; challengeId }
  | { type: 'quiz' }
  | { type: 'reward' }
type Question =
  | { type: 'mcq'; promptKey; image?; options: 4 keys; answer; explanationKey }
  | { type: 'trueFalse'; … }
  | { type: 'identifyComponent'; symbolId; options; answer }
  | { type: 'diagnoseCircuit'; circuit: CircuitSnapshot; options; answer }  // static broken circuit shown
  | { type: 'completeCircuit'; labTask }                                    // mini-lab with live validation
  | { type: 'orderSteps'; items; correctOrder }
Project {
  id, titleKey, introKey, materials: ComponentType[], objectiveKey,
  steps: [{ instructionKey, hintKeys, targetCircuit? }],   // guided, step-validated
  test: ChallengeRef, troubleshooting: [{ symptomKey, causeKey, fixKey }],
  finalChallengeId, xpReward /* 100 */
}
Challenge {
  id, briefKey, startCircuit: CircuitSnapshot | 'blank',
  goal: Predicate,                      // ★ composable goal DSL, evaluated live
  hints: [hintKey1, hintKey2, hintKey3] // progressive: clue → concept → location
}
// Goal DSL (small typed helpers → content authors never write logic):
and(ledOn('led1'), currentWithin('led1', 2, 25), notShorted(), voltageAcross('r1', 1.0, 4.0))
```

- **Lesson player** is a generic stepper: it renders `screens[]` in order through the
  renderer registry and persists completion + quiz score via the progress repository.
- **Visuals** are original parameterized SVG scenes (e.g., water-tank pressure analogy for
  voltage, comparison sliders, symbol cards) — a small library of animators
  (`flow`, `charge`, `glow`, `compare`) reused across lessons.
- **Content quality gate:** a Vitest suite validates *every* content file against the Zod
  schemas (ids unique, unlock chains resolvable, quizzes have answers, keys exist in `en`).

---

## H. Navigation Structure

**Mobile-first shell: fixed bottom tab bar, 5 large targets (≥ 48 px), icon + label.**

```
🏠 Home      📚 Learn      ⚡ Lab      🧰 Projects      🏅 Me
                                              (gear icon top-right → Settings)
```

| Route | Screen |
|---|---|
| `/` | HOME — player card (name, tier, XP bar, streak), Continue Learning, Daily Challenge, recommended project, recent badges |
| `/learn` | LEVEL PATH MAP — 8 themed tier nodes, locked/unlocked states (lock icon + label, never color-only) |
| `/learn/[lessonId]` | LESSON PLAYER — full-screen stepper w/ progress dots, hints, quiz, reward |
| `/lab` | CIRCUIT LAB — free build + Run/Stop + multimeter + diagnostics |
| `/lab?challenge=id` `/lab?task=build` | LAB in challenge / guided-build mode |
| `/projects` · `/projects/[id]` | PROJECT LIST · GUIDED PROJECT player (steps, test, troubleshooting) |
| `/challenges` | CHALLENGE HUB (incl. troubleshooting-mode broken circuits) |
| `/progress` | PROGRESS — XP, badges, streak calendar, per-level mastery |
| `/profile` | PROFILE — name/avatar, data export/import |
| `/settings` | sound · music · text size · high contrast · reduced motion · haptics · language |

Deep links are supported (a finished lesson can link its reward badge, etc.).

---

## I. MVP Implementation Roadmap (Phase 2 → build order)

| Milestone | Scope | Acceptance criteria |
|---|---|---|
| **M0 Foundation** | Scaffold app, design tokens, tab shell, i18n plumbing, stores, Dexie repos | All 8 routes navigate; empty-state screens render; settings persist |
| **M1 Engine core** | `engine/` — Matrix, MNA+NR solver, netlist builder, device models (battery, resistor, LED, switch, button), diagnostics | Golden tests pass (divider, LED current, open/short) |
| **M2 Lab editor** | SVG canvas: place/move/rotate/delete, drag-wire with valid/invalid feedback, properties panel, run mode with current-flow animation + LED brightness | Level-1 projects buildable & simulating correctly |
| **M3 Content pipeline** | Zod schemas, content loader, lesson player + quiz renderers, **Level 0 (12 lessons)** authored | A learner can finish Level 0 end-to-end |
| **M4 Gamification** | XP/curve, tiers, badges engine, streaks, HOME screen, adaptive hint policy | XP events fire; badges unlock; streak updates daily |
| **M5 Instruments & challenges** | Multimeter (V/A/Ω), challenge DSL + hub, troubleshooting mode, remaining L1–L2 device models (pot, cap, diode, LDR, buzzer, motor) | Level 1–2 lessons + projects + challenges fully playable |
| **M6 Projects system** | Guided project player (materials, steps, test, troubleshooting) + L0–L2 projects authored | 12 guided projects complete |
| **M7 Full content + polish** | Levels 3–7 authored (engine devices for transistor already in M5), accessibility pass, PWA offline hardening, Persian-locale smoke test with pseudo-RTL | All 8 levels playable; Lighthouse a11y ≥ 95; offline reload works |

**MVP = M0–M5** (a complete, polished Levels 0–2 experience with lab, quizzes,
gamification, multimeter, challenges). M6–M7 complete the full curriculum — pure content
work on top of a frozen architecture. Android packaging (Capacitor) is a thin Phase-3 step
that touches no application code.

---

## J. Development Dependencies

```json
{
  "dependencies": {
    "next": "^16", "react": "^19", "react-dom": "^19",
    "zustand": "^5", "dexie": "^4", "dexie-react-hooks": "^1",
    "next-intl": "^4", "zod": "^4",
    "framer-motion": "^12", "lucide-react": "latest",
    "class-variance-authority": "^0.7", "clsx": "^2", "tailwind-merge": "^3",
    "@radix-ui/react-*": "(shadcn/ui primitives as needed)"
  },
  "devDependencies": {
    "typescript": "^5", "tailwindcss": "^4", "@types/node": "^24", "@types/react": "^19",
    "vitest": "^3", "@serwist/next": "^9",
    "eslint": "^9", "eslint-config-next": "^16"
  },
  "phase3-native": { "@capacitor/core": "^7", "@capacitor/android": "^7",
                     "@capacitor/cli": "^7" }
}
```

---

## Cross-Cutting Policies

**Localization:** every user-facing string — UI chrome, lesson bodies, hints, diagnostics,
badge names — resolves via next-intl catalogs. Content objects carry keys, not literals.
Layout uses logical properties (`ms/me`, `start/end`) so **Persian RTL is a locale flip,
not a refactor**.

**Accessibility (baked in, not bolted on):**
- Text-size setting (system-scaled, ≥ 16 px base), high-contrast theme token set
- Reduced-motion mode: flow animation → static arrows, transitions disabled
- State never color-only: LED ON/OFF gets glyph + label; wire validity gets icon + text;
  current direction gets animated dashes **and** an arrow glyph
- Sound fully optional; touch targets ≥ 48 px; simple-language rule enforced in content QA

**Safety:** the simulator's component library physically *cannot* include mains sources —
battery options stop at 9 V. A dedicated safety lesson (L0) plus contextual reminders in
the Lab teach: never touch wall outlets, mind polarity, avoid shorts, ask an adult.
Short circuits produce friendly explanations, never scary visuals.

**Scientific accuracy:** simplifications are honest ones (water-pressure analogy → then the
word "voltage"; PWL diode → then "LEDs have a forward voltage"). The numeric behavior
students observe (currents, brightness, RC curves, β multiplication) is quantitatively
reasonable for the circuits in the curriculum.

**Future-expansion hooks (architecture only, none implemented now):** Arduino/microcontroller
= new device models + code-editor screen type; sensors/servos/robotics = new registry
entries; teacher/parent accounts & cloud sync = new repositories behind existing interfaces;
classrooms/leaderboards = API routes (Next.js backend already present).


