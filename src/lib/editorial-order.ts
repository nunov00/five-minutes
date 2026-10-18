import type { LessonMetadata } from './content/schema';

/** Legacy date is a calendar label, not a claim about an exact original publication instant. */
export function editorialTimestamp(entry: { publishedAt: string; archiveDate?: string }): string {
  const date = entry.archiveDate;
  if (date === undefined) return entry.publishedAt;
  // Order calendar-only archive labels at the start of their Zurich day, not UTC midnight.
  // Zurich's DST transition is after midnight, so the offset at 00:00 UTC is also
  // the offset at the start of that local date, including transition dates.
  const offset = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${date}T00:00:00Z`)).find(part => part.type === 'timeZoneName')!.value.replace('GMT', '');
  return `${date}T00:00:00${offset}`;
}

export function lessonEditorialTimestamp(metadata: LessonMetadata): string {
  return editorialTimestamp({ publishedAt: metadata.publishedAt, archiveDate: legacyPublicationDate(metadata) });
}

/** Draft PR dates are not publication dates. Only the original publication's records supply a legacy day. */
export function legacyPublicationDate(metadata: LessonMetadata): string | undefined {
  if (!metadata.archive) return undefined;
  const source = new URL(metadata.archive.sourceUrl);
  return source.origin === 'https://five-minutes.vitoria-nuno.chatgpt.site'
    && /^\/lesson\/[a-z0-9-]+$/.test(source.pathname)
    ? metadata.archive.catalogueDate : undefined;
}
