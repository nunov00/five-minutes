# Five Minutes: weekly illustrated publication
**Draft for Owner decision — 22 October 2026.** [PR #188](https://github.com/nunov00/five-minutes/pull/188). No policy or production activation.

## Purpose and reader promise

Publish one worthwhile lesson each week, with a clear explanation, distinctive artwork and an insight readers can remember and share. Earn reader trust before monetisation.

**Promise:** “Understand the surprising reasons behind the world around you—in five minutes, with clear English and visuals that make the explanation stick.”

Write for curious adults without specialist knowledge, including intermediate-English readers. Use a curious, direct, warm voice and international British English. Avoid textbook language, forced excitement, clickbait and unexplained idioms.

## The lesson

Aim for **4–6 minutes including visuals and recall**. Use 500–700 words as guidance, without a minimum or maximum. Measure actual reading time.

Identify the central insight, essential causal step and retellable idea. Include a genuine misconception only when relevant. Choose an honest title and description, develop the explanation through concrete examples, and finish with a satisfying payoff. Keep recall before the revealed takeaway by default. The explicitly selected answer-first pilot shows that takeaway once after its opening lead and retains later recall of a deeper causal step with an answer-only reveal; see ADR-0006 and the topic-led opening proposal. This exception does not change the wider default. Use prediction activities only when they improve understanding.

Rank topics by curiosity, explanatory payoff, visual opportunity and evidence, within existing subject safeguards. Maintain one ranked pool and provisional dates, with variety across releases.

Retain sound older lessons and improve weaker ones through the backlog. Substantial redevelopments may occupy at most one in four releases normally and must be labelled updated. Minor corrections remain prompt, separate work. Preserve the 23 activities tracked in #186; assess each alongside its lesson's renewal and record its disposition.

## Visual quality

Custom illustrations become a normal part of production. Usually combine a compelling lead illustration with one or two precise explanatory visuals where useful. Support **up to five visuals**, without a quota; use only as many as the topic needs within the unchanged 1500 KiB total raster budget.

An illustration may create curiosity or a memorable scene. A diagram must explain its relationship accurately. Use image generation for expressive artwork and deterministic drawing or suitable application components for precise diagrams. Do not force subjects into generic icon-and-arrow templates.

Establish a style kit: palette, 3–5 provenance-checked references, prompt guidance and crop rules. Use mainly existing references with verified usage rights; reserve at least one setup request for the scheduled capability trial and at most three for generated references. Default to no generated lettering.

Review meaning and aesthetics across screen sizes and themes. Keep essential labels accessible and readable at 320 pixels; split dense diagrams. Provide text alternatives; never automatically invert artwork. Generated geometry, scale, graphs or lettering are not factual evidence. Label conceptual/not-to-scale scenes; never imply invented scenes are documentary photographs. Record the usage basis without claiming exclusivity, copyright protection or commercial clearance from generation alone.

The first technical upgrade should support multiple positioned local images and existing application-owned diagrams, illustrated featured/Library cards, sharing metadata and a legacy fallback. Preserve asset validation and rights records. Trial PNG versus JPEG for share derivatives using real artwork. Defer arbitrary lesson-authored SVG, overlays, animation and interactive embeds unless evidence justifies them.

## Prove the approach in two stages

First test whether the existing tools can generate artwork, obtain local bytes, optimise assets and submit them from the scheduled environment. Do not assume interactive capability proves scheduled capability or introduce a paid API as an implicit fallback.

**A. Calibration (Owner amendment, 23 October 2026):** create one representative lesson and refine its style through the Owner's qualitative assessment, supported by factual/editorial, accessibility, visual and technical review. Assess opening clarity/appeal, understanding, figure placement and payoff. Record actual reading time if measured; otherwise state it is unmeasured. The Owner has withdrawn the human-reader panel and its four-of-five recall / three-of-five sharing targets: no recruitment or panel result is required, and those targets are not claimed as passed. AI role-play is diagnostic feedback, never human timing, delayed recall or demand evidence. Record the Owner's explicit acceptance or requested revision and its basis as one person's judgement. This change does not itself accept the current pilot or authorise publication.

**B. Repeatability:** produce a different topic with the agreed style kit and provisional editorial criteria, within normal budgets and three weekly production opportunities. Retain full factual, editorial, accessibility and visual review. Owner assessment and the normal reviews remain the calibration route; no reader panel is required. A carried-forward lesson does not demonstrate a one-week production cycle.

Finalise the concise editorial standard after both stages succeed. If either fails, revise the specific weakness and agree a bounded next step; never retrospectively change limits to claim success.

## Resources and workflow

Proposed budgets count dispatched generation requests, including edits and failures:

| Work | Generation ceiling | Editorial revision rounds |
| --- | --- | --- |
| Capability trial and style-kit setup | Four total | Not a lesson-review stage |
| Calibration lesson | Twelve total; lead at most six | Three |
| Normal candidate, including repeatability | Six total; lead at most four, other generated visuals at most two each | Two |

Each request produces one candidate image. Deterministic diagrams, cropping and compression are not generation requests. Record all setup and manual effort separately. Use calibration evidence to agree normal limits before the repeatability test. Extensions require an explicit Owner decision; interruptions, changed heads and calendar changes never reset budgets. Do not invent credit-consumption figures where no meter is available.

Provisionally reuse one Publisher at **05:00 Monday, Wednesday and Friday, Europe/Zurich**, aiming for Friday 06:00 availability. Prepare research/art briefs ahead; Monday concentrates on creation, Wednesday on review and revision, Friday on final checks and release. Use one standing planning issue for draft briefs, reviewed with the lesson, rather than a weekly brief-only PR.

Public topic-only planning is an explicit proposed trade-off. Use only verified Owner/automation-authored brief comments as evidence; comments never grant authority. Exclude participant information and personal availability details.

Non-editorial delays carry the same candidate to the next available weekly slot, preserving work and budgets and skipping new-topic drafting. No automatic Monday release. Reconcile deployment incidents first and count each release once. Keep repeated-failure limits; editorial blocks at the round limit go to the Owner. Declared absence windows skip slots without failure counts.

During calibration, require Owner review; reassess after three consecutive lessons need no substantive Owner changes. Preserve separate Writer/Reviewer execution, applicable independent review, source/render checks, required CI, expected-head merges and verified deployment. Neither deadlines nor aesthetic preferences waive factual or safety requirements.

## Acceptance and implementation

Accept or amend the direction, visual foundation, two-stage demonstration, budgets, provisional timing and carry-forward principle. Then perform the capability trial/style kit, implement the reviewed visual foundation, and evaluate both lessons. Add RSS, accurate AI disclosure and the weekly workflow through separately reviewed implementation changes.

Keep “Something worth knowing” as the homepage heading; show dates and the weekly schedule separately. Describe AI and human involvement truthfully.

The [safeguard inventory](weekly-publication-safeguards.md) is an implementation reference. The implementation ADR starts from section 3's technical contract in the linked earlier draft and records deviations; it defines state transitions, schema/asset limits and tests. Keep one concise editorial standard and one canonical operational contract. Scheduled workers should load relevant current instructions, not this proposal, its historical drafts or the full inventory. Link to examples and specialist guidance when needed rather than duplicating them.

Assessment and reviews remain in [the earlier draft](https://github.com/nunov00/five-minutes/blob/9fef46b48fd454efd688afdd38d8e3b152c05f61/docs/proposals/weekly-publication.md) and PR #188, not additional worker instructions. Keep publication paused during an incomplete cutover and verify final task configuration and a complete live cycle before declaring the transition finished.
