import { describe, expect, it } from 'vitest';
import { TAXONOMY, isTaxonomyPair, taxonomySubtopic, taxonomyTopic } from '../../src/lib/taxonomy';

describe('controlled discovery taxonomy', () => {
  it('defines six stable, uniquely named topics with unique subtopics', () => {
    expect(TAXONOMY).toHaveLength(6);
    expect(new Set(TAXONOMY.map((topic) => topic.token)).size).toBe(TAXONOMY.length);
    for (const topic of TAXONOMY) {
      expect(topic.label).not.toBe('');
      expect(topic.description).not.toBe('');
      expect(topic.subtopics.length).toBeGreaterThan(0);
      expect(new Set(topic.subtopics.map((subtopic) => subtopic.token)).size).toBe(topic.subtopics.length);
    }
  });

  it('only accepts subtopics under their declared parent topic', () => {
    expect(isTaxonomyPair('science', 'physics')).toBe(true);
    expect(isTaxonomyPair('technology', 'physics')).toBe(false);
    expect(taxonomyTopic('unknown')).toBeUndefined();
    expect(taxonomySubtopic('science', 'unknown')).toBeUndefined();
  });
});
