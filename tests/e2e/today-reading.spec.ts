import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

interface Route { path: string; lessonId: string; edition: 'adult' | 'teen'; slug: string }

/** Canonical routes from the build's provider-neutral inventory, so the journey is not tied to seed copy. */
async function deliveryRoutes(page: Page): Promise<Route[]> {
  const response = await page.request.get('/delivery.json');
  expect(response.ok()).toBe(true);
  return (await response.json()).routes;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, 'horizontal overflow in CSS pixels').toBeLessThanOrEqual(0);
}

test.describe('Today → lesson → edition switch → Takeaway → Test yourself', () => {
  test('Today offers both editions of one published lesson', async ({ page }) => {
    const routes = await deliveryRoutes(page);
    await page.goto('/');

    const today = page.locator('[data-lesson-id]').first();
    const lessonId = await today.getAttribute('data-lesson-id');
    const adult = page.getByRole('link', { name: /^Read the Adult edition/ });
    const teen = page.getByRole('link', { name: /^Read the Teen edition/ });
    await expect(adult).toBeVisible();
    await expect(teen).toBeVisible();

    const expected = routes.filter((route) => route.lessonId === lessonId);
    expect(await adult.getAttribute('href')).toBe(expected.find((route) => route.edition === 'adult')?.path);
    expect(await teen.getAttribute('href')).toBe(expected.find((route) => route.edition === 'teen')?.path);
    await expect(page.getByRole('main').locator('time')).toHaveText(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  });

  test('Today shows only the deliberately saved edition on later visits', async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('five-minutes.reader-state')) localStorage.setItem('five-minutes.reader-state', JSON.stringify({
        version: 1, edition: 'teen', saved: [], read: {}, recent: [], appearance: 'system',
      }));
    });
    await page.goto('/');
    await expect(page.locator('[data-today-edition="teen"]')).toBeVisible();
    await expect(page.locator('[data-today-edition="adult"]')).toBeHidden();
    await expect(page.getByRole('link', { name: /^Read the Teen edition/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Read the Adult edition/ })).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Edition' }).getByRole('link', { name: 'Teen' })).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-today-returning]')).toBeVisible();

    await page.getByRole('navigation', { name: 'Edition' }).getByRole('link', { name: 'Adult' }).click();
    await expect(page).toHaveURL(/\/adult\//);
    await page.getByRole('link', { name: 'Back to Today' }).click();
    await expect(page.locator('[data-today-edition="adult"]')).toBeVisible();
    await expect(page.locator('[data-today-edition="teen"]')).toBeHidden();
  });

  test('Today ignores an edition inside unreadable version 1 data', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('five-minutes.reader-state', JSON.stringify({
      version: 1, edition: 'teen', saved: ['not-a-lesson-id'], read: {}, recent: [], appearance: 'dark',
    })));
    await page.goto('/');
    await expect(page.locator('[data-today-edition="adult"]')).toBeVisible();
    await expect(page.locator('[data-today-edition="teen"]')).toBeVisible();
    await expect(page.locator('html')).not.toHaveAttribute('data-edition', /.+/);
    await expect(page.locator('html')).not.toHaveAttribute('data-appearance', 'dark');
    await expect(page.locator('#reader-recovery')).toBeVisible();
  });

  test('reads a lesson, switches edition and tests understanding', async ({ page }) => {
    await page.goto('/');
    const lessonId = await page.locator('[data-lesson-id]').first().getAttribute('data-lesson-id');

    await page.getByRole('link', { name: /^Read the Adult edition/ }).click();
    await expect(page).toHaveURL(/\/adult\/[a-z0-9-]+$/);
    const article = page.locator('article[data-lesson-id]');
    await expect(article).toHaveAttribute('data-lesson-id', lessonId!);
    await expect(article).toHaveAttribute('data-edition', 'adult');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const adultTitle = await page.getByRole('heading', { level: 1 }).textContent();
    await expect(page).toHaveTitle(new RegExp(`Adult edition`));

    const editionNav = page.getByRole('navigation', { name: 'Edition' });
    await expect(editionNav.getByRole('link', { name: 'Adult' })).toHaveAttribute('aria-current', 'page');
    await expectNoHorizontalOverflow(page);

    await editionNav.getByRole('link', { name: 'Teen' }).click();
    await expect(page).toHaveURL(/\/teen\/[a-z0-9-]+$/);
    await expect(article).toHaveAttribute('data-lesson-id', lessonId!);
    await expect(article).toHaveAttribute('data-edition', 'teen');
    await expect(editionNav.getByRole('link', { name: 'Teen' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(adultTitle ?? '');

    const recall = page.getByRole('region', {name:'Recall',exact:true});
    const answer = recall.locator('.answer');
    const takeaway = page.getByRole('region', {name:'Takeaway',exact:true});
    await recall.scrollIntoViewIfNeeded();
    await expect(answer).toBeHidden();
    await expect(takeaway).toBeHidden();
    await recall.getByText('Reveal answer and takeaway').click();
    await expect(answer).toBeVisible();
    await expect(answer).not.toBeEmpty();
    await expect(takeaway).toBeVisible();
    await expect(takeaway.getByRole('paragraph')).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);

    await editionNav.getByRole('link', { name: 'Adult' }).click();
    await expect(page).toHaveURL(/\/adult\/[a-z0-9-]+$/);
    await page.getByRole('link', { name: 'Back to Today' }).click();
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
  });

  test('sampled reading pages have one title heading and recall-before-takeaway', async ({ page }) => {
    // Static verification checks every built lesson; sample one route per edition here.
    const routes=await deliveryRoutes(page);
    for (const route of [routes.find(r=>r.edition==='adult')!,routes.find(r=>r.edition==='teen')!]) {
      const response = await page.goto(route.path);
      expect(response?.ok(), route.path).toBe(true);
      await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition', route.edition);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('region', { name: 'Recall',exact:true })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Takeaway',exact:true })).toBeHidden();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('the answer can be revealed with the keyboard', async ({ page }) => {
    const [route] = await deliveryRoutes(page);
    await page.goto(route.path);
    const summary = page.getByText('Reveal answer and takeaway');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.answer')).toBeVisible();
  });

  test('follows the system dark colour scheme', async ({ page }) => {
    const [route] = await deliveryRoutes(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(route.path);
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(dark).not.toBe(light);
  });
});
