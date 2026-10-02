import type { LessonBundle, RedirectEntry, RouteOwnershipRegistry } from './content/schema';
import { lessonPath } from './urls';
import { buildDeliveryManifest, type DeliveryManifest } from './delivery-manifest';

export interface GlobalDeliveryOutputs {
  manifest: DeliveryManifest;
  redirects: readonly RedirectEntry[];
  sitemapPaths: readonly string[];
}

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function buildGlobalDeliveryOutputs(
  lessons: readonly LessonBundle[],
  ownership: RouteOwnershipRegistry,
): GlobalDeliveryOutputs {
  const manifest = buildDeliveryManifest(lessons);
  const byId = new Map(lessons.map((lesson) => [lesson.metadata.id, lesson]));
  const redirects = [...manifest.redirects];
  const seen = new Set(redirects.map((entry) => entry.from));

  for (const [historicalName, lessonId] of Object.entries(ownership).sort(([a], [b]) => compare(a, b))) {
    const lesson = byId.get(lessonId);
    if (!lesson) throw new Error(`Historical route "${historicalName}" references unknown lesson ${lessonId}.`);
    if (historicalName === lesson.metadata.slug) continue;
    for (const edition of ['adult', 'teen'] as const) {
      const from = lessonPath(edition, historicalName);
      const to = lessonPath(edition, lesson.metadata.slug);
      if (from === to) continue;
      if (!seen.has(from)) {
        seen.add(from);
        redirects.push({ from, to, lessonId });
      }
    }
  }

  redirects.sort((a, b) => compare(a.from, b.from));
  const sitemapPaths = ['/', ...manifest.routes.map((route) => route.path)].sort(compare);
  return { manifest, redirects, sitemapPaths };
}
