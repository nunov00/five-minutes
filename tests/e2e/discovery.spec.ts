import { expect, test } from './support/fixtures';

test.describe('M5 discovery', () => {
  test('browses the static Library and populated Topics', async ({ page }) => {
    await page.goto('/library');
    await expect(page.getByRole('heading', { level: 1, name: 'Library' })).toBeVisible();
    expect(await page.locator('article[data-lesson-id]').count()).toBe(12);
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

  test('shows specific related lessons and keeps the same edition', async ({ page }) => {
    await page.goto('/teen/why-gps-needs-einstein');
    const section = page.getByRole('region', { name: 'Explore next' });
    await expect(section.locator('article')).toHaveCount(2);
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
