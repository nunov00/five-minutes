import type { SearchDocument } from './types';

export interface SearchResult {
  document: SearchDocument;
  score: number;
}

const FIELDS: ReadonlyArray<[keyof SearchDocument, number]> = [
  ['title', 10],
  ['description', 6],
  ['searchTerms', 6],
  ['concepts', 5],
  ['topicLabel', 3],
  ['subtopicLabel', 3],
  ['takeaway', 2],
];

export function normaliseSearchText(value: string): string {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
}

const words = (value: string | readonly string[]) => normaliseSearchText(Array.isArray(value) ? value.join(' ') : String(value)).split(/\s+/).filter(Boolean);

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let left = a, right = b;
  if (left.length > right.length) [left, right] = [right, left];
  let edits = 0, i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (left.length === right.length) i += 1;
    j += 1;
  }
  return edits + (right.length - j) <= 1;
}

function tokenScore(query: string, candidates: readonly string[]): number {
  if (candidates.includes(query)) return 4;
  if (query.length >= 3 && candidates.some((candidate) => candidate.startsWith(query))) return 2;
  if (query.length >= 5 && candidates.some((candidate) => editDistanceAtMostOne(query, candidate))) return 1;
  return 0;
}

export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
  limit = 20,
): SearchResult[] {
  const normalisedQuery = normaliseSearchText(query);
  const queryTokens = normalisedQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return [];

  return documents.flatMap((document): SearchResult[] => {
    let score = 0;
    let matchedTokens = 0;
    for (const queryToken of queryTokens) {
      let bestForToken = 0;
      for (const [field, weight] of FIELDS) {
        const fieldValue = document[field];
        if (typeof fieldValue !== 'string' && !Array.isArray(fieldValue)) continue;
        bestForToken = Math.max(bestForToken, tokenScore(queryToken, words(fieldValue as string | readonly string[])) * weight);
      }
      if (bestForToken > 0) matchedTokens += 1;
      score += bestForToken;
    }
    const normalisedTitle = normaliseSearchText(document.title);
    if (normalisedTitle.includes(normalisedQuery)) score += 30;
    if (matchedTokens !== queryTokens.length) return [];
    return [{ document, score }];
  }).sort((a, b) => b.score - a.score
    || Date.parse(b.document.publishedAt) - Date.parse(a.document.publishedAt)
    || a.document.id.localeCompare(b.document.id))
    .slice(0, limit);
}
