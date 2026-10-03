import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

interface Manifest {
  id: string; start_url: string; scope: string; display: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
}

async function manifest(page: Page): Promise<Manifest> {
  const response = await page.request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/json/);
  return response.json();
}

async function firstLessonPath(page: Page): Promise<string> {
  const response = await page.request.get('/delivery.json');
  return (await response.json()).routes[0].path;
}

test.describe('installable PWA shell', () => {
  test('every page type declares the manifest and install metadata', async ({ page }) => {
    for (const path of ['/', await firstLessonPath(page), '/404.html']) {
      await page.goto(path);
      const head = page.locator('head');
      await expect(head.locator('link[rel="manifest"]'), path).toHaveAttribute('href', '/manifest.webmanifest');
      await expect(head.locator('link[rel="apple-touch-icon"]'), path).toHaveAttribute('href', '/apple-touch-icon.png');
      await expect(head.locator('link[rel="icon"]'), path).toHaveAttribute('href', '/favicon.svg');
      await expect(head.locator('meta[name="apple-mobile-web-app-title"]'), path).toHaveAttribute('content', 'Five Minutes');
      await expect(head.locator('meta[name="theme-color"]'), path).toHaveCount(2);
    }
  });

  test('manifest icons and the Apple touch icon are served as PNGs', async ({ page }) => {
    const { icons } = await manifest(page);
    for (const src of [...icons.map((icon) => icon.src), '/apple-touch-icon.png']) {
      const response = await page.request.get(src);
      expect(response.ok(), src).toBe(true);
      expect(response.headers()['content-type'], src).toBe('image/png');
    }
  });

  test('Chromium reports the site as installable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const cdp = await page.context().newCDPSession(page);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    // Playwright's default browser context is incognito-like, which Chromium
    // reports on its own; every other installability error fails the test.
    expect(installabilityErrors.filter((error) => error.errorId !== 'in-incognito')).toEqual([]);
  });

  test('registers no service worker and stores no caches (bounded offline scope)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const state = await page.evaluate(async () => ({
      registrations: (await navigator.serviceWorker.getRegistrations()).length,
      caches: await caches.keys(),
    }));
    expect(state).toEqual({ registrations: 0, caches: [] });
  });

  test('standalone-safe: the start URL journey needs only in-page navigation and stays in scope', async ({ page }) => {
    const { start_url: startUrl, scope } = await manifest(page);
    const inScope = () => {
      const url = new URL(page.url());
      expect(url.pathname.startsWith(scope), `${url.pathname} is within scope ${scope}`).toBe(true);
    };

    await page.goto(startUrl);
    const origins = new Set([new URL(page.url()).origin]);
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();

    // No browser chrome in standalone display: every step uses links on the page.
    await page.getByRole('link', { name: /^Read the Teen edition/ }).click();
    await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition', 'teen');
    inScope();
    await page.getByRole('navigation', { name: 'Edition' }).getByRole('link', { name: 'Adult' }).click();
    await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition', 'adult');
    inScope();
    await page.getByRole('link', { name: 'Back to Today' }).click();
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
    inScope();
    await page.getByRole('link', { name: /^Read the Adult edition/ }).click();
    await page.getByRole('banner').getByRole('link', { name: 'Five Minutes' }).click();
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
    inScope();
    origins.add(new URL(page.url()).origin);
    expect([...origins]).toHaveLength(1);
  });

  test('standalone-safe: an unknown URL offers a way back to Today', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
    await page.getByRole('link', { name: "Go to Today's idea" }).click();
    await expect(page.getByRole('heading', { level: 1, name: "Today's idea" })).toBeVisible();
  });
});
