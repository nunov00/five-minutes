import type { LessonBundle, RedirectEntry } from './content/schema';
import { buildRedirectManifest } from './content/schema';
import { legacyPublicationDate } from './editorial-order';
import { lessonPath, type LessonEdition } from './urls';

export interface CataloguePresentation { title: string; path: string; }
export interface CatalogueEntry {
  id: string; slug: string; aliases: readonly string[]; publishedAt: string;
  archiveDate?: string;
  originalDate?: string;
  revisedAt?: string;
  topic: string; subtopic: string; adult: CataloguePresentation; teen: CataloguePresentation;
}
export interface RouteManifestEntry {
  path: string; lessonId: string; edition: LessonEdition; slug: string;
}
export interface DeliveryManifest {
  catalogue: readonly CatalogueEntry[];
  routes: readonly RouteManifestEntry[];
  redirects: readonly RedirectEntry[];
}
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function buildDeliveryManifest(lessons: readonly LessonBundle[]): DeliveryManifest {
  if (lessons.length === 0) throw new Error('Cannot build a delivery manifest without published lessons.');
  const ids = new Set<string>(), paths = new Set<string>();
  const catalogue: CatalogueEntry[] = [], routes: RouteManifestEntry[] = [];

  for (const lesson of lessons) {
    const { metadata, adult } = lesson;
    if (!adult) throw new Error(`Cannot manifest incomplete lesson ${metadata.id}.`);
    if (ids.has(metadata.id)) throw new Error(`Duplicate lesson identity in delivery manifest: ${metadata.id}.`);
    ids.add(metadata.id);
    const adultPath = lessonPath('adult', metadata.slug);
    const lessonRoutes: RouteManifestEntry[] = [
      { path: adultPath, lessonId: metadata.id, edition: 'adult', slug: metadata.slug },
    ];
    for (const route of lessonRoutes) {
      if (paths.has(route.path)) throw new Error(`Duplicate canonical route in delivery manifest: ${route.path}.`);
      paths.add(route.path); routes.push(route);
    }
    catalogue.push({
      id: metadata.id, slug: metadata.slug, aliases: [...metadata.aliases].sort(compare),
      publishedAt: new Date(metadata.publishedAt).toISOString(), topic: metadata.topic, subtopic: metadata.subtopic,
      ...(metadata.revisedAt ? { revisedAt: metadata.revisedAt } : {}),
    ...(metadata.archive ? { archiveDate: metadata.archive.catalogueDate } : {}),
    ...(legacyPublicationDate(metadata) ? { originalDate: legacyPublicationDate(metadata) } : {}),
      adult: { title: adult.title, path: adultPath }, teen: { title: adult.title, path: adultPath },
    });
  }

  const redirects = buildRedirectManifest(lessons);
  for (const redirect of redirects) {
    if (paths.has(redirect.from)) throw new Error(`Redirect source conflicts with canonical route: ${redirect.from}.`);
    if (redirect.from === redirect.to) throw new Error(`Redirect cannot point to itself: ${redirect.from}.`);
  }
  catalogue.sort((a,b)=>compare(a.id,b.id)); routes.sort((a,b)=>compare(a.path,b.path));
  return { catalogue, routes, redirects };
}
