import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import routeOwnership from '../../src/content/route-ownership.json';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import { validateRouteOwnershipHistory } from '../../src/lib/content/schema';

describe('canonical content integration', () => {
  it('loads the real canonical set through the safe parser and publication gates', async () => {
    const lessons = await loadPublishedLessons(join(process.cwd(), 'src/content/lessons'), routeOwnership);
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.every((x) => x.adultHtml && x.teenHtml)).toBe(true);
  });

  it('fails closed when no lessons are discovered', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-empty-'));
    await expect(loadPublishedLessons(root, {})).rejects.toThrow(/No canonical lessons found/);
  });

  it('neutralizes hostile body content in the same loader used by the build', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-hostile-'));
    const dir = join(root, '2026', 'hostile');
    await mkdir(dir, { recursive: true });
    const id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    await writeFile(join(dir, 'lesson.yaml'), `schemaVersion: 1
id: ${id}
slug: hostile
aliases: []
publishedAt: 2026-10-02T01:00:00Z
topic: science
subtopic: physics
concepts: [safety]
related: { manual: [], exclude: [] }
sources: [{ title: Source, url: "https://example.com", publisher: Example, accessedAt: "2026-10-02" }]
provenance: { createdAt: 2026-10-02T00:00:00Z, createdBy: { type: human }, reviews: [] }
`);
    const front = `---
title: Safe
description: Safe description
takeaway: Safe takeaway
question: Safe question?
answer: Safe answer.
searchTerms: [safe]
---
`;
    await writeFile(join(dir, 'adult.md'), front + '<script>document.title="PWNED"</script>\n');
    await writeFile(join(dir, 'teen.md'), front + '[safe](https://example.com/?a=1&b=2)\n');
    const lessons = await loadPublishedLessons(root, { hostile: id });
    expect(lessons[0].adultHtml).not.toContain('<script>');
    expect(lessons[0].adultHtml).toContain('&lt;script&gt;');
    expect(lessons[0].teenHtml).toContain('a=1&amp;b=2');
    expect(lessons[0].teenHtml).not.toContain('&amp;amp;');
  });

  it('rejects misplaced content and stray files instead of silently ignoring them', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-layout-'));
    await mkdir(join(root, 'misplaced'), { recursive: true });
    await expect(loadPublishedLessons(root, {})).rejects.toThrow(/Unexpected entry/);
  });

  it('rejects missing or extra canonical lesson files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-files-'));
    const dir = join(root, '2026', 'broken');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'lesson.yaml'), 'x: 1');
    await writeFile(join(dir, 'adult.md'), '---\ntitle: x\n---\nx');
    await expect(loadPublishedLessons(root, {})).rejects.toThrow(/must contain exactly/);
    await writeFile(join(dir, 'teen.md'), '---\ntitle: x\n---\nx');
    await writeFile(join(dir, 'stray.txt'), 'ignored?');
    await expect(loadPublishedLessons(root, {})).rejects.toThrow(/must contain exactly/);
  });

  it('rejects symlinked canonical files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'five-minutes-symlink-'));
    const dir = join(root, '2026', 'linked');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'lesson.yaml'), 'x: 1');
    await writeFile(join(dir, 'adult.md'), '---\ntitle: x\n---\nx');
    await symlink(join(dir, 'adult.md'), join(dir, 'teen.md'));
    await expect(loadPublishedLessons(root, {})).rejects.toThrow(/regular non-symlink/);
  });

  it('enforces append-only route ownership against the PR base when CI supplies it', () => {
    const base = process.env.CONTENT_BASE_SHA;
    if (!base) {
      if (process.env.GITHUB_ACTIONS === 'true') throw new Error('CONTENT_BASE_SHA is required in GitHub Actions.');
      return;
    }
    const previousText = execFileSync('git', ['show', `${base}:src/content/route-ownership.json`], { encoding: 'utf8' });
    const previous = JSON.parse(previousText);
    const result = validateRouteOwnershipHistory(previous, routeOwnership);
    expect(result.issues).toEqual([]);
  });
});
