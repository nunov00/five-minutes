# Canonical lesson contract

M2.1 implements the in-memory schemaVersion 1 contract from ADR-0006.

Canonical source layout is:

```text
src/content/lessons/<year>/<organisational-name>/
  lesson.yaml
  adult.md
  teen.md
```

`lesson.yaml` supplies the shared `LessonMetadata`. Adult and Teen Markdown front matter supplies `PresentationMetadata`. The directory name is not identity or routing data.

This slice deliberately validates the parsed data contract rather than parsing YAML/Markdown itself. Safe YAML parsing, front-matter extraction, raw-HTML handling and sanitisation are M2.3 concerns. Publication eligibility (including requiring both presentations) is M2.2. Cross-lesson target existence and redirect-manifest generation are M2.4.

Draft bundles may therefore temporarily omit Adult or Teen metadata here. The production/publish validator added in M2.2 will fail closed unless both presentations exist.
