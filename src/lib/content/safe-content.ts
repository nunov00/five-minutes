import { parseDocument } from 'yaml';
import { citationAt, citationLink, SOURCE_FRAGMENT, validateCitations } from './citations.mjs';

export interface ParsedPresentation {
  frontmatter: unknown;
  markdown: string;
  html: string;
}

export class ContentSecurityError extends Error {}

/** A structural lesson-content rule was violated (not a security failure). */
export class ContentContractError extends Error {}

export interface MarkdownOptions {
  /** Lowest heading level the source may use; shallower `#` headings fail closed. */
  minHeadingLevel?: 1 | 2;
  sourceCount?: number;
}

const SAFE_LINK = /^(?:https?:|mailto:)/i;
const TAGS = new Set(['p','h1','h2','h3','ul','ol','li','strong','em','code','pre','blockquote','a','br']);
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeSanitizerText = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

function findClosingParen(source: string, start: number): number {
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === '(') depth += 1;
    else if (source[i] === ')') {
      if (depth === 0) return i;
      depth -= 1;
    }
  }
  return -1;
}

function inline(source: string, sourceCount = 0): string {
  if (/!\[[^\]]*\]\(/.test(source)) throw new ContentSecurityError('Markdown images are not allowed.');

  const tokens: string[] = [];
  let staged = '';
  for (let i = 0; i < source.length;) {
    if (source[i] === '`') {
      const end = source.indexOf('`', i + 1);
      if (end > i + 1) {
        const token = `\u0000${tokens.length}\u0000`;
        tokens.push(`<code>${escapeHtml(source.slice(i + 1, end))}</code>`);
        staged += token;
        i = end + 1;
        continue;
      }
    }
    if (source[i] === '[') {
      const citation = citationAt(source, i, sourceCount);
      if (citation) {
        const token = `\u0000${tokens.length}\u0000`;
        tokens.push(citationLink(citation.number));
        staged += token;
        i += citation.length;
        continue;
      }
      const labelEnd = source.indexOf('](', i + 1);
      if (labelEnd !== -1) {
        const hrefEnd = findClosingParen(source, labelEnd + 2);
        if (hrefEnd !== -1) {
          const label = source.slice(i + 1, labelEnd);
          const href = source.slice(labelEnd + 2, hrefEnd);
          const token = `\u0000${tokens.length}\u0000`;
          tokens.push(`<a href="${safeHref(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`);
          staged += token;
          i = hrefEnd + 1;
          continue;
        }
      }
    }
    staged += source[i];
    i += 1;
  }

  let out = escapeHtml(staged);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return out.replace(/\u0000(\d+)\u0000/g, (_m, index) => tokens[Number(index)]);
}

export function sanitizeRenderedHtml(html: string): string {
  const completeTag = /<\/?([a-z0-9]+)([^>]*)>/gi;
  const output: string[] = [];
  let cursor = 0;
  for (const match of html.matchAll(completeTag)) {
    const index = match.index ?? 0;
    output.push(escapeSanitizerText(html.slice(cursor, index)));
    const tag = match[0];
    const name = match[1].toLowerCase();
    const attrs = match[2];
    if (!TAGS.has(name)) output.push(escapeHtml(tag));
    else if (tag.startsWith('</') || name !== 'a') output.push(`<${tag.startsWith('</') ? '/' : ''}${name}>`);
    else {
      const href = /href="([^"]*)"/.exec(attrs)?.[1];
      const citation = href && SOURCE_FRAGMENT.exec(href);
      output.push(citation ? `<a href="${href}" class="source-citation" aria-label="Source ${citation[1]}">`
        : href && SAFE_LINK.test(href) ? `<a href="${href}" rel="noopener noreferrer">` : escapeHtml(tag));
    }
    cursor = index + tag.length;
  }
  output.push(escapeSanitizerText(html.slice(cursor)));
  return output.join('');
}

export function renderSafeMarkdown(markdown: string, { minHeadingLevel = 1, sourceCount = 0 }: MarkdownOptions = {}): string {
  if (markdown.includes('\u0000')) throw new ContentSecurityError('NUL characters are not allowed in Markdown.');
  validateCitations(markdown, sourceCount, true);
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const rendered: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let fence: string[] | null = null;
  const closeList = () => { if (list) { rendered.push(`</${list}>`); list = null; } };

  for (const line of lines) {
    if (/^```/.test(line)) {
      closeList();
      if (fence === null) fence = [];
      else { rendered.push(`<pre><code>${escapeHtml(fence.join('\n'))}</code></pre>`); fence = null; }
      continue;
    }
    if (fence !== null) { fence.push(line); continue; }
    if (!line.trim()) { closeList(); continue; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading && heading[1].length < minHeadingLevel) {
      throw new ContentContractError(`Markdown headings must start at level ${minHeadingLevel}: "${line}".`);
    }
    if (heading) { closeList(); rendered.push(`<h${heading[1].length}>${inline(heading[2], sourceCount)}</h${heading[1].length}>`); continue; }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) { closeList(); list = kind; rendered.push(`<${kind}>`); }
      rendered.push(`<li>${inline((bullet || numbered)![1], sourceCount)}</li>`); continue;
    }
    const quote = /^>\s?(.+)$/.exec(line);
    if (quote) { closeList(); rendered.push(`<blockquote>${inline(quote[1], sourceCount)}</blockquote>`); continue; }
    closeList(); rendered.push(`<p>${inline(line, sourceCount)}</p>`);
  }
  if (fence !== null) throw new ContentSecurityError('Unclosed fenced code block.');
  closeList();
  return sanitizeRenderedHtml(rendered.join('\n'));
}

export function parsePresentationFile(source: string, sourceCount = 0): ParsedPresentation {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n?/g, '\n'));
  if (!match) throw new ContentSecurityError('Presentation requires YAML front matter.');
  const frontmatter = parseSafeYaml(match[1]);
  const markdown = match[2];
  let fenced = false;
  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    if (/^```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced && /^\s*\*\*Takeaway:\*\*/i.test(line)) {
      throw new ContentContractError('The takeaway belongs in presentation front matter and must not be repeated in the body.');
    }
  }
  // The presentation title (front matter) is the page's level-1 heading, so
  // body headings start at level 2 and rendered HTML is used unchanged.
  return { frontmatter, markdown, html: renderSafeMarkdown(markdown, { minHeadingLevel: 2, sourceCount }) };
}

/** Plain figure copy stays plain; only the bounded citation token becomes a link. */
export function renderCitationText(text: string, sourceCount: number): string {
  let html = '';
  for (let i = 0; i < text.length;) {
    const citation = citationAt(text, i, sourceCount);
    if (citation) { html += citationLink(citation.number); i += citation.length; }
    else { html += escapeHtml(text[i]); i++; }
  }
  return html;
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
