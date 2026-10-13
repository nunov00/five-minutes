import { isLessonId } from '../reader/state';
import type { LessonEdition } from '../urls';

export const ANALYTICS_SCHEMA_VERSION = 1;
export const ANALYTICS_RETENTION_DAYS = 400;
export const ANALYTICS_DAYS = [7, 30, 90] as const;
export const ANALYTICS_EVENTS = [
  'page_view',
  'lesson_view',
  'edition_switch',
  'save',
  'surprise',
  'related',
  'outbound',
] as const;
export const ANALYTICS_PAGES = ['home', 'library', 'topics', 'search', 'saved', 'feedback', 'analytics', 'other'] as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[number];
export type AnalyticsPage = typeof ANALYTICS_PAGES[number];
export interface AnalyticsEvent {
  event: AnalyticsEventName;
  dimension: string;
}
export interface AnalyticsRow extends AnalyticsEvent {
  day: string;
  count: number;
}
export interface AnalyticsSummary {
  schemaVersion: typeof ANALYTICS_SCHEMA_VERSION;
  generatedAt: string;
  range: { from: string; to: string; days: number };
  totals: { views: number; pageViews: number; lessonViews: number; interactions: number };
  editions: { adult: number; teen: number };
  events: Record<AnalyticsEventName, number>;
  lessons: Array<{ id: string; edition: LessonEdition; count: number }>;
  series: Array<{ day: string; views: number; interactions: number }>;
}

const exactKeys = (record: Record<string, unknown>, allowed: readonly string[]) =>
  Object.keys(record).every((key) => allowed.includes(key));
const isEdition = (value: unknown): value is LessonEdition => value === 'adult' || value === 'teen';
const isPage = (value: unknown): value is AnalyticsPage =>
  typeof value === 'string' && (ANALYTICS_PAGES as readonly string[]).includes(value);

/** Converts the small public event contract to one bounded aggregate key. */
export function parseAnalyticsEvent(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.event === 'page_view' && exactKeys(record, ['event', 'page']) && isPage(record.page)) {
    return { event: 'page_view', dimension: record.page };
  }
  if (record.event === 'outbound' && exactKeys(record, ['event'])) {
    return { event: 'outbound', dimension: '' };
  }
  if ((record.event === 'edition_switch' || record.event === 'surprise')
    && exactKeys(record, ['event', 'edition']) && isEdition(record.edition)) {
    return { event: record.event, dimension: record.edition };
  }
  if ((record.event === 'lesson_view' || record.event === 'save' || record.event === 'related')
    && exactKeys(record, ['event', 'edition', 'lessonId']) && isEdition(record.edition) && isLessonId(record.lessonId)) {
    return { event: record.event, dimension: `${record.edition}:${record.lessonId.toLowerCase()}` };
  }
  return null;
}

/** Revalidates the normalized event passed across the private Worker-to-object boundary. */
export function parseAnalyticsAggregate(value: unknown): AnalyticsEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (!exactKeys(record, ['event', 'dimension']) || typeof record.event !== 'string' || typeof record.dimension !== 'string'
    || !(ANALYTICS_EVENTS as readonly string[]).includes(record.event)) return null;
  const event = record.event as AnalyticsEventName;
  if (event === 'page_view' && isPage(record.dimension)) return { event, dimension: record.dimension };
  if (event === 'outbound' && record.dimension === '') return { event, dimension: '' };
  if ((event === 'edition_switch' || event === 'surprise') && isEdition(record.dimension)) return { event, dimension: record.dimension };
  if (event === 'lesson_view' || event === 'save' || event === 'related') {
    const [edition, id, extra] = record.dimension.split(':');
    if (!extra && isEdition(edition) && isLessonId(id)) return { event, dimension: `${edition}:${id.toLowerCase()}` };
  }
  return null;
}

export function analyticsDays(value: string | null): typeof ANALYTICS_DAYS[number] {
  const parsed = Number(value);
  return (ANALYTICS_DAYS as readonly number[]).includes(parsed) ? parsed as typeof ANALYTICS_DAYS[number] : 30;
}

export function summarizeAnalyticsRows(rows: readonly AnalyticsRow[], days: number, now = new Date()): AnalyticsSummary {
  const end = now.toISOString().slice(0, 10);
  const startDate = new Date(`${end}T00:00:00.000Z`);
  startDate.setUTCDate(startDate.getUTCDate() - days + 1);
  const from = startDate.toISOString().slice(0, 10);
  const events = Object.fromEntries(ANALYTICS_EVENTS.map((event) => [event, 0])) as Record<AnalyticsEventName, number>;
  const editions: Record<LessonEdition, number> = { adult: 0, teen: 0 };
  const lessonCounts = new Map<string, number>();
  const series = new Map<string, { views: number; interactions: number }>();

  for (const row of rows) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.day) || row.day < from || row.day > end
      || !ANALYTICS_EVENTS.includes(row.event) || !Number.isSafeInteger(row.count) || row.count < 0) continue;
    events[row.event] += row.count;
    const daily = series.get(row.day) ?? { views: 0, interactions: 0 };
    if (row.event === 'page_view' || row.event === 'lesson_view') daily.views += row.count;
    else daily.interactions += row.count;
    series.set(row.day, daily);
    if (row.event === 'lesson_view') {
      const [edition, id] = row.dimension.split(':');
      if (isEdition(edition) && isLessonId(id)) {
        editions[edition] += row.count;
        lessonCounts.set(row.dimension, (lessonCounts.get(row.dimension) ?? 0) + row.count);
      }
    }
  }

  const lessonViews = events.lesson_view;
  const pageViews = events.page_view;
  const interactions = ANALYTICS_EVENTS.filter((event) => event !== 'page_view' && event !== 'lesson_view')
    .reduce((total, event) => total + events[event], 0);
  const lessons = [...lessonCounts.entries()].map(([key, count]) => {
    const [edition, id] = key.split(':') as [LessonEdition, string];
    return { id, edition, count };
  }).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id) || a.edition.localeCompare(b.edition)).slice(0, 20);

  return {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    range: { from, to: end, days },
    totals: { views: pageViews + lessonViews, pageViews, lessonViews, interactions },
    editions,
    events,
    lessons,
    series: [...series.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, value]) => ({ day, ...value })),
  };
}
