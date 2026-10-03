# Five Minutes

Five Minutes is a daily learning publication with Adult and Teen presentations of every published lesson.

The accepted architecture lives in `docs/ARCHITECTURE.md` and `docs/adr/`. Governance and contribution rules live in `docs/GOVERNANCE.md` and `AGENTS.md`.

## Requirements

- Node.js 22 LTS, version 22.12 or later (Astro 7 requirement; see `.nvmrc`)
- npm (use the committed `package-lock.json` via `npm ci`)

## Local development

```sh
npm ci
npm run dev
```

## Quality checks and production build

CI runs the same commands, in this order, as the `baseline` check on every pull request and on `main`:

```sh
npm ci
npm run check   # Astro/TypeScript diagnostics
npm test        # unit/integration tests (Vitest)
npm run build   # production static build into dist/
```

Preview the built site locally with `npm run preview`.

Unit/integration tests live in `tests/` as `*.test.ts` and run with Vitest.

## Browser (E2E) tests

Playwright journeys live in `tests/e2e/` as `*.spec.ts`. They run against the **built** site served by `astro preview`, never `astro dev`, so always build first. CI runs them as the `e2e` check after `baseline` passes:

```sh
npx playwright install chromium   # once per machine / Playwright upgrade (add --with-deps on Linux)
npm run build
npm run test:e2e
```

Projects: `desktop-chromium` (Desktop Chrome) and `mobile-iphone` (iPhone 15 viewport, touch and user agent, emulated in Chromium). Run one with `npm run test:e2e -- --project=mobile-iphone`.

`npm run test:e2e` starts `astro preview` on `http://127.0.0.1:4321` itself, or reuses a server already running there outside CI. When Astro detects an AI agent it starts `astro preview` in the background, so in that case start it first with `npm run preview`, run the tests, then stop it with `npx astro preview stop`.

Write journeys with `test`/`expect` imported from `tests/e2e/support/fixtures.ts`: every page is guarded so an uncaught browser exception fails the test. Add one spec per product journey (for example `today-reading.spec.ts`, `library.spec.ts`), shared helpers under `tests/e2e/support/`, and prefer user-visible assertions (roles, text) over HTML structure.

The application produces standard static output in `dist/`. Hosting-provider configuration belongs at the deployment boundary and must not leak into application/domain logic.

`npm run dist:count` reports how many deployable files `dist/` contains (CI prints this after every build), because hosting providers limit files per deployment.

## Reading experience and visual foundation

- `/` is **Today**: the newest published lesson by `publishedAt` (ties broken by lesson ID), offered in both editions (ADR-0007). Dates display in the Europe/Zurich editorial timezone. Selection and formatting live in `src/lib/today.ts`.
- `/adult/<slug>` and `/teen/<slug>` are the static lesson pages. The edition switch links to the other edition's manifest path; the URL alone decides the edition (ADR-0005). Takeaway and Test Yourself follow the lesson body; the answer uses `<details>`, so it works without JavaScript.
- The reading page owns the only `<h1>` (the presentation title from front matter). Lesson bodies therefore start headings at `##`; the content pipeline rejects `#` in a presentation body, and the sanitized body HTML is rendered unchanged.
- `src/styles/global.css` holds the shared, mobile-first design tokens (colour, type, spacing, shape) and a few components (`container`, `card`, `button`, `eyebrow`, `lede`, `edition-switch`). Light/dark follows the operating-system setting. Reuse these tokens rather than adding new values.
- Pages ship no client-side JavaScript, and styles are emitted as external files (`build.inlineStylesheets: 'never'`) so a later Content Security Policy needs no inline-style allowance.

## Deployment

Cloudflare is the initial host. Its configuration lives only in `deploy/cloudflare/`. That directory deploys the unchanged `dist/` as Workers Static Assets, with production from `main` (`npm run cf:deploy`) and Worker Previews for pull requests (`npm run cf:preview`) through Cloudflare Workers Builds. See [`deploy/cloudflare/README.md`](deploy/cloudflare/README.md) for the setup, limits and commands. Wrangler is a pinned dev dependency. Any other static host can serve the same `dist/`.

## Repository areas

- `src/` — production application code
- `docs/` — architecture, governance, ADRs and operations
- `deploy/` — hosting-provider adapters (currently `deploy/cloudflare/`); not application code
- `scripts/` — build/deployment tooling such as `count-dist-files.mjs`
- `benchmark/` and `.github/workflows/benchmark-*.yml` — retained architecture-spike evidence; not production application code. These tools were written for the spike's Astro 5 package setup and are not runnable against the current production `package.json`. To reproduce the published benchmark results, check out commit `c098907` (the merged architecture spike) and follow `docs/spikes/10k-architecture-benchmark.md`.

Implementation work is tracked from GitHub issue #4.
