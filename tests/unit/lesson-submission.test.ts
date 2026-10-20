import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, chmodSync, readFileSync, utimesSync } from 'node:fs';
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
  it.each(['clean', 'process'])('never runs a configured %s filter on unchanged or dirty bytes', driver => {
    const repo = candidate();
    const marker = join(repo.cwd, '.git', 'filter-executed');
    repo.put('.git/info/attributes', '*.md filter=probe\n');
    repo.git('config', `filter.probe.${driver}`, `sh -c 'touch "${marker}"; ${driver === "clean" ? "cat" : "exit 1"}'`);
    repo.git('config', 'filter.probe.required', 'true');
    const path = `src/content/lessons/2026/${slug}/adult.md`;
    const bytes = readFileSync(join(repo.cwd, path));
    const later = new Date(Date.now() + 10_000);
    utimesSync(join(repo.cwd, path), later, later);
    expect(prepareLessonSubmission({ ...repo, now }).status).toBe('PREPARED');
    expect(existsSync(marker)).toBe(false);
    repo.put(path, bytes.toString() + 'Uncommitted change.\n');
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/clean/);
    expect(existsSync(marker)).toBe(false);
  });
  it.each(['staged', 'removed', 'assume-unchanged'])('rejects %s worktree/index divergence without conversion', state => {
    const repo = candidate();
    const path = `src/content/lessons/2026/${slug}/adult.md`;
    if (state === 'removed') rmSync(join(repo.cwd, path));
    else {
      if (state === 'assume-unchanged') repo.git('update-index', '--assume-unchanged', path);
      repo.put(path, readFileSync(join(repo.cwd, path)).toString() + 'Uncommitted change.\n');
      if (state === 'staged') repo.git('add', path);
    }
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/clean/);
  });
  it.each([0, 1, 2])('reads all parents of a signed %i-parent candidate without invoking GPG', count => {
    const repo = candidate();
    const old = repo.git('rev-parse', 'HEAD');
    const marker = join(repo.cwd, '.git', 'gpg-executed');
    const verifier = join(repo.cwd, '.git', 'candidate-gpg');
    writeFileSync(verifier, `#!/bin/sh\ntouch '${marker}'\nexit 0\n`);
    chmodSync(verifier, 0o755);
    const original = repo.git('cat-file', 'commit', old);
    const parents = count === 0 ? '' : `parent ${repo.base}\n${count === 2 ? `parent ${old}\n` : ''}`;
    const raw = original.replace(`parent ${repo.base}\n`, parents)
      .replace('\n\n', `\ngpgsig -----BEGIN PGP SIGNATURE-----\n synthetic-signature\n parent ${old}\n -----END PGP SIGNATURE-----\n\n`)
      + `\nparent ${old}\n`; // Message/continuation text must not count as parents.
    const signed = execFileSync('git', ['hash-object', '-t', 'commit', '-w', '--stdin'], { cwd: repo.cwd, input: raw }).toString().trim();
    repo.git('update-ref', 'HEAD', signed, old);
    repo.git('config', 'log.showSignature', 'true');
    repo.git('config', 'gpg.program', verifier);
    if (count === 1) expect(prepareLessonSubmission({ ...repo, now }).status).toBe('PREPARED');
    else expect(() => prepareLessonSubmission({ ...repo, now })).toThrow(/exactly one parent/);
    expect(existsSync(marker)).toBe(false);
  });
  it('does not invoke a configured remote helper to lazy-fetch a missing candidate blob', () => {
    const repo = candidate();
    const marker = join(repo.cwd, '.git', 'remote-executed');
    const remote = join(repo.cwd, '.git', 'candidate-remote');
    writeFileSync(remote, `#!/bin/sh\ntouch '${marker}'\nexit 1\n`);
    chmodSync(remote, 0o755);
    repo.git('config', 'extensions.partialClone', 'origin');
    repo.git('config', 'remote.origin.promisor', 'true');
    repo.git('config', 'remote.origin.url', `ext::/bin/sh ${remote}`);
    repo.git('config', 'protocol.ext.allow', 'always');
    const sha = repo.git('rev-parse', `HEAD:src/content/lessons/2026/${slug}/adult.md`);
    rmSync(join(repo.cwd, '.git', 'objects', sha.slice(0, 2), sha.slice(2)));
    expect(() => prepareLessonSubmission({ ...repo, now })).toThrow();
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
const success = () => PUBLICATION_CHECKS.map((name, i) => ({ name, id: i + 1, app: { slug: 'github-actions' }, details_url: `https://github.com/nunov00/five-minutes/actions/runs/${i + 10}/job/${i + 1}`, head_sha: head, status: 'completed', conclusion: 'success', started_at: now }));
const runs = () => PUBLICATION_CHECKS.map((name, i) => ({
  id: i + 10, repository: { full_name: 'nunov00/five-minutes' }, head_repository: { full_name: 'nunov00/five-minutes' }, head_sha: head,
  path: `.github/workflows/${name === 'baseline' || name === 'e2e' ? 'ci' : name}.yml`,
  event: name === 'lesson-guard' ? 'pull_request_target' : 'pull_request',
}));
describe('complete exact-head publication checks', () => {
  it('requires all four check names, regardless of workflow event', () => {
    const checks = success();
    expect(assessPublicationChecks(head, checks, runs()).readyForReview).toBe(true);
    expect(assessPublicationChecks(head, checks.filter(c => c.name !== 'lesson-guard'), runs()).readyForReview).toBe(false);
  });
  it('ignores successes on a different commit', () => {
    expect(assessPublicationChecks(head, success().map(c => ({ ...c, head_sha: 'b'.repeat(40) })), runs()).readyForReview).toBe(false);
  });
  it.each(['queued', 'in_progress', 'completed'])('never hides a newer %s run behind old success', status => {
    const checks = [...success(), { ...success()[2], id: 100, status, conclusion: 'failure', started_at: null }];
    const result = assessPublicationChecks(head, checks, runs());
    expect(result.readyForReview).toBe(false);
    expect(result.checks.find(c => c.name === 'lesson-guard')?.state).toBe(status === 'completed' ? 'failure' : 'pending');
  });
  it('rejects missing producer evidence, a same-name foreign app and wrong workflow/event/head/repository', () => {
    expect(assessPublicationChecks(head, success()).readyForReview).toBe(false);
    const checks = success(); checks[0].app.slug = 'other-app';
    expect(assessPublicationChecks(head, checks, runs()).readyForReview).toBe(false);
    for (const change of [{ event: 'workflow_dispatch' }, { path: '.github/workflows/other.yml' }, { head_sha: 'b'.repeat(40) }, { repository: { full_name: 'other/repo' } }]) {
      const evidence = runs(); Object.assign(evidence[0], change);
      expect(assessPublicationChecks(head, success(), evidence).readyForReview).toBe(false);
    }
  });
  it('fails closed on malformed ordering data', () => {
    expect(() => assessPublicationChecks(head, [{ ...success()[0], id: undefined }], runs())).toThrow();
  });
});
