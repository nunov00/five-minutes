import { describe, expect, it } from 'vitest';
import type { CatalogueEntry } from '../../src/lib/delivery-manifest';
import { formatEditorialDate, selectEarlierLessons, selectTodayLesson } from '../../src/lib/today';

const entry = (id: string, publishedAt: string): CatalogueEntry => ({
  id, slug: `lesson-${id}`, aliases: [], publishedAt, topic: 'science', subtopic: 'physics',
  adult: { title: 'Adult', path: `/adult/lesson-${id}` }, teen: { title: 'Teen', path: `/teen/lesson-${id}` },
});

describe('Today selection (ADR-0007)', () => {
  it('selects the newest published lesson regardless of catalogue order', () => {
    const catalogue = [
      entry('a', '2026-10-01T06:00:00.000Z'),
      entry('c', '2026-10-03T06:00:00.000Z'),
      entry('b', '2026-10-02T06:00:00.000Z'),
    ];
    expect(selectTodayLesson(catalogue).id).toBe('c');
    expect(selectTodayLesson([...catalogue].reverse()).id).toBe('c');
  });

  it('compares instants, not timestamp strings', () => {
    const catalogue = [entry('a', '2026-10-02T23:30:00+02:00'), entry('b', '2026-10-02T22:00:00Z')];
    expect(selectTodayLesson(catalogue).id).toBe('b');
  });

  it('breaks equal publication times deterministically by lesson ID', () => {
    const catalogue = [entry('b', '2026-10-02T06:00:00.000Z'), entry('a', '2026-10-02T06:00:00.000Z')];
    expect(selectTodayLesson(catalogue).id).toBe('b');
    expect(selectTodayLesson([...catalogue].reverse()).id).toBe('b');
  });

  it('keeps showing the newest lesson when nothing newer exists', () => {
    expect(selectTodayLesson([entry('a', '2020-01-01T00:00:00.000Z')]).id).toBe('a');
  });

  it('fails closed without published lessons', () => {
    expect(() => selectTodayLesson([])).toThrow(/without published lessons/);
  });

  it('selects a bounded deterministic Earlier list without Today', () => {
    const catalogue = [
      entry('a', '2026-10-01T08:00:00.000Z'),
      entry('b', '2026-10-02T08:00:00.000Z'),
      entry('c', '2026-10-02T08:00:00.000Z'),
      entry('d', '2026-10-03T08:00:00.000Z'),
      entry('e', '2026-10-04T08:00:00.000Z'),
    ];
    expect(selectEarlierLessons(catalogue, 'e', 3).map(({ id }) => id)).toEqual(['d', 'c', 'b']);
    expect(() => selectEarlierLessons(catalogue, 'e', -1)).toThrow(/non-negative integer/);
  });
});

describe('editorial date', () => {
  it('formats dates in the Europe/Zurich editorial timezone', () => {
    expect(formatEditorialDate('2026-10-02T18:00:00.000Z')).toBe('2 October 2026');
    // 22:30 UTC is already the next calendar day in Zurich (UTC+2 in October).
    expect(formatEditorialDate('2026-10-02T22:30:00.000Z')).toBe('3 October 2026');
    expect(formatEditorialDate('2026-10-03T00:30:00+02:00')).toBe('3 October 2026');
  });

  it('rejects invalid timestamps', () => {
    expect(() => formatEditorialDate('not a date')).toThrow(/Invalid publication timestamp/);
  });
});
