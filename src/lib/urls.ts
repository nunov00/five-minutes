export type LessonEdition = 'adult' | 'teen';

/**
 * Single source of truth for the sole canonical lesson path.
 * The edition parameter is retained for legacy callers and reader backups only:
 * both values deliberately resolve to /adult/<slug>, never a retired Teen URL.
 * Exact URL syntax remains changeable here without reconstructing paths elsewhere.
 */
export function lessonPath(_edition: LessonEdition, slug: string): string {
  return `/adult/${slug}`;
}

export type DiscoveryKind = 'library' | 'topics';
export function discoveryPath(edition: LessonEdition | null, kind: DiscoveryKind, detail?: string | number): string {
  if (edition !== null && edition !== 'adult' && edition !== 'teen') throw new Error('Unknown edition.');
  const prefix = '';
  if (kind === 'library') {
    const page = detail === undefined ? 1 : Number(detail);
    if (!Number.isInteger(page) || page < 1) throw new Error('Invalid Library page.');
    return `${prefix}/library${page === 1 ? '' : `/page/${page}`}`;
  }
  if (kind !== 'topics' || (detail !== undefined && (typeof detail !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(detail)))) throw new Error('Invalid Topics path.');
  return `${prefix}/topics${detail ? `/${detail}` : ''}`;
}
export function editionDiscoveryPath(path: string, edition: LessonEdition): string | null {
  const match = path.match(/^(?:\/editions\/(?:adult|teen))?\/(library(?:\/page\/[2-9]\d*|\/page\/1\d+)?|topics(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)$/);
  if (!match) return null;
  const neutral = `/${match[1]}`;
  const page = neutral.match(/^\/library\/page\/(\d+)$/);
  return neutral.startsWith('/library') ? discoveryPath(edition, 'library', page ? Number(page[1]) : 1)
    : discoveryPath(edition, 'topics', neutral.split('/')[2]);
}
