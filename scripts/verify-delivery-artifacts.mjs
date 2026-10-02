import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../dist/redirects.json', import.meta.url), 'utf8'));
const compiled = await readFile(new URL('../dist/_redirects', import.meta.url), 'utf8');
if (!Array.isArray(manifest.redirects)) throw new Error('dist/redirects.json has no redirects array.');
const expected = manifest.redirects.map(({ from, to }) => `${from} ${to} 301`).join('\n') + (manifest.redirects.length ? '\n' : '');
if (compiled !== expected) throw new Error('Cloudflare _redirects does not match the neutral redirect manifest.');
if (!manifest.redirects.some(({ from }) => from === '/adult/gps-and-relativity') ||
    !manifest.redirects.some(({ from }) => from === '/teen/gps-and-relativity')) {
  throw new Error('Expected canonical seed alias redirects are missing from built artifacts.');
}
console.log(`Verified neutral and Cloudflare redirect artifacts (${manifest.redirects.length} redirects).`);
