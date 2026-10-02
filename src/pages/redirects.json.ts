import { join } from 'node:path';
import routeOwnership from '../content/route-ownership.json';
import { loadPublishedLessons } from '../lib/content/loader';
import { buildGlobalDeliveryOutputs } from '../lib/global-delivery';

export async function GET() {
  const loaded = await loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership);
  const lessons = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
  const { redirects } = buildGlobalDeliveryOutputs(lessons, routeOwnership);
  return new Response(JSON.stringify({ version: 1, redirects }, null, 2) + '\n', {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
