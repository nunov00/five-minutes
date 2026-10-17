import { expect, test } from './support/fixtures';

const readerKey = 'five-minutes.reader-state';
const seasons = '/teen/why-earth-has-seasons';

test.describe('M6 integration in WebKit', () => {
  test('neutral hand-offs and restored pages do not trap Back navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/library/page/2?q=clock#main');
    await page.getByRole('link', { name: 'Explore Teen', exact: true }).click();
    await expect(page).toHaveURL('/editions/teen/library/page/2?q=clock#main');
    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-today-edition="teen"]')).toBeVisible();
    await expect(page.locator('[data-today-edition="adult"]')).toBeHidden();

    await page.goto('/library');
    await expect(page).toHaveURL('/editions/teen/library');
    await page.goto('/adult/why-earth-has-seasons');
    await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({
      version: 1, edition: 'teen', saved: [], read: {}, recent: [], appearance: 'system',
    })), readerKey);
    await page.goBack();
    await expect(page).toHaveURL('/editions/teen/library');
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  test('activity and reader controls restore safe state after Back and reload', async ({ page }) => {
    await page.goto(seasons);
    const activity = page.locator('[data-activity]');
    await activity.getByText('What do you think?', { exact: true }).click();
    await activity.getByRole('radio', { name: 'The Southern Hemisphere' }).check();
    await expect(activity.locator('[data-activity-reveal]')).toHaveAttribute('open', '');

    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Today', exact: true }).click();
    await page.goBack();
    await expect(page).toHaveURL(seasons);
    await expect(activity).not.toHaveAttribute('open', '');
    await expect(activity.locator('[data-activity-reveal]')).not.toHaveAttribute('open', '');
    for (const radio of await activity.getByRole('radio', { includeHidden: true }).all()) {
      await expect(radio).not.toBeChecked();
    }

    const save = page.getByRole('button', { name: 'Save lesson', exact: true });
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Save lesson', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Mark unread' })).not.toHaveAttribute('aria-pressed', /.+/);
  });

  test('blocked storage and no JavaScript leave reading and navigation usable', async ({ browser, page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
      Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } });
    });
    await page.goto('/topics');
    await page.getByRole('link', { name: 'Explore Teen', exact: true }).click();
    await expect(page).toHaveURL('/editions/teen/topics');
    await expect(page.locator('#preference-note')).toContainText('will not be remembered');
    await page.goto(seasons);
    await expect(page.locator('.lesson-body').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save lesson' })).toHaveCount(0);

    const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 568 } });
    const plain = await noScript.newPage();
    await plain.goto(`http://127.0.0.1:4321${seasons}`);
    await plain.getByText('What do you think?', { exact: true }).click();
    await plain.getByText('Reveal the explanation', { exact: true }).click();
    await plain.locator('[data-recall-reveal] > summary').click();
    await expect(plain.getByRole('region', { name: 'Takeaway', exact: true })).toBeVisible();
    await plain.getByRole('link', { name: 'Back to Today' }).click();
    await expect(plain.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
    await expect(plain.locator('[data-today-edition="adult"]')).toBeVisible();
    await expect(plain.locator('[data-today-edition="teen"]')).toBeHidden();
    expect(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await noScript.close();
  });

  test('appearance, focus order and enlarged text remain usable at 320 CSS pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/saved');
    await page.locator('.reader-settings > summary').click();
    await page.getByRole('radio', { name: 'Dark' }).check();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

    for (const edition of ['adult', 'teen']) {
      await page.goto(`/${edition}/why-earth-has-seasons`);
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('[data-recall-reveal] > summary').focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('region', { name: 'Takeaway', exact: true })).toBeVisible();
    }
  });
});
