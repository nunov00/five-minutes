# ADR-0009: Production experience after the joint design prototype

Status: Proposed — Owner decisions required before implementation
Date: 2026-10-04
Owner-approved evidence: the joint prototype's readability/activity/figure direction was accepted during device review. This did **not** approve new production routing, first-visit/default-edition semantics, content-schema changes or Teen-only publication policy.

## Context

M1-M5 established the production architecture and Discovery. A deliberately isolated joint design prototype then explored how those capabilities could feel as one coherent publication.

The prototype is design evidence, not production architecture and not a branch to merge wholesale. Owner device feedback established three useful product signals: both visual voices were comfortable to read, the collapsed prediction interaction was noticeable/useful, and the seasons figure earned its place. Claude/Anthropic independently reviewed prototype head `9ef92941bd9db3e81f761a1215b73c57e144b12a` and reported 0 BLOCKER / 0 IMPORTANT / 0 MINOR for the bounded prototype implementation. That review did not approve production contracts and explicitly left real Safari/bfcache, screen-reader behaviour, final fonts and production-scale performance unverified.

This ADR therefore separates **selected design direction** from **production contracts still requiring an Owner decision**. It must not be marked Accepted until the open decisions below are resolved and independently reviewed.

## Direction already selected

### One publication, two visual voices

Five Minutes remains one publication with one immutable lesson identity and mandatory Adult and Teen presentations under ADR-0006.

Adult and Teen retain the explicit canonical lesson routes from ADR-0005:

- `/adult/<slug>`
- `/teen/<slug>`

An explicit lesson URL remains authoritative for the presentation being requested. Shared publication chrome may give Adult and Teen materially different typography, density and activity treatment without turning them into separate products or identities.

The editorial rule remains unchanged while this ADR is Proposed: neither Adult nor Teen is the editorially “complete” or intrinsically default edition.

### Recall-before-summary direction

The selected lesson ending asks the reader to retrieve or consider the central idea **after the explanatory body and before the final takeaway/answer**. This is the intended meaning of “recall-first”; it does not move a quiz ahead of the lesson body.

Essential reading, the prompt, takeaway/reveal and navigation must remain understandable without JavaScript.

### Figures and lightweight activities are worth supporting

The prototype established that a reviewed explanatory figure can materially improve a lesson and that a lightweight prediction/choice can be useful. It did **not** approve their production schema or a Teen-only publication rule.

Before either capability ships, ADR-0006 must be amended (or superseded by a content-contract ADR) and the canonical schema version must change. That decision must define ownership (shared lesson vs presentation-specific), validation, accessibility, asset/security policy and editorial review. SVG must not be accepted merely because it is an image format: active content, external references and other SVG attack surfaces require an explicit safe policy or SVG must be excluded.

Activities remain supplementary, progressively enhanced and non-persistent unless a later product decision says otherwise. Whether an activity may exist only in Teen, only in one presentation generally, or must have a paired equivalent is an **open Owner/content-contract decision**.

## Open production contracts — Owner decision required

Implementation of the production experience foundation must not start until these contracts are decided.

### D1 — Neutral entry points and first visit

Today (`/`), Library, Topics and Search currently have neutral URLs. We need one deterministic rule for how a stored edition preference affects their content/links while preserving static delivery and no-JavaScript usefulness.

The decision must explicitly define:

- first visit when no preference exists — preserve the current edition choice, choose a publication default, or another specified behaviour;
- whether neutral pages render neutral content with edition-aware links, render one edition and enhance after load, or use another static representation;
- no-JavaScript behaviour;
- whether client enhancement may ever cause a visible wrong-edition flash;
- PWA `start_url` behaviour;
- effects on generated routes/file count.

Until D1 is approved, **Adult is not declared the default** and current production semantics remain authoritative.

### D2 — Preference-writing actions

Define an explicit action matrix. At minimum it must distinguish:

- publication-level Adult/Teen selection in shared navigation;
- a header edition action while on a lesson;
- the end-of-lesson same-identity alternate-presentation bridge;
- an optional “use this edition normally” action while viewing an explicit/shared link;
- navigation from an explicit Teen/Adult lesson to Today, Library, Topics, Search, Saved and Surprise Me.

For every action the contract must say whether it writes preference and which edition neutral destinations use. Merely viewing or following an explicit/shared lesson URL must not silently write preference unless the Owner explicitly chooses otherwise.

### D3 — History, Return and restoration

Define testable navigation semantics before implementation:

- which edition-changing actions use normal push navigation and whether any ever replace history;
- what “Return” means (browser history, remembered discovery origin, Today fallback or another defined rule);
- fallback when there is no useful same-origin history, including installed-app cold launch;
- what a Back-restored neutral page does if edition preference changed after it was first visited;
- expected form/reveal state after Back/forward-cache restoration.

Safari/WebKit and Chromium tests must assert these chosen outcomes; “respect browser history” alone is not an acceptance criterion.

### D4 — Figure/activity canonical contract

Resolve the ADR-0006/schema questions described above before production content uses figures or activities. This includes editorial verification of factual labels/captions as well as technical validation. The prototype's corrected implementation does not substitute for content-level review.

## Discovery and catalogue semantics

M5 remains authoritative. Static Library/Topics, compact catalogue, edition-specific lazy search, deterministic Related and Surprise Me are preserved.

“Bounded” refers to **rendered/page presentation and payload purpose**, not a prohibition on loading the compact catalogue. ADR-0003 intentionally allows consumers such as Saved and Surprise Me to load the compact catalogue. Search indexes remain lazy and edition-specific.

## Delivery sequence

The sequence is aligned with the existing milestones rather than creating a competing four-stage programme:

1. **Post-M5 architecture gate (this ADR)** — resolve D1-D4, amend ADR-0006/schema design as required, reconcile docs, obtain Owner approval and different-provider review.
2. **Production experience foundation** — shared shell/navigation and Adult/Teen presentation systems, implementing the approved D1-D3 contracts. If edition preference is introduced here, it must use the **final M6 versioned storage abstraction/format from its first production write**; do not create a temporary preference store.
3. **M6 local reader state + reading enhancements** — Saved/Read/preferences, migration/export/import and approved recall/figure/activity capabilities. This may be split into focused PRs, but schema changes precede content/rendering that depends on them.
4. **M6 integration gate** — verify the complete production experience and reader state as one system. M7 then remains Automated publication.
5. **M8 production hardening** — remains the roadmap's production-readiness milestone. M6 verification must cover changed journeys but must not claim to replace M8's broader accessibility/security/performance/analytics/recovery gate.

M7 generation/review must understand any new canonical schema fields before automated workers may author them.

## Prototype boundary and verification

The `/design-preview` branch remains reference material only. Reusing an idea or small pattern requires production assessment; no prototype bundling, fixture, route or test result becomes a production dependency by implication.

Production adoption must verify the relevant accepted contracts, including:

- real Safari/WebKit Back/forward-cache and form-restoration behaviour;
- installed-app cold launch/navigation and PWA start semantics;
- screen-reader semantics, focus order, keyboard behaviour and enlarged-text layouts;
- narrow mobile layouts and final production fonts/tokens;
- no-JavaScript essential reading/reveal/navigation;
- realistic catalogue/search performance and Cloudflare file/asset capacity;
- safe-content/security-policy validation for any new figure/activity representation;
- editorial/factual review of figures, captions, activity prompts and answers;
- existing URL/static/redirect integrity and progressive-enhancement gates.

## Consequences

- M1-M5 remain authoritative while this ADR is Proposed.
- The selected visual/readability direction can guide design work, but unresolved product contracts cannot be inferred from the prototype.
- Existing explicit Adult/Teen lesson URLs and immutable identity are preserved.
- M6 storage is designed once before the first production preference write.
- Figures/activities cannot bypass ADR-0006 or schema versioning.
- M8 remains the final production-hardening milestone rather than being duplicated here.
