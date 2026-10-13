import { describe, expect, it } from 'vitest';
import {
  parseAnalyticsAggregate,
  parseAnalyticsEvent,
  summarizeAnalyticsRows,
  type AnalyticsRow,
} from '../../src/lib/analytics/contracts';
import { ANALYTICS_SEEN_KEY, analyticsCollectionAllowed, analyticsStorage } from '../../src/lib/analytics/storage';

const lessonId = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e10';

describe('analytics contracts', () => {
  it('honours privacy signals and owns its bounded local marker', () => {
    expect(analyticsCollectionAllowed({})).toBe(true);
    expect(analyticsCollectionAllowed({ doNotTrack: '1' })).toBe(false);
    expect(analyticsCollectionAllowed({ globalPrivacyControl: true })).toBe(false);

    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    };
    const marker = analyticsStorage(() => storage);
    const event = { event: 'page_view', dimension: 'home' } as const;
    const today = new Date('2026-10-13T18:00:00Z');
    expect(marker.firstToday(event, today)).toBe(true);
    expect(marker.firstToday(event, today)).toBe(false);
    expect(marker.firstToday(event, new Date('2026-10-14T00:00:00Z'))).toBe(true);
    expect(values.has(ANALYTICS_SEEN_KEY)).toBe(true);
    expect(marker.reset()).toBe(true);
    expect(values.has(ANALYTICS_SEEN_KEY)).toBe(false);
  });

  it('accepts only bounded public event shapes', () => {
    expect(parseAnalyticsEvent({ event: 'page_view', page: 'home' })).toEqual({ event: 'page_view', dimension: 'home' });
    expect(parseAnalyticsEvent({ event: 'lesson_view', edition: 'adult', lessonId: lessonId.toUpperCase() }))
      .toEqual({ event: 'lesson_view', dimension: `adult:${lessonId}` });
    expect(parseAnalyticsEvent({ event: 'outbound' })).toEqual({ event: 'outbound', dimension: '' });
    expect(parseAnalyticsEvent({ event: 'page_view', page: '/arbitrary/high-cardinality' })).toBeNull();
    expect(parseAnalyticsEvent({ event: 'lesson_view', edition: 'adult', lessonId, referrer: 'private' })).toBeNull();
    expect(parseAnalyticsEvent({ event: 'unknown' })).toBeNull();
  });

  it('revalidates normalized object-boundary events', () => {
    expect(parseAnalyticsAggregate({ event: 'related', dimension: `teen:${lessonId}` }))
      .toEqual({ event: 'related', dimension: `teen:${lessonId}` });
    expect(parseAnalyticsAggregate({ event: 'related', dimension: `teen:${lessonId}:extra` })).toBeNull();
    expect(parseAnalyticsAggregate({ event: 'outbound', dimension: 'https://private.example' })).toBeNull();
  });

  it('builds a bounded public summary and ignores malformed rows', () => {
    const rows: AnalyticsRow[] = [
      { day: '2026-10-13', event: 'page_view', dimension: 'home', count: 4 },
      { day: '2026-10-13', event: 'lesson_view', dimension: `adult:${lessonId}`, count: 3 },
      { day: '2026-10-12', event: 'lesson_view', dimension: `teen:${lessonId}`, count: 2 },
      { day: '2026-10-13', event: 'save', dimension: `adult:${lessonId}`, count: 1 },
      { day: '2025-01-01', event: 'page_view', dimension: 'home', count: 99 },
      { day: 'bad', event: 'page_view', dimension: 'home', count: 99 },
    ];
    const summary = summarizeAnalyticsRows(rows, 30, new Date('2026-10-13T18:00:00Z'));

    expect(summary.range).toEqual({ from: '2026-09-14', to: '2026-10-13', days: 30 });
    expect(summary.totals).toEqual({ views: 9, pageViews: 4, lessonViews: 5, interactions: 1 });
    expect(summary.editions).toEqual({ adult: 3, teen: 2 });
    expect(summary.lessons).toEqual([
      { id: lessonId, edition: 'adult', count: 3 },
      { id: lessonId, edition: 'teen', count: 2 },
    ]);
    expect(summary.series).toEqual([
      { day: '2026-10-12', views: 2, interactions: 0 },
      { day: '2026-10-13', views: 7, interactions: 1 },
    ]);
  });
});
