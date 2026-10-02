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
