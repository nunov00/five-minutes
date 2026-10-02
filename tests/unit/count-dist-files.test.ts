import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const run = promisify(execFile);
const script = join(process.cwd(), 'scripts/count-dist-files.mjs');
// Run outside GitHub Actions so the script does not write a step summary.
const env = { ...process.env, GITHUB_ACTIONS: '', GITHUB_STEP_SUMMARY: '' };

describe('count-dist-files', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'dist-count-'));
    await mkdir(join(dir, 'adult', 'lessons'), { recursive: true });
    await writeFile(join(dir, 'index.html'), '<h1>home</h1>');
    await writeFile(join(dir, 'adult', 'lessons', 'a.html'), 'a');
    await writeFile(join(dir, 'adult', 'lessons', 'b.html'), 'b');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('counts every file recursively', async () => {
    const { stdout } = await run('node', [script, dir], { env });
    expect(stdout).toMatch(/: 3 \(/);
    expect(stdout).toContain('  adult: 2');
    expect(stdout).toContain('  index.html: 1');
  });

  it('warns when the configured threshold is reached', async () => {
    const { stderr } = await run('node', [script, dir, '--warn-at', '3'], { env });
    expect(stderr).toContain('WARNING: 3 deployable files reaches the configured warning threshold of 3.');
  });

  it('does not warn below the threshold', async () => {
    const { stderr } = await run('node', [script, dir, '--warn-at', '4'], { env });
    expect(stderr).toBe('');
  });

  it('fails clearly when the directory does not exist', async () => {
    const missing = join(dir, 'missing');
    await expect(run('node', [script, missing], { env })).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('does not exist. Run `npm run build` first.'),
    });
  });
});
