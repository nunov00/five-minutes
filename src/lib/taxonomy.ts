export interface TaxonomyTopic {
  token: string;
  label: string;
  description: string;
  subtopics: readonly { token: string; label: string }[];
}

/**
 * Controlled discovery vocabulary. Tokens are stable content references;
 * labels and descriptions may evolve without changing lesson identity.
 */
export const TAXONOMY: readonly TaxonomyTopic[] = [
  {
    token: 'science',
    label: 'Science',
    description: 'The physical world, space and living systems.',
    subtopics: [
      { token: 'astronomy', label: 'Astronomy' },
      { token: 'ecology', label: 'Ecology' },
      { token: 'physics', label: 'Physics' },
    ],
  },
  {
    token: 'technology',
    label: 'Technology',
    description: 'How engineered systems, machines and digital tools work.',
    subtopics: [
      { token: 'computing', label: 'Computing' },
      { token: 'electrical-engineering', label: 'Electrical engineering' },
      { token: 'engineering', label: 'Engineering' },
    ],
  },
  {
    token: 'human-mind',
    label: 'Human Mind',
    description: 'Learning, memory, judgement and behaviour.',
    subtopics: [
      { token: 'learning', label: 'Learning' },
    ],
  },
  {
    token: 'health-human-body',
    label: 'Health & Human Body',
    description: 'How the body works and maintains itself.',
    subtopics: [
      { token: 'human-biology', label: 'Human biology' },
    ],
  },
  {
    token: 'society',
    label: 'Society',
    description: 'Economics, geography, history and the systems people create.',
    subtopics: [
      { token: 'economics', label: 'Economics' },
      { token: 'geography', label: 'Geography' },
      { token: 'history', label: 'History' },
    ],
  },
  {
    token: 'mathematics-thinking',
    label: 'Mathematics & Thinking',
    description: 'Patterns, quantities and tools for reasoning clearly.',
    subtopics: [
      { token: 'mathematics', label: 'Mathematics' },
    ],
  },
] as const;

const topics = new Map(TAXONOMY.map((topic) => [topic.token, topic]));

export function taxonomyTopic(token: string): TaxonomyTopic | undefined {
  return topics.get(token);
}

export function taxonomySubtopic(topicToken: string, subtopicToken: string) {
  return taxonomyTopic(topicToken)?.subtopics.find((subtopic) => subtopic.token === subtopicToken);
}

export function isTaxonomyPair(topicToken: string, subtopicToken: string): boolean {
  return taxonomySubtopic(topicToken, subtopicToken) !== undefined;
}
