# Five Minutes editorial standard

Status: accepted editorial standard. Owner calibration review was completed under issue #49 on 3 October 2026.

## Purpose

Five Minutes publishes one worthwhile idea at a time. The name is a promise of focus, not a stopwatch: there is no required reading time or word count. A lesson should be as short as it can be without weakening the explanation, and as long as it needs to be to earn the reader's time. A two-minute lesson and a ten-minute lesson can both meet the standard.

This rubric is the product contract for lesson generation and editorial review. Automated schema, safety and build checks remain separate gates. Passing them proves that a lesson is structurally publishable; it does not prove that the lesson is good.

## Publication standard

A publishable lesson must meet every criterion below. Reviewers use judgement and written reasons rather than scores or averaged percentages. A polished sentence cannot compensate for an unsupported claim, and a long source list cannot compensate for a dull or confusing lesson.

| Criterion | Publication standard | Common reasons to revise |
| --- | --- | --- |
| Factual accuracy and source support | Material claims are correct, qualified where needed and supported by sources suitable for the claim. Unstable facts are checked close to publication. Contested claims are presented as contested. | The source does not support the wording; a simplification changes the meaning; an attribution is repeated without checking the original; uncertainty is hidden. |
| Worth the reader's time | The lesson offers a surprising, useful or illuminating idea and makes clear why it matters. Every section advances that idea. | The topic is merely trivia; the opening promises more than the body delivers; the lesson lists facts without producing understanding. |
| Audience attention and sustained engagement | The title makes an honest, specific promise; the opening creates immediate curiosity or useful tension; and each paragraph moves the reader towards a satisfying payoff. Examples make the mechanism vivid, cognitive load stays appropriate for the edition, and novelty serves understanding rather than clickbait. | The lesson takes too long to reach its question; the opening is generic; momentum stalls; an example distracts from the mechanism; suspense hides essential context; the payoff does not fulfil the title's promise. |
| Clarity and accessibility | A reader with general education, including a reader using English as an additional language, can follow the explanation on one careful read. Sentences are direct, terms are defined on first use and cultural references are not required for comprehension. | Dense noun phrases, idioms, unexplained acronyms, long detours or examples that assume one country, school system or subculture. |
| Concision | The lesson contains no filler, throat-clearing, repeated conclusion or decorative detail that does not improve understanding. Length follows the idea rather than a target. | Multiple examples make the same point; the conclusion restates the whole article; qualifiers obscure a simple claim. |
| Explanation and examples | The lesson explains the mechanism or reasoning, not just the result. Examples are concrete, accurate and chosen to reveal the idea's limits as well as its basic form where useful. | An analogy replaces the explanation; an equation appears without interpretation; examples are technically false or too distant from the reader. |
| Structure and flow | The title sets an honest expectation. The opening establishes the question or tension, each paragraph follows from the last, and the ending resolves the opening. Headings are used only when they help navigation. | The key explanation arrives late; sections feel interchangeable; the lesson changes subject; a heading adds hierarchy without meaning. |
| Appropriate depth | The lesson includes what the reader needs to understand and use the idea, without assuming unexplained specialist knowledge. It names important limits but does not turn every caveat into a tangent. | A crucial causal step is skipped; jargon carries the argument; detail accumulates after the central idea is already complete. |
| Takeaway and retrieval question | The front-matter takeaway states the durable insight in one useful sentence and is rendered once by the reading page; the body earns that conclusion without adding a second labelled takeaway. The question tests the insight, and the answer explains it rather than rewarding a trivial word match. | The takeaway is repeated or contradicted in the body; it is a slogan; the question tests an isolated number or wording copied from the title; the answer introduces new unsupported information. |
| Adult presentation | Adult writing is intelligent, economical and precise. It may use technical language when it immediately explains it. It respects the reader without sounding academic for its own sake. | Corporate or textbook tone; needless jargon; oversimplification that removes the interesting mechanism. |
| Teen presentation | Teen writing is engaging and natural. It may choose a different hook, example and structure from Adult while preserving the same facts and depth. It never relies on forced slang, trend references or a patronising voice. | The Adult version is merely shortened; slang tries to manufacture relevance; the reader is talked down to; nuance disappears. |
| Title, deck and discoverability | Each edition has a specific, accurate title and a description that adds information. Search terms cover likely language a reader would use without stuffing synonyms. | Clickbait, vague titles, duplicated title/description, promises absent from the body or irrelevant search terms. |
| Originality and non-duplication | The lesson has a distinct central insight and treatment. Before publication, compare its identity, title, concepts, takeaway and examples with the catalogue. Overlap is acceptable only when the new lesson answers a materially different question. | A new title hides the same lesson; familiar material is paraphrased without a fresh explanatory angle; Adult and Teen differ only cosmetically. |

## Figures and Teen activities

Optional figures are part of an individual presentation and are reviewed with the same factual standard as its prose. A figure must materially improve understanding; decorative imagery is not a reason to add one. Reviewers verify every label, scale, relationship and caption against the lesson's sources, and confirm that required alt text communicates the explanatory purpose rather than merely naming the picture. Adult and Teen may use different figures/captions. Review the full-text description as an equivalent explanation, and mark schematic drawings as not to scale where appropriate. The concrete field shapes and limits are in [M6.2 reading enhancements](implementation/m6.2-reading-enhancements.md).

Only the safe representations defined by ADR-0006 are publishable: application-rendered diagrams from validated structured data or local PNG/WebP assets within configured size/file-count limits. Lesson-authored SVG, HTML, remote images and executable embeds are not accepted.

Teen may include an optional lightweight activity when prediction or choice helps the reader engage with the mechanism. It is not a quota or mandatory gamification. Reviewers verify that the prompt is unambiguous, every option is plausible in context, the marked/recommended answer is correct, and the explanation follows from the lesson without introducing unsupported claims. The activity must remain understandable and revealable without JavaScript and must not patronise the reader.

## Research and source practice

Prefer primary, official or otherwise authoritative sources for factual foundations. A secondary source may help explain or contextualise a subject, but it should not be the only support for a claim it merely repeats. Match each source to the claims it can actually establish.

Check dates for facts that can change. For contested or consequential claims, seek independent support and describe the disagreement or uncertainty. Do not turn a popular paraphrase into a verbatim quotation or imply that a later formulation appeared in an original work. Source metadata belongs in `lesson.yaml`; prose links are optional and should serve the reader rather than act as footnotes for every sentence.

## Adult and Teen relationship

Adult and Teen are two presentations of one lesson identity. They share facts, sources, taxonomy and the central insight, but they need not share an outline. Adapt the route into the idea: a Teen presentation can start from school, games, a phone or another familiar situation when that example genuinely clarifies the concept. Adult can move more quickly into abstraction. Neither edition is the default or the complete version.

Both editions must preserve qualifications that affect truth. Simpler language means shorter sentences, explained terms and well-chosen examples; it does not mean removing the mechanism or pretending that a complex idea has no limits.

## Review outcomes

Review findings use the project-wide severity language:

- **BLOCKER** — publication would be unsafe or untrustworthy. Examples include a material factual error, invented or misrepresented source, harmful instruction, plagiarism, identity/route conflict or a missing edition. The lesson must not publish.
- **IMPORTANT** — the lesson does not yet meet the editorial contract. Examples include an unsupported central claim, confusing causal gap, misleading title, weak retrieval question, patronising Teen voice or substantial duplication. Revise before publication.
- **MINOR** — local polish that does not undermine accuracy, comprehension or the lesson's value. It may publish if the finding is explicitly recorded and accepted under the project's merge rules.

A lesson is **Ready** only when there are no unresolved BLOCKER or IMPORTANT findings and all automated gates pass. When evidence is uncertain, the reviewer fails closed and requests revision or escalation rather than converting uncertainty into a low score.

Accuracy, usefulness and attention are separate gates. They are not averaged: an entertaining factual error, a useful lesson that loses its audience before the explanation, or an absorbing lesson with no durable value is not Ready. Attention must be maximised within the constraints of truth, accessibility and respect for the reader; manipulative suspense, sensational claims and engagement tricks do not qualify.

## Required review record

For factual and editorial review, record:

1. the exact lesson commit reviewed and the reviewer identity/system;
2. the outcome: Ready, Revise or Block;
3. findings classified as BLOCKER, IMPORTANT or MINOR;
4. for each finding, the relevant criterion, concrete passage or claim, rationale and required action;
5. source checks performed and material uncertainty that remains;
6. a separate judgement for Adult and Teen, including whether their approaches are meaningfully adapted;
7. attention evidence for each edition: the title promise, opening hook or tension, points where momentum or comprehension may drop, and whether the payoff fulfils the promise;
8. the catalogue comparison used for originality and duplication.

Do not report a numeric quality score, an averaged rubric percentage or a precision-style confidence number. Descriptive confidence is useful only when it explains what is uncertain and what evidence would resolve it.

The canonical review record is the GitHub pull-request review on the exact commit. Any accepted MINOR finding and its rationale must be recorded in the same PR conversation or merge record. `provenance.reviews` may preserve earlier lesson-level review or substantive-revision events already incorporated into the reviewed commit; it is not updated after the final exact-head review, because doing so would create a new unreviewed head.

## Author checklist

Before requesting review:

- state the central insight in one sentence;
- state the title's promise and ensure the opening reaches the interesting question immediately;
- verify the important claims against the recorded sources;
- remove any paragraph that does not improve understanding;
- define necessary terms and test the explanation without its analogy;
- check that each paragraph creates progress and that the ending delivers the promised payoff;
- read each edition independently for flow and voice;
- verify that the takeaway and retrieval answer express the same durable insight;
- compare the proposed lesson with the existing catalogue for overlap;
- run the canonical content, build and static validation gates.

## Calibration corpus

Issue #49 established the representative corpus in two stages. The first stage used the existing GPS lesson plus four publishable calibration lessons spanning science, technology and society. In project chat on 3 October 2026, the Owner reviewed the rubric and content direction, required usefulness, factual accuracy and audience attention to be explicit quality gates, and then authorised expansion. The second stage expanded the same change to 12 lesson identities across broader topics and subtopics. PR #58 and issue #49 hold the durable decision record. The additional entries add editorial range; they are not filler added to reach a count.
