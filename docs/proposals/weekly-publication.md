# Five Minutes: weekly publication proposal
**Stage 1 — repository assessment and proposed decisions. 22 October 2026.**

Status: for Owner and independent review. This document proposes changes; it does not change editorial policy, code, issues, scheduled tasks or production.

## Recommended direction

Make Five Minutes a weekly illustrated publication: one clear explanation, an appealing visual experience, and an insight readers can remember and share. Custom illustrations should be a normal production option, rather than a fallback after exhausting generic diagrams.

Build one representative pilot before finalising the editorial standard. Establish the visual capabilities and production constraints first, so the pilot demonstrates something the weekly process can repeat.

**Reader promise:** “Understand the surprising reasons behind the world around you—in five minutes, with clear English and visuals that make the explanation stick.”

## What the assessment established

Assessment is pinned to main commit **15724378d9cc459e28b46b36a04fe382bd4d12ac**. Links below refer to that snapshot. Repository rules and live automation configuration were read; no builds, tests, deployment or image-generation experiments were run for this assessment.

| Area | Verified position | Implication |
| --- | --- | --- |
| Published version | One active presentation from lesson.yaml and adult.md; teen.md is retained historical material under ADR-0013. | Preserve the single-version architecture and existing URLs. |
| Length | EDITORIAL.md explicitly has no word/time target and allows two- or ten-minute lessons. | A five-minute reading target is a deliberate editorial change, not current policy. This assessment does not repeat unverified catalogue word-count statistics. |
| Placement | Presentation metadata has one optional figure; the reading page splits prose once around it. | Multiple visuals need schema, validation, placement and renderer changes. |
| Diagrams | Six structured diagram types plus the raster image type. Older process/cycle styles require four steps. Newer concept-flow supports sequences of 2–4 stages, cycles of 3–4, and a three-node branch. | The toolkit is less restrictive than the earlier “all flows have four steps” description, but still cannot express arbitrary custom illustrations. |
| Images | Local PNG/WebP; 500 KiB each, 2400 pixels per dimension, 4 million pixels. Automated candidates allow two new assets and 1 MiB combined. | Rich generated artwork can already be delivered as a raster. Expanding the number of visuals needs coordinated changes, rather than merely new writing instructions. |
| Provenance | Persistent imageRights records allow generated, original-code and licensed origins; currently at most two records. | Extend the record count and asset naming alongside figure support. Keep evidence checks. |
| Trust boundary | No lesson-authored SVG, HTML, remote images or executable drawing instructions. Application-owned diagrams already use SVG. | Attractive visuals do not require allowing arbitrary SVG in lessons. |
| Review | Exact-head rendered inspection, source checks, geometry tests and browser image decoding are already required. | Retain these and add explicit aesthetic judgement. |
| Discovery | Homepage already says “Something worth knowing”, includes dates and an Earlier section. No RSS route appears in the inspected page tree. | Preserve the heading; add a weekly promise and return channel. |
| Measurement | Aggregate event analytics and feedback exist. The event contract includes no completion, longitudinal return or recall-answer measurement. | Use feedback and small reader trials first; avoid expanding tracking for the pilot. |
| Activities | Open issue #186 preserves 23 historical prediction activities and requests a reviewed migration. | Propose assessing each when its lesson is renewed, keeping the full inventory and explicit dispositions. The issue has not been changed. |
| Automation | Live lookup returned the Publisher, legacy Reviewer and catalogue migration disabled. Publisher retains the 17-opportunities-per-day schedule and lightweight-entry prompt. | They were already paused when inspected. This assessment changed no task state and did not establish why they were paused. Recheck at cutover. |

The inspected editorial standard is approximately 4,732 whitespace-separated words, the task contract 10,414 and pipeline guide 1,953: about 17,100 together, excluding other policies. The rewrite should reduce duplication, not replace the same material with several equally long documents.

## 1. Editorial experience

**Reader:** a curious adult with general education and no specialist knowledge, including someone with intermediate English.

**Voice:** curious, direct and warm. Start with a concrete situation or question. Make the reasoning visible. Explain necessary terms naturally. Avoid forced excitement, textbook language, unexplained idioms and a patronising tone. Use British English suitable for international readers.

**Length:** initially aim for 500–700 words of main prose. This is a working range, not an automatic rejection threshold. Assess the complete experience, including captions, diagrams and optional thinking time, with non-native readers. Trim repetition before cutting an essential causal step; do not add words merely to reach 500.

**Shape:** an honest hook, an explanation that builds, one central insight and a satisfying payoff. Vary the structure. Keep the existing recall-before-takeaway interaction. Prediction activities are optional and must improve the explanation rather than duplicate recall.

**Topics:** rank by curiosity, explanatory payoff, visual opportunity and strength of evidence. Visual opportunity includes a compelling scene or comparison, not only a diagram. Apply feasibility and current topic-safety boundaries as eligibility checks. Manage subject variety and seasonality across the ranked queue. Keep one durable pool with provisional dates on its leading entries; no parallel calendar database.

**Existing lessons:** retain sound content, feature the strongest and renew weaker lessons through the backlog. A major redevelopment may take the weekly slot, normally at most once in four releases, and must be visibly labelled updated. “Major” means materially improved explanation or substantive teaching visuals, not a wording polish or replacement cover. Urgent corrections remain separate and must not wait for that slot.

## 2. Visual direction: custom artwork with explanatory purpose

The target is the quality of an illustrated editorial feature. Enlarging the current diagram templates alone will not achieve it.

Use three complementary forms:

| Form | Purpose | Production approach |
| --- | --- | --- |
| Custom editorial illustration | Establish the puzzle, reveal a memorable situation or make an abstract idea tangible. | Built-in image generation, with a lesson-specific art brief and visual inspection. |
| Explanatory diagram | Show a mechanism, scale, sequence, geometry or comparison precisely. | Deterministic drawing/plotting or reviewed application components; exact labels and quantities under direct control. |
| Combined treatment | Connect an evocative scene to a precise explanation. | Generated scene plus separately controlled labels or diagram panels, assembled and reviewed together. |

An opening illustration may earn its place through curiosity, atmosphere and a memorable scene; it need not encode the complete mechanism. A diagram must explain its intended relationship clearly. Distinguishing these roles avoids judging every illustration as a failed diagram.

**Initial art direction:** thoughtful editorial illustration, with deliberate composition, restrained colour, strong contrast and enough texture or depth to feel distinctive. Use detailed scenes, cutaways or comparisons when the subject benefits. Keep a recognisable palette, caption treatment and level of finish while allowing variation between subjects. Avoid generic stock imagery, unrelated spectacle and repeated icon-and-arrow layouts.

Prepare a compact art brief before drafting: what the reader should notice, the intended feeling, the relationship to the explanation, factual constraints, composition and phone layout. Aesthetic quality is part of publication quality.

**Expected package:** usually one custom lead illustration and, where useful, one or two explanatory visuals. Support up to three total visuals. This is capacity, not a compulsory count. A lesson may use fewer if the result is stronger; a missing generation capability must not silently become permission to publish a visually weak substitute.

Keep essential labels outside generated imagery where practical. Never treat generated geometry, anatomy, scale, graphs or lettering as reliable evidence. Mark conceptual scenes and not-to-scale schematics when needed; avoid implying invented scenes are documentary photographs.

Inspect the complete page at 320, 393 and 1440 pixels, in light/dark modes, with no-JavaScript reading and mobile WebKit checks. Check composition, legibility, contrast, cropping, factual details, decoding and surrounding text. Supply suitable alt text and equivalent explanations for teaching diagrams. Keep the prose understandable when an image cannot load.

## 3. Visual capability options

Effort below is relative code impact, not a time or monetary quotation.

| Option | Impact | Assessment |
| --- | --- | --- |
| Keep the single image slot; improve artwork only | Lowest: new assets and editorial process. | Useful for an early art trial, but insufficient as the final weekly experience. |
| Up to three positioned visuals, custom raster artwork and existing/app-owned diagrams | Medium: schema, loader, guard, rights records, naming, placement, components and tests. | **Recommended first implementation.** Substantial artistic freedom with a familiar static delivery model. |
| Permit lesson-authored SVG | Higher: a new input format and security/validation work, plus rendering and accessibility checks. | Defer unless the pilot demonstrates a specific unmet need. High-quality vector originals can be exported to supported raster formats meanwhile. |
| Add arbitrary interactive embeds or animation | Higher ongoing scope, testing and accessibility cost. | Outside the first transition. Consider only for a demonstrated learning benefit. |

Proposed initial technical contract:

- Add a bounded figures collection with stable IDs, roles and paragraph positions. Support the existing singular figure field for unchanged lessons, but reject simultaneous old/new fields. Decide explicit schema versioning in the implementation ADR.
- Validate positions against real prose paragraphs; define stable ordering for shared positions and reject duplicate IDs. Keep placement structured rather than inserting executable markup into Markdown.
- Allow at most three distinct local raster assets and matching provenance records. Extend slug-owned filenames with bounded visual identifiers and revision-safe names. Preserve old assets used by existing releases.
- Initially keep 500 KiB per image and the existing dimension/pixel caps; allow 1.5 MiB aggregate for three assets. These are ceilings, not targets. Test compression against the pilot before accepting them; propose any necessary increase with visual and performance evidence.
- Produce optimised WebP where suitable; reserve layout space with dimensions and load below-fold artwork lazily. Test phone-width readability without requiring zoom.
- Extend all content consumers and exact-head screenshot coverage, not only the lesson page. Preserve strict metadata stripping, regular-file checks, local ownership and container validation.
- Preserve immutable IDs, current canonical URLs, route ownership and historical dates. No database, paid service or runtime image API is required by this option.

**Capability gate:** image generation is available in this interactive session, but this assessment has not proved that the scheduled execution environment can generate, obtain local asset bytes, optimise and submit them within the existing subscriptions. Test that complete path before promising autonomous weekly illustrations. Do not introduce a paid API or subscription as an implicit fallback. If unavailable, use a documented owner-assisted artwork preparation step or leave activation blocked for a decision.

Record the generation method, prompt/reference provenance and reviewable output evidence. Describe the applicable usage basis accurately; do not claim guaranteed exclusivity, copyright protection or commercial clearance from generation alone.

## 4. Weekly production and review

**Proposed schedule, for approval:** Friday availability by 06:00 Europe/Zurich. Reuse one Publisher with three weekly opportunities at 05:00 on Monday, Wednesday and Friday. The shared hour permits a simple weekly schedule without daily polling. Dates and times are provisional until approved.

| Opportunity | Work |
| --- | --- |
| Monday | Select topic, research, plan visuals, prepare the complete draft and artwork, submit a reviewable candidate. |
| Wednesday | Separate review of sources, explanation, visuals and mobile experience; revise concrete findings and collect any available Owner/external feedback. |
| Friday | Fresh final review of the current head, current sources where needed, required checks, guarded merge and deployment verification. Aim for 06:00 availability. |

A task may continue eligible repair/review work within its execution capacity. Pending work becomes a durable checkpoint. No hourly polling and no automatic recreation of a rejected candidate. If Friday cannot finish safely, report the specific blocker once and resume through an authorised manual run or the next scheduled opportunity. Do not invent a new schedule to conceal a miss.

Drafts must survive across the week. Replace same-day expiry and immutable premature release timestamps with explicit candidate identity, target release and actual publication time. The implementation must specify how dates are finalised and validated before the last review; no date changes after approval. Postponement keeps a truthful history.

**Review limits:** allow two consolidated editorial revision rounds per weekly candidate. A round means a substantive revision following a recorded review, not every local edit. At the limit, unresolved substantive disagreement goes to the Owner; publication waits. Any changed head invalidates earlier publication approval and needs fresh applicable checks/review. A factual, privacy or security failure is never waived by the time budget.

Reviewers identify the failed criterion, the passage/visual and a concrete remedy. Block publication for unsupported or wrong material claims, a missing central causal step, a misleading visual, an inaccessible central explanation, a broken reader experience, or a materially unmet visual/editorial standard. Aesthetic objections must name the observable problem and remedy. Minor stylistic preferences do not block.

During calibration, the Owner reviews the pilot and initial releases. Reassess mandatory involvement after three consecutive lessons need no substantive Owner changes. This is a review point, not an automatic transfer of authority. The Owner retains final say on taste.

Preserve separate Writer and Reviewer execution, honest disclosure of same-provider review, and current different-provider requirements for architecture, schema and publication changes. Do not assume that naming a reviewer authenticates independence.

## 5. Daily-system responsibility inventory

“Keep” preserves the responsibility; “simplify” changes its mechanism under reviewed rules; “drop” removes a daily-specific obligation. No row itself grants implementation authority.

| Existing responsibility | Decision | Weekly treatment and reason |
| --- | --- | --- |
| Current-main policy loading; untrusted input handling | Keep | Candidate text, feedback and external pages remain data, not authority. |
| Off switch and paused-task controls | Keep | Stop before authoring or publication; preserve a simple emergency pause. |
| Lightweight completion entry | Simplify | Check the weekly release/checkpoint, not today's lesson; avoid full work after verified completion. |
| Seventeen daily dispatches | Drop | Replace with three purposeful weekly opportunities. |
| Midnight preparation, 02:00 review boundary, 14:00 cutoff | Drop | Replace with stage permissions and the weekly target. |
| One-per-day release slot and same-day expiry | Simplify | One weekly release slot; resumable candidate across days; explicit postponement. |
| Actual clock, timezone and clock-change handling | Keep | Europe/Zurich for targets; truthful timestamps. |
| Candidate discovery, duplicate checks and one active candidate | Keep | Resume actual work before creating anything new. |
| Evergreen/topic/source eligibility | Keep | Cadence does not itself broaden allowed subject risk. |
| Ranked selection and rationale | Keep | Selection remains reviewable and grounded in the catalogue. |
| Daily full-pool reranking and same-day assessment dates | Simplify | Refresh once per production cycle or on material new evidence. |
| Queue preservation, completion and duplicate protection | Keep | No lost records or completion before actual publication. |
| Daily queue additions/shortfall reporting | Simplify | Maintain a useful shortlist without forced weekly idea generation. |
| Clear-English self-edit and causal explanation | Keep | Rewrite into positive, concise editorial criteria. |
| Figure/activity assessment | Simplify | A planned visual package; optional useful activities; no template-first preference. |
| Asset scope, byte/container and provenance checks | Keep | Extend explicit bounds for three visuals under the reviewed new contract. |
| Trusted-main submission preflight and generated branch rules | Keep | Catch malformed submissions before remote CI. Adapt date/asset rules. |
| baseline, e2e, lesson-guard and privacy checks | Keep | Retain exact-head success and workflow-provenance verification. |
| Source and exact-head rendered inspection | Keep | Review artwork and complete reading experience, not metadata alone. |
| Writer/Reviewer role separation | Keep | Writer cannot turn its draft assessment into publication approval. |
| Advisory feedback retrieval and final refresh | Keep | Address substantive available feedback; absent optional reviewers do not block by themselves. |
| Delegate hand-off, overlap and interruption reconciliation | Simplify | Retain bounded ownership, fresh review context and real outcome evidence; consolidate duplicate ledgers where equivalent protection is demonstrated. |
| Execution-failure retry cap | Keep | One mitigated retry of the same cause, then diagnosis; no unchanged repeat attempts. |
| Three daily revision rounds and daily reservation ledger | Simplify | Two consolidated weekly rounds, durable head-linked history and escalation. |
| Immutable identity, provenance and prior dates | Keep | Target publication date is distinct from those immutable facts. |
| Stale-base handling | Simplify | Permit a documented normal refresh onto current main, stop on conflicts, verify scope and rerun checks/review. No silent force rewrite or stale approval. |
| Reviewer does not edit lesson content | Keep | Findings return to the Writer. |
| Expected-head merge and no saved-approval shortcut | Keep | Recheck actual head, base, slot, findings and checks immediately before merge. |
| Post-merge checks, deployment/live-route verification | Keep | Distinguish merged from demonstrably published. |
| Separate technical-recovery PRs and excluded high-risk repairs | Keep | A lesson run cannot widen its own permissions or weaken gates. |
| Technical retry/repair budgets tied to a day | Simplify | Bind documented budgets to the weekly candidate/incident; no reset on a new day. |
| Two failed-day queue parking | Simplify | Escalate after the bounded failed candidate cycle; retain a blocker and explicit return criteria. |
| Corrections outside routine candidate work | Keep | Prompt factual corrections need their normal reviewed path. |
| Anonymous feedback, aggregate analytics and privacy | Keep | Use existing facilities without additional personal tracking. |
| Branch cleanup | Keep | Disposable branches still have a defined lifecycle. |
| Activation, prompt readback, audits and rollback | Simplify | One concise canonical weekly contract, verified configuration, one documented rollback path. Do not re-enable daily publication as an unapproved rollback. |
| Historical timing amendments and duplicate role instructions | Drop | Archive history in Git; remove superseded active instructions after checking references. |

## 6. Return visits, disclosure and catalogue

Add a static RSS feed and a visible subscribe link; use stable lesson IDs, truthful publication/update dates and a deliberate policy for major revisions versus minor corrections. Retain “Something worth knowing”; show the release date and agreed weekly schedule separately. Consider a reusable illustration thumbnail on the featured lesson, with explicit cropping/alt behaviour, as part of the visual integration.

Use a short, accurate AI disclosure linked to a fuller production explanation. Initial wording should state that AI tools help research, write and illustrate lessons and that sources and visuals are checked before publication. Describe AI versus human review truthfully; never imply weekly human approval where none occurred.

For the pilot, invite 3–5 readers, including non-native English speakers. Ask what they understood, what confused them, whether a visual helped and what they remember the next day. This is evidence gathering, not a permanent weekly dependency or a claim of representative research.

Keep the activity inventory in #186. Proposed change: review activities alongside each lesson's renewal, retain the commitment to account for all 23, and record each migration or reasoned disposition. Do not silently abandon the preservation decision.

## 7. Delivery sequence and acceptance

1. Review this proposal and settle the weekly timing and visual approach.
2. Perform the image-generation-to-local-asset capability trial. Prepare an initial style reference and small technical visual fixture; this is not the public pilot lesson.
3. Implement the bounded visual foundation and its ADR through the applicable mandatory review. Verify backward compatibility, hostile-input limits, multiple placements, all-image rendering, mobile WebKit/no-JavaScript behaviour and asset performance.
4. Produce the complete pilot within the ordinary tool budget. Independently review it and gather the Owner's and available readers' feedback. Record actual production effort and generation attempts so repeatability can be judged.
5. Derive a concise editorial standard, including its visual appendix, from the pilot. Aim for roughly 1,500–2,500 words. Keep one operational weekly contract, with safeguards referenced rather than repeated.
6. Implement cadence, date/slot changes, RSS and affected instructions/tests through reviewed PRs. Reconcile open candidates before cutover. Update #186 only under the accepted direction.
7. Read back the final task prompt, schedule, timezone and enabled states. Verify a full weekly cycle and live page before declaring transition complete.

No code, schedule or policy change is activated by accepting the general direction alone. Implementation follows normal governance with reviewable concrete changes. Publication should remain paused during an incomplete cutover; existing tasks must not be re-enabled merely because this proposal is accepted.

**Decisions requested:** approve or amend the illustrated-publication direction, the three-visual raster-first foundation, the provisional Friday 06:00 target/three weekly opportunities, and the review limits. The pilot topic and final style are selected next, before pilot production.

## Evidence map

All repository links are pinned to the assessed commit.

- [Editorial standard](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/EDITORIAL.md)
- [Publication contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/automation/publication-task-contracts.md) and [lightweight entry](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/automation/publication-entry.md)
- [Ranked pipeline](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/editorial-pipeline.md)
- [Presentation extension schema](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/content/presentation-extensions.ts), [canonical schema](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/content/schema.ts), and [reading page](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/pages/%5Bedition%5D/%5Bslug%5D.astro)
- [Toolkit contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/toolkit-contract.mjs), [raster limits](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/raster.mjs), [rights validation](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/image-rights.mjs), and [trusted guard](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/scripts/lesson-guard-core.mjs)
- [CI](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/.github/workflows/ci.yml), [homepage](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/pages/index.astro), and [analytics contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/analytics/contracts.ts)
- [Single-version decision](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/adr/0013-single-lesson-version.md) and [activity preservation issue #186](https://github.com/nunov00/five-minutes/issues/186)
- Live automation lookup on 22 October 2026: Publisher, legacy Reviewer and catalogue migration disabled; no configuration changes made.

