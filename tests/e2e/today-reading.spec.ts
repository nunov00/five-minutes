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

    const takeaway = page.getByRole('region', { name: 'Takeaway' });
    await takeaway.scrollIntoViewIfNeeded();
    await expect(takeaway).toBeVisible();
    await expect(takeaway.getByRole('paragraph')).not.toBeEmpty();

    const testYourself = page.getByRole('region', { name: 'Test yourself' });
    const answer = testYourself.locator('.answer');
    await expect(testYourself.getByRole('paragraph').first()).not.toBeEmpty();
    await expect(answer).toBeHidden();
    await testYourself.getByText('Show answer').click();
    await expect(answer).toBeVisible();
    await expect(answer).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);

    await editionNav.getByRole('link', { name: 'Adult' }).click();
    await expect(page).toHaveURL(/\/adult\/[a-z0-9-]+$/);
    await page.getByRole('link', { name: 'Back to Today' }).click();
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
  });

  test('every canonical lesson page has one title heading and both reading sections', async ({ page }) => {
    for (const route of await deliveryRoutes(page)) {
      const response = await page.goto(route.path);
      expect(response?.ok(), route.path).toBe(true);
      await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition', route.edition);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('region', { name: 'Takeaway' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Test yourself' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('the answer can be revealed with the keyboard', async ({ page }) => {
    const [route] = await deliveryRoutes(page);
    await page.goto(route.path);
    const summary = page.getByText('Show answer');
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
