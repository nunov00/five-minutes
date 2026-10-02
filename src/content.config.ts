import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/lessons',
    generateId: ({ entry }) => entry.replace(/\.md$/, '')
  }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    edition: z.enum(['adult','teen']),
    title: z.string(),
    description: z.string(),
    topic: z.string(),
    subtopic: z.string(),
    concepts: z.array(z.string()),
    takeaway: z.string()
  })
});
export const collections = { lessons };
