import { lstat, readdir, readFile } from 'node:fs/promises';
import { validateFigureAsset } from '../figures/assets';
import { lessonVisuals, VISUAL_LIMITS } from '../figures/collection.mjs';
import { figurePosition } from '../figures/placement';
import { validateCitations } from './citations.mjs';
import { basename, join } from 'node:path';
import { parsePresentationFile, parseSafeYaml } from './safe-content';
import {
  type LessonBundle, type RouteOwnershipRegistry,
  validateLessonReferences, validatePublicationCollection,
} from './schema';

export interface LoadedLesson extends LessonBundle {
  adultHtml: string; teenHtml: string; sourceDirectory: string;
}
const YEAR = /^\d{4}$/;
const REQUIRED = ['adult.md', 'lesson.yaml'];
const LEGACY_FILE = 'teen.md';

async function strictLessonDirectories(root: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); }
  catch (error) { throw new Error(`Cannot read canonical lesson root ${root}: ${String(error)}`); }
  const dirs: string[] = [];
  for (const entry of entries) {
    if (entry.name === 'README.md' && entry.isFile()) continue;
    if (!entry.isDirectory() || !YEAR.test(entry.name)) throw new Error(`Unexpected entry in canonical lesson root: ${entry.name}.`);
    const yearPath = join(root, entry.name);
    const children = await readdir(yearPath, { withFileTypes: true });
    if (children.length === 0) throw new Error(`Canonical year directory is empty: ${entry.name}.`);
    for (const child of children) {
      if (!child.isDirectory()) throw new Error(`Unexpected entry under ${entry.name}: ${child.name}.`);
      const dir = join(yearPath, child.name);
      const files = await readdir(dir, { withFileTypes: true });
      const names = files.map((x) => x.name).sort();
      if (!REQUIRED.every(name => names.includes(name)) || names.some(name => !REQUIRED.includes(name) && name !== LEGACY_FILE)) {
        throw new Error(`Lesson directory ${entry.name}/${child.name} must contain ${REQUIRED.join(' and ')}, optionally legacy ${LEGACY_FILE}.`);
      }
      for (const file of files) {
        const stat = await lstat(join(dir, file.name));
        if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Canonical lesson file must be a regular non-symlink file: ${file.name}.`);
      }
      dirs.push(dir);
    }
  }
  return dirs.sort((a,b) => a < b ? -1 : a > b ? 1 : 0);
}

async function requiredText(path: string): Promise<string> {
  try { return await readFile(path, 'utf8'); }
  catch (error) { throw new Error(`Cannot read required canonical lesson file ${basename(path)}: ${String(error)}`); }
}

export async function loadPublishedLessons(root: string, routeOwnership: RouteOwnershipRegistry, publicRoot = join(process.cwd(),'public')): Promise<LoadedLesson[]> {
  const dirs = await strictLessonDirectories(root);
  if (dirs.length === 0) throw new Error(`No canonical lessons found under ${root}.`);
  const loaded: LoadedLesson[] = [];
  for (const dir of dirs) {
    const [yaml, adultSource] = await Promise.all([
      requiredText(join(dir, 'lesson.yaml')), requiredText(join(dir, 'adult.md')),
    ]);
    let metadata, adult, teen;
    try {
      metadata = parseSafeYaml(yaml);
      adult = parsePresentationFile(adultSource, (metadata as LessonBundle['metadata'])?.sources?.length ?? 0);
      teen = adult;
    } catch(error) { throw new Error(`Lesson ${dir}: ${String(error)}`); }
    loaded.push({
      metadata: metadata as LessonBundle['metadata'],
      adult: adult.frontmatter as LessonBundle['adult'],
      teen: teen?.frontmatter as LessonBundle['teen'],
      adultHtml: adult.html, teenHtml: teen?.html ?? adult.html, sourceDirectory: dir,
    });
  }
  const bundles: LessonBundle[] = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
  const issues = [...validatePublicationCollection(bundles).issues, ...validateLessonReferences(bundles, routeOwnership).issues];
  if (issues.length) throw new Error(`Canonical lesson validation failed:\n${issues.map((x) => `- ${x.path} [${x.code}]: ${x.message}`).join('\n')}`);
  for(const lesson of loaded) for(const edition of ['adult'] as const) {
    const visuals=lessonVisuals(lesson[edition]);
    try {
      const assets=new Set<string>();let bytes=0;
      for(const {figure} of visuals){
        validateCitations(figure.caption, lesson.metadata.sources.length);
        validateCitations(figure.description, lesson.metadata.sources.length);
        figurePosition(lesson.adultHtml,figure.afterParagraph);
        await validateFigureAsset(figure,publicRoot);
        if(figure.type==='image'&&!assets.has(figure.src)){assets.add(figure.src);bytes+=(await lstat(join(publicRoot,figure.src.slice(1)))).size;}
      }
      if(bytes>VISUAL_LIMITS.totalBytes)throw Error('Raster figures exceed the aggregate image byte budget.');
    } catch(error) { throw new Error(`Lesson ${lesson.sourceDirectory}/${edition}.md figure: ${String(error)}`); }
  }
  // Legacy catalogue/state keys resolve to the single authored source.
  return loaded;
}
