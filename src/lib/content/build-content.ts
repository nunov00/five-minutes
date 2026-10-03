import { join } from 'node:path';
import routeOwnership from '../../content/route-ownership.json';
import { loadPublishedLessons } from './loader';
import { createBuildSnapshotLoader } from './build-snapshot';

const createLoader = () => createBuildSnapshotLoader(
  () => loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership),
  routeOwnership,
);
const loadBuildSnapshot = createLoader();

// Astro's static build runs in a fresh process. Its server bundle shares this
// module across routes. In dev/test, fresh reads avoid stale content and registry
// edits; no persistent cache or cross-build state is introduced.
export const getBuildContent = () => import.meta.env.PROD ? loadBuildSnapshot() : createLoader()();

export async function getBuildMetadata() {
  return (await getBuildContent()).metadata;
}
