import { describe, expect, it } from 'vitest';
import { buildDeliveryManifest } from '../../src/lib/delivery-manifest';
import { lessonPath } from '../../src/lib/urls';
import type { LoadedLesson } from '../../src/lib/content/loader';

function lesson(id: string, slug: string, adultTitle = 'Adult', teenTitle = 'Teen'): LoadedLesson {
  return {
    metadata: {
      schemaVersion: 1, id, slug, aliases: ['old-' + slug],
      publishedAt: '2026-10-02T18:00:00Z', topic: 'science', subtopic: 'physics',
      concepts: ['test'], related: { manual: [], exclude: [] }, sources: [],
      provenance: { createdAt: '2026-10-02T17:00:00Z', createdBy: { type: 'human' }, reviews: [] },
    },
    adult: { title: adultTitle, description: 'd', takeaway: 't', question: 'q', answer: 'a', searchTerms: [] },
    teen: { title: teenTitle, description: 'd', takeaway: 't', question: 'q', answer: 'a', searchTerms: [] },
    adultHtml: '<p>adult</p>', teenHtml: '<p>teen</p>', sourceDirectory: '/tmp/' + slug,
  };
}

describe('delivery manifest', () => {
  it('creates deterministic catalogue metadata and exactly two canonical routes per lesson', () => {
    const a = lesson('0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70', 'alpha', 'Alpha adult', 'Alpha teen');
    const b = lesson('0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c71', 'beta');
    const first = buildDeliveryManifest([b, a]);
    const second = buildDeliveryManifest([a, b]);
    expect(first).toEqual(second);
    expect(first.catalogue).toHaveLength(2);
    expect(first.routes).toHaveLength(4);
    expect(first.routes.map((x) => x.path)).toEqual([
      lessonPath('adult', 'alpha'), lessonPath('adult', 'beta'),
      lessonPath('teen', 'alpha'), lessonPath('teen', 'beta'),
    ]);
    expect(first.catalogue[0].adult.title).toBe('Alpha adult');
    expect(first.catalogue[0].teen.title).toBe('Alpha teen');
  });

  it('fails closed for an empty or incomplete collection', () => {
    expect(() => buildDeliveryManifest([])).toThrow(/without published lessons/);
    const incomplete = lesson('0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70', 'alpha');
    incomplete.teen = undefined;
    expect(() => buildDeliveryManifest([incomplete])).toThrow(/incomplete lesson/);
  });

  it('fails closed on duplicate identities or canonical paths even if upstream validation is bypassed', () => {
    const id = '0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70';
    expect(() => buildDeliveryManifest([lesson(id, 'alpha'), lesson(id, 'beta')])).toThrow(/Duplicate lesson identity/);
    expect(() => buildDeliveryManifest([
      lesson(id, 'same'),
      lesson('0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c71', 'same'),
    ])).toThrow(/Duplicate canonical route/);
  });

  it('does not put lesson bodies or provider-specific data into the compact catalogue', () => {
    const manifest = buildDeliveryManifest([lesson('0199a5b7-6e21-7a42-9c3d-8f1b2e4a6c70', 'alpha')]);
    const json = JSON.stringify(manifest.catalogue);
    expect(json).not.toContain('adultHtml');
    expect(json).not.toContain('teenHtml');
    expect(json).not.toContain('cloudflare');
    expect(json).not.toContain('sourceDirectory');
  });
});
