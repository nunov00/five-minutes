import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from './support/fixtures';
import { loadPublishedLessons } from '../../src/lib/content/loader';

const ownership = JSON.parse(await readFile(resolve('src/content/route-ownership.json'), 'utf8'));
const lessons = (await loadPublishedLessons(resolve('src/content/lessons'), ownership))
  .filter(lesson => lesson.metadata.archive);

// Discover approved archive content through the same validation boundary as the build.
// Each lesson gets its own bounded test, rather than extending one hard-coded pilot list.
for (const lesson of lessons) for (const edition of ['adult', 'teen'] as const) {
  test(`archive catalogue: ${edition}/${lesson.metadata.slug}`, async ({ page }, testInfo) => {
    const presentation = lesson[edition];
    if (!presentation) throw new Error(`Missing ${edition} presentation for ${lesson.metadata.slug}`);
    for (const width of [320, 393, 1440]) {
      await page.setViewportSize({ width, height: width < 1000 ? 800 : 1000 });
      const response = await page.goto(`/${edition}/${lesson.metadata.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('.reader-header .eyebrow')).not.toContainText('Archive');
      await expect(page.locator('.reader-header .eyebrow')).not.toContainText('Adapted');
      await expect(page.locator('.lesson-body').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      const figure = page.locator('.lesson-figure');
      if (presentation.figure) {
        await expect(figure).toHaveCount(1);
        if (presentation.figure.type === 'image') {
          const image = figure.locator('img');
          await image.scrollIntoViewIfNeeded();
          await expect(image).toBeVisible();
          await expect(image).toHaveAttribute('alt', presentation.figure.alt);
          await expect.poll(() => image.evaluate(element => {
            const image = element as HTMLImageElement;
            return { complete: image.complete, width: image.naturalWidth, height: image.naturalHeight };
          })).toEqual({ complete: true, width: presentation.figure.width, height: presentation.figure.height });
        }
        if (testInfo.project.name === 'desktop-chromium') {
          await figure.screenshot({
            path: testInfo.outputPath(`visual-archive-${lesson.metadata.slug}-${edition}-${width}.png`),
            animations: 'disabled',
          });
        }
        await figure.getByText('Explanation of this figure', { exact: true }).click();
        await expect(figure.locator('.figure-description p')).toBeVisible();
      } else {
        await expect(figure).toHaveCount(0);
      }

      if (edition === 'teen' && presentation.activity) {
        const activity = page.locator('[data-activity]');
        await activity.locator(':scope > summary').click();
        await activity.getByRole('radio').nth(presentation.activity.answer).check();
        await expect(activity.locator('[data-activity-reveal]')).toHaveAttribute('open', '');
        await expect(activity.locator('[data-activity-reveal]')).toContainText(presentation.activity.explanation);
      } else {
        await expect(page.locator('[data-activity]')).toHaveCount(0);
      }
      await page.locator('[data-recall-reveal] > summary').click();
      await expect(page.locator('[data-recall] .answer')).toBeVisible();
    }
  });
}

test('unrevised transferred lessons stay outside Today and Earlier', async ({ page }) => {
  await page.goto('/');
  for (const lesson of lessons.filter(l => !l.metadata.revisedAt)) {
    await expect(page.locator(`[data-today-edition] a[href$="/${lesson.metadata.slug}"]`)).toHaveCount(0);
    await expect(page.locator(`.earlier-list a[href$="/${lesson.metadata.slug}"]`)).toHaveCount(0);
  }
});
