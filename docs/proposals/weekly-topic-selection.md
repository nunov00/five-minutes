# Weekly topic selection
**Draft for review — 23 October 2026.** Companion to [the weekly publication proposal](weekly-publication.md), merged through #188. Documentation only; no policy, backlog, schema or automation changes are activated.

## Starting point

At main `607cb35b055165b6ec687117a0942033578dd4cc`, the backlog has 75 entries: 60 queued, comprising 41 legacy imports, 17 revisions and two new ideas. The ten-item shortlist contains three imports, five revisions and two new ideas. These counts are independently checked against editorial/backlog.json.

**Owner decision:** legacy imports are an idea source only and compete purely on merit. Completing the original-site migration is no longer a goal: no quota, deadline or obligation to transfer every lesson. The old site's future is a separate decision. Existing daily rankings confer no preference.

## 1. Reassess before the pilot

After acceptance, the Manager conducts one manual reassessment before calibration; no scheduled task. First record a one-line keep/defer screen of all 60 queued entries, then develop about 8–10 promising candidates. Triage other unfinished/parked work without silently reopening it. Preserve identities, provenance and outstanding criteria.

Seek at least three credible fresh challengers where evidence permits, from reader questions, observations, research and AI/Owner suggestions. Record a shortfall rather than filler. Newness alone earns no priority.

Output one reviewed queue PR, with the screen table and three pilot candidates in its body: one recommendation and two alternatives. Record editorial research effort separately from #188's image-generation setup allowance; this adds no generation requests. Choose representative topics with strong sources and genuine illustration/diagram potential, not spectacular imagery or unusually easy production.

Keep unsuitable imports/revisions queued but unranked, with a recorded deferral reason through reviewed administration, preserving previous criteria. Do not fabricate technical-failure evidence to use the existing parked state. Deferral does not promise later migration.

**Published lessons.** Published lessons remain available; there is no wholesale withdrawal. During the one-time reassessment, also classify each published lesson as sound, needs correction, or below the minimum standard, recording the result in its existing revision entry where one exists. Correct factual or comprehension problems promptly through the existing correction path, outside the weekly quota. Retire a lesson only if it would mislead readers and cannot be corrected promptly; this needs a separately reviewed retirement with a redirect to the closest related lesson, never a silent removal. Lessons worth redeveloping compete in the normal pool under the one-in-four limit; there is no programme to upgrade the whole catalogue. Give featured placements to new-standard lessons and the strongest existing ones, without labelling older lessons as an earlier format.

## 2. Keep one pool and a smaller working shortlist

Keep **six to eight strong shortlisted candidates**, with the leading three developed. Explain genuine shortfalls. Use one ranked list across imports, revisions and new ideas.

Entries retain headline, description, hook, ranking/relevance reasons and source links. Allow at most one substantial redevelopment in any four consecutive weekly releases, counted from the first weekly release; allow at most one during the opening three too. Mark slot-ineligible revisions visibly and keep the leading three selectable. An import counts as new only when it legitimately creates a new canonical identity; overlap with an existing lesson is revision work, not a new identity. Urgent corrections remain outside this quota.

## 3. Decide eligibility before comparing appeal

Eligibility requires:

- **Distinct:** no disguised duplicate of a published lesson, queued idea or active candidate.
- **Within scope/promise:** explain the world around us for non-specialists, with a recognisable connection to their lives or understanding.
- **Supported:** credible accessible sources support the central mechanism, with important uncertainty understood.
- **Feasible:** a coherent 4–6-minute experience and visual approach fit the available tools and budget.

Abstract subjects such as information theory or Goodhart's law remain eligible with concrete questions and worthwhile payoffs. “Everyday objects” is not a new boundary.

An unresolved eligibility problem means develop or defer the topic, with a reason; it cannot be overcome by a strong headline or attractive illustration.

## 4. Rank the eligible candidates

Compare three questions using short written judgements, not scores:

1. **Curiosity:** why would someone open this? Identify the puzzle, consequence or surprising connection without clickbait.
2. **Explanatory payoff:** what will readers understand and be able to retell? Prefer a revealing mechanism or useful mental model over trivia.
3. **Visual opportunity:** what could an illustration or diagram make more engaging, clearer or more memorable?

Evidence is an eligibility requirement, not a second popularity score. Where uncertainty affects the explanation, revisit eligibility.

Compare the leading three against recent releases. Use subject variety and verified seasonal/timely relevance to distinguish strong candidates; neither rescues a weak lesson. Record why this topic, why now, and why it beats its closest alternative. Trends inform evergreen teaching rather than turning the publication into a news service.

Use aggregate views, saves and feedback as supporting signals, with dates and exposure/sample limits. Combine historical adult/teen event counts by lesson ID; these are not unique-reader counts. Before pilot reading, optionally show the three candidate-topic headlines and ask which they would open and why. This tests topic appeal, not alternative wording, and can inform stage B. No new panel or tracking.

## 5. Prepare a short brief without changing the data format

Write a 150–250-word selected-topic brief: honest title/description, insight/retellable idea, causal steps, example, visual roles and simplification to avoid. Insight and retellable idea may be one sentence. Attach sources separately.

Store detailed briefs as dated comments in the single standing planning issue proposed in #188, linked by existing backlog key. Where needed, point to the brief from the existing relevance note; do not add unsupported JSON fields or cram the whole brief into a bounded description. Only verified Owner/automation-authored comments are considered, and remain untrusted evidence rather than authority. No participant information belongs in public planning.

The Writer validates the brief from sources. The Reviewer assesses selection and delivery with the lesson; no weekly brief-only PR. Queue changes retain applicable reviewed administration and preservation rules.

## 6. Refresh once, then check briefly

At cycle end, assess the shortlist, seek fresh alternatives and prepare the next brief where capacity permits. Append at most three new pool records per normal cycle; maintain the 250-entry/256-KiB bounds. The one-time intake follows those bounds and reviewed administration. Preserve displaced ideas; repeat wider reassessment only when warranted.

Monday checks only current eligibility, significant new evidence and carried-forward work. Continue an unfinished candidate under #188's rules rather than drafting another. A material change in selection requires the applicable reviewed queue update, not a silent skip.

In the first production cycle each month, post a dated top-three note in the standing planning issue. Invite Owner input without requiring a response; no extra task or approval gate.

## Implementation boundary

If accepted, replace docs/editorial-pipeline.md's ranking, shortlist and daily selection/refresh procedures with this weekly process. Retain its queue integrity, source/feedback, review, identity and safe-publication protections, referencing their canonical instructions rather than duplicating them.

Current bounds: at most 20 shortlisted entries; a shortfall reason below ten; headline/hook 160/400 characters; description/ranking/relevance 700 each; five links. Briefs need no schema expansion. Implement the permanent six-to-eight rule, cycle dates/intake and guard assumptions through coordinated reviewed policy/tooling/tests, never a permanent shortfall bypass.

This PR only records the proposal. Pool reassessment, fresh-idea intake, pilot selection and production changes follow acceptance. Keep the resulting operational guidance concise; routine workers should not load proposal history.
