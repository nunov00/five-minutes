# AGENTS.md

Five Minutes is a Git-backed, static learning publication. Read these before substantive changes:

1. `docs/GOVERNANCE.md`
2. `docs/ARCHITECTURE.md`
3. relevant files under `docs/adr/`
4. `docs/OPERATIONS.md`

## Working rules

- GitHub is authoritative; `main` must remain production-ready.
- Significant work uses an issue/task, branch, PR, checks and review.
- Maximise autonomous progress within approved scope: carry implementation, tests, documentation, CI/deployment monitoring, in-scope fixes and review remediation through to authorised merge without repeated Owner approval. Wait for jobs and act on their results. Return for material decisions, missing access/review or another genuine blocker, with a concrete result and a self-contained hand-off where needed. Quality gates and Owner authority remain intact. See GOVERNANCE section 4.
- Significant changes, including code, architecture/ADRs, governance and content rules, require independent review before merge.
- Required independent AI reviews use a different AI system from the implementer (for example Claude reviews Codex, or vice versa). Independence is defined at the provider/model-family level: OpenAI products (ChatGPT, Codex) are one reviewer family; Anthropic products (Claude, Claude Code) are another. Different products or models from the same provider do not qualify. A separate session, sub-agent or model within the same system is supplementary verification, not a substitute. Exceptions require genuine inability to obtain different-system review or an explicit Owner request, and must be recorded on the PR with implementer/reviewer identities and the reason. An available reviewer needing an Owner-relayed prompt is not automatically impossible: prepare the hand-off and keep the merge pending. See GOVERNANCE section 9. Re-review fixes on the final head before merge.
- Preserve one immutable lesson identity across Adult/Teen presentations. Both Adult and Teen presentations are mandatory for publication, though a draft may be temporarily incomplete.
- Canonical content is validated plain Markdown plus structured metadata; do not introduce MDX/raw executable lesson content.
- Keep core logic provider-neutral. Cloudflare, search engines and AI providers are adapters/configuration choices. Cloudflare configuration lives only in `deploy/cloudflare/`; nothing in `src/` may import Cloudflare APIs.
- Do not add a database, SSR lesson runtime, account system or new service without evidence and the required Owner approval.
- Lesson pages are static. Use a normal static build initially; build sharding is a measured scale-up mechanism, not a day-one requirement. If activated, shard boundaries must never affect public identity/URLs.
- Generate the compact catalogue/URL manifest before rendering; all routes and discovery artifacts use the shared URL generator rather than reconstructing lesson URLs.
- Search is discovery-oriented initially and uses compact metadata, not full lesson bodies.
- Reader state is local-first behind a storage abstraction.
- AI workers may author changes but do not push directly to `main`.
- Routine lesson publication may be authorized by an independent AI reviewer after required validation; failed, uncertain or exceptional review must escalate rather than silently publish.
- Prefer small, testable changes and update documentation/ADRs when architectural behaviour changes.
- Keep commits atomic at the logical-change level where practical: prepare related code/configuration and documentation together before pushing. Avoid unnecessary sequential commits on CI/CD-connected branches because each push may trigger a full test, preview build or deployment.

## Commands

Use Node.js 22 (see `.nvmrc`) and the committed lockfile:

- `npm ci` — reproducible install;
- `npm run check` — Astro/TypeScript diagnostics;
- `npm test` — unit/integration tests (Vitest, `tests/**/*.test.ts`);
- `npm run build` — production static build into `dist/`;
- `npm run test:e2e` — Playwright browser journeys (`tests/e2e/**/*.spec.ts`) against the built site via `astro preview`; run `npm run build` first and install Chromium once with `npx playwright install chromium`. Agents: Astro backgrounds `astro preview` for AI agents, so start `npm run preview` first (Playwright reuses it) and stop it afterwards with `npx astro preview stop`;
- `npm run dist:count` — number of deployable files in `dist/` (run after `npm run build`);
- `npm run dev` / `npm run preview` — local development server / preview of the built site;
- `npm run cf:preview` / `npm run cf:deploy` — Cloudflare commands for Workers Builds, which holds the credentials: `cf:preview` creates a Worker Preview (`wrangler preview`) for branch/PR testing, and `cf:deploy` deploys production (`wrangler deploy`). Both use the pinned project Wrangler. See `deploy/cloudflare/README.md`. Do not run them from CI or with committed credentials, and do not use `wrangler versions upload` (Version URLs) for branch/PR testing.

CI (`.github/workflows/ci.yml`) runs on every pull request and on `main`: check `baseline` runs `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run verify:static`, `npm run cf:prepare`, `node deploy/cloudflare/verify-redirects.mjs`, `npm run cf:verify-capacity` and `node scripts/count-dist-files.mjs --warn-at 16000` in that order; check `e2e` then runs `npm run build` and `npm run test:e2e` (desktop Chromium and iPhone-class mobile projects). Run the same sequence locally before opening a PR. The `benchmark-*.yml` workflows are manual-only architecture evidence and are not part of CI.

Canonical content validation is part of `npm test` and `npm run build`. Pull-request CI additionally supplies the base commit to the tests so `src/content/route-ownership.json` is proven append-only. Do not bypass `src/lib/content/loader.ts` when consuming canonical lessons.
