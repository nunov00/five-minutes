import { expect, test } from './support/fixtures';

test.describe('home / app shell', () => {
  test('loads the home page inside the Five Minutes shell', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok(), 'home page HTTP status').toBe(true);

    await expect(page).toHaveTitle('Home | Five Minutes');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('banner').getByRole('link', { name: 'Five Minutes' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('main')).toBeVisible();
    const card = page.locator('[data-today-edition="adult"] .featured-card');
    await expect(card.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(card).toHaveAccessibleName(await card.locator('h1').innerText());
    await expect(card.locator('.featured-card-cue')).toHaveText('Read →');
    await expect(page.getByRole('heading', { level: 2, name: 'Earlier' })).toBeVisible();
    const path = await card.getAttribute('href');
    await card.locator('img').click();
    await expect(page).toHaveURL(path!);
  });

  test('offers a keyboard skip link to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await skip.press('Enter');
    const card = page.locator('[data-today-edition] .featured-card');
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();
    const path = await card.getAttribute('href');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(path!);
  });

  test('fits the viewport without horizontal scrolling', async ({ page }) => {
    await page.goto('/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'horizontal overflow in CSS pixels').toBeLessThanOrEqual(0);
    const card = page.locator('[data-today-edition] .featured-card');
    const path = await card.getAttribute('href');
    await card.click({ position: { x: 8, y: 8 } });
    await expect(page).toHaveURL(path!);
  });
});
