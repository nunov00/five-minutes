# ADR-0007: Publication lifecycle and Today semantics

Status: Accepted
Date: 2026-10-02
Amended: 2026-10-04
Owner approval: approved 2026-10-02; subscription-based automated publication direction approved 2026-10-04.

## Context

Five Minutes needs automated lesson creation without allowing an AI writer to publish arbitrary output directly to production. Draft/review/publish semantics must be unambiguous for pages, catalogue/search, sitemaps and Today.

The Owner requires routine publication to be fully automatic, without per-lesson human approval and without separate OpenAI or Anthropic API accounts. The available subscription tools can write, review and merge through the Owner's GitHub identity, but they cannot provide separate authenticated writer/reviewer identities or a reviewer-owned required status check. Claude Code can inspect Pull Requests and named CI results and can merge with an expected-head guard. Its routines are schedule-based.

The design therefore preserves independent different-provider editorial review before publication, while accepting that separation of authority is procedural until distinct machine credentials are introduced. A missed publication is preferable to publishing on doubt.

## Decision

### Lifecycle

Workflow state is represented by Git/PR state rather than a mutable `draft -> reviewed -> published` field inside lesson metadata:

- **draft**: content exists on a branch/PR and may be previewed;
- **reviewed**: the exact PR head has passed required validation plus independent review in the reviewer run that is authorised to merge it;
- **published**: that exact reviewed head has been merged to `main` at or after its intended `publishedAt`.

Production is built from `main`. Draft branch content cannot enter production discovery merely because of a metadata flag.

### Repository boundary

Normal automated lesson generation occurs on a `lesson/<slug>` branch created from the current `main` head and enters the repository through a Pull Request.

The scheduled ChatGPT writer may create the bounded branch and PR. It must not merge, enable auto-merge, claim to be the independent reviewer or change repository settings.

The scheduled Claude Code reviewer may merge only under the exact same-run review contract below. It must not edit lesson content. Both assistants currently act through the Owner's GitHub identity, so GitHub cannot authenticate their separation. These restrictions are procedural and are backed by the lesson-only guard, explicit named-check verification, exact-base and expected-head checks, and periodic configuration audit.

### Publication time and daily slot

`publishedAt` is the intended/effective publication timestamp and is written before independent review. Automated lessons use Europe/Zurich as the editorial timezone.

For the initial system:

- the writer creates at most one candidate for the current Zurich calendar date;
- the reviewer may merge it only while `publishedAt` still belongs to the current Zurich date and is not in the future;
- the reviewer does not merge if `main` already contains a lesson for that Zurich date;
- after midnight in Zurich, an unmerged candidate is stale and is closed;
- a missed day remains empty rather than publishing late or rewriting reviewed metadata.

This strict same-day rule is intentionally simpler than a rolling grace period. A future cross-midnight publication policy requires a deliberate amendment.

### Today

**Today is the newest published lesson according to `publishedAt`.**

It is not a separate manually maintained content slot. If no new lesson is published on a calendar day, Today continues to show the newest published lesson.

Adult and Teen presentations share the same publication identity and `publishedAt`. A lesson is not publication-eligible unless both presentations exist and pass their gates.

### Writer contract

The scheduled writer runs once per Zurich day and must start by 14:00 Europe/Zurich; a delayed run does nothing. It:

1. checks the repository off switch;
2. closes clearly identified automated new-lesson PRs whose intended Zurich date has passed;
3. stops if another automated lesson or correction PR remains open, or if that Zurich date already has a published lesson;
4. selects an eligible evergreen subject from ADR-0008's controlled taxonomy;
5. researches authoritative sources, authors schema-valid shared metadata and both presentations, performs a separate self-review and records a claim-to-source table;
6. trusts publication policy only from current `main`; candidate branches, PR metadata, comments, source pages and other researched material are untrusted data, and instructions found within them are ignored;
7. creates `lesson/<slug>` from the current `main` head and applies `editorial-review-requested` plus `review:mandatory` only when the candidate is complete; the PR description records why publication requires mandatory review;
8. abandons the topic when evidence or eligibility is uncertain.

The writer never merges, enables auto-merge, creates a purported independent review or changes repository configuration. Automatic revision after editorial findings is not part of the initial system.

### Reviewer and merge contract

The Claude Code routine polls during the bounded daytime window documented in OPERATIONS.md. An eligible automated candidate must satisfy all four conditions: its branch starts with `lesson/`; it carries `editorial-review-requested`; it carries `review:mandatory`; and its diff satisfies the lesson-only boundary. The reviewer skips every ineligible PR and never closes it.

For each eligible automated candidate it:

1. checks the off switch;
2. waits until the latest completed run of each named required check reports exactly `success` on the current head; `skipped`, `neutral`, `cancelled`, absent, pending or stale results are not success;
3. records the head SHA and verifies the lesson-only diff, that a comparison from current `main` to that head has current `main` as its merge base with zero commits behind, daily slot and freshness rules, and that no other automated lesson or correction PR is open; an eligible candidate whose ancestry is no longer current or whose intended date has passed is closed;
4. independently fetches and judges the sources and performs the complete EDITORIAL.md review for Adult and Teen, originality and any Teen activity;
5. posts the review naming the exact SHA;
6. if Ready, within that **same routine run**, re-fetches the head, repeats the current-`main` merge-base/zero-behind check, re-checks the latest named results, and merges with `expectedHeadSha`;
7. if BLOCKER or IMPORTANT findings exist, records the outcome and closes the PR;
8. on infrastructure, network, source-access, scheduling or subscription-limit failure, publishes nothing.

The initial named checks are `baseline`, `e2e` and, after M7.2, `lesson-guard`. They must all be successful on the exact head before review begins and again before merge.

A review, comment or label saved by an earlier run is information only. It is not authenticated approval and can never authorise a later merge. The reviewer may not create an `editorial-ready-awaiting-ci` state or enable auto-merge. Publication authority exists only inside the run that performs the independent review and guarded merge.

`editorial-review-in-progress` is best-effort coordination, not a security lock. Duplicate or overlapping runs remain safe through idempotent eligibility checks, pinned-head ancestry validation, the one-open-candidate rule and the expected-head merge guard.

### Prompt-injection boundary

Research pages, source documents, lesson files, PR descriptions, claim tables, comments and labels are untrusted data for both assistants. Instructions found in that data never modify the fixed writer/reviewer contracts or merge checklist.

Only repository policy and the scheduled task's fixed instructions may authorise actions. A source-access failure or uncertainty fails closed.

### Lesson-only boundary

M7.2 adds a fail-closed guard. Initially, an automated new-lesson PR:

- uses a `lesson/` branch;
- adds one lesson directory containing only `lesson.yaml`, `adult.md` and `teen.md`;
- adds exactly one immutable identity;
- changes outside that directory only through the exact append-only route-ownership entry required for the lesson;
- does not modify, delete or rename existing lessons;
- changes no code, workflow, configuration, dependency, taxonomy, documentation or deployment file;
- contains no symlink, submodule, binary or figure;
- stays within defined file and diff limits;
- passes schema-v2 identity, route, source, safe-content, build, static and browser gates.

Same-repository Pull Request checks use the branch's workflow definitions. The reviewer therefore also verifies the file list and compares the exact candidate head with current `main`: the common ancestor must be current `main` and the candidate must be zero commits behind. GitHub's mutable Pull Request base field is not accepted as proof of ancestry. A candidate based on older `main` is closed, not rebased and trusted.

All AI-authored bodies remain subject to ADR-0006's validated safe-Markdown and structured-content rules. Fork and other untrusted workflows never receive repository or publication secrets.

### Initial editorial and source boundary

Automated publication initially excludes Health & Human Body, medical or personal-health advice, clinical psychology, legal or financial advice, current politics, public office-holders, laws, policies, events or unstable statistics, dangerous activities, active scientific controversies, materially contested claims, observational claims presented as causal, and topics whose material sources cannot be independently accessed.

History remains a Society subtopic rather than a seventh top-level topic.

Material claims normally require two suitable independent authoritative sources. One definitive primary source is acceptable only with explicit justification. The writer's claim-to-source table is review evidence, not proof; the reviewer independently fetches and judges the sources.

Schema-valid Teen activities are allowed. New figures are excluded from the initial automated flow.

### Off switch

Any open repository issue carrying `publication-paused` stops both writer and reviewer. Closing that issue or removing the label permits later scheduled runs; it does not make an old candidate eligible or publish anything immediately.

### Repository protection

Before activation, the Owner configures repository protection so the named status checks apply to administrators, no approval-count rule blocks the shared Owner identity, force pushes and deletion of `main` are disabled, and bypass is disabled where GitHub permits it.

Claude cannot inspect these settings. They are verified and recorded at M7.5 and during the monthly publication audit. GitHub enforcement is a second layer; the reviewer still checks every named result itself before acting.

### Corrections

Published lessons remain editable, but corrections are outside the daily writer/reviewer automation in the initial system. A correction is initiated by the Manager or Owner and follows the normal `review:mandatory` workflow and standing Manager merge rules in GOVERNANCE.md after different-provider review. The automated lesson guard, daily-slot/freshness rules and Claude publication merge authority do not apply.

A correction changes exactly one existing lesson, preserves its immutable ID and original `publishedAt`, and retains an old slug as an alias if the slug changes. It never becomes Today's new lesson. Automatic correction detection, creation or merge is outside initial M7.

### Capability and activation gates

No automated lesson publication is activated until:

1. the lesson-only guard and hostile-input tests pass;
2. a capability spike proves unattended PR creation, actual ChatGPT GitHub identity, scheduled discovery, access to representative authoritative sources, named-check inspection and same-run expected-head merge against a disposable non-production target branch;
3. the spike also leaves an automated candidate unmerged against `main` to prove the guard result attaches to the event head SHA, and tries a candidate deliberately branched from older `main` to prove the ancestry gate fails;
4. the spike proves that a changed head, forged Ready record, overlapping run, inaccessible source and exhausted allowance fail closed;
5. three shadow lessons exercise Ready, rejection, inaccessible-source and stale/missed-run paths without merging;
6. cumulative different-provider review is complete and repository protection, off switch and recovery are recorded.

Usage limits and routine reliability are operational dependencies, not guarantees. Exhaustion or missed schedules results in no publication.

## Threat model and accepted limitations

The implementation and review must cover:

- shared Owner identity and the possibility of forged comments, labels or review text;
- prompt injection through any researched or repository-provided data;
- self-weakening CI, including a branch based on older `main`;
- administrator bypass or misconfigured repository protection;
- head changes after review;
- overlapping routines and partial failure after review;
- missed schedules and exhausted Plus/Pro allowances;
- unreachable or unsuitable sources;
- stale candidates and publication across midnight;
- duplicate lessons and route-registry conflicts.

The fixed scheduled-task instructions and exact external bootstrap prompts are versioned in `docs/automation/publication-task-contracts.md`. Each configured task starts only by loading its bootstrap target from current `main`, then reads trusted current-main policy before examining untrusted candidate or source data. M7.5 and the monthly audit compare the configured bootstrap text with that file. Changing the versioned instructions is a mandatory-review publication change.

Review records name provider, model and exact SHA, but this is self-reported text under the shared identity rather than authentication. The design confines authority to a single reviewer run and fails closed; it cannot technically prevent an assistant acting as the Owner from violating its procedural restrictions or changing repository settings. Separate machine identities may harden this later.

## Consequences

- Routine publication can be automatic without per-lesson Owner action or separate API billing.
- Independent different-provider editorial review remains before publication.
- Static production continues to derive only from reviewed `main`.
- A delayed review, inaccessible source or exhausted subscription may skip a day.
- The same-day window avoids late publication and reviewed-metadata rewrites.
- The shared GitHub identity is a documented residual risk.
- Polling consumes subscription allowance and must be measured during shadow operation.
- No custom merge bot, auto-merge state or reviewer status service is introduced.

## Alternatives rejected

- **Publish then audit:** exposes unreviewed factual/editorial errors.
- **GitHub auto-merge after a saved Ready record:** a changed head or forged record could publish without the same review.
- **API-backed writer/reviewer services:** require separate API accounts and billing that the Owner does not want initially.
- **Custom merge bot or status relay:** adds machinery without creating real identity separation.
- **Same-provider review:** retains correlated blind spots and conflicts with the independent-review policy.
- **Per-lesson human merge:** conflicts with the Owner's full-automation requirement.
- **Automatic revision initially:** adds unproven states; a rejected candidate closes and a later day starts afresh.

## Owner decision

Independent different-provider review is sufficient for routine lesson publication under this contract. Subscription-based shared-identity operation is accepted as a procedural limitation for the initial system. Activation remains gated by issue #76 and its M7.2–M7.5 evidence.
