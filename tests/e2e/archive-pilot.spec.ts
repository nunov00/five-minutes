import { readFileSync } from 'node:fs';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import { test, expect } from './support/fixtures';

const slugs = ['why-experts-skip-the-obvious-step', 'why-tails-is-not-due', 'why-the-moon-appears-in-daylight'];

const pilot = (await loadPublishedLessons('src/content/lessons', JSON.parse(readFileSync('src/content/route-ownership.json','utf8')))).filter(l => slugs.includes(l.metadata.slug));

test('archive pilot is readable in both editions and does not replace Today or Earlier', async ({ page }) => {
  await page.goto('/');
  for (const { metadata: { slug } } of pilot.filter(l => !l.metadata.revisedAt)) {
    await expect(page.locator(`[data-today-edition] a[href$="/${slug}"]`)).toHaveCount(0);
    await expect(page.locator(`.earlier-list a[href$="/${slug}"]`)).toHaveCount(0);
  }
  for (const edition of ['adult']) for (const slug of slugs) {
    await page.goto(`/${edition}/${slug}`);
    await expect(page.locator('.reader-header .eyebrow')).not.toContainText('Archive');
    await expect(page.locator('.reader-header .eyebrow')).not.toContainText('Adapted');
    await expect(page.locator('.lesson-body').first()).toBeVisible();
    await page.locator('[data-recall-reveal] > summary').click();
    await expect(page.locator('[data-recall] .answer')).toBeVisible();
  }
  await page.goto('/adult/why-tails-is-not-due');
  await page.locator('[data-activity] > summary').click();
  await page.getByRole('radio', { name: 'Exactly half', exact: true }).check();
  await expect(page.locator('[data-activity-reveal]')).toHaveAttribute('open', '');
});

test('archive Moon figure renders in both editions at phone and wide widths', async ({ page }, testInfo) => {
  for (const width of [320, 393, 1440]) for (const edition of ['adult']) {
    await page.setViewportSize({ width, height: width < 1000 ? 800 : 1000 });
    await page.goto(`/${edition}/why-the-moon-appears-in-daylight`);
    const figure = page.locator('.lesson-figure');
    await expect(figure.locator('img')).toBeVisible();
    expect(await figure.locator('img').evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth === 1080)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (testInfo.project.name === 'desktop-chromium') {
      await figure.screenshot({ path: testInfo.outputPath(`visual-${edition}-archive-moon-${width}.png`), animations: 'disabled' });
    }
  }
});
