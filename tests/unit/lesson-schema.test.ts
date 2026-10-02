import { describe, expect, it } from 'vitest';
import { validateLessonBundle, validateLessonCollection } from '../../src/lib/content/schema';
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

  it('reports collection issues in stable input/path order', () => {
    const first = validLesson();
    first.metadata.aliases = ['same', 'same'];
    const paths = validateLessonCollection([first]).issues.map((x) => x.path);
    expect(paths).toEqual(['lessons[0].metadata.aliases[1]']);
  });
});
