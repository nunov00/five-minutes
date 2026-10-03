#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const FREE_ASSET_LIMIT = 20_000;
const PAID_ASSET_LIMIT = 100_000;
const WARNING_AT = 16_000;
const MAX_ASSET_BYTES = 25 * 1024 * 1024;
const MAX_STATIC_REDIRECTS = 2_000;

const root = resolve(process.argv[2] ?? 'dist');

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const files = await walk(root);
if (files.length > PAID_ASSET_LIMIT) throw new Error(`Cloudflare Paid static-asset limit exceeded: ${files.length} > ${PAID_ASSET_LIMIT}.`);
if (files.length > FREE_ASSET_LIMIT) {
  console.warn(`WARNING: ${files.length} files exceed the Cloudflare Free static-asset limit of ${FREE_ASSET_LIMIT}; deployment requires a paid plan or a changed representation/provider.`);
} else if (files.length >= WARNING_AT) {
  console.warn(`WARNING: ${files.length} files reached the ${WARNING_AT} early-warning threshold for Cloudflare Free.`);
}

for (const file of files) {
  const size = (await stat(file)).size;
  if (size > MAX_ASSET_BYTES) throw new Error(`Cloudflare 25 MiB asset limit exceeded by ${relative(root, file)} (${size} bytes).`);
}

const redirects = await readFile(join(root, '_redirects'), 'utf8');
const staticRules = redirects.split(/\r?\n/).filter((line) => line.trim() && !line.trimStart().startsWith('#')).length;
if (staticRules > MAX_STATIC_REDIRECTS) throw new Error(`Cloudflare static redirect limit exceeded: ${staticRules} > ${MAX_STATIC_REDIRECTS}.`);

console.log(`Cloudflare capacity verified: ${files.length} files, ${staticRules} static redirects; Free file limit ${FREE_ASSET_LIMIT}, Paid file limit ${PAID_ASSET_LIMIT}.`);
