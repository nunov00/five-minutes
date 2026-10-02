import { join } from 'node:path';
import routeOwnership from '../content/route-ownership.json';
import { loadPublishedLessons } from '../lib/content/loader';
import { buildGlobalDeliveryOutputs } from '../lib/global-delivery';

export async function GET({ site }: { site: URL | undefined }) {
  if (!site) throw new Error('Astro site URL is required to generate sitemap.xml.');
  const loaded = await loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership);
  const lessons = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
  const outputs = buildGlobalDeliveryOutputs(lessons, routeOwnership);
  const urls = outputs.sitemapPaths.map((path) => new URL(path, site).href);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => `  <url><loc>${url.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
