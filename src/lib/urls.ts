export type LessonEdition = 'adult' | 'teen';

/**
 * Single source of truth for public lesson paths.
 * Exact URL syntax remains changeable here without reconstructing paths elsewhere.
 */
export function lessonPath(edition: LessonEdition, slug: string): string {
  return `/${edition}/${slug}`;
}
