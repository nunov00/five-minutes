import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '../../src/layouts/BaseLayout.astro';
import HomePage from '../../src/pages/index.astro';

describe('app shell', () => {
  it('renders the home page inside the base layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HomePage);

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Five Minutes</title>');
    expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    // Vitest renders in dev mode, which annotates elements with source attributes.
    expect(html).toMatch(/<h1[^>]*>Five Minutes<\/h1>/);
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
