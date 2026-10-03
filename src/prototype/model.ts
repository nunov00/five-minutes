import { getBuildContent } from '../lib/content/build-content';
import { TAXONOMY } from '../lib/taxonomy';
import { formatEditorialDate } from '../lib/today';
import { lessonPath as canonicalLessonPath, type LessonEdition } from '../lib/urls';

export const PREFIX = '/design-preview';
export const PAGE_SIZE = 24;
export const EDITIONS = ['adult', 'teen'] as const;
export const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]!));
export function discovery(edition: string, suffix = '') { return `${PREFIX}/editions/${edition}${suffix ? '/'+suffix : ''}`; }
export function lessonPath(edition: string, slug: string) { return PREFIX+canonicalLessonPath(edition as LessonEdition,slug); }
export function date(timestamp: string) { return formatEditorialDate(timestamp); }

export async function prototypeContent() {
  const snapshot = await getBuildContent();
  return snapshot.metadata.lessons.map(l => {
    const loaded=snapshot.getLesson(l.metadata.id);
    if (!loaded.adult || !loaded.teen) throw new Error('Prototype requires both validated presentations.');
    return {...loaded,adult:loaded.adult,teen:loaded.teen};
  }).sort((a,b) => Date.parse(b.metadata.publishedAt)-Date.parse(a.metadata.publishedAt) || (a.metadata.id < b.metadata.id ? 1 : -1));
}

export function prototypeRoutes(slugs: string[]) {
  const routes = ['', 'library', 'topics', 'search', 'fixture', 'not-found'];
  for (const e of EDITIONS) {
    routes.push(`editions/${e}`, ...['library','topics','search','saved','preferences','fixture','not-found'].map(v => `editions/${e}/${v}`));
    for (let p=1;p<=42;p++) routes.push(`editions/${e}/library/page/${p}`);
    for (const t of TAXONOMY) {
      routes.push(`editions/${e}/topics/${t.token}`);
      for (const s of t.subtopics) routes.push(`editions/${e}/topics/${t.token}/${s.token}`);
    }
    for (const pair of ['science/astronomy','society/economics']) for(let p=1;p<=4;p++) routes.push(`editions/${e}/topics/${pair}/page/${p}`);
    for (const slug of slugs) routes.push(`${e}/${slug}`);
  }
  return routes;
}

export function synthetic(n: number) {
  const pairs = TAXONOMY.flatMap(t => t.subtopics.map(s => ({t,s})));
  return Array.from({length:n}, (_, i) => {
    const {t,s}=pairs[i%pairs.length];
    const id=`synthetic-${String(i+1).padStart(5,'0')}`;
    const publishedAt = new Date(Date.UTC(2026,9,2)-i*86400000).toISOString();
    return { id, slug:id, publishedAt, topic:t.token, topicLabel:t.label, subtopic:s.token, subtopicLabel:s.label, synthetic:true,
      adult:{title:`Synthetic archive entry ${i+1}: understanding ${s.label.toLowerCase()}`,description:'Generated layout and search fixture. This is not a published lesson.',searchTerms:[s.label,t.label,'synthetic'],takeaway:''},
      teen:{title:`Synthetic archive entry ${i+1}: a question about ${s.label.toLowerCase()}`,description:'Generated layout and search fixture. This is not a published lesson.',searchTerms:[s.label,t.label,'synthetic'],takeaway:''} };
  });
}

export const predictionFixtures: Record<string, {prompt:string;options:{id:string;text:string}[];answerId:string;explanation:string}> = {
  'why-earth-has-seasons':{prompt:'It is January. Which hemisphere has summer?',options:[{id:'north',text:'The Northern Hemisphere'},{id:'south',text:'The Southern Hemisphere'}],answerId:'south',explanation:'The Southern Hemisphere. Tilt gives it more direct sunlight and longer days while the north has winter.'},
  'goodharts-law':{prompt:'A school rewards the number of books finished. What might students start choosing?',options:[{id:'short',text:'Shorter books'},{id:'long',text:'Longer books'}],answerId:'short',explanation:'Shorter books can raise the count without improving understanding. That is the proxy becoming the target.'},
};
