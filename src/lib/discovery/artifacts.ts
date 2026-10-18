import { createHash } from 'node:crypto';
import type { LessonBundle } from '../content/schema';
import { taxonomySubtopic, taxonomyTopic } from '../taxonomy';
import { lessonPath, type LessonEdition } from '../urls';
import type { BrowserCatalogueEntry, SearchDocument } from './types';
import { editorialTimestamp } from '../editorial-order';

export interface DiscoveryArtifact<T> {
  path: string;
  payload: T;
}

export interface DiscoveryArtifacts {
  catalogue: DiscoveryArtifact<readonly BrowserCatalogueEntry[]>;
  search: Record<LessonEdition, DiscoveryArtifact<readonly SearchDocument[]>>;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

function artifact<T>(prefix: string, payload: T): DiscoveryArtifact<T> {
  const hash = createHash('sha256').update(stableJson(payload)).digest('hex').slice(0, 12);
  return { path: `/discovery/${prefix}.${hash}.json`, payload };
}

function compareNewest(a: { publishedAt: string; id: string; archiveDate?: string }, b: { publishedAt: string; id: string; archiveDate?: string }) {
  const byDate = Date.parse(editorialTimestamp(b)) - Date.parse(editorialTimestamp(a));
  return byDate || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);
}

function searchDocument(lesson: LessonBundle, edition: LessonEdition): SearchDocument {
  const presentation = edition === 'adult' ? lesson.adult : lesson.teen;
  if (!presentation) throw new Error(`Cannot build ${edition} discovery data for incomplete lesson ${lesson.metadata.id}.`);
  const topic = taxonomyTopic(lesson.metadata.topic);
  const subtopic = taxonomySubtopic(lesson.metadata.topic, lesson.metadata.subtopic);
  if (!topic || !subtopic) throw new Error(`Cannot build discovery data for unknown taxonomy on ${lesson.metadata.id}.`);
  return {
    id: lesson.metadata.id,
    edition,
    path: lessonPath(edition, lesson.metadata.slug),
    publishedAt: new Date(lesson.metadata.publishedAt).toISOString(),
    ...(lesson.metadata.revisedAt ? { revisedAt: lesson.metadata.revisedAt } : {}),
    ...(lesson.metadata.archive ? { archiveDate: lesson.metadata.archive.catalogueDate } : {}),
    topic: topic.token,
    topicLabel: topic.label,
    subtopic: subtopic.token,
    subtopicLabel: subtopic.label,
    title: presentation.title,
    description: presentation.description,
    concepts: [...lesson.metadata.concepts],
    searchTerms: [...presentation.searchTerms],
    takeaway: presentation.takeaway,
  };
}

export function buildDiscoveryArtifacts(lessons: readonly LessonBundle[]): DiscoveryArtifacts {
  const catalogue = lessons.map((lesson): BrowserCatalogueEntry => {
    if (!lesson.adult || !lesson.teen) throw new Error(`Cannot build discovery catalogue for incomplete lesson ${lesson.metadata.id}.`);
    return {
      id: lesson.metadata.id,
      publishedAt: new Date(lesson.metadata.publishedAt).toISOString(),
      ...(lesson.metadata.revisedAt ? { revisedAt: lesson.metadata.revisedAt } : {}),
    ...(lesson.metadata.archive ? { archiveDate: lesson.metadata.archive.catalogueDate } : {}),
      topic: lesson.metadata.topic,
      subtopic: lesson.metadata.subtopic,
      adult: { title: lesson.adult.title, path: lessonPath('adult', lesson.metadata.slug) },
      teen: { title: lesson.teen.title, path: lessonPath('teen', lesson.metadata.slug) },
    };
  }).sort(compareNewest);

  const adult = lessons.map((lesson) => searchDocument(lesson, 'adult')).sort(compareNewest);
  const teen = lessons.map((lesson) => searchDocument(lesson, 'teen')).sort(compareNewest);

  return {
    catalogue: artifact('catalogue', catalogue),
    search: {
      adult: artifact('search-adult', adult),
      teen: artifact('search-teen', teen),
    },
  };
}
