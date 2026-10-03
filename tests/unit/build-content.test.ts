import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Astro build content mode', () => {
  it('shares one full load across production metadata and reading consumers', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const source = await import('../../src/lib/content/loader');
    const load = vi.spyOn(source, 'loadPublishedLessons');
    const { getBuildContent, getBuildMetadata } = await import('../../src/lib/content/build-content');
    const [metadata, content, anotherMetadata] = await Promise.all([
      getBuildMetadata(), getBuildContent(), getBuildMetadata(),
    ]);
    expect(metadata).toBe(content.metadata);
    expect(anotherMetadata).toBe(metadata);
    expect(await getBuildContent()).toBe(content);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('loads fresh content for each development consumer', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const source = await import('../../src/lib/content/loader');
    const realLoad = source.loadPublishedLessons;
    let revision = 0;
    const load = vi.spyOn(source, 'loadPublishedLessons').mockImplementation(async (...args) => {
      const lessons = await realLoad(...args);
      const lesson = lessons[0];
      if (!lesson?.adult) throw new Error('Test requires a canonical Adult presentation');
      lesson.adult.title = `Development revision ${++revision}`;
      return lessons;
    });
    const { getBuildContent, getBuildMetadata } = await import('../../src/lib/content/build-content');
    const first = await getBuildMetadata();
    const second = await getBuildContent();
    const third = await getBuildMetadata();
    expect(first.manifest.catalogue[0].adult.title).toBe('Development revision 1');
    expect(second.metadata.manifest.catalogue[0].adult.title).toBe('Development revision 2');
    expect(third.manifest.catalogue[0].adult.title).toBe('Development revision 3');
    expect(load).toHaveBeenCalledTimes(3);
  });
});
