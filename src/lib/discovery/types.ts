import type { LessonEdition } from '../urls';

export interface DiscoveryPresentation {
  title: string;
  path: string;
}

export interface BrowserCatalogueEntry {
  id: string;
  publishedAt: string;
  archiveDate?: string;
  topic: string;
  subtopic: string;
  adult: DiscoveryPresentation;
  teen: DiscoveryPresentation;
}

export interface SearchDocument {
  id: string;
  edition: LessonEdition;
  path: string;
  publishedAt: string;
  archiveDate?: string;
  topic: string;
  topicLabel: string;
  subtopic: string;
  subtopicLabel: string;
  title: string;
  description: string;
  concepts: readonly string[];
  searchTerms: readonly string[];
  takeaway: string;
}

export interface RelatedLesson {
  id: string;
  path: string;
  title: string;
  reason: string;
}
