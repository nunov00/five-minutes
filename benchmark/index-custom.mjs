import * as pagefind from 'pagefind';
import { readdir, readFile, mkdir } from 'node:fs/promises';

const dir = new URL('../src/content/lessons/', import.meta.url);
const names = (await readdir(dir)).filter((name) => name.endsWith('.md')).sort();
const { index } = await pagefind.createIndex({ forceLanguage: 'en', verbose: false });

for (const name of names) {
  const raw = await readFile(new URL(name, dir), 'utf8');
  const id = raw.match(/^id: "([^"]+)"/m)?.[1];
  const title = raw.match(/^title: "([^"]+)"/m)?.[1];
  const topic = raw.match(/^topic: "([^"]+)"/m)?.[1];
  const subtopic = raw.match(/^subtopic: "([^"]+)"/m)?.[1];
  const content = raw.replace(/^---[\s\S]*?---\s*/m, '');
  const { errors } = await index.addCustomRecord({
    url: `/lesson/${id}/`,
    content,
    language: 'en',
    meta: { title, topic, subtopic }
  });
  if (errors?.length) throw new Error(errors.join('\n'));
}

await mkdir('dist/pagefind', { recursive: true });
const { errors } = await index.writeFiles({ outputPath: 'dist/pagefind' });
if (errors?.length) throw new Error(errors.join('\n'));
await index.deleteIndex();
await pagefind.close();
console.log(`Indexed ${names.length} custom lesson records`);
