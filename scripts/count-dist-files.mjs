#!/usr/bin/env node
// Reports the number of deployable files in the production build output.
//
// Usage: node scripts/count-dist-files.mjs [dir] [--warn-at N]
//   dir        build output directory (default: dist)
//   --warn-at  print a warning when the count reaches N. Thresholds are a
//              deployment/hosting concern and are passed in by deployment
//              scripts; this script has no built-in provider limit.
//
// Exits 1 if the directory does not exist or is not a directory.
import { appendFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

function parseArgs(argv) {
  let dir = 'dist';
  let warnAt;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--warn-at') {
      warnAt = Number(argv[++i]);
      if (!Number.isInteger(warnAt) || warnAt < 1) {
        throw new Error(`--warn-at expects a positive integer, got "${argv[i]}"`);
      }
    } else {
      dir = arg;
    }
  }
  return { dir, warnAt };
}

async function walk(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function fail(message) {
  console.error(`dist file count: ${message}`);
  process.exit(1);
}

const { dir, warnAt } = (() => {
  try {
    return parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
  }
})();
const root = resolve(dir);

const rootStat = await stat(root).catch(() => null);
if (!rootStat) fail(`"${dir}" does not exist. Run \`npm run build\` first.`);
if (!rootStat.isDirectory()) fail(`"${dir}" is not a directory.`);

const files = await walk(root);
let bytes = 0;
const byTopLevel = new Map();
for (const file of files) {
  bytes += (await stat(file)).size;
  const top = relative(root, file).split(/[\\/]/)[0];
  byTopLevel.set(top, (byTopLevel.get(top) ?? 0) + 1);
}

const mib = (bytes / 1048576).toFixed(2);
console.log(`Deployable files in ${dir}/: ${files.length} (${mib} MiB)`);
for (const [name, count] of [...byTopLevel].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${name}: ${count}`);
}

const overThreshold = warnAt !== undefined && files.length >= warnAt;
if (overThreshold) {
  const message = `${files.length} deployable files reaches the configured warning threshold of ${warnAt}.`;
  console.warn(`WARNING: ${message}`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Deployable file count::${message}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Deployable files\n\n\`${dir}/\`: **${files.length}** files (${mib} MiB)` +
      (warnAt !== undefined ? `, warning threshold ${warnAt}` : '') +
      '\n',
  );
}
