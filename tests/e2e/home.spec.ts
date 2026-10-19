import { expect, test } from './support/fixtures';

test.describe('home / app shell', () => {
  test('loads the Today page inside the Five Minutes shell', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok(), 'home page HTTP status').toBe(true);

    await expect(page).toHaveTitle(/Five Minutes/);
    await expect(page.getByRole('banner').getByRole('link', { name: 'Five Minutes' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: "Worth knowing" })).toBeVisible();
  });

  test('offers a keyboard skip link to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test('fits the viewport without horizontal scrolling', async ({ page }) => {
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'horizontal overflow in CSS pixels').toBeLessThanOrEqual(0);
  });
});
