# Architecture Review Checklist

Use this for the second independent architecture review. Review the repository as a proposed design, not as production implementation.

## Prior blockers to verify

1. The earlier hybrid route bundled the full catalogue into a runtime worker. Confirm the proposed architecture no longer depends on that runtime design.
2. The original rendering/search comparison was confounded by Pagefind. Confirm corrected evidence independently tests static generation and compact discovery search.
3. Confirm Adult/Teen delivery semantics are unambiguous and consistently reflected in schema, URLs, search, local state and page-count assumptions.
4. Confirm the lesson identity/schema contract is sufficient for implementation and does not depend on slug identity.

## Current architecture to challenge

- Git-backed canonical lessons; no application database initially.
- Astro static lesson pages built in bounded deterministic shards and collision-safe assembled.
- Separate Adult and Teen presentation URLs sharing immutable lesson identity.
- Compact metadata discovery search/catalogue, no initial full-body search.
- Browser-local reader state behind an abstraction.
- Cloudflare as initial replaceable static host.
- Draft/reviewed/published lifecycle; independent AI review may authorize routine publication, with fail-closed escalation.
- Plain Markdown, no MDX/raw executable lesson content.

## Review questions

Look specifically for correctness gaps, hidden coupling, security/privacy problems, build/deploy fragility, unreproducible assumptions, missing failure/recovery paths, scaling cliffs, ambiguous contracts, unnecessary complexity, and decisions that would be expensive to reverse.

Check whether docs/ARCHITECTURE.md, docs/OPERATIONS.md, AGENTS.md and ADR-0001..0007 agree with one another.

Distinguish:
- BLOCKER: must resolve before architecture approval;
- IMPORTANT: should resolve before implementation unless explicitly deferred;
- MINOR: cleanup/documentation improvement;
- DEFERRED/ACCEPTABLE: consciously postponed without blocking architecture.

Do not approve merely because previous blockers were addressed. Challenge the proposed sharded-static architecture on its own merits.
