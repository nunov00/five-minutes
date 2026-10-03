import type { LessonBundle } from '../content/schema';
import { taxonomyTopic } from '../taxonomy';
import { lessonPath, type LessonEdition } from '../urls';
import type { RelatedLesson } from './types';

interface Candidate {
  lesson: LessonBundle;
  score: number;
  reason: string;
}

export function relatedLessons(
  lessonId: string,
  lessons: readonly LessonBundle[],
  edition: LessonEdition,
  limit = 3,
): RelatedLesson[] {
  if (limit < 2 || limit > 4) throw new Error('Related lesson limit must be between 2 and 4.');
  const source = lessons.find((lesson) => lesson.metadata.id === lessonId);
  if (!source) throw new Error(`Cannot find source lesson ${lessonId}.`);
  const excluded = new Set([lessonId, ...source.metadata.related.exclude]);
  const byId = new Map(lessons.map((lesson) => [lesson.metadata.id, lesson]));
  const selected: Candidate[] = [];

  for (const [index, relationship] of source.metadata.related.manual.entries()) {
    if (excluded.has(relationship.id)) continue;
    const lesson = byId.get(relationship.id);
    if (!lesson) throw new Error(`Related lesson ${relationship.id} does not exist.`);
    selected.push({ lesson, score: 10_000 - index, reason: relationship.reason });
  }

  const selectedIds = new Set(selected.map(({ lesson }) => lesson.metadata.id));
  for (const lesson of lessons) {
    if (excluded.has(lesson.metadata.id) || selectedIds.has(lesson.metadata.id)) continue;
    const sharedConcepts = lesson.metadata.concepts.filter((concept) => source.metadata.concepts.includes(concept));
    const sameSubtopic = lesson.metadata.topic === source.metadata.topic && lesson.metadata.subtopic === source.metadata.subtopic;
    const sameTopic = lesson.metadata.topic === source.metadata.topic;
    const score = sharedConcepts.length * 6 + (sameSubtopic ? 4 : sameTopic ? 2 : 0);
    if (score === 0) continue;
    const topicLabel = taxonomyTopic(source.metadata.topic)?.label ?? source.metadata.topic;
    const reason = sharedConcepts.length > 0
      ? `Connects through ${sharedConcepts.slice(0, 2).join(' and ').replaceAll('-', ' ')}.`
      : `Explores another ${topicLabel} idea from a different angle.`;
    selected.push({ lesson, score, reason });
  }

  const results = selected.sort((a, b) => b.score - a.score || a.lesson.metadata.id.localeCompare(b.lesson.metadata.id)).slice(0, limit);
  if (results.length < 2 && lessons.length >= 3) {
    throw new Error(`Lesson ${lessonId} has fewer than two related discovery results.`);
  }
  return results.map(({ lesson, reason }) => {
    const presentation = edition === 'adult' ? lesson.adult : lesson.teen;
    if (!presentation) throw new Error(`Related lesson ${lesson.metadata.id} has no ${edition} presentation.`);
    return {
      id: lesson.metadata.id,
      path: lessonPath(edition, lesson.metadata.slug),
      title: presentation.title,
      reason,
    };
  });
}
