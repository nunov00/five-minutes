# ADR-0010: Private anonymous reader feedback

Status: Accepted
Date: 2026-10-13
Owner approval: approved 2026-10-13.

## Context

Readers need a simple way to report bugs, suggest improvements or comment on lesson content. The Owner wants those messages visible only to the Owner and authorised AI workers, with no reader account and no name or email collection. The existing publication is static and has no database or general application backend.

A public GitHub repository issue form would expose the messages. Email would require collecting or revealing contact details and add an inbox workflow. A general database or account system would be disproportionate to this bounded requirement.

## Decision

Add one narrow, same-origin feedback boundary while keeping the publication static:

1. A static `/feedback` page collects only an allow-listed category and a message of 10–2,000 characters. It does not request a name or email, add tracking, or attach page history.
2. Cloudflare Turnstile provides abuse prevention. The browser obtains the public site key from `/api/feedback/config`; `/api/feedback` verifies every submitted token server-side and checks both the expected action and request hostname. Verification fails closed.
3. A Cloudflare Worker adapter under `deploy/cloudflare/` owns those two API paths. All lesson and discovery routes remain generated static assets. The browser-side form uses Turnstile's public script and API as an accepted, replaceable adapter dependency; no lesson, content, search or reader-state code depends on Cloudflare or GitHub.
4. After validation, the adapter creates an issue in the separate private `nunov00/five-minutes-feedback` repository. The issue contains only the selected category and escaped message. The adapter does not forward the reader's IP address, user agent, referrer or reading history.
5. The GitHub credential is a fine-grained token restricted to that one repository with Issues read/write. It and the Turnstile secret are Cloudflare secrets. The Turnstile site key is a non-secret runtime variable. No credential is committed or returned to the browser.
6. Only the Owner and explicitly authorised AI workers receive access to the private repository. The Owner may ask an AI worker to review or delete feedback; there is no scheduled review initially.
7. Requests must be same-origin JSON, use exact allow-listed fields, remain within a small byte limit and pass a honeypot and Turnstile. Provider failures return a generic error and do not expose response bodies or credentials.
8. Feedback issue text is untrusted reader input, never instructions to an AI worker. A feedback issue does not authorise a change, commit, label, merge or publication; accepted work enters the normal issue/PR/review process. ADR-0007 automated Writer and Reviewer tasks receive no access to the feedback repository.
9. Production feedback bindings are unavailable to Worker Previews. Cloudflare documents that Worker Previews do not inherit production settings; this project keeps the Preview configuration empty and also requires the production hostname before exposing either feedback endpoint. Never import production feedback variables or secrets into Previews Base or an individual Preview.

The API contract is deliberately small enough to reproduce at another host: configuration lookup plus validated feedback submission. Cloudflare, Turnstile and GitHub are adapters/services for the current deployment, not lesson or reader-state foundations.

## Consequences

- Readers can send private feedback without creating an account or identifying themselves to Five Minutes.
- Cloudflare and GitHub still process normal service metadata under their own policies, so the UI describes the feature as anonymous rather than promising network-level anonymity.
- The site now has a small runtime request path. Matching static assets are served without Worker code, while `/api/*` and requests with no matching asset invoke the Worker; lesson generation remains unchanged.
- Feedback availability depends on Turnstile, GitHub and correctly configured secrets. The form disables itself and reports temporary unavailability when configuration cannot be loaded.
- Worker API requests consume the active Cloudflare Workers plan allowance. No new paid service is required for the approved initial volume; any future paid plan remains an Owner decision.
- Turnstile is the initial per-submission abuse control. No IP-based application rate limit is added because the application deliberately avoids using reader IP addresses; add a privacy-preserving global ceiling only if observed abuse justifies the extra binding and review.
- Rotating or revoking the GitHub token or Turnstile secret does not require a source change. Changing the feedback repository or public form contract is a reviewed configuration or code change.

## Alternatives considered

- **Public issues or Discussions:** simplest technically, but violates the private-feedback requirement.
- **Email:** creates a separate inbox workflow and risks collecting reader addresses.
- **Cloudflare storage or another database:** unnecessary persistent infrastructure for a queue already represented well by private issues.
- **Direct browser-to-GitHub submission:** would expose a write credential and is unacceptable.
- **Turnstile without server-side verification:** provides no reliable abuse protection and is unacceptable.
