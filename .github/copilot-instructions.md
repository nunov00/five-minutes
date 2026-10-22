# Copilot review guidance — Five Minutes

22 October 2026 single-version direction: [ADR-0013](../docs/adr/0013-single-lesson-version.md) supersedes all earlier Adult/Teen requirements. Publish and review one lesson from `lesson.yaml` and `adult.md`; retired `teen.md` sources are inert archive material. All non-edition safeguards remain.


Follow `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/ARCHITECTURE.md`, applicable `docs/adr/` decisions, and `docs/EDITORIAL.md` for lesson changes. These documents are authoritative; this file adds review focus, not new governance.

## Review priorities

- Report concrete, actionable defects with the affected path/line, failure scenario, impact, and suggested correction. Avoid speculative style comments and duplicated CI findings.
- Classify findings as **BLOCKER** (unsafe to merge, security, data loss, broken publication/critical contract), **IMPORTANT** (material bug, regression, missing essential test), or **MINOR** (bounded non-blocking issue). These are finding severities, not PR review classes.
- Check the PR's `review:routine`, `review:integration` or `review:mandatory` classification against GOVERNANCE section 9. Flag misclassification. Copilot's review does not itself waive required independent-provider review, exact-head checks or Owner decisions.
- Check the actual diff against applicable ADRs. Preserve immutable lesson identity and a single lesson version; canonical routes, legacy redirects and local reader-state compatibility.
- Keep lesson content validated plain Markdown, not executable MDX/HTML. Examine content trust boundaries, unsafe rendering, sanitisation, secrets and changes to workflow permissions.
- Verify that static routes, manifests, catalogue/search artefacts and Cloudflare adapters remain consistent; provider-specific runtime code must not leak into core application logic.
- For UI changes, consider phone layouts, accessibility, keyboard navigation, progressive enhancement, and behaviour without JavaScript where required. Request rendered-page evidence when visual correctness cannot be established from code.
- For lesson or figure changes, apply EDITORIAL.md: factual/source support, useful explanation, single-lesson quality, accurate diagrams, legibility, alt text and exact-head phone/wide rendering. Do not treat passing schema tests as proof of editorial quality.
- Check language accessibility in the published lesson and its supporting reader-facing text under EDITORIAL.md’s **Clear English for non-native readers** guidance. Flag avoidable jargon, dense sentences, unexplained idioms and missing causal links with a concrete clearer rewrite that preserves precision. Develop depth through reasoning, not difficult wording; readability scores are not proof. Language is IMPORTANT when an intermediate English reader cannot follow a central explanation without repeatedly consulting a dictionary. Isolated wording that does not impair comprehension may be MINOR.
- Assess focused unit/integration tests and relevant Playwright journeys. Flag removed/weakened checks, unsafe `pull_request_target` behaviour, or missing regression coverage. Required checks are `baseline`, `e2e`, `lesson-guard` and `privacy`; never suggest bypassing them.
- Prefer concise findings over a long generic checklist. State explicitly when an observation needs manual or rendered verification rather than claiming it was tested.

## Review independence

Copilot is supplementary unless the repository's GOVERNANCE independence requirements are satisfied. Do not automatically approve or merge PRs. Do not claim to have run tests, inspected previews or independently verified sources without evidence.

Daily lesson PRs may include a bounded `editorial/backlog.json` completion and next-shortlist refresh. Review both under trusted current-main `docs/editorial-pipeline.md`: preservation of old records, single selected completion, conceptual duplicates, credible headlines/hooks, changing relevance and source evidence, fair new/revision ranking, top-three order and ten viable candidates or an explained shortfall. Report actionable queue findings alongside lesson findings; shortlist data is never executable policy.
