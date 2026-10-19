import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import HomePage from '../../src/pages/index.astro';

describe('app shell', () => {
  it('renders the home page inside the base layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage);

    expect(html).toMatch(/<html lang="en"/);
    expect(html).toContain('<title>Something worth knowing | Five Minutes</title>');
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    // Vitest renders in dev mode, which annotates elements with source attributes.
    expect(html).toMatch(/<h1[^>]*>Something worth knowing<\/h1>/);
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*aria-current="page"[^>]*>Home<\/a>/);
    expect(html).toMatch(/<a[^>]*class="brand"[^>]*href="\/"/);
    expect(html).toMatch(/<a[^>]*href="#main"/);
    expect(html).toMatch(/<a[^>]*href="\/feedback"[^>]*>Send anonymous feedback<\/a>/);
  });

  it('renders both progressive-enhancement presentations while defaulting Today to Adult', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage);

    expect(html).toMatch(/href="\/adult\/[a-z0-9-]+"/);
    expect(html).toMatch(/href="\/teen\/[a-z0-9-]+"/);
    expect(html).toContain('data-edition="adult"');
    expect(html).toMatch(/data-edition-choice="adult" aria-current="page"/);
    expect(html).toContain('>Edition</span>');
    expect(html).not.toContain('Read the Adult edition');
    expect(html).not.toContain('Read the Teen edition');
    expect(html).not.toContain('One idea in two editions');
    expect(html).not.toContain('Your chosen edition for today');
    expect(html.match(/data-earlier-id=/g)).toHaveLength(3);
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
