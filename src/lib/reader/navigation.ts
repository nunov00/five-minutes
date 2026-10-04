import { editionDiscoveryPath } from '../urls';
export const RETURN_ORIGIN_KEY = 'five-minutes.session-origin.v1';
export interface DiscoveryBounds { topics: readonly string[]; libraryPages: number; }
/** Accept only existing, slash-less discovery routes on this origin. */
export function validatedOrigin(value: unknown, bounds: DiscoveryBounds): string | null {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  try {
    const url = new URL(value, 'https://internal.invalid');
    if (url.origin !== 'https://internal.invalid' || url.pathname === '/search' && value.split(/[?#]/)[0] !== '/search') return null;
    if (url.pathname === '/search') return url.pathname + url.search + url.hash;
    const match = url.pathname.match(/^(?:\/editions\/(adult|teen))?\/(library(?:\/page\/(\d+))?|topics(?:\/([a-z0-9-]+))?)$/);
    if (!match || value.split(/[?#]/)[0] !== url.pathname) return null;
    if (match[3] && (Number(match[3]) < 2 || Number(match[3]) > bounds.libraryPages || String(Number(match[3])) !== match[3])) return null;
    if (match[4] && !bounds.topics.includes(match[4])) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}
export function forwardDestination(path: string, edition: 'adult' | 'teen', search: string, hash: string): string | null {
  const destination = editionDiscoveryPath(path, edition);
  return destination ? destination + search + hash : null;
}
