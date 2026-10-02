import { test as base, expect } from '@playwright/test';

/**
 * Shared test fixture for all browser journeys. Import `test` and `expect`
 * from here rather than from `@playwright/test`.
 *
 * Every page is guarded: an uncaught exception thrown in the page fails the
 * test, even if all of the test's own assertions pass.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await use(page);

    expect(
      pageErrors.map((error) => error.message),
      'uncaught exceptions in the page',
    ).toEqual([]);
  },
});

export { expect };
