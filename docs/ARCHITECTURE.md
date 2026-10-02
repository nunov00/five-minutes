# Five Minutes Architecture

Status: proposed target architecture, based on architecture discovery and reproducible 10,000-lesson benchmarks. Significant changes require Owner approval under docs/GOVERNANCE.md.

## Product architecture goal

Five Minutes is a content-oriented learning publication. The architecture should make one worthwhile idea exceptionally easy to publish, discover, read, understand, test and explore, while remaining simple to operate and inexpensive to change.

Core journey:

Open -> Today's idea -> Read -> Understand -> Test yourself -> Explore another idea

## Architectural principles

1. **Git is authoritative.** Product code, lesson sources, architecture decisions and publication changes are reviewable repository changes.
2. **Content first, application second.** Do not introduce application infrastructure unless the product requires it.
3. **Static where practical; dynamic where it buys concrete scale or UX value.**
4. **Individual authoring, independent deployment representation.** Lessons remain individually addressable in Git even when build/runtime representations are bundled or indexed differently.
5. **One lesson identity, multiple audience presentations.** Adult and Teen presentations share identity and common metadata but can differ substantially in wording, examples and structure.
6. **Local-first reader state.** Saved/read/recent/edition/appearance state stays in the browser initially. No account or application database is introduced merely for these features.
7. **Provider and technology portability.** Core application/content logic must not directly depend on hosting-provider APIs. Provider-specific integrations belong at adapters/configuration boundaries. Search and AI-provider integrations likewise sit behind replaceable interfaces.
8. **Evidence before complexity.** Scale decisions should be benchmarked. A hypothetical future problem is not sufficient reason to add infrastructure today.
9. **Production through review.** AI workers create reviewable repository changes; they do not directly publish production.
10. **Accessible, mobile-first, progressively enhanced reading.** The lesson itself must not depend on a heavy client application.

## Target system

### Source and content

Canonical lessons are individual structured files in Git, validated against a schema.

Shared lesson metadata is expected to include stable ID/slug, publication date/status, topic/subtopic, concepts/tags, relationships, provenance/sources and generation/review metadata.

Audience-specific content includes Adult and Teen title/deck/body/examples/takeaway/retrieval question where appropriate. The exact schema remains a separate design decision.

### Web framework

Astro is the target web framework. Architecture benchmarks showed that Astro handles a synthetic 10,000-lesson corpus comfortably within the target build-time constraint.

Stable small routes may be prerendered. Lesson routes use on-demand server rendering rather than requiring one physical HTML asset per lesson.

### Search

Search is discovery-oriented initially, not full-body text search. A compact generated catalogue/search representation contains edition-specific title, description/deck, taxonomy/concepts, curated search terms and takeaway metadata. It is lazy-loaded only by discovery surfaces.

MiniSearch is the initial candidate behind an application-owned search interface. The original full-text synthetic MiniSearch size figures are not treated as evidence for realistic 10k full-text search; realistic-vocabulary and mobile-browser validation is required before acceptance.

The same compact catalogue should, where practical, power Library, Topics, Surprise Me and local Saved/Read filtering rather than creating multiple browser datasets.

### Reader state

A small storage abstraction owns Saved, Read/Unread, recent lessons, selected edition and appearance preferences. The first implementation uses browser-local storage. Components must not access storage directly where doing so would make future sync unnecessarily invasive.

### Hosting and runtime

Cloudflare is the initial deployment target, not an application dependency.

Astro's Cloudflare adapter/configuration forms the provider boundary. Core lesson, search, state and UI logic should remain portable to another supported deployment environment.

On-demand lesson responses should use appropriate CDN/runtime caching so popular immutable published lessons do not require unnecessary repeated computation.

### Analytics

Start with privacy-conscious infrastructure-level analytics. Product-event analytics must be justified separately and should avoid requiring accounts or unnecessary personal data.

### Publication pipeline

Schedule/manual trigger
-> research
-> draft lesson + provenance
-> schema/content validation
-> automated quality checks
-> pull request
-> independent review
-> merge
-> deployment

Published production state derives from the repository. The publication system must support draft/reviewed/published lifecycle states.

### Testing and quality gates

The target quality pipeline includes, as appropriate:

- schema/content validation;
- build/static analysis;
- unit tests for pure logic;
- integration tests;
- Playwright critical journeys;
- mobile viewport checks;
- accessibility checks;
- broken-link/content-reference checks;
- architecture-scale benchmark when relevant;
- deployment preview before production.

## Scale evidence

The 10k spike deliberately separated source-file count, rendered HTML count and search-index file count.

Full prerender + Pagefind:
- 20,064 deployed files / 48.74 MiB;
- Astro build ~1m33s;
- Pagefind ~10,064 files.

Hybrid lesson rendering + Pagefind:
- 10,083 deployed files / 90.65 MiB;
- Pagefind still ~10,060 files.

Hybrid lesson rendering + MiniSearch:
- 25 deployed files in the synthetic spike;
- compact search represented by 2 benchmark files;
- serialized MiniSearch index ~7.06 MiB, gzip ~1.46 MiB;
- search-index build ~2.1s; load ~162ms on CI;
- representative synthetic queries ~44-67ms.

The evidence supports hybrid/on-demand lesson rendering plus compact client-side search as the initial scale architecture. It does not support adding a database or client-rendering lesson bodies.

## Deliberately deferred decisions

The following remain design work rather than accidental commitments:

- exact lesson schema and source format;
- exact topic/concept taxonomy;
- related-content scoring/override rules;
- exact cache policy;
- final URL conventions;
- search-index sharding threshold;
- realistic mobile search performance thresholds;
- analytics product-event requirements;
- future cross-device state synchronization;
- final Cloudflare production/preview configuration.

These decisions should be recorded in ADRs when they become significant.
