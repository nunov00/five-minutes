/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Unit/integration tests run through Astro's Vite configuration so Astro
// components and modules can be tested directly. Playwright end-to-end tests
// live in tests/e2e/ and are deliberately excluded from this runner.
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
