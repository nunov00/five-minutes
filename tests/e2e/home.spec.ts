import { expect, test } from './support/fixtures';

test.describe('home / app shell', () => {
  test('loads and shows the Five Minutes shell', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok(), 'home page HTTP status').toBe(true);

    await expect(page).toHaveTitle(/Five Minutes/);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Five Minutes' })).toBeVisible();
    await expect(
      page.getByText('One worthwhile idea, made easy to discover, understand and explore.'),
    ).toBeVisible();
  });

  test('fits the viewport without horizontal scrolling', async ({ page }) => {
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'horizontal overflow in CSS pixels').toBeLessThanOrEqual(0);
  });
});
