# ADR-0002: Static lesson generation with triggered build sharding

Status: Proposed
Date: 2026-10-02
Owner direction: approved for incorporation into the proposed architecture; final architecture approval remains pending.

## Context

Five Minutes targets at least 10,000 lesson identities. Adult and Teen presentations can produce approximately 20,000 lesson pages.

Early work tested full prerendering, hybrid/on-demand rendering and sharded static generation. The hybrid spike bundled the catalogue into a runtime Worker and did not establish acceptable request-time behaviour, so runtime lesson rendering is not justified.

GitHub Actions benchmarks showed increasing memory pressure for a monolithic Astro build: 2,000 pages used ~0.94 GiB, 10,000 pages ~2.93 GiB, and the 20,000-page build exhausted the smaller CI runner's available/default Node heap at ~4.29 GiB RSS. Four 5,000-page static shards completed at ~1.77-1.78 GiB each.

The second independent review then ran the same 20,000-page monolithic build on a 4-vCPU/15-GB machine with Node 22's larger default heap. It completed in about 260 seconds at ~5.9 GiB peak memory. Therefore the earlier failure is evidence of a CI-resource limit, not a hard Astro or static-generation limit.

The shard experiment remains useful evidence that partitioning can reduce per-process memory, but its synthetic site contained only lesson pages. It did not exercise shared assets, site-wide pages or cross-shard related navigation, so it does not prove a production shard-assembly contract.

## Decision

Use ordinary static generation as the initial production build model.

Do **not** require sharding from day one. Introduce build sharding only when measured production builds no longer complete reliably within the chosen CI resources or their build time/resource cost becomes operationally unacceptable.

The application is designed now so sharding can be introduced without changing public URLs, canonical lesson sources or product semantics:

1. A provider-neutral catalogue/URL manifest is generated from validated lesson metadata before rendering.
2. Lesson routes and all generated discovery data use one shared URL-generation module; search/index code must not reconstruct URLs independently.
3. Site-wide outputs such as Today, Library, Topics, sitemap, feeds, 404 and redirect manifests are generated once from the complete catalogue, not independently by future lesson shards.
4. Lesson rendering may read its own lesson body plus the complete compact catalogue/relationship metadata, but must not require loading every lesson body merely to resolve navigation.
5. Build validation compares the expected URL manifest with generated lesson pages exactly, rejects missing/unexpected/duplicate assignments, and checks internal links.
6. If sharding is activated, partition assignment is deterministic and validated. Shared/global assets have one defined producer or deterministic shared build stage rather than relying on copy-time collision behaviour.

The exact trigger is an operational setting based on measured CI capacity and build duration, not a permanent product threshold.

Do not require an application database or runtime lesson renderer initially.

## Alternatives considered

- **Mandatory sharding from day one:** proven capable of reducing per-process memory, but adds coordination/assembly complexity before production needs it and the synthetic assembly benchmark did not model a complete site.
- **Hybrid/on-demand rendering:** reduces physical HTML output but adds runtime/provider complexity and the measured spike bundled the full catalogue into the Worker.
- **Client-rendered lesson bodies:** reduces generated HTML but weakens the simple static publication model, metadata and progressive reading experience.

## Consequences

Published lessons are ordinary static HTML with CDN-friendly behaviour and no lesson-rendering runtime.

The initial build remains simple. Scale pressure is measured rather than anticipated. If sharding becomes necessary, catalogue-first generation, shared URL rules and manifest validation provide the contract needed to partition rendering safely.

The 10,000-identity synthetic artifact is not a realistic deployed-file count: its 20,001 files omitted global pages, assets, PWA files and redirects. Current Cloudflare limits are therefore treated only as operational thresholds. Actual production file count is monitored and hosting/deployment representation is revisited before the active provider limit becomes constraining.
