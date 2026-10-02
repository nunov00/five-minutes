import { readFile, writeFile } from 'node:fs/promises';

const source = new URL('../../dist/redirects.json', import.meta.url);
const destination = new URL('../../dist/_redirects', import.meta.url);
const manifest = JSON.parse(await readFile(source, 'utf8'));
if (manifest.version !== 1 || !Array.isArray(manifest.redirects)) {
  throw new Error('Unsupported or invalid redirect manifest.');
}
const lines = manifest.redirects.map((entry) => {
  if (typeof entry?.from !== 'string' || typeof entry?.to !== 'string') throw new Error('Invalid redirect entry.');
  return `${entry.from} ${entry.to} 301`;
});
await writeFile(destination, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
console.log(`Compiled ${lines.length} redirects for Cloudflare.`);
