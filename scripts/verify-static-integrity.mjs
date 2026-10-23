import { readFile, readdir, lstat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import {validateDerivative,DERIVATIVE_LIMITS} from '../src/lib/figures/artwork.mjs';

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
  if (route.edition !== 'adult' || typeof route.lessonId !== 'string' || typeof route.slug !== 'string') throw new Error('Invalid route inventory entry.');
  if (route.path !== `/${route.edition}/${route.slug}`) throw new Error(`Route inventory fields disagree: ${route.path}.`);
  const seen = editions.get(route.lessonId) ?? new Set();
  if (seen.has(route.edition)) throw new Error(`Duplicate ${route.edition} route for lesson ${route.lessonId}.`);
  seen.add(route.edition); editions.set(route.lessonId, seen);
}
for (const [id, seen] of editions) if (seen.size !== 1 || !seen.has('adult')) throw new Error(`Incomplete single-version routes for lesson ${id}.`);

const files = await walk(dist);
const redirects = JSON.parse(await readFile(join(dist, 'redirects.json'), 'utf8'));
if (redirects.version !== 1 || !Array.isArray(redirects.redirects)) throw new Error('Invalid redirect manifest.');
const redirectsByPath = new Map(redirects.redirects.map(entry=>[entry.from,entry.to]));
const editionFiles = files.filter((f) => /^\/(adult|teen)\//.test(webPath(f)) && !redirectsByPath.has(webPath(f).replace(/\/index\.html$/, '')));
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
const htmlTargets = new Set(files.filter((file) => file.endsWith('.html')).map(webPath));
const canonicalPagePaths = new Set([...htmlTargets].map((path) => {
  if (path === '/index.html') return '/';
  if (path.endsWith('/index.html')) return path.slice(0, -'/index.html'.length);
  return path.replace(/\.html$/, '');
}));
const noindexPages = new Set();
const referencedVisuals=new Set();
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  if (/<meta[^>]*name="robots"[^>]*content="noindex(?:,|\s)/.test(html)) noindexPages.add(webPath(file).replace(/\/index\.html$/, '') || '/');
  const redirectTarget=redirectsByPath.get(webPath(file).replace(/\/index\.html$/, ''));
  if(redirectTarget && (!html.includes(`data-redirect-target="${redirectTarget}"`) || !html.includes('http-equiv="refresh"') || !html.includes(`href="${redirectTarget}"`) || !noindexPages.has(webPath(file).replace(/\/index\.html$/, '')))) throw Error(`Invalid redirect fallback: ${webPath(file)}`);
  if(expectedSet.has(webPath(file).replace(/\/index\.html$/, ''))) {
    const property = name => html.match(new RegExp(`<meta property="${name}" content="([^"]+)"`))?.[1];
    const image=property('og:image'),url=property('og:url');
    if(!image||!url||property('og:type')!=='article')throw Error(`Missing article sharing metadata: ${webPath(file)}`);
    const imageUrl=new URL(image),articleUrl=new URL(url);
    referencedVisuals.add(imageUrl.pathname);
    if(imageUrl.origin!==articleUrl.origin||!imageUrl.pathname.startsWith('/visuals/')||!targets.has(imageUrl.pathname)
      ||!['image/png','image/jpeg'].includes(property('og:image:type'))||property('og:image:width')!=='1200'||property('og:image:height')!=='630'||!property('og:image:alt'))throw Error(`Invalid article sharing image: ${webPath(file)}`);
    if((html.match(/<h1(?:\s|>)/g)??[]).length!==1)throw Error(`Reading page must have exactly one title: ${webPath(file)}`);
    const body=html.indexOf('class="lesson-body'),recall=html.indexOf('data-recall'),reveal=html.indexOf('data-recall-reveal'),answer=html.indexOf('class="answer"'),takeaway=html.indexOf('id="takeaway-heading"');
    if(body<0||recall<body||reveal<recall||answer<reveal||takeaway<answer)throw Error(`Recall/answer/takeaway order invalid: ${webPath(file)}`);
    const ending=html.slice(reveal,html.indexOf('</details>',reveal));
    if(!ending.includes('class="answer"')||!ending.includes('id="takeaway-heading"'))throw Error(`Answer/takeaway must share a reveal: ${webPath(file)}`);
    if(html.slice(0,recall).includes('id="takeaway-heading"'))throw Error(`Takeaway appears before recall: ${webPath(file)}`);
  }
  if((redirectTarget||noindexPages.has(webPath(file).replace(/\/index\.html$/, '')))&&/<meta property="og:type" content="article"/.test(html))throw Error(`Noncanonical page claims article sharing metadata: ${webPath(file)}`);
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
    if (htmlTargets.has(pathname)) throw new Error(`Internal page link must not use an explicit .html path in ${webPath(file)}: ${href}`);
    if (!canonicalPagePaths.has(pathname) && !targets.has(pathname)) throw new Error(`Broken internal link in ${webPath(file)}: ${href}`);
  }
  for(const match of html.matchAll(/<img\b[^>]*src=["']([^"']+)["']/g)) {
    const src=match[1];
    if(src.startsWith('/visuals/'))referencedVisuals.add(src);
    if((src.startsWith('/lesson-media/')||src.startsWith('/visuals/'))&&!targets.has(src))throw Error(`Figure image missing in ${webPath(file)}: ${src}`);
  }
  for (const match of html.matchAll(/\bdata-(?:catalogue|adult-index|teen-index)=["']([^"']+)["']/g)) {
    const path = match[1];
    if (!path.startsWith('/') || path.startsWith('//') || !targets.has(path)) {
      throw new Error(`Discovery data path does not resolve in ${webPath(file)}: ${path}`);
    }
  }
}
// Every lead/fallback emits exactly its two bounded derivatives, with no unreferenced extras.
const derivativePaths=[...targets].filter(p=>p.startsWith('/visuals/'));
const expectedDerivatives=new Set();
for(const path of referencedVisuals){
  const folder=path.slice(0,path.lastIndexOf('/'));
  const thumbnail=`${folder}/thumbnail.webp`;
  const shares=derivativePaths.filter(p=>p===`${folder}/share.png`||p===`${folder}/share.jpg`);
  if(!targets.has(thumbnail)||shares.length!==1)throw Error(`Incomplete visual derivative set: ${folder}`);
  expectedDerivatives.add(thumbnail);expectedDerivatives.add(shares[0]);
}
if(derivativePaths.length!==expectedDerivatives.size||derivativePaths.some(p=>!expectedDerivatives.has(p)))throw Error('Unexpected visual derivative outputs.');
for(const path of expectedDerivatives){
  const kind=path.endsWith('thumbnail.webp')?'thumbnail':'share',file=join(dist,path.slice(1)),stat=await lstat(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>DERIVATIVE_LIMITS[kind])throw Error(`Unsafe visual derivative: ${path}`);
  await validateDerivative(await readFile(file),kind,path.split('.').at(-1));
}
const redirectSources = new Set();
for (const redirect of redirects.redirects) {
  if (expectedSet.has(redirect.from)) throw new Error(`Redirect source shadows canonical page: ${redirect.from}`);
  if (redirectSources.has(redirect.from)) throw new Error(`Duplicate redirect source: ${redirect.from}`);
  redirectSources.add(redirect.from);
  if (!canonicalPagePaths.has(redirect.to) || redirectsByPath.has(redirect.to)) throw new Error(`Redirect target is not canonical: ${redirect.to}`);
}

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const sitemapPaths = [];
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1].replace(/&amp;/g, '&'));
  if (!canonicalPagePaths.has(url.pathname)) throw new Error(`Sitemap URL is not a generated canonical page: ${url.pathname}`);
  sitemapPaths.push(url.pathname);
}
const sitemapSet = new Set(sitemapPaths);
const absentSiteMarker = '<!-- site-origin: absent -->';
if (sitemapPaths.length === 0 && !sitemap.includes(absentSiteMarker)) {
  throw new Error('Sitemap is empty without the explicit absent-site-origin marker.');
}
if (sitemapPaths.length > 0 && sitemap.includes(absentSiteMarker)) {
  throw new Error('Populated sitemap must not claim that the site origin is absent.');
}
const expectedSitemapPaths = [...canonicalPagePaths].filter((path) => path !== '/404' && !noindexPages.has(path)).sort();
const missingSitemapPaths = expectedSitemapPaths.filter((path) => !sitemapSet.has(path));
const unexpectedSitemapPaths = [...sitemapSet].filter((path) => !expectedSitemapPaths.includes(path));
const duplicateSitemapPaths = sitemapPaths.filter((path, index) => sitemapPaths.indexOf(path) !== index);
if (sitemapPaths.length > 0 && (missingSitemapPaths.length || unexpectedSitemapPaths.length || duplicateSitemapPaths.length)) {
  throw new Error(`Sitemap completeness mismatch. Missing: ${missingSitemapPaths.join(', ') || 'none'}; unexpected: ${unexpectedSitemapPaths.join(', ') || 'none'}; duplicates: ${[...new Set(duplicateSitemapPaths)].join(', ') || 'none'}.`);
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

console.log(`Verified ${generated.length} canonical lesson pages, global outputs, single-version completeness, internal links, standalone navigation and the web app manifest.`);
