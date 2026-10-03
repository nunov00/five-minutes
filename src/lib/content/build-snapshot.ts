import type { LoadedLesson } from './loader';
import type { LessonBundle, RouteOwnershipRegistry } from './schema';
import { buildGlobalDeliveryOutputs, type GlobalDeliveryOutputs } from '../global-delivery';

/** Discovery consumers receive validated metadata, never rendered article bodies. */
export interface BuildMetadata extends GlobalDeliveryOutputs {
  lessons: readonly LessonBundle[];
}

export interface BuildSnapshot {
  metadata: BuildMetadata;
  getLesson(id: string): LoadedLesson;
}

// All snapshot values are plain content data. Freeze nested fields as well so
// one build consumer cannot corrupt the content seen by another consumer.
function freezeData<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeData(child);
    Object.freeze(value);
  }
  return value;
}

/** One build/process owns one loader. Concurrent consumers share its in-flight work. */
export function createBuildSnapshotLoader(
  load: () => Promise<LoadedLesson[]>,
  ownership: RouteOwnershipRegistry,
): () => Promise<BuildSnapshot> {
  let pending: Promise<BuildSnapshot> | undefined;
  return () => {
    if (!pending) {
      pending = Promise.resolve().then(load).then((loaded) => {
        const byId = new Map(loaded.map((lesson) => [lesson.metadata.id, freezeData(lesson)]));
        const lessons = loaded.map(({ metadata, adult, teen }) => ({ metadata, adult, teen }));
        const metadata = freezeData({ lessons, ...buildGlobalDeliveryOutputs(lessons, ownership) });
        return Object.freeze({
          metadata,
          getLesson(id: string) {
            const lesson = byId.get(id);
            if (!lesson) throw new Error(`Build snapshot has no lesson ${id}.`);
            return lesson;
          },
        });
      }).catch((error) => {
        // Failed validation never becomes a reusable successful snapshot.
        pending = undefined;
        throw error;
      });
    }
    return pending;
  };
}
