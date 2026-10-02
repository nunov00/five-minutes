# ADR-0003: Compact catalogue and metadata search

Status: Proposed
Date: 2026-10-02
Owner approval: pending final architecture approval.

## Context

Five Minutes needs Search, Library, Topics, Saved/Read filtering and Surprise Me without introducing a search service or application database.

The first 10,000-lesson MiniSearch spike indexed full synthetic lesson bodies and produced a 7.06 MiB raw / 1.46 MiB gzip index. The independent architecture review correctly identified that the synthetic corpus had unrealistically repetitive vocabulary, so those size/load figures are not valid evidence for full-text search over 10,000 real lessons.

Pagefind was also tested successfully but produced roughly one deployed search file per lesson, making search representation itself a file-count constraint.

## Decision

### Search scope

Initial search is **discovery search**, not full-body document search.

The searchable representation is limited to compact, edition-specific discovery fields such as:

- title;
- description/deck;
- topic;
- subtopic;
- concepts/tags;
- curated search terms/synonyms;
- takeaway.

The complete Adult/Teen article body is not part of the initial client-side search index.

Full-text article search is a future feature requiring its own evidence and architecture decision.

### Tiered discovery data

Do not make the search index a dependency of every discovery screen.

- **Static discovery pages:** Today, Library and Topics are rendered as static HTML (with pagination where needed) and work without downloading the client search index.
- **Compact browser catalogue:** a deliberately small representation contains immutable ID, URL/slug, edition availability, publication date, topic/subtopic and edition titles. It supports Saved/Read joins, lightweight filtering and Surprise Me.
- **Search indexes:** richer edition-specific discovery fields (description/deck, concepts/tags, curated synonyms/search terms and takeaway in addition to the compact fields) live in search-only payloads loaded when search is used.

Generated browser artifacts should use content-hashed filenames where practical so cached clients do not silently retain stale catalogue/search data.

All URLs are produced by the shared application URL-generation module defined by ADR-0002; search/index code must not reconstruct route strings independently.

### Search implementation

MiniSearch remains the initial candidate implementation behind an application-owned search interface.

The build derives edition-specific search documents from validated content metadata. The UI must not depend directly on MiniSearch-specific data structures.

Search payloads are lazy-loaded only when search is used. The compact browser catalogue is loaded only by features that need it. Neither is required on the core Today/lesson reading path.

### Edition semantics

Adult search ranks/matches Adult discovery text. Teen search ranks/matches Teen discovery text.

Shared taxonomy/concepts may be reused, but one edition's prose must not cause surprising matches in the other edition.

Lessons without a Teen presentation are absent from Teen search results unless a later product decision explicitly introduces a cross-edition fallback.

### Performance evidence and remaining mobile gate

The corrected realistic-vocabulary benchmark at 10,000 lesson identities / 20,000 edition-specific discovery documents produced a 12.49 MiB serialized index and 1.86 MiB gzip representation. Index construction was ~566ms, Node load ~267ms, and representative CI query p95 ~34-51ms.

This establishes the build-side feasibility of compact discovery search but is not evidence of browser memory or main-thread behaviour. Representative mobile-browser validation remains an implementation acceptance gate before the discovery experience is considered production-hardened. Numeric browser budgets should be set from that evidence rather than invented here.

### Scaling path

If a single compact client-side catalogue/search index stops meeting the agreed mobile budgets, escalation order is:

1. reduce/index only necessary fields;
2. split catalogue/search by edition and/or coarse topic where useful;
3. shard/lazy-load indexes;
4. only then evaluate a remote search service.

Changing the search engine or deployment representation must not require changing canonical lesson sources.

## Alternatives considered

### Full-body MiniSearch index

Not selected initially. The original synthetic benchmark does not establish realistic full-text payload/memory performance.

### Pagefind

Functionally capable, but its highly fragmented index created an avoidable deployment-file scaling constraint in the 10k benchmark.

### Hosted/server search service

Not justified for the initial product. It adds operational cost, privacy considerations and provider dependency without a demonstrated need.

## Consequences

- Search is optimised for discovering lessons by idea rather than searching every sentence.
- Search queries remain local to the browser initially.
- Static Library/Topics pages avoid a heavy client dependency; Saved/Read and Surprise Me use the smaller browser catalogue.
- Search remains replaceable.
- Realistic mobile performance becomes a required acceptance gate.
- Full-text search can be added later without changing the lesson schema.

## Follow-up

Validate transfer, parse/load, memory and interaction latency on representative mobile hardware during implementation. If the compact single-index approach fails those budgets, follow the scaling path above.
