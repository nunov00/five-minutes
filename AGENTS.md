# AGENTS.md

Five Minutes is a Git-backed, static learning publication. Read these before substantive changes:

1. `docs/GOVERNANCE.md`
2. `docs/ARCHITECTURE.md`
3. relevant files under `docs/adr/`
4. `docs/OPERATIONS.md`
5. `docs/EDITORIAL.md` for lesson authoring or review

## Working rules

- GitHub is authoritative; `main` must remain production-ready.
- Significant work uses an issue/task, branch, PR, checks and review.
- Maximise autonomous progress within approved scope: carry implementation, tests, documentation, CI/deployment monitoring, in-scope fixes and review remediation through to authorised merge without repeated Owner approval. Wait for jobs and act on their results. Return for material decisions, missing access/review or another genuine blocker, with a concrete result and a self-contained hand-off where needed. Quality gates and Owner authority remain intact. See GOVERNANCE section 4.
- Classify each Pull Request under GOVERNANCE section 9 as `review:routine`, `review:integration` or `review:mandatory`, and record the reason. Routine bounded work needs focused Manager review and green checks but no different-provider review. A staged feature may receive one cumulative review only when intermediate routine stages produce no new or changed deployed page, script or data asset, sitemap/catalogue/search output, or reader-data read/write; the activating integration PR must be reviewed before merge. Mandatory review covers governance/architecture; security/privacy/authentication/executable-content boundaries; stored-data formats and schema/data-loss risk; content schemas, parsing and validation; canonical URLs and redirects; publication/deployment; any removal or weakening of CI, required checks, tests or verification scripts; any broadening of workflow permissions or addition/change of secret access; significant dependencies/services/costs; destructive changes; and published lesson facts, sources, answers, takeaways, figures or other material editorial content. Classify a PR by its highest-risk part; splitting work does not lower its classification, and uncertainty must be escalated.
- Label every PR with its review classification and normally exactly one implementer label, `impl:openai` or `impl:anthropic`. A mixed-provider PR carries both implementer labels; each provider reviews the other provider's material changes, or the work is split. Wording drafted by the reviewing provider and adopted by the implementer counts as a contribution and is disclosed on the PR.
- Lesson-content-only PRs (new lessons, batches and corrections, plus their route-ownership entries) may be reviewed by the same provider as the implementer in a separate pass that re-checks sources and completes the EDITORIAL.md review; record that the exception was used. Any non-lesson change needs different-provider review, so keep lessons in their own PR. ADR-0007 automated candidates remain governed by ADR-0007. See GOVERNANCE section 9.
- When independent AI review is required, use a different provider/model family from the implementer (for example Claude reviews Codex, or vice versa). OpenAI products are one family and Anthropic products another; another session, sub-agent or model from the same provider is only supplementary. Re-review BLOCKER/IMPORTANT and security/factual/architectural or otherwise material fixes. A narrow tested MINOR-only fix may be verified by the Manager as section 9 defines. Record exceptions and review evidence on the PR.
- Preserve one immutable lesson identity across Adult/Teen presentations. Both Adult and Teen presentations are mandatory for publication, though a draft may be temporarily incomplete.
- Canonical content is validated plain Markdown plus structured metadata; do not introduce MDX/raw executable lesson content.
- Keep core logic provider-neutral. Cloudflare, search engines and AI providers are adapters/configuration choices. Cloudflare configuration lives only in `deploy/cloudflare/`; nothing in `src/` may import Cloudflare APIs.
- Do not add a database, SSR lesson runtime, account system or new service without evidence and the required Owner approval.
- Lesson pages are static. Use a normal static build initially; build sharding is a measured scale-up mechanism, not a day-one requirement. If activated, shard boundaries must never affect public identity/URLs.
- Generate the compact catalogue/URL manifest before rendering; all routes and discovery artifacts use the shared URL generator rather than reconstructing lesson URLs.
- Search is discovery-oriented initially and uses compact metadata, not full lesson bodies.
- Reader state is local-first behind a storage abstraction.
- AI workers may author changes but do not push directly to `main`.
- Routine automated lesson publication follows ADR-0007: the writer cannot merge; named checks must pass before an independent review in a separate reviewer run begins (same or different provider); Ready review and `expectedHeadSha` merge occur in the same reviewer run; prior comments/labels never authorise publication; failed, stale or uncertain candidates do not publish.
- Prefer small, testable changes and update documentation/ADRs when architectural behaviour changes.
- Keep commits atomic at the logical-change level where practical: prepare related code/configuration and documentation together before pushing. Avoid unnecessary sequential commits on CI/CD-connected branches because each push may trigger a full test, preview build or deployment.

## Commands

Use Node.js 22 (see `.nvmrc`) and the committed lockfile:

- `npm ci` — reproducible install;
- `npm run check` — Astro/TypeScript diagnostics;
- `npm test` — unit/integration tests (Vitest, `tests/**/*.test.ts`);
- `npm run test:lesson-guard` — focused hostile-input tests for the M7 automated lesson boundary;
- `npm run build` — production static build into `dist/`;
- `npm run test:e2e` — Playwright browser journeys (`tests/e2e/**/*.spec.ts`) against the built site via `astro preview`; build the browser fixture with `FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE=5 npm run build` first (the pagination journeys require a second Library page), and install Chromium plus WebKit once with `npx playwright install chromium webkit`. Agents: Astro backgrounds `astro preview` for AI agents, so start `npm run preview` first (Playwright reuses it) and stop it afterwards with `npx astro preview stop`;
- `npm run dist:count` — number of deployable files in `dist/` (run after `npm run build`);
- `npm run dev` / `npm run preview` — local development server / preview of the built site;
- `npm run cf:preview` / `npm run cf:deploy` — Cloudflare commands for Workers Builds, which holds the credentials: `cf:preview` creates a Worker Preview (`wrangler preview`) for branch/PR testing, and `cf:deploy` deploys production (`wrangler deploy`). Both use the pinned project Wrangler. See `deploy/cloudflare/README.md`. Do not run them from CI or with committed credentials, and do not use `wrangler versions upload` (Version URLs) for branch/PR testing.

CI (`.github/workflows/ci.yml`) runs on every pull request and on `main`: check `baseline` runs `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run verify:static`, `npm run cf:prepare`, `node deploy/cloudflare/verify-redirects.mjs`, `npm run cf:verify-capacity` and `node scripts/count-dist-files.mjs --warn-at 16000` in that order; check `e2e` then runs `FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE=5 npm run build` and `npm run test:e2e` (desktop Chromium, iPhone-class Chromium and focused mobile WebKit projects). Run the same sequence locally before opening a PR. The `benchmark-*.yml` workflows are manual-only architecture evidence and are not part of CI.

`.github/workflows/lesson-guard.yml` is a separate read-only `pull_request_target` check named `lesson-guard`. It checks out and executes only the current trusted default branch, never the PR head, and fetches candidate lesson blobs only as untrusted data through read-only GitHub APIs. It receives no repository secrets. M7.2 adds the check and tests; it is not a branch-protection requirement until M7.5. The first live automated-candidate exercise is M7.3.

Canonical content validation is part of `npm test` and `npm run build`. Pull-request CI additionally supplies the base commit to the tests so `src/content/route-ownership.json` is proven append-only. Do not bypass `src/lib/content/loader.ts` when consuming canonical lessons.
