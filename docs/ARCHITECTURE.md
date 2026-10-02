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

Astro is the target web framework. Lesson pages are statically generated in bounded, deterministic build shards and assembled into one validated deployment artifact. Shard boundaries are invisible to public URLs and lesson identity.

Corrected 10,000-identity / 20,000-presentation benchmarks showed that a monolithic Astro content build exceeded the normal Node heap, while four parallel 5,000-page shards completed consistently at about 1.77-1.78 GiB peak RSS each. The assembled result validated all 20,000 unique HTML pages.

### Search

Search is discovery-oriented initially, not full-body text search. A compact generated catalogue/search representation contains edition-specific title, description/deck, taxonomy/concepts, curated search terms and takeaway metadata. It is lazy-loaded only by discovery surfaces.

MiniSearch is the initial candidate behind an application-owned search interface. The original full-text synthetic MiniSearch size figures are not treated as evidence for realistic 10k full-text search; realistic-vocabulary and mobile-browser validation is required before acceptance.

The same compact catalogue should, where practical, power Library, Topics, Surprise Me and local Saved/Read filtering rather than creating multiple browser datasets.

### Reader state

A small storage abstraction owns Saved, Read/Unread, recent lessons, selected edition and appearance preferences. The first implementation uses browser-local storage. Components must not access storage directly where doing so would make future sync unnecessarily invasive.

### Hosting and runtime

Cloudflare is the initial deployment target, not an application dependency.

The initial site is a static deployment artifact: assembled lesson HTML, stable application assets and compact discovery data. No lesson-rendering runtime or application database is required initially. Provider-specific build/deployment configuration remains at the boundary so another static host can replace Cloudflare.

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

Corrected representative-vocabulary benchmarks on GitHub Actions with Node 22 and Astro 5.14.1:

- 1,000 lesson identities / 2,000 pages: 25.27s, ~0.94 GiB peak RSS, 13.27 MiB output.
- 5,000 identities / 10,000 pages: 1m45s, ~2.93 GiB peak RSS, 66.37 MiB output.
- 10,000 identities / 20,000 pages in one Astro process: Node heap OOM after ~4m22s at ~4.29 GiB RSS.
- Four 2,500-identity / 5,000-page shards: each ~54-58s and ~1.77-1.78 GiB peak RSS.
- Assembly validation: four shards -> 20,000 unique HTML pages, no conflicting shard output, plus one compact search artifact.
- Compact discovery search: 20,000 edition-specific documents / 10,000 identities; 12.49 MiB serialized, 1.86 MiB gzip; index construction ~566ms and Node load ~267ms. Representative CI query p95 was ~34-51ms. Browser/mobile validation remains required.
- Final synthetic assembled artifact: 20,001 files / 145.25 MiB.

The evidence supports sharded static lesson generation plus compact client-side discovery search. It does not support adding a database, client-rendering lesson bodies, or accepting the earlier hybrid/on-demand implementation.

## Deliberately deferred decisions

The following remain design work rather than accidental commitments:

- exact topic/concept taxonomy;
- related-content scoring/override rules;
- search-index sharding threshold;
- realistic mobile search performance thresholds;
- analytics product-event requirements;
- future cross-device state synchronization;
- final Cloudflare production/preview configuration.

These decisions should be recorded in ADRs when they become significant.
