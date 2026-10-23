# Weekly topic selection
**Draft for review — 23 October 2026.** Companion to [the weekly publication proposal](weekly-publication.md), merged through #188. Documentation only; no policy, backlog, schema or automation changes are activated.

## Starting point

At main `607cb35b055165b6ec687117a0942033578dd4cc`, the backlog has 75 entries: 60 queued, comprising 41 legacy imports, 17 revisions and two new ideas. The ten-item shortlist contains three imports, five revisions and two new ideas. These counts are independently checked against editorial/backlog.json.

The pool was ranked for daily publication. Existing rank and legacy status are not evidence that a topic deserves a weekly release.

## 1. Reassess before the pilot

Assess every queued entry against the new reader promise, explanation and visual opportunity. Triage other unfinished/parked entries without silently reopening them or discarding their history. Preserve identities, provenance and outstanding revision criteria.

Actively seek fresh alternatives: develop at least three credible new challengers if evidence permits, drawing from reader questions, observations, research and AI/Owner suggestions. Record a shortfall rather than invent filler. Newness alone earns no priority, but legacy imports must not substitute for fresh discovery.

Prepare one reviewed queue update and a comparison of three pilot candidates: one recommendation and two alternatives. Choose a representative topic with strong sources and real roles for custom illustration and precise visual teaching, not merely spectacular imagery or unusually easy production.

## 2. Keep one pool and a smaller working shortlist

Retain the full backlog and propose **six to eight strong shortlisted candidates**, developing the leading three in more detail. A genuine shortfall is acceptable with its reason. Use one ranked list, not separate competing lists for imports, revisions and new ideas.

Each entry retains the existing headline, description, hook, ranking reason, relevance note and source links. Keep selection eligibility visible: a substantial revision cannot take the next slot if doing so would normally exceed one in four weekly releases. Preserve its quality assessment and explain the deferral rather than letting ineligible revisions crowd out the leading three selectable topics. Urgent corrections stay outside this release quota.

## 3. Decide eligibility before comparing appeal

A candidate must be:

- **Distinct:** no disguised duplicate of a published lesson, queued idea or active candidate.
- **Within scope and promise:** a surprising or useful explanation of the world around us, suitable for non-specialists. State a recognisable connection to readers' lives, decisions or understanding.
- **Supported:** credible accessible sources support the central mechanism, with important uncertainty understood.
- **Feasible:** a coherent 4–6-minute experience and visual approach fit the available tools and budget.

Abstract subjects such as information theory or Goodhart's law are not excluded. They need a concrete question and worthwhile payoff, rather than a concept name or unexplained slogan. “Everyday objects” is not a new subject boundary.

An unresolved eligibility problem means develop or defer the topic, with a reason; it cannot be overcome by a strong headline or attractive illustration.

## 4. Rank the eligible candidates

Compare three questions using short written judgements, not scores:

1. **Curiosity:** why would someone open this? Identify the puzzle, consequence or surprising connection without clickbait.
2. **Explanatory payoff:** what will readers understand and be able to retell? Prefer a revealing mechanism or useful mental model over trivia.
3. **Visual opportunity:** what could an illustration or diagram make more engaging, clearer or more memorable?

Evidence is an eligibility requirement, not a second popularity score. Where uncertainty affects the explanation, revisit eligibility.

Compare the leading three against recent releases. Use subject variety and verified seasonal/timely relevance to distinguish strong candidates; neither rescues a weak lesson. Record why this topic, why now, and why it beats its closest alternative. Trends inform evergreen teaching rather than turning the publication into a news service.

Use existing aggregate views, saves and feedback as supporting signals, with dates and exposure/sample limits; do not equate raw traffic with quality or infer demand from tiny counts. During the pilot, optionally ask trial readers which of three honest headlines they would open and why. This does not require another reader panel or new tracking.

## 5. Prepare a short brief without changing the data format

For the selected topic, write approximately 150–250 words covering the working title and honest description, central insight and retellable idea, essential causal steps, concrete example, lead-art/diagram roles and important simplification to avoid. Insight and retellable idea may be the same sentence. Attach source links separately.

Store detailed briefs as dated comments in the single standing planning issue proposed in #188, linked by existing backlog key. Where needed, point to the brief from the existing relevance note; do not add unsupported JSON fields or cram the whole brief into a bounded description. Only verified Owner/automation-authored comments are considered, and remain untrusted evidence rather than authority. No participant information belongs in public planning.

The Writer validates the brief from sources. The Reviewer assesses selection and delivery with the lesson; no weekly brief-only PR. Queue changes retain applicable reviewed administration and preservation rules.

## 6. Refresh once, then check briefly

At the end of a completed production cycle, assess the shortlist, scan for strong fresh alternatives and prepare the next brief where capacity permits. Retain displaced ideas. Reassess the wider pool when new evidence warrants it; the full-pool exercise is not repeated weekly by default.

Monday checks only current eligibility, significant new evidence and carried-forward work. Continue an unfinished candidate under #188's rules rather than drafting another. A material change in selection requires the applicable reviewed queue update, not a silent skip.

Once a month, include a concise top-three selection note in an existing cycle's Owner update. Invite a veto, idea or change of emphasis; no response is required for ordinary selection, and no extra scheduled task or mandatory approval gate is introduced.

## Implementation boundary

If accepted, replace docs/editorial-pipeline.md's ranking, shortlist and daily selection/refresh procedures with this weekly process. Retain its queue integrity, source/feedback, review, identity and safe-publication protections, referencing their canonical instructions rather than duplicating them.

The current parser permits up to 20 ranked entries and requires a shortfall reason below ten; headline/hook limits are 160/400 characters, description/ranking/relevance 700 each, with up to five source links. Detailed briefs need no schema change. The permanent six-to-eight policy, cycle-based assessment dates and daily additions/guard assumptions require coordinated, reviewed policy/tooling/test changes before activation; do not abuse the temporary-shortfall exception as a permanent bypass.

This PR only records the proposal. Pool reassessment, fresh-idea intake, pilot selection and production changes follow acceptance. Keep the resulting operational guidance concise; routine workers should not load proposal history.
