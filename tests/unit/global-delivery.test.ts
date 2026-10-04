import { describe, expect, it } from 'vitest';
import { buildGlobalDeliveryOutputs } from '../../src/lib/global-delivery';
import type { LessonBundle } from '../../src/lib/content/schema';

const lesson: LessonBundle = {
  metadata: {
    schemaVersion: 2, id: '0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70', slug: 'current-name', aliases: [],
    publishedAt: '2026-10-02T18:00:00Z', topic: 'science', subtopic: 'physics', concepts: [],
    related: { manual: [], exclude: [] }, sources: [],
    provenance: { createdAt: '2026-10-02T18:00:00Z', createdBy: { type: 'human' }, reviews: [] },
  },
  adult: { title: 'Adult', description: 'd', takeaway: 't', question: 'q', answer: 'a', searchTerms: [] },
  teen: { title: 'Teen', description: 'd', takeaway: 't', question: 'q', answer: 'a', searchTerms: [] },
};

describe('global delivery outputs', () => {
  it('preserves retired historical route names as redirects', () => {
    const outputs = buildGlobalDeliveryOutputs([lesson], {
      'current-name': lesson.metadata.id,
      'retired-name': lesson.metadata.id,
    });
    expect(outputs.redirects).toEqual([
      { from: '/adult/retired-name', to: '/adult/current-name', lessonId: lesson.metadata.id },
      { from: '/teen/retired-name', to: '/teen/current-name', lessonId: lesson.metadata.id },
    ]);
  });

  it('fails closed when historical ownership points at no published lesson', () => {
    expect(() => buildGlobalDeliveryOutputs([lesson], {
      'current-name': lesson.metadata.id,
      orphaned: '0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c71',
    })).toThrow(/unknown lesson/);
  });

  it('produces deterministic sitemap paths from canonical routes only', () => {
    expect(buildGlobalDeliveryOutputs([lesson], { 'current-name': lesson.metadata.id }).sitemapPaths)
      .toEqual(['/', '/adult/current-name', '/editions/adult/library', '/editions/adult/topics', '/editions/adult/topics/science', '/editions/teen/library', '/editions/teen/topics', '/editions/teen/topics/science', '/search', '/teen/current-name']);
  });

  it('rejects malformed historical route names independently of the loader', () => {
    expect(() => buildGlobalDeliveryOutputs([lesson], {
      'current-name': lesson.metadata.id,
      'bad route': lesson.metadata.id,
    })).toThrow(/Invalid route ownership registry/);
  });

  it('rejects a historical redirect source that is another canonical route', () => {
    const second: LessonBundle = {
      ...lesson,
      metadata: { ...lesson.metadata, id: '0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c71', slug: 'second-name' },
    };
    expect(() => buildGlobalDeliveryOutputs([lesson, second], {
      'current-name': lesson.metadata.id,
      'second-name': lesson.metadata.id,
    })).toThrow(/conflicts with a canonical route/);
  });
});
