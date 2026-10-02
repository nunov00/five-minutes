# Five Minutes

Five Minutes is a daily learning publication with Adult and Teen presentations of every published lesson.

The accepted architecture lives in `docs/ARCHITECTURE.md` and `docs/adr/`. Governance and contribution rules live in `docs/GOVERNANCE.md` and `AGENTS.md`.

## Requirements

- Node.js 22 LTS
- npm

## Local development

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run check
npm run build
npm run preview
```

The application produces standard static output in `dist/`. Hosting-provider configuration belongs at the deployment boundary and must not leak into application/domain logic.

## Repository areas

- `src/` — production application code
- `docs/` — architecture, governance, ADRs and operations
- `benchmark/` — retained architecture-spike evidence/tools; not production application code
- `.github/workflows/benchmark-*.yml` — manual-only architecture benchmarks

Implementation work is tracked from GitHub issue #4.
