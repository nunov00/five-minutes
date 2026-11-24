# Readable lessons: teach quickly, then go deeper

Status: proposed with PR #236; the Owner confirmed the defaults below on 24 November 2026. Owner direction, 24 November 2026: lessons are not research articles. They should teach something quickly, offer some extra depth for the most interested readers, and need not be exhaustive. This note records the evidence and the defaults the Owner confirmed. The binding rules are in [EDITORIAL](../EDITORIAL.md), the [figure toolkit](../implementation/figure-toolkit.md) and the [weekly contract](../automation/weekly-publication.md).

## Problem

The Owner found the published falling-cat lesson long-winded and hard to follow, and its "same bend opposite way up" figure unattractive. Both reviewers rated it 9. The existing standard already asks for clarity "on one careful read", so the gap is enforcement and incentives, not a missing principle.

## Evidence

**Weekly lessons grew while scores rose.** The cat lesson's body went from 394 words (first draft, 16 November, Claude 6/Revise) to 537 (18 November, 8/Ready) to 567 (published head, 19 November, 9/Ready). Each review asked for something to be added (a book demonstration, then a prediction prompt) and none asked for anything to be cut.

**Lessons have doubled in length as review rules grew.** All 27 lessons published from 2 to 18 October have bodies of 135–372 words. Every lesson published since then has 471–694 words: rainbow 491, QR codes 507, misted windows 514, queues 524, headphones 506, popcorn 471, steel ships 694, butterfly 617, chatbot 544, bicycle 495 and cat 567. The October rules that added depth, memory and attention checks were valuable, but nothing balanced them with a pressure to cut.

**The cat lesson's core shows typical problems:**

- abstract nouns instead of things moving ("Those adjustments always balance the total angular momentum, but they happen about changing axes");
- several ideas per paragraph (a model, two researchers and a five-step bend sequence in one paragraph);
- an activity written as one 100-word paragraph, with the object ("it") used before it is named;
- 13 citation markers across 9 paragraphs, often stacked as `[1][2]`;
- backward references such as "that same dependence".

**The figure was reviewed for correctness, not appeal.** The brief asked for "a clear figure of the two body halves' axes". Reviews checked the computed geometry and label collisions. The published result shows boxes, dashed axes, dots and arrows, and needs a legend ("yellow tips = feet") and a caption to decode.

**Review incentives favour growth.** The rating guidance asks "What would raise this by roughly two points?", which invites additions. Clarity problems were logged as MINOR, so they never blocked a 9.

## Changes in this PR

1. **Teach quickly, then go deeper** (EDITORIAL): a hook in the first paragraph, the quick answer by the end of the second, a short core (guidance about 150–350 words), a one-line payoff, then an optional extra-depth section (guidance under about 200 words) that readers may skip, and a prompt stop. Lessons need not be exhaustive.
2. **Plain-writing rules** (EDITORIAL, Clear English): show things moving, one idea per paragraph, activities as short numbered steps, name researchers only when they matter, no backward-pointing abstractions, write it as you would say it. Prefer one citation marker per paragraph, at its end, when attribution is clear; otherwise each marker sits beside its claim.
3. **Cold-reader test** (EDITORIAL): a fresh helper meets the lesson as a reader does (title, description and cover, then the opening and core with figures in place), without sources, PR context or scores. It reads once, explains the main idea and mechanism in three sentences and lists re-read sentences and unknown words. If it cannot explain the idea, the lesson needs revision; a reported re-read prompts the reviewer to identify the concrete comprehension gap before recording IMPORTANT. Without a fresh helper, the result is labelled a self-edit or repeat read.
4. **Clarity cap, "What would I cut?" and a revision length check** (EDITORIAL, weekly contract): no 9 or 10 while the cold-reader test fails; every review names something to cut; every revision reports its word-count change and fixes weak text by replacing it rather than adding beside it.
5. **Explanatory figure rules** (EDITORIAL, figure toolkit): a figure brief covering what the reader should understand, what should catch the eye, the visual treatment and one or two specific finishing choices; a per-figure ARTWORK reason at phone width; recognisable objects instead of labelled boxes, few labels and no legend needed to say what a drawing's parts are (a short key for chart series is fine), short stage strips and a finish that matches the lead. Each figure is judged in its role at phone width in the article; the thumbnail and share checks stay with the cover. A correct but unattractive figure is REWORK.

## Defaults (confirmed by the Owner, 24 November 2026)

| Question | Default in this PR | Why |
| --- | --- | --- |
| Adopt all five changes? | Yes | They address separate causes: shape, wording, review evidence, incentives and figures. |
| Hard or soft numeric limits? | Soft guidance. Paragraph, step, label and word figures are prompts to cut, not pass marks. The cold-reader test is the hard check. | Matches EDITORIAL's existing refusal of numeric pass marks; a reader-based test targets the real failure. |
| Cold-reader helper on every review? | Yes, where a fresh helper is available; otherwise the reviewer does the cold read and says so. | One short extra read per round; it is part of the existing review, not a new round. |
| When does it start? | One candidate-level rule for authoring, review and Friday: candidates first drafted after the merge, which for weekly production means the first Sunday cycle after the merge (29 November 2026 if merged before then). A candidate drafted earlier finishes, including later heads, under its starting rules. Narrow corrections keep their exception. | Avoids changing the rules mid-candidate. |

## Out of scope

- No published lesson is changed. The cat lesson stays as published; it is used only as evidence.
- No schema, renderer, CI, scheduled task, saved prompt, review-round or image-budget change. Both weekly prompts already load these files from current main.
- The optional extra-depth section is a normal Markdown heading, so no new lesson field is needed.
