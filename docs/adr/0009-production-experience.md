# ADR-0009: Production experience after the joint design prototype

Status: Accepted
Date: 2026-10-04
Owner approval: design direction accepted after device review of the joint prototype; production adoption remains subject to independently reviewed implementation.

## Context

M1-M5 established the production architecture and Discovery. A deliberately isolated joint design prototype then explored how the publication should feel once those capabilities are presented as one coherent product.

The prototype was not production architecture and must not be merged wholesale. It used real canonical content plus clearly identified fixtures and intentionally left production routes, canonical schema and reader-state contracts unchanged. Its purpose was to settle presentation and interaction direction before M6 made local reader state visible throughout the interface.

Owner device review found both editions comfortable to read, the collapsed Teen activity noticeable/useful, and the seasons figure worthwhile. The final prototype head also passed independent different-provider review with no BLOCKER, IMPORTANT or MINOR findings. This ADR records the production direction selected from that work while preserving the accepted M1-M5 contracts.

## Decision

### One publication, two visual voices

Five Minutes remains one publication with one immutable lesson identity and mandatory Adult and Teen presentations.

Adult and Teen keep the explicit public routes from ADR-0005:

- `/adult/<slug>`
- `/teen/<slug>`

The URL is authoritative for the edition of a lesson page. A stored edition preference never rewrites, redirects or hides an explicitly shared lesson URL.

The application uses shared publication chrome/navigation, but Adult and Teen may have materially different presentation tokens, typography, density and activity treatment. The distinction is presentation, not separate products or separate lesson identities.

### Edition preference and first visit

M6 owns a versioned local edition preference behind the reader-state storage abstraction.

- With no stored preference, the publication default is Adult.
- Choosing an edition from publication-level navigation stores that preference and uses it for subsequent neutral entry points such as Today, Library, Topics, Search, Saved and Surprise Me.
- Following an explicit Adult or Teen lesson URL displays that requested edition without silently changing the stored preference.
- The lesson-level alternate-edition bridge opens the corresponding presentation of the same immutable lesson without changing the stored preference merely because the reader inspected it.
- A deliberate publication-level edition choice is the action that changes preference.

These rules keep shared links deterministic while allowing the surrounding publication to remember a reader's normal voice.

### Navigation and history

Edition changes and Return/Back controls must respect ordinary browser history rather than manufacturing surprising navigation.

A same-lesson edition bridge navigates to the other canonical presentation URL. Returning from it should preserve the reader's meaningful lesson/discovery location and must not create preference side effects.

Implementation must test browser Back/forward restoration, including Safari/WebKit behaviour. The prototype's Chromium protections are evidence, not a substitute for the production real-browser gate.

### Reading flow

The production lesson experience adopts a recall-first ending: prompt the reader to retrieve/consider the idea before presenting the final takeaway/explanation.

The existing progressively enhanced contract remains: the lesson body, takeaway/reveal and essential navigation must remain usable without JavaScript. Enhancements must not make comprehension depend on client state.

### Reviewed figures

A lesson may include an optional explanatory figure when it materially improves understanding. Figures are editorial content, not arbitrary executable embeds.

Production adoption must define a safe structured figure contract within the canonical content model before figures are published. At minimum it must support accessible alternative text/captioning, deterministic placement and validation of locally controlled assets/data. Raw HTML, arbitrary scripts and remote executable embeds remain outside the safe Markdown contract.

Figures should appear early enough to support the explanation they clarify; responsive layouts may place them beside text on larger screens and in reading order on narrow screens.

### Optional Teen activities

Teen presentations may include an optional lightweight prediction/choice activity such as the accepted “What do you think?” pattern.

Activities are supplementary and lesson-specific, not mandatory gamification. They must:

- remain understandable and revealable without JavaScript;
- be keyboard accessible;
- avoid persistent answer state unless a later product decision explicitly requires it;
- reset ephemeral form/reveal state so browser restoration does not present stale answers as current;
- use structured validated content rather than executable lesson markup.

The content/schema extension for activities is a production implementation decision within these boundaries and requires its normal review.

### Discovery and local reader state

M5 Discovery remains the foundation: controlled taxonomy, static Library/Topics, compact catalogue, edition-specific lazy search, deterministic Related and Surprise Me remain accepted.

M6 adds local Saved, Read and edition preference through the existing storage abstraction. Production UI work should integrate these states into the accepted shared publication shell rather than first building them against an interface scheduled for replacement.

Library/archive surfaces remain bounded/paginated; no screen should require loading or rendering the whole catalogue. Search remains lazy and edition-specific.

### Prototype boundary

The `/design-preview` implementation is reference material only. It is not merged wholesale and does not become a production dependency.

Production work must be implemented against the current main architecture in focused PRs. Reuse of ideas or small code patterns is allowed only after assessing their effect on production bundling, progressive enhancement, accessibility, routes and tests.

Ratings, reader feedback, monetisation and optional AI “Tell me more” experiences remain separate future modules/decisions.

## Delivery sequence

Post-M5 production work is delivered in four stages:

1. **Production experience foundation** — shared navigation/shell, Adult and Teen presentation systems, global edition selection/preference contract, route/history behaviour and bounded discovery integration while preserving existing URLs.
2. **Reading enhancements** — recall-first ending plus the safe structured contracts and rendering for reviewed figures and optional Teen activities.
3. **Local reader state** — versioned Saved/Read/preferences, migration and export/import, integrated into the production experience; no account/backend.
4. **Integration and release hardening** — full CI/Playwright, different-provider exact-head review, Cloudflare preview, accessibility and real-device/browser verification before production adoption.

M7 automated publication and M8 production readiness remain subsequent roadmap milestones. Content automation must understand any new figure/activity schema before generating those fields.

## Verification gates carried from the prototype

The production implementation must not claim the prototype verified what it did not. Before production adoption, verify as applicable:

- real Safari/WebKit Back/forward-cache and form-restoration behaviour;
- installed-app cold launch and navigation;
- screen-reader semantics and focus order;
- narrow mobile layouts and enlarged text;
- final production fonts/tokens;
- realistic catalogue/search performance and asset/file capacity;
- no-JavaScript essential reading and reveal behaviour.

## Consequences

- M1-M5 architecture remains valid; this ADR extends presentation/state delivery rather than replacing the system.
- Existing lesson URLs and immutable identity are preserved.
- Shared links remain deterministic and do not mutate preference.
- M6 state work is sequenced with the production redesign to avoid implementing the same UI twice.
- Figures and activities become controlled optional content capabilities rather than prototype-only markup.
- The prototype branch can remain unmerged as design evidence.
