import type { LessonBundle } from '../../src/lib/content/schema';

export function validLesson(overrides: Partial<LessonBundle> = {}): LessonBundle {
  return {
    metadata: {
      schemaVersion: 2,
      id: '018f47a2-5d7b-7c31-8d4f-0d9a8b6c2e11',
      slug: 'why-gps-needs-einstein',
      aliases: ['gps-and-relativity'],
      publishedAt: '2026-10-03T00:00:00Z',
      topic: 'science',
      subtopic: 'physics',
      concepts: ['gps', 'relativity', 'time-dilation'],
      related: { manual: [], exclude: [] },
      sources: [{
        title: 'Reference source',
        url: 'https://example.com/reference',
        publisher: 'Example',
        accessedAt: '2026-10-02',
        note: 'Fixture only',
      }],
      provenance: {
        createdAt: '2026-10-02T18:00:00Z',
        createdBy: { type: 'ai', provider: 'fixture', model: 'fixture', promptVersion: '1' },
        reviews: [],
      },
    },
    adult: {
      title: 'Why GPS Depends on Relativity',
      description: 'A concise adult description.',
      takeaway: 'Satellite clocks need relativistic corrections.',
      question: 'Why do GPS clocks need correction?',
      answer: 'Relativity changes their rate relative to clocks on Earth.',
      searchTerms: ['satellite clocks'],
    },
    teen: {
      title: 'GPS Would Drift Without Einstein',
      description: 'A concise teen description.',
      takeaway: 'Tiny clock differences become big navigation errors.',
      question: 'What would happen without clock corrections?',
      answer: 'GPS positions would drift.',
      searchTerms: ['gps clocks'],
    },
    ...overrides,
  };
}
