import { getBuildMetadata } from '../lib/content/build-content';

export async function GET({ site }: { site: URL | undefined }) {
  // Until the Owner selects the production origin, emit a valid empty sitemap rather than fake canonical URLs.
  if (!site) return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n', { headers: { 'content-type': 'application/xml; charset=utf-8' } });
  const outputs = await getBuildMetadata();
  const urls = outputs.sitemapPaths.map((path) => new URL(path, site).href);
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => `  <url><loc>${url.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</loc></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
