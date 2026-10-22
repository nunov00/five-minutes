# Five Minutes: weekly publication proposal
**Stage 1 — repository assessment and proposed decisions. 22 October 2026.**

Status: for Owner and independent review. Revised following the Perplexity Computer reviews (Claude Opus/Anthropic) of heads 59f2999f and 31a4325d. This document proposes changes; it does not change editorial policy, code, issues, scheduled tasks or production.

## Recommended direction

Make Five Minutes a weekly illustrated publication: one clear explanation, an appealing visual experience, and an insight readers can remember and share. Custom illustrations should be a normal production option, rather than a fallback after exhausting generic diagrams.

Calibrate the approach with one representative pilot, then test repeatability with a second lesson under normal weekly constraints. Establish the visual capabilities first. Finalise the editorial standard only after both stages provide the evidence described in section 5.

**Reader promise:** “Understand the surprising reasons behind the world around you—in five minutes, with clear English and visuals that make the explanation stick.”

## Decisions at a glance

These are proposed defaults for Owner decision, not activated policy:

- **Product:** one illustrated lesson a week for curious adults, with clear international English and one memorable explanation. Aim for about 4–6 minutes including visuals and recall; 500–700 words is guidance, not a limit.
- **Visual foundation:** up to three positioned visuals, normally a custom lead illustration with precise diagrams where useful. Include illustrated discovery cards and sharing previews, while preserving local assets, provenance, validation and mobile accessibility.
- **Transition:** first calibrate one lesson and the style kit; then make a second lesson under the frozen kit and ordinary production limits. Freeze the standard after that repeatability test, not after an unusually polished showpiece.
- **Schedule:** provisionally Monday/Wednesday/Friday opportunities at 05:00 Europe/Zurich, aiming for Friday 06:00 availability. Prepare briefs ahead; Wednesday is the main review/Owner window. There is no hourly polling.
- **Budgets:** provisionally six generation requests per normal candidate, at most four for the lead and two for any other generated visual, plus two editorial revision rounds. Calibration has a separate finite budget: twelve requests total, at most six for the lead, and three revision rounds. Use the calibration evidence to accept or revise normal limits before the second lesson; never raise them retrospectively to claim success.
- **Slips:** capacity, dispatch or missing-feedback delays carry the same unfinished candidate into the next week's Friday slot, with remaining budgets intact; skip new-topic drafting. Editorial blocks at the round limit require an Owner decision. Reconcile deployment incidents before doing anything new.
- **Owner and readers:** seek five readers for calibration, using honest directional learning/interest targets. Keep initial Owner review; allow declared absence windows. Reduced reader evidence or excess calibration work needs an explicit provisional decision, not a fabricated pass. Reassess routine Owner involvement after three consecutive lessons need no substantive changes.

## What the assessment established

Assessment is pinned to main commit **15724378d9cc459e28b46b36a04fe382bd4d12ac**. Links below refer to that snapshot. Repository rules and live automation configuration were read; no builds, tests, deployment or image-generation experiments were run for this assessment.

| Area | Verified position | Implication |
| --- | --- | --- |
| Published version | One active presentation from lesson.yaml and adult.md; teen.md is retained historical material under ADR-0013. | Preserve the single-version architecture and existing URLs. |
| Length | EDITORIAL.md explicitly has no word/time target and allows two- or ten-minute lessons. The reviewer reports a 248-word median across 32 adult.md bodies (135–529 words), using wc -w. That catalogue statistic has not been independently reproduced in this assessment. | The proposed 500–700 words would be a substantial production and catalogue change. Measure pilot reading time rather than inferring it from word count. |
| Placement | Presentation metadata has one optional figure; the reading page splits prose once around it. | Multiple visuals need schema, validation, placement and renderer changes. |
| Diagrams | Six structured diagram types plus the raster image type. Older process/cycle styles require four steps. Newer concept-flow supports sequences of 2–4 stages, cycles of 3–4, and a three-node branch. | The toolkit is less restrictive than the earlier “all flows have four steps” description, but still cannot express arbitrary custom illustrations. |
| Images | Local PNG/WebP; 500 KiB each, 2400 pixels per dimension, 4 million pixels. Automated candidates allow two new assets and 1 MiB combined. | Rich generated artwork can already be delivered as a raster. Expanding the number of visuals needs coordinated changes, rather than merely new writing instructions. |
| Provenance | Persistent imageRights records allow generated, original-code and licensed origins; currently at most two records. | Extend the record count and asset naming alongside figure support. Keep evidence checks. |
| Trust boundary | No lesson-authored SVG, HTML, remote images or executable drawing instructions. Application-owned diagrams already use SVG. | Attractive visuals do not require allowing arbitrary SVG in lessons. |
| Review | Exact-head rendered inspection, source checks, geometry tests and browser image decoding are already required. | Retain these and add explicit aesthetic judgement. |
| Discovery and sharing | Homepage already says “Something worth knowing”, includes dates and an Earlier section. No RSS route appears in the inspected page tree. BaseLayout.astro has ordinary title/description/canonical metadata but no Open Graph or Twitter card tags. | Preserve the heading; add a weekly promise, RSS, illustrated cards and explicit share metadata. Link-preview appearance still depends on the receiving service. |
| Measurement | Aggregate event analytics and feedback exist. The event contract includes no completion, longitudinal return or recall-answer measurement. | Use feedback and small reader trials first; avoid expanding tracking for the pilot. |
| Activities | Open issue #186 preserves 23 historical prediction activities and requests a reviewed migration. | Propose assessing each when its lesson is renewed, keeping the full inventory and explicit dispositions. The issue has not been changed. |
| Automation | Live lookup returned the Publisher, legacy Reviewer and catalogue migration disabled. Publisher retains the 17-opportunities-per-day schedule and lightweight-entry prompt. | They were already paused when inspected. This assessment changed no task state and did not establish why they were paused. Recheck at cutover. |

The inspected editorial standard is approximately 4,732 whitespace-separated words, the task contract 10,414 and pipeline guide 1,953: about 17,100 together, excluding other policies. The rewrite should reduce duplication, not replace the same material with several equally long documents.

## 1. Editorial experience

**Reader:** a curious adult with general education and no specialist knowledge, including someone with intermediate English.

**Voice:** curious, direct and warm. Start with a concrete situation or question. Make the reasoning visible. Explain necessary terms naturally. Avoid forced excitement, textbook language, unexplained idioms and a patronising tone. Use British English suitable for international readers.

**Reading time:** aim for about 4–6 minutes for an intermediate-English reader, including visuals and the recall question. Use 500–700 words of main prose as an initial rule of thumb, not a minimum or maximum: length follows the subject. Measure the whole experience with non-native readers rather than deriving a pass from an assumed reading speed. Trim repetition before cutting an essential causal step; do not add words merely to reach 500.

**Memory brief:** before drafting, write the central insight in one short sentence (aim for at most 25 words), the starting expectation or misconception if one genuinely exists, and the idea a reader could retell to a friend. The insight and retell sentence may be the same; do not invent a misconception or fill three boxes mechanically. Define the essential causal step and acceptable paraphrases for the recall test in advance.

**Title and description:** make an honest, specific promise that earns curiosity and is fulfilled by the explanation. The description adds useful information rather than repeating the title. Review them explicitly as the first impression on the site and in a shared link.

**Shape:** an honest hook, an explanation that builds, one central insight and a satisfying payoff. Vary the structure. Keep the existing recall-before-takeaway interaction. Prediction activities are optional and must improve the explanation rather than duplicate recall.

**Topics:** rank by curiosity, explanatory payoff, visual opportunity and strength of evidence. Visual opportunity includes a compelling scene or comparison, not only a diagram. Apply feasibility and current topic-safety boundaries as eligibility checks. Manage subject variety and seasonality across the ranked queue. Keep one durable pool with provisional dates on its leading entries; no parallel calendar database.

**Existing lessons:** retain sound content, feature the strongest and renew weaker lessons through the backlog. Judge older lessons against the new reading experience when choosing featured material; shorter length alone is not a defect. Prioritise renewals where deeper explanation or better artwork materially improves understanding. Do not pad the catalogue for uniformity. A major redevelopment may take the weekly slot, normally at most once in four releases, and must be visibly labelled updated. “Major” means materially improved explanation or substantive teaching visuals, not a wording polish or replacement cover. Urgent corrections remain separate and must not wait for that slot.

## 2. Visual direction: custom artwork with explanatory purpose

The target is the quality of an illustrated editorial feature. Enlarging the current diagram templates alone will not achieve it.

Use three complementary forms:

| Form | Purpose | Production approach |
| --- | --- | --- |
| Custom editorial illustration | Establish the puzzle, reveal a memorable situation or make an abstract idea tangible. | Built-in image generation, with a lesson-specific art brief and visual inspection. |
| Explanatory diagram | Show a mechanism, scale, sequence, geometry or comparison precisely. | Deterministic drawing/plotting or reviewed application components; exact labels and quantities under direct control. |
| Paired illustration and explanation | Connect an evocative scene to a precise explanation. | For the pilot, use captions and separately controlled diagrams outside the generated image. Defer a composited label-overlay component until a demonstrated need justifies it. |

An opening illustration may earn its place through curiosity, atmosphere and a memorable scene; it need not encode the complete mechanism. A diagram must explain its intended relationship clearly. Distinguishing these roles avoids judging every illustration as a failed diagram.

**Initial art direction:** thoughtful editorial illustration, with deliberate composition, restrained colour, strong contrast and enough texture or depth to feel distinctive. Use detailed scenes, cutaways or comparisons when the subject benefits. Keep a recognisable palette, caption treatment and level of finish while allowing variation between subjects. Avoid generic stock imagery, unrelated spectacle and repeated icon-and-arrow layouts.

Before the pilot, produce a small **style kit**: palette hex values aligned with the site's existing tokens; 3–5 approved reference images with recorded provenance and permitted reference use; a reusable prompt style block; in-article, card and sharing aspect ratios with safe crop zones; and a no-lettering-in-generated-art default. The kit is a production deliverable, not a new long policy document. Review references and the pilot together before fixing the style. Check each subsequent lesson against the last three releases where available. Recognisable composition and subject-specific detail should prevent a generic, interchangeable AI appearance.

Prepare a compact art brief before drafting: what the reader should notice, the intended feeling, the relationship to the explanation, factual constraints, composition and phone layout. Plan for the in-article view, card thumbnail and approximately 1.91:1 share crop without cutting away the explanatory subject. Aesthetic quality is part of publication quality.

**Expected package:** usually one custom lead illustration and, where useful, one or two explanatory visuals. Support up to three total visuals. This is capacity, not a compulsory count. A lesson may use fewer if the result is stronger; a missing generation capability must not silently become permission to publish a visually weak substitute.

**Labels and themes:** prefer theme-aware app-owned components for precise diagrams when they suit the explanation, without forcing the subject into an unsuitable template. Raster diagrams use an intentional card/background treatment that is inspected in both themes; never automatically invert artwork. Keep labels in real page text where practical. Any necessary raster lettering is deterministically drawn, has at least a 14 CSS-pixel equivalent at the actual 320-pixel viewport content width, and is repeated meaningfully in the accessible description or adjacent text. A numerical size check does not replace visual/readability review. Split a dense diagram rather than shrinking labels. Colour alone must not carry an essential distinction.

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
- Allow at most three distinct local **source** raster assets and matching provenance records. Extend slug-owned filenames with bounded visual identifiers and revision-safe names. Preserve old assets used by existing releases.
- Initially keep 500 KiB per image and the existing dimension/pixel caps; allow 1.5 MiB aggregate for three assets. These are ceilings, not targets. Test compression against the pilot before accepting them; propose any necessary increase with visual and performance evidence.
- Produce optimised WebP where suitable; reserve layout space with dimensions and load below-fold artwork lazily. Test phone-width readability without requiring zoom.
- Include illustrated featured/Library cards and per-lesson Open Graph title, description, canonical URL, image and image alternative, plus Twitter card metadata. Derive one thumbnail and a 1200×630 share image from the designated lead source; use a local publication fallback for older/text-only lessons. Encode absolute production URLs and avoid metadata on noindex/redirect pages that falsely presents them as canonical articles.
- Select the share format during the capability trial using the actual textured lead illustration: compare PNG and JPEG for size, visible quality and representative preview compatibility. Prefer PNG when it meets the 500 KiB output ceiling without poor quality; allow a build-generated, metadata-stripped JPEG otherwise. Flatten transparency onto the approved background explicitly. Do not rely on WebP for sharing without compatibility evidence. Authored inputs remain PNG/WebP under the existing parser; JPEG is a separately validated trusted-build derivative, not a broadened lesson-input format. Test its MIME/extension, dimensions, decoding, local path and output bounds.
- Generate these two derivatives through trusted build tooling, not candidate scripts or extra generation requests. They do not consume two additional authored-visual slots. Bound outputs separately: one thumbnail up to 120 KiB and one share image up to 500 KiB per lead, within the existing dimension/pixel caps. Validate paths, decoding and exact expected output set, retain source provenance, and count derivatives in delivery-capacity checks. Any additional derivative needs an explicitly reviewed contract change. Test cropping and local image availability; external preview caching/selection cannot be guaranteed.
- Extend all content consumers and exact-head screenshot coverage, not only the lesson page. Preserve strict metadata stripping, regular-file checks, local ownership and container validation.
- Preserve immutable IDs, current canonical URLs, route ownership and historical dates. No database, paid service or runtime image API is required by this option.

**Capability gate:** image generation is available in this interactive session, but this assessment has not proved that the scheduled execution environment can generate, obtain local asset bytes, optimise and submit them within the existing subscriptions. Test that complete path before promising autonomous weekly illustrations. Do not introduce a paid API or subscription as an implicit fallback. If unavailable, use a documented owner-assisted artwork preparation step or leave activation blocked for a decision.

**Provisional normal attempt budget:** six image-generation requests per candidate in total, with at most four for the lead illustration and at most two for each other generated visual, subject to the shared six-request ceiling. This lets the most important artwork use more of the budget; deterministic diagrams do not consume generation requests. Accept or amend these limits using recorded calibration effort before the repeatability lesson begins.

**Separate calibration budget:** the initial pilot may use up to twelve requests in total, at most six for the lead, and three editorial revision rounds. This is a proposed finite one-off envelope, not a claim of ordinary weekly repeatability. It can use planned interactive calibration sessions rather than the three production opportunities. Record all style-kit, capability-trial and reference-generation requests as setup work separately; agree any additional setup allowance before using it. Do not hide setup work in the repeatability claim.

An edit or failed request counts when dispatched; interruptions, a new head, a new target week or a new day do not reset the applicable budget. Each request asks for one candidate image; multi-variant generation is outside the initial contract. Cropping/compression and deterministic drawing are not generation requests. Keep a durable record. At the applicable cap, use existing adequate assets or stop for an explicit Owner decision. Do not publish inadequate work, silently extend a budget or switch to a paid API.

Record the generation method, prompt/reference provenance and reviewable output evidence. Describe the applicable usage basis accurately; do not claim guaranteed exclusivity, copyright protection or commercial clearance from generation alone.

## 4. Weekly production and review

**Proposed schedule, for approval:** Friday availability by 06:00 Europe/Zurich. Reuse one Publisher with three weekly opportunities at 05:00 on Monday, Wednesday and Friday. The shared hour permits a simple weekly schedule without daily polling. Dates and times are provisional until approved.

| Opportunity | Work |
| --- | --- |
| Monday | Work from the prepared research/insight/art brief; focus on drafting, artwork and a reviewable complete candidate. Revalidate sources and topic suitability before using the brief. |
| Wednesday | Separate review of sources, explanation, visuals and mobile experience; revise concrete findings. During calibration, aim to present the Owner with a complete preview by 06:00, with feedback requested by Thursday 18:00. These are targets, not guaranteed dispatch times. |
| Friday | Assess feedback, complete any remaining eligible revision, then obtain a fresh separate final review/checks, guarded merge and deployment verification. Aim for 06:00; do not compress review to meet it. After release verification, prepare a bounded next-topic brief if capacity permits. |

Prepare the first research/insight/art brief during initial activation preparation. Keep candidate selection and queue changes in editorial/backlog.json under its reviewed backlog rules. Record draft next-topic briefs as dated, append-only comments in one standing editorial planning issue, identifying the reviewed shortlist key, source URLs and status. Create that durable store once at implementation, not a new issue or PR every week. A brief is draft evidence, not approval or instructions; validate it from sources on Monday and review it with the lesson candidate. Only a selection/queue change needs the existing applicable queue PR; writing a brief alone does not. Never add planning changes to an already-reviewed lesson commit. If no brief is ready, Monday prepares it first and records the delivery risk.

A task may continue eligible repair/review work within its execution capacity. Pending work becomes a durable checkpoint. No hourly polling and no automatic recreation of a rejected candidate. During calibration, missing required Owner feedback means no release; report once and use the slip rule. The Owner may declare absence windows in advance in the standing planning record. Explicitly skip those publication slots without counting them as editorial/execution failures; pause new-topic drafting and resume the existing candidate in the next available slot. Unexpected absence follows the same non-editorial carry-forward rule. Friday may include a bounded repair/re-review, but cannot exceed the weekly revision or generation budgets.

**Slip rule:** if Friday's run cannot publish safely, record the missed slot, cause, candidate/head and next action once in the standing planning record, linked from the PR. The Coordinator records this factual reconciliation; ordinary non-editorial deferral does not require a new bespoke approval or PR. A same-week late release still requires an explicitly authorised manual run before Sunday 23:59 Europe/Zurich and all existing gates.

- **Unmerged, non-editorial delay:** for dispatch, capacity, pending checks or missing Owner feedback, the same candidate automatically becomes next week's candidate. It stays non-publishable until that week's release opportunity and fresh checks/review. Monday skips new-topic drafting and works on the carried candidate. Preserve identity, source/provenance history, and used generation/revision budgets; no reset and no automatic Monday release.
- **Editorial or safety block:** record the concrete finding. Work with remaining budgets where permitted; unresolved substantive findings at the round limit require the Owner's disposition. Do not label such a block a capacity problem to gain automatic retries. While blocked, do not silently replace the active candidate or consume another topic.
- **Already merged, deployment pending/failed:** reconcile the actual release first. Recovery of the same merged artifact is deployment recovery, not a second editorial release. Record when it actually becomes live and count it once in that Zurich week; if that occupies the next week's slot, do not add another routine release. If production already succeeded despite an interrupted report, reconcile it rather than duplicate it.
- **Repeated unchanged cause:** retain execution-failure caps and no-repeat checkpoints across weeks. Carry-forward preserves work and scheduling ownership; it does not authorise infinite generation, repairs or repeated failed reviewer dispatches. Recurrent blocked causes escalate once for diagnosis.

No candidate is abandoned or assigned a fresh budget merely because the calendar changes. The implementation ADR must specify the exact slot IDs, automatic carry-forward record, release-date finalisation, deployment reconciliation and repeated-failure handling. Future target-date changes are recorded before final approval, never by backdating publication.

Drafts must survive across the week. Replace same-day expiry and immutable premature release timestamps with explicit candidate identity, target release and actual publication time. The implementation must specify how dates are finalised and validated before the last review; no date changes after approval. Postponement keeps a truthful history.

**Review limits:** allow two consolidated editorial revision rounds per normal candidate, including any carry-forward weeks; the initial calibration pilot has its separate three-round envelope. A round means a substantive revision following a recorded review, not every local edit. At the limit, unresolved substantive disagreement goes to the Owner; publication waits. Any changed head invalidates earlier publication approval and needs fresh applicable checks/review. A factual, privacy or security failure is never waived by the time budget.

Reviewers identify the failed criterion, the passage/visual and a concrete remedy. Block publication for unsupported or wrong material claims, a missing central causal step, a misleading visual, an inaccessible central explanation, a broken reader experience, or a materially unmet visual/editorial standard. Aesthetic objections must name the observable problem and remedy. Minor stylistic preferences do not block.

During calibration, the Owner reviews the pilot, the repeatability lesson and initial releases. Reassess mandatory involvement after three consecutive lessons need no substantive Owner changes. This is a review point, not an automatic transfer of authority. The Owner retains final say on taste.

Preserve separate Writer and Reviewer execution, honest disclosure of same-provider review, and current different-provider requirements for architecture, schema and publication changes. Do not assume that naming a reviewer authenticates independence.

## 5. Calibration and repeatability evidence

**A. Calibration pilot:** use the separate finite calibration budget in section 3 to explore the style, revise the teaching and evaluate understanding, interest, visual quality and reading time. Record effort without pretending this exploratory production fits the normal weekly budget. Agree the calibrated style kit and provisional editorial criteria before stage B.

Aim for five readers, including non-native English speakers and at least one person without a science/technical background. Before reading, ask what the opening picture suggests and what question it makes them want answered. Record actual reading time, including visual inspection, and any confusing passage. The next day, without reopening the lesson, ask them to explain its central idea and why it works.

Use this small sample as a directional editorial test, not statistical validation or proof of willingness to pay:

| Dimension | Proposed pilot criterion | If unmet |
| --- | --- | --- |
| Understanding and memory | Aim for at least four of five readers to paraphrase the pre-defined central insight, including its essential causal step, the next day. Accept ordinary wording; record actual responses against that criterion. | Identify the gap, revise the explanation/visual and repeat the relevant test; note prior exposure or use fresh readers where feasible. |
| Interest | Aim for at least three of five to name someone they would share it with and explain why. Stated intention is a weak signal, not measured sharing. | Reconsider topic, title, hook or payoff; do not solve it with clickbait. |
| Visual quality | Owner considers the lead and complete mobile page publishable; factual/accessibility review also passes. | Revise within the calibration budget, or stop for an explicit change to that plan. |
| Reading experience | Non-native readers can follow the explanation without repeated dictionary use; measured whole-lesson time is reasonably consistent with the five-minute promise. | Adjust density, length, placement or promise using observed evidence. No assumed words-per-minute pass. |
| Calibration effort | Record requests, revisions and sessions against the separate one-off envelope. Calibration success does not prove routine weekly feasibility. | Resolve the specific failed criterion within the envelope; seek an explicit decision for further work. |

Record generation requests/edits/failures, tool availability, execution durations, revision rounds and any manual preparation. Account-level credit consumption may not be exposed: report only observed figures or an explicitly Owner-supplied before/after reading, not an invented percentage or cost. The capability trial establishes asset-production access and format feasibility. Stage B tests whether ordinary weekly execution windows suffice. Include all Owner/worker effort; no hidden extra sessions in a repeatability claim.

On an unmet substantive calibration criterion, revise and re-test the affected part before moving to stage B. If fewer readers participate or next-day responses are unavailable, report the actual sample and limits and ask the Owner to accept a provisional pilot or defer; never call the threshold passed. Reader recruitment must not create an indefinite automatic hold or fabricated evidence. Any calibration budget extension is an explicit Owner decision, recorded as setup/calibration effort; it does not establish normal repeatability.

**B. Repeatability lesson:** produce a different topic with the agreed style kit and provisional editorial criteria fixed in advance. Use only the normal six-request budget (up to four on the lead), two revision rounds and three weekly opportunities, with no hidden setup sessions. The Owner assesses the complete page for publishable visual quality and consistency; retain full source, editorial, accessibility and rendered review. Repeating the five-reader exercise is optional, not an additional recruitment requirement. Record effort and whether the ordinary schedule worked. A carry-forward can preserve a good lesson, but does not count as meeting the tested one-week schedule. If stage B needs a budget extension, substantial style redesign or extra opportunities, record the failed feasibility test, adjust the plan explicitly and run another bounded demonstration before claiming repeatability. Never change the measured budget retrospectively.

Freeze the concise editorial standard only after satisfactory calibration and a successful repeatability demonstration. If the Owner chooses a provisional release with incomplete evidence, state that honestly; it does not establish completed transition.

## 6. Return visits, disclosure and catalogue

Add a static RSS feed and a visible subscribe link; use stable lesson IDs, truthful publication/update dates and a deliberate policy for major revisions versus minor corrections. Retain “Something worth knowing”; show the release date and agreed weekly schedule separately. Illustrated featured/Library cards and sharing previews are part of the initial visual foundation, with defined cropping, fallback and alt behaviour as specified above.

Use a short, accurate AI disclosure linked to a fuller production explanation. Initial wording should state that AI tools help research, write and illustrate lessons and that sources and visuals are checked before publication. Describe AI versus human review truthfully; never imply weekly human approval where none occurred.

Pilot reader selection, questions and decision criteria are defined in section 5. Keep reader identities and individual responses out of public GitHub records; record anonymised findings only.

Keep the activity inventory in #186. Proposed change: review activities alongside each lesson's renewal, retain the commitment to account for all 23, and record each migration or reasoned disposition. Do not silently abandon the preservation decision.

## 7. Delivery sequence and acceptance

1. Review this proposal and settle the weekly timing and visual approach.
2. Perform the image-generation-to-local-asset capability trial. Prepare the concrete style kit and small technical visual fixture, including card/share derivatives; this is not the public pilot lesson.
3. Implement the bounded visual foundation and its ADR through the applicable mandatory review. Verify backward compatibility, hostile-input limits, multiple placements, all-image rendering, mobile WebKit/no-JavaScript behaviour and asset performance.
4. Produce and review the calibration pilot under its finite one-off envelope. Apply section 5 stage A, recording sample limits, reading times and all effort; agree the style kit and provisional editorial criteria.
5. Produce and review the next lesson under the agreed normal budget/schedule (section 5 stage B). Freeze the concise editorial standard only after that repeatability demonstration; aim for roughly 1,500–2,500 words including its visual appendix. Keep one operational weekly contract, with safeguards referenced rather than repeated.
6. Implement cadence, date/slot changes, RSS and affected instructions/tests through reviewed PRs. Reconcile open candidates before cutover. Update #186 only under the accepted direction.
7. Read back the final task prompt, schedule, timezone and enabled states. Verify a full weekly cycle and live page before declaring transition complete.

No code, schedule or policy change is activated by accepting the general direction alone. Implementation follows normal governance with reviewable concrete changes. Publication should remain paused during an incomplete cutover; existing tasks must not be re-enabled merely because this proposal is accepted.

**Decisions requested:** approve or amend the defaults in Decisions at a glance, particularly the separate calibration/normal budgets, two-stage demonstration and carry-forward rules. Select the pilot topic and initial style references next. Final share-image encoding and normal limits are settled from the recorded trial/calibration before stage B.

## Appendix A. Daily-system responsibility inventory

“Keep” preserves the responsibility; “simplify” changes its mechanism under reviewed rules; “drop” removes a daily-specific obligation. No row itself grants implementation authority.

| Existing responsibility | Decision | Weekly treatment and reason |
| --- | --- | --- |
| Current-main policy loading; untrusted input handling | Keep | Candidate text, feedback and external pages remain data, not authority. |
| Off switch and paused-task controls | Keep | Stop before authoring or publication; preserve a simple emergency pause. |
| Lightweight completion entry | Simplify | Check the weekly release/checkpoint, not today's lesson; avoid full work after verified completion. |
| Seventeen daily dispatches | Drop | Replace with three purposeful weekly opportunities. |
| Midnight preparation, 02:00 review boundary, 14:00 cutoff | Drop | Replace with stage permissions and the weekly target. |
| One-per-day release slot and same-day expiry | Simplify | One weekly release slot; automatic non-editorial carry-forward without new drafting or budget resets; explicit deployment reconciliation. |
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
| Three daily revision rounds and daily reservation ledger | Simplify | Two consolidated rounds per normal candidate, including carry-forward weeks; separate three-round initial calibration envelope, durable head-linked history and escalation. |
| Immutable identity, provenance and prior dates | Keep | Target publication date is distinct from those immutable facts. |
| Stale-base handling | Simplify | Permit a documented normal refresh onto current main, stop on conflicts, verify scope and rerun checks/review. No silent force rewrite or stale approval. |
| Reviewer does not edit lesson content | Keep | Findings return to the Writer. |
| Expected-head merge and no saved-approval shortcut | Keep | Recheck actual head, base, slot, findings and checks immediately before merge. |
| Post-merge checks, deployment/live-route verification | Keep | Distinguish merged from demonstrably published. |
| Separate technical-recovery PRs and excluded high-risk repairs | Keep | A lesson run cannot widen its own permissions or weaken gates. |
| Technical retry/repair budgets tied to a day | Simplify | Bind documented budgets to the weekly candidate/incident; no reset on a new day. |
| Two failed-day queue parking | Simplify | Escalate recurring blocked causes/round-limit failures; non-editorial carry-forward preserves work and budgets without silently parking or replacing it. |
| Corrections outside routine candidate work | Keep | Prompt factual corrections need their normal reviewed path. |
| Anonymous feedback, aggregate analytics and privacy | Keep | Use existing facilities without additional personal tracking. |
| Branch cleanup | Keep | Disposable branches still have a defined lifecycle. |
| Activation, prompt readback, audits and rollback | Simplify | One concise canonical weekly contract, verified configuration, one documented rollback path. Do not re-enable daily publication as an unapproved rollback. |
| Historical timing amendments and duplicate role instructions | Drop | Archive history in Git; remove superseded active instructions after checking references. |


## Appendix B. Evidence map

All repository links are pinned to the assessed commit.

- [Editorial standard](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/EDITORIAL.md)
- [Publication contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/automation/publication-task-contracts.md) and [lightweight entry](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/automation/publication-entry.md)
- [Ranked pipeline](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/editorial-pipeline.md)
- [Presentation extension schema](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/content/presentation-extensions.ts), [canonical schema](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/content/schema.ts), and [reading page](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/pages/%5Bedition%5D/%5Bslug%5D.astro)
- [Toolkit contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/toolkit-contract.mjs), [raster limits](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/raster.mjs), [rights validation](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/figures/image-rights.mjs), and [trusted guard](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/scripts/lesson-guard-core.mjs)
- [Shared layout and metadata](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/layouts/BaseLayout.astro)
- [Review informing this revision](https://github.com/nunov00/five-minutes/pull/188#issuecomment-6350015053): Perplexity Computer reports Claude Opus/Anthropic as its orchestrator; attribution is self-reported, and adopted recommendations are a disclosed contribution, not independent approval of the revised text.
- [Re-review informing this revision](https://github.com/nunov00/five-minutes/pull/188#issuecomment-6350197810), including the Owner-requested reading-time addendum. No independent approval of this subsequent text is claimed.
- [CI](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/.github/workflows/ci.yml), [homepage](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/pages/index.astro), and [analytics contract](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/src/lib/analytics/contracts.ts)
- [Single-version decision](https://github.com/nunov00/five-minutes/blob/15724378d9cc459e28b46b36a04fe382bd4d12ac/docs/adr/0013-single-lesson-version.md) and [activity preservation issue #186](https://github.com/nunov00/five-minutes/issues/186)
- Live automation lookup on 22 October 2026: Publisher, legacy Reviewer and catalogue migration disabled; no configuration changes made.

