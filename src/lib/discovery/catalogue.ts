import type { LessonBundle } from '../content/schema';
import { TAXONOMY } from '../taxonomy';

export const LIBRARY_PAGE_SIZE = 24;

export function newestLessons(lessons: readonly LessonBundle[]): LessonBundle[] {
  return [...lessons].sort((a, b) => Date.parse(b.metadata.publishedAt) - Date.parse(a.metadata.publishedAt)
    || (a.metadata.id < b.metadata.id ? 1 : a.metadata.id > b.metadata.id ? -1 : 0));
}

export function libraryPages(lessons: readonly LessonBundle[], pageSize = LIBRARY_PAGE_SIZE): LessonBundle[][] {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('Library page size must be a positive integer.');
  const ordered = newestLessons(lessons);
  return Array.from({ length: Math.ceil(ordered.length / pageSize) }, (_, index) => ordered.slice(index * pageSize, (index + 1) * pageSize));
}

export function libraryPagination(pageNumber: number, pageCount: number): { previous?: string; next?: string } {
  if (!Number.isInteger(pageNumber) || !Number.isInteger(pageCount) || pageCount < 1 || pageNumber < 1 || pageNumber > pageCount) {
    throw new Error('Library pagination requires a valid current page and page count.');
  }
  return {
    previous: pageNumber > 1 ? (pageNumber === 2 ? '/library' : `/library/page/${pageNumber - 1}`) : undefined,
    next: pageNumber < pageCount ? `/library/page/${pageNumber + 1}` : undefined,
  };
}

export function discoveryPagePaths(lessons: readonly LessonBundle[]): string[] {
  const paths = ['/', '/library', '/search', '/topics'];
  for (const topic of TAXONOMY) {
    if (lessons.some((lesson) => lesson.metadata.topic === topic.token)) paths.push(`/topics/${topic.token}`);
  }
  for (let page = 2; page <= libraryPages(lessons).length; page += 1) paths.push(`/library/page/${page}`);
  return paths;
}
