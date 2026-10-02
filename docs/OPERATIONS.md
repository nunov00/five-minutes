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

If measured build pressure later justifies sharding, only lesson rendering is partitioned. Global outputs are generated once and every shard consumes the same catalogue/URL contract. Partition assignment and final URL completeness are validated explicitly.

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

`AGENTS.md` is the concise entry point for AI workers/reviewers. It points to governance, architecture and ADRs. Schema/validation commands will be added there when the implementation creates them. Repository documentation remains authoritative; prompts should not duplicate architecture rules that can drift.

## Testing

Required gates evolve with implementation but include schema/security validation, unit/integration tests, a clean production build, URL-manifest/completeness/internal-link checks and Playwright critical journeys. If build sharding is activated later, deterministic partition and assembly validation become additional gates. Critical E2E coverage should include Today, explicit Adult/Teen URLs, Library/search discovery, Saved/Read local state, related navigation, mobile viewport behaviour, manifest/installability metadata and standalone-safe navigation.

Accessibility and broken-link checks are CI concerns. Performance/mobile search budgets are set from representative evidence rather than invented upfront.

## Implementation milestones

1. Foundation: production repo layout, lockfile, Astro shell, schema/validation, CI and preview deployment.
2. Content pipeline: canonical lesson model, safe Markdown, lifecycle/provenance and deterministic publication eligibility.
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
