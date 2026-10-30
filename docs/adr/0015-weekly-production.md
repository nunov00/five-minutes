# ADR-0015: Weekly production with a dual quality gate

Status: Owner-approved direction, 30 October 2026; implementation and activation require GOVERNANCE section 9 review. Activation record: [#210](https://github.com/nunov00/five-minutes/issues/210).

## Decision

Use one ChatGPT scheduled task, Sunday–Friday in Europe/Zurich. Sunday assesses topics and the queue; Monday–Thursday provides up to four Claude content-review opportunities; Friday publishes only with separate Codex and Claude lesson-quality ratings of at least 9/10, Ready, and every existing factual, visual, source, CI and merge safeguard. A missed gate returns the work to the backlog. A high score cannot waive a finding. Topic appeal remains advisory and is never averaged with lesson quality.

The steel-ship lesson #206 needed six Claude passes and exceptional extra revisions. Publication did not retrospectively complete trial #200. Its historical record remains intact. This cadence provides four normal content reviews, rather than promising quality after two. It does not guarantee a weekly release.

The executable operational contract is [weekly-publication.md](../automation/weekly-publication.md); it includes both saved prompts and activation/rollback. GitHub carries the evidence between separately scheduled providers. No second ChatGPT task, API service, model delegation, webhook or automatic external message is introduced. Claude's matching routine must be configured separately; missing review fails closed.

## Narrow supersession

Only after recorded activation, for `weekly-lesson/<Sunday-date>/<slug>` candidates under this contract:

- The bounded Sunday–Friday cycle replaces ADR-0007's same-day candidate expiry and daily cadence. The release date is that cycle's Friday; drafts may carry that date before Friday without becoming production content.
- Sunday reviewed main provides the fixed selection; the weekly lesson PR completes only that entry and removes its ranked brief. It cannot refresh the pool or other briefs. The Sunday assessment stays dated Sunday; no invented daily reassessment.
- Four content-review rounds (initial draft plus at most three material revisions) replace the daily/trial revision budget. Missing reviews cannot be invented; a low score does not grant extra rounds.
- Friday's Manager may consume an earlier Claude Ready review of the identical final head and merge with `expectedHeadSha`, after repeating all live gates. This replaces the daily same-reviewer-invocation merge rule and the Coordinator-child requirement for weekly candidates only. The implementing author is never the independent reviewer. No auto-merge or stale-head carry is authorised.
- Both final-head lesson-quality scores ≥9 are an additional hard eligibility gate, narrowly superseding EDITORIAL's advisory-only wording. CI verifies the evidence shape and comparison, not the truth of subjective quality judgements. Review honesty, separate score comments and initial independent judgement remain essential.

Legacy daily tooling/rules remain unchanged, and all legacy publication schedules stay disabled. The old draft-only trial is not extended, reclassified or restarted. Other product proposals, topic-led-opening permission and schemas are unchanged.

## Consequences

A current-main structural guard supports multi-day candidates without weakening the daily path. A separate Friday decision helper validates a Manager-collected live snapshot and dual exact-head receipts. Neither helper grants authority by itself. Branches, labels and candidate-supplied comments cannot activate this policy. Main/PR/review provenance, unresolved feedback, ledger history and deployed output still need actual verification.

If main advances after Thursday's final review, Friday cannot silently refresh and carry scores. The new head needs all checks and both current-head assessments within the remaining budget; otherwise backlog. Retaining a candidate is preferable to publishing to meet a date. No new service, dependency, workflow permission or production page is added.
