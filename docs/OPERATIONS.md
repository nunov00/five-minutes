# Operations and Delivery

## Repository structure

```text
.github/workflows/       CI, preview and publication automation
docs/                    architecture, ADRs, governance and spikes
src/content/lessons/     canonical lesson sources grouped by year/slug
src/pages/               Astro routes and discovery surfaces
src/components/          reusable presentation components
src/lib/                 provider-neutral domain/search/state/build logic
scripts/                 validation, catalogue, sharding and publication tools
deploy/                  hosting-provider adapters (deploy/cloudflare/), outside application code
tests/                   unit/integration tests
tests/e2e/               Playwright critical journeys
public/                  stable public assets
```

Provider configuration belongs at the repository boundary, not inside lesson/domain logic.

## Build and deployment flow

```text
Git lesson sources
      |
      +--> schema/security validation
      |
      +--> complete compact catalogue + URL manifest
      |       |
      |       +--> static global pages / sitemap / redirects
      |       +--> lesson rendering (single build initially)
      |       +--> compact browser catalogue
      |       +--> edition-specific search indexes
      |
      +--> exact URL/internal-link/completeness validation
      |
      +--> deployable static artifact
```

If measured build pressure later justifies sharding, only lesson rendering is partitioned. Global outputs are generated once and every shard consumes the same catalogue/URL contract. Partition assignment and final URL completeness are validated explicitly. M3 deliberately leaves sharding disabled: the trigger is measured production build time/memory pressure on the chosen CI resources, not catalogue size alone. Hosting file/redirect limits are a separate deployment-representation concern and do not by themselves justify build sharding.

A clean checkout plus pinned dependencies must be sufficient to reproduce production output. CI uses the lockfile and `npm ci`; generated lesson fixtures and deployment output are not canonical source.

## Shared build content (pre-M5, #48)

Astro route consumers use `src/lib/content/build-content.ts` rather than calling the canonical loader independently. `getBuildMetadata()` provides validated lesson metadata/front matter, the shared catalogue/routes, historical redirects and sitemap paths without article HTML or source-directory fields. Today and future Library/Topics/Search/Related consumers use this metadata path. Reading route generation calls `getBuildContent()` once and uses its `getLesson(id)` lookup for each lesson body.

The production server bundle owns one lazy, in-flight promise per build process. Its first consumer runs the existing strict filesystem, safe Markdown/YAML and publication/reference validation pipeline over the complete collection, renders both presentations once and builds the delivery outputs once. Later and concurrent consumers reuse that snapshot. Nested content is frozen to prevent a consumer changing another consumer's input. A rejected load is propagated to every waiting consumer and is never cached as a successful result; a subsequent attempt must validate again.

The cache exists only in memory during a static production build. A normal `astro build` starts a fresh process; no disk cache or cross-build content state exists. Development/test access creates a fresh snapshot per call. This is loader freshness, not a guarantee that every running development page refreshes: Astro caches reading-route `getStaticPaths` results, so lesson-page edits may require restarting `astro dev`. Today metadata can refresh on subsequent requests, and invalid route ownership fails validation when the loader runs again. A reading-route consumer obtains one snapshot for the whole route enumeration even in development. This does not introduce lazy body rendering, sharding or a browser/runtime content service: all source content still passes the full safe-content pipeline before discovery metadata is exposed.

Verification on the current seed corpus, Node 22.20.0: a temporary loader probe measured four full loads in a build without `SITE_URL` (five with a sitemap origin) before this change, versus one after it. Generated artifacts were compared byte for byte; this is evidence of eliminated duplicate work, not a large-corpus timing benchmark. Behavioural tests cover concurrent reuse, metadata/body separation, delivery equivalence, nested mutation protection, validation failure/retry and independent build/ownership snapshots.

## Discovery data (M5, #59)

Library and Topics are static HTML generated from the shared validated build metadata. Library pagination is by lesson identity, not presentation, and topic pages are emitted only for populated controlled topics.

Browser discovery uses three content-hashed JSON artifacts under `/discovery/`: one compact catalogue for Surprise Me and one search document set per edition. Search payloads contain title, description, taxonomy labels, concepts, curated search terms and takeaway; article bodies and source/provenance records are excluded. Today and reading pages never request a search payload. Search fetches only the selected edition after the reader starts a query.

The browser ranking function is application-owned and deterministic. It currently supports exact words, prefixes, multi-word matching and conservative one-character tolerance for longer terms. It is deliberately replaceable; ADR-0003's representative mobile transfer, parse, memory and interaction validation remains an M8 production-hardening gate before a large catalogue is launched.

Related links use immutable IDs and shared generated URLs. Manual editorial relationships with reader-facing reasons rank first, followed by deterministic taxonomy/concept inference. Surprise Me loads only the compact catalogue on activation, excludes the current Today lesson and retains a normal static link as its no-JavaScript/network-failure fallback. Saved/Read/recent weighting remains M6 reader-state work.

## Environments

Pull requests receive preview deployments where practical. `main` represents production-ready repository state. Production deployment consumes only validated published content.

Cloudflare is the initial target. Deployment configuration is replaceable and must not leak into core content/domain APIs.

## Installable app (PWA): cache and update behaviour

Five Minutes is installable (iOS/iPadOS Add to Home Screen and supported Chromium platforms) while remaining an ordinary static website.

- **Files:** `public/manifest.webmanifest` (copied unchanged into `dist/`), `public/favicon.svg`, `public/apple-touch-icon.png` (180x180, opaque) and `public/icons/` (192 and 512 "any" icons plus a 512 maskable icon). `src/layouts/BaseLayout.astro` links them from every page, together with `apple-mobile-web-app-title` and light/dark `theme-color`.
- **App identity:** `id`, `start_url` and `scope` are all `/` (Today). Do not change `id`: browsers treat a different `id` as a different installed app. `npm run verify:static` enforces these values, the standalone display mode, and that every manifest icon resolves to a PNG of its declared size.
- **No service worker.** Current Chromium reports the site as installable without one (Playwright asks Chromium directly via `Page.getInstallabilityErrors`), and iOS does not require one. Nothing is pre-cached or cached by the app, so there is no service-worker update lifecycle and no risk of serving stale lessons. Opening the installed app without a network connection shows the platform's normal offline error, exactly as the website does. Adding a service worker (for example a network-first offline fallback page) is a separate decision: it must stay bounded, never pre-cache the catalogue, and include a versioned cache and a removal path.
- **HTTP caching:** freshness is left to the host. Cloudflare Workers Static Assets currently serves HTML, the manifest, icons and stylesheets with `Cache-Control: public, max-age=0, must-revalidate` plus an `ETag`, so newly published or corrected lessons appear on the next navigation. Stylesheets also carry content-hashed file names (`/_astro/*.css`).
- **Changing icons or the manifest:** browsers and installed apps refresh the manifest and icons on their own schedule (often days) and may keep old icons. When an icon changes, regenerate with `node scripts/generate-icons.mjs` (set `CHROMIUM_PATH` if Playwright's browser is not installed) and give the PNGs new file names, then update the manifest and `BaseLayout.astro`. Keep `id` unchanged.
- **Standalone navigation:** installed (standalone) display has no browser back button or address bar. Every page therefore links back to Today (the header brand link; lesson pages also have "Back to Today"), lesson pages switch edition with in-page links, and internal links never open a new window. `npm run verify:static` checks all three for every built page.

## Dependency management

- Commit the package lockfile and use `npm ci` in CI.
- Pin major infrastructure/build dependencies deliberately; dependency updates arrive through reviewable PRs.
- Keep the runtime dependency set small.
- Architecture-scale benchmarks are rerun when framework/search/build changes could affect the established scaling assumptions.
- Do not introduce a service/library merely to anticipate a hypothetical future requirement.

## Secrets and permissions

- No secrets in lesson files, source control, generated browser assets or preview logs.
- CI/publication credentials use least privilege.
- AI generation/review credentials may create/update bounded branches/PRs but do not receive unrestricted production credentials.
- Production deployment and merge permissions remain separate from content-generation credentials where practical.
- Fork/untrusted workflows do not receive repository secrets.
- Branch protection/required checks guard `main`.

## Automated publication operations

ADR-0007 is the authority for automated lesson publication. The initial subscription-based schedule is:

- ChatGPT writer: once per Europe/Zurich day and no later than 14:00, after checking `publication-paused`, closing clearly stale automated new-lesson PRs, and checking today's slot and remaining automated PRs;
- Claude Code reviewer: every two hours from approximately 06:00 through 20:00 Europe/Zurich;
- named merge checks: `baseline`, `e2e` and `lesson-guard` after M7.2; only the latest completed result of each exact name on the current SHA counts, and it must be `success`;
- stale boundary: an unmerged candidate closes when its intended Zurich date ends;
- failure behaviour: no source access, no capacity, no successful check or any uncertainty means no publication.

M7.2 implements `lesson-guard` as a separate `pull_request_target` workflow. The job checks out the current trusted default branch, installs only its pinned dependencies and runs only its guard code. It never checks out or executes the Pull Request head. Candidate metadata and blobs arrive through read-only GitHub APIs and remain untrusted data; workflow permissions are limited to `contents: read` and `pull-requests: read`, with no repository secrets. PRs targeting a non-default branch do not run the job. Event metadata lets ordinary PRs return not applicable before any GitHub API call. For a signalled candidate, the event head SHA is the immutable input: the live PR head must still match it, and one comparison from current `main` to that SHA supplies both the merge-base proof and changed-file list. The merge base must equal current `main` and the candidate must be zero commits behind. The guard is present after M7.2 but becomes a required branch-protection check only at M7.5.

The reviewer begins editorial review only after all named checks succeed on the current head. Ready review and `expectedHeadSha` merge occur in that same routine run; immediately before merge, the reviewer re-checks the unchanged head, latest named results and that a fresh comparison still has current `main` as the merge base with zero commits behind. An earlier comment, review or label is never authority. Auto-merge is disabled for this flow.

Any open issue labelled `publication-paused` is the shared off switch. Removing the label or closing the issue resumes future runs only. It never revives an ineligible or stale PR.

The fixed writer and reviewer instructions are versioned in `docs/automation/publication-task-contracts.md` and read policy from current `main` before any untrusted data. Before activation, M7.3 records subscription capability, source access, actual GitHub identities and guarded-merge failure tests on a disposable non-production target branch. It also opens an unmerged automated candidate against `main` to prove that `lesson-guard` reports on the event head SHA, and a candidate deliberately branched from an older `main` to prove the ancestry check fails. Neither candidate may publish. M7.4 records three shadow lessons. M7.5 records the exact repository protection settings and confirms that required checks apply to administrators, no approval-count rule blocks the shared identity, and force pushes, deletion and available bypass of `main` are disabled. Recheck these settings during the monthly publication audit because Claude cannot inspect them during each run.

Corrections do not use the daily automation. The Manager or Owner initiates them through the normal `review:mandatory` workflow, and the Manager merges under GOVERNANCE.md after independent review.

Operational records must distinguish routine infrastructure completion from publication success. A green scheduled session is not evidence that a lesson was reviewed or merged; the PR review, exact SHA, named check results and merge record are the durable evidence.

## Backup and recovery

GitHub is the canonical source for code, lesson sources, metadata, provenance and architecture history. Production hosting is reproducible output, not the sole copy.

Before production hardening completes, add a scheduled read-only Git mirror to a second storage/location to reduce account-loss or repository-compromise risk. The mirror is recovery insurance, not a second writable source of truth.

Recovery is:
1. restore/clone the repository at a known-good commit;
2. install pinned dependencies;
3. run validation and clean build;
4. assemble the static artifact;
5. redeploy to the configured provider.

Reader-local Saved/Read state is intentionally device-local and is not server-backed up. M6.3 provides a versioned, bounded export and confirmed replacement import before local state becomes materially valuable.

Provider configuration that cannot live safely in Git must be documented and reproducible from a minimal inventory of environment variables/secrets.

## AI contributor context

`AGENTS.md` is the concise entry point for AI workers/reviewers. It points to governance, architecture and ADRs. Canonical lesson validation runs through the shared loader during `npm test` and `npm run build`; pull-request CI also compares route ownership with the base commit so historical route entries cannot be removed or reassigned. Repository documentation remains authoritative; prompts should not duplicate architecture rules that can drift.

## Testing

Required gates evolve with implementation but include schema/security validation, unit/integration tests, a clean production build, URL-manifest/completeness/internal-link checks and Playwright critical journeys. Run `npm run test:lesson-guard` for the focused M7 scope, identity, registry, date, blob-safety and API-failure cases. The M2 canonical loader fails closed on an empty lesson set, parses YAML/Markdown only through the safe-content pipeline, requires both Adult and Teen presentations for production, validates references/routes, and requires every active slug/alias to be present in the durable route-ownership registry. Pull-request CI checks that registry against the PR base commit. If build sharding is activated later, deterministic partition and assembly validation become additional gates. Critical E2E coverage should include Today, explicit Adult/Teen URLs, Library/search discovery, Saved/Read local state, related navigation, mobile viewport behaviour, manifest/installability metadata and standalone-safe navigation.

Accessibility and broken-link checks are CI concerns. Performance/mobile search budgets are set from representative evidence rather than invented upfront.

## Implementation milestones

1. Foundation: production repo layout, lockfile, Astro shell, baseline CI, Playwright smoke-test foundation and provider-neutral preview deployment boundary.
2. Content contract and validation: canonical lesson model, schema/validation, safe Markdown, lifecycle/provenance and deterministic publication eligibility.
3. Static delivery: catalogue/URL manifest, shared route generation, normal static build, exact completeness/internal-link validation and clean deployment artifact. Add deterministic sharding only when measured build pressure justifies it.
4. Core reading UX: Today, Adult/Teen lesson URLs, responsive reader, takeaway, Test Yourself and installable PWA shell/manifest/icons.
5. Discovery: compact catalogue, Library, Topics, Search, Related and Surprise Me.
6. Local reader state and production-experience integration:
   - **M6.1 foundation:** shared production shell/navigation, ADR-0005 edition-specific discovery routes and ADR-0009 preference/history/Return behaviour. Before the first production preference write, create the final versioned reader-state envelope and storage abstraction. Version 1 reserves stable fields for `edition`, Saved lesson IDs, Read lesson IDs/recent reading and appearance, even where a field is not yet surfaced. Missing fields use documented defaults; readers must tolerate additive unknown fields. No temporary edition-only storage key is permitted.
   - **M6.2 reading/content enhancements:** implement schemaVersion 2 validation and rendering for ADR-0006 figures and Teen activities plus the precisely ordered recall-before-takeaway experience.
   - **M6.3 reader-state surfaces:** Saved/Read/recent/appearance and bounded export/import use the same envelope introduced in M6.1. No legacy migration is present because no genuine earlier reader-state format was published.
   - **M6.4 integration gate:** verify the complete production experience and reader state together, including no-JS fallbacks, storage-blocked behaviour, explicit/neutral routes, Return/session-origin handling, Back/bfcache behaviour, installed-app navigation and changed accessibility journeys. Focused Playwright WebKit coverage supplements the existing Chromium projects; the bounded physical-iPhone/Safari/standalone/VoiceOver checklist and evidence format live in `docs/implementation/m6.4-integration-gate.md`. WebKit emulation never substitutes for that device record.
7. Automated publication: implement ADR-0007 in five gates — contracts/threat model, lesson-only guard, subscription capability spike, three shadow lessons, then protected activation. The reviewer starts only after named checks pass and merges the exact reviewed head in the same run. Initial automation may author schema-v2 Teen activities but not new figures.
8. Production hardening: the existing broader M8 gate remains Playwright/accessibility/link/security/performance/mobile validation, analytics boundary and operational recovery test. M6.4 does not replace M8.

## Architecture acceptance checklist

Before architecture discovery closes:
- ADRs reflect Owner-approved decisions.
- second independent architecture review is completed and findings resolved;
- clean-build and deployment approach is reproducible;
- current hosting limits are documented as operational thresholds;
- implementation can proceed in bounded issues without reopening core architecture.


## M1 foundation integration gate

Before starting the content/schema milestone (M2), verify the merged M1 foundation as one system:

1. From a clean checkout, use Node.js 22 and run `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run dist:count`, then `npm run test:e2e`.
2. Confirm GitHub CI passes both the baseline and Playwright jobs on the integration PR.
3. Confirm Cloudflare Workers Builds creates a working branch Preview from the same provider-neutral `dist/`; production/custom-domain activation is not part of this gate.
4. Reconcile repository documentation with observed behaviour and review the accepted ADRs for implementation drift.
5. Record and obtain Owner approval for any architecture deviation before closing M1.

The gate is verification-first: do not add product features while closing M1. Defect fixes and documentation corrections discovered by the gate are in scope.

## M3 static-delivery integration gate

The assembled static artifact is the integration boundary. CI builds it, verifies exact canonical Adult/Teen route completeness and internal links, compiles provider-specific delivery artifacts, verifies those artifacts, checks current Cloudflare capacity, records the final deployable file count with a 16,000-file early warning, and then runs Playwright against the built site.

Cloudflare-specific hard limits remain under `deploy/cloudflare/`; provider-neutral build/content code contains no Cloudflare capacity constants. As verified for M3.5 in October 2026, the adapter checks 20,000 Free / 100,000 Paid static-file capacity, 25 MiB maximum individual assets and 2,000 static redirect rules. Crossing the Free file limit does not silently choose a paid plan: it warns and requires an Owner decision before production deployment strategy changes. Crossing the Paid/file-size/redirect hard ceilings fails closed.

No deterministic build sharding is enabled at M3 close. If measured build time or memory later becomes operationally constraining, ADR-0002's deterministic sharding design can be activated and the same final assembled-artifact integrity/capacity gates remain applicable.

## M4 core reading UX + PWA integration gate

M4 closes with Today, explicit Adult/Teen reading pages and the installable shell verified as one static system (#45). The checks that guard it are part of normal CI:

- `npm run verify:static` checks every built page for the web app manifest link, an in-page link to Today and no internal new-window links. It also checks the manifest contract (`id`, `start_url` and `scope` are `/`; `display` is `standalone`; every icon resolves to a PNG of its declared size).
- Playwright (desktop Chromium and iPhone-class mobile) covers:
  - Today → Adult/Teen → edition switch → Takeaway → Test Yourself → back to Today;
  - one page `<h1>`, no horizontal overflow, keyboard access and the system light/dark scheme;
  - install metadata and Chromium's own installability check;
  - no service worker or Cache Storage;
  - an in-page-only, in-scope journey from the manifest `start_url`.
- The presentation heading contract (ADR-0006) is enforced by the content pipeline at build time.

Installability on iOS/iPadOS cannot be exercised in CI, so it was verified on a real device. On 2026-10-03 the Owner installed the PR #44 Cloudflare preview on an iPhone via Safari Add to Home Screen: the "Five Minutes" name and icon appeared correctly, the standalone launch removed Safari's browser chrome, and Today rendered correctly. The current icon is accepted as v1 branding; it can be replaced later by the process in "Installable app (PWA)" above, without changing the app `id`.

M4 deliberately ships no service worker, no stored edition/appearance preference (M6) and no discovery features (M5). Remaining non-blocking review items are tracked in #42.
