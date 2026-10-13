# ADR-0011: Public privacy-preserving aggregate analytics

Status: Accepted
Date: 2026-10-13
Owner approval: approved 2026-10-13 in issue #110.

## Context

The Owner wants the useful real counters from the original `$sites` publication on the portable GitHub/Cloudflare version, with a dashboard that does not require a login. Invented views, placeholder rankings, individual surveillance and a reader account are unacceptable. Cloudflare's account dashboard requires a login and does not provide the approved public product view.

Persistent aggregate counts require a small storage boundary. The publication must otherwise remain static, portable and inexpensive, and analytics failure must never affect reading.

## Decision

1. Publish a static `/analytics` page. It retrieves a versioned aggregate summary from `GET /api/analytics`; no login is required and the data is intentionally public.
2. A small same-origin browser client submits an allow-listed event to `POST /api/analytics/event`. The contract contains only an event name and one bounded dimension: page category, Adult/Teen edition, or an immutable lesson UUID that exists in the build's route-ownership registry. It cannot submit an arbitrary UUID, path, URL, referrer or free text.
3. Page and lesson views are counted at most once per browser per UTC day when local storage is available. The bounded local marker contains only the UTC day and aggregate key; it is never transmitted and is not a visitor identifier. It is owned by a storage abstraction and is removed by the existing local-data reset. Do Not Track and Global Privacy Control signals disable collection. If JavaScript or storage is blocked, reading still works and analytics may undercount.
4. The Cloudflare adapter deliberately ignores request IP, user agent, referrer and other request metadata. It passes only the validated aggregate key to one SQLite-backed Durable Object named `global`.
5. Storage contains daily aggregate rows `(day, event, dimension, count)` and one daily accepted-event counter. The short-lived minute counter exists only in the global object's memory. Storage contains no individual events, timestamps, sessions, visitor IDs, names, emails, raw IPs, user agents, locations or browsing histories.
6. Daily rows are retained for 400 days and older rows are deleted during writes. Public summaries are limited to 7, 30 or 90 days and expose at most 20 lesson/edition results. Version 1 of the dashboard uses 30 days.
7. A global 3,000 accepted-events-per-minute ceiling bounds short loops, while a 10,000 accepted-events-per-UTC-day ceiling keeps normal ingestion well below the Workers Free Durable Object request and SQLite row-write allowances. Requests above either ceiling are rejected without incrementing the aggregate. The minute ceiling resets if the object is evicted, so the stored daily ceiling is the durable cost bound. This deliberately permits bounded analytics use of the shared free allowance while preserving substantial headroom for feedback and other Worker routes. It does not eliminate request-level denial-of-service cost: rejected requests still consume Worker capacity. It is not an authenticity guarantee; public figures are directional and can be undercounted or deliberately inflated.
8. The Durable Object binding and production hostname are Cloudflare adapter configuration. Worker Previews receive neither; their analytics API fails closed while static preview pages remain reviewable. Another host can reimplement the two small API paths against an aggregate store without changing lesson content.
9. The dashboard shows only real observed counts after activation. It does not backfill or fabricate earlier traffic and does not label rankings until observations exist.

## Consequences

- Readers and the Owner can see aggregate activity without an account.
- The site gains a minimal database and product-event runtime, explicitly approved by the Owner. All lesson/discovery rendering remains static.
- No cookie banner is introduced by Five Minutes because it sets no cookie and creates no cross-site or individual profile. Legal requirements must be reassessed if the contract or deployment changes.
- Counts are useful for broad product direction, not billing, security decisions or claims about unique people.
- SQLite-backed Durable Objects are available on the Cloudflare Workers Free plan. As rechecked on 13 October 2026, the free daily allowances are 100,000 Durable Object requests, 5 million SQLite rows read and 100,000 rows written, with 5 GB account storage. Exceeding a free operation limit makes further operations of that type fail until 00:00 UTC. The 10,000-event application ceiling preserves headroom but does not protect the outer Worker route from rejected-request abuse. A paid-plan change still requires Owner approval.
- Removing the feature requires a reviewed deploy that first stops reads/writes and then adds a Wrangler migration with `deleted_classes: ["AnalyticsCounter"]`; that migration deletes the class storage. Removing source or a binding alone does not erase provider storage.

## Alternatives considered

- **Cloudflare Web Analytics only:** useful infrastructure data, but its dashboard requires a Cloudflare login and does not meet the requested public view.
- **Third-party analytics:** adds another processor/service and is unnecessary for the bounded counters.
- **Raw request logs:** retain more personal and high-cardinality data than required.
- **Public event stream:** would expose individual activity and is rejected.
- **Unique visitors via cookies, IP hashes or browser IDs:** gives a more familiar metric but conflicts with the approved privacy boundary.
