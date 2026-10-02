export const LESSON_SCHEMA_VERSION = 1 as const;

export type LessonId = string;

export interface LessonSource {
  title: string;
  url: string;
  publisher: string;
  accessedAt: string;
  note?: string;
}

export interface LessonRelationship {
  id: LessonId;
  reason: string;
}

export interface LessonMetadata {
  schemaVersion: typeof LESSON_SCHEMA_VERSION;
  id: LessonId;
  slug: string;
  aliases: string[];
  publishedAt: string;
  topic: string;
  subtopic: string;
  concepts: string[];
  related: {
    manual: LessonRelationship[];
    exclude: LessonId[];
  };
  sources: LessonSource[];
  provenance: {
    createdAt: string;
    createdBy: {
      type: 'ai' | 'human';
      provider?: string;
      model?: string;
      promptVersion?: string;
    };
    reviews: unknown[];
  };
}

export interface PresentationMetadata {
  title: string;
  description: string;
  takeaway: string;
  question: string;
  answer: string;
  searchTerms: string[];
}

export interface LessonBundle {
  metadata: LessonMetadata;
  adult?: PresentationMetadata;
  teen?: PresentationMetadata;
}

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const RFC3339_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TOKEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PRESENTATION_KEYS = new Set(['title', 'description', 'takeaway', 'question', 'answer', 'searchTerms']);
const METADATA_KEYS = new Set([
  'schemaVersion', 'id', 'slug', 'aliases', 'publishedAt', 'topic', 'subtopic',
  'concepts', 'related', 'sources', 'provenance',
]);

function issue(issues: ValidationIssue[], path: string, code: string, message: string) {
  issues.push({ path, code, message });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = RFC3339_TIMESTAMP.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second = '0', , offset] = match;
  const y = Number(year), mo = Number(month), d = Number(day);
  const h = Number(hour), mi = Number(minute), sec = Number(second);
  if (mo < 1 || mo > 12 || h > 23 || mi > 59 || sec > 59) return false;
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d < 1 || d > daysInMonth) return false;
  if (offset !== 'Z') {
    const [oh, om] = offset.slice(1).split(':').map(Number);
    if (oh > 23 || om > 59) return false;
  }
  return !Number.isNaN(Date.parse(value));
}

function validateExactKeys(
  value: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  issues: ValidationIssue[],
) {
  for (const key of Object.keys(value).sort()) {
    if (!allowed.has(key)) issue(issues, `${path}.${key}`, 'unknown-field', 'Field is not part of schemaVersion 1.');
  }
}

function validateStringArray(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  pattern?: RegExp,
) {
  if (!Array.isArray(value)) {
    issue(issues, path, 'type', 'Expected an array.');
    return;
  }
  value.forEach((entry, index) => {
    if (!nonEmpty(entry) || (pattern && !pattern.test(entry))) {
      issue(issues, `${path}[${index}]`, 'format', 'Expected a non-empty canonical token.');
    }
  });
}

export function validatePresentation(value: unknown, path = 'presentation'): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isObject(value)) return { valid: false, issues: [{ path, code: 'type', message: 'Expected presentation metadata.' }] };

  validateExactKeys(value, PRESENTATION_KEYS, path, issues);
  for (const key of ['title', 'description', 'takeaway', 'question', 'answer'] as const) {
    if (!nonEmpty(value[key])) issue(issues, `${path}.${key}`, 'required', 'Expected a non-empty string.');
  }
  validateStringArray(value.searchTerms, `${path}.searchTerms`, issues);
  return { valid: issues.length === 0, issues };
}

export function validateLessonMetadata(value: unknown, path = 'metadata'): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isObject(value)) return { valid: false, issues: [{ path, code: 'type', message: 'Expected lesson metadata.' }] };

  validateExactKeys(value, METADATA_KEYS, path, issues);

  if (value.schemaVersion !== LESSON_SCHEMA_VERSION) issue(issues, `${path}.schemaVersion`, 'schema-version', 'Expected schemaVersion 1.');
  if (!nonEmpty(value.id) || !UUID.test(value.id)) issue(issues, `${path}.id`, 'uuid', 'Expected an RFC 4122-style UUID.');
  if (!nonEmpty(value.slug) || !SLUG.test(value.slug)) issue(issues, `${path}.slug`, 'slug', 'Expected a lowercase kebab-case slug.');
  validateStringArray(value.aliases, `${path}.aliases`, issues, SLUG);

  if (!isValidTimestamp(value.publishedAt)) {
    issue(issues, `${path}.publishedAt`, 'timestamp', 'Expected an unambiguous ISO publication timestamp.');
  }
  for (const key of ['topic', 'subtopic'] as const) {
    if (!nonEmpty(value[key]) || !TOKEN.test(value[key])) issue(issues, `${path}.${key}`, 'taxonomy-token', 'Expected a canonical taxonomy token.');
  }
  validateStringArray(value.concepts, `${path}.concepts`, issues, TOKEN);

  if (!isObject(value.related)) {
    issue(issues, `${path}.related`, 'type', 'Expected relationship metadata.');
  } else {
    if (!Array.isArray(value.related.manual)) issue(issues, `${path}.related.manual`, 'type', 'Expected an array.');
    else value.related.manual.forEach((rel, i) => {
      if (!isObject(rel) || !nonEmpty(rel.id) || !UUID.test(rel.id) || !nonEmpty(rel.reason)) {
        issue(issues, `${path}.related.manual[${i}]`, 'relationship', 'Expected { id: UUID, reason: non-empty string }.');
      }
    });
    validateStringArray(value.related.exclude, `${path}.related.exclude`, issues);
    if (Array.isArray(value.related.exclude)) value.related.exclude.forEach((id, i) => {
      if (typeof id === 'string' && !UUID.test(id)) issue(issues, `${path}.related.exclude[${i}]`, 'uuid', 'Expected a UUID.');
    });
  }

  if (!Array.isArray(value.sources)) issue(issues, `${path}.sources`, 'type', 'Expected an array.');
  else value.sources.forEach((source, i) => {
    if (!isObject(source) || !nonEmpty(source.title) || !nonEmpty(source.url) || !nonEmpty(source.publisher) || !nonEmpty(source.accessedAt) || !DATE.test(source.accessedAt)) {
      issue(issues, `${path}.sources[${i}]`, 'source', 'Expected title, URL, publisher and YYYY-MM-DD accessedAt.');
    }
  });

  if (!isObject(value.provenance) || !isValidTimestamp(value.provenance.createdAt) || !isObject(value.provenance.createdBy) || !['ai', 'human'].includes(String(value.provenance.createdBy.type)) || !Array.isArray(value.provenance.reviews)) {
    issue(issues, `${path}.provenance`, 'provenance', 'Expected createdAt, createdBy and reviews.');
  }

  return { valid: issues.length === 0, issues };
}

export function validateLessonBundle(bundle: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isObject(bundle)) return { valid: false, issues: [{ path: 'lesson', code: 'type', message: 'Expected a lesson bundle.' }] };

  issues.push(...validateLessonMetadata(bundle.metadata).issues);
  if (bundle.adult !== undefined) issues.push(...validatePresentation(bundle.adult, 'adult').issues);
  if (bundle.teen !== undefined) issues.push(...validatePresentation(bundle.teen, 'teen').issues);

  return { valid: issues.length === 0, issues };
}

export function validateLessonCollection(bundles: readonly unknown[]): ValidationResult {
  const issues: ValidationIssue[] = [];
  const ids = new Map<string, number>();
  const routes = new Map<string, { lesson: number; kind: 'slug' | 'alias' }>();

  bundles.forEach((bundle, index) => {
    const result = validateLessonBundle(bundle);
    issues.push(...result.issues.map((entry) => ({ ...entry, path: `lessons[${index}].${entry.path}` })));
    if (!isObject(bundle) || !isObject(bundle.metadata)) return;

    const id = bundle.metadata.id;
    if (typeof id === 'string' && UUID.test(id)) {
      const previous = ids.get(id);
      if (previous !== undefined) issue(issues, `lessons[${index}].metadata.id`, 'duplicate-id', `ID already used by lessons[${previous}].`);
      else ids.set(id, index);
    }

    const candidates: Array<{ value: unknown; kind: 'slug' | 'alias'; path: string }> = [
      { value: bundle.metadata.slug, kind: 'slug', path: 'slug' },
      ...(Array.isArray(bundle.metadata.aliases)
        ? bundle.metadata.aliases.map((value, aliasIndex) => ({ value, kind: 'alias' as const, path: `aliases[${aliasIndex}]` }))
        : []),
    ];
    for (const candidate of candidates) {
      if (typeof candidate.value !== 'string' || !SLUG.test(candidate.value)) continue;
      const previous = routes.get(candidate.value);
      if (previous) {
        issue(issues, `lessons[${index}].metadata.${candidate.path}`, 'route-collision', `Route name "${candidate.value}" already used by lessons[${previous.lesson}] as ${previous.kind}.`);
      } else routes.set(candidate.value, { lesson: index, kind: candidate.kind });
    }
  });

  return { valid: issues.length === 0, issues };
}


export type RouteOwnershipRegistry = Readonly<Record<string, LessonId>>;

export interface RedirectEntry {
  from: string;
  to: string;
  lessonId: LessonId;
}

function isSafeSourceUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates current lesson references and durable route ownership.
 * The registry is append-only in normal operation: route names remain owned by
 * their original immutable lesson ID even after they stop being active aliases.
 */
export function validateLessonReferences(
  bundles: readonly unknown[],
  routeOwnership: RouteOwnershipRegistry,
): ValidationResult {
  const issues = [...validateLessonCollection(bundles).issues];
  const ids = new Set<string>();

  bundles.forEach((bundle) => {
    if (isObject(bundle) && isObject(bundle.metadata) && typeof bundle.metadata.id === 'string' && UUID.test(bundle.metadata.id)) {
      ids.add(bundle.metadata.id);
    }
  });

  bundles.forEach((bundle, index) => {
    if (!isObject(bundle) || !isObject(bundle.metadata)) return;
    const metadata = bundle.metadata;
    const id = typeof metadata.id === 'string' ? metadata.id : undefined;

    const routes = [
      { value: metadata.slug, path: 'slug' },
      ...(Array.isArray(metadata.aliases)
        ? metadata.aliases.map((value, aliasIndex) => ({ value, path: `aliases[${aliasIndex}]` }))
        : []),
    ];
    if (id && UUID.test(id)) {
      for (const route of routes) {
        if (typeof route.value !== 'string' || !SLUG.test(route.value)) continue;
        const owner = routeOwnership[route.value];
        if (owner !== undefined && owner !== id) {
          issue(issues, `lessons[${index}].metadata.${route.path}`, 'historical-route-owner',
            `Route name "${route.value}" is permanently owned by lesson ${owner}.`);
        }
      }
    }

    if (isObject(metadata.related)) {
      const relationshipIds = [
        ...(Array.isArray(metadata.related.manual)
          ? metadata.related.manual.flatMap((rel) => isObject(rel) && typeof rel.id === 'string' ? [rel.id] : [])
          : []),
        ...(Array.isArray(metadata.related.exclude)
          ? metadata.related.exclude.filter((rel): rel is string => typeof rel === 'string')
          : []),
      ];
      for (const relatedId of relationshipIds) {
        if (UUID.test(relatedId) && !ids.has(relatedId)) {
          issue(issues, `lessons[${index}].metadata.related`, 'unknown-relationship',
            `Relationship references unknown lesson ID ${relatedId}.`);
        }
      }
    }

    if (Array.isArray(metadata.sources)) metadata.sources.forEach((source, sourceIndex) => {
      if (isObject(source) && !isSafeSourceUrl(source.url)) {
        issue(issues, `lessons[${index}].metadata.sources[${sourceIndex}].url`, 'source-url',
          'Source URL must be an absolute HTTP(S) URL.');
      }
    });
  });

  return { valid: issues.length === 0, issues };
}

export function updateRouteOwnershipRegistry(
  bundles: readonly LessonBundle[],
  existing: RouteOwnershipRegistry,
): RouteOwnershipRegistry {
  const next: Record<string, LessonId> = { ...existing };
  for (const bundle of bundles) {
    for (const route of [bundle.metadata.slug, ...bundle.metadata.aliases]) {
      const owner = next[route];
      if (owner !== undefined && owner !== bundle.metadata.id) {
        throw new Error(`Route name "${route}" is already owned by lesson ${owner}.`);
      }
      next[route] = bundle.metadata.id;
    }
  }
  return Object.fromEntries(Object.entries(next).sort(([a], [b]) => a.localeCompare(b)));
}

export function buildRedirectManifest(bundles: readonly LessonBundle[]): RedirectEntry[] {
  const redirects: RedirectEntry[] = [];
  for (const bundle of bundles) {
    for (const alias of bundle.metadata.aliases) {
      for (const edition of ['adult', 'teen'] as const) {
        redirects.push({
          from: `/${edition}/${alias}`,
          to: `/${edition}/${bundle.metadata.slug}`,
          lessonId: bundle.metadata.id,
        });
      }
    }
  }
  return redirects.sort((a, b) => a.from.localeCompare(b.from));
}

/** Publication validation is stricter than draft/schema validation. */
export function validatePublicationEligibility(bundle: unknown): ValidationResult {
  const result = validateLessonBundle(bundle);
  const issues = [...result.issues];
  if (!isObject(bundle)) return { valid: false, issues };
  if (bundle.adult === undefined) issue(issues, 'adult', 'publication-presentation', 'Adult presentation is required for publication.');
  if (bundle.teen === undefined) issue(issues, 'teen', 'publication-presentation', 'Teen presentation is required for publication.');
  return { valid: issues.length === 0, issues };
}

/** Fail-closed validation for the complete production content set. */
export function validatePublicationCollection(bundles: readonly unknown[]): ValidationResult {
  const issues = [...validateLessonCollection(bundles).issues];
  bundles.forEach((bundle, index) => {
    for (const entry of validatePublicationEligibility(bundle).issues) {
      if (entry.code === 'publication-presentation') {
        issues.push({ ...entry, path: `lessons[${index}].${entry.path}` });
      }
    }
  });
  return { valid: issues.length === 0, issues };
}
