import { describe, expect, it } from 'vitest';
import { buildRedirectManifest, updateRouteOwnershipRegistry, validateLessonBundle, validateLessonCollection, validateLessonReferences, validatePublicationCollection, validatePublicationEligibility, validateRouteOwnershipHistory, validateRouteOwnershipRegistry } from '../../src/lib/content/schema';
import { validLesson } from '../fixtures/lesson-fixtures';

describe('lesson schema v1', () => {
  it('accepts a complete canonical lesson', () => {
    expect(validateLessonBundle(validLesson())).toEqual({ valid: true, issues: [] });
  });

  it('allows a draft to be temporarily missing one presentation', () => {
    const lesson = validLesson();
    delete lesson.teen;
    expect(validateLessonBundle(lesson)).toEqual({ valid: true, issues: [] });
  });

  it('rejects shared identity fields in presentation metadata', () => {
    const lesson = validLesson();
    lesson.adult = { ...lesson.adult!, id: lesson.metadata.id } as typeof lesson.adult;
    const result = validateLessonBundle(lesson);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ path: 'adult.id', code: 'unknown-field' }));
  });

  it('rejects invalid identity and canonical tokens', () => {
    const lesson = validLesson();
    lesson.metadata.id = 'not-a-uuid';
    lesson.metadata.slug = 'Not A Slug';
    const result = validateLessonBundle(lesson);
    expect(result.issues.map((x) => x.code)).toEqual(expect.arrayContaining(['uuid', 'slug']));
  });

  it('rejects duplicate IDs deterministically', () => {
    const first = validLesson();
    const second = validLesson({
      metadata: { ...validLesson().metadata, slug: 'another-lesson', aliases: [], id: first.metadata.id },
    });
    const result = validateLessonCollection([first, second]);
    expect(result.issues).toContainEqual(expect.objectContaining({
      path: 'lessons[1].metadata.id',
      code: 'duplicate-id',
    }));
  });

  it('uses one global namespace for slugs and aliases', () => {
    const first = validLesson();
    const second = validLesson({
      metadata: {
        ...validLesson().metadata,
        id: '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12',
        slug: 'second-lesson',
        aliases: [first.metadata.slug],
      },
    });
    const result = validateLessonCollection([first, second]);
    expect(result.issues).toContainEqual(expect.objectContaining({
      path: 'lessons[1].metadata.aliases[0]',
      code: 'route-collision',
    }));
  });

  it('requires canonical lowercase UUIDs', () => {
    const lesson = validLesson();
    lesson.metadata.id = lesson.metadata.id.toUpperCase();
    expect(validateLessonBundle(lesson).issues).toContainEqual(expect.objectContaining({
      path: 'metadata.id', code: 'uuid',
    }));
  });

  it.each([
    '2026-10-03',
    '2026-10-03T00:00:00',
    'October 3, 2026',
    '1',
    '2026-02-30T00:00:00Z',
  ])('rejects ambiguous or invalid publication timestamp %s', (publishedAt) => {
    const lesson = validLesson();
    lesson.metadata.publishedAt = publishedAt;
    expect(validateLessonBundle(lesson).issues).toContainEqual(expect.objectContaining({
      path: 'metadata.publishedAt', code: 'timestamp',
    }));
  });

  it('accepts publication timestamps with an explicit numeric offset', () => {
    const lesson = validLesson();
    lesson.metadata.publishedAt = '2026-10-03T02:00:00+02:00';
    expect(validateLessonBundle(lesson)).toEqual({ valid: true, issues: [] });
  });

  it('requires an unambiguous provenance creation timestamp', () => {
    const lesson = validLesson();
    lesson.metadata.provenance.createdAt = '2026-10-02T18:00:00';
    expect(validateLessonBundle(lesson).issues).toContainEqual(expect.objectContaining({
      path: 'metadata.provenance', code: 'provenance',
    }));
  });

  it('rejects publication before provenance creation', () => {
    const lesson = validLesson();
    lesson.metadata.provenance.createdAt = '2026-10-03T01:00:00Z';
    lesson.metadata.publishedAt = '2026-10-03T00:59:59Z';
    expect(validateLessonBundle(lesson).issues).toContainEqual(expect.objectContaining({
      path: 'metadata.publishedAt', code: 'publication-before-creation',
    }));
  });

  it.each([
    ['slug to slug', 'shared-route', [], 'shared-route', []],
    ['alias to alias', 'first-lesson', ['shared-route'], 'second-lesson', ['shared-route']],
    ['slug to its own alias', 'shared-route', ['shared-route'], undefined, undefined],
  ])('rejects %s collisions', (_label, firstSlug, firstAliases, secondSlug, secondAliases) => {
    const first = validLesson();
    first.metadata.slug = firstSlug as string;
    first.metadata.aliases = firstAliases as string[];
    const lessons = [first];
    if (secondSlug) {
      const second = validLesson();
      second.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
      second.metadata.slug = secondSlug as string;
      second.metadata.aliases = secondAliases as string[];
      lessons.push(second);
    }
    expect(validateLessonCollection(lessons).issues).toContainEqual(expect.objectContaining({
      code: 'route-collision',
    }));
  });

  it('reports collection issues in stable input/path order', () => {
    const first = validLesson();
    first.metadata.aliases = ['same', 'same'];
    const paths = validateLessonCollection([first]).issues.map((x) => x.path);
    expect(paths).toEqual(['lessons[0].metadata.aliases[1]']);
  });
  it('keeps incomplete drafts valid but blocks them from publication', () => {
    const missingAdult = validLesson();
    delete missingAdult.adult;
    expect(validateLessonBundle(missingAdult).valid).toBe(true);
    expect(validatePublicationEligibility(missingAdult).issues).toContainEqual(expect.objectContaining({ path: 'adult', code: 'publication-presentation' }));

    const missingTeen = validLesson();
    delete missingTeen.teen;
    expect(validateLessonBundle(missingTeen).valid).toBe(true);
    expect(validatePublicationEligibility(missingTeen).issues).toContainEqual(expect.objectContaining({ path: 'teen', code: 'publication-presentation' }));
  });

  it('requires both presentations for publication', () => {
    const lesson = validLesson();
    delete lesson.adult;
    delete lesson.teen;
    expect(validatePublicationEligibility(lesson).issues.filter((x) => x.code === 'publication-presentation')).toHaveLength(2);
  });

  it('blocks publication when publishedAt is missing or invalid', () => {
    const missing = validLesson();
    delete (missing.metadata as Partial<typeof missing.metadata>).publishedAt;
    expect(validatePublicationEligibility(missing).issues).toContainEqual(expect.objectContaining({ path: 'metadata.publishedAt', code: 'timestamp' }));
    const invalid = validLesson();
    invalid.metadata.publishedAt = '2026-10-03T00:00:00';
    expect(validatePublicationEligibility(invalid).issues).toContainEqual(expect.objectContaining({ path: 'metadata.publishedAt', code: 'timestamp' }));
  });

  it('accepts canonical publication timestamps including fractional seconds', () => {
    const lesson = validLesson();
    lesson.metadata.publishedAt = '2026-10-03T00:00:00.000Z';
    expect(validatePublicationEligibility(lesson)).toEqual({ valid: true, issues: [] });
    lesson.metadata.publishedAt = '2026-10-03T02:00:00+02:00';
    expect(validatePublicationEligibility(lesson)).toEqual({ valid: true, issues: [] });
  });

  it.each(['adult', 'teen'] as const)('blocks publication when %s is null', (edition) => {
    const lesson = validLesson();
    lesson[edition] = null as never;
    expect(validatePublicationEligibility(lesson).valid).toBe(false);
  });

  it('rejects a non-object publication candidate', () => {
    expect(validatePublicationEligibility(null).valid).toBe(false);
  });

  it('fails the production collection when any lesson is incomplete', () => {
    const complete = validLesson();
    const incomplete = validLesson();
    incomplete.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    incomplete.metadata.slug = 'incomplete-lesson';
    delete incomplete.teen;
    expect(validatePublicationCollection([complete, incomplete]).issues).toContainEqual(expect.objectContaining({
      path: 'lessons[1].teen', code: 'publication-presentation',
    }));
  });

  it('fails the production collection on duplicate identities and routes', () => {
    const result = validatePublicationCollection([validLesson(), validLesson()]);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'lessons[1].metadata.id', code: 'duplicate-id' }),
      expect.objectContaining({ path: 'lessons[1].metadata.slug', code: 'route-collision' }),
    ]));
  });

  it('prevents reassignment of a historically owned route', () => {
    const lesson = validLesson();
    const result = validateLessonReferences([lesson], {
      [lesson.metadata.slug]: '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12',
    });
    expect(result.issues).toContainEqual(expect.objectContaining({
      path: 'lessons[0].metadata.slug', code: 'historical-route-owner',
    }));
  });

  it('keeps retired route ownership when updating the registry', () => {
    const lesson = validLesson();
    const registry = updateRouteOwnershipRegistry([lesson], {
      'retired-name': lesson.metadata.id,
    });
    expect(registry['retired-name']).toBe(lesson.metadata.id);
    expect(registry[lesson.metadata.slug]).toBe(lesson.metadata.id);
    expect(Object.keys(registry)).toEqual([...Object.keys(registry)].sort());
  });

  it('rejects relationships to unknown lesson IDs', () => {
    const lesson = validLesson();
    lesson.metadata.related.manual = [{
      id: '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12',
      reason: 'Missing target',
    }];
    expect(validateLessonReferences([lesson], {} as const).issues).toContainEqual(expect.objectContaining({
      code: 'unknown-relationship',
    }));
  });

  it('accepts relationships to another lesson in the collection', () => {
    const first = validLesson();
    const second = validLesson();
    second.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    second.metadata.slug = 'second-lesson';
    second.metadata.aliases = [];
    first.metadata.related.manual = [{ id: second.metadata.id, reason: 'Continue learning' }];
    expect(validateLessonReferences([first, second], {}).issues.filter((x) => x.code === 'unknown-relationship')).toEqual([]);
  });

  it('requires absolute HTTP(S) source URLs', () => {
    const lesson = validLesson();
    lesson.metadata.sources[0].url = 'javascript:alert(1)';
    expect(validateLessonReferences([lesson], {}).issues).toContainEqual(expect.objectContaining({
      path: 'lessons[0].metadata.sources[0].url', code: 'source-url',
    }));
  });

  it('builds a deterministic edition-aware redirect manifest', () => {
    const lesson = validLesson();
    expect(buildRedirectManifest([lesson])).toEqual([
      { from: '/adult/gps-and-relativity', to: '/adult/why-gps-needs-einstein', lessonId: lesson.metadata.id },
      { from: '/teen/gps-and-relativity', to: '/teen/why-gps-needs-einstein', lessonId: lesson.metadata.id },
    ]);
  });

  it('rejects removal or reassignment from historical route ownership', () => {
    const id = validLesson().metadata.id;
    const other = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    expect(validateRouteOwnershipHistory({ old: id }, {}).issues).toContainEqual(expect.objectContaining({
      path: 'routeOwnership.old', code: 'registry-entry-removed',
    }));
    expect(validateRouteOwnershipHistory({ old: id }, { old: other }).issues).toContainEqual(expect.objectContaining({
      path: 'routeOwnership.old', code: 'registry-owner-changed',
    }));
  });

  it('requires every current slug and alias to be registered', () => {
    const lesson = validLesson();
    const result = validateLessonReferences([lesson], {});
    expect(result.issues.filter((x) => x.code === 'unregistered-route')).toHaveLength(2);
  });

  it('supports a full rename while permanently retaining the old route owner', () => {
    const lesson = validLesson();
    const initial = updateRouteOwnershipRegistry([lesson], {});
    const oldSlug = lesson.metadata.slug;
    lesson.metadata.slug = 'gps-relativity-explained';
    lesson.metadata.aliases = [oldSlug];
    const renamed = updateRouteOwnershipRegistry([lesson], initial);
    expect(validateRouteOwnershipHistory(initial, renamed).valid).toBe(true);
    expect(validateLessonReferences([lesson], renamed).issues.filter((x) => /route/.test(x.code))).toEqual([]);

    lesson.metadata.aliases = [];
    const retired = updateRouteOwnershipRegistry([lesson], renamed);
    expect(retired[oldSlug]).toBe(lesson.metadata.id);

    const other = validLesson();
    other.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    other.metadata.slug = oldSlug;
    other.metadata.aliases = [];
    expect(validateLessonReferences([lesson, other], retired).issues).toContainEqual(expect.objectContaining({
      path: 'lessons[1].metadata.slug', code: 'historical-route-owner',
    }));
  });

  it('validates registry keys and owners without prototype lookups', () => {
    const id = validLesson().metadata.id;
    expect(validateRouteOwnershipRegistry({ 'Bad Key': id, ok: 'NOT-A-UUID' }).issues.map((x) => x.code))
      .toEqual(expect.arrayContaining(['registry-route', 'registry-owner']));
    const lesson = validLesson();
    lesson.metadata.slug = 'constructor';
    lesson.metadata.aliases = [];
    expect(validateLessonReferences([lesson], { constructor: id }).issues.filter((x) => x.code === 'historical-route-owner')).toEqual([]);
  });

  it('reports precise broken exclude and self-relationship paths', () => {
    const lesson = validLesson();
    const registry = updateRouteOwnershipRegistry([lesson], {});
    lesson.metadata.related.manual = [{ id: lesson.metadata.id, reason: 'self' }];
    lesson.metadata.related.exclude = ['018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12'];
    const result = validateLessonReferences([lesson], registry);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'lessons[0].metadata.related.manual[0].id', code: 'self-relationship' }),
      expect.objectContaining({ path: 'lessons[0].metadata.related.exclude[0]', code: 'unknown-relationship' }),
    ]));
  });

  it('refuses redirects for incomplete or duplicate-route input', () => {
    const incomplete = validLesson();
    delete incomplete.teen;
    expect(() => buildRedirectManifest([incomplete])).toThrow(/incomplete lesson/);

    const first = validLesson();
    const second = validLesson();
    second.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    second.metadata.slug = 'second';
    expect(() => buildRedirectManifest([first, second])).toThrow(/Duplicate redirect source/);
  });

});
