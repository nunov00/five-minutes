import type { APIRoute, GetStaticPaths } from 'astro';
import { getBuildMetadata } from '../../lib/content/build-content';
import { buildDiscoveryArtifacts } from '../../lib/discovery/artifacts';

export const getStaticPaths = (async () => {
  const { lessons } = await getBuildMetadata();
  const artifacts = buildDiscoveryArtifacts(lessons);
  return [artifacts.catalogue, artifacts.search.adult].map(({ path, payload }) => ({
    params: { artifact: path.split('/').at(-1)?.replace(/\.json$/, '') },
    props: { payload },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(`${JSON.stringify(props.payload)}\n`, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
});
