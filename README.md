# CircuitQuest دستگذران

A bilingual (Persian / English) interactive electronics course for kids.
Children learn current, voltage, resistance, and circuits by watching animated
story scenes and playing with interactive SVG labs.

## Tech Stack

- **Bun + Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** + shadcn/ui components (only the used ones kept)
- **Zustand** (persist middleware) for state and progress — no server database
- **SVG scenes** with SMIL / CSS animation (no heavy video assets)
- **Rive** runtime (`@rive-app/react-canvas`) available for upcoming scenes
  (sources in `rive/`)

## Getting Started

```bash
bun install          # install dependencies
bun run dev          # start dev server on http://localhost:3000
```

Other useful commands:

```bash
bun run build        # production build
bun run typecheck    # TypeScript check
bun run lint         # ESLint
bun run test         # vitest unit tests (src/tests)
```

## Project Structure

```
src/
  app/          Next.js App Router pages (route groups, layouts)
  components/   UI + lesson scenes (story-scenes.tsx, scenes.tsx)
  content/      Course data — levels, lessons, pages (levels/level0.ts)
  engine/       Lesson engine: progress, navigation logic
  screens/      Screen-level views (learn, home, …)
  stores/       Zustand stores (settings, progress, …)
  lib/          Helpers, i18n (L(en, fa) locale helper)
  parts/        Circuit part components (resistor, battery, …)
  tests/        vitest unit tests
public/         Images, fonts, PWA icons, manifest & service worker
rive/           Rive scene sources (.rml) — one folder per scene
docs/           Architecture notes and development log
```

## Content Model

Lessons live in `src/content/levels/level0.ts` (and level1/2). Each page of a
lesson declares a `scene: { kind: ... }`; the kind is rendered by
`src/components/lesson/scenes.tsx` (interactive) or
`src/components/lesson/story-scenes.tsx` (animated story).
Routes use hash navigation: `/#/learn/l0-1`, `/#/learn/l0-2`, …

Every lesson ends with: a short hands-on **build exercise** (`type: 'build'`,
verified achievable by `src/tests/l0-builds.test.ts`) → a **quiz of 3-4 varied
questions** (mcq / trueFalse / identify / diagnose / circuitPick) → the medal
reward screen.

## PWA

`public/manifest.json` (fa, RTL, standalone) + generated icons in
`public/icons/` + `public/sw.js` service worker with an offline fallback page
(`public/offline.html`). The SW is registered **in production builds only**
(`src/components/ServiceWorkerRegister.tsx`) so it never fights hot reload in
dev. After changing static assets, bump `VERSION` in `sw.js`.

## Conventions

- All user-facing text is bilingual via `L(en, fa)` — Persian (RTL) is primary.
- Animations must respect the motion setting: `useSettings((s) => s.motion)`.
- Keep the repo clean: no build output, logs, or one-off scripts are committed.
