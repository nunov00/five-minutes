import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../../dist/redirects.json', import.meta.url);
const destination = new URL('../../dist/_redirects', import.meta.url);
const manifest = JSON.parse(await readFile(source, 'utf8'));
if (manifest.version !== 1 || !Array.isArray(manifest.redirects)) throw new Error('Unsupported or invalid redirect manifest.');

const pathPattern = /^\/(adult|teen)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const lines = [];
const sources = new Set();
for (const entry of manifest.redirects) {
  if (!pathPattern.test(entry?.from) || !pathPattern.test(entry?.to)) throw new Error('Invalid redirect path.');
  for (const [from, to] of [[entry.from, `${entry.to}/`], [`${entry.from}/`, `${entry.to}/`]]) {
    if (sources.has(from)) throw new Error(`Duplicate redirect source: ${from}`);
    sources.add(from);
    lines.push(`${from} ${to} 301`);
  }
}
await writeFile(destination, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
console.log(`Compiled ${lines.length} Cloudflare redirect rules from ${manifest.redirects.length} neutral redirects.`);
