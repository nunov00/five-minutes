import type { CatalogueEntry } from './delivery-manifest';

/** ADR-0007: publication dates are displayed in the site's editorial timezone. */
export const EDITORIAL_TIMEZONE = 'Europe/Zurich';

/**
 * ADR-0007: Today is the newest published lesson by `publishedAt`.
 * Equal timestamps are broken by lesson ID so the static build stays deterministic.
 */
export function selectTodayLesson(catalogue: readonly CatalogueEntry[]): CatalogueEntry {
  if (catalogue.length === 0) throw new Error('Cannot select Today without published lessons.');
  let today = catalogue[0];
  for (const entry of catalogue.slice(1)) {
    const newer = Date.parse(entry.publishedAt) - Date.parse(today.publishedAt);
    if (newer > 0 || (newer === 0 && entry.id > today.id)) today = entry;
  }
  return today;
}

const editorialDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: EDITORIAL_TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Formats a stored UTC/offset timestamp as an editorial calendar date, e.g. "2 October 2026". */
export function formatEditorialDate(timestamp: string): string {
  const time = Date.parse(timestamp);
  if (Number.isNaN(time)) throw new Error(`Invalid publication timestamp: ${timestamp}.`);
  return editorialDate.format(time);
}
