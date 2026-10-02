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

Raw HTML is not executable lesson content, remote Markdown images are forbidden, and links are restricted by the safe-content pipeline. The build imports the canonical loader so a normal production build cannot bypass these gates.

Draft generation may temporarily be incomplete on a working branch, but incomplete content is not publication-eligible and must not reach production `main`.
