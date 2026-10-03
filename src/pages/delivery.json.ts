import { getBuildMetadata } from '../lib/content/build-content';

export async function GET() {
  const { manifest } = await getBuildMetadata();
  return new Response(JSON.stringify({ version: 1, routes: manifest.routes }, null, 2) + '\n', {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
