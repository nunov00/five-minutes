# Five Minutes Architecture

Status: accepted target architecture, based on architecture discovery, reproducible 10,000-lesson benchmarks and Owner-approved ADRs. Significant changes require Owner approval under docs/GOVERNANCE.md.

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
11. **Installable web app.** Five Minutes must be installable and usable with standalone app-like presentation on iOS/iPadOS via Add to Home Screen and in Chrome on supported platforms, while remaining a normal standards-based website.

## Target system

### Source and content

Canonical lessons are individual structured files in Git, validated against a schema.

Shared lesson metadata includes the immutable ID, mutable slug/aliases, publication time, topic/subtopic/concepts, relationships, provenance/sources and generation/review metadata defined by ADR-0006.

Adult and Teen Markdown are both required for publication. Draft generation may temporarily contain only one presentation, but incomplete lessons cannot be published. Audience-specific title/description/body/examples/takeaway/retrieval question may differ while sharing the same lesson identity.

### Web framework

Astro is the target web framework. The initial production model is a normal static build. Sharding is a measured scale-up mechanism, not a day-one requirement.

The GitHub Actions 20,000-page monolithic benchmark exhausted the smaller CI runner at ~4.29 GiB RSS, while four 5,000-page shards completed at ~1.77-1.78 GiB each. A second independent review reproduced the monolithic build on a larger 15-GB machine and completed all 20,000 pages in ~260 seconds at ~5.9 GiB peak memory. The evidence therefore identifies CI-resource pressure rather than an Astro/static-generation limit.

ADR-0002 defines the sharding-ready contract: catalogue/URL manifest first, one shared URL generator, global pages built once, lesson pages dependent only on their own body plus compact global metadata, and exact manifest/link validation.

### Search

Search is discovery-oriented initially, not full-body text search.

Discovery delivery is tiered rather than forcing one large browser payload onto every screen:

- Today, Library and Topics are statically rendered and progressively enhanced; catalogue browsing does not require the search index.
- A compact browser catalogue contains only the identity/URL/edition/taxonomy/date/title fields needed for Saved/Read joins and lightweight discovery such as Surprise Me.
- Edition-specific search indexes contain the richer discovery fields (title, description/deck, taxonomy/concepts, curated search terms and takeaway) and load only when search is used.
- Generated discovery artifacts use content-hashed names where practical so cached clients do not retain stale indexes.

MiniSearch is the initial candidate behind an application-owned interface. Browser/mobile validation remains a production-hardening gate.

### Reader state

A small storage abstraction owns Saved, Read/Unread, recent lessons, selected edition and appearance preferences. The first implementation uses browser-local storage. Components must not access storage directly where doing so would make future sync unnecessarily invasive.

ADR-0009 and the 2026-10-04 ADR-0005/0006 amendments record the Owner-approved post-M5 production contracts. M6 introduces the final versioned reader-state envelope before its first edition-preference write, then reuses that same abstraction for Saved/Read/recent/appearance and export/import. Adult and Teen remain explicit canonical lesson URLs, while a deliberate publication-level edition choice stores the reader's default for neutral entry points. Explicit/shared lesson URLs and same-lesson edition bridges do not silently mutate that preference. Saved/Read and edition state are integrated into the shared publication shell rather than implemented against an interface scheduled for replacement. M6.3's `/saved` surface joins immutable stored IDs to the compact browser catalogue; missing catalogue entries are retained and reported, not deleted. Recent reading is bounded to 50 edition-specific visits.

### Production experience

The Owner-approved post-M5 direction is **one publication, two visual voices**. Edition-specific discovery routes live under `/editions/<edition>/...`; explicit lesson routes remain `/adult/<slug>` and `/teen/<slug>`, while `/` remains the neutral two-edition Today entry. Shared publication navigation may present Adult and Teen with materially different visual treatment while preserving one lesson identity, the ADR-0005 route contract and progressively enhanced reading.

The reading experience uses a recall-before-summary ending: after the explanatory body, the reader is prompted to retrieve/consider the central idea before the final takeaway/answer is presented. It may include reviewed per-edition explanatory figures and optional lightweight Teen-only prediction/choice activities. Figures and activities require safe structured canonical contracts before production publication; raw executable lesson content remains prohibited. The isolated design prototype is reference evidence only and is not a production dependency. See ADR-0009 for preference/history semantics, prototype boundaries and production verification gates.

### Hosting and runtime

Cloudflare is the initial deployment target, not an application dependency.

The initial site is a static deployment artifact: generated lesson HTML, stable application assets and compact discovery data. No lesson-rendering runtime or application database is required initially. Provider-specific build/deployment configuration remains at the boundary so another static host can replace Cloudflare.

### Installable app / PWA

Five Minutes is a Progressive Web App as well as a website. The production app must provide a web app manifest, appropriate icons and metadata, standalone display behaviour, secure HTTPS delivery and installability on supported Chrome platforms and iOS/iPadOS Add to Home Screen.

PWA support must remain standards-based and provider-neutral. Core reading must continue to work in an ordinary browser without installation.

Installability does not require a service worker on the target platforms, and the current implementation deliberately has none: the app caches nothing, and reading is network-dependent exactly like the website. A service worker (for example a bounded offline fallback) is optional future work that requires a deliberate decision. Any such caching must stay bounded, must never pre-cache or download the complete lesson catalogue, and must not make newly published or corrected lessons unexpectedly stale. Operational details and cache/update behaviour are in `docs/OPERATIONS.md`.

### Analytics

Start with privacy-conscious infrastructure-level analytics. Product-event analytics must be justified separately and should avoid requiring accounts or unnecessary personal data.

### Publication pipeline

Schedule/manual trigger
-> research
-> draft lesson + provenance
-> schema/content validation
-> automated quality checks
-> pull request
-> independent AI review (routine publication authority; fail closed/escalate on uncertainty)
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

Representative-vocabulary GitHub Actions benchmarks with Node 22 and Astro 5.14.1 measured:

- 1,000 lesson identities / 2,000 pages: 25.27s, ~0.94 GiB peak RSS.
- 5,000 identities / 10,000 pages: 1m45s, ~2.93 GiB peak RSS.
- 10,000 identities / 20,000 pages on the smaller CI runner: heap/resource failure at ~4.29 GiB RSS.
- Four 5,000-page shards: ~54-58s and ~1.77-1.78 GiB peak RSS each.
- Independent second-review machine (4 vCPU/15 GB, Node 22 larger default heap): monolithic 20,000-page build completed in ~260s at ~5.9 GiB peak memory.
- Compact discovery-search benchmark: 20,000 edition documents; 12.49 MiB serialized / 1.86 MiB gzip; build-side feasibility only, not mobile-browser evidence.

The correct conclusion is that static generation is viable and build memory grows materially with catalogue size. Sharding is a demonstrated mitigation for per-process memory, but the synthetic assembly benchmark did not model a complete production site and therefore does not justify mandatory sharding now.

## Repository and operations

The proposed repository structure, build/deployment flow, dependency/secrets strategy, backup/recovery model, AI-worker context and implementation milestones are defined in `docs/OPERATIONS.md`.

The architecture is designed so a clean checkout with pinned dependencies can reproduce the deployable artifact; hosting is replaceable output rather than canonical state.

## Cloudflare deployment boundary

As verified against Cloudflare documentation on 2 October 2026, the Free plan supports 20,000 static files per Pages site or Worker version and paid plans support 100,000. The synthetic 20,001-file artifact omitted real global pages, assets, PWA files and redirects, so it must not be described as a realistic near-fit for the Free limit.

The Owner has decided not to pre-commit to a paid plan or provider migration. Actual production file count is monitored. Before the active hosting limit becomes constraining, the project will compare then-current Cloudflare plans, other portable static hosts and deployment representations. Any material recurring-cost choice remains an Owner decision.

## Deliberately deferred decisions

The following remain design work rather than accidental commitments:

- search-index sharding threshold;
- realistic mobile search performance thresholds;
- analytics product-event requirements;
- future cross-device state synchronization;
- final Cloudflare production/custom-domain activation and cutover configuration.

These decisions should be recorded in ADRs when they become significant.

The initial controlled topic/subtopic vocabulary and related-content priority rules are defined by ADR-0008. Concept vocabulary remains editorially extensible and is not a public hierarchy.

## M6.1 implementation boundary

The production reader-state envelope, storage abstraction, edition discovery routing, neutral chooser/forwarding SEO policy and session Return validation are documented in [M6.1 implementation](implementation/m6.1-reader-foundation.md). [M6.3 implementation](implementation/m6.3-reader-state-surfaces.md) documents Saved/Read/recent/appearance and local data portability. They implement ADR-0005/0009 without introducing accounts, server code or prototype dependencies.

## M6.2 implementation boundary

The optional per-edition figure and Teen-only activity contracts, safe asset validation, progressive enhancement and shared recall-first ending are documented in [M6.2 reading enhancements](implementation/m6.2-reading-enhancements.md). The schema-v2 corpus migration must land before authored extensions. No persistent activity state or new service is introduced. Independent code and editorial review are required before publication.
