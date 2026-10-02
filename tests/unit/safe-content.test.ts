import { describe, expect, it } from 'vitest';
import { ContentSecurityError, parsePresentationFile, parseSafeYaml, renderSafeMarkdown, sanitizeRenderedHtml, serializeStructuredData } from '../../src/lib/content/safe-content';

describe('safe lesson content pipeline', () => {
  it('parses core YAML without constructing custom tagged objects', () => {
    expect(parseSafeYaml('title: Hello\ncount: 2')).toEqual({ title: 'Hello', count: 2 });
    expect(() => parseSafeYaml('value: !!js/function >\n  function () { return 1 }')).toThrow(ContentSecurityError);
    for (const tagged of [
      'a: !!binary aGVsbG8=',
      'a: !!set {x: null}',
      'a: !!omap [ {x: 1} ]',
      'a: !!timestamp 2026-10-03',
    ]) {
      expect(() => parseSafeYaml(tagged)).toThrow(ContentSecurityError);
    }
    expect(() => parseSafeYaml('base: &base {x: 1}\ncopy: *base')).toThrow(ContentSecurityError);
  });

  it('neutralizes raw HTML and script content', () => {
    const html = renderSafeMarkdown('<script>alert("x")</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('rejects remote and local Markdown images', () => {
    expect(() => renderSafeMarkdown('![x](https://example.com/x.png)')).toThrow(ContentSecurityError);
    expect(() => renderSafeMarkdown('![x](/x.png)')).toThrow(ContentSecurityError);
  });

  it('rejects unsafe link schemes and hardens external links', () => {
    expect(() => renderSafeMarkdown('[x](javascript:alert(1))')).toThrow(ContentSecurityError);
    expect(renderSafeMarkdown('[safe](https://example.com)')).toContain('rel="noopener noreferrer"');
  });

  it('sanitizes unexpected rendered tags and attributes', () => {
    expect(sanitizeRenderedHtml('<img src=x onerror=alert(1)><p onclick="x">safe</p>')).toBe('&lt;img src=x onerror=alert(1)&gt;<p>safe</p>');
    expect(sanitizeRenderedHtml('<<b>script>alert(1)<</b>/script>')).not.toContain('<script>');
    expect(sanitizeRenderedHtml('<<b>img src=x onerror=alert(1)>')).not.toContain('<img');
    expect(sanitizeRenderedHtml('<p>ok</p><img src=x onerror="document.title=EXECUTED" ')).not.toContain('<img');
  });

  it('parses front matter and plain Markdown without MDX execution', () => {
    const parsed = parsePresentationFile('---\ntitle: Safe\n---\n\n# Hello\n\n{danger()}');
    expect(parsed.frontmatter).toEqual({ title: 'Safe' });
    expect(parsed.html).toContain('<h1>Hello</h1>');
    expect(parsed.html).toContain('{danger()}');
  });

  it('escapes structured data before embedding in HTML', () => {
    const json = serializeStructuredData({ title: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(json).toContain('\\u003c/script\\u003e');
  });
  it('renders query strings, balanced URL parentheses and fenced code without double escaping', () => {
    const html = renderSafeMarkdown('[query](https://example.com/?a=1&b=2) [paren](https://example.com/a_(b))\n\n\`\`\`js\nconst x = "<script>";\n\`\`\`');
    expect(html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(html).not.toContain('&amp;amp;');
    expect(html).toContain('href="https://example.com/a_(b)"');
    expect(html).toContain('<pre><code>const x = &quot;&lt;script&gt;&quot;;</code></pre>');
  });

  it('rejects NUL characters so internal placeholder tokens cannot be spoofed', () => {
    expect(() => renderSafeMarkdown('[safe](https://example.com) \u00000\u0000')).toThrow(ContentSecurityError);
  });

});
