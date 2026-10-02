import { describe, expect, it } from 'vitest';
import { publicationEligibleLessons, validateLessonBundle, validateLessonCollection, validatePublicationEligibility } from '../../src/lib/content/schema';
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

  it('accepts a complete schema-valid lesson for publication', () => {
    expect(validatePublicationEligibility(validLesson())).toEqual({ valid: true, issues: [] });
  });

  it('excludes incomplete lessons from production-eligible output', () => {
    const complete = validLesson();
    const incomplete = validLesson();
    incomplete.metadata.id = '018f47a2-5d7b-7c31-9d4f-0d9a8b6c2e12';
    incomplete.metadata.slug = 'incomplete-lesson';
    delete incomplete.teen;
    expect(publicationEligibleLessons([complete, incomplete])).toEqual([complete]);
  });

});
