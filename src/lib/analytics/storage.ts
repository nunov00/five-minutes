import type { AnalyticsEvent } from './contracts';

export const ANALYTICS_SEEN_KEY = 'five-minutes.analytics-seen.v1';
const MAX_SEEN = 512;

interface AnalyticsStoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function analyticsCollectionAllowed(signals: { doNotTrack?: string | null; globalPrivacyControl?: boolean }): boolean {
  return signals.doNotTrack !== '1' && signals.globalPrivacyControl !== true;
}

function utcDay(date = new Date()) { return date.toISOString().slice(0, 10); }

/** Owns the bounded, device-local analytics de-duplication marker. */
export function analyticsStorage(getStorage: () => AnalyticsStoragePort) {
  return {
    firstToday(event: AnalyticsEvent, date = new Date()): boolean {
      try {
        const storage = getStorage();
        const current = JSON.parse(storage.getItem(ANALYTICS_SEEN_KEY) ?? '[]');
        const seen = Array.isArray(current) ? current.filter((value): value is string => typeof value === 'string') : [];
        const day = utcDay(date);
        const key = `${day}:${event.event}:${event.dimension}`;
        if (seen.includes(key)) return false;
        storage.setItem(ANALYTICS_SEEN_KEY, JSON.stringify([
          ...seen.filter((value) => value.startsWith(`${day}:`)),
          key,
        ].slice(-MAX_SEEN)));
      } catch {
        // Analytics must never make reading or navigation fail when storage is unavailable.
      }
      return true;
    },
    reset(): boolean {
      try { getStorage().removeItem(ANALYTICS_SEEN_KEY); return true; }
      catch { return false; }
    },
  };
}
