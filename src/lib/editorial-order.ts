import type { LessonMetadata } from './content/schema';

/** Legacy date is a calendar label, not a claim about an exact original publication instant. */
export function editorialTimestamp(entry: { publishedAt: string; archiveDate?: string }): string {
  if (entry.archiveDate === undefined) return entry.publishedAt;
  // Order calendar-only archive labels at the start of their Zurich day, not UTC midnight.
  // Zurich's DST transition is after midnight, so the offset at 00:00 UTC is also
  // the offset at the start of that local date, including transition dates.
  const offset = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', timeZoneName: 'longOffset' })
    .formatToParts(new Date(`${entry.archiveDate}T00:00:00Z`)).find(part => part.type === 'timeZoneName')!.value.replace('GMT', '');
  return `${entry.archiveDate}T00:00:00${offset}`;
}

export function lessonEditorialTimestamp(metadata: LessonMetadata): string {
  return editorialTimestamp({ publishedAt: metadata.publishedAt, archiveDate: metadata.archive?.catalogueDate });
}
