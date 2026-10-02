import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const dist = join(process.cwd(), 'dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}
const webPath = (file) => '/' + relative(dist, file).split(sep).join('/');
const inventory = JSON.parse(await readFile(join(dist, 'delivery.json'), 'utf8'));
if (inventory.version !== 1 || !Array.isArray(inventory.routes)) throw new Error('Invalid delivery route inventory.');

const expected = inventory.routes.map(({ path }) => path).sort();
if (new Set(expected).size !== expected.length) throw new Error('Duplicate expected canonical route assignment.');
const editions = new Map();
for (const route of inventory.routes) {
  if (!['adult', 'teen'].includes(route.edition) || typeof route.lessonId !== 'string') throw new Error('Invalid route inventory entry.');
  const seen = editions.get(route.lessonId) ?? new Set();
  if (seen.has(route.edition)) throw new Error(`Duplicate ${route.edition} route for lesson ${route.lessonId}.`);
  seen.add(route.edition); editions.set(route.lessonId, seen);
}
for (const [id, seen] of editions) if (!seen.has('adult') || !seen.has('teen')) throw new Error(`Incomplete Adult/Teen routes for lesson ${id}.`);

const files = await walk(dist);
const generated = files.filter((f) => /[\\/](adult|teen)[\\/][^\\/]+[\\/]index\.html$/.test(f))
  .map((f) => webPath(f).replace(/\/index\.html$/, '')).sort();
const missing = expected.filter((p) => !generated.includes(p));
const unexpected = generated.filter((p) => !expected.includes(p));
if (missing.length || unexpected.length || generated.length !== new Set(generated).size) {
  throw new Error(`Static lesson route mismatch. Missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}.`);
}

const targets = new Set(files.map(webPath));
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/\bhref=["']([^"'#]+)["']/g)) {
    const href = match[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    const candidates = pathname.endsWith('/') ? [pathname + 'index.html'] : [pathname, pathname + '/index.html'];
    if (!candidates.some((p) => targets.has(p))) throw new Error(`Broken internal link in ${webPath(file)}: ${href}`);
  }
}
console.log(`Verified ${generated.length} canonical lesson pages with explicit Adult/Teen completeness and internal links.`);
