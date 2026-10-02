import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parsePresentationFile, parseSafeYaml } from './safe-content';
import {
  type LessonBundle,
  type RouteOwnershipRegistry,
  validateLessonReferences,
  validatePublicationCollection,
} from './schema';

export interface LoadedLesson extends LessonBundle {
  adultHtml: string;
  teenHtml: string;
  sourceDirectory: string;
}

async function lessonDirectories(root: string): Promise<string[]> {
  const years = await readdir(root, { withFileTypes: true });
  const dirs: string[] = [];
  for (const year of years.filter((x) => x.isDirectory()).sort((a, b) => a.name < b.name ? -1 : 1)) {
    const children = await readdir(join(root, year.name), { withFileTypes: true });
    for (const child of children.filter((x) => x.isDirectory()).sort((a, b) => a.name < b.name ? -1 : 1)) {
      dirs.push(join(root, year.name, child.name));
    }
  }
  return dirs;
}

export async function loadPublishedLessons(root: string, routeOwnership: RouteOwnershipRegistry): Promise<LoadedLesson[]> {
  const dirs = await lessonDirectories(root);
  if (dirs.length === 0) throw new Error(`No canonical lessons found under ${root}.`);

  const loaded: LoadedLesson[] = [];
  for (const dir of dirs) {
    const [yaml, adultSource, teenSource] = await Promise.all([
      readFile(join(dir, 'lesson.yaml'), 'utf8'),
      readFile(join(dir, 'adult.md'), 'utf8'),
      readFile(join(dir, 'teen.md'), 'utf8'),
    ]);
    const metadata = parseSafeYaml(yaml);
    const adult = parsePresentationFile(adultSource);
    const teen = parsePresentationFile(teenSource);
    loaded.push({
      metadata: metadata as LessonBundle['metadata'],
      adult: adult.frontmatter as LessonBundle['adult'],
      teen: teen.frontmatter as LessonBundle['teen'],
      adultHtml: adult.html,
      teenHtml: teen.html,
      sourceDirectory: dir,
    });
  }

  const bundles: LessonBundle[] = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
  const results = [
    ...validatePublicationCollection(bundles).issues,
    ...validateLessonReferences(bundles, routeOwnership).issues,
  ];
  if (results.length) {
    throw new Error(`Canonical lesson validation failed:\n${results.map((x) => `- ${x.path} [${x.code}]: ${x.message}`).join('\n')}`);
  }
  return loaded;
}
