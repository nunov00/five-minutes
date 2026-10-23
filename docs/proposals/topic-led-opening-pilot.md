# Topic-led opening and answer-first pilot

**Proposal for independent review - 23 October 2026.** Owner-requested follow-up to #188, #190, #192 and #194. This PR records the proposed design and implementation acceptance criteria. It changes no active policy, application, lesson, publication state or automation. Merging it records the reviewed direction; implementation and release retain their separate gates.

## Problem and evidence

The butterfly pilot is editorially Ready at `50b19c0eeda5bcdd0f5aa1453b1d1f67d7ccd4a1`, but Owner calibration identified a different problem: the attractive butterfly does not communicate the particular idea or earn attention by itself. The title creates some curiosity without establishing enough value to beat competing reading. Interest drops once the main relationship is understood; the ending repeats it.

The Owner prefers an opening that makes the subject and learning reward visible immediately, an early short answer, and explanatory pictures after the first paragraph of their respective sections. The Owner's description of the mechanism as a light filter also reveals a useful comprehension risk: changing reflected-wave reinforcement can be mistaken for absorbing unwanted colours.

This is one Owner's qualitative assessment, not representative audience research. Five supplied AI role-play sheets are supplementary editorial diagnostics, with no valid human reading times, delayed recall or sharing measurements. They must never be counted towards the five-reader targets. The Owner has declined to recruit that panel; its targets remain unassessed, and any provisional stage-A acceptance must be recorded explicitly. No such acceptance or publication approval is inferred here.

Owner-supplied social-post examples motivate the presentation principle: a relevant image and a readable headline together convey a specific story or question. Their factual or commercial claims are not adopted as evidence, and their images, branding and screenshots are not copied into the project.

## 1. Make the opening communicate the idea

Use the lead illustration and a short headline as one understandable opening. At a glance, the reader should identify the subject and the particular change, comparison or question that the lesson explains. A beautiful subject portrait alone is insufficient for this pilot.

Proposed butterfly treatment:

- Main visual: the same wing shown through an illustrative blue-green-blue sequence, with the unchanged structure and changing gap contents made clear at the appropriate level.
- Lead headline: **Same wing. Different colour. No new blue pigment.**
- Short stage labels: **Air / Alcohol / Air again**, with the colours visible as well as named. Present this as a conceptual illustration of the reported demonstration, never specimen photographs or measured spectra.
- Retain the full factual title and description as the reader's context. Do not replace them with a cryptic slogan.

The lead establishes the observable puzzle; the explanatory figures supply its mechanism. Avoid duplicating the full dry-wet-dry cross-section in both places. Keep the existing three-source ceiling by replacing or reworking the current lead rather than appending a fourth authored image.

Use real application text for headlines and labels where feasible, with an equivalent accessible reading order. It must wrap cleanly on small screens, remain visible in both themes and without JavaScript, and convey the comparison without relying only on colour. Do not ask an image generator to draw exact lettering or scientific geometry.

For the first pilot, place the headline alongside the artwork or immediately adjacent to it; a decorative text overlay is unnecessary. Thumbnail and social-share artwork currently contain only the source image under ADR-0014. Adding a headline in the page does not put it into those derivatives. Any later title-bearing share composition needs a separately reviewed trusted-build implementation, with pinned fonts, bounds, safe layout and accessible metadata; it is outside this first pilot.

Reuse existing art and verified rights where practical. Any newly generated or edited artwork needs the existing reservation, prompt, rights, validation and generation-budget record. This proposal dispatches no image request and changes no budgets.

## 2. Offer the short answer before optional depth

Keep a short opening observation as body paragraph 1, followed by the topic-led image/headline and a short plain-English answer before the detailed sections. The reader should gain a worthwhile insight even if they stop there; continuing should supply additional causal understanding.

Draft opening answer for source/editorial review:

> Its blue comes from tiny structures that reinforce blue light, rather than from blue pigment. Filling the air gaps with clear alcohol changes how the reflected waves combine, turning the wing green in the reported demonstration; drying brings air and blue back.

The detailed explanation must still connect light's travel time through the gap material to the change in reinforcement. Simplify the “thicker layer” metaphor, which can imply that shelves move. State that the shelves stay in place and distinguish this mechanism from a coloured liquid filtering the light by absorption. Integrate that distinction into the explanation rather than adding another detached disclaimer. Do not add a home chemical procedure or unsupported practical application.

This is a deliberate departure from ADR-0009's recall-before-summary direction. Keep an optional end-of-lesson recall prompt before its expandable answer, but acknowledge that the opening has already supplied the central answer. It is an opportunity to explain the mechanism after reading, not a blind or measured retention test. Avoid repeating the identical takeaway as an additional labelled summary at the end.

Proposed bounded implementation: add one optional presentation field, `opening: answer-first`, with a closed accepted value and absence preserving current behaviour. For this pilot mode, require one lead in `figures` positioned after paragraph 1. The application renders that first paragraph, the lead, the existing front-matter `takeaway` as the short opening answer, then the remaining body and figures at their original paragraph anchors. At the end, the recall disclosure reveals `answer` without rendering `takeaway` a second time. There is no second summary field or copied summary in the Markdown body.

The implementation PR must explicitly amend ADR-0006/0009/0014, the applicable reading-enhancement contract and EDITORIAL's takeaway placement rule for this opt-in behaviour. Validate the field and lead constraint consistently in the loader, guard and submission tooling; reject unknown values or contradictory placement. Review renderer and fixtures together. Keep canonical content as validated plain Markdown and bounded data, with no lesson-authored HTML, CSS, SVG or executable components.

## 3. Bring the explanation pictures forward

In the current pilot, the structure figure follows body paragraph 5 and the dry-wet-dry figure follows paragraph 8. Move each to follow the first prose paragraph of its section: currently paragraphs 4 and 7. Recompute the actual `afterParagraph` values after editing the opening; do not copy these old numbers into the revised draft.

The first paragraph introduces what the reader should notice; the picture then supports the rest of that section. Inspect the sequence on the actual rendered page. This is a placement preference to test, not a universal rule that every lesson needs a diagram or must use the same outline.

## 4. Let the ending add something

Remove the paragraph that merely restates the opening answer. End with one supported observation, connection or implication the reader can recognise elsewhere. The already sourced peacock connection is a candidate to develop or move here; verify its limits before changing the wording. Do not invent a technology application or claim a practical use merely to make the subject seem valuable.

A topic may earn its place through understanding, recognition or a memorable connection. If that reward is too weak, strengthen the angle or select a better future topic through the reviewed pipeline rather than manufacturing urgency.

## 5. Review the pilot before setting a default

Add this question to the pilot's existing reader-value/figure review:

**From the lead image and headline together, can a reader tell what they will learn and why they might care?**

Record concrete evidence: the apparent subject, the specific puzzle/reward, misleading expectations and how the finished explanation delivers. Reuse #194's advisory topic-appeal and lesson-quality ratings, finding severities and evidence rules; introduce no extra score, threshold or review round.

Implementation acceptance:

| Area | Evidence required |
| --- | --- |
| Meaning | The opening promises the reported colour change honestly; it does not imply moving shelves, a green dye, pigment-free wings or documentary imagery. |
| Reading | The short answer makes sense by itself; the longer account explains the causal steps; the ending adds a supported connection. |
| Layout | Inspect 320, 393 and 1440 px, light/dark and no-JavaScript. Titles/labels remain readable; artwork, figures and captions do not clip or compete. |
| Figure position | Both explanatory figures follow their section's first paragraph after the final prose edit; the relationship is clear before expansion. |
| Existing behaviour | Unselected lessons preserve recall/takeaway order, cards, canonical URLs, saved/read state and legacy figure behaviour. |
| Assets | Existing rights, immutable-source naming, sRGB/metadata stripping, raster limits and current-main validation remain required. |
| Review | Fresh exact-head checks and the applicable independent policy/code review plus full factual/editorial/rendered review of the revised lesson. Earlier Ready records do not carry to a changed head. |
| Calibration | Record the Owner's qualitative assessment of the revised preview. Human-panel outcomes remain unassessed; seek an explicit provisional decision before claiming stage A accepted. |

After the design review, implement the pilot's small application/policy support separately from the lesson-content revision to preserve governance boundaries. Update the existing #192 candidate for lesson changes, preserving its identity, history and budgets; any substantive revision consumes the next available calibration round rather than resetting the allowance. Use a preview for Owner assessment. Publication and stage B remain separate decisions under #188.

Only after assessing the revised pilot should a further reviewed change make this a wider editorial default. Express the eventual principle flexibly: communicate the subject and learning reward through the image/headline pair; use a comparison, process, scene or other honest treatment suitable for the topic. Do not mandate identical three-panel leads or turn social-post conventions into a compulsory visual template.

## Review request

Challenge the draft opening, factual simplifications, early-answer trade-off, accessibility, asset/derivative boundaries, narrow pilot scope and separation between Owner feedback, AI diagnostics and real-reader evidence. Identify any operational instruction that would activate this proposal prematurely. Classify findings as BLOCKER, IMPORTANT or MINOR and review the exact PR head under GOVERNANCE section 9.

References: [ADR-0009](../adr/0009-production-experience.md), [ADR-0014](../adr/0014-positioned-lesson-visuals.md), [figure toolkit](../implementation/figure-toolkit.md), [editorial standard](../EDITORIAL.md), [weekly proposal stage A](weekly-publication.md), [pilot](https://github.com/nunov00/five-minutes/pull/192), [rating guidance](https://github.com/nunov00/five-minutes/pull/194).
