import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsCounter } from '../../deploy/cloudflare/analytics-counter';
import type { AnalyticsRow } from '../../src/lib/analytics/contracts';

class FakeSql {
  readonly dailyLimits = new Map<string, number>();
  readonly dailyCounts = new Map<string, AnalyticsRow>();

  exec<T>(query: string, ...bindings: unknown[]): { toArray(): T[] } {
    const sql = query.replace(/\s+/g, ' ').trim();
    let rows: unknown[] = [];
    if (sql.startsWith('SELECT count FROM daily_limits')) {
      const count = this.dailyLimits.get(String(bindings[0]));
      rows = count === undefined ? [] : [{ count }];
    } else if (sql.startsWith('DELETE FROM daily_limits')) {
      const before = String(bindings[0]);
      for (const day of this.dailyLimits.keys()) if (day < before) this.dailyLimits.delete(day);
    } else if (sql.startsWith('INSERT INTO daily_limits')) {
      const day = String(bindings[0]);
      this.dailyLimits.set(day, (this.dailyLimits.get(day) ?? 0) + 1);
    } else if (sql.startsWith('DELETE FROM daily_counts')) {
      const before = String(bindings[0]);
      for (const [key, row] of this.dailyCounts) if (row.day < before) this.dailyCounts.delete(key);
    } else if (sql.startsWith('INSERT INTO daily_counts')) {
      const [day, event, dimension] = bindings.map(String);
      const key = `${day}|${event}|${dimension}`;
      const previous = this.dailyCounts.get(key);
      this.dailyCounts.set(key, { day, event: event as AnalyticsRow['event'], dimension, count: (previous?.count ?? 0) + 1 });
    } else if (sql.startsWith('SELECT day, event, dimension, count FROM daily_counts')) {
      const from = String(bindings[0]);
      rows = [...this.dailyCounts.values()].filter((row) => row.day >= from)
        .sort((a, b) => a.day.localeCompare(b.day) || a.event.localeCompare(b.event) || a.dimension.localeCompare(b.dimension));
    }
    return { toArray: () => rows as T[] };
  }
}

function counter(sql: FakeSql, perMinute = 3_000, perDay = 10_000) {
  return new AnalyticsCounter({ storage: { sql } }, undefined, { perMinute, perDay });
}

function event(body: unknown) {
  return new Request('https://analytics.internal/event', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

afterEach(() => vi.useRealTimers());

describe('AnalyticsCounter', () => {
  it('upserts daily aggregates and returns a bounded summary', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-13T10:00:00Z'));
    const sql = new FakeSql(); const object = counter(sql);
    expect((await object.fetch(event({ event: 'page_view', dimension: 'home' }))).status).toBe(202);
    expect((await object.fetch(event({ event: 'page_view', dimension: 'home' }))).status).toBe(202);
    const response = await object.fetch(new Request('https://analytics.internal/summary?days=30'));
    expect(response.status).toBe(200);
    expect((await response.json()).events.page_view).toBe(2);
    expect(sql.dailyLimits.get('2026-10-13')).toBe(2);
  });

  it('enforces minute and daily accepted-event ceilings', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-13T10:00:00Z'));
    const sql = new FakeSql(); const object = counter(sql, 2, 3);
    expect((await object.fetch(event({ event: 'outbound', dimension: '' }))).status).toBe(202);
    expect((await object.fetch(event({ event: 'outbound', dimension: '' }))).status).toBe(202);
    expect((await object.fetch(event({ event: 'outbound', dimension: '' }))).status).toBe(429);
    vi.setSystemTime(new Date('2026-10-13T10:01:00Z'));
    expect((await object.fetch(event({ event: 'outbound', dimension: '' }))).status).toBe(202);
    vi.setSystemTime(new Date('2026-10-13T10:02:00Z'));
    expect((await object.fetch(event({ event: 'outbound', dimension: '' }))).status).toBe(429);
    expect(sql.dailyCounts.values().next().value?.count).toBe(3);
  });

  it('deletes expired rows and rejects invalid internal requests', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-13T10:00:00Z'));
    const sql = new FakeSql();
    sql.dailyLimits.set('2026-10-12', 9);
    sql.dailyCounts.set('old', { day: '2025-09-08', event: 'page_view', dimension: 'home', count: 4 });
    const object = counter(sql);
    expect((await object.fetch(event({ event: 'unknown', dimension: '' }))).status).toBe(400);
    expect((await object.fetch(event({ event: 'page_view', dimension: 'home' }))).status).toBe(202);
    expect(sql.dailyLimits.has('2026-10-12')).toBe(false);
    expect(sql.dailyCounts.has('old')).toBe(false);
    expect((await object.fetch(new Request('https://analytics.internal/summary?days=31'))).status).toBe(400);
  });
});
