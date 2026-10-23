import type { LessonBundle, RedirectEntry, RouteOwnershipRegistry } from './content/schema';
import { validateRouteOwnershipRegistry } from './content/schema';
import { lessonPath } from './urls';
import { buildDeliveryManifest, type DeliveryManifest } from './delivery-manifest';
import { discoveryPagePaths } from './discovery/catalogue';

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
  const registryValidation = validateRouteOwnershipRegistry(ownership);
  if (!registryValidation.valid) {
    throw new Error(`Invalid route ownership registry: ${registryValidation.issues.map((issue) => issue.message).join('; ')}`);
  }

  const manifest = buildDeliveryManifest(lessons);
  const byId = new Map(lessons.map((lesson) => [lesson.metadata.id, lesson]));
  const canonicalPaths = new Set(manifest.routes.map((route) => route.path));
  const redirects = [...manifest.redirects];
  const redirectTargets = new Map(redirects.map((entry) => [entry.from, entry.to]));

  for (const [historicalName, lessonId] of Object.entries(ownership).sort(([a], [b]) => compare(a, b))) {
    const lesson = byId.get(lessonId);
    if (!lesson) throw new Error(`Historical route "${historicalName}" references unknown lesson ${lessonId}.`);
    if (historicalName === lesson.metadata.slug) {
      redirects.push({ from: `/teen/${historicalName}`, to: lessonPath('adult', historicalName), lessonId });
      continue;
    }

    for (const edition of ['adult', 'teen'] as const) {
      const from = edition === 'teen' ? `/teen/${historicalName}` : lessonPath(edition, historicalName);
      const to = lessonPath(edition, lesson.metadata.slug);
      if (canonicalPaths.has(from)) throw new Error(`Historical redirect source "${from}" conflicts with a canonical route.`);
      const existingTarget = redirectTargets.get(from);
      if (existingTarget !== undefined && existingTarget !== to) {
        throw new Error(`Historical redirect source "${from}" conflicts with redirect target "${existingTarget}".`);
      }
      if (existingTarget === undefined) {
        redirectTargets.set(from, to);
        redirects.push({ from, to, lessonId });
      }
    }
  }

  for (const target of discoveryPagePaths(lessons).filter(path=>path.startsWith('/library')||path.startsWith('/topics'))) {
    for (const edition of ['adult','teen']) redirects.push({from:`/editions/${edition}${target}`,to:target});
  }
  redirects.sort((a, b) => compare(a.from, b.from));
  const sitemapPaths = [...discoveryPagePaths(lessons), '/analytics', '/feedback', ...manifest.routes.map((route) => route.path)].sort(compare);
  return { manifest, redirects, sitemapPaths };
}
