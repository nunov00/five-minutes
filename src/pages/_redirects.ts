---
import { join } from 'node:path';
import routeOwnership from '../content/route-ownership.json';
import { loadPublishedLessons } from '../lib/content/loader';
import { buildGlobalDeliveryOutputs } from '../lib/global-delivery';

export async function GET() {
  const loaded = await loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership);
  const lessons = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
  const outputs = buildGlobalDeliveryOutputs(lessons, routeOwnership);
  const body = outputs.redirects.map(({ from, to }) => `${from} ${to} 301`).join('\n') + '\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
---
