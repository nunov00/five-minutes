import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { weeklyCycle } from './weekly-cycle.mjs';
import { evaluateLessonPullRequest } from './lesson-guard-core.mjs';
import { assessPublicationChecks, PUBLICATION_CHECKS } from './lesson-submission.mjs';

const SHA = /^[0-9a-f]{40}$/;
const fail = message => { throw new Error(message); };

// This validates a live API snapshot collected by the Manager, not arbitrary
// candidate assertions. It is a decision aid, never a merge credential or CI override.
export function assessWeeklyPublication(input) {
  const { guardInput, checks, workflowRuns, author, reviewer, rounds, published, paused, enabled, now } = input;
  const cycle = weeklyCycle(now);
  if (cycle.stage !== 'publication') fail('Weekly publication is Friday only in Europe/Zurich.');
  if (paused !== false || enabled !== true || published !== false) fail('Pause, task or publication-slot state is unsafe or uncertain.');
  if (!guardInput || guardInput.now !== now || !guardInput.pr?.headRef?.startsWith(`weekly-lesson/${cycle.sunday}/`)) fail('Supply a fresh current-cycle guard snapshot.');
  const guarded = evaluateLessonPullRequest(guardInput);
  if (!guarded.applicable) fail('Weekly boundary was not validated.');
  if (Date.parse(guarded.releaseAt) > Date.parse(now)) fail('Intended Friday release time has not arrived.');
  const head = guardInput.pr.headSha;
  if (!SHA.test(head)) fail('Invalid candidate SHA.');
  const status = assessPublicationChecks(head, checks, workflowRuns);
  if (!status.readyForReview) fail('All four current-head checks and their workflow producers must pass.');
  const latest = PUBLICATION_CHECKS.map(name => checks.filter(c => c.name === name && c.head_sha === head).sort((a,b) => b.id-a.id)[0]);
  if (latest.some(c => !Number.isFinite(Date.parse(c.completed_at)) || Date.parse(c.completed_at) > Date.parse(now))) fail('Check completion timestamps are incomplete or future.');
  if (!Array.isArray(rounds) || rounds.length < 1 || rounds.length > 4
    || rounds.some((r,i) => r.round !== i+1 || !SHA.test(r.head ?? ''))
    || new Set(rounds.map(r => r.head)).size !== rounds.length || rounds.at(-1)?.head !== head) fail('Require the reconciled one-to-four-round review ledger, without resets or duplicate heads.');
  for (const [record, provider, kind] of [[author,'openai','author-quality'],[reviewer,'anthropic','editorial-review']]) {
    const receipt = record?.receipt;
    if (!Number.isSafeInteger(record?.id) || record.id < 1 || record.authorLogin !== 'nunov00'
      || !Number.isFinite(Date.parse(record.createdAt)) || Date.parse(record.createdAt) > Date.parse(now)
      || weeklyCycle(record.createdAt).sunday !== cycle.sunday
      || receipt?.kind !== kind || receipt.provider !== provider || receipt.head !== head
      || !Number.isInteger(receipt.lessonQuality) || receipt.lessonQuality < 9 || receipt.lessonQuality > 10
      || !Number.isInteger(receipt.topicAppeal) || receipt.topicAppeal < 1 || receipt.topicAppeal > 10
      || receipt.outcome !== 'Ready' || receipt.unresolvedBlockerImportant !== 0
      || receipt.sources !== 'pass' || receipt.phoneAndWideRender !== 'pass') fail('Require separate exact-head Codex and Claude Ready evidence, both lesson quality at least 9, with sources and renders checked.');
  }
  if (author.id === reviewer.id) fail('Author and reviewer evidence must be separate comments.');
  if (latest.some(c => Date.parse(c.completed_at) > Date.parse(reviewer.createdAt))) fail('Claude must review after all four exact-head checks complete.');
  return { eligible: true, cycle: cycle.sunday, head, slug: guarded.slug,
    expectedHeadSha: head, caveat: 'Recheck live main/head, pause, slot, unresolved feedback and provenance immediately before guarded merge; verify deployment afterwards.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 3) fail('Usage: weekly-publication.mjs <fresh-manager-snapshot.json>');
    console.log(JSON.stringify(assessWeeklyPublication(JSON.parse(readFileSync(process.argv[2], 'utf8'))), null, 2));
  } catch (error) {
    console.error(`weekly-publication: FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
