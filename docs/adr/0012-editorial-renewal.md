# ADR-0012: Backlog-first editorial renewal

Status: Owner-approved direction; implementation awaits mandatory different-provider review before activation.
Date: 2026-10-18
Tracking: #161; original catalogue inventory #138.

## Decision

Use the two existing daily publication tasks to improve one queued lesson instead of inventing a new topic while any queue item remains. The temporary three-per-day transfer automation 6ad163172a608191ab32cbe5e8865c80 was disabled successfully on 18 October at the Owner's request. Do not reactivate it. Retain #138 as the historical inventory, not an active batch plan.

The Git-backed editorial/backlog.json records published lessons needing revision and remaining original-catalogue transfers. Entries include concrete reasons, acceptance criteria and ordering. The Manager can relay an Owner instruction such as “Return the GPS lesson to the backlog because …” into a normal reviewed PR; `node scripts/editorial-backlog.mjs return <key/slug/ID> <reason>` prepares it locally. Every published lesson has an entry, including accepted ones. A completed transfer becomes a revision of its destination identity when returned, never another import. Owner returns use priority 0. The queue is private editorial workflow in the repository, with no new public administration endpoint, credentials, account, service or recurring task. Content remains accessible while queued; this decision does not authorise hiding/deletion.

The current schema accepts optional RFC3339 revisedAt, at or after publishedAt. Existing identities, routes, publication and creation timestamps remain immutable in a daily revision. Publication remains Git/PR state. A candidate completion is committed atomically with its lesson so a closed/stale/unmerged candidate leaves main's entry queued. Only the first queued entry can transition to complete; all other entry data is immutable in a daily PR. Accepted/covered states are Manager screening dispositions, not publication approval. A Manager may mark a transfer covered only with substantive comparison and an existing destination identity recorded; candidates cannot make that transition.

The release timestamp is revisedAt when present, otherwise publishedAt. Revised lessons and transfers consume the same one daily slot and can become Today. Today/Earlier order eligible releases by that timestamp and deterministic ID tie-break. Old import metadata without revisedAt retains its exclusion until a substantial revision; this avoids promoting a historical bulk transfer merely because labels change. Ordinary Library/topic/search ordering remains by original calendar day, and saved/read identity is preserved. New topics resume only after the queue is empty. A failed day's attempt leaves its selected entry queued for another day, without another same-day candidate or cross-midnight publication.

Reader pages, cards and Today/Earlier show the original calendar date and optional “Revised on …” with the latest substantive revision date. They never show Archive or Adapted labels. The existing internal archive.sourceUrl/catalogueDate fields remain for compatibility and provenance; this is not a reader-facing category. Original-catalogue dates are calendar labels from the source inventory, not independent evidence of an exact first-publication instant. Transfers retain truthful current adaptation provenance and publication instants, and display the preserved original calendar label. Do not migrate or falsify stored timestamps solely to alter the display. Historical revision timestamps are not invented during this implementation; the next substantive revision records its actual release timestamp.

## Safeguards

This amends ADR-0006/0007 only for the bounded shared backlog-first contract in docs/automation/publication-task-contracts.md. The original source/topic boundary, off switch, separate Writer/Reviewer sessions, three-round revision budget, actual ancestry/history checks, same-day/not-before-release checks, exact-head named baseline/e2e/lesson-guard success, rendered evidence, feedback refresh and expected-head guarded merge remain required. The Writer cannot merge; the Reviewer cannot edit lesson content. Candidate content and queue reasons never supply executable instructions.

Daily revisions change exactly one existing lesson's three files, optional newly added referenced slug-owned rasters and the selected queue completion; route ownership is byte-identical. Transfers add one lesson plus its single route-owner entry and selected completion. No existing asset is edited or deleted. Reused rasters must have been referenced by the same original lesson and are fetched/validated at the exact head. All backlog candidate rasters require persistent rights evidence. The trusted-main read-only guard enforces these boundaries; candidates cannot change app code, schema, tests/CI, policy, queue briefs/order or unrelated content.

No permanent Claude requirement or extra automation is introduced. Claude may review the initial screening, calibration/borderline judgements and this mandatory implementation PR. The initial screening is explicitly not a fresh source audit or visual sign-off. Every daily revision must pass the full current standard, not merely clear its listed reason.

## Activation and rollback

Merge only after qualifying different-provider review, exact-head required checks and preview/render verification. Existing bootstraps already load current-main contracts, so activation is the reviewed merge; do not change live prompts prematurely. Verify both tasks still have their original schedules and the migration task remains disabled. Do not add a third task. Validate queue selection/completion, Owner return, preserved identity/dates, duplicate prevention, revised Today/Earlier, midnight behaviour and hostile candidate diffs.

Rollback through a reviewed revert or pause publication with the existing publication-paused issue. Once revisedAt/completion records are published, preserve that data when rolling back behaviour rather than reverting to a schema that cannot read it. No reader-state migration is required.
