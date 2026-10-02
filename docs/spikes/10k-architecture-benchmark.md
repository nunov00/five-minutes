# 10k Lesson Architecture Spike

Status: disposable architecture evidence; not production implementation.

## Purpose

Test whether Five Minutes can comfortably support 10,000+ lessons without prematurely introducing a database or unnecessarily complex runtime architecture.

This spike distinguishes:

1. source-file count in Git;
2. deployed lesson-data file count;
3. generated HTML/static-asset file count.

Sharding only addresses (2). It does not reduce (3) if every lesson is still prerendered as its own HTML page.

## Target content model

A lesson has one stable identity with linked Adult and Teen presentations plus shared topic/subtopic/tags/relationships/provenance metadata.

For the sharding test, 10,000 synthetic lessons were grouped into shards of 250 lessons.

## Structural sharding result

- Lessons: 10,000
- Lessons per shard: 250
- Lesson-data shards: 40
- Synthetic corpus JSON size before transport compression: ~61.9 MiB
- Mean uncompressed shard size: ~1.55 MiB

The synthetic corpus intentionally contains substantial Adult and Teen prose. These values are useful for order-of-magnitude storage/file-count analysis only. Synthetic repeated prose compresses unrealistically well, so compressed-size results are deliberately not used as architecture evidence.

Conclusion: data sharding can reduce deployed lesson-data file count from 10,000 individual objects to tens of files without changing the Git authoring model.

## Rendering candidates

### A — Full prerender

Individual source lessons -> Astro content collection -> one generated HTML page per lesson.

Advantages:
- simplest runtime;
- normal HTML/metadata;
- excellent CDN behaviour;
- Pagefind works directly against generated pages.

Risk:
- 10k lesson HTML pages plus assets/search chunks consume a significant part of Cloudflare Pages Free's 20k-file limit.

### B — Client-rendered shards

Individual source lessons -> 40–100 JSON shards -> small static lesson shell -> browser fetches shard and renders lesson.

Advantages:
- very low deployed file count;
- no server rendering.

Costs:
- more client JS/data work;
- SEO/social metadata becomes harder;
- static HTML search no longer falls out naturally;
- reading experience becomes unnecessarily application-like.

### C — Hybrid/on-demand lesson routes + sharded/indexed content

Individual source lessons remain canonical in Git. Small stable routes can be prerendered while lesson routes are rendered on demand from compact content data and cached.

Advantages:
- avoids 10k physical lesson HTML assets;
- retains normal HTML lesson URLs and metadata;
- keeps client JS low;
- provides scale headroom.

Costs:
- introduces runtime requests and Cloudflare Worker/Pages Function concerns;
- search corpus must be generated independently if lesson HTML is not present at build time;
- more operational complexity than A.

## Current platform evidence

As of October 2026:

- Cloudflare Pages Free supports up to 20,000 files per site; paid plans support up to 100,000.
- Pages builds time out after 20 minutes.
- Astro documents its content layer as suitable for tens of thousands of entries.
- Astro explicitly supports delaying rendering for collections with thousands/tens of thousands of pages.
- Pagefind is designed for static sites with tens of thousands of pages and documents a sub-300 kB total network payload for a 10,000-page search index in its example/target case.

Platform limits must be rechecked before implementation because they can change.

## Required reproducible framework benchmark

Do not choose A vs C from estimates alone.

A CI/local benchmark with pinned dependencies must generate 10,000 representative lessons and record:

- Astro version / Node version;
- clean build duration;
- incremental/repeated build duration where meaningful;
- peak memory if available;
- generated file count;
- output size;
- Pagefind indexing duration;
- Pagefind generated file count/size;
- representative query behaviour;
- preview viability.

Run both:

1. full-prerender route generation;
2. hybrid/on-demand lesson route design with equivalent content/indexing.

The benchmark should be reproducible from a script and should not commit 10,000 generated lesson fixtures to Git.

## Decision rule

Prefer **A: full prerender** if the 10k benchmark has comfortable headroom under the target Cloudflare plan and build/runtime experience remains simple.

Prefer **C: hybrid/on-demand** if full prerender approaches platform/build limits or materially harms developer/preview workflow.

Do not prefer B merely to reduce file count; use it only if later evidence identifies a concrete benefit that outweighs its client-side and metadata/search trade-offs.

## Source authoring recommendation independent of A/C

Keep lessons individually addressable in the repository for review/history/AI-worker ergonomics, but allow the build/content layer to compile/index/bundle them as needed. Source representation and deployment representation should not be coupled.


## Benchmark A result — full prerender

Measured in GitHub Actions on 2 October 2026 with Node 22, Astro 5.14.1 and Pagefind 1.4.0:

- synthetic lessons: 10,000;
- Astro build wall time: 1m 33.28s;
- Astro peak resident memory: 2,360,864 kB (~2.25 GiB);
- Pagefind indexing wall time: 20.62s;
- Pagefind peak resident memory: 678,252 kB (~0.65 GiB);
- Pagefind indexed pages: 10,000;
- total dist output: 20,064 files / 48.74 MiB;
- Pagefind output: 10,064 files / 6.77 MiB.

Interpretation:

- Astro full prerender performance is comfortably inside the 20-minute build-time constraint at 10,000 synthetic lessons.
- Build duration is therefore not the limiting factor in this test.
- The generated file count is the material constraint: the complete output is already slightly above the 20,000-file Cloudflare Pages Free limit used for this architecture evaluation.
- Pagefind contributes roughly half the deployed file count, so search representation matters as much as lesson HTML representation.
- This benchmark does not by itself justify client rendering or a database.
- Candidate C must be measured before the rendering architecture is selected.

The benchmark workflow is intentionally reproducible; synthetic lesson fixtures are generated inside CI and are not committed to Git.


## Benchmark C result — hybrid/on-demand + Pagefind

Measured in GitHub Actions on 2 October 2026:

- synthetic lessons: 10,000;
- Astro build wall time: 1m 33.39s;
- Astro peak resident memory: 2,552,440 kB;
- Pagefind custom-record indexing wall time: 22.29s;
- Pagefind peak resident memory: 66,496 kB;
- total dist output: 10,083 files / 90.65 MiB;
- Pagefind output: 10,060 files / 6.04 MiB.

Interpretation: on-demand lesson rendering removed the ~10,000 physical lesson HTML files, but Pagefind remained a roughly one-file-per-lesson deployment constraint.

## Compact search benchmark — hybrid/on-demand + MiniSearch

Measured in GitHub Actions on 2 October 2026:

- synthetic lessons: 10,000;
- Astro hybrid build wall time: 1m 29.26s;
- Astro peak resident memory: 2,475,772 kB;
- MiniSearch benchmark process wall time: 5.32s;
- MiniSearch peak resident memory: 349,560 kB;
- index construction: 2.109s;
- serialized index: 7.06 MiB;
- gzip index: 1.46 MiB;
- index load: 161.9ms on the CI runner;
- representative synthetic queries: 43.5–66.7ms;
- total dist output: 25 files / 93.13 MiB;
- benchmark search output: 2 files.

The dist-size comparison is not a network-transfer comparison: the hybrid adapter/runtime representation contributes substantial uncompressed output, and the benchmark intentionally wrote both raw and gzip search files. The decisive scale result is the deployed-file count, while browser transfer/memory must be validated with realistic content and mobile testing.

## Spike conclusion

The benchmark supports candidate C: hybrid/on-demand lesson rendering. Astro build time was not the scale problem; deployment file count was.

Pagefind works functionally at 10k but its fragmented output becomes a deployment-file constraint. A compact MiniSearch index removes that constraint in the synthetic test and remains service-free and replaceable.

Initial architecture direction:
- individual canonical lesson sources in Git;
- Astro content layer;
- on-demand server-rendered lesson routes with caching;
- compact lazy-loaded client-side search behind an application-owned interface;
- no application database;
- no client-rendered lesson-body architecture.

This spike is evidence, not production code. Realistic mobile search performance remains a quality gate.


## Corrected benchmark and superseding conclusion — 2 October 2026

Independent review found that the earlier A-vs-C conclusion was confounded by Pagefind's file-per-page representation and that the hybrid spike had not established runtime viability. Adult/Teen delivery was also subsequently fixed as separate presentation URLs, making 20,000 presentation pages the representative 10,000-identity target.

Corrected realistic-vocabulary scaling results:

| Lesson identities | Presentation pages | Result | Wall time | Peak RSS |
| ---: | ---: | --- | ---: | ---: |
| 1,000 | 2,000 | pass | 25.27s | ~0.94 GiB |
| 5,000 | 10,000 | pass | 1m45s | ~2.93 GiB |
| 10,000 | 20,000 | Node heap OOM | ~4m22s | ~4.29 GiB |

Compact discovery search was then measured independently at the full target: 20,000 documents / 10,000 identities, 12.49 MiB serialized / 1.86 MiB gzip, ~566ms index construction, ~267ms Node load, and ~34-51ms p95 for representative CI queries.

A sharded static experiment split the target into four independent 2,500-identity / 5,000-page Astro builds. All four passed in ~54-58 seconds at ~1.77-1.78 GiB peak RSS. An end-to-end assembly workflow then merged them with collision detection and validated:

- four input shards;
- 20,000 unique HTML pages;
- no conflicting shard outputs;
- 20,000 discovery-search documents / 10,000 identities;
- one final search artifact;
- 20,001 final files / 145.25 MiB synthetic assembled size.

This supersedes the earlier spike conclusion. The evidence now supports **sharded static generation + compact discovery search** as the initial rendering architecture.

> **Superseded architecture conclusion (2026-10-02):** ADR-0002 now selects ordinary static generation initially. Sharding remains a demonstrated scale-up mechanism activated only when measured build pressure justifies it; this spike is retained as evidence. The earlier hybrid/on-demand implementation is not accepted as the target architecture.
