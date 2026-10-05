import { TextDecoder } from 'node:util';
import { pathToFileURL } from 'node:url';
import { evaluateLessonPullRequest, LessonGuardError } from './lesson-guard-core.mjs';

const API = 'https://api.github.com';

function configuration(env) {
  const token = env.GITHUB_TOKEN;
  const repository = env.GITHUB_REPOSITORY;
  const prNumber = Number(env.PR_NUMBER);
  if (!token || !repository || !/^\d+$/.test(String(env.PR_NUMBER ?? ''))) {
    throw new LessonGuardError('Guard environment is incomplete.');
  }
  const [owner, repo] = repository.split('/');
  if (!owner || !repo || repository.split('/').length !== 2 || !Number.isSafeInteger(prNumber) || prNumber < 1) {
    throw new LessonGuardError('Guard repository or Pull Request number is invalid.');
  }
  return { owner, repo, token, prNumber };
}

async function requestJson(path, fetchImpl, token) {
  let response;
  try {
    response = await fetchImpl(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'five-minutes-lesson-guard',
    },
    redirect: 'error',
    });
  } catch {
    throw new LessonGuardError('GitHub API request failed.');
  }
  if (!response.ok) throw new LessonGuardError(`GitHub API request failed with status ${response.status}.`);
  try {
    return await response.json();
  } catch {
    throw new LessonGuardError('GitHub API returned malformed JSON.');
  }
}

export function strictBase64Text(payload, path) {
  if (!payload || payload.type !== 'file' || payload.encoding !== 'base64' || typeof payload.content !== 'string' || !Number.isSafeInteger(payload.size)) {
    throw new LessonGuardError(`${path} content response is incomplete.`);
  }
  const compact = payload.content.replace(/\s/g, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(compact)) {
    throw new LessonGuardError(`${path} content is not canonical base64.`);
  }
  const bytes = Buffer.from(compact, 'base64');
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new LessonGuardError(`${path} is not strict UTF-8 text.`);
  }
  if (bytes.length !== payload.size) throw new LessonGuardError(`${path} size does not match its content.`);
  return { text, size: bytes.length };
}

async function content(api, owner, repo, path, ref) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return strictBase64Text(await api(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`), path);
}

async function pullFiles(api, owner, repo, prNumber) {
  const first = await api(`/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100&page=1`);
  if (!Array.isArray(first)) throw new LessonGuardError('Changed-file response is incomplete.');
  if (first.length === 100) throw new LessonGuardError('Changed-file pagination exceeds the automated contract.');
  return first;
}

export async function collectGuardInput({ env = process.env, fetchImpl = fetch, now = new Date().toISOString() } = {}) {
  const { owner, repo, token, prNumber } = configuration(env);
  const api = (path) => requestJson(path, fetchImpl, token);
  const pr = await api(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (!pr?.head?.sha || !pr?.head?.ref || !pr?.base?.sha || !pr?.base?.ref || !Array.isArray(pr.labels)) {
    throw new LessonGuardError('Pull Request response is incomplete.');
  }
  const labels = pr.labels.map((label) => label?.name);
  if (labels.some((label) => typeof label !== 'string')) throw new LessonGuardError('Pull Request labels are incomplete.');
  const currentBase = await api(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(pr.base.ref)}`);
  if (!currentBase?.object?.sha) throw new LessonGuardError('Current base reference is incomplete.');

  const files = await pullFiles(api, owner, repo, prNumber);
  const signalled = pr.head.ref.startsWith('lesson/') || labels.includes('editorial-review-requested');
  if (!signalled) {
    return { applicable: false };
  }
  if (files.length !== 4) throw new LessonGuardError('Automated lesson candidate must change exactly four files.');

  const matches = files.map((file) => /^src\/content\/lessons\/(\d{4})\/([^/]+)\/(adult\.md|lesson\.yaml|teen\.md)$/.exec(file.filename)).filter(Boolean);
  const candidatePaths = [...new Set(matches.map((match) => `src/content/lessons/${match[1]}/${match[2]}/${match[3]}`))];
  const headTree = await api(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(pr.head.sha)}?recursive=1`);
  if (!Array.isArray(headTree?.tree) || headTree.truncated) throw new LessonGuardError('Candidate tree response is incomplete or truncated.');
  const treeByPath = new Map(headTree.tree.map((entry) => [entry.path, entry]));
  const blobs = {};
  for (const path of candidatePaths) {
    const treeEntry = treeByPath.get(path);
    const loaded = await content(api, owner, repo, path, pr.head.sha);
    blobs[path] = { mode: treeEntry?.mode, type: treeEntry?.type, size: loaded.size, text: loaded.text };
  }

  const [baseRegistry, headRegistry] = await Promise.all([
    content(api, owner, repo, 'src/content/route-ownership.json', pr.base.sha),
    content(api, owner, repo, 'src/content/route-ownership.json', pr.head.sha),
  ]);
  return {
    pr: { headRef: pr.head.ref, baseSha: pr.base.sha, labels },
    currentBaseSha: currentBase.object.sha,
    files: files.map(({ filename, status, additions, deletions, changes }) => ({ filename, status, additions, deletions, changes })),
    blobs,
    baseRegistryText: baseRegistry.text,
    headRegistryText: headRegistry.text,
    now,
  };
}

export async function runLessonGuard(options) {
  const input = await collectGuardInput(options);
  if (input.applicable === false) {
    console.log('lesson-guard: not applicable');
    return { applicable: false };
  }
  const result = evaluateLessonPullRequest(input);
  console.log(`lesson-guard: ${result.message}`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runLessonGuard().catch((error) => {
    const message = error instanceof LessonGuardError ? error.message : 'Unexpected guard failure.';
    console.error(`lesson-guard: FAIL: ${message}`);
    process.exitCode = 1;
  });
}
