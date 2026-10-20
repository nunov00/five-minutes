import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';
import { evaluateLessonPullRequest, lessonBranchName, LessonGuardError } from './lesson-guard-core.mjs';

const REGISTRY = 'src/content/route-ownership.json';
const BACKLOG = 'editorial/backlog.json';
const LESSON = /^src\/content\/lessons\/\d{4}\/([a-z0-9-]+)\/(adult\.md|teen\.md|lesson\.yaml)$/;
const SHA = /^[0-9a-f]{40}$/;
export const PUBLICATION_CHECKS = Object.freeze(['baseline', 'e2e', 'lesson-guard', 'privacy']);

function fail(message) { throw new LessonGuardError(message); }

// Read Git objects only. Never execute candidate code, hooks, filters or remote operations.
export function prepareLessonSubmission({ cwd = process.cwd(), base, now = new Date().toISOString(), retry = false } = {}) {
  if (!SHA.test(base ?? '')) fail('Supply the freshly verified main commit SHA.');
  const git = (...args) => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, env: { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' }, maxBuffer: 16 * 1024 * 1024 });
  const text = (...args) => git(...args).toString('utf8').trim();
  const head = text('rev-parse', '--verify', 'HEAD^{commit}');
  if (text('status', '--porcelain', '--untracked-files=all')) fail('Commit the complete candidate first; working tree must be clean.');
  if (text('show', '-s', '--format=%P', head) !== base) fail('Initial candidate must have exactly one parent: current main.');

  const fields = git('diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-status', '-z', base, head).toString('utf8').split('\0');
  const files = [];
  for (let i = 0; i < fields.length && fields[i]; i += 2) {
    const status = { A: 'added', M: 'modified', D: 'removed' }[fields[i]];
    files.push({ filename: fields[i + 1], status, additions: 0, deletions: 0, changes: 0 });
  }
  const counts = git('diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--numstat', '-z', base, head).toString('utf8').split('\0');
  for (const row of counts.filter(Boolean)) {
    const match = /^(\d+|-)\t(\d+|-)\t([\s\S]+)$/.exec(row);
    if (!match) fail('Unrecognised Git diff line counts.');
    const file = files.find(f => f.filename === match[3]);
    if (!file) fail('Git diff file lists disagree.');
    // Git marks binary diffs with '-'; byte/container limits are checked by the shared guard.
    file.additions = match[1] === '-' ? 0 : Number(match[1]);
    file.deletions = match[2] === '-' ? 0 : Number(match[2]);
    file.changes = file.additions + file.deletions;
  }
  const paths = files.map(f => f.filename).filter(p => LESSON.test(p));
  const metadataPath = paths.find(p => p.endsWith('/lesson.yaml'));
  if (!metadataPath) fail('Candidate must contain lesson.yaml.');
  const tree = new Map(git('ls-tree', '-rz', head).toString('utf8').split('\0').filter(Boolean).map(row => {
    const match = /^(\d+) (\w+) ([0-9a-f]{40})\t([\s\S]+)$/.exec(row);
    if (!match) fail('Unrecognised Git tree entry.');
    return [match[4], { mode: match[1], type: match[2], sha: match[3] }];
  }));
  const blob = path => {
    const entry = tree.get(path);
    if (!entry || entry.type !== 'blob') fail('Required candidate blob is missing.');
    const bytes = git('cat-file', 'blob', entry.sha);
    return { mode: entry.mode, type: entry.type, size: bytes.length, bytes,
      text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  };
  const metadataDoc = parseDocument(blob(metadataPath).text, { schema: 'core', uniqueKeys: true });
  if (metadataDoc.errors.length || metadataDoc.warnings.length) fail('Invalid lesson metadata.');
  const metadata = metadataDoc.toJS({ maxAliasCount: 0 });
  const ordinaryBranch = lessonBranchName(metadata?.slug);
  const refs = text('for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/remotes/origin').split('\n');
  const owners = refs.filter(row => row.startsWith(`refs/heads/${ordinaryBranch} `) || row.startsWith(`refs/remotes/origin/${ordinaryBranch} `));
  if (retry && (!owners.some(row => !row.endsWith(` ${head}`)) || !files.some(f => f.filename === BACKLOG))) fail('Retry needs an existing unsuffixed branch and a backlog candidate; verify prior-day failure history separately.');
  if (!retry && owners.some(row => !row.endsWith(` ${head}`))) fail('Lesson branch already belongs to another commit; reconcile history before retrying.');
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Zurich' }).format(new Date(now));
  const branch = lessonBranchName(metadata.slug, retry ? day : undefined);
  const chosenOwners = refs.filter(row => row.startsWith(`refs/heads/${branch} `) || row.startsWith(`refs/remotes/origin/${branch} `));
  if (chosenOwners.some(row => !row.endsWith(` ${head}`))) fail('Chosen branch already belongs to another candidate.');
  const currentBranch = text('branch', '--show-current');
  if (currentBranch.startsWith('lesson/') && currentBranch !== branch) fail('Local lesson branch differs from the generated branch.');
  const blobs = Object.fromEntries(paths.map(path => [path, blob(path)]));
  if (files.some(f => f.filename === BACKLOG)) blobs[BACKLOG] = blob(BACKLOG);
  const revision = paths.some(path => files.find(f => f.filename === path).status === 'modified');
  for (const path of paths.filter(p => p.endsWith('.md'))) {
    const source = blobs[path].text;
    const doc = parseDocument(source.slice(4, source.indexOf('\n---\n', 4)), { schema: 'core', uniqueKeys: true });
    if (doc.errors.length || doc.warnings.length) fail('Invalid presentation metadata.');
    const figure = doc.toJS({ maxAliasCount: 0 })?.figure;
    if (figure?.type === 'image' && typeof figure.src === 'string') {
      const imagePath = `public${figure.src}`;
      const entry = tree.get(imagePath);
      if (!entry || entry.type !== 'blob') fail('Required image is missing.');
      const bytes = git('cat-file', 'blob', entry.sha);
      blobs[imagePath] = { mode: entry.mode, type: entry.type, size: bytes.length, bytes };
    }
  }
  const baseText = path => git('show', `${base}:${path}`).toString('utf8');
  const input = {
    pr: { headRef: branch, headSha: head, labels: ['editorial-review-requested', 'review:mandatory'] },
    triggerHeadSha: head, currentBaseSha: base,
    mergeBaseSha: text('merge-base', base, head), behindBy: Number(text('rev-list', '--count', `${head}..${base}`)),
    files, blobs, baseRegistryText: baseText(REGISTRY), headRegistryBlob: blob(REGISTRY),
    baseBacklogText: baseText(BACKLOG), now,
    ...(revision ? { baseLessonText: baseText(metadataPath),
      baseAdultText: baseText(metadataPath.replace('lesson.yaml', 'adult.md')),
      baseTeenText: baseText(metadataPath.replace('lesson.yaml', 'teen.md')) } : {}),
  };
  const result = evaluateLessonPullRequest(input);
  if (!result.applicable) fail('Preflight did not validate an automated lesson.');
  return { status: 'PREPARED', branch, base, head, slug: result.slug,
    caveat: 'Local preflight only. Re-verify live main, branch/history, labels and all four remote checks before review.' };
}

// Input is the complete, paginated GitHub check-runs list, without an event filter.
// Prefer the newest run/attempt, so a stale success cannot hide a pending rerun.
export function assessPublicationChecks(head, checks) {
  if (!SHA.test(head ?? '') || !Array.isArray(checks)) fail('Supply an exact head and complete check-runs array.');
  const results = PUBLICATION_CHECKS.map(name => {
    const matching = checks.filter(c => c?.name === name && c.head_sha === head);
    if (matching.some(c => !Number.isSafeInteger(c.id) || (c.started_at != null && !Number.isFinite(Date.parse(c.started_at))))) fail('Check-run ordering metadata is incomplete.');
    matching.sort((a, b) => b.id - a.id);
    // A rerun can reuse its check ID; GitHub returns that ID's current status.
    // Queued checks may have no start clock and still supersede an older success.
    const latest = matching[0];
    return { name, id: latest?.id ?? null,
      state: !latest ? 'missing' : latest.status !== 'completed' ? 'pending' : latest.conclusion };
  });
  return { head, readyForReview: results.every(c => c.state === 'success'), checks: results };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [command, value, ...options] = process.argv.slice(2);
    let result;
    if (command === 'prepare') {
      let cwd;
      let retry = false;
      for (let i = 0; i < options.length; i++) {
        if (options[i] === '--retry' && !retry) retry = true;
        else if (options[i] === '--repo' && !cwd && options[i + 1]) cwd = options[++i];
        else fail('Unknown or duplicate prepare option.');
      }
      result = prepareLessonSubmission({ base: value, cwd, retry });
    } else if (command === 'checks' && options.length === 1) result = assessPublicationChecks(value, JSON.parse(readFileSync(options[0], 'utf8')));
    else fail('Usage: lesson-submission.mjs prepare <main-SHA> [--repo <candidate-checkout>] [--retry] | checks <head-SHA> <complete-check-runs.json>');
    console.log(JSON.stringify(result, null, 2));
    if (result.readyForReview === false) process.exitCode = 1;
  } catch (error) {
    console.error(`lesson-submission: FAIL: ${error instanceof LessonGuardError ? error.message : 'Could not read or validate candidate/check data.'}`);
    process.exitCode = 1;
  }
}
