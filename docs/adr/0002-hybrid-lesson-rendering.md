# ADR-0002: Hybrid on-demand lesson rendering

Status: Proposed
Date: 2026-10-02

## Context

A reproducible 10,000-lesson Astro full-prerender benchmark completed quickly (~1m33s) but full prerender plus Pagefind produced 20,064 deployed files, already around/above the target free-hosting file constraint. Client-rendering lesson bodies would reduce files but worsens reading HTML, metadata and complexity.

## Decision

Use Astro with a hybrid/on-demand model for lesson routes. Small stable routes may be prerendered. Preserve normal server-rendered lesson HTML and metadata while avoiding one physical deployed HTML file per lesson.

## Alternatives considered

- Full prerender: operationally simplest, but the measured deployment representation lacked comfortable file-count headroom at 10k.
- Client-rendered lesson shards: low file count but unnecessary client/application complexity for a reading product.

## Consequences

A runtime adapter is required for lesson routes. Runtime/provider concerns must remain isolated at the deployment boundary and responses should be cacheable. The architecture avoids a database and avoids turning lesson reading into a client-rendered application.
