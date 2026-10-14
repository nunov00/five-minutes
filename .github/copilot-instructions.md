# Copilot review guidance — Five Minutes

Follow `AGENTS.md`, `docs/GOVERNANCE.md`, `docs/ARCHITECTURE.md`, applicable `docs/adr/` decisions, and `docs/EDITORIAL.md` for lesson changes. These documents are authoritative; this file adds review focus, not new governance.

## Review priorities

- Report concrete, actionable defects with the affected path/line, failure scenario, impact, and suggested correction. Avoid speculative style comments and duplicated CI findings.
- Classify findings as **BLOCKER** (unsafe to merge, security, data loss, broken publication/critical contract), **IMPORTANT** (material bug, regression, missing essential test), or **MINOR** (bounded non-blocking issue). These are finding severities, not PR review classes.
- Check the PR's `review:routine`, `review:integration` or `review:mandatory` classification against GOVERNANCE section 9. Flag misclassification. Copilot's review does not itself waive required independent-provider review, exact-head checks or Owner decisions.
- Check the actual diff against applicable ADRs. Preserve immutable lesson identity and distinct Adult/Teen presentations; canonical routing, edition preference/history and local reader-state semantics.
- Keep lesson content validated plain Markdown, not executable MDX/HTML. Examine content trust boundaries, unsafe rendering, sanitisation, secrets and changes to workflow permissions.
- Verify that static routes, manifests, catalogue/search artefacts and Cloudflare adapters remain consistent; provider-specific runtime code must not leak into core application logic.
- For UI changes, consider phone layouts, accessibility, keyboard navigation, progressive enhancement, and behaviour without JavaScript where required. Request rendered-page evidence when visual correctness cannot be established from code.
- For lesson or figure changes, apply EDITORIAL.md: factual/source support, useful explanation, Adult/Teen quality, accurate diagrams, legibility, alt text and exact-head phone/wide rendering. Do not treat passing schema tests as proof of editorial quality.
- Assess focused unit/integration tests and relevant Playwright journeys. Flag removed/weakened checks, unsafe `pull_request_target` behaviour, or missing regression coverage. Required checks are `baseline`, `e2e` and `lesson-guard`; never suggest bypassing them.
- Prefer concise findings over a long generic checklist. State explicitly when an observation needs manual or rendered verification rather than claiming it was tested.

## Review independence

Copilot is supplementary unless the repository's GOVERNANCE independence requirements are satisfied. Do not automatically approve or merge PRs. Do not claim to have run tests, inspected previews or independently verified sources without evidence.
