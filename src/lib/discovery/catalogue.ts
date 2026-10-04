import { discoveryPath, type LessonEdition } from '../urls';
import type { LessonBundle } from '../content/schema';
import { TAXONOMY } from '../taxonomy';

const testPageSize = process.env.FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE;
export const LIBRARY_PAGE_SIZE = testPageSize === undefined ? 24 : Number(testPageSize);
if (!Number.isInteger(LIBRARY_PAGE_SIZE) || LIBRARY_PAGE_SIZE < 1) {
  throw new Error('FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE must be a positive integer.');
}

export function newestLessons(lessons: readonly LessonBundle[]): LessonBundle[] {
  return [...lessons].sort((a, b) => Date.parse(b.metadata.publishedAt) - Date.parse(a.metadata.publishedAt)
    || (a.metadata.id < b.metadata.id ? 1 : a.metadata.id > b.metadata.id ? -1 : 0));
}

export function libraryPages(lessons: readonly LessonBundle[], pageSize = LIBRARY_PAGE_SIZE): LessonBundle[][] {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Library page size must be a positive integer.');
  const ordered = newestLessons(lessons);
  return Array.from({ length: Math.ceil(ordered.length / pageSize) }, (_, index) => ordered.slice(index * pageSize, (index + 1) * pageSize));
}

export function libraryPagination(pageNumber: number, pageCount: number, edition: LessonEdition | null = null): { previous?: string; next?: string } {
  if (!Number.isInteger(pageNumber) || !Number.isInteger(pageCount) || pageCount < 1 || pageNumber < 1 || pageNumber > pageCount) {
    throw new Error('Library pagination requires a valid current page and page count.');
  }
  return {
    previous: pageNumber > 1 ? discoveryPath(edition, 'library', pageNumber - 1) : undefined,
    next: pageNumber < pageCount ? discoveryPath(edition, 'library', pageNumber + 1) : undefined,
  };
}

export function discoveryPagePaths(lessons: readonly LessonBundle[]): string[] {
 const paths=['/','/search'];
 for(const edition of ['adult','teen'] as const){
  paths.push(discoveryPath(edition,'library'),discoveryPath(edition,'topics'));
  for(const topic of TAXONOMY)if(lessons.some(l=>l.metadata.topic===topic.token))paths.push(discoveryPath(edition,'topics',topic.token));
  for(let page=2;page<=libraryPages(lessons).length;page++)paths.push(discoveryPath(edition,'library',page));
 }
 return paths;
}
