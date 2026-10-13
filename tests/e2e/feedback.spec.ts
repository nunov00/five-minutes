import { expect, test } from './support/fixtures';

test.describe('anonymous feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/feedback/config', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ siteKey: 'test-site-key' }),
    }));
    await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', (route) => route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `window.turnstile={render:(element,options)=>{element.textContent='Verified';setTimeout(()=>options.callback('test-token'),0);return 'test-widget'},reset:()=>{}};`,
    }));
  });

  test('submits a bounded anonymous message and shows private confirmation', async ({ page }) => {
    let submitted: Record<string, unknown> | undefined;
    await page.route('**/api/feedback', async (route) => {
      submitted = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    await page.goto('/feedback');
    await expect(page.getByRole('heading', { level: 1, name: 'Send anonymous feedback' })).toBeVisible();
    await page.getByLabel('What is this about?').selectOption('enhancement');
    await page.getByLabel('Your message').fill('Please add a way to browse related topics.');
    const submit = page.getByRole('button', { name: 'Send feedback' });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole('status')).toHaveText('Thank you. Your feedback was sent privately.');
    expect(submitted).toEqual({
      category: 'enhancement',
      message: 'Please add a way to browse related topics.',
      website: '',
      turnstileToken: 'test-token',
    });
  });

  test('keeps the form disabled when runtime configuration is unavailable', async ({ page }) => {
    await page.unroute('**/api/feedback/config');
    await page.route('**/api/feedback/config', (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'unavailable' }),
    }));

    await page.goto('/feedback');
    await expect(page.getByRole('button', { name: 'Send feedback' })).toBeDisabled();
    await expect(page.getByRole('status')).toHaveText('Feedback is temporarily unavailable. Please try again later.');
  });
});
