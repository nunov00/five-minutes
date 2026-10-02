import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const lessons=defineCollection({
 loader:glob({pattern:'**/*.md',base:'./src/content/lessons'}),
 schema:z.object({id:z.string(),title:z.string(),topic:z.string(),subtopic:z.string()})
});
export const collections={lessons};
