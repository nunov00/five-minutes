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
if (expected.length === 0) throw new Error('Delivery route inventory must not be empty.');
const expectedSet = new Set(expected);
if (expectedSet.size !== expected.length) throw new Error('Duplicate expected canonical route assignment.');
const editions = new Map();
for (const route of inventory.routes) {
  if (!['adult', 'teen'].includes(route.edition) || typeof route.lessonId !== 'string' || typeof route.slug !== 'string') throw new Error('Invalid route inventory entry.');
  if (route.path !== `/${route.edition}/${route.slug}`) throw new Error(`Route inventory fields disagree: ${route.path}.`);
  const seen = editions.get(route.lessonId) ?? new Set();
  if (seen.has(route.edition)) throw new Error(`Duplicate ${route.edition} route for lesson ${route.lessonId}.`);
  seen.add(route.edition); editions.set(route.lessonId, seen);
}
for (const [id, seen] of editions) if (!seen.has('adult') || !seen.has('teen')) throw new Error(`Incomplete Adult/Teen routes for lesson ${id}.`);

const files = await walk(dist);
const editionFiles = files.filter((f) => /^\/(adult|teen)\//.test(webPath(f)));
const generated = editionFiles.filter((f) => /[\\/](adult|teen)[\\/][^\\/]+[\\/]index\.html$/.test(f))
  .map((f) => webPath(f).replace(/\/index\.html$/, '')).sort();
const generatedSet = new Set(generated);
const unexpectedFiles = editionFiles.filter((f) => !expectedSet.has(webPath(f).replace(/\/index\.html$/, '')));
const missing = expected.filter((p) => !generatedSet.has(p));
const unexpected = generated.filter((p) => !expectedSet.has(p));
if (missing.length || unexpected.length || unexpectedFiles.length || generated.length !== generatedSet.size) {
  throw new Error(`Static lesson route mismatch. Missing: ${missing.join(', ') || 'none'}; unexpected: ${[...unexpected, ...unexpectedFiles.map(webPath)].join(', ') || 'none'}.`);
}

const targets = new Set(files.map(webPath));
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  // Installed (standalone) display has no browser back button or address bar:
  // every page must declare the manifest and offer an in-page way back to Today,
  // and internal links must not escape the app window.
  if (!/<link rel="manifest" href="\/manifest\.webmanifest"/.test(html)) throw new Error(`Missing web app manifest link in ${webPath(file)}.`);
  if (!/<a\b[^>]*\bhref="\/"/.test(html)) throw new Error(`No in-page link to Today in ${webPath(file)}.`);
  for (const anchor of html.matchAll(/<a\b[^>]*>/g)) {
    if (/\btarget=/.test(anchor[0]) && /\bhref=["']\/(?!\/)/.test(anchor[0])) throw new Error(`Internal link opens a new window in ${webPath(file)}: ${anchor[0]}`);
  }
  for (const match of html.matchAll(/\bhref=["']([^"']*)["']/g)) {
    const href = match[1];
    if (href.startsWith('#')) continue;
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    if (pathname !== '/' && pathname.endsWith('/')) throw new Error(`Internal link must use the slash-less canonical form in ${webPath(file)}: ${href}`);
    const candidates = pathname === '/' ? ['/index.html'] : [pathname, pathname + '/index.html'];
    if (!candidates.some((p) => targets.has(p))) throw new Error(`Broken internal link in ${webPath(file)}: ${href}`);
  }
}
const redirects = JSON.parse(await readFile(join(dist, 'redirects.json'), 'utf8'));
if (redirects.version !== 1 || !Array.isArray(redirects.redirects)) throw new Error('Invalid redirect manifest.');
const redirectSources = new Set();
for (const redirect of redirects.redirects) {
  if (expectedSet.has(redirect.from)) throw new Error(`Redirect source shadows canonical page: ${redirect.from}`);
  if (redirectSources.has(redirect.from)) throw new Error(`Duplicate redirect source: ${redirect.from}`);
  redirectSources.add(redirect.from);
  if (!expectedSet.has(redirect.to)) throw new Error(`Redirect target is not canonical: ${redirect.to}`);
}

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1].replace(/&amp;/g, '&'));
  if (!expectedSet.has(url.pathname) && url.pathname !== '/') throw new Error(`Sitemap URL is not in the delivery inventory: ${url.pathname}`);
}
// Web app manifest: identity/scope are stable and every icon resolves to a PNG of its declared size.
const manifest = JSON.parse(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'));
for (const field of ['id', 'name', 'short_name', 'start_url', 'scope', 'display', 'background_color', 'theme_color']) {
  if (typeof manifest[field] !== 'string' || !manifest[field]) throw new Error(`Web app manifest is missing ${field}.`);
}
if (manifest.id !== '/' || manifest.scope !== '/' || manifest.start_url !== '/') throw new Error('Web app manifest id, scope and start_url must stay "/" (changing id creates a different installed app).');
if (manifest.display !== 'standalone') throw new Error('Web app manifest display must be standalone.');
if (!Array.isArray(manifest.icons)) throw new Error('Web app manifest has no icons.');
for (const icon of manifest.icons) {
  if (!targets.has(icon.src)) throw new Error(`Web app manifest icon does not resolve: ${icon.src}`);
  const png = await readFile(join(dist, icon.src));
  if (png.subarray(1, 4).toString('latin1') !== 'PNG') throw new Error(`Web app manifest icon is not a PNG: ${icon.src}`);
  const actual = `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
  if (icon.sizes !== actual) throw new Error(`Web app manifest icon ${icon.src} declares ${icon.sizes} but is ${actual}.`);
}
for (const [size, purpose] of [['192x192', 'any'], ['512x512', 'any'], ['512x512', 'maskable']]) {
  if (!manifest.icons.some((icon) => icon.sizes === size && (icon.purpose ?? 'any').split(' ').includes(purpose))) {
    throw new Error(`Web app manifest needs a ${size} ${purpose} icon.`);
  }
}

console.log(`Verified ${generated.length} canonical lesson pages, global outputs, Adult/Teen completeness, internal links, standalone navigation and the web app manifest.`);
