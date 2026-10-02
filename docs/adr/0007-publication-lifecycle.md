# ADR-0007: Publication lifecycle and Today semantics

Status: Proposed
Date: 2026-10-02
Owner direction: independent AI review may authorize routine lesson publication; final architecture approval remains pending.

## Context

Five Minutes needs automated lesson creation without allowing an AI worker to publish arbitrary output directly to production. Draft/review/publish semantics must be unambiguous for pages, catalogue/search, sitemaps and the Today experience.

The product should support scheduled daily publication while keeping Git as the production authority. Publication policy must also distinguish automated review from the Owner's role in product and architecture decisions.

## Decision

### Lifecycle

Lessons move through:

`draft -> reviewed -> published`

- **draft**: content exists in a branch/PR and may be previewed, but is not eligible for production discovery.
- **reviewed**: required content/factual/technical checks have passed, but the lesson is not yet production content.
- **published**: the lesson is eligible for production pages, catalogue, search, sitemap, related-content links and Today.

Production generators must fail closed: draft/reviewed content must not leak into public production outputs.

### Repository boundary

Normal lesson generation occurs on a branch and enters the repository through a pull request.

AI workers do not receive permission to push directly to `main`.

Merging an eligible lesson PR is the repository publication authorization. A scheduled workflow may merge an already-reviewed, approved PR at the intended publication time; it must not bypass required checks/review.

### Publication time

`publishedAt` is the effective publication timestamp and is recorded in the lesson metadata when the lesson becomes published.

Initial scheduling should be implemented by timing the authorized merge/deployment rather than keeping future-published content on `main` and relying on runtime clocks. This keeps static builds deterministic and avoids hidden future content entering catalogue/search artifacts.

If future-dated content on `main` becomes useful later, that is a deliberate extension and all production outputs must apply the same eligibility rule.

### Today

**Today is the newest published lesson according to `publishedAt`.**

It is not a separate manually maintained content slot.

If no new lesson is published on a calendar day, Today continues to show the newest published lesson rather than becoming empty.

For display/grouping purposes, publication dates use the site's configured editorial timezone. The initial editorial timezone is Europe/Zurich; timestamps remain stored in an unambiguous offset/UTC form.

Adult and Teen presentations share the same publication identity and `publishedAt`. If a Teen presentation does not exist, the Teen experience must handle that explicitly rather than inventing a separate Teen publication date.

### Review gate

A lesson may not become `published` until:

1. schema and content validation pass;
2. links/source metadata pass automated checks;
3. factual/source review has completed;
4. editorial quality review has completed;
5. required CI/build tests pass.

Factual/editorial review may be performed by an independent AI reviewer. The Owner has approved independent AI review as sufficient authorization for routine lesson publication once all required automated validation and CI gates pass.

The reviewer must be independent of the generation step for that lesson. Review failure, material uncertainty, unsupported claims, safety/policy concerns, schema/security failures or other defined exceptional conditions must fail closed and escalate rather than publish automatically. Human review remains available but is not mandatory for every routine lesson.

### Corrections

Published lessons are editable. Corrections use the normal PR/review/deploy path and retain the same immutable lesson ID and original `publishedAt`.

A later schema may add `updatedAt` and material-correction history where useful; correcting an article does not make it Today's new lesson.

## Consequences

- Static builds are deterministic and do not depend on the viewer's clock.
- All public discovery surfaces share one publication eligibility rule.
- Today requires no special database/state.
- Scheduled publication can be implemented with repository automation rather than runtime infrastructure.
- Automated publication can operate without mandatory per-lesson human approval while retaining an independent review gate and fail-closed escalation.

## Required implementation controls

The publication pipeline should use least-privilege credentials, branch protection/required checks, and secrets that are not exposed to untrusted fork workflows.

AI-authored canonical bodies use the safe Markdown contract in ADR-0006. Publication validation must reject unsafe links/content according to the security policy.

## Owner decision

Independent AI review is sufficient for routine lesson publication. Article-content and editorial-quality policy will be refined separately; this ADR defines the authorization mechanism, not the future editorial rubric.
