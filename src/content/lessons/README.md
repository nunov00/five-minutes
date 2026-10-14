# Canonical lesson contract

Canonical source layout is:

```text
src/content/lessons/<year>/<organisational-name>/
  lesson.yaml
  adult.md
  teen.md
```

`lesson.yaml` supplies shared `LessonMetadata`. Adult and Teen Markdown front matter supplies `PresentationMetadata`. The directory name is organisational only: immutable identity is the UUID and routing comes from the slug/alias contract.

All canonical files are parsed through `src/lib/content/loader.ts` and the safe YAML/Markdown pipeline. Production validation fails closed if the canonical set is unexpectedly empty, if either Adult or Teen is missing, if schema/reference/security checks fail, or if a current route is absent from `src/content/route-ownership.json`.

The route-ownership registry is durable history, not a generated cache. New slugs/aliases must be registered to their lesson UUID. Existing entries may be added to but never removed or reassigned. Pull-request CI compares the registry with the PR base commit using `validateRouteOwnershipHistory`.

Each presentation's `title` front-matter field is its page's only level-1 heading, so presentation bodies must not use `#` headings: start body sections at `##` (`###` for sub-sections). Do not repeat the title as a body heading. The pipeline rejects a `#` heading in a presentation body (outside fenced code) and fails the build. The Markdown subset is deliberately small: `####` and deeper headings are not headings (the line renders as literal text), and only backtick (```` ``` ````) fences are code blocks; `~~~` fences are not supported, so a `#` line inside one is still rejected as a heading. See ADR-0006.

Raw HTML is not executable lesson content, remote Markdown images are forbidden, and links are restricted by the safe-content pipeline. The build imports the canonical loader so a normal production build cannot bypass these gates.

Draft generation may temporarily be incomplete on a working branch, but incomplete content is not publication-eligible and must not reach production `main`.

`topic` and `subtopic` must use a parent/child pair from `src/lib/taxonomy.ts`; validation rejects unknown values and valid subtopics placed under the wrong topic. `concepts` remain focused canonical tokens rather than a public hierarchy.

Related lessons use immutable UUIDs. Every published lesson must produce at least two eligible relationships after exclusions; reference validation reports a content error before rendering when it cannot. Prefer two or more specific manual relationships with a short reader-facing reason when the editorial connection matters. Build-time inference can supplement them from shared concepts/taxonomy, while `related.exclude` prevents inappropriate suggestions. Never store a slug or reconstructed URL as a relationship.

Production lessons use schemaVersion 2. The historical M6.2 migration changed only that version line: it preserved prose, identity, URLs and metadata and added no figure/activity fields. Version 1 and mixed published versions are rejected. Optional v2 figure/activity fields are validated presentation metadata. See [the M6.2 authoring contract](../../../docs/implementation/m6.2-reading-enhancements.md) for closed figure types, local PNG/WebP limits, paragraph placement and Teen-only activities. Seasons, feedback control, heat pumps, kidney filtration, exponential growth and Goodhart provide reviewed-change examples; these additions still require editorial review before merge.

For every new lesson, later content migration or substantial editorial pass, apply EDITORIAL.md's engagement assessment: decide whether Adult and Teen each need a figure and whether Teen benefits from a prediction activity. Add supported elements when they materially improve understanding; otherwise record why they were omitted. A field being optional in the schema does not make the assessment optional.
