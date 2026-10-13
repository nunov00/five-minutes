import {
  ANALYTICS_RETENTION_DAYS,
  parseAnalyticsAggregate,
  summarizeAnalyticsRows,
  type AnalyticsRow,
} from '../../src/lib/analytics/contracts';

export const MAX_EVENTS_PER_MINUTE = 3_000;
export const MAX_EVENTS_PER_DAY = 10_000;

interface AnalyticsLimits {
  perMinute: number;
  perDay: number;
}

interface SqlCursor<T> { toArray(): T[] }
interface SqlStorage {
  exec<T>(query: string, ...bindings: unknown[]): SqlCursor<T>;
}
interface DurableObjectStatePort { storage: { sql: SqlStorage } }

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

function utcDay(date = new Date()) { return date.toISOString().slice(0, 10); }
function utcMinute(date = new Date()) { return date.toISOString().slice(0, 16); }
function daysBefore(days: number, date = new Date()) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - days);
  return utcDay(copy);
}

/** One global object stores bounded daily aggregates, never individual events or request metadata. */
export class AnalyticsCounter {
  private readonly sql: SqlStorage;
  private readonly limits: AnalyticsLimits;
  private currentMinute = '';
  private currentMinuteCount = 0;

  constructor(ctx: DurableObjectStatePort, _env?: unknown, limits: AnalyticsLimits = {
    perMinute: MAX_EVENTS_PER_MINUTE,
    perDay: MAX_EVENTS_PER_DAY,
  }) {
    this.sql = ctx.storage.sql;
    this.limits = limits;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS daily_counts (
        day TEXT NOT NULL,
        event TEXT NOT NULL,
        dimension TEXT NOT NULL,
        count INTEGER NOT NULL CHECK (count >= 0),
        PRIMARY KEY (day, event, dimension)
      );
      CREATE TABLE IF NOT EXISTS daily_limits (
        day TEXT PRIMARY KEY,
        count INTEGER NOT NULL CHECK (count >= 0)
      );
    `);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/event' && request.method === 'POST') {
      const value = await request.json().catch(() => null);
      const event = parseAnalyticsAggregate(value);
      if (!event) return json({ error: 'Invalid event.' }, 400);

      const now = new Date();
      const minute = utcMinute(now);
      if (this.currentMinute !== minute) {
        this.currentMinute = minute;
        this.currentMinuteCount = 0;
      }
      if (this.currentMinuteCount >= this.limits.perMinute) return json({ error: 'Analytics capacity reached.' }, 429);

      const day = utcDay(now);
      const dailyCount = this.sql.exec<{ count: number }>('SELECT count FROM daily_limits WHERE day = ?', day).toArray()[0]?.count ?? 0;
      if (dailyCount >= this.limits.perDay) return json({ error: 'Analytics capacity reached.' }, 429);

      this.currentMinuteCount += 1;
      this.sql.exec('DELETE FROM daily_limits WHERE day < ?', day);
      this.sql.exec(
        `INSERT INTO daily_limits (day, count) VALUES (?, 1)
         ON CONFLICT(day) DO UPDATE SET count = count + 1`,
        day,
      );

      this.sql.exec('DELETE FROM daily_counts WHERE day < ?', daysBefore(ANALYTICS_RETENTION_DAYS - 1, now));
      this.sql.exec(
        `INSERT INTO daily_counts (day, event, dimension, count) VALUES (?, ?, ?, 1)
         ON CONFLICT(day, event, dimension) DO UPDATE SET count = count + 1`,
        day,
        event.event,
        event.dimension,
      );
      return json({ ok: true }, 202);
    }

    if (url.pathname === '/summary' && request.method === 'GET') {
      const days = Number(url.searchParams.get('days'));
      if (![7, 30, 90].includes(days)) return json({ error: 'Invalid range.' }, 400);
      const from = daysBefore(days - 1);
      const rows = this.sql.exec<AnalyticsRow>(
        'SELECT day, event, dimension, count FROM daily_counts WHERE day >= ? ORDER BY day, event, dimension',
        from,
      ).toArray();
      return json(summarizeAnalyticsRows(rows, days));
    }
    return json({ error: 'Not found.' }, 404);
  }
}
