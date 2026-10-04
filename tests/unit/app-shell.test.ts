import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import HomePage from '../../src/pages/index.astro';

describe('app shell', () => {
  it('renders the Today page inside the base layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage);

    expect(html).toMatch(/<html lang="en"/);
    expect(html).toContain('<title>Today · Five Minutes</title>');
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    // Vitest renders in dev mode, which annotates elements with source attributes.
    expect(html).toMatch(/<h1[^>]*>Today's idea<\/h1>/);
    expect(html).toMatch(/<a[^>]*class="brand"[^>]*href="\/"/);
    expect(html).toMatch(/<a[^>]*href="#main"/);
  });

  it('offers both editions of the newest lesson on Today using manifest paths', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage);

    expect(html).toMatch(/href="\/adult\/[a-z0-9-]+"/);
    expect(html).toMatch(/href="\/teen\/[a-z0-9-]+"/);
    expect(html).toMatch(/data-catalogue="\/discovery\/catalogue\.[a-f0-9]{12}\.json"/);
    expect(html).not.toContain('search-adult');
    expect(html).not.toContain('search-teen');
  });

  it('declares the web app manifest and install metadata on every page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout);

    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest">');
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Five Minutes">');
    expect(html.match(/<meta name="theme-color"/g)).toHaveLength(2);
    expect(html).not.toContain('serviceWorker');
  });

  it('lets pages override the document title and description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: { title: 'Custom title', description: 'Custom description' },
    });

    expect(html).toContain('<title>Custom title</title>');
    expect(html).toContain('<meta name="description" content="Custom description"');
  });
});
