import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('../../dist/redirects.json', import.meta.url), 'utf8'));
const compiled = await readFile(new URL('../../dist/_redirects', import.meta.url), 'utf8');
if (manifest.version !== 1 || !Array.isArray(manifest.redirects)) throw new Error('Invalid neutral redirect manifest.');

const expectedLines = [];
for (const { from, to } of manifest.redirects) {
  expectedLines.push(`${from} ${to}/ 301`, `${from}/ ${to}/ 301`);
}
const expected = expectedLines.join('\n') + (expectedLines.length ? '\n' : '');
if (compiled !== expected) throw new Error('Cloudflare _redirects does not match the neutral redirect manifest.');
if (manifest.redirects.length === 0) throw new Error('Expected at least one redirect in the canonical content fixture.');
console.log(`Verified ${manifest.redirects.length} neutral redirects and ${expectedLines.length} Cloudflare redirect rules.`);
