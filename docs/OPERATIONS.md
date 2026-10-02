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
      +--> deterministic lesson partitioner
      |       +--> static shard A --+
      |       +--> static shard B --+--> collision-safe assembly
      |       +--> static shard ...-+           |
      |                                         +--> deployable static artifact
      +--> catalogue/search generator ----------+
                                                |
                                                +--> preview / production deploy
```

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

GitHub is the canonical backup for code, lesson sources, metadata, provenance and architecture history. Production hosting is reproducible output, not the sole copy.

Recovery is:
1. restore/clone the repository at a known-good commit;
2. install pinned dependencies;
3. run validation and clean build;
4. assemble the static artifact;
5. redeploy to the configured provider.

Reader-local Saved/Read state is intentionally device-local and is not server-backed up. A versioned export/import facility should be added before local state becomes materially valuable.

Provider configuration that cannot live safely in Git must be documented and reproducible from a minimal inventory of environment variables/secrets.

## AI contributor context

`AGENTS.md` is the concise entry point for AI workers/reviewers. It points to governance, architecture, ADRs, schema and validation commands. Repository documentation remains authoritative; prompts should not duplicate architecture rules that can drift.

## Testing

Required gates evolve with implementation but include schema/security validation, unit/integration tests, a clean production build, shard assembly/completeness checks and Playwright critical journeys. Critical E2E coverage should include Today, explicit Adult/Teen URLs, Library/search discovery, Saved/Read local state, related navigation and mobile viewport behaviour.

Accessibility and broken-link checks are CI concerns. Performance/mobile search budgets are set from representative evidence rather than invented upfront.

## Implementation milestones

1. Foundation: production repo layout, lockfile, Astro shell, schema/validation, CI and preview deployment.
2. Content pipeline: canonical lesson model, safe Markdown, lifecycle/provenance and deterministic publication eligibility.
3. Static delivery: deterministic partitioning, shard builds, collision-safe assembly and clean deployment artifact.
4. Core reading UX: Today, Adult/Teen lesson URLs, responsive reader, takeaway and Test Yourself.
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
