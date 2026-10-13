# ADR-0011: Public privacy-preserving aggregate analytics

Status: Accepted
Date: 2026-10-13
Owner approval: approved 2026-10-13 in issue #110.

## Context

The Owner wants the useful real counters from the original `$sites` publication on the portable GitHub/Cloudflare version, with a dashboard that does not require a login. Invented views, placeholder rankings, individual surveillance and a reader account are unacceptable. Cloudflare's account dashboard requires a login and does not provide the approved public product view.

Persistent aggregate counts require a small storage boundary. The publication must otherwise remain static, portable and inexpensive, and analytics failure must never affect reading.

## Decision

1. Publish a static `/analytics` page. It retrieves a versioned aggregate summary from `GET /api/analytics`; no login is required and the data is intentionally public.
2. A small same-origin browser client submits an allow-listed event to `POST /api/analytics/event`. The contract contains only an event name and one bounded dimension: page category, Adult/Teen edition, or immutable lesson UUID. It cannot submit an arbitrary path, URL, referrer or free text.
3. Page and lesson views are counted at most once per browser per UTC day when local storage is available. The bounded local marker contains only the UTC day and aggregate key; it is never transmitted and is not a visitor identifier. Do Not Track and Global Privacy Control signals disable collection. If JavaScript or storage is blocked, reading still works and analytics may undercount.
4. The Cloudflare adapter deliberately ignores request IP, user agent, referrer and other request metadata. It passes only the validated aggregate key to one SQLite-backed Durable Object named `global`.
5. Storage contains daily aggregate rows `(day, event, dimension, count)` and a short-lived global minute counter. It contains no individual events, timestamps, sessions, visitor IDs, names, emails, raw IPs, user agents, locations or browsing histories.
6. Daily rows are retained for 400 days and older rows are deleted during writes. Public summaries are limited to 7, 30 or 90 days and expose at most 20 lesson/edition results. Version 1 of the dashboard uses 30 days.
7. A global 3,000 accepted-events-per-minute ceiling bounds accidental loops and aggregate writes without introducing IP-based rate limiting. Requests above the ceiling are read and rejected without incrementing either counter. It does not eliminate request-level denial-of-service cost and is not an authenticity guarantee: public figures are directional and can be undercounted or deliberately inflated.
8. The Durable Object binding and production hostname are Cloudflare adapter configuration. Worker Previews receive neither; their analytics API fails closed while static preview pages remain reviewable. Another host can reimplement the two small API paths against an aggregate store without changing lesson content.
9. The dashboard shows only real observed counts after activation. It does not backfill or fabricate earlier traffic and does not label rankings until observations exist.

## Consequences

- Readers and the Owner can see aggregate activity without an account.
- The site gains a minimal database and product-event runtime, explicitly approved by the Owner. All lesson/discovery rendering remains static.
- No cookie banner is introduced by Five Minutes because it sets no cookie and creates no cross-site or individual profile. Legal requirements must be reassessed if the contract or deployment changes.
- Counts are useful for broad product direction, not billing, security decisions or claims about unique people.
- SQLite-backed Durable Objects are available on the Cloudflare Workers Free plan, but Worker requests, rows written and storage consume the applicable allowance. A paid-plan change still requires Owner approval.
- Removing the feature requires removing the client/API/config and explicitly deleting the Durable Object storage/namespace; deleting source code alone does not erase provider storage.

## Alternatives considered

- **Cloudflare Web Analytics only:** useful infrastructure data, but its dashboard requires a Cloudflare login and does not meet the requested public view.
- **Third-party analytics:** adds another processor/service and is unnecessary for the bounded counters.
- **Raw request logs:** retain more personal and high-cardinality data than required.
- **Public event stream:** would expose individual activity and is rejected.
- **Unique visitors via cookies, IP hashes or browser IDs:** gives a more familiar metric but conflicts with the approved privacy boundary.
