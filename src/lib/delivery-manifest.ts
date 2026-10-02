import type { LoadedLesson } from './content/loader';
import { lessonPath, type LessonEdition } from './urls';

export interface CataloguePresentation {
  title: string;
  path: string;
}

export interface CatalogueEntry {
  id: string;
  slug: string;
  aliases: readonly string[];
  publishedAt: string;
  topic: string;
  subtopic: string;
  adult: CataloguePresentation;
  teen: CataloguePresentation;
}

export interface RouteManifestEntry {
  path: string;
  lessonId: string;
  edition: LessonEdition;
  slug: string;
}

export interface DeliveryManifest {
  catalogue: readonly CatalogueEntry[];
  routes: readonly RouteManifestEntry[];
}

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function buildDeliveryManifest(lessons: readonly LoadedLesson[]): DeliveryManifest {
  if (lessons.length === 0) throw new Error('Cannot build a delivery manifest without published lessons.');

  const ids = new Set<string>();
  const paths = new Set<string>();
  const catalogue: CatalogueEntry[] = [];
  const routes: RouteManifestEntry[] = [];

  for (const lesson of lessons) {
    const { metadata, adult, teen } = lesson;
    if (!adult || !teen) throw new Error(`Cannot manifest incomplete lesson ${metadata.id}.`);
    if (ids.has(metadata.id)) throw new Error(`Duplicate lesson identity in delivery manifest: ${metadata.id}.`);
    ids.add(metadata.id);

    const adultPath = lessonPath('adult', metadata.slug);
    const teenPath = lessonPath('teen', metadata.slug);
    const lessonRoutes: RouteManifestEntry[] = [
      { path: adultPath, lessonId: metadata.id, edition: 'adult', slug: metadata.slug },
      { path: teenPath, lessonId: metadata.id, edition: 'teen', slug: metadata.slug },
    ];
    for (const route of lessonRoutes) {
      if (paths.has(route.path)) throw new Error(`Duplicate canonical route in delivery manifest: ${route.path}.`);
      paths.add(route.path);
      routes.push(route);
    }

    catalogue.push({
      id: metadata.id,
      slug: metadata.slug,
      aliases: [...metadata.aliases].sort(compare),
      publishedAt: metadata.publishedAt,
      topic: metadata.topic,
      subtopic: metadata.subtopic,
      adult: { title: adult.title, path: adultPath },
      teen: { title: teen.title, path: teenPath },
    });
  }

  catalogue.sort((a, b) => compare(a.id, b.id));
  routes.sort((a, b) => compare(a.path, b.path));
  return { catalogue, routes };
}
