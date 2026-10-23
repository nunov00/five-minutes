# Topic-led opening and answer-first pilot

**Proposal for independent review - 23 October 2026.** Follow-up to #188, #190, #192 and #194. This PR records the Owner's revised calibration decision and a proposed opening design. It implements no layout, schema, lesson, publication or automation change. Merging records the reviewed direction; implementation and release retain their separate gates.

## Problem and evidence

The butterfly pilot was editorially Ready at `50b19c0eeda5bcdd0f5aa1453b1d1f67d7ccd4a1`, but Owner calibration found that the attractive lead does not communicate its particular insight or earn attention. The title creates some curiosity without enough value to beat competing reading. Interest drops once the main relationship is understood; the ending repeats it.

The Owner wants the image and title to show the subject and learning reward, an early short answer, and explanatory pictures after the first paragraph of their sections. Describing the mechanism as a light filter also exposed a comprehension risk: changing reflected-wave reinforcement can be mistaken for absorbing unwanted colours.

**Owner decision, 23 October 2026:** use Owner-led qualitative calibration, supported by factual/editorial and technical review. No human-reader panel or recruitment is required for stage A or a later default decision. The former five-reader thresholds are withdrawn, not passed. This amendment is also recorded in [the weekly proposal](weekly-publication.md) and the #188/#192 conversations.

The five AI role-play sheets remain editorial diagnostics. Their invented timings, delayed recall, biographies and sharing responses are not human evidence. The Owner's feedback is one person's judgement, not measured audience appeal or retention. Stage-A acceptance and publication still require their explicit decisions; neither is inferred from removing the panel.

Owner-supplied social-post examples illustrate relevant imagery paired with a clear headline. Their factual/commercial claims, images, branding and screenshots are not adopted or copied.

## 1. A meaningful lead with a defined text contract

Use one expressive, wing-scale conceptual illustration: a recognisable blue wing with a local green wet region. Show no microscopic shelves, gap contents, light paths, arrows, lettering or three-panel sequence in the lead. The separate dry-wet-dry evidence figure remains responsible for gap contents and reversibility.

The image should visibly pose a colour-change puzzle even without text. It must not look like three unrelated specimens or present a green dye as the explanation. The caption explicitly identifies an illustrative interpretation of the reported clear-alcohol observation, not a specimen photograph, recorded experiment or measured colour boundary. Accurate geometry and mechanisms belong to deterministic explanatory drawings, not generated art.

Use the **existing presentation `title` and `description`**, with their existing plain-text validation and length limits, for the headline/context on the reading page and discovery cards. They may be editorially revised; no separate lead-headline field, stage labels, panel-alignment commands or overlay coordinates are proposed. Figure `caption`, `alt` and `description` retain their existing provenance and accessibility jobs.

Draft title: **Why a blue butterfly wing can turn green**

Draft description: **Its blue comes from tiny structures, not blue pigment; clear alcohol can change the colour they reflect.**

These replace the old title/description only after lesson review; the lesson identity and slug stay unchanged. The title and image work together on the page. Labels and text need not be baked into the artwork to make the cards intelligible.

ADR-0014's 480x320 thumbnail and 1200x630 share image still contain only the lead artwork. Inspect those actual derivatives with surrounding text removed: the blue wing and green region must remain recognisable, with no misleading crop. Review them again with the real card title or Open Graph title/description. Standalone pixels need not teach the microscopic cause. Title-bearing social-image composition remains a separate future trusted-build change, not an implied result of application text.

Replace the current lead within the three-source ceiling. Keep expressive art distinct from the two precise explanation/evidence figures and check that they perform different jobs. Reuse verified rights where practical; any generated or edited artwork consumes the existing reserved generation allowance and needs prompt, rights, validation and budget records. This proposal dispatches no generation request and increases no budget.

## 2. A short answer, followed by a causal explanation

Keep a short reported observation as body paragraph 1, ending on the puzzle rather than already explaining the gaps. Then show the lead and the short answer before the detailed sections. Avoid repeating the same partial answer in the opening paragraph, title, description and takeaway.

Draft standalone takeaway/opening answer, one useful sentence:

> A blue morpho's tiny wing structures make its blue colour; clear alcohol in their air gaps slows light, shifting the reflected colour towards green in the reported demonstration.

This preserves the material-change/light-speed step in the durable insight and search index. It avoids unexplained “reinforce” and a dangling “Its”. The later body must explain why the extra travel time changes how reflections from different depths combine. State that shelves stay in place; remove the “thicker layer” metaphor if it encourages a spacing-change interpretation. Explain clear alcohol's optical role without suggesting it absorbs unwanted colours like a coloured filter. No home chemical procedure is added.

**Recall must test the next causal step, not repeat the opening.** Proposed question:

> Why does slowing light in the gaps change the reflected colour when the shelves have not moved?

Its answer must connect different reflected paths, changed travel time and which waves line up to strengthen a colour. Merely repeating “alcohol slows light” is insufficient. The longer explanation and diagrams must earn that understanding before the question. The reveal remains optional; it is not a measured delayed-retention test.

Proposed bounded implementation: add one optional presentation field, `opening: answer-first`, with a closed accepted value and absence preserving current behaviour. Require one lead in `figures` after paragraph 1. Render that paragraph, the lead, the existing `takeaway` once as the short answer, then the remaining body/figures at their original paragraph anchors. At the end, reveal `answer` without repeating `takeaway`. No second summary field, extra headline field or copied summary in Markdown is introduced.

The coordinated implementation must amend **ADR-0006, ADR-0009, ADR-0013 and ADR-0014**, the [M6.2 reading-enhancement contract](../implementation/m6.2-reading-enhancements.md), EDITORIAL's takeaway placement rule and the weekly proposal's recall-before-takeaway wording. The single-version ADR-0013 is part of this list, not superseded by an implicit exception.

Update `scripts/verify-static-integrity.mjs` and its tests: default lessons still require recall followed by answer/takeaway in one reveal; opt-in lessons require exactly one early takeaway and a later recall/answer reveal. Missing, duplicated or misordered content must fail. Do not remove the whole-corpus ending check. Review this quality-gate change as mandatory. Validate the opt-in field and lead constraint consistently in loader, guard and submission tooling. Keep canonical content plain Markdown and bounded data, never lesson-authored HTML/CSS/SVG or executable components.

## 3. Earlier explanatory pictures and a useful ending

In the current pilot, structure follows paragraph 5 and dry-wet-dry follows paragraph 8. Move them after the first prose paragraphs of their sections: currently paragraphs 4 and 7. Recompute actual `afterParagraph` values after editing; do not copy old indices. Introduce what to notice, then let the picture support the rest of the section. This is a pilot placement decision, not a universal outline or diagram quota.

Replace the repeated closing summary with a supported connection. A promising candidate is chemical-sensing research: [Dong et al. (2022)](https://www.frontiersin.org/journals/physics/articles/10.3389/fphy.2021.806904/full) models how measurement geometry affects distinguishing surrounding media through Morpho-scale reflection changes. The abstract, modelling and conclusion were checked on 23 October; its proposed improvements still needed experimental verification. Keep any ending qualitative and research-labelled, with no product, accuracy or universal vapour-detection claim. Recheck sources for the final lesson wording. The already sourced peacock connection remains an alternative.

The reward may be understanding or recognition, not a fabricated practical use. If the angle is weak, future topics compete through the reviewed pipeline rather than manufactured urgency.

## 4. Review and acceptance

Within the existing reader-value/figure review, ask:

**From the image and title together, can a reader tell what they will learn and why they might care?**

Record the apparent subject, specific puzzle/reward, misleading expectations and delivery. Reuse #194's advisory topic/lesson ratings and report all findings. Add no threshold or review round.

| Area | Required evidence |
| --- | --- |
| Meaning | No moving shelves, green dye, pigment-free-wing or documentary-imagery implication. The lead shows wing-scale appearance; gap contents remain in the evidence figure. |
| Reading | A standalone one-sentence takeaway retains the light-speed step; the body explains the wave relationship; recall tests that relationship beyond the opening wording; the ending adds a supported connection. |
| Layout | Inspect 320, 393 and 1440 px in light/dark and without JavaScript. Existing title/description and figure text stay readable without clipping. |
| Figures/derivatives | Both explanatory figures follow their section's first paragraph. Lead and evidence do not duplicate a triptych. Inspect 480x320 and 1200x630 outputs without text, then the actual card/share context. |
| Compatibility | Unselected lessons keep recall/takeaway order, cards, URLs, saved/read state and legacy figures. ADR-0013, weekly-proposal and M6.2 requirements are reconciled explicitly; static integrity enforces both modes across the corpus. |
| Assets/checks | Preserve existing rights, immutable-source names, raster limits, sRGB/metadata stripping and trusted-main validation. Fresh exact-head CI, independent policy/code review and full factual/editorial/rendered lesson review remain required. |
| Calibration | Record the Owner's actual judgement of the revised preview: opening clarity/appeal, explanation, diagram placement and ending. Identify unresolved problems and any actual timing; otherwise state time unmeasured. No panel, human-recall threshold or simulated measurement is required or counted. |
| Wider default | A further reviewed decision needs the Owner's recorded acceptance of the revised preview, no unresolved BLOCKER/IMPORTANT findings and passed technical/rendered checks. Its audience-value basis is one Owner's judgement, supported by AI editorial review, not representative reader testing. |

Implement application/policy support separately from the #192 lesson-content revision. Preserve its identity, history and budgets; a substantive revision uses the next available calibration round. Earlier Ready reviews never carry to a changed head. Keep publication and stage B separate from acceptance of this design.

Only after the revised pilot's Owner assessment may a further reviewed change make answer-first a default. No informal readers, recruitment task or panel is a prerequisite. Keep the eventual visual principle flexible across topics rather than mandate green patches, triptychs or a social-post template.

## Review request

Review the exact head under GOVERNANCE section 9. Challenge the macro-only lead and actual derivatives, existing-field text contract, opening/recall causal distinction, complete contract/test changes and honest Owner-led calibration basis. Classify findings as BLOCKER, IMPORTANT or MINOR. This proposal implements or activates no layout or publication.

References: [ADR-0009](../adr/0009-production-experience.md), [ADR-0013](../adr/0013-single-lesson-version.md), [ADR-0014](../adr/0014-positioned-lesson-visuals.md), [figure toolkit](../implementation/figure-toolkit.md), [editorial standard](../EDITORIAL.md), [weekly proposal](weekly-publication.md), [pilot #192](https://github.com/nunov00/five-minutes/pull/192).
