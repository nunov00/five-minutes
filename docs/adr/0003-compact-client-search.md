# ADR-0003: Compact replaceable client-side search

Status: Accepted for initial implementation
Date: 2026-10-02

## Context

Pagefind indexed 10,000 synthetic pages successfully, but produced roughly 10,000 search files in both prerender and hybrid tests. This made search itself a deployment-file scaling constraint.

A MiniSearch spike over the same 10,000-lesson corpus produced a ~7.06 MiB serialized index (~1.46 MiB gzip), built the index in ~2.1s, loaded it in ~162ms on the CI runner, and returned representative synthetic queries in ~44-67ms. The complete hybrid spike had only 25 deployed files.

## Decision

Use a compact generated MiniSearch index for the initial implementation, loaded lazily when search/discovery needs it. Access it through an application-owned search interface.

## Constraints

Validate memory, load time and query responsiveness on representative mobile hardware and realistic lesson content. Do not eagerly load the search index on the Today/lesson reading path.

## Consequences

The initial search implementation is extremely low in deployed file count and requires no search service. If future catalogue size makes client-side search unsuitable, another implementation can replace MiniSearch behind the same interface.
