import { test } from './fixtures';

// Self-test for the shared fixture: proves an uncaught page exception fails a
// test. Uses a synthetic page, so no production code is altered.
test('a test fails when the page throws an uncaught exception', async ({ page }) => {
  test.fail(true, 'the page-error guard must turn uncaught exceptions into failures');

  await page.route('**/__page-error-guard__', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>guard</title><script>throw new Error("guard self-test")</script>',
    }),
  );
  await page.goto('/__page-error-guard__');
});
