# AGENTS.md

Five Minutes is a Git-backed, static learning publication. Read these before substantive changes:

1. `docs/GOVERNANCE.md`
2. `docs/ARCHITECTURE.md`
3. relevant files under `docs/adr/`
4. `docs/OPERATIONS.md`

## Working rules

- GitHub is authoritative; `main` must remain production-ready.
- Significant work uses an issue/task, branch, PR, checks and review.
- Preserve one immutable lesson identity across Adult/Teen presentations. Both Adult and Teen presentations are mandatory for publication, though a draft may be temporarily incomplete.
- Canonical content is validated plain Markdown plus structured metadata; do not introduce MDX/raw executable lesson content.
- Keep core logic provider-neutral. Cloudflare, search engines and AI providers are adapters/configuration choices.
- Do not add a database, SSR lesson runtime, account system or new service without evidence and the required Owner approval.
- Lesson pages are static. Use a normal static build initially; build sharding is a measured scale-up mechanism, not a day-one requirement. If activated, shard boundaries must never affect public identity/URLs.
- Generate the compact catalogue/URL manifest before rendering; all routes and discovery artifacts use the shared URL generator rather than reconstructing lesson URLs.
- Search is discovery-oriented initially and uses compact metadata, not full lesson bodies.
- Reader state is local-first behind a storage abstraction.
- AI workers may author changes but do not push directly to `main`.
- Routine lesson publication may be authorized by an independent AI reviewer after required validation; failed, uncertain or exceptional review must escalate rather than silently publish.
- Prefer small, testable changes and update documentation/ADRs when architectural behaviour changes.

## Commands

Use Node.js 22 (see `.nvmrc`) and the committed lockfile:

- `npm ci` — reproducible install;
- `npm run check` — Astro/TypeScript diagnostics;
- `npm test` — unit/integration tests (Vitest, `tests/**/*.test.ts`; Playwright E2E will live separately in `tests/e2e/`);
- `npm run build` — production static build into `dist/`;
- `npm run dev` / `npm run preview` — local development server / preview of the built site.

CI (`.github/workflows/ci.yml`, check name `baseline`) runs `npm ci`, `npm run check`, `npm test` and `npm run build` in that order on every pull request and on `main`. Run the same sequence locally before opening a PR. The `benchmark-*.yml` workflows are manual-only architecture evidence and are not part of CI.

Schema/content validation commands will be added here when the implementation creates them.
