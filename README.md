<div align="center">

# ⚡ CircuitQuest

**ماجرای مدار** — a story-driven, interactive electronics course for kids

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f472b6?logo=bun)](https://bun.sh)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/tests-42%20passing-4fb61d)](./src/tests)

Persian-first (RTL) · Works fully offline · No accounts, no backend, no tracking

</div>

---

## 📖 Overview

CircuitQuest teaches children the fundamentals of electricity and electronics —
current, voltage, resistance, and circuits — through **animated story scenes** and
a **real circuit simulation lab**, not videos or multiple-choice drills alone.

Kids follow a guided adventure with a robot companion, discover what is inside
everyday devices, then *build* what they learned on a virtual breadboard and see
it light up, simulated by a genuine circuit solver.

Key properties:

- **Persian (Farsi) first, fully RTL** — English strings ship alongside via a tiny
  `L(en, fa)` locale helper; no i18n framework needed.
- **Zero backend** — progress and settings persist locally through Zustand's
  `persist` middleware. Nothing leaves the device.
- **Installable PWA** — standalone, offline-capable, portrait, `dir: rtl`.
- **Physics that is actually correct** — the lab is powered by a custom
  Modified Nodal Analysis solver, not canned animations.

## ✨ What's inside

| | |
| --- | --- |
| **30 lessons** across **3 levels** | L0 · Foundations (14) · L1 · Breadboarding (7) · L2 · Measurement & circuits (9) |
| **75+ hand-built scene kinds** | animated story pages, discovery explorables, water-analogy demos, symbol trainers |
| **24 hands-on build exercises** | every Level-0 lesson ends with a short, guided build on the virtual lab |
| **~100 quiz questions** | 5 formats: `mcq` · `trueFalse` · `identify` · `diagnose` · `circuitPick` |
| **Reward loop** | medal & celebration screens close every lesson |

### Curriculum map

| Level | Theme | Lessons |
| --- | --- | --- |
| **0** — Foundations | What electronics is, electricity, electrons, conductors & insulators, safety rules | 14 |
| **1** — Breadboarding | The breadboard, wiring, first LED, polarity / one-way components | 7 |
| **2** — Measurement & circuits | Multimeter, series & parallel circuits, voltage drop | 9 |

## 🧮 Circuit simulation engine

The lab is not a drawing tool — it solves the circuit:

```
src/engine/
  netlist.ts     compiles placed parts into electrical nodes & branches
  core/mna.ts    Modified Nodal Analysis — dense Gaussian elimination
                 with partial pivoting (x = [V₁..Vₙ, I_branch…])
  simulator.ts   DC operating point, per-part operating regions
  devices.ts     part models: battery, resistor, LED, switch, potentiometer…
  diagnostics.ts turns solver results into kid-friendly feedback
  goals.ts       declares what "done" means for each build exercise
```

The MNA implementation is sized for educational circuits (< ~200 unknowns)
where a dense solve costs well under a millisecond — instant feedback on every
wire the child moves. The build exercises themselves are covered by tests that
verify every goal circuit is actually solvable (`src/tests/l0-builds.test.ts`).

## 🎓 Content model

Lessons are plain TypeScript data in `src/content/levels/level0..2.ts`.
Each page declares a `scene: { kind: ... }`; the kind maps to a renderer in
`src/components/lesson/scenes.tsx` (interactive labs) or `story-scenes.tsx`
(animated story pages). Adding a lesson means adding data, not wiring.

Navigation is hash-based, so the whole course works from any static host:
`/#/learn/l0-1`, `/#/learn/l0-2`, …

Every Level-0 lesson follows the same arc:
**story → interactive scene → hands-on build (verified) → 3–4 varied quiz questions → medal**.

## 🛠 Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, standalone output) · React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 · trimmed shadcn/ui · Radix primitives |
| State | Zustand 5 + `persist` (settings, progress, lab) |
| Animation | SVG SMIL / CSS · Framer Motion · Rive runtime (future scenes) |
| Simulation | Custom netlist compiler + MNA solver |
| Tests | Vitest — 4 suites, 42 tests |
| Runtime / package manager | Bun |

## 🚀 Getting started

```bash
bun install     # install dependencies
bun run dev     # dev server → http://localhost:3000
```

All scripts:

| Command | What it does |
| --- | --- |
| `bun run dev` | start the dev server on port 3000 |
| `bun run build` | production build (standalone output) |
| `bun run start` | serve the production build |
| `bun run test` | run the vitest suites |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint |

## 📂 Project structure

```
src/
  app/          App Router pages & layouts
  components/
    circuit/    lab screen & circuit canvas view
    lesson/     lesson player, quiz, scene renderers, robot companion
    ui/         shadcn/ui primitives (only what's used)
  content/      course data — levels, lessons, pages (level0..2.ts)
  engine/       simulation: netlist, MNA core, simulator, devices, goals
  parts/        circuit part registry + visuals
  screens/      screen-level views
  stores/       Zustand stores (settings, progress, lab)
  lib/          i18n helper, hash router, sound effects, misc
  tests/        vitest suites
public/         PWA manifest, icons, service worker, offline page
rive/           Rive scene sources (.rml)
docs/           architecture notes & development log
```

## 🧪 Testing

```bash
bun run test
```

| Suite | Covers |
| --- | --- |
| `engine.test.ts` | netlist compilation, MNA solves, device models, diagnostics |
| `l0-builds.test.ts` | every Level-0 build exercise is achievable & matches its goals |
| `content.test.ts` | content invariants (ids, ordering, structure) |
| `dialogue.test.ts` | bilingual dialogue integrity |

## 📱 PWA

- `public/manifest.json` — Persian name, `dir: rtl`, `display: standalone`, portrait
- `public/sw.js` — cache-first shell with an offline fallback page
- Registered **in production builds only** (`src/components/ServiceWorkerRegister.tsx`)
  so it never fights hot reload during development
- After changing static assets, bump `VERSION` inside `sw.js`

## 🌐 Localization

All user-facing strings are written as `L('English', 'فارسی')` — Persian is the
primary, fully-RTL experience and English ships alongside. Animations respect
the in-app **motion setting** (`useSettings((s) => s.motion)`), which scenes
must honor.

## 📄 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — deeper architecture notes
- [`docs/worklog.md`](docs/worklog.md) — development log

---

<div align="center">
Made with ⚡ for curious kids.
</div>
