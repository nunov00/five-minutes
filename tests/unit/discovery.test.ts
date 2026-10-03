import { describe, expect, it } from 'vitest';
import { buildDiscoveryArtifacts } from '../../src/lib/discovery/artifacts';
import { libraryPages } from '../../src/lib/discovery/catalogue';
import { relatedLessons } from '../../src/lib/discovery/related';
import { searchDocuments } from '../../src/lib/discovery/search';
import { validLesson } from '../fixtures/lesson-fixtures';

const secondId = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
const thirdId = '018f47a2-5d7b-7c31-ad4f-0d9a8b6c2e13';

function corpus() {
  const first = validLesson();
  const second = validLesson({
    metadata: {
      ...validLesson().metadata,
      id: secondId,
      slug: 'how-clocks-found-longitude',
      aliases: [],
      publishedAt: '2026-10-04T00:00:00Z',
      topic: 'society',
      subtopic: 'history',
      concepts: ['longitude', 'timekeeping'],
      related: { manual: [{ id: first.metadata.id, reason: 'Both turn accurate time into a position.' }], exclude: [] },
    },
    adult: { ...validLesson().adult!, title: 'How a Clock Found Longitude', searchTerms: ['marine chronometer'] },
    teen: { ...validLesson().teen!, title: 'The Clock That Found a Ship', searchTerms: ['ship clock'] },
  });
  const third = validLesson({
    metadata: {
      ...validLesson().metadata,
      id: thirdId,
      slug: 'why-maps-distort',
      aliases: [],
      topic: 'society',
      subtopic: 'geography',
      concepts: ['maps', 'distortion'],
      related: { manual: [], exclude: [] },
    },
    adult: { ...validLesson().adult!, title: 'Why Maps Distort' },
    teen: { ...validLesson().teen!, title: 'No Flat Map Is Honest' },
  });
  first.metadata.related.manual = [
    { id: second.metadata.id, reason: 'Both turn precise time into position.' },
    { id: third.metadata.id, reason: 'Both depend on representing Earth accurately.' },
  ];
  return [first, second, third];
}

describe('M5 discovery contracts', () => {
  it('builds deterministic content-hashed compact and edition-specific artifacts', () => {
    const first = buildDiscoveryArtifacts(corpus());
    const second = buildDiscoveryArtifacts(corpus());
    expect(first.catalogue.path).toMatch(/^\/discovery\/catalogue\.[a-f0-9]{12}\.json$/);
    expect(first).toEqual(second);
    expect(first.search.adult.path).not.toBe(first.search.teen.path);
    expect(first.search.adult.payload[0].edition).toBe('adult');
    expect(first.search.teen.payload[0].edition).toBe('teen');
    expect(JSON.stringify(first.catalogue.payload)).not.toContain('takeaway');
  });

  it('ranks exact discovery terms, prefixes and one-character mistakes', () => {
    const documents = buildDiscoveryArtifacts(corpus()).search.adult.payload;
    expect(searchDocuments(documents, 'marine chronometer')[0].document.id).toBe(secondId);
    expect(searchDocuments(documents, 'longit')[0].document.id).toBe(secondId);
    expect(searchDocuments(documents, 'longitide')[0].document.id).toBe(secondId);
    expect(searchDocuments(documents, 'not present')).toEqual([]);
  });

  it('keeps Adult and Teen wording separate', () => {
    const artifacts = buildDiscoveryArtifacts(corpus());
    expect(searchDocuments(artifacts.search.adult.payload, 'marine chronometer')).toHaveLength(1);
    expect(searchDocuments(artifacts.search.teen.payload, 'marine chronometer')).toHaveLength(0);
    expect(searchDocuments(artifacts.search.teen.payload, 'ship clock')).toHaveLength(1);
  });

  it('uses manual related reasons and shared URL generation deterministically', () => {
    const lessons = corpus();
    const related = relatedLessons(lessons[0].metadata.id, lessons, 'teen');
    expect(related).toHaveLength(2);
    expect(related.map((entry) => entry.id)).toEqual([secondId, thirdId]);
    expect(related[0]).toEqual(expect.objectContaining({
      path: '/teen/how-clocks-found-longitude',
      reason: 'Both turn precise time into position.',
    }));
  });

  it('paginates only by lesson identity', () => {
    const pages = libraryPages(corpus(), 2);
    expect(pages.map((page) => page.length)).toEqual([2, 1]);
    expect(pages.flat()).toHaveLength(3);
  });
});
