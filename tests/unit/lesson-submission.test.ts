import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { prepareLessonSubmission, assessPublicationChecks, PUBLICATION_CHECKS } from '../../scripts/lesson-submission.mjs';
import { lessonBranchName } from '../../scripts/lesson-guard-core.mjs';

const repos: string[] = [];
afterEach(() => repos.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));
const slug = 'why-shadows-change';
const id = '12345678-1234-4234-9234-123456789abc';
const now = '2026-10-05T06:00:00+02:00';
function candidate(branch = `lesson/${slug}`) {
  const cwd = mkdtempSync(join(tmpdir(), 'lesson-preflight-'));
  repos.push(cwd);
  const git = (...args: string[]) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  const put = (path: string, text: string) => {
    mkdirSync(dirname(join(cwd, path)), { recursive: true });
    writeFileSync(join(cwd, path), text);
  };
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@users.noreply.github.com');
  put('src/content/route-ownership.json', '{}\n');
  put('editorial/backlog.json', '{"version":1,"entries":[]}\n');
  git('add', '.'); git('commit', '-m', 'base');
  const base = git('rev-parse', 'HEAD');
  git('switch', '-c', branch);
  put('src/content/route-ownership.json', JSON.stringify({ [slug]: id }) + '\n');
  const root = `src/content/lessons/2026/${slug}`;
  put(`${root}/lesson.yaml`, `schemaVersion: 2\nid: ${id}\nslug: ${slug}\naliases: []\npublishedAt: 2026-10-05T05:00:00+02:00\ntopic: science\nsubtopic: astronomy\nconcepts: [shadows]\nrelated: {manual: [], exclude: []}\nsources: []\nprovenance:\n  createdAt: 2026-10-05T04:30:00+02:00\n  createdBy: {type: ai, provider: openai, model: test, promptVersion: test}\n  reviews: []\n`);
  for (const edition of ['adult', 'teen']) put(`${root}/${edition}.md`, '---\ntitle: Shadows\ndescription: A description.\ntakeaway: A takeaway.\nquestion: Why?\nanswer: Light.\nsearchTerms: [shadows]\n---\nBody.\n');
  const commit = () => { git('add', '.'); git('commit', '-m', 'candidate'); };
  commit();
  return { cwd, base, git, put, commit };
}

describe('initial lesson submission preflight', () => {
  it('derives the exact branch, validates real Git blobs and leaves all refs unchanged', () => {
    const repo = candidate('draft');
    const refs = repo.git('show-ref');
    expect(prepareLessonSubmission({ ...repo, now })).toMatchObject({ status: 'PREPARED', branch: `lesson/${slug}`, slug });
    expect(repo.git('show-ref')).toBe(refs);
    expect(repo.git('status', '--porcelain')).toBe('');
  });
  it('does not execute a candidate-configured filesystem monitor', () => {
    const repo = candidate();
    const hook = join(repo.cwd, '.git', 'candidate-monitor');
    const marker = join(repo.cwd, '.git', 'executed');
    writeFileSync(hook, `#!/bin/sh\ntouch '${marker}'\n`);
    chmodSync(hook, 0o755);
    repo.git('config', 'core.fsmonitor', hook);
    expect(prepareLessonSubmission({ ...repo, now }).status).toBe('PREPARED');
    expect(existsSync(marker)).toBe(false);
  });
  it('accepts the correct branch but rejects the original date-prefix mistake', () => {
    expect(prepareLessonSubmission({ ...candidate(), now }).branch).toBe(`lesson/${slug}`);
    expect(() => prepareLessonSubmission({ ...candidate(`lesson/2026-10-05-${slug}`), now })).toThrow(/differs from the generated branch/);
  });
  it('shares strict branch generation with the remote guard', () => {
    expect(lessonBranchName(slug, '2026-10-05')).toBe(`lesson/${slug}-2026-10-05`);
    for (const invalid of ['2026-02-30', '2026-10-05-extra']) expect(() => lessonBranchName(slug, invalid)).toThrow();
    expect(() => lessonBranchName('../escape')).toThrow();
  });
  it('rejects stale dates, dirty candidates and extra commits before submission', () => {
    const repo = candidate();
    expect(() => prepareLessonSubmission({ ...repo, now: '2026-10-06T06:00:00+02:00' })).toThrow();
    repo.put('unexpected.txt', 'extra');
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/clean/);
    repo.commit();
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/exactly one parent/);
  });
  it('passes forbidden scope to the shared guard rather than silently dropping it', () => {
    const repo = candidate();
    repo.git('reset', '--soft', repo.base);
    repo.put('scripts/unsafe.mjs', 'throw new Error("must never execute");'); repo.commit();
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/Candidate may change only/);
  });
  it('blocks branch collisions and unsupported retries without creating a replacement', () => {
    const repo = candidate('draft');
    repo.git('branch', `lesson/${slug}`, repo.base);
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/already belongs/);
    expect(() => prepareLessonSubmission({ ...repo, now, retry: true })).toThrow(/Retry needs/);
  });
});

const head = 'c'.repeat(40);
const success = () => PUBLICATION_CHECKS.map((name, i) => ({ name, id: i + 1, head_sha: head, status: 'completed', conclusion: 'success', started_at: now }));
describe('complete exact-head publication checks', () => {
  it('requires all four check names, regardless of workflow event', () => {
    const checks = success();
    expect(assessPublicationChecks(head, checks).readyForReview).toBe(true);
    expect(assessPublicationChecks(head, checks.filter(c => c.name !== 'lesson-guard')).readyForReview).toBe(false);
  });
  it('ignores successes on a different commit', () => {
    expect(assessPublicationChecks(head, success().map(c => ({ ...c, head_sha: 'b'.repeat(40) }))).readyForReview).toBe(false);
  });
  it.each(['queued', 'in_progress', 'completed'])('never hides a newer %s run behind old success', status => {
    const checks = [...success(), { name: 'lesson-guard', id: 100, head_sha: head, status, conclusion: 'failure', started_at: null }];
    expect(assessPublicationChecks(head, checks).readyForReview).toBe(false);
  });
  it('fails closed on malformed ordering data', () => {
    expect(() => assessPublicationChecks(head, [{ ...success()[0], id: undefined }])).toThrow();
  });
});
