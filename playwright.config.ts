import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

/**
 * Browser journeys run against the built production output served by
 * `astro preview` (never `astro dev`). Run `npm run build` first.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  // Failures should be investigated, not retried away.
  retries: 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      testIgnore: '**/m6-integration-webkit.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // iPhone-class viewport, touch, pixel ratio and user agent, emulated in
      // Chromium. This does not exercise the WebKit engine.
      name: 'mobile-iphone',
      testIgnore: '**/m6-integration-webkit.spec.ts',
      use: { ...devices['iPhone 15'], browserName: 'chromium' },
    },
    {
      // Focused engine coverage for the M6 journeys most exposed to Safari
      // differences. A headless WebKit build is evidence, not a substitute
      // for the physical-iPhone gate recorded in the M6.4 checklist.
      name: 'mobile-webkit',
      testMatch: ['**/m6-integration-webkit.spec.ts','**/weekly-visuals.spec.ts'],
      use: { ...devices['iPhone 15'], browserName: 'webkit' },
    },
  ],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
