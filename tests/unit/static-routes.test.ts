import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import routeOwnership from '../../src/content/route-ownership.json';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';

describe('static lesson routes', () => {
  it('defines Astro static paths from the delivery manifest', async () => {
    const source = await readFile(join(process.cwd(), 'src/pages/[edition]/[slug].astro'), 'utf8');
    expect(source).toContain('export async function getStaticPaths()');
    expect(source).toContain('getBuildContent');
    expect(source).toContain('manifest.routes.map');
    expect(source).toContain('route.path !== expectedPath');
    expect(source).toContain('route.path !== astroPath');
    expect(source).toContain('alternatePath');
  });

  it('the real manifest has one Adult and one Teen canonical route per lesson', async () => {
    const loaded = await loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership);
    const bundles = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
    const manifest = buildDeliveryManifest(bundles);
    for (const lesson of loaded) {
      const routes = manifest.routes.filter((route) => route.lessonId === lesson.metadata.id);
      expect(routes.map((route) => route.edition).sort()).toEqual(['adult', 'teen']);
    }
  });
});
