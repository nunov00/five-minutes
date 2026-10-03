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

## Environments

Pull requests receive preview deployments where practical. `main` represents production-ready repository state. Production deployment consumes only validated published content.

Cloudflare is the initial target. Deployment configuration is replaceable and must not leak into core content/domain APIs.

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

## Backup and recovery

GitHub is the canonical source for code, lesson sources, metadata, provenance and architecture history. Production hosting is reproducible output, not the sole copy.

Before production hardening completes, add a scheduled read-only Git mirror to a second storage/location to reduce account-loss or repository-compromise risk. The mirror is recovery insurance, not a second writable source of truth.

Recovery is:
1. restore/clone the repository at a known-good commit;
2. install pinned dependencies;
3. run validation and clean build;
4. assemble the static artifact;
5. redeploy to the configured provider.

Reader-local Saved/Read state is intentionally device-local and is not server-backed up. A versioned export/import facility should be added before local state becomes materially valuable.

Provider configuration that cannot live safely in Git must be documented and reproducible from a minimal inventory of environment variables/secrets.

## AI contributor context

`AGENTS.md` is the concise entry point for AI workers/reviewers. It points to governance, architecture and ADRs. Canonical lesson validation runs through the shared loader during `npm test` and `npm run build`; pull-request CI also compares route ownership with the base commit so historical route entries cannot be removed or reassigned. Repository documentation remains authoritative; prompts should not duplicate architecture rules that can drift.

## Testing

Required gates evolve with implementation but include schema/security validation, unit/integration tests, a clean production build, URL-manifest/completeness/internal-link checks and Playwright critical journeys. The M2 canonical loader fails closed on an empty lesson set, parses YAML/Markdown only through the safe-content pipeline, requires both Adult and Teen presentations for production, validates references/routes, and requires every active slug/alias to be present in the durable route-ownership registry. Pull-request CI checks that registry against the PR base commit. If build sharding is activated later, deterministic partition and assembly validation become additional gates. Critical E2E coverage should include Today, explicit Adult/Teen URLs, Library/search discovery, Saved/Read local state, related navigation, mobile viewport behaviour, manifest/installability metadata and standalone-safe navigation.

Accessibility and broken-link checks are CI concerns. Performance/mobile search budgets are set from representative evidence rather than invented upfront.

## Implementation milestones

1. Foundation: production repo layout, lockfile, Astro shell, baseline CI, Playwright smoke-test foundation and provider-neutral preview deployment boundary.
2. Content contract and validation: canonical lesson model, schema/validation, safe Markdown, lifecycle/provenance and deterministic publication eligibility.
3. Static delivery: catalogue/URL manifest, shared route generation, normal static build, exact completeness/internal-link validation and clean deployment artifact. Add deterministic sharding only when measured build pressure justifies it.
4. Core reading UX: Today, Adult/Teen lesson URLs, responsive reader, takeaway, Test Yourself and installable PWA shell/manifest/icons.
5. Discovery: compact catalogue, Library, Topics, Search, Related and Surprise Me.
6. Local reader state: Saved/Read/recent/edition/appearance with versioned storage abstraction.
7. Automated publication: generation -> validation -> independent AI review -> eligible PR -> scheduled merge/deploy, with escalation on review failure/uncertainty.
8. Production hardening: Playwright, accessibility, link checks, performance/mobile validation, analytics boundary and operational recovery test.

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
