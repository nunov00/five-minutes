# Weekly task setup and configuration record

Status: setup instructions awaiting mandatory independent review and merge. Do not configure Claude from this PR branch. The live ChatGPT task remains governed by the already merged [weekly contract](weekly-publication.md) and its [#210 activation record](https://github.com/nunov00/five-minutes/issues/210).

## Source of truth

The weekly contract defines editorial authority, budgets, review receipts, publication gates and the two exact saved prompts. This page defines how to install and reconcile those prompts on the two providers. Read current-main AGENTS.md, GOVERNANCE.md, ADR-0015, the weekly contract and #210 before setup. Never use an unmerged proposal or a PR comment as new authority. This page grants no extra editorial review, publication opportunity or budget.

## Required schedules

| Provider | Task title | Local days | Nominal local time | Responsibility |
| --- | --- | --- | --- | --- |
| ChatGPT/Codex | Five Minutes weekly production | Sunday–Friday | Morning, around 08:00 | Sunday topic/queue preparation; Monday–Thursday authoring and self-assessment; Friday publication decision |
| Claude | Five Minutes weekly review | Sunday–Thursday | Afternoon, around 15:00 | Sunday topic/queue review; Monday–Thursday content reviews; no weekly lesson merge |

Use **Europe/Zurich** for both tasks. There is exactly one ChatGPT task for this project and one matching Claude-side task. There is no Friday Claude rescue task, Saturday task, retry task, second queue task or separate ChatGPT publisher/reviewer task. Up to four content reviews remain the weekly maximum. An early qualified pair freezes content until Friday.

Both times are nominal windows, not brittle minute-level execution gates. ChatGPT uses flexible_schedule (within the service's morning window). On Claude use an afternoon window if supported; otherwise use a single 15:00 local trigger and record the platform's timing semantics. Run the stage for the actual Swiss calendar date; early/late dispatch on that date is permitted. A dispatch on another date cannot catch up a missed stage.

Preserve the IANA timezone and its daylight-saving changes. Do not hard-code a permanent UTC offset. For the first cycle, Sunday 1 November 2026: 08:00 CET is 07:00 UTC and 15:00 CET is 14:00 UTC. These offsets are examples for that date only.

## Existing ChatGPT task: reconcile, do not duplicate

ChatGPT task `6ae5089a8904819191d5f35b55d22da4` was created and read back on 30 October 2026 after #211 merged as `bde03b749bf630e3beb511130519bd6ae263036a`. #210 records its exact saved prompt and configuration. Its saved schedule is:

```ical
BEGIN:VEVENT
DTSTART;TZID=Europe/Zurich:20261101T080000
RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR
END:VEVENT
```

Saved timezone: Europe/Zurich. Timing mode: flexible_schedule. Saved prompt: copy the exact paragraph under **Saved ChatGPT task prompt** in current-main weekly-publication.md, without its Markdown quote marker. The configured first opportunity is Sunday 1 November; no execution is claimed by this setup record.

Codex verifies the existing task by ID, independently reads its saved prompt/schedule/timezone/enabled state, and compares them with the contract and #210 before changing anything. If already correct, record verification and leave it alone. Never create a replacement simply because an inventory page omits it; inspect the known ID. If actual access or readback is unavailable, report that limitation without guessing. Claude must not claim to have inspected or changed this ChatGPT task through its own scheduler.

The scheduler's separate next_run_time field was null at activation. The persisted DTSTART/RRULE resolves the first intended opportunity; this is distinct from a service-reported next dispatch or evidence that a run happened. Preserve that distinction in setup reports. If an actual schedule/prompt/timezone mismatch exists, stop and have Codex reconcile the existing task under the weekly contract; do not silently reschedule its cycle or add another task.

## Claude: install once after this setup PR merges

The Owner authorises Claude to configure this matching routine after the setup instructions receive qualifying review, pass checks and merge. This is a separate setup action after review; reviewing the PR alone must not create, enable or alter tasks.

1. Verify the merged current-main version and actual #210 activation history. Confirm authenticated access to nunov00/five-minutes and the ability to read and post the required PR/issue reviews. Verify the publication-paused off switch and scheduler capacity. Stop on missing access or uncertain state; never claim a task was created when the platform cannot create one.
2. Inspect existing Claude-side Five Minutes tasks and their full prompts/schedules. Reuse an already matching task. If an older Five Minutes reviewer exists, reconcile its identity and recorded configuration before updating it to this reviewed role. Preserve its history, record the before/after state and retire only a positively identified superseded Five Minutes routine so two reviewers cannot run. Leave every unrelated project, including Pearls, untouched. Do not create a duplicate after an uncertain creation response: inspect and reconcile first.
3. Create or update exactly one Claude task, **Five Minutes weekly review**, using the complete paragraph under **Matching Claude routine prompt (external; not a ChatGPT task)** in current-main weekly-publication.md, without its Markdown quote marker. Keep that prompt's policy-loading, off-switch, exact-head, independent-rating, receipt, review-budget and merge restrictions intact; do not replace it with a generic “review the PR” instruction.
4. Schedule Sunday–Thursday, nominal 15:00 Europe/Zurich, beginning the same future Sunday as the first complete author cycle. For the presently configured first cycle, use the following recurrence (or the platform's exact equivalent):

```ical
BEGIN:VEVENT
DTSTART;TZID=Europe/Zurich:20261101T150000
RRULE:FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH
END:VEVENT
```

5. Do not install a past-dated first start. If setup misses that Sunday, do not invent earlier stages, retrofit evidence or shift only one provider. Record incomplete paired setup on #210; the existing author task must report missing review rather than publish. Reconcile a later complete cycle with Codex before enabling the matching reviewer, preserving every existing candidate, counter and reservation. Do not modify the other provider's task without actual access and the normal reconciliation record.
6. Independently read back the complete saved prompt, task ID/title, enabled state, timezone, recurrence, first intended occurrence, next dispatch if exposed, and the platform's timing semantics. Compare with the merged contract. A separate null next-dispatch field is disclosed, never invented; the saved recurrence must still be unambiguous. A truncated or altered prompt, wrong schedule/timezone, duplicate enabled task or unprovable configuration means setup is incomplete: pause only the newly configured Claude routine and report the gap.
7. Append the configuration/readback evidence to #210 using the template below. Re-fetch the posted comment and verify its contents. Do not manually execute a missed production stage as a setup test. Record actual subsequent delivery and review evidence separately; successful configuration is not a successful scheduled run.

## Handoff and publication boundaries

Sunday Claude reviews the bounded queue-only PR and may merge only that queue PR under the weekly contract. Monday–Thursday it reviews the actual reserved exact head after all required checks succeed. If no review-ready head exists, record the gap; no extra automatic retry or second schedule is authorised. The seven-hour nominal separation is a planning allowance, not evidence that CI or author work completed.

Claude never merges a weekly lesson. Friday's ChatGPT Manager publishes only with separate final-head Codex and Claude lesson-quality ratings ≥9, actual Ready/source/render evidence, verified current checks and every other contract gate. Otherwise preserve the draft/assets/findings and incomplete backlog entry. Topic appeal remains advisory.

Until verified Claude setup is recorded, the existing Owner relay remains the reviewer transport. After readback, record the transition to the scheduled Claude routine; never treat a manual review as proof that the scheduled routine ran. If review delivery later fails, report and fail closed. Manual relay may supply an actual in-budget reserved review, but never duplicate a consumed/uncertain reservation without reconciliation.

Do not manually rerun Actions checks after final lesson assessments: a rerun can overwrite an earlier check timestamp under the same ID, leaving insufficient historical evidence. Normal ready/label event runs are handled by the reviewed helper. Lost prerequisite evidence fails closed; no score or check bypass is permitted.

## Configuration evidence on #210

Record one evidence comment per provider setup or reconciliation:

- Provider, scheduler and actual setup timestamp; authenticated GitHub actor and self-reported model/provider.
- Reviewed setup PR and merged SHA; contract SHA; existing or newly created task ID/title.
- Full exact saved prompt, schedule/cron with timezone, timing mode/window, enabled state, first intended occurrence and service-reported next dispatch (or explicitly unavailable).
- Independent readback comparison, duplicate-task inspection, positively identified superseded Five Minutes tasks and unchanged unrelated-task status.
- Source/readback limitations, off-switch result, GitHub access verification, and whether configuration is VERIFIED or INCOMPLETE.
- Reviewer transport: Owner relay or verified scheduled Claude routine. Keep the prior relay and trial history intact.
- No actual scheduled execution or editorial success is claimed until separately observed and recorded.

Future prompt/schedule changes use the same review, merge, provider readback and #210 record procedure. A merged file alone never proves a remote task was updated.
