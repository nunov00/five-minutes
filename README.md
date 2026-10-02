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

Unit/integration tests live in `tests/` as `*.test.ts`. Playwright end-to-end tests will live in `tests/e2e/` and are not run by `npm test`.

The application produces standard static output in `dist/`. Hosting-provider configuration belongs at the deployment boundary and must not leak into application/domain logic.

## Repository areas

- `src/` — production application code
- `docs/` — architecture, governance, ADRs and operations
- `benchmark/` and `.github/workflows/benchmark-*.yml` — retained architecture-spike evidence; not production application code. These tools were written for the spike's Astro 5 package setup and are not runnable against the current production `package.json`. To reproduce the published benchmark results, check out commit `c098907` (the merged architecture spike) and follow `docs/spikes/10k-architecture-benchmark.md`.

Implementation work is tracked from GitHub issue #4.
