import { mkdtemp, cp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import routeOwnership from '../../src/content/route-ownership.json';
import { createBuildSnapshotLoader } from '../../src/lib/content/build-snapshot';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import { buildGlobalDeliveryOutputs } from '../../src/lib/global-delivery';

const canonicalRoot = join(process.cwd(), 'src/content/lessons');

describe('shared build snapshot', () => {
  it('shares in-flight loading and completed work across metadata and body consumers', async () => {
    const load = vi.fn(() => loadPublishedLessons(canonicalRoot, routeOwnership));
    const get = createBuildSnapshotLoader(load, routeOwnership);
    const [discovery, reading, redirects] = await Promise.all([get(), get(), get()]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(discovery).toBe(reading);
    expect(reading).toBe(redirects);
    expect(await get()).toBe(discovery);
    expect(load).toHaveBeenCalledTimes(1);

    const id = discovery.metadata.manifest.catalogue[0].id;
    expect(reading.getLesson(id).adultHtml).toBeTruthy();
    expect(reading.getLesson(id).teenHtml).toBeTruthy();
    expect(() => reading.getLesson('missing')).toThrow(/no lesson missing/);
    expect(JSON.stringify(discovery.metadata)).not.toMatch(/adultHtml|teenHtml|sourceDirectory/);
  });

  it('preserves delivery outputs and protects shared nested content from consumer mutation', async () => {
    const loaded = await loadPublishedLessons(canonicalRoot, routeOwnership);
    const expected = buildGlobalDeliveryOutputs(loaded, routeOwnership);
    const snapshot = await createBuildSnapshotLoader(async () => loaded, routeOwnership)();
    expect(snapshot.metadata.manifest).toEqual(expected.manifest);
    expect(snapshot.metadata.redirects).toEqual(expected.redirects);
    expect(snapshot.metadata.sitemapPaths).toEqual(expected.sitemapPaths);
    const lesson = snapshot.getLesson(loaded[0].metadata.id);
    expect(() => lesson.metadata.concepts.push('corrupted')).toThrow();
    expect(() => { snapshot.metadata.manifest.catalogue[0].adult.title = 'corrupted'; }).toThrow();
    expect(() => { lesson.adultHtml = '<script>corrupted</script>'; }).toThrow();
  });

  it('fails closed for concurrent consumers, then permits a corrected source to be retried', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-snapshot-'));
    const load = vi.fn(() => loadPublishedLessons(root, routeOwnership));
    const get = createBuildSnapshotLoader(load, routeOwnership);
    const results = await Promise.allSettled([get(), get()]);
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
    await cp(canonicalRoot, root, { recursive: true });
    expect((await get()).metadata.manifest.routes.length).toBeGreaterThan(0);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('isolates successive build snapshots and revalidates changed content', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-rebuild-'));
    await cp(canonicalRoot, root, { recursive: true });
    const oldBuild = await createBuildSnapshotLoader(() => loadPublishedLessons(root, routeOwnership), routeOwnership)();
    const file = join(root, '2026/why-gps-needs-einstein/adult.md');
    await writeFile(file, (await readFile(file, 'utf8')) + '\n# Forbidden body heading\n');
    const nextBuild = createBuildSnapshotLoader(() => loadPublishedLessons(root, routeOwnership), routeOwnership);
    await expect(nextBuild()).rejects.toThrow(/heading/i);
    expect(oldBuild.getLesson(oldBuild.metadata.manifest.catalogue[0].id).adultHtml).not.toContain('Forbidden');
  });

  it('never reuses content across distinct ownership registries', async () => {
    const good = createBuildSnapshotLoader(() => loadPublishedLessons(canonicalRoot, routeOwnership), routeOwnership);
    const invalid = createBuildSnapshotLoader(() => loadPublishedLessons(canonicalRoot, {}), {});
    await expect(good()).resolves.toBeDefined();
    await expect(invalid()).rejects.toThrow(/unregistered-route/);
  });
});
