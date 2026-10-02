# AGENTS.md

Five Minutes is a Git-backed, static learning publication. Read these before substantive changes:

1. `docs/GOVERNANCE.md`
2. `docs/ARCHITECTURE.md`
3. relevant files under `docs/adr/`
4. `docs/OPERATIONS.md`

## Working rules

- GitHub is authoritative; `main` must remain production-ready.
- Significant work uses an issue/task, branch, PR, checks and review.
- Preserve one immutable lesson identity across Adult/Teen presentations.
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
