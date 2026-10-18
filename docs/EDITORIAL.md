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
| Memorability and payoff | A specific mental picture, example, connection or piece of reasoning makes the central insight easier to retain. The ending resolves the opening or reveals a worthwhile implication. | No clear answer to what the reader might remember tomorrow; a striking detail is unrelated to the mechanism; the ending is a recap list. |
| Adult presentation | Adult writing is intelligent, economical and precise, and adds a meaningful explanatory layer beyond Teen: a deeper causal step, useful technical concept, implication, trade-off or boundary. Explain technical terms immediately and assume no specialist knowledge. | Corporate or textbook tone; extra length or vocabulary substitutes for depth; the two editions offer essentially the same understanding. |
| Teen presentation | Teen writing is engaging and natural, with a complete, accurate central explanation. It may choose a different hook, example and structure from Adult. It never relies on forced slang, trend references or a patronising voice. | The Adult version is merely shortened; slang tries to manufacture relevance; the reader is talked down to; a necessary mechanism or qualification disappears. |
| Title, deck and discoverability | Each edition has a specific, accurate title and a description that adds information. Search terms cover likely language a reader would use without stuffing synonyms. | Clickbait, vague titles, duplicated title/description, promises absent from the body or irrelevant search terms. |
| Originality and non-duplication | The lesson has a distinct central insight and treatment. Before publication, compare its identity, title, concepts, takeaway and examples with the catalogue. Overlap is acceptable only when the new lesson answers a materially different question. | A new title hides the same lesson; familiar material is paraphrased without a fresh explanatory angle; Adult and Teen differ only cosmetically. |

## Writing for understanding and memory

Build the lesson around one worthwhile insight, rather than a sequence of facts about a topic:

- **Give the reader a reason to care early.** A puzzle, surprising observation, recognisable situation or practical consequence can establish the question. Make the stakes concrete and proportionate; do not invent urgency or promise a life-changing application.
- **Explain the mechanism.** Connect cause and effect without skipping the step that makes the result intelligible. An analogy should help the reader follow that reasoning; the explanation must still work when the analogy is removed. If an analogy needs so many disclaimers that its image stops helping, replace it.
- **Choose something that sticks.** A mental picture, revealing example, useful comparison, sourced number or explanatory figure can anchor the insight. Choose what serves this topic. No lesson must contain every device, and no number or diagram should be added merely to meet a quota.
- **Show where the idea leads.** Develop a consequence, application or connection that helps the reader see something familiar differently. Keep it within the lesson's evidence and scope.
- **Deliver a payoff.** Resolve the opening question or draw out an implication. Avoid a final list that repeats the body; the reading page already provides the separate takeaway after retrieval.

These are reader outcomes, not a compulsory five-part outline. Vary the structure and voice with the idea. All added facts, numbers and implications need the same source checking as the central explanation. Interesting wording never justifies overstating a claim.

## Figures and Teen activities

Every new lesson, migrated lesson and substantial editorial pass must explicitly assess whether each presentation would become clearer with a figure. Add one when a spatial, sequential, comparative, quantitative or causal relationship is materially easier to understand visually. Omit it when prose is already clearer, the image would be decorative, or no vetted app-owned visual style explains the idea faithfully; record that decision and its reason in the Pull Request. Figures remain conditional rather than a quota, but they must not be skipped by default. Never approximate an illustration with generic stacked text boxes merely to satisfy the assessment: no figure is better than a weak figure.

A figure is part of an individual presentation and is reviewed with the same factual standard as its prose. Reviewers verify every label, scale, relationship and caption against the lesson's sources, and confirm that required alt text communicates the explanatory purpose rather than merely naming the picture. Adult and Teen may use different figures/captions. Review the full-text description as an equivalent explanation, and mark schematic drawings as not to scale where appropriate. The concrete field shapes and limits are in [M6.2 reading enhancements](implementation/m6.2-reading-enhancements.md).

Figure review is performed on the exact-head rendered page at phone and wide viewports, not from front matter or component source alone. Before its description is expanded, the figure must communicate its basic relationship; labels must remain legible, unclipped and clear of meaningful artwork; numbered stages must visibly correspond to the mechanism; and the visual must earn the space it occupies. Automated containment, collision, clipping and overflow checks are necessary but cannot establish explanatory quality. Record `FIGURE: PASS`, `FIGURE: OMIT` or `FIGURE: REWORK` for each edition with the inspected route, viewports and reason. An included figure that needs its prose description merely to decode the drawing is `REWORK`, normally an IMPORTANT finding.

Only the safe representations defined by ADR-0006 and the reusable [figure toolkit](implementation/figure-toolkit.md) are publishable: application-rendered diagrams from validated structured data or local PNG/WebP assets within configured size/file-count limits. Structured figures must select a named, vetted visual style/pattern and meaningful semantic symbols matching the lesson; the Writer cannot supply colours, coordinates or drawing instructions. Lesson-authored SVG, HTML, remote images and executable embeds are not accepted. A useful diagram blocked by missing capability or verification must be recorded as `VISUAL GAP`, with a concrete proposal and missing evidence/capability; assess the static fallback before omitting it. For rasters in all daily candidates (including revised imported lessons) and in other non-imported lessons, persist creation/origin/licence evidence in per-asset imageRights records in lesson.yaml; verify those records against actual evidence rather than accepting self-attestation. Strip text/EXIF/XMP/private metadata and ICC profiles. For each raster, verify browser decoding and natural dimensions, and never treat container validation as proof of visual correctness.

Every new or migrated Teen presentation and substantial Teen editorial pass must explicitly assess whether a lightweight prediction or choice would help the reader engage with the mechanism. Include an activity when committing to an answer, ordering possibilities or choosing between plausible explanations makes the subsequent explanation more effective. Omit it, with the reason recorded in the Pull Request, when it would merely repeat **Test yourself**, interrupt the flow or force artificial gamification. Activities are invitations to think, not a quota or decoration.

Reviewers verify that the prompt is unambiguous, every option is plausible in context, the marked/recommended answer is correct, and the explanation follows from the lesson without introducing unsupported claims. Wrong options should express plausible misconceptions that the explanation helps resolve, rather than be obviously absurd or give away the answer through wording. Apply that principle to any choice-based retrieval question too; open questions need no invented options. The activity must remain understandable and revealable without JavaScript and must not patronise the reader.

## Research and source practice

Prefer primary, official or otherwise authoritative sources for factual foundations. A secondary source may help explain or contextualise a subject, but it should not be the only support for a claim it merely repeats. Match each source to the claims it can actually establish.

Check dates for facts that can change. For contested or consequential claims, seek independent support and describe the disagreement or uncertainty. Do not turn a popular paraphrase into a verbatim quotation or imply that a later formulation appeared in an original work. Source metadata belongs in `lesson.yaml`; prose links are optional and should serve the reader rather than act as footnotes for every sentence.

## Adult and Teen relationship

Adult and Teen are two presentations of one lesson identity. They use shared sources and taxonomy to teach the same central insight, but their outlines and supporting detail may differ. Their factual accounts must be consistent, and any additional claims in either edition must be supported by the shared source record. Adapt the route into the idea: a Teen presentation can start from school, games, a phone or another familiar situation when that example genuinely clarifies the concept. Adult can move more quickly into abstraction. Neither edition is the default or the complete version.

Both editions must preserve qualifications that affect truth. Simpler language means shorter sentences, explained terms and well-chosen examples; it does not mean removing the mechanism or pretending that a complex idea has no limits.

Adult must answer: **What worthwhile understanding does this add beyond Teen?** Identify one specific additional layer, and develop it enough to explain something. More words, formal phrasing or an unexplained technical name do not count. Teen remains a complete lesson, not a teaser for Adult: do not manufacture the distinction by removing essential reasoning from Teen. Both editions deserve memorable examples and a satisfying payoff; Adult may reuse a strong Teen image when it helps.

| Teen emphasis | Adult additional layer |
| --- | --- |
| Concrete situations and an accessible, complete central explanation | More detail in the mechanism, or a useful implication, trade-off or boundary |
| Explain technical terms when they help | Name and explain relevant technical concepts where they add understanding |
| Keep the central explanation focused | Develop one worthwhile complication without turning the lesson into a survey |

Neither edition assumes specialist knowledge. There is no required length difference.

## Review outcomes

Review findings use the project-wide severity language:

- **BLOCKER** — publication would be unsafe or untrustworthy. Examples include a material factual error, invented or misrepresented source, harmful instruction, plagiarism, identity/route conflict or a missing edition. The lesson must not publish.
- **IMPORTANT** — the lesson does not yet meet the editorial contract. Examples include an unsupported central claim, confusing causal gap, misleading title, weak retrieval question, patronising Teen voice or substantial duplication. An accurate but generic lesson also needs revision when it lacks a clear reason to care, a memorable explanation or a satisfying payoff, or when Adult adds no meaningful understanding beyond Teen. Identify the missing reader outcome and a targeted revision; do not dismiss the gap as stylistic preference. Revise before publication.
- **MINOR** — local polish that does not undermine accuracy, comprehension or the lesson's value. It may publish if the finding is explicitly recorded and accepted under the project's merge rules.

For a narrow correction to a published lesson that is not a substantial editorial pass, pre-existing weaknesses in interest, memorability/payoff or Adult's additional depth may be deferred only when the correction neither introduces nor worsens them. Record those weaknesses in a linked follow-up issue rather than requiring an unrelated rewrite before the correction can merge. Review both editions and retain all other applicable gates, including factual accuracy, source support, safety, essential causal reasoning and figure verification. New lessons and substantial editorial passes must meet the full reader-value standard.

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
9. the figure decision for each edition and the Teen activity decision, including the reason for any omission; for an included figure, record `FIGURE: PASS` or `FIGURE: REWORK`, the exact-head rendered route and the phone/wide viewports inspected.
10. a concise reader-value assessment, with passage-specific evidence rather than a generic assertion, answering these four questions:
    - **Interest:** what gives each edition's reader a reason to care early?
    - **Understanding:** how does each edition explain the mechanism, and is a crucial causal step missing?
    - **Memory:** what specific image, example, connection or reasoning might each reader remember tomorrow, and does the ending deliver its payoff? This is editorial judgement, not a claim of measured retention.
    - **Adult depth:** what meaningful additional understanding does Adult provide beyond Teen?

These answers can be incorporated into the existing per-edition and attention notes; do not duplicate the review. Missing reader outcomes require actionable findings under the severity definitions above. Check the author's claims against the actual text rather than accepting their self-assessment.

Do not report a numeric quality score, an averaged rubric percentage or a precision-style confidence number. Descriptive confidence is useful only when it explains what is uncertain and what evidence would resolve it.

The canonical review record is the GitHub pull-request review on the exact commit. Any accepted MINOR finding and its rationale must be recorded in the same PR conversation or merge record. `provenance.reviews` may preserve earlier lesson-level review or substantive-revision events already incorporated into the reviewed commit; it is not updated after the final exact-head review, because doing so would create a new unreviewed head.

## Drafting and critical self-edit

Before drafting, prepare a short working brief: the worthwhile question, the reasoning that answers it, a concrete reader connection or memory anchor, and the supported additional understanding Adult will develop beyond Teen. A named fact, longer wording or technical label is not an additional explanation. If the causal chain or Adult layer cannot be explained and sourced, improve the angle before writing. This brief guides the work; it is not a fixed lesson outline or reader-facing text.

After drafting, read Teen and Adult independently as finished lessons, then compare them. Identify the actual passages delivering the hook, causal steps, payoff and Adult depth. Test whether the reasoning still works without the analogy. Check retrieval against the central takeaway and challenge every activity distractor as a plausible misconception. Remove self-assessments such as "the memorable reversal" and let the explanation earn its value. Revise missing reader outcomes before requesting review; filling out a quality checklist is not evidence that the text achieves them. Use the calibrated examples below to judge substance while varying topics and voice.

For a requested rewrite, assess all applicable findings together, re-fetch sources for changed material claims and explain each finding's disposition with passage/evidence references. Disagree with unsupported suggestions explicitly rather than adding jargon, numbers or tangents automatically. Preserve Teen's complete explanation when deepening Adult. The later Reviewer verifies the revised result independently. ADR-0007 and the task contract bound scheduled unpublished-candidate revisions; this editorial guidance never grants merge authority.

## Author checklist

Before requesting review:

- state the central insight in one sentence;
- state the title's promise and ensure the opening reaches the interesting question immediately;
- identify the concrete reason to care and the image, example, connection or reasoning the reader could remember tomorrow;
- verify the important claims against the recorded sources;
- remove any paragraph that does not improve understanding;
- define necessary terms and test the explanation without its analogy;
- check that each paragraph creates progress and that the ending delivers the promised payoff;
- read each edition independently for flow and voice;
- identify Adult's additional explanatory layer and check that Teen still contains the complete central explanation;
- verify that the takeaway and retrieval answer express the same durable insight;
- compare the proposed lesson with the existing catalogue for overlap;
- assess a useful figure for each edition and a prediction activity for Teen; include supported additions when they improve understanding, otherwise record why they were omitted;
- inspect every included figure on the rendered page at phone and wide widths, checking meaning before expansion, collisions, clipping, hierarchy and connection between labels/stages and artwork;
- run the canonical content, build and static validation gates.

## Short editorial examples

Owner calibration direction, 17 October 2026. These are illustrative drafting contrasts, not quotations from the published lessons, factual review records or approved replacement copy. Verify any proposed factual addition against the lesson's actual sources before publishing it. All three topics already exist in the catalogue; these rows are neither new-topic suggestions nor figure decisions for those lessons. Assess figures from the actual current lesson and rendered page.

| Topic | Flat treatment | More useful direction | Adult substance to develop |
| --- | --- | --- | --- |
| Ice floating | State that ice is less dense, then repeat that it floats. | Open with a lake freezing at the surface; connect that observation to water expanding as it freezes, and return to the consequence for the water below. | Explain how hydrogen bonds arrange water molecules into a more open structure on freezing; naming the bonds alone is insufficient. A density comparison belongs only if it helps and is sourced. |
| Astronauts floating | Say that astronauts are in free fall without helping the reader picture it. | Use the falling-cabin image to explain the absence of support, then connect forward motion and Earth's curvature to orbit. Assess an orbital figure against the current toolkit. | Distinguish gravity from the support force a person feels; explain why orbital free fall can continue rather than relying on the word "weightless". A sourced gravity comparison can challenge the starting assumption. |
| Password salt | List the properties of salts and hashes, then close with another list. | Follow two people who choose the same password through an attacker's attempt to reuse work, and resolve what changes when each password has a different salt. | Explain the different jobs of a unique salt and a deliberately costly password-hashing method, and why the salt can be public. Avoid implying that salting makes a weak password safe. |

The transferable pattern is a clearer explanation with a worthwhile consequence, not a requirement to reuse these openings or impose science-style mechanisms on every subject. For a historical or conceptual lesson, show the relevant reasoning or relationships instead.

## Calibration corpus

Issue #49 established the representative corpus in two stages. The first stage used the existing GPS lesson plus four publishable calibration lessons spanning science, technology and society. In project chat on 3 October 2026, the Owner reviewed the rubric and content direction, required usefulness, factual accuracy and audience attention to be explicit quality gates, and then authorised expansion. The second stage expanded the same change to 12 lesson identities across broader topics and subtopics. PR #58 and issue #49 hold the durable decision record. The additional entries add editorial range; they are not filler added to reach a count.

## Ranked candidate pipeline

Read `docs/editorial-pipeline.md` for candidate selection, changing relevance and the daily queue-review checklist. Review both the published lesson candidate and its proposed next shortlist in the same PR. A pipeline headline is an editorial proposal, not verified factual content or permission to expand the automated topic boundary. Preserve all outstanding revision requirements; new ideas compete on reader value. Record the explicit PIPELINE outcome alongside the lesson review.
