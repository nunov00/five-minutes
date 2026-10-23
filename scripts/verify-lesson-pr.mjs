import { lessonVisuals } from '../src/lib/figures/collection.mjs';
import { BACKLOG_PATH } from './editorial-backlog.mjs';
import { parseDocument } from 'yaml';
import { TextDecoder } from 'node:util';
import { pathToFileURL } from 'node:url';
import { evaluateLessonPullRequest, LessonGuardError, GUARD_LIMITS } from './lesson-guard-core.mjs';
import { RASTER_LIMITS } from '../src/lib/figures/raster.mjs';

const API = 'https://api.github.com';

function configuration(env) {
  const token = env.GITHUB_TOKEN;
  const repository = env.GITHUB_REPOSITORY;
  const prNumber = Number(env.PR_NUMBER);
  const triggerHeadSha = env.TRIGGER_HEAD_SHA;
  const triggerHeadRef = env.TRIGGER_HEAD_REF;
  const triggerHasReviewLabel = env.TRIGGER_HAS_REVIEW_LABEL;
  if (!token || !repository || !/^\d+$/.test(String(env.PR_NUMBER ?? '')) || !/^[0-9a-f]{40}$/.test(String(triggerHeadSha ?? ''))
    || typeof triggerHeadRef !== 'string' || triggerHeadRef.length === 0
    || !['true', 'false'].includes(String(triggerHasReviewLabel))) {
    throw new LessonGuardError('Guard environment is incomplete.');
  }
  const [owner, repo] = repository.split('/');
  if (!owner || !repo || repository.split('/').length !== 2 || !Number.isSafeInteger(prNumber) || prNumber < 1) {
    throw new LessonGuardError('Guard repository or Pull Request number is invalid.');
  }
  return { owner, repo, token, prNumber, triggerHeadSha, triggerHeadRef, triggerHasReviewLabel: triggerHasReviewLabel === 'true' };
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

export function strictBase64Bytes(payload, path, maxBytes) {
  if (!payload || payload.type !== 'file' || payload.encoding !== 'base64' || typeof payload.content !== 'string' || !Number.isSafeInteger(payload.size)) {
    throw new LessonGuardError(`${path} content response is incomplete.`);
  }
  const compact = payload.content.replace(/\s/g, '');
  if(payload.size<0||payload.size>maxBytes||compact.length>4*Math.ceil(maxBytes/3))throw new LessonGuardError(`${path} exceeds its byte limit.`);
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(compact)) {
    throw new LessonGuardError(`${path} content is not canonical base64.`);
  }
  const bytes = Buffer.from(compact, 'base64');
  if(bytes.length!==payload.size||bytes.toString('base64')!==compact)throw new LessonGuardError(`${path} size/base64 does not match its content.`);
  return {bytes,size:bytes.length};
}

export function strictBase64Text(payload, path) {
  const {bytes}=strictBase64Bytes(payload,path,path.endsWith('route-ownership.json')?8*1024*1024:path===BACKLOG_PATH?256*1024:GUARD_LIMITS.markdownBytes);
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new LessonGuardError(`${path} is not strict UTF-8 text.`);
  }
  return { text, size: bytes.length };
}

async function content(api, owner, repo, path, ref) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return strictBase64Text(await api(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`), path);
}

export async function collectGuardInput({ env = process.env, fetchImpl = fetch, now = new Date().toISOString() } = {}) {
  const { owner, repo, token, prNumber, triggerHeadSha, triggerHeadRef, triggerHasReviewLabel } = configuration(env);
  if (!triggerHeadRef.startsWith('lesson/') && !triggerHasReviewLabel) return { applicable: false };
  const api = (path) => requestJson(path, fetchImpl, token);
  const pr = await api(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (!pr?.head?.sha || !pr?.head?.ref || !pr?.base?.sha || !pr?.base?.ref || !Array.isArray(pr.labels)) {
    throw new LessonGuardError('Pull Request response is incomplete.');
  }
  const labels = pr.labels.map((label) => label?.name);
  if (labels.some((label) => typeof label !== 'string')) throw new LessonGuardError('Pull Request labels are incomplete.');
  if (pr.head.ref !== triggerHeadRef) throw new LessonGuardError('Pull Request branch differs from the triggering event.');
  if (pr.head.sha !== triggerHeadSha) throw new LessonGuardError('Pull Request head changed after this guard run was triggered.');

  const currentBase = await api(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(pr.base.ref)}`);
  if (!currentBase?.object?.sha) throw new LessonGuardError('Current base reference is incomplete.');
  const compare = await api(`/repos/${owner}/${repo}/compare/${encodeURIComponent(currentBase.object.sha)}...${encodeURIComponent(triggerHeadSha)}`);
  if (!compare?.merge_base_commit?.sha || !Number.isSafeInteger(compare.behind_by) || !Array.isArray(compare.files)) {
    throw new LessonGuardError('Pinned comparison response is incomplete.');
  }
  const files = compare.files;
  if (files.length<3||files.length>4+GUARD_LIMITS.imageFiles)throw new LessonGuardError('Automated lesson candidate requires bounded single-version lesson files.');

  const matches = files.map((file) => /^src\/content\/lessons\/(\d{4})\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(adult\.md|lesson\.yaml)$/.exec(file.filename)).filter(Boolean);
  const candidatePaths = [...new Set(matches.map((match) => `src/content/lessons/${match[1]}/${match[2]}/${match[3]}`))];
  const renewal = files.some(f=>f.filename===BACKLOG_PATH);
  const revision = renewal && matches.some(match=>files.find(f=>f.filename===match[0])?.status==='modified');
  const imagePaths=files.filter(file=>/^public\/lesson-media\/[a-z0-9-]+\.(?:png|webp)$/.test(file.filename)).map(file=>file.filename);
  if(candidatePaths.length!==2||imagePaths.length>GUARD_LIMITS.imageFiles||new Set(imagePaths).size!==imagePaths.length
    ||files.length!==candidatePaths.length+imagePaths.length+(revision?0:1)+(renewal?1:0)||(!revision&&!files.some(file=>file.filename==='src/content/route-ownership.json')))throw new LessonGuardError('Candidate file scope exceeds the lesson and bounded-image contract.');
  const headTree = await api(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(triggerHeadSha)}?recursive=1`);
  if (!Array.isArray(headTree?.tree) || headTree.truncated) throw new LessonGuardError('Candidate tree response is incomplete or truncated.');
  const treeByPath = new Map(headTree.tree.map((entry) => [entry.path, entry]));
  const blobs = {};
  for (const path of candidatePaths) {
    const treeEntry = treeByPath.get(path);
    const loaded = await content(api, owner, repo, path, triggerHeadSha);
    blobs[path] = { mode: treeEntry?.mode, type: treeEntry?.type, size: loaded.size, text: loaded.text };
  }

  const baseBacklog = await content(api, owner, repo, BACKLOG_PATH, currentBase.object.sha);
  if (renewal) {
    const entry=treeByPath.get(BACKLOG_PATH), loaded=await content(api,owner,repo,BACKLOG_PATH,triggerHeadSha);
    blobs[BACKLOG_PATH]={mode:entry?.mode,type:entry?.type,size:loaded.size,text:loaded.text};
  }
  let baseLessonText, baseAdultText;
  if (revision) {
    for (const path of candidatePaths) {
      const loaded=await content(api,owner,repo,path,currentBase.object.sha);
      if(path.endsWith('/lesson.yaml')) baseLessonText=loaded.text;
      else if(path.endsWith('/adult.md')) baseAdultText=loaded.text;
    }
    // Reused rasters are fetched from the exact head; their absence from the diff proves byte identity to main.
    for (const path of candidatePaths.filter(p=>p.endsWith('.md'))) {
      const text=blobs[path].text, end=text.indexOf('\n---\n',4);
      const doc=parseDocument(text.slice(4,end),{schema:'core',uniqueKeys:true});
      if(doc.errors.length||doc.warnings.length)throw new LessonGuardError('Invalid presentation YAML.');
      const figures=lessonVisuals(doc.toJS({maxAliasCount:0})).map(v=>v.figure);
      for(const figure of figures)if(figure?.type==='image' && /^\/lesson-media\/[a-z0-9-]+\.(png|webp)$/.test(figure.src) && !imagePaths.includes(`public${figure.src}`)) imagePaths.push(`public${figure.src}`);
    }
  }
  const registryPath = 'src/content/route-ownership.json';
  for(const path of imagePaths){
    const entry=treeByPath.get(path);
    if(entry?.type!=='blob'||entry?.mode!=='100644')throw new LessonGuardError('Raster must be a regular non-executable file.');
    const encodedPath=path.split('/').map(encodeURIComponent).join('/');
    const loaded=strictBase64Bytes(await api(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(triggerHeadSha)}`),path,RASTER_LIMITS.maxBytes);
    blobs[path]={mode:entry.mode,type:entry.type,size:loaded.size,bytes:loaded.bytes};
  }
  const [baseRegistry, headRegistry] = await Promise.all([
    content(api, owner, repo, registryPath, currentBase.object.sha),
    content(api, owner, repo, registryPath, triggerHeadSha),
  ]);
  const registryEntry = treeByPath.get(registryPath);
  return {
    baseBacklogText:baseBacklog.text, baseLessonText, baseAdultText,
    pr: { headRef: pr.head.ref, headSha: pr.head.sha, labels },
    triggerHeadSha,
    currentBaseSha: currentBase.object.sha,
    mergeBaseSha: compare.merge_base_commit.sha,
    behindBy: compare.behind_by,
    files: files.map(({ filename, status, additions, deletions, changes }) => ({ filename, status, additions, deletions, changes })),
    blobs,
    baseRegistryText: baseRegistry.text,
    headRegistryBlob: { mode: registryEntry?.mode, type: registryEntry?.type, size: headRegistry.size, text: headRegistry.text },
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
