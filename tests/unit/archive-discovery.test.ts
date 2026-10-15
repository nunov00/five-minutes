import { describe, expect, it } from 'vitest';
import { validLesson } from '../fixtures/lesson-fixtures';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';
import { buildDiscoveryArtifacts } from '../../src/lib/discovery/artifacts';
import { newestLessons } from '../../src/lib/discovery/catalogue';
import { selectTodayLesson } from '../../src/lib/today';
import { searchDocuments } from '../../src/lib/discovery/search';

describe('archive discovery', () => {
  it('keeps actual publication time while ordering archive discovery by the legacy date', () => {
    const original = validLesson();
    const archive = validLesson();
    archive.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    archive.metadata.slug = 'archive-example';
    archive.metadata.aliases = [];
    archive.metadata.publishedAt = '2026-10-16T06:00:00Z';
    archive.metadata.archive = { sourceUrl: 'https://example.com/old', catalogueDate: '2026-08-04' };
    const lessons = [archive, original];
    expect(newestLessons(lessons).map(l => l.metadata.id)).toEqual([original.metadata.id, archive.metadata.id]);
    const manifest = buildDeliveryManifest(lessons);
    const entry = manifest.catalogue.find(l => l.id === archive.metadata.id)!;
    expect(entry).toMatchObject({ publishedAt: '2026-10-16T06:00:00.000Z', archiveDate: '2026-08-04' });
    expect(selectTodayLesson(manifest.catalogue).id).toBe(original.metadata.id);
    const artifacts = buildDiscoveryArtifacts(lessons);
    expect(artifacts.catalogue.payload.map(l => l.id)).toEqual([original.metadata.id, archive.metadata.id]);
    expect(artifacts.search.adult.payload[1]).toMatchObject({ archiveDate: '2026-08-04', publishedAt: entry.publishedAt });
    // Equal relevance must not let a new import leapfrog an original lesson.
    expect(searchDocuments(artifacts.search.adult.payload, 'satellite clocks').map(r => r.document.id))
      .toEqual([original.metadata.id, archive.metadata.id]);
  });
});
