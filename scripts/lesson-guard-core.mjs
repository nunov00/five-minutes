import { lessonVisuals, validateVisualCollection, VISUAL_LIMITS } from '../src/lib/figures/collection.mjs';
import { isValidTimestamp } from './publication-time.mjs';
import { BACKLOG_PATH, parseBacklog, verifyBacklogCompletion } from './editorial-backlog.mjs';
import { parseDocument } from 'yaml';
import { TOOLKIT_TYPES, validateToolkitData } from '../src/lib/figures/toolkit-contract.mjs';
import { LOCAL_RASTER_PATH, RASTER_LIMITS, validateRasterBytes } from '../src/lib/figures/raster.mjs';
import { validateImageRights } from '../src/lib/figures/image-rights.mjs';

export const GUARD_LIMITS = Object.freeze({
  yamlBytes: 16 * 1024,
  markdownBytes: 32 * 1024,
  totalBytes: 80 * 1024,
  changedLines: 1600,
  imageFiles: 3,
  imageTotalBytes: VISUAL_LIMITS.totalBytes,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LESSON_PATH = /^src\/content\/lessons\/(\d{4})\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(adult\.md|lesson\.yaml)$/;
const REGISTRY_PATH = 'src/content/route-ownership.json';
const REQUIRED_LABELS = ['editorial-review-requested', 'review:mandatory'];
const METADATA_KEYS = new Set([
  'schemaVersion', 'id', 'slug', 'aliases', 'publishedAt', 'topic', 'subtopic',
  'concepts', 'related', 'sources', 'provenance', 'imageRights', 'revisedAt', 'archive',
]);
const ADULT_KEYS = new Set(['title', 'description', 'takeaway', 'question', 'answer', 'searchTerms', 'figure', 'figures', 'activity']);

export class LessonGuardError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LessonGuardError';
  }
}

export function lessonBranchName(slug, retryDate) {
  if (typeof slug !== 'string' || !SLUG.test(slug)) throw new LessonGuardError('Invalid lesson slug.');
  if (retryDate !== undefined && (typeof retryDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(retryDate)
    || !isValidTimestamp(`${retryDate}T00:00:00Z`))) throw new LessonGuardError('Invalid lesson retry date.');
  return `lesson/${slug}${retryDate === undefined ? '' : `-${retryDate}`}`;
}

function fail(message) {
  throw new LessonGuardError(message);
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function isPlainText(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
    && !/[<>`]|!\[|\[[^\]]*\]\(|\*\*|(?:^|\n)\s*(?:#|[-*]\s)/.test(value)
    && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
}

function normalise(value) {
  return value.trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
}

function validateAutomatedFigure(figure, label) {
  if (!isPlainObject(figure)) fail(`${label} figure must be a structured mapping.`);
  const common = ['type', 'alt', 'caption', 'description', 'afterParagraph', ...(figure.type==='image'?['src','width','height']:['data'])];
  if (!hasOnlyKeys(figure, common)) fail(`${label} figure contains fields outside the automated contract.`);
  for (const [key, max] of [['alt', 200], ['caption', 240], ['description', 900]]) {
    if (!isPlainText(figure[key], max)) fail(`${label} figure ${key} must be bounded plain text.`);
  }
  if (figure.afterParagraph !== undefined && (!Number.isInteger(figure.afterParagraph) || figure.afterParagraph < 1 || figure.afterParagraph > 50)) {
    fail(`${label} figure afterParagraph must be from 1 to 50.`);
  }
  if(figure.type==='image'){
    if(typeof figure.src!=='string'||!LOCAL_RASTER_PATH.test(figure.src)||!Number.isInteger(figure.width)||!Number.isInteger(figure.height)
      ||figure.width<1||figure.height<1||figure.width>RASTER_LIMITS.maxDimension||figure.height>RASTER_LIMITS.maxDimension
      ||figure.width*figure.height>RASTER_LIMITS.maxPixels)fail(`${label} image metadata is outside the bounded raster contract.`);
    return;
  }
  if (!isPlainObject(figure.data)) fail(`${label} figure data must be a structured mapping.`);
  if(TOOLKIT_TYPES.includes(figure.type)||(figure.type==='comparison-bars'&&figure.data.style==='proportional')){
    const errors=validateToolkitData(figure.type,figure.data);
    if(errors.length)fail(`${label} ${errors.join(' ')}`);
    return;
  }
  if (figure.type === 'seasons-orbit') {
    if (!hasOnlyKeys(figure.data, ['tiltDegrees']) || (figure.data.tiltDegrees !== 23.4 && figure.data.tiltDegrees !== 23.5)) {
      fail(`${label} seasons figure data is invalid.`);
    }
    return;
  }
  if (figure.type === 'process-flow' || figure.type === 'cycle-flow') {
    const styles = figure.type === 'process-flow' ? ['filter-reclaim'] : ['feedback-loop', 'heat-transfer'];
    if (!hasOnlyKeys(figure.data, ['style', 'steps']) || !styles.includes(figure.data.style)
      || !Array.isArray(figure.data.steps) || figure.data.steps.length !== 4) {
      fail(`${label} flow figure must select an approved style and contain exactly four steps.`);
    }
    const labels = [];
    for (const step of figure.data.steps) {
      if (!isPlainObject(step) || !hasOnlyKeys(step, ['label', 'detail']) || !isPlainText(step.label, 36)
        || (step.detail !== undefined && !isPlainText(step.detail, 120))) fail(`${label} flow step is outside the automated contract.`);
      labels.push(normalise(step.label));
    }
    if (new Set(labels).size !== labels.length) fail(`${label} flow-step labels must be unique.`);
    return;
  }
  if (figure.type === 'comparison-bars') {
    if (!hasOnlyKeys(figure.data, ['style', 'items', 'unit']) || figure.data.style !== 'doubling-growth'
      || (figure.data.unit !== undefined && !isPlainText(figure.data.unit, 40))
      || !Array.isArray(figure.data.items) || figure.data.items.length !== 3) {
      fail(`${label} comparison figure data is outside the automated contract.`);
    }
    const labels = [];
    let positive = false;
    for (const item of figure.data.items) {
      if (!isPlainObject(item) || !hasOnlyKeys(item, ['label', 'value', 'display']) || !isPlainText(item.label, 24)
        || typeof item.value !== 'number' || !Number.isFinite(item.value) || item.value < 0 || item.value > 1_000_000_000
        || !isPlainText(item.display, 16)) fail(`${label} comparison item is outside the automated contract.`);
      labels.push(normalise(item.label));
      positive ||= item.value > 0;
    }
    if (!positive || new Set(labels).size !== labels.length) fail(`${label} comparison items must be unique and include a positive value.`);
    return;
  }
  fail(`${label} figure type is not allowed for automated publication.`);
}

function parseYamlObject(source, label, allowedKeys) {
  let document;
  try {
    document = parseDocument(source, {
      schema: 'core', customTags: [], resolveKnownTags: false,
      prettyErrors: false, strict: true, uniqueKeys: true,
    });
  } catch {
    fail(`${label} is not valid YAML.`);
  }
  if (document.errors.length > 0 || document.warnings.length > 0) fail(`${label} is not valid unambiguous YAML.`);
  let value;
  try {
    value = document.toJS({ maxAliasCount: 0 });
  } catch {
    fail(`${label} uses unsupported YAML aliases or structure.`);
  }
  if (!isPlainObject(value)) fail(`${label} must contain a YAML mapping.`);
  const unknown = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unknown.length > 0) fail(`${label} contains fields outside the automated contract: ${unknown.sort().join(', ')}.`);
  return value;
}

function parseFrontmatter(source, label, allowedKeys) {
  if (!source.startsWith('---\n')) fail(`${label} must start with YAML front matter.`);
  const end = source.indexOf('\n---\n', 4);
  if (end < 0) fail(`${label} has unterminated YAML front matter.`);
  const value = parseYamlObject(source.slice(4, end), `${label} front matter`, allowedKeys);
  for(const message of validateVisualCollection(value))fail(`${label}: ${message}`);
  for(const {figure} of lessonVisuals(value))validateAutomatedFigure(figure,label);
  if (Object.hasOwn(value, 'activity')) {
    const a=value.activity;
    if(!isPlainObject(a)||!hasOnlyKeys(a,['prompt','options','answer','explanation'])
      ||!isPlainText(a.prompt,140)||!isPlainText(a.explanation,400)
      ||!Array.isArray(a.options)||a.options.length<2||a.options.length>4||!a.options.every(o=>isPlainText(o,80))
      ||new Set(a.options.map(normalise)).size!==a.options.length
      ||!Number.isInteger(a.answer)||a.answer<0||a.answer>=a.options.length
      ||typeof value.question==='string'&&normalise(a.prompt)===normalise(value.question)) fail(`${label} activity is invalid.`);
  }
  return value;
}

function parseRegistry(source, label) {
  const uniquenessCheck = parseDocument(source, { prettyErrors: false, schema: 'json', strict: true, uniqueKeys: true });
  if (uniquenessCheck.errors.length > 0) fail(`${label} is not valid unambiguous JSON.`);
  let value;
  try {
    value = JSON.parse(source);
  } catch {
    fail(`${label} is not valid JSON.`);
  }
  if (!isPlainObject(value)) fail(`${label} must be a JSON object.`);
  for (const [route, owner] of Object.entries(value)) {
    if (!SLUG.test(route) || typeof owner !== 'string' || !UUID.test(owner)) {
      fail(`${label} contains an invalid route ownership entry.`);
    }
  }
  return value;
}

function zurichDate(value) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const read = (type) => parts.find((part) => part.type === type)?.value;
  return `${read('year')}-${read('month')}-${read('day')}`;
}


function requireTextBlob(blobs, path, maxBytes) {
  const blob = blobs[path];
  if (!blob || blob.type !== 'blob' || blob.mode !== '100644') {
    fail(`${path} must be a non-executable regular file.`);
  }
  if (!Number.isSafeInteger(blob.size) || blob.size < 0 || blob.size > maxBytes) {
    fail(`${path} exceeds its byte limit or has no trustworthy size.`);
  }
  if (typeof blob.text !== 'string' || Buffer.byteLength(blob.text, 'utf8') !== blob.size || blob.text.includes('\0')) {
    fail(`${path} must be strict UTF-8 text with a trustworthy size.`);
  }
  return blob.text;
}

export function evaluateLessonPullRequest(input) {
  if (!isPlainObject(input) || !isPlainObject(input.pr)) fail('Guard input is incomplete.');
  const { pr, triggerHeadSha, currentBaseSha, mergeBaseSha, behindBy, files, blobs, baseRegistryText, headRegistryBlob, now } = input;
  if (typeof pr.headRef !== 'string' || typeof pr.headSha !== 'string' || !Array.isArray(pr.labels)) fail('Pull Request metadata is incomplete.');
  if (pr.labels.some((label) => typeof label !== 'string')) fail('Pull Request labels are malformed.');

  const branchSignal = pr.headRef.startsWith('lesson/');
  const labelSignal = pr.labels.includes('editorial-review-requested');
  if (!branchSignal && !labelSignal) return { applicable: false, message: 'Not an automated lesson candidate.' };

  const branch = /^lesson\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(pr.headRef);
  if (!branch) fail('Automated lesson branch must be exactly lesson/<slug>.');
  for (const label of REQUIRED_LABELS) {
    if (!pr.labels.includes(label)) fail(`Automated lesson candidate is missing label ${label}.`);
  }
  if (typeof triggerHeadSha !== 'string' || pr.headSha !== triggerHeadSha) {
    fail('Pull Request head changed after this guard run was triggered.');
  }
  if (typeof currentBaseSha !== 'string' || mergeBaseSha !== currentBaseSha || behindBy !== 0) {
    fail('Automated lesson candidate must be based on the current main head.');
  }
  if (!Array.isArray(files) || !isPlainObject(blobs)) fail('Changed-file data is incomplete.');
  const backlogFiles = files.filter(f => f.filename === BACKLOG_PATH);
  const renewal = backlogFiles.length === 1;
  const revision = renewal && files.some(f => LESSON_PATH.test(f.filename) && f.status === 'modified');
  if(files.length<3||files.length>4+GUARD_LIMITS.imageFiles)fail('Automated candidate requires the bounded lesson, registry/backlog files and at most three images.');

  const lessonFiles = files.filter((file) => typeof file?.filename === 'string' && LESSON_PATH.test(file.filename));
  const registryFiles = files.filter((file) => file?.filename === REGISTRY_PATH);
  const imageFiles=files.filter(file=>typeof file?.filename==='string'&&file.filename.startsWith('public/lesson-media/'));
  if(imageFiles.length>GUARD_LIMITS.imageFiles)fail('At most three source images are allowed.');
  if (lessonFiles.length !== 2 || registryFiles.length !== (revision ? 0 : 1) || lessonFiles.length+registryFiles.length+imageFiles.length+backlogFiles.length!==files.length) {
    fail('Candidate may change only one lesson, its bounded new images, and the applicable registry/backlog delta.');
  }
  if (lessonFiles.some((file) => file.status !== (revision ? 'modified' : 'added')) || imageFiles.some(file=>file.status!=='added') || (!revision && registryFiles[0].status !== 'modified') || backlogFiles.some(f => f.status !== 'modified')) {
    fail('Lesson files must all be added or all modified for the selected backlog revision; other file statuses are restricted.');
  }
  for (const file of files) {
    if (!Number.isSafeInteger(file.additions) || !Number.isSafeInteger(file.deletions) || !Number.isSafeInteger(file.changes)) {
      fail('Changed-file line counts are incomplete.');
    }
  }
  const changedLines = files.reduce((sum, file) => sum + file.additions + file.deletions, 0);
  if (changedLines > GUARD_LIMITS.changedLines) fail('Candidate exceeds the changed-line limit.');

  const matches = lessonFiles.map((file) => LESSON_PATH.exec(file.filename));
  const years = new Set(matches.map((match) => match[1]));
  const slugs = new Set(matches.map((match) => match[2]));
  const names = new Set(matches.map((match) => match[3]));
  if (years.size !== 1 || slugs.size !== 1 || names.size !== 2 || !['adult.md', 'lesson.yaml'].every((name) => names.has(name))) {
    fail('Candidate must add exactly adult.md and lesson.yaml in one lesson directory.');
  }
  const year = [...years][0];
  const slug = [...slugs][0];
  if (pr.headRef !== lessonBranchName(slug) && (!renewal || pr.headRef !== lessonBranchName(slug, zurichDate(new Date(now))))) fail('Branch, directory and lesson slug must match (or use the current-day backlog retry suffix).');

  const root = `src/content/lessons/${year}/${slug}`;
  const yamlPath = `${root}/lesson.yaml`;
  const adultPath = `${root}/adult.md`;
  const yamlText = requireTextBlob(blobs, yamlPath, GUARD_LIMITS.yamlBytes);
  const adultText = requireTextBlob(blobs, adultPath, GUARD_LIMITS.markdownBytes);
  const totalBytes = [yamlPath, adultPath].reduce((sum, path) => sum + blobs[path].size, 0);
  if (totalBytes > GUARD_LIMITS.totalBytes) fail('Candidate exceeds the total lesson byte limit.');

  const metadata = parseYamlObject(yamlText, 'lesson.yaml', METADATA_KEYS);
  if (metadata.schemaVersion !== 2) fail('Automated lessons must use schemaVersion 2.');
  if (typeof metadata.id !== 'string' || !UUID.test(metadata.id)) fail('Automated lesson ID must be a canonical lowercase UUID.');
  if (metadata.slug !== slug || !SLUG.test(metadata.slug)) fail('Branch, directory and metadata slug must match.');
  if (!Array.isArray(metadata.aliases) || (!revision && metadata.aliases.length !== 0)) fail('Automated new lessons must start with no aliases.');
  if (!isValidTimestamp(metadata.publishedAt)) {
    fail('Automated lesson requires an unambiguous RFC 3339 publishedAt timestamp.');
  }
  if (!renewal && (metadata.archive !== undefined || metadata.revisedAt !== undefined)) fail('New lessons cannot supply archive/import or revision metadata.');
  if (input.baseBacklogText === undefined) fail('Trusted base backlog is required.');
  if (!renewal && input.baseBacklogText !== undefined && (parseBacklog(input.baseBacklogText).pipeline || parseBacklog(input.baseBacklogText).entries.some(entry=>['queued','parked'].includes(entry.state)))) fail('Queued lessons must be completed through the trusted-base selection.');
  if (renewal && metadata.revisedAt !== undefined && !isValidTimestamp(metadata.revisedAt)) fail('Invalid revisedAt.');
  if (renewal && Date.parse(metadata.revisedAt) < Date.parse(metadata.publishedAt)) fail('Revision cannot precede publication.');
  const baseRegistry = parseRegistry(baseRegistryText, 'Base route ownership');
  let selected;
  if (renewal) {
    const headBacklogText = requireTextBlob(blobs, BACKLOG_PATH, 256*1024);
    try { selected = verifyBacklogCompletion(input.baseBacklogText, headBacklogText, metadata, metadata.revisedAt ?? metadata.publishedAt, {reservedRoutes:Object.keys(baseRegistry), now}); }
    catch(error) { fail(error.message); }
    const pipeline=parseBacklog(headBacklogText).pipeline;
    if(pipeline && (zurichDate(new Date(pipeline.assessedAt))!==zurichDate(new Date(now)) || Date.parse(pipeline.assessedAt)>Date.parse(now))) fail('Pipeline assessment must be from this run day, not the future.');
    if (selected.kind !== 'new' && !isValidTimestamp(metadata.revisedAt)) fail('Renewed lessons require revisedAt.');
    if ((selected.kind === 'revision') !== revision) fail('Backlog kind and lesson diff disagree.');
    if (revision) {
      const original = parseYamlObject(input.baseLessonText, 'Base lesson.yaml', METADATA_KEYS);
      for (const key of ['id','slug','aliases','publishedAt','topic','subtopic','archive']) {
        if (JSON.stringify(original[key]) !== JSON.stringify(metadata[key])) fail(`Revision must preserve ${key}.`);
      }
      for (const key of ['createdAt','createdBy']) {
        if (JSON.stringify(original.provenance?.[key]) !== JSON.stringify(metadata.provenance?.[key])) fail(`Revision must preserve provenance.${key}.`);
      }
      if (Date.parse(metadata.revisedAt) <= Date.parse(original.revisedAt ?? original.publishedAt)) fail('Revision timestamp must advance.');
    } else if (selected.kind === 'import' && metadata.publishedAt !== metadata.revisedAt) fail('First transfer publication and revision timestamps must match.');
  }
  const publishedAt = new Date(metadata.revisedAt ?? metadata.publishedAt);
  const nowDate = new Date(now);
  if (!Number.isFinite(publishedAt.valueOf()) || !Number.isFinite(nowDate.valueOf())) fail('Publication time is invalid.');
  const publicationDate = zurichDate(publishedAt);
  if (publicationDate !== zurichDate(nowDate)) fail('Publication date must be the current Europe/Zurich date.');
  if (!(revision ? zurichDate(new Date(metadata.publishedAt)) : publicationDate).startsWith(`${year}-`)) fail('Lesson directory year must match publishedAt in Europe/Zurich.');

  const presentations=[parseFrontmatter(adultText,'adult.md',ADULT_KEYS)];
  const images=presentations.flatMap(p=>lessonVisuals(p).map(v=>v.figure)).filter(f=>f?.type==='image');
  for(const message of validateImageRights(metadata.imageRights,images.map(f=>f.src)))fail(message);
  const referenced=new Set(images.map(f=>`public${f.src}`));
  if((!revision && referenced.size!==imageFiles.length)||imageFiles.some(f=>!referenced.has(f.filename)))fail('Every added image must be referenced by this lesson and every image reference must be newly added.');
  if (revision) {
    const originalPresentations = [parseFrontmatter(input.baseAdultText,'base adult.md',ADULT_KEYS)];
    const originalImages = new Set(originalPresentations.flatMap(p=>lessonVisuals(p).map(v=>v.figure)).filter(f=>f?.type==='image').map(f=>`public${f.src}`));
    for (const path of referenced) if (!imageFiles.some(f=>f.filename===path) && !originalImages.has(path)) fail('Revision cannot borrow an unrelated existing raster.');
  }
  let imageBytes=0;
  const revisionSuffix = renewal ? `(?:-r${publicationDate.replaceAll('-', '')})?` : '';
  for(const f of images){
    const filename=`public${f.src}`;
    if(imageFiles.some(file => file.filename === filename) && !new RegExp(`^public/lesson-media/${slug}${revisionSuffix}(?:-adult|-teen|-v[a-z][a-z0-9-]{0,19})?\\.(?:png|webp)$`).test(filename))fail('Image filenames must belong to this lesson slug.');
    const blob=blobs[filename];
    if(!blob||blob.mode!=='100644'||blob.type!=='blob'||!Number.isSafeInteger(blob.size)||blob.size<1||blob.size>RASTER_LIMITS.maxBytes
      ||!Buffer.isBuffer(blob.bytes)||blob.bytes.length!==blob.size)fail('Raster must be a bounded regular binary blob with trustworthy size.');
    try{validateRasterBytes(blob.bytes,f.src,f.width,f.height);}catch(error){fail(`Invalid raster figure: ${error.message}`);}
  }
  for(const filename of referenced)imageBytes+=blobs[filename].size;
  if(imageBytes>GUARD_LIMITS.imageTotalBytes)fail('Raster figures exceed the aggregate image byte budget.');

  if (!isPlainObject(headRegistryBlob)) fail('Candidate route ownership file data is incomplete.');
  const headRegistryText = requireTextBlob({ [REGISTRY_PATH]: headRegistryBlob }, REGISTRY_PATH, Number.MAX_SAFE_INTEGER);
  const headRegistry = parseRegistry(headRegistryText, 'Candidate route ownership');
  if (!revision && Object.hasOwn(baseRegistry, slug)) fail('Automated lesson slug already has a route owner.');
  if (!revision && Object.values(baseRegistry).includes(metadata.id)) fail('Automated lesson ID already exists in route ownership.');
  for (const [route, owner] of Object.entries(baseRegistry)) {
    if (headRegistry[route] !== owner) fail('Candidate must not remove or reassign route ownership.');
  }
  const additions = Object.entries(headRegistry).filter(([route]) => !Object.hasOwn(baseRegistry, route));
  if (revision ? (additions.length !== 0 || baseRegistry[slug] !== metadata.id) : (additions.length !== 1 || additions[0][0] !== slug || additions[0][1] !== metadata.id)) {
    fail('Candidate must preserve route ownership, appending exactly its slug and ID only for a new identity.');
  }

  return { applicable: true, slug, lessonId: metadata.id, message: `Automated lesson contract passed for ${slug}.` };
}
