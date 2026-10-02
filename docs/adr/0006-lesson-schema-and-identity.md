# ADR-0006: Lesson source schema and identity contract

Status: Proposed
Date: 2026-10-02
Owner approval: pending final architecture approval.

## Context

Lesson content is the central contract between research/generation, validation, rendering, search, taxonomy, related content, local reader state and publication.

The contract must support one stable lesson identity with distinct Adult and optional Teen presentations, provenance, lifecycle state, mutable human-readable URLs, and safe AI-authored content. It must remain easy to review in Git and must not require a database.

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
      teen.md        # optional
```

The directory/slug may change. The lesson ID may not.

### Identity

Every lesson has:

- `id`: immutable UUID;
- `slug`: current human-readable slug;
- `aliases`: zero or more previous slugs, used to preserve old links when a slug changes.

Reader state and internal relationships use `id`, never slug or URL.

### Shared metadata

`lesson.yaml` contains shared facts and editorial metadata rather than article prose.

Proposed shape:

```yaml
schemaVersion: 1
id: "018f..."
slug: "why-gps-needs-einstein"
aliases: []

status: draft
publishedAt: null

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

`adult.md` is required. `teen.md` is optional.

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

### Markdown safety

Lesson bodies use Markdown, not MDX. AI-authored lesson content must not execute code during the site build.

Raw HTML in lesson Markdown is disabled or sanitized. Links are validated for safe schemes. Rendering policy and Content Security Policy are implementation/security controls derived from this contract.

### Lifecycle field

The schema supports `draft`, `reviewed` and `published` states. The precise transition/publishing semantics, including the definition of Today and scheduled publication, are a separate publication-pipeline ADR.

Only content eligible under that publication policy may enter production catalogue/search/sitemap outputs.

### Taxonomy

`topic`, `subtopic` and `concepts` are references to controlled values rather than arbitrary display strings. The exact taxonomy is intentionally separate and may evolve without changing the lesson identity contract.

### Relationships

Internal lesson relationships use immutable IDs.

The schema supports explicit editorial relationship overrides while allowing build-time related-content generation from taxonomy/concepts. It does not require every related relationship to be stored manually.

### Provenance

Sources are first-class lesson metadata and remain reviewable in Git. Generation metadata records how the draft was created without making any AI provider part of the rendering/content contract.

Review history may record automated and human/AI review events. The policy deciding which review is mandatory before publication is a separate Owner decision.

### Validation

CI/build validation must reject at least:

- missing/invalid immutable ID;
- duplicate IDs;
- duplicate active slugs;
- malformed or unsafe URLs;
- unknown lifecycle values;
- unknown taxonomy references;
- relationships to nonexistent IDs;
- missing Adult presentation;
- invalid presentation metadata;
- unsafe Markdown constructs;
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
- Adult and Teen presentations can evolve independently without becoming separate lessons.
- URL changes do not invalidate Saved/Read state.
- Source files remain individually reviewable in Git.
- Schema validation becomes a mandatory CI quality gate.
- A lesson normally uses two or three source files; this increases repository file count but does not imply the same deployment representation.

## Follow-up decisions

Before implementation architecture is approved:

1. define publication lifecycle / Today semantics and review requirement;
2. amend the search ADR around edition-specific metadata/catalogue fields and realistic payload budgets;
3. rerun the rendering/search benchmark using the two-presentation model and realistic text.

The controlled taxonomy and related-content scoring can remain deferred.
