import { parseDocument } from 'yaml';

export interface ParsedPresentation {
  frontmatter: unknown;
  markdown: string;
  html: string;
}

export class ContentSecurityError extends Error {}

const SAFE_LINK = /^(?:https?:|mailto:)/i;
const TAGS = new Set(['p','h1','h2','h3','ul','ol','li','strong','em','code','pre','blockquote','a','br']);
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function parseSafeYaml(source: string): unknown {
  const doc = parseDocument(source, { schema: 'core', customTags: [], resolveKnownTags: false });
  if (doc.errors.length || doc.warnings.length) throw new ContentSecurityError('Unsafe or invalid YAML.');
  try { return doc.toJS({ maxAliasCount: 0 }); } catch { throw new ContentSecurityError('Unsafe or invalid YAML.'); }
}

function safeHref(raw: string): string {
  const href = raw.trim();
  if (!SAFE_LINK.test(href)) throw new ContentSecurityError('Unsafe link scheme.');
  return escapeHtml(href);
}

function inline(source: string): string {
  if (/!\[[^\]]*\]\([^)]*\)/.test(source)) throw new ContentSecurityError('Markdown images are not allowed.');
  let out = escapeHtml(source);
  out = out.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_m, label, href) =>
    `<a href="${safeHref(href)}" rel="noopener noreferrer">${label}</a>`);
  out = out.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return out;
}

export function sanitizeRenderedHtml(html: string): string {
  return html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, name: string, attrs: string) => {
    const n = name.toLowerCase();
    if (!TAGS.has(n)) return escapeHtml(tag);
    if (tag.startsWith('</') || n !== 'a') return `<${tag.startsWith('</') ? '/' : ''}${n}>`;
    const href = /href="([^"]*)"/.exec(attrs)?.[1];
    if (!href || !SAFE_LINK.test(href)) return escapeHtml(tag);
    return `<a href="${href}" rel="noopener noreferrer">`;
  });
}

export function renderSafeMarkdown(markdown: string): string {
  if (/^\s*<[^>]+>/m.test(markdown)) {
    // Raw HTML is content, never executable markup. Escaping below neutralizes it.
  }
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const rendered: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  const closeList = () => { if (list) { rendered.push(`</${list}>`); list = null; } };

  for (const line of lines) {
    if (!line.trim()) { closeList(); continue; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { closeList(); rendered.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); continue; }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) { closeList(); list = kind; rendered.push(`<${kind}>`); }
      rendered.push(`<li>${inline((bullet || numbered)![1])}</li>`); continue;
    }
    const quote = /^>\s?(.+)$/.exec(line);
    if (quote) { closeList(); rendered.push(`<blockquote>${inline(quote[1])}</blockquote>`); continue; }
    closeList(); rendered.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return sanitizeRenderedHtml(rendered.join('\n'));
}

export function parsePresentationFile(source: string): ParsedPresentation {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n?/g, '\n'));
  if (!match) throw new ContentSecurityError('Presentation requires YAML front matter.');
  const frontmatter = parseSafeYaml(match[1]);
  const markdown = match[2];
  return { frontmatter, markdown, html: renderSafeMarkdown(markdown) };
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
