import { getBuildMetadata } from '../lib/content/build-content';

export async function GET() {
  const { manifest, lessons } = await getBuildMetadata();
  const modes = new Map(lessons.map(lesson => [lesson.metadata.id, lesson.adult?.opening]));
  const routes = manifest.routes.map(route => {
    if (!modes.has(route.lessonId)) throw Error('Delivery route has no validated lesson.');
    const opening = modes.get(route.lessonId);
    return opening ? {...route, opening} : route;
  });
  return new Response(JSON.stringify({ version: 1, routes }, null, 2) + '\n', {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
