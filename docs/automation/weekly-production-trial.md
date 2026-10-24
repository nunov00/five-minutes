# Controlled weekly production trial

Status: draft for mandatory review; inactive. Tracking: #200; accepted manual popcorn pilot #202.
Owner direction, 24 October 2026: publish the accepted pilot, then test one controlled weekly production cycle before considering recurring activation.

## Scope and authority

Produce one new, unpublished lesson on a different topic through three scheduled production opportunities. Test whether the scheduled environment can repeat the accepted editorial and visual standard within normal production limits. This is a one-cycle trial, not the Publisher and not a recurring service.

This document alone creates or changes no task. Before scheduling: merge the qualifying reviewed contract, record the three exact one-time task configurations and their readback on #200, and verify that they fit available account capacity without disabling or modifying any other task. Task prompts load this contract and current-main AGENTS.md and required policies; they do not load proposal history as executable instructions. For this isolated draft-only trial, the cadence, candidate expiry, two-round limit and prohibition on merge/publication below govern instead of the daily automated-candidate rules. Other safeguards still apply; unresolved policy conflicts stop the run and are reported. Loaded daily Reviewer instructions cannot confer merge authority on a trial run. Existing Publisher schedules and the publication-paused off switch remain untouched.

At the start of every opportunity and again before any write or generation dispatch, check for an open issue labelled `publication-paused` and whether the Owner has disabled the task. A pause, disabled task or uncertain off-switch state stops work; reconcile existing evidence and report the trial incomplete. No run may close the issue, remove its label or re-enable itself.

The trial may research, create one dedicated candidate branch and draft PR, submit lesson data/assets, and record review evidence on that PR and #200. It may not merge a lesson, publish, activate a recurring schedule, change the active editorial queue, change existing lessons/assets, alter policy/code/tests, or introduce services, credentials or costs. Final publication remains a separate Owner decision.

## Candidate submission boundary

Use one dedicated `feature/weekly-trial-<slug>` branch and a draft PR labelled `review:mandatory` and `impl:openai`. Never use a `lesson/` or `capability/` branch, the `editorial-review-requested` label, auto-merge or the automated `lesson:submission prepare` path. Verify branch, labels and draft state before every submission. If another actor makes the candidate eligible for daily automation, stop and report the conflict before further work.

The diff is limited to one new lesson's `lesson.yaml` and `adult.md`, its newly added slug-owned PNG/WebP sources and the necessary append-only route-ownership entries. Do not edit backlog/queue state, existing content/assets, scripts, dependencies, configuration or policies. Submit through the GitHub connector. Validate candidate data in an isolated checkout of freshly pinned current-main tooling and its lockfile dependencies, overlaying only those allowed data/assets; run canonical tests, build, `verify:static` and applicable raster checks there. Never execute code from the candidate. Record trusted-main SHA, candidate SHA, commands and results. Recheck these boundaries and preserve the same identity/dates on revision.

Require successful `baseline`, `e2e` and `privacy` at the exact candidate head, plus the expected successful `lesson-guard` result explicitly reporting not applicable. A not-applicable guard is not automated-boundary validation. This trial proves only the scheduled creation, data-validation, submission and reviewed-quality stages. Current daily guard requirements for the current Zurich publication date and trusted backlog completion remain unchanged; their compatibility with a multi-day weekly candidate is an unresolved cutover prerequisite requiring separate reviewed implementation. Neither the trial nor its success authorises bypassing those requirements or activating the weekly Publisher.

## Three opportunities

Proposed window: 26, 28 and 30 October 2026 at 05:00 Europe/Zurich, with Friday 06:00 as an assessment target, not a quality or success waiver. For this proposed window each 05:00 Europe/Zurich start resolves to 04:00 UTC: `2026-10-26T04:00:00Z`, `2026-10-28T04:00:00Z` and `2026-10-30T04:00:00Z`. The configuration readback must record the named zone and each resolved UTC instant; do not reuse the pre-clock-change offset. These are proposals until task readback is recorded; if review or capacity prevents this window, choose and record a later complete window before dispatch. Do not retrospectively count manual work or invent missed runs.

1. Creation: recheck the leading three eligible topic treatments, source access, duplication and feasibility; record the selection comparison and a short brief in #200. Draft the selected lesson and its useful visuals. Submit a draft PR with checks and a complete review handoff.
2. Review/revision: reconcile the same candidate and its checks. Obtain a separate Reviewer pass; the Writer may make a reserved revision from the actual findings. A changed head requires fresh checks and later exact-head review.
3. Final assessment: reconcile the candidate and complete available checks/review. If actual posted findings require it, the Writer may reserve the second revision round here. That changed head still needs fresh checks and a separate later exact-head review; without both before this opportunity closes, report incomplete. Record the final assessment and its actual timestamp as Ready, incomplete, or failed. Retain the draft PR; never publish automatically.

Non-editorial delays carry the same candidate forward within this window, preserving identity, evidence and budgets. Never start a replacement topic to hide failure. After the third opportunity, stop and report any incomplete stages; further opportunities require a separately recorded Owner decision. The one-time trial does not repeat next week.

## Editorial and review standard

Use current-main EDITORIAL.md, ADR-0013/0014 and figure-toolkit guidance. Retain the single-version lesson, complete causal reasoning, accessible British English, numbered source references, supported claims and truthful source-access limits.

Compare three distinct eligible angles using topic appeal, reader payoff, evidence and feasible visual roles. Exclude popcorn, the existing butterfly pilot and other published/active duplicate identities. Reuse the existing pool and #200 for planning evidence without changing queue state or ranking. An unsupported topic must be developed or deferred before drafting.

Give a recognisable reason to read, an informative early answer where useful, and an ending that follows from the same explanation. Do not enable the butterfly-only opening field. Use at most five purposeful visuals; generated artwork is conceptual, precise diagrams are deterministic. Assess prediction/recall without forcing an activity.

A separate Reviewer completes the applicable factual, editorial, language and exact-head rendered review. For this calibration trial, obtain review from Claude (Anthropic), or from Perplexity only when the review identifies a non-OpenAI underlying model family that qualifies under GOVERNANCE section 9. An unspecified model or OpenAI-backed Perplexity result does not establish independence from `impl:openai`. Use the existing Owner-relayed workflow where needed; the Writer must not claim to have obtained a review if access is missing. Findings must be posted on the PR with the exact reviewed SHA before a subsequent opportunity acts on them. A final review posted after the third opportunity closes is late follow-up evidence, not completion within this window. Missing review is an incomplete stage. Do not auto-message an external reviewer or invent a review.

The Reviewer gives separate honest topic/lesson ratings, reasons and at most two worthwhile improvements; disclose earlier score exposure. The Owner's target is at least 8/10 lesson quality, alongside all normal gates. Ratings are subjective editorial judgements, never measured reader demand or permission to override a factual/accessibility failure. Never inflate a score to meet the target.

## Budgets and interruption safety

Normal limits for this candidate: six total image-generation dispatches, lead at most four, other generated visuals at most two each; two editorial revision rounds. Each dispatch returns one candidate image. Failures and edits count; deterministic diagrams and optimisation do not. Use only the built-in image_gen tool, accessible real local bytes, installed processing or trusted-main lockfile dependencies, and GitHub connector submission. No paid API, keys, unrelated services or image fallback.

Before each dispatch or revision, durably reserve a unique key and cumulative counters on #200 and the candidate PR when present. Read the record before acting; a dispatched or uncertain key is reconciled, never silently retried. Record actual prompt, result, local-byte availability, optimisation/validation/submission stages, rights and hashes. Use trusted current-main tooling; execute no candidate code. Preserve original lesson identity/dates and asset history.

Track this trial separately from setup (2/4 used), butterfly calibration and popcorn (one generation; two normal rounds plus Owner-authorised additional round 3). Those manual extensions do not enlarge the trial's normal limits. If more effort is needed, report it honestly; the Owner may approve it for quality, but the cycle then has not demonstrated production within normal budgets. Interruption, day changes and commits never reset counters.

## Evidence and completion

Record on #200: actual scheduled starts and actions, task configuration/readback, selected brief, branch/PR/commit links, dispatch/revision ledger, manual assistance, source/render access limits, exact-head checks/review, Owner assessment, elapsed calendar stages and known resource evidence. Do not invent credit figures or reader timing.

Scheduled success requires actual scheduled research/creation, accessible generated asset bytes, trusted optimisation/validation, successful GitHub submission through the draft-only path above, its specified checks and exact-head factual/editorial/rendered review, within all three opportunities and normal budgets. Owner acceptance is also required for calibration. Keep generation success, submission success, Ready review and Owner acceptance distinct.

Do not declare stage B complete from the already accepted manual popcorn lesson. If any stage is unavailable or outside normal limits, give the precise result and remaining gap. A lesson may still be worth retaining even when the repeatability experiment is incomplete. Even a successful trial leaves the automated weekly submission/guard compatibility gap above open.

At close, record all one-time tasks finished/disabled as appropriate, verify other automations unchanged, and leave the recurring weekly schedule inactive. Consolidating permanent operational guidance, RSS/AI disclosure and recurring Publisher cutover remains separately reviewed work after the evidence is assessed.
