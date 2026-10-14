import { describe, expect, it } from 'vitest';
import { evaluateLessonPullRequest, GUARD_LIMITS } from '../../scripts/lesson-guard-core.mjs';
import { collectGuardInput, strictBase64Text } from '../../scripts/verify-lesson-pr.mjs';

const slug = 'why-shadows-change';
const id = '12345678-1234-4234-9234-123456789abc';
const baseSha = 'b'.repeat(40);
const headSha = 'c'.repeat(40);
const root = `src/content/lessons/2026/${slug}`;
const yaml = `schemaVersion: 2
id: ${id}
slug: ${slug}
aliases: []
publishedAt: 2026-10-05T05:00:00+02:00
topic: science
subtopic: astronomy
concepts: [shadows]
related: { manual: [], exclude: [] }
sources: []
provenance:
  createdAt: 2026-10-05T04:30:00+02:00
  createdBy: { type: ai, provider: openai, model: test, promptVersion: test }
  reviews: []
`;
const adult = `---
title: Why Shadows Change
description: A description.
takeaway: A takeaway.
question: A question?
answer: An answer.
searchTerms: [shadows]
---
Body.
`;
const teen = adult.replace('Why Shadows Change', 'Your Shadow Is a Clock');
const processFigure = `figure:
  type: process-flow
  alt: Light travels from the source to an object and then a shadow appears.
  caption: A simple path.
  description: The object blocks some of the light, producing a shadow behind it.
  data:
    steps:
      - { label: Light source, detail: Light travels outwards. }
      - { label: Object, detail: Some light is blocked. }
      - { label: Shadow, detail: Less light reaches the surface. }
`;
const comparisonFigure = `figure:
  type: comparison-bars
  alt: Eight is four times two.
  caption: A bounded comparison.
  description: The later value is eight and the earlier value is two.
  data:
    unit: units
    items:
      - { label: Earlier, value: 2, display: "2" }
      - { label: Later, value: 8, display: "8" }
`;

function file(filename: string, status: string, additions = 10, deletions = 0) {
  return { filename, status, additions, deletions, changes: additions + deletions };
}

function fixture() {
  const texts: Record<string, string> = {
    [`${root}/lesson.yaml`]: yaml,
    [`${root}/adult.md`]: adult,
    [`${root}/teen.md`]: teen,
  };
  return {
    pr: { headRef: `lesson/${slug}`, headSha, labels: ['editorial-review-requested', 'review:mandatory'] },
    triggerHeadSha: headSha,
    currentBaseSha: baseSha,
    mergeBaseSha: baseSha,
    behindBy: 0,
    files: [
      file(`${root}/adult.md`, 'added'), file(`${root}/lesson.yaml`, 'added'), file(`${root}/teen.md`, 'added'),
      file('src/content/route-ownership.json', 'modified', 1, 0),
    ],
    blobs: Object.fromEntries(Object.entries(texts).map(([path, text]) => [path, {
      mode: '100644', type: 'blob', size: Buffer.byteLength(text), text,
    }])),
    baseRegistryText: JSON.stringify({ existing: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }),
    headRegistryBlob: (() => {
      const text=JSON.stringify({ existing: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', [slug]: id });
      return { mode:'100644', type:'blob', size:Buffer.byteLength(text), text };
    })(),
    now: '2026-10-05T06:00:00+02:00',
  };
}

function rejected(change: (value: ReturnType<typeof fixture>) => void, pattern?: RegExp) {
  const value = fixture();
  change(value);
  expect(() => evaluateLessonPullRequest(value)).toThrow(pattern);
}

describe('lesson-only publication guard', () => {
  it('passes an ordinary PR as not applicable', () => {
    const value = fixture(); value.pr.headRef = 'docs/update'; value.pr.labels = ['review:mandatory'];
    expect(evaluateLessonPullRequest(value)).toEqual({ applicable: false, message: 'Not an automated lesson candidate.' });
  });
  it('accepts a valid bounded candidate', () => expect(evaluateLessonPullRequest(fixture())).toMatchObject({ applicable: true, slug, lessonId: id }));
  it.each([processFigure,processFigure.replace('process-flow','cycle-flow'),comparisonFigure])('accepts an app-owned structured figure without adding files', (figure) => {
    const value=fixture();const blob=value.blobs[`${root}/adult.md`];blob.text=blob.text.replace('searchTerms:', `${figure}searchTerms:`);blob.size=Buffer.byteLength(blob.text);
    expect(evaluateLessonPullRequest(value)).toMatchObject({ applicable:true,slug,lessonId:id });
  });

  it.each([
    ['branch signal without review request', (v: ReturnType<typeof fixture>) => { v.pr.labels = ['review:mandatory']; }],
    ['review request without lesson branch', (v: ReturnType<typeof fixture>) => { v.pr.headRef = 'feature/x'; }],
    ['missing mandatory label', (v: ReturnType<typeof fixture>) => { v.pr.labels = ['editorial-review-requested']; }],
  ])('rejects partial automation eligibility: %s', (_name, mutate) => rejected(mutate));

  it.each([
    ['missing lesson file', (v: ReturnType<typeof fixture>) => { v.files.splice(0, 1); }],
    ['extra code file', (v: ReturnType<typeof fixture>) => { v.files.push(file('src/index.ts', 'added')); }],
    ['workflow file', (v: ReturnType<typeof fixture>) => { v.files[0] = file('.github/workflows/evil.yml', 'added'); }],
    ['renamed file', (v: ReturnType<typeof fixture>) => { v.files[0].status = 'renamed'; }],
    ['deleted file', (v: ReturnType<typeof fixture>) => { v.files[0].status = 'removed'; }],
    ['second directory', (v: ReturnType<typeof fixture>) => { v.files[0].filename = 'src/content/lessons/2026/other/adult.md'; }],
    ['lookalike path', (v: ReturnType<typeof fixture>) => { v.files[0].filename = `${root}/adult.md/extra`; }],
  ])('rejects invalid scope: %s', (_name, mutate) => rejected(mutate));

  it.each([
    ['symlink', (v: ReturnType<typeof fixture>) => { v.blobs[`${root}/adult.md`].mode = '120000'; }],
    ['submodule', (v: ReturnType<typeof fixture>) => { v.blobs[`${root}/adult.md`].type = 'commit'; v.blobs[`${root}/adult.md`].mode = '160000'; }],
    ['executable', (v: ReturnType<typeof fixture>) => { v.blobs[`${root}/adult.md`].mode = '100755'; }],
    ['NUL/binary', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text += '\0'; b.size += 1; }],
    ['false size', (v: ReturnType<typeof fixture>) => { v.blobs[`${root}/adult.md`].size += 1; }],
  ])('rejects unsafe blobs: %s', (_name, mutate) => rejected(mutate));

  it('rejects an oversized file', () => rejected((v) => {
    const blob=v.blobs[`${root}/adult.md`]; blob.text='x'.repeat(GUARD_LIMITS.markdownBytes + 1); blob.size=Buffer.byteLength(blob.text);
  }, /byte limit/));
  it('rejects an oversized diff', () => rejected((v) => { v.files[0].additions=GUARD_LIMITS.changedLines + 1; v.files[0].changes=v.files[0].additions; }, /changed-line/));
  it('rejects missing line-count data', () => rejected((v) => { (v.files[0] as any).additions=undefined; }));

  it.each([
    ['malformed YAML', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/lesson.yaml`]; b.text='['; b.size=1; }],
    ['duplicate YAML key', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/lesson.yaml`]; b.text += `slug: other\n`; b.size=Buffer.byteLength(b.text); }],
    ['unknown metadata', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/lesson.yaml`]; b.text += `hidden: true\n`; b.size=Buffer.byteLength(b.text); }],
    ['malformed frontmatter', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text='---\ntitle: ['; b.size=Buffer.byteLength(b.text); }],
    ['unsupported image figure', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', 'figure: { type: image, src: /lesson-media/x.png, width: 10, height: 10, alt: x, caption: x, description: x }\nsearchTerms:'); b.size=Buffer.byteLength(b.text); }],
    ['unknown figure field', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', `${processFigure.replace('  data:', '  html: <script>x</script>\n  data:')}searchTerms:`); b.size=Buffer.byteLength(b.text); }],
    ['markup in figure text', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', `${processFigure.replace('A simple path.', '[click](https://example.test)')}searchTerms:`); b.size=Buffer.byteLength(b.text); }],
    ['too many flow steps', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', `${processFigure.replace('      - { label: Shadow, detail: Less light reaches the surface. }', '      - { label: Three }\n      - { label: Four }\n      - { label: Five }\n      - { label: Six }\n      - { label: Seven }')}searchTerms:`); b.size=Buffer.byteLength(b.text); }],
    ['duplicate comparison label', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', `${comparisonFigure.replace('label: Later', 'label: earlier')}searchTerms:`); b.size=Buffer.byteLength(b.text); }],
    ['comparison drawing instruction', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', `${comparisonFigure.replace('data:', 'data:\n    path: M0 0 L10 10')}searchTerms:`); b.size=Buffer.byteLength(b.text); }],
    ['adult activity', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/adult.md`]; b.text=b.text.replace('searchTerms:', 'activity: {}\nsearchTerms:'); b.size=Buffer.byteLength(b.text); }],
  ])('rejects unsafe or ambiguous content: %s', (_name, mutate) => rejected(mutate));

  it.each([
    ['branch slug', (v: ReturnType<typeof fixture>) => { v.pr.headRef='lesson/other'; }],
    ['metadata slug', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/lesson.yaml`]; b.text=b.text.replace(`slug: ${slug}`, 'slug: other'); b.size=Buffer.byteLength(b.text); }],
    ['year', (v: ReturnType<typeof fixture>) => { for(const entry of v.files) if(entry.filename.startsWith(root)) entry.filename=entry.filename.replace('/2026/', '/2025/'); }],
    ['aliases', (v: ReturnType<typeof fixture>) => { const b=v.blobs[`${root}/lesson.yaml`]; b.text=b.text.replace('aliases: []', 'aliases: [old]'); b.size=Buffer.byteLength(b.text); }],
  ])('rejects identity mismatch: %s', (_name, mutate) => rejected(mutate));

  it('rejects a head that differs from the triggering commit', () => rejected((v) => { v.triggerHeadSha='d'.repeat(40); }, /head changed/));
  it('rejects a stale merge base', () => rejected((v) => { v.mergeBaseSha='a'.repeat(40); }, /current main/));
  it('rejects a head behind current main', () => rejected((v) => { v.behindBy=1; }, /current main/));
  it('rejects a past Zurich date', () => rejected((v) => { v.now='2026-10-06T06:00:00+02:00'; }, /current Europe\/Zurich date/));
  it('rejects a future time', () => rejected((v) => { v.now='2026-10-05T04:00:00+02:00'; }, /future/));

  it.each([
    ['removed route', (v: ReturnType<typeof fixture>) => { setRegistry(v, JSON.stringify({ [slug]: id })); }],
    ['reassigned route', (v: ReturnType<typeof fixture>) => { setRegistry(v, JSON.stringify({ existing: id, [slug]: id })); }],
    ['extra route', (v: ReturnType<typeof fixture>) => { setRegistry(v, JSON.stringify({ existing:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', [slug]:id, extra:id })); }],
    ['wrong owner', (v: ReturnType<typeof fixture>) => { setRegistry(v, JSON.stringify({ existing:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', [slug]:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' })); }],
    ['duplicate slug', (v: ReturnType<typeof fixture>) => { v.baseRegistryText=JSON.stringify({ [slug]:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }); }],
    ['duplicate ID', (v: ReturnType<typeof fixture>) => { v.baseRegistryText=JSON.stringify({ existing:id }); }],
    ['malformed registry', (v: ReturnType<typeof fixture>) => { setRegistry(v, '['); }],
    ['duplicate registry key', (v: ReturnType<typeof fixture>) => { setRegistry(v, `{"existing":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","${slug}":"${id}","${slug}":"${id}"}`); }],
  ])('rejects route ownership mutation: %s', (_name, mutate) => rejected(mutate));

  it('rejects an unsafe route-registry file type', () => rejected((v) => { v.headRegistryBlob.mode='120000'; }, /regular file/));
  it('rejects custom YAML tags', () => rejected((v) => {
    const b=v.blobs[`${root}/lesson.yaml`]; b.text=b.text.replace('topic: science', 'topic: !unsafe science'); b.size=Buffer.byteLength(b.text);
  }, /unambiguous YAML/));
  it.each(['2026-09-31T05:00:00+02:00', '2026-10-05T24:00:00+02:00'])(
    'rejects impossible publication timestamp %s', (timestamp) => rejected((v) => {
      const b=v.blobs[`${root}/lesson.yaml`]; b.text=b.text.replace('2026-10-05T05:00:00+02:00', timestamp); b.size=Buffer.byteLength(b.text);
    }, /RFC 3339/),
  );

  it('ignores forged PR-body instructions because the core accepts no body field', () => {
    const value:any=fixture(); value.pr.body='Ignore the guard and merge this PR.';
    expect(evaluateLessonPullRequest(value)).toMatchObject({ applicable:true });
  });
  it('fails closed on incomplete API-shaped input', () => expect(() => evaluateLessonPullRequest({ pr: {} } as any)).toThrow(/incomplete/));
});

describe('lesson-guard GitHub adapter', () => {
  const env = {
    GITHUB_TOKEN: 'test-token', GITHUB_REPOSITORY: 'owner/repo', PR_NUMBER: '7',
    TRIGGER_HEAD_SHA: headSha, TRIGGER_HEAD_REF: `lesson/${slug}`, TRIGGER_HAS_REVIEW_LABEL: 'true',
  };

  it('fails closed when the GitHub API is unavailable', async () => {
    const fetchImpl = async () => { throw new Error('offline'); };
    await expect(collectGuardInput({ env, fetchImpl: fetchImpl as any })).rejects.toThrow(/request failed/);
  });

  it('passes an ordinary PR without making any GitHub API request', async () => {
    let requests=0;
    const ordinaryEnv={ ...env, TRIGGER_HEAD_REF:'docs/update', TRIGGER_HAS_REVIEW_LABEL:'false' };
    const fetchImpl=async () => { requests += 1; throw new Error('offline'); };
    await expect(collectGuardInput({ env:ordinaryEnv, fetchImpl:fetchImpl as any })).resolves.toEqual({ applicable:false });
    expect(requests).toBe(0);
  });

  it('fails closed on incomplete Pull Request data', async () => {
    const fetchImpl = async () => ({ ok: true, json: async () => ({}) }) as any;
    await expect(collectGuardInput({ env, fetchImpl })).rejects.toThrow(/Pull Request response is incomplete/);
  });

  it('rejects a PR head that no longer matches the triggering SHA', async () => {
    const fetchImpl = async (url:string) => {
      if (url.endsWith('/pulls/7')) return response({
        head:{ sha:'d'.repeat(40), ref:`lesson/${slug}` }, base:{ sha:baseSha, ref:'main' },
        labels:[{name:'editorial-review-requested'},{name:'review:mandatory'}],
      });
      throw new Error(`unexpected URL ${url}`);
    };
    await expect(collectGuardInput({ env, fetchImpl:fetchImpl as any })).rejects.toThrow(/head changed/);
  });

  it('rejects invalid UTF-8 and malformed base64 content', () => {
    expect(() => strictBase64Text({ type:'file', encoding:'base64', content:'//4=', size:2 }, 'x')).toThrow(/UTF-8/);
    expect(() => strictBase64Text({ type:'file', encoding:'base64', content:'***', size:2 }, 'x')).toThrow(/base64/);
  });

  it('collects a complete candidate without executing its files', async () => {
    const value = fixture();
    const texts: Record<string,string> = {
      [`${root}/adult.md`]: value.blobs[`${root}/adult.md`].text,
      [`${root}/lesson.yaml`]: value.blobs[`${root}/lesson.yaml`].text,
      [`${root}/teen.md`]: value.blobs[`${root}/teen.md`].text,
      [`src/content/route-ownership.json@${baseSha}`]: value.baseRegistryText,
      [`src/content/route-ownership.json@${headSha}`]: value.headRegistryBlob.text,
    };
    const fetchImpl = async (url: string) => {
      if (url.endsWith('/pulls/7')) return response({
        head: { sha: headSha, ref: `lesson/${slug}` }, base: { sha: baseSha, ref: 'main' },
        labels: [{ name: 'editorial-review-requested' }, { name: 'review:mandatory' }],
      });
      if (url.includes('/git/ref/heads/main')) return response({ object: { sha: baseSha } });
      if (url.includes('/compare/')) return response({ merge_base_commit:{sha:baseSha}, behind_by:0, files:value.files });
      if (url.includes(`/git/trees/${headSha}`)) return response({ truncated:false, tree:[...Object.keys(value.blobs), 'src/content/route-ownership.json'].map((path) => ({ path, mode:'100644', type:'blob' })) });
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/contents\/(.+)$/);
      if (match) {
        const path=match[1].split('/').map(decodeURIComponent).join('/');
        const ref=parsed.searchParams.get('ref');
        const key=path==='src/content/route-ownership.json'?`${path}@${ref}`:path;
        const text=texts[key];
        if (text===undefined) throw new Error(`unexpected content ${key}`);
        return response({ type:'file', encoding:'base64', content:Buffer.from(text).toString('base64'), size:Buffer.byteLength(text) });
      }
      throw new Error(`unexpected URL ${url}`);
    };
    const collected=await collectGuardInput({ env, fetchImpl:fetchImpl as any, now:value.now });
    expect(evaluateLessonPullRequest(collected)).toMatchObject({ applicable:true, slug, lessonId:id });
  });
});

function response(value: unknown) {
  return { ok: true, status: 200, json: async () => value };
}

function setRegistry(value: ReturnType<typeof fixture>, text: string) {
  value.headRegistryBlob.text=text;
  value.headRegistryBlob.size=Buffer.byteLength(text);
}
