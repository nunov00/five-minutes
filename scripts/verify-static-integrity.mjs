import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const manifest = JSON.parse(await readFile(join(dist, 'redirects.json'), 'utf8'));
if (manifest.version !== 1) throw new Error('Unsupported redirect manifest version.');

const walk = async (dir) => (await readdir(dir, { withFileTypes: true })).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? [] : [path];
});
async function walkRecursive(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkRecursive(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const files = await walkRecursive(dist);
const lessonFiles = files.filter((file) => /[\\/](adult|teen)[\\/][^\\/]+[\\/]index\.html$/.test(file));
const generated = lessonFiles.map((file) => '/' + relative(dist, file).split(sep).slice(0, -1).join('/')).sort();

const catalogueResponse = await import(new URL('../src/lib/build-integrity.ts', import.meta.url)).catch(() => null);
if (!catalogueResponse) throw new Error('Build integrity module could not be loaded.');
const { expectedLessonPaths, validateGeneratedLessonPaths, extractInternalLinks, validateInternalLinks } = catalogueResponse;
const expected = await expectedLessonPaths();
validateGeneratedLessonPaths(expected, generated);

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const links = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  links.push(...extractInternalLinks(html, '/' + relative(dist, file).split(sep).join('/')));
}
validateInternalLinks(links, files.map((file) => '/' + relative(dist, file).split(sep).join('/')));
console.log(`Verified ${generated.length} canonical lesson pages and ${links.length} internal links.`);
