import { defineConfig } from 'astro/config';
import { configuredOrigin } from './src/lib/site-origin.mjs';

const site = configuredOrigin(process.env.SITE_URL);
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  ...(site ? { site } : {}),
  build: { inlineStylesheets: 'never' },
});
