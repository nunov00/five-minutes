import { expect, test } from './support/fixtures';

test.describe('public aggregate analytics', () => {
  test('renders real aggregate totals without a login', async ({ page }) => {
    const delivery = await (await page.request.get('/delivery.json')).json() as {
      routes: Array<{ edition: 'adult' | 'teen'; lessonId: string; path: string }>;
    };
    const lesson = delivery.routes.find((route) => route.edition === 'adult');
    if (!lesson) throw new Error('Expected an Adult lesson route.');
    await page.route('**/api/analytics?days=30', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        schemaVersion: 1,
        generatedAt: '2026-10-13T18:00:00.000Z',
        range: { from: '2026-09-14', to: '2026-10-13', days: 30 },
        totals: { views: 12, pageViews: 5, lessonViews: 7, interactions: 4 },
        editions: { adult: 7, teen: 0 },
        events: { page_view: 5, lesson_view: 7, edition_switch: 1, save: 1, surprise: 1, related: 1, outbound: 0 },
        lessons: [{ id: lesson.lessonId, edition: 'adult', count: 7 }],
        series: [{ day: '2026-10-13', views: 12, interactions: 4 }],
      }),
    }));
    await page.route('**/api/analytics/event', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: '{"ok":true}' }));

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { level: 1, name: 'Analytics' })).toBeVisible();
    await expect(page.locator('[data-metric="views"]')).toHaveText('12');
    await expect(page.locator('[data-edition-metric="adult"]')).toHaveText('7');
    await expect(page.locator('[data-top-lessons] a')).toHaveAttribute('href', lesson.path);
    await expect(page.getByRole('cell', { name: '12' })).toBeVisible();
    await expect(page.getByText('does not create a visitor ID')).toBeVisible();
  });

  test('counts a lesson view once per browser per UTC day and sends no URL or request metadata', async ({ page }) => {
    const delivery = await (await page.request.get('/delivery.json')).json() as {
      routes: Array<{ edition: 'adult' | 'teen'; lessonId: string; path: string }>;
    };
    const lesson = delivery.routes.find((route) => route.edition === 'adult');
    if (!lesson) throw new Error('Expected an Adult lesson route.');
    const events: Array<Record<string, unknown>> = [];
    await page.route('**/api/analytics/event', async (route) => {
      events.push(route.request().postDataJSON());
      await route.fulfill({ status: 202, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.goto(lesson.path);
    await expect.poll(() => events.filter((item) => item.event === 'lesson_view').length).toBe(1);
    expect(events[0]).toEqual({ event: 'lesson_view', edition: 'adult', lessonId: lesson.lessonId });
    await page.reload();
    await page.waitForTimeout(250);
    expect(events.filter((item) => item.event === 'lesson_view')).toHaveLength(1);

    await page.locator('[data-save-lesson]').click();
    await expect.poll(() => events.some((item) => item.event === 'save')).toBe(true);
    const save = events.find((item) => item.event === 'save');
    expect(save).toEqual({ event: 'save', edition: 'adult', lessonId: lesson.lessonId });
    expect(JSON.stringify(events)).not.toContain(lesson.path);
  });

  test('replaces every loading placeholder with an accessible failure state', async ({ page }) => {
    await page.route('**/api/analytics?days=30', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Analytics is temporarily unavailable.' }),
    }));
    await page.goto('/analytics');

    await expect(page.locator('[data-analytics-status]')).toContainText('temporarily unavailable');
    await expect(page.locator('[data-metric="views"]')).toHaveText('Unavailable');
    await expect(page.locator('[data-top-lessons] > li')).toHaveText('Analytics totals are temporarily unavailable.');
    await expect(page.locator('[data-interactions] dd')).toHaveText('Unavailable');
    await expect(page.locator('[data-daily-series] td')).toHaveText('Analytics totals are temporarily unavailable.');
    await expect(page.getByText(/Loading (current totals|lessons|activity)/)).toHaveCount(0);
  });
});
