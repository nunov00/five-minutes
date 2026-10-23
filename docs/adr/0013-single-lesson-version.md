# ADR-0013 — One lesson version

Status: Owner-approved direction, 22 October 2026. Activation requires the normal mandatory review and checks on the implementation PR.

## Decision

Five Minutes publishes one version of each lesson. The existing Adult source is retained as that version. There is no Teen writing, review or publication requirement, edition choice, edition preference navigation, or second reading page. Clear English for intermediate, non-native readers, explanatory depth, source accuracy, useful figures, optional prediction activities and recall-before-takeaway remain required as applicable. The 23 October 2026 [ADR-0006 answer-first amendment](0006-lesson-schema-and-identity.md#optional-answer-first-opening-23-october-2026) allows an explicitly selected presentation to show its existing takeaway once after its opening lead, with later recall revealing only the answer. The default order and single-version contract remain unchanged.

This decision supersedes audience/edition requirements in ADR-0001, ADR-0003, ADR-0005, ADR-0006, ADR-0007, ADR-0009, ADR-0012 and earlier implementation/automation documents. Historical edition descriptions and calibration evidence are references only; they cannot require new Teen work. The general safety, trust, review, privacy, date, history, revision-budget and publication rules are unchanged.

## Content and compatibility

- `lesson.yaml` and `adult.md` are the two active source files. The legacy filename avoids a bulk rewrite. `schemaVersion: 2` metadata and immutable IDs remain stable; the publication eligibility rule now requires only this one source. Existing `teen.md` files are inert archive material, accepted only as regular files in canonical directories and never parsed or rendered. New scheduled candidates must not add or modify them.
- The existing `/adult/<slug>` address remains the sole canonical reading URL. Its path is a compatibility detail, not an audience label. Every known `/teen/<slug>` and Teen historical alias redirects directly to the current canonical lesson. Adult historical aliases keep redirecting to it. Route ownership remains append-only.
- `/library`, `/library/page/<n>`, `/topics` and `/topics/<topic>` render the actual discovery pages without an edition chooser. Both former `/editions/<edition>/...` families redirect to these neutral addresses. Static fallback pages offer a normal link and automatic refresh; the Cloudflare adapter supplies HTTP 301 rules. Only canonical pages enter the sitemap.
- Home, Earlier, Related, Surprise Me and Search all use the same lesson. There is one search index. Legacy `teen` fields in catalogue/types alias the sole presentation for compatibility; they never contain Teen content or cause additional index assets/pages.
- Reader-state v1/v2 imports/exports remain supported, including unknown extension fields. There is no destructive storage migration. Saved and Recent display a single entry per immutable ID linked to the current lesson; Read remains by ID. Saving/unsaving acts on identity across old edition keys. Legacy preference fields are ignored by navigation. Invalid/unknown state stays untouched until explicit reset.
- Existing aggregate analytics storage keeps its historical dimensions. Reader-facing totals combine both legacy edition keys; new events use the retained `adult` compatibility key. No extra personal data is collected.
- The existing bounded optional activity schema is allowed on the sole presentation. The current corpus has 23 activities in retired Teen sources and none in the retained Adult sources, so activating this structural change temporarily removes all 23 from reader-visible pages. Their original sources remain intact. Following independent review, the Owner selected preservation through a separate editorially reviewed content PR; [task #186](https://github.com/nunov00/five-minutes/issues/186) holds the complete inventory and acceptance criteria. The follow-up must check framing, source support, distractors and separation from the retained recall question rather than copy blindly. No activity is declared retired or silently dropped. No existing lesson prose, facts, figures or answers are rewritten in this structural PR.

## Publication

The Writer authors/revises only `lesson.yaml` and `adult.md`, plus the existing bounded images, queue completion/shortlist and append-only registry delta where applicable. The guard and its read-only API adapter enforce that exact two-file source scope; all other safeguards remain. The Reviewer checks one complete lesson and its exact canonical rendered page at phone/wide widths. Completion and lightweight quiet-exit checks require that one live canonical page, rather than both former editions. They retain exact-head checks, independent delegated Reviewer execution, reconciliation, fail-closed behaviour and the off switch.

All fixed task entry prompts must load the current single-version contract after deployment. Existing task schedules and enabled/paused states are preserved. Activation does not create or resume an automation.

## Verification and rollback

Verify the real source corpus, one route per ID, old links, static redirect targets, sitemap completeness, single lazy search index, saved/recent compatibility, export/import, no-JavaScript reading/discovery and Chromium/mobile WebKit journeys. Preserve hostile-input, immutable-route, history, byte/mode/image and trust-boundary tests while adapting edition-specific expectations. Normal CI and the qualifying independent review are required before merge. Reverting this PR restores the former publication/UI contract without recovering deleted content or reader data, because neither is deleted.
