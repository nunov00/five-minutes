import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL;

export default defineConfig({
  output: 'static',
  // Public page URLs are canonical without a trailing slash. Static hosts must
  // serve the directory-style build artifact consistently with this contract.
  trailingSlash: 'never',
  ...(site ? { site } : {}),
  // Keep styles in external files: no inline <style> blocks, so a later
  // Content Security Policy (ADR-0006) does not need 'unsafe-inline' for CSS.
  build: { inlineStylesheets: 'never' },
});
