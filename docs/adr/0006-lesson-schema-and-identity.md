# ADR-0006: Lesson source schema and identity contract


18 October 2026 editorial renewal amendment: ADR-0012 and the shared backlog-first contract in docs/automation/publication-task-contracts.md supersede earlier new-only/import-exclusion/correction-exclusion wording for selected daily backlog candidates. Reader date labels and Today/Earlier eligibility apply globally as ADR-0012 defines. Existing review, source, off-switch, exact-head, same-day and guarded-merge safeguards remain. Direction is Owner-approved; activation waits for the implementation PR's mandatory different-provider review and checks.

Status: Accepted
Date: 2026-10-02
Owner approval: approved 2026-10-02.
Amended: 2026-10-03 — presentation heading contract (Owner-approved during M4.1, PR #39; recorded at the M4 gate, #45).
Amended: 2026-10-04 — Owner-approved optional per-edition figures and Teen-only activities (ADR-0009 / #63). Schema version advances from 1 to 2 when these fields are implemented.
Amended: 2026-10-16 — Owner-approved optional manual archive metadata and truthful adaptation dates (#138).

## Context

Lesson content is the central contract between research/generation, validation, rendering, search, taxonomy, related content, local reader state and publication.

The contract must support one stable lesson identity with distinct Adult and Teen presentations, provenance, lifecycle state, mutable human-readable URLs, and safe AI-authored content. It must remain easy to review in Git and must not require a database.

A slug cannot be the durable identity because titles and URLs may change while Saved/Read state must remain stable.

## Decision

Represent each lesson as a small directory containing structured metadata plus plain Markdown presentation files.

Example:

```text
src/content/lessons/
  2026/
    why-gps-needs-einstein/
      lesson.yaml
      adult.md
      teen.md
```

The directory name is an organisational convenience and is not authoritative identity or routing data; it need not equal the current slug. The lesson ID may not change.

### Identity

Every lesson has:

- `id`: immutable UUID;
- `slug`: current human-readable slug;
- `aliases`: zero or more previous slugs, used to preserve old links when a slug changes.

Active slugs and aliases share one global namespace: validation rejects any value reused by another active slug or alias, and a retired alias is never reassigned to a different lesson.

Reader state and internal relationships use `id`, never slug or URL.

### Shared metadata

`lesson.yaml` contains shared facts and editorial metadata rather than article prose.

Proposed shape:

```yaml
schemaVersion: 2
id: "018f..."
slug: "why-gps-needs-einstein"
aliases: []

publishedAt: "2026-10-03T00:00:00Z"

topic: science
subtopic: physics
concepts:
  - gps
  - relativity
  - time-dilation

related:
  manual:
    - id: "..."
      reason: "..."
  exclude: []

sources:
  - title: "..."
    url: "https://..."
    publisher: "..."
    accessedAt: "2026-10-02"
    note: "Primary support for ..."

provenance:
  createdAt: "2026-10-02T00:00:00Z"
  createdBy:
    type: ai
    provider: "..."
    model: "..."
    promptVersion: "..."
  reviews: []
```

Exact UUID representation and provenance subfields may be tightened by the validation schema, but their semantics are fixed by this ADR.

### Presentation files

Draft generation may temporarily produce one presentation before the other. Publication requires both `adult.md` and `teen.md`, and both must pass their applicable validation/review gates.

Each presentation has a small validated front matter block plus plain Markdown body:

```markdown
---
title: "Why GPS Depends on Relativity"
description: "..."
takeaway: "..."
question: "..."
answer: "..."
searchTerms:
  - satellite clocks
---

Article body in plain Markdown...
```

Audience-specific titles, descriptions, examples, body, takeaway and retrieval question/answer may differ substantially. Shared facts such as identity, publication date, taxonomy, relationships and research provenance do not get duplicated into presentation files.

### Optional presentation media and activities

Schema version 2 adds optional presentation-owned explanatory figures. Existing schemaVersion 1 lessons remain valid source during the M6.2 transition: the migration is deterministic and content-preserving—update each canonical lesson to schemaVersion 2 without inventing figure/activity fields, then validate the complete corpus as v2 before any v2-only content is merged. Once that corpus migration lands, production validation rejects schemaVersion 1; mixed published schema versions are not a steady state.

Adult and Teen may have different figures and captions, or neither may have one. Lesson content never supplies SVG, HTML or executable drawing code. A diagram is an application-owned renderer selected from a closed type vocabulary and fed only validated structured data from the presentation. Raster figure assets are repository-local PNG or WebP only. Every figure requires non-empty alternative text and a caption; validation enforces configured image dimensions and per-asset byte-size limits. Aggregate deployment file-count/capacity remains a deployment-adapter/artifact gate under OPERATIONS.md, not canonical content validation.

Teen presentations may additionally contain an optional structured activity. Activities are Teen-only, supplementary and non-persistent. Their prompt, choices, correct/recommended answer and explanation are validated data rendered by application components. Adult presentations must not contain the activity field. Essential lesson comprehension and the answer/reveal remain available without JavaScript.

Raw SVG, raw HTML, remote image URLs, scriptable embeds and arbitrary component names are rejected as canonical lesson content. The application, not the lesson, owns diagram rendering code and its security boundary.

The concrete implementation contract is documented in [reading enhancements](../implementation/m6.2-reading-enhancements.md) and the [reusable toolkit](../implementation/figure-toolkit.md): `figure.type` is a closed union (`seasons-orbit`, `process-flow`, `cycle-flow`, `comparison-bars`, `concept-flow`, `orbital-motion` or `image`). The 17 October 2026 Owner-approved toolkit direction extends schema v2 additively: illustrated semantic sequences/cycles/binary branches, genuinely proportional bars, an orbital free-fall scene and bounded static-image fallback. Existing content remains valid. Reusable types select app-owned styles/patterns; positioning remains a validated prose-paragraph index. The trusted-base guard may accept zero to two newly added, referenced PNG/WebP files belonging only to the candidate slug, subject to the existing image limits and rendered review. No new layout commands, arbitrary SVG/HTML or executable content are authorised. Final implementation still requires the normal mandatory review gate.

#### Presentation heading contract

The front-matter `title` of each presentation is the reading page's only level-1 heading (`<h1>`). The Markdown body therefore starts at level 2: it may use `##` and `###` headings and must not define a level-1 (`#`) heading. The content pipeline enforces this when it parses a presentation file and fails the build on a `#` heading in a body; rendered, sanitized body HTML is used unchanged, with no heading rewriting after sanitization.

### Markdown and structured-data safety

Lesson bodies use Markdown, not MDX. AI-authored lesson content must not execute code during the site build.

Raw HTML in lesson Markdown is disabled. Rendered lesson HTML is sanitized as defence in depth. Markdown remote images are forbidden initially; lesson imagery, when introduced, must use validated local/approved assets rather than arbitrary third-party URLs. Links are validated for safe schemes, and external links receive appropriate `rel` attributes. Lesson fields inserted into JSON-LD or other structured output are serialized/escaped rather than concatenated as executable markup.

YAML is parsed in a safe mode with custom/object-construction tags disabled. The application owns a Content Security Policy; deployment adapters apply it as response headers where supported, with standards-compatible document controls used where appropriate. Provider-specific header syntax is not part of the lesson/domain contract.

### Publication field

#### Legacy archive imports (Owner-approved direction, 2026-10-16; issue #138)

Schema version 2 accepts an optional additive `archive` mapping with exactly `sourceUrl` (an absolute HTTP(S) URL without credentials) and `catalogueDate` (a valid YYYY-MM-DD date no later than publication's Zurich date). This records the old site's catalogue label, not an independently verified first-publication date or invented original creation time. Existing lessons need no migration.

For imported/adapted bundles, `provenance.createdAt` is the actual creation time of the new adaptation; `publishedAt` is its intended publication on this site and must still be at or after creation. The original date is never copied into either timestamp. Under ADR-0012 the reading page shows the recorded original-Site day without archive labels, plus optional latest revisedAt. Recovered unpublished GitHub PR drafts show actual publishedAt instead of their draft date. Library/search order by that same displayed day while retaining actual publishedAt and the separate internal import eligibility marker in generated metadata. Original lessons and their dates/identities are unchanged.

Imports may use the Manager-led path or ADR-0012's selected daily backlog path. The daily guard accepts archive only for that selected transfer or as preserved original provenance on a selected existing revision. Optional revisedAt is an additive RFC3339 timestamp at or after publishedAt; daily candidate revision rounds keep it immutable. No schema version bump is required for these optional additive fields; missing revisedAt retains historical import eligibility until substantive revision. Removal or a changed interpretation of existing required fields still needs a versioned migration.

Canonical lesson files do not persist a `reviewed` workflow state. Draft/review status belongs to the branch/PR and required checks.

A lesson PR sets `publishedAt` to its intended publication time before independent review. Content on `main` is authoritative published content; publication automation may merge only at or after `publishedAt`. CI rejects canonical production content missing a valid publication timestamp or violating publication policy.

### Redirects and aliases

Aliases are provider-neutral source metadata. The build produces a redirect manifest from them. A deployment adapter may compile that manifest to native host redirects when suitable; the portable fallback is generated static redirect pages. Redirect outputs count toward hosting limits and are included in deployment-file monitoring.

### Taxonomy

`topic`, `subtopic` and `concepts` are references to controlled values rather than arbitrary display strings. The exact taxonomy is intentionally separate and may evolve without changing the lesson identity contract.

### Relationships

Internal lesson relationships use immutable IDs.

The schema supports explicit editorial relationship overrides while allowing build-time related-content generation from taxonomy/concepts. It does not require every related relationship to be stored manually.

### Provenance

Sources are first-class lesson metadata and remain reviewable in Git. Generation metadata records how the draft was created without making any AI provider part of the rendering/content contract.

Review history may record automated and human/AI review events. ADR-0007 defines the publication review policy; routine publication may be authorized by an independent AI reviewer after required validation.

### Validation

CI/build validation must reject at least:

- missing/invalid immutable ID;
- duplicate IDs;
- any collision or reuse across active slugs and aliases;
- malformed or unsafe URLs;
- unknown taxonomy references;
- relationships to nonexistent IDs;
- a published lesson missing either Adult or Teen presentation;
- invalid presentation metadata;
- schema-version mismatch or invalid figure/activity structured data;
- Adult activity fields, non-local/unsupported figure assets, SVG/HTML/executable figure content, missing figure alt text/caption, or configured per-asset type/dimension/byte-size violations;
- unsafe Markdown constructs;
- a level-1 heading in a presentation body;
- published content that violates the publication policy.

A schema version is mandatory so future changes can be migrated deliberately.

## Alternatives considered

### One large YAML/JSON object containing both article bodies

Rejected because long prose is less pleasant to author, diff and review inside structured scalar fields.

### Separate Adult and Teen lesson records

Rejected because they would duplicate identity, taxonomy, provenance and relationships and make Saved/Read semantics ambiguous.

### MDX

Rejected for canonical AI-authored lesson bodies because executable components/code unnecessarily expand the trust boundary. Interactive product components belong to the application, not lesson prose.

### Slug as identity

Rejected because URL/title changes would break durable local reader state and internal references.

### Database-backed lesson records

Rejected for the initial product under ADR-0001; the schema is intentionally portable to another storage implementation if that decision changes later.

## Consequences

- AI workers have a clear, provider-neutral output contract.
- Prose remains pleasant to edit and review.
- Adult and Teen presentations can evolve independently without becoming separate lessons, while publication guarantees that both editions exist.
- URL changes do not invalidate Saved/Read state.
- Source files remain individually reviewable in Git.
- Schema validation becomes a mandatory CI quality gate.
- A lesson normally uses two or three source files; this increases repository file count but does not imply the same deployment representation.

## Follow-up decisions

The publication lifecycle/review policy, edition-specific discovery search, two-presentation rendering benchmark, and initial controlled taxonomy/related rules are defined by ADR-0007, ADR-0003, ADR-0002 and ADR-0008 respectively.

### Figure toolkit review remediation — 17 October 2026

Rasters in all daily candidates (including revisions of imported lessons), and other non-imported lessons, require exactly one bounded structured imageRights record per referenced asset in lesson.yaml (origin, creator, licence/reuse basis, evidence, plus an HTTPS sourceUrl for licensed artwork). The canonical loader and daily guard enforce shape and exact asset correspondence; the Reviewer verifies real rights and creation evidence. PR prose alone is insufficient. Unrevised manual imports retain their reviewed provenance without a metadata migration; a daily substantive revision must meet the current rights/container rules. Container allow-lists reject text/EXIF/XMP/private chunks and opaque ICC profiles; convert to sRGB and strip metadata. These restrictions cannot establish ownership or detect data encoded in pixels/codec streams; factual, rights and exact-head browser review remain required. No new service, subscription or scheduled task is introduced.
