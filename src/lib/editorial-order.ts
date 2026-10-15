import type { LessonMetadata } from './content/schema';

/** Legacy date is a calendar label, not a claim about an exact original publication instant. */
export function editorialTimestamp(entry: { publishedAt: string; archiveDate?: string }): string {
  return entry.archiveDate ?? entry.publishedAt;
}

export function lessonEditorialTimestamp(metadata: LessonMetadata): string {
  return editorialTimestamp({ publishedAt: metadata.publishedAt, archiveDate: metadata.archive?.catalogueDate });
}
