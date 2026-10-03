import type { LessonEdition } from './urls';

export const EDITION_LABELS: Readonly<Record<LessonEdition, string>> = { adult: 'Adult', teen: 'Teen' };

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Prepares already-sanitized lesson HTML for the reading page, which owns the
 * page's only <h1> (the presentation title):
 * - a leading body heading that repeats the title exactly is dropped;
 * - remaining body headings are demoted one level (h1-h3 -> h2-h4).
 *
 * The input must come from the safe-content pipeline, which emits headings as
 * bare `<hN>` tags and escapes every other `<`. Canonical lesson sources are
 * not changed.
 */
export function prepareLessonBody(html: string, title: string): string {
  const leading = /^\s*<h1>([\s\S]*?)<\/h1>\s*/.exec(html);
  const body = leading && leading[1].trim() === escapeText(title.trim()) ? html.slice(leading[0].length) : html;
  return body.replace(/<(\/?)h([1-3])>/g, (_tag, close: string, level: string) => `<${close}h${Number(level) + 1}>`);
}
