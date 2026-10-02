# ADR-0002: Sharded static lesson generation

Status: Proposed
Date: 2026-10-02

## Context

Five Minutes targets at least 10,000 lesson identities. Adult and Teen presentations can produce approximately 20,000 lesson pages.

Early evidence favoured hybrid/on-demand rendering because full prerender combined with Pagefind approached deployment-file limits. Later review exposed two confounders: Pagefind itself created roughly one file per indexed page, and the hybrid spike bundled the catalogue into the runtime worker without proving acceptable request-time behaviour.

Corrected benchmarks therefore tested full static generation with compact discovery search and realistic-vocabulary synthetic content.

A monolithic Astro content build scales poorly in memory: 2,000 pages used ~0.94 GiB, 10,000 pages ~2.93 GiB, and 20,000 pages exceeded the normal Node heap at ~4.29 GiB RSS. The problem is build-time catalogue size, not static delivery.

Four independent shards of 2,500 lesson identities / 5,000 pages each all succeeded at ~1.77-1.78 GiB peak RSS and ~54-58 seconds. A subsequent assembly test merged the four outputs with collision detection and validated 20,000 unique HTML pages plus one compact search artifact.

## Decision

Use static lesson pages generated in bounded build shards and assembled into one deployable static artifact.

Sharding is a build/deployment implementation detail. Public URLs, lesson identity and authoring structure do not expose shard boundaries.

Generate the discovery catalogue/search index independently from the lesson-page shards. Keep search behind an application-owned interface.

Do not require an application database or runtime lesson renderer initially.

## Alternatives considered

- Monolithic full prerender: simplest conceptually, but the representative 20,000-page Astro content build exceeded the normal Node heap.
- Hybrid/on-demand rendering: avoids physical lesson HTML files, but adds runtime/provider complexity and the measured spike bundled the full catalogue into the worker without demonstrating acceptable runtime behaviour.
- Client-rendered lesson bodies: reduces generated HTML but unnecessarily weakens the simple publication model, metadata and progressive reading experience.

## Consequences

Published lessons can be served as ordinary static HTML with CDN-friendly behaviour and no lesson-rendering runtime.

The build pipeline must partition source content deterministically, build shards independently, detect output collisions, assemble the artifacts and validate completeness.

Shard size is operational configuration, not a product contract. It can be adjusted as corpus size and CI resources change.

Provider-specific deployment remains outside core content/application logic.

At the 10,000-identity benchmark target, the assembled synthetic artifact contained 20,000 HTML pages plus the compact search artifact. Current hosting limits must be verified separately before production deployment.
