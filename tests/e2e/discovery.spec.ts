import { expect, test } from './support/fixtures';

test.describe('M5 discovery', () => {
  test('browses the static Library and populated Topics', async ({ page }) => {
    await page.goto('/library');
    await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
    const lessonIds: string[] = [];
    for (let pageNumber = 1; pageNumber <= 10; pageNumber += 1) {
      lessonIds.push(...await page.locator('article[data-lesson-id]').evaluateAll((cards) => cards.map((card) => card.getAttribute('data-lesson-id') ?? '')));
      const next = page.getByRole('navigation', { name: 'Library pages' }).getByRole('link', { name: 'Next' });
      if (await next.count() === 0) break;
      await next.click();
    }
    expect(lessonIds).toHaveLength(12);
    expect(new Set(lessonIds).size).toBe(12);

    await page.goto('/library');
    await expect(page.getByRole('navigation', { name: 'Library topics' }).getByRole('link')).toHaveCount(6);

    await page.getByRole('link', { name: 'Human Mind' }).click();
    await expect(page).toHaveURL('/topics/human-mind');
    await expect(page.getByRole('heading', { level: 1, name: 'Human Mind' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Learning' })).toBeVisible();
    await expect(page.getByText('Why Testing Yourself Beats Another Reread')).toBeVisible();
  });

  test('loads only the selected edition index when search is used', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/discovery/search-')) requested.push(request.url());
    });
    await page.goto('/search');
    expect(requested).toEqual([]);
    await page.getByRole('searchbox').fill('marine chronometer');
    await expect(page.getByRole('status')).toContainText('1 lesson found');
    await expect(page.getByRole('link', { name: "How an Accurate Clock Revealed a Ship's Longitude" })).toBeVisible();
    expect(requested.some((url) => url.includes('search-adult'))).toBe(true);
    expect(requested.some((url) => url.includes('search-teen'))).toBe(false);

    await page.getByRole('radio', { name: 'Teen' }).check();
    await page.getByRole('searchbox').fill('ship navigation clock');
    await expect(page.getByRole('status')).toContainText('1 lesson found');
    await expect(page.getByRole('link', { name: 'The Clock That Told Sailors Where They Were' })).toBeVisible();
    expect(requested.some((url) => url.includes('search-teen'))).toBe(true);
  });

  test('keeps only the latest search when requests overlap or submit repeats', async ({ page }) => {
    let releaseAdult!: () => void;
    const adultGate = new Promise<void>((resolve) => { releaseAdult = resolve; });
    await page.route('**/discovery/search-adult.*.json', async (route) => {
      await adultGate;
      await route.continue();
    });
    await page.goto('/search');
    const adultRequest = page.waitForRequest((request) => request.url().includes('/discovery/search-adult.'));
    await page.getByRole('searchbox').fill('clock');
    await adultRequest;
    await page.getByRole('radio', { name: 'Teen' }).check();
    await page.getByRole('searchbox').fill('ship navigation clock');
    await expect(page.getByRole('link', { name: 'The Clock That Told Sailors Where They Were' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('1 lesson found.');
    const adultResponse = page.waitForResponse((response) => response.url().includes('/discovery/search-adult.'));
    releaseAdult();
    await adultResponse;
    await page.waitForTimeout(250);
    await expect(page.getByRole('link', { name: "How an Accurate Clock Revealed a Ship's Longitude" })).toHaveCount(0);

    await page.getByRole('radio', { name: 'Adult' }).check();
    await page.getByRole('searchbox').fill('kidneys');
    await page.getByRole('searchbox').press('Enter');
    await expect(page.getByRole('status')).toContainText('1 lesson found');
    await expect(page.locator('.search-results > li')).toHaveCount(1);
  });

  test('retries a search index after a transient load failure', async ({ page }) => {
    let attempts = 0;
    await page.route('**/discovery/search-adult.*.json', async (route) => {
      attempts += 1;
      if (attempts === 1) await route.abort('failed');
      else await route.continue();
    });
    await page.goto('/search');
    await page.getByRole('searchbox').fill('clock');
    await expect(page.getByRole('status')).toContainText('Search could not load');
    await page.getByRole('searchbox').fill('marine chronometer');
    await expect(page.getByRole('link', { name: "How an Accurate Clock Revealed a Ship's Longitude" })).toBeVisible();
    expect(attempts).toBe(2);
  });

  test('shows specific related lessons and keeps the same edition', async ({ page }) => {
    await page.goto('/teen/why-gps-needs-einstein');
    const section = page.getByRole('region', { name: 'Explore next' });
    const relatedCount = await section.locator('article[data-related-id]').count();
    expect(relatedCount).toBeGreaterThanOrEqual(2);
    expect(relatedCount).toBeLessThanOrEqual(4);
    await expect(section.getByText("Harrison's clock and GPS both find position by comparing extremely accurate time.")).toBeVisible();
    await section.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/teen\//);
  });

  test('Surprise Me chooses another published lesson with a no-script fallback', async ({ page }) => {
    await page.goto('/');
    const currentId = await page.locator('[data-lesson-id]').first().getAttribute('data-lesson-id');
    const link = page.getByRole('link', { name: 'Surprise me · Adult' });
    await expect(link).toHaveAttribute('href', /\/adult\//);
    await link.click();
    await expect(page).toHaveURL(/\/adult\/[a-z0-9-]+$/);
    await expect(page.locator('article[data-lesson-id]')).not.toHaveAttribute('data-lesson-id', currentId!);
  });

  test('keeps discovery pages within the mobile viewport', async ({ page }) => {
    for (const path of ['/library', '/topics', '/search']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
