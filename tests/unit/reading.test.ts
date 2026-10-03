import { describe, expect, it } from 'vitest';
import { renderSafeMarkdown } from '../../src/lib/content/safe-content';
import { prepareLessonBody } from '../../src/lib/reading';

describe('prepareLessonBody', () => {
  it('drops a leading heading that repeats the page title and demotes the rest', () => {
    const html = renderSafeMarkdown('# Why GPS Needs Einstein\n\nIntro.\n\n## Detail\n\nMore.');
    const body = prepareLessonBody(html, 'Why GPS Needs Einstein');
    expect(body).not.toContain('Why GPS Needs Einstein');
    expect(body).not.toMatch(/<h1>/);
    expect(body).toContain('<h3>Detail</h3>');
    expect(body).toContain('<p>Intro.</p>');
  });

  it('keeps a leading heading that differs from the title, demoted below the page <h1>', () => {
    const body = prepareLessonBody(renderSafeMarkdown('# Another heading\n\nText.'), 'Page title');
    expect(body).toContain('<h2>Another heading</h2>');
    expect(body).not.toMatch(/<h1>/);
  });

  it('matches titles containing escaped characters', () => {
    const body = prepareLessonBody(renderSafeMarkdown('# Salt & "pepper"\n\nText.'), 'Salt & "pepper"');
    expect(body.trim()).toBe('<p>Text.</p>');
  });

  it('only removes the first heading when it is the very first element', () => {
    const body = prepareLessonBody(renderSafeMarkdown('Intro.\n\n# Title'), 'Title');
    expect(body).toContain('<h2>Title</h2>');
  });

  it('demotes every heading level emitted by the safe-content pipeline', () => {
    const body = prepareLessonBody('<h1>a</h1><h2>b</h2><h3>c</h3>', 'x');
    expect(body).toBe('<h2>a</h2><h3>b</h3><h4>c</h4>');
  });

  it('does not touch escaped heading-like text', () => {
    const body = prepareLessonBody(renderSafeMarkdown('Text with `<h1>` and <h2>raw</h2>.'), 'x');
    expect(body).not.toMatch(/<h[1-4]>/);
  });
});
