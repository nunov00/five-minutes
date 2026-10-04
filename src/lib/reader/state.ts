import type { LessonEdition } from '../urls';

export const READER_STATE_KEY = 'five-minutes.reader-state';
export interface ReaderStateV1 {
  version: 1;
  edition: LessonEdition | null;
  saved: string[];
  read: Record<string, string>;
  recent: { id: string; edition: LessonEdition; visitedAt: string }[];
  appearance: 'system' | 'light' | 'dark';
}
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export const emptyReaderState = (): ReaderStateV1 => ({ version: 1, edition: null, saved: [], read: {}, recent: [], appearance: 'system' });
const id = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
export function isEdition(value: unknown): value is LessonEdition { return value === 'adult' || value === 'teen'; }
export function parseReaderState(raw: string | null): ReaderStateV1 | null {
  if (raw === null) return emptyReaderState();
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !(s.edition === null || isEdition(s.edition)) || !Array.isArray(s.saved) || !s.saved.every(id)
      || new Set(s.saved).size !== s.saved.length || !s.read || typeof s.read !== 'object' || Array.isArray(s.read)
      || !Object.entries(s.read).every(([key, value]) => id(key) && date(value)) || !Array.isArray(s.recent)
      || !s.recent.every((r: {id:unknown;edition:unknown;visitedAt:unknown}) => r && id(r.id) && isEdition(r.edition) && date(r.visitedAt))
      || !['system', 'light', 'dark'].includes(s.appearance)) return null;
    return s as ReaderStateV1;
  } catch { return null; }
}
export type ReaderStorageStatus = { kind: 'valid'; state: ReaderStateV1 } | { kind: 'invalid' | 'unavailable' };
/** Unknown/corrupt versions are preserved, never silently overwritten. */
export function readerStorage(getStorage: () => StoragePort) {
  const inspect = (): ReaderStorageStatus => {
    try {
      const state = parseReaderState(getStorage().getItem(READER_STATE_KEY));
      return state ? { kind: 'valid', state } : { kind: 'invalid' };
    } catch { return { kind: 'unavailable' }; }
  };
  return {
    inspect,
    /** Called only after the reader explicitly accepts discarding unreadable data. */
    reset(): boolean {
      try { getStorage().setItem(READER_STATE_KEY, JSON.stringify(emptyReaderState())); return true; }
      catch { return false; }
    },
    read(): ReaderStateV1 | null { try { return parseReaderState(getStorage().getItem(READER_STATE_KEY)); } catch { return null; } },
    chooseEdition(edition: LessonEdition): boolean {
      if (!isEdition(edition)) return false;
      try {
        const storage = getStorage(), state = parseReaderState(storage.getItem(READER_STATE_KEY));
        if (!state) return false;
        storage.setItem(READER_STATE_KEY, JSON.stringify({ ...state, edition }));
        return true;
      } catch { return false; }
    },
  };
}
