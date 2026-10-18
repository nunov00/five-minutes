import { parseDocument } from 'yaml';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const BACKLOG_PATH = 'editorial/backlog.json';
const TOKEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const canonicalToken=value=>typeof value==='string' && TOKEN.test(value);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function parseBacklog(text) {
  const document = parseDocument(text, {schema:'json', strict:true, uniqueKeys:true});
  if (document.errors.length || document.warnings.length) throw new Error('Invalid or ambiguous backlog JSON.');
  const value = JSON.parse(text);
  if (value.version !== 1 || !Array.isArray(value.entries) || Object.keys(value).some(k => !['version','entries'].includes(k))) throw new Error('Invalid backlog document.');
  const keys = new Set();
  for (const entry of value.entries) {
    if (!entry || typeof entry !== 'object' || keys.has(entry.key) || typeof entry.key !== 'string'
      || !canonicalToken(entry.slug) || !['revision','import'].includes(entry.kind)
      || !['queued','parked','complete','accepted','covered'].includes(entry.state)
      || !Number.isInteger(entry.priority) || entry.priority < 0
      || typeof entry.reason !== 'string' || !entry.reason.trim()
      || !Array.isArray(entry.criteria) || entry.criteria.length === 0 || entry.criteria.some(c => typeof c !== 'string' || !c.trim())
      || !/^\d{4}-\d{2}-\d{2}T/.test(entry.queuedAt) || !Number.isFinite(Date.parse(entry.queuedAt))
      || (entry.kind === 'revision' && !UUID.test(entry.lessonId))) throw new Error('Invalid or duplicate backlog entry.');
    if (entry.kind === 'import') {
      const url = new URL(entry.sourceUrl);
      if (url.origin !== 'https://five-minutes.vitoria-nuno.chatgpt.site' || url.username || url.password || url.pathname !== `/lesson/${entry.slug}` || url.search || url.hash
        || !/^\d{4}-\d{2}-\d{2}$/.test(entry.originalDate) || new Date(`${entry.originalDate}T00:00:00Z`).toISOString().slice(0,10) !== entry.originalDate) throw new Error('Invalid original lesson record.');
    }
    if (entry.legacySlugs !== undefined && (!Array.isArray(entry.legacySlugs) || entry.legacySlugs.some(slug=>!canonicalToken(slug)))) throw new Error('Invalid legacy lesson alias.');
    if (entry.state === 'accepted' && entry.kind !== 'revision') throw new Error('Accepted entries require an existing lesson identity.');
    if (entry.state === 'covered' && (!UUID.test(entry.destinationId) || !canonicalToken(entry.destinationSlug))) throw new Error('Covered entries require an existing destination.');
    if (entry.state === 'parked' && (!entry.blocker || typeof entry.blocker.reason !== 'string' || !entry.blocker.reason.trim()
      || !/^https:\/\/github\.com\/nunov00\/five-minutes\/issues\/[1-9][0-9]*$/.test(entry.blocker.issueUrl)
      || !Array.isArray(entry.blocker.failedDays) || new Set(entry.blocker.failedDays).size < 2
      || entry.blocker.failedDays.some(day=>!/^\d{4}-\d{2}-\d{2}$/.test(day) || new Date(`${day}T00:00:00Z`).toISOString().slice(0,10)!==day))) throw new Error('Parked entries need a blocker issue and at least two distinct failed days.');
    if (entry.state === 'complete' && (!UUID.test(entry.destinationId) || !canonicalToken(entry.destinationSlug) || !Number.isFinite(Date.parse(entry.completedAt)))) throw new Error('Invalid backlog completion.');
    keys.add(entry.key);
  }
  return value;
}

export function nextBacklogEntry(backlog) {
  return backlog.entries.filter(e => e.state === 'queued').sort((a,b) => a.priority-b.priority || (Date.parse(a.queuedAt)-Date.parse(b.queuedAt)) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))[0];
}

/** A daily candidate can complete exactly the first queued entry; it cannot edit its brief or any other entry. */
export function verifyBacklogCompletion(baseText, headText, metadata, releaseAt) {
  const base = parseBacklog(baseText), head = parseBacklog(headText), selected = nextBacklogEntry(base);
  if (!selected) throw new Error('No queued lesson to complete.');
  const expected = structuredClone(base);
  const completed = expected.entries.find(e => e.key === selected.key);
  Object.assign(completed, {state:'complete', completedAt:releaseAt, destinationId:metadata.id, destinationSlug:metadata.slug});
  if (JSON.stringify(expected) !== JSON.stringify(head)) throw new Error('Only the selected backlog completion may change.');
  if (selected.kind === 'revision' && (metadata.id !== selected.lessonId || metadata.slug !== selected.slug)) throw new Error('Backlog lesson identity changed.');
  if (selected.kind === 'import' && (metadata.archive?.sourceUrl !== selected.sourceUrl || metadata.archive?.catalogueDate !== selected.originalDate)) throw new Error('Original lesson provenance changed.');
  return selected;
}

// Owner requests may be relayed in chat; this local command prepares a normal reviewed PR.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const backlog = parseBacklog(await readFile(BACKLOG_PATH,'utf8'));
  const [command, identifier, ...words] = process.argv.slice(2);
  if (command === 'next') console.log(JSON.stringify(nextBacklogEntry(backlog) ?? null, null, 2));
  else if (command === 'park') {
    const entry=backlog.entries.find(e=>e.key===identifier || e.slug===identifier);
    const [issueUrl, days, ...reasonWords]=words;
    if(!entry || entry.state!=='queued') throw new Error('Only a queued entry can be parked.');
    const selected=nextBacklogEntry(backlog);
    if(selected?.key!==entry.key) throw new Error('Only the currently blocked first entry may be parked.');
    entry.state='parked'; entry.blocker={issueUrl,failedDays:(days??'').split(','),reason:reasonWords.join(' ')};
    parseBacklog(JSON.stringify(backlog));
    await writeFile(BACKLOG_PATH,JSON.stringify(backlog,null,2)+'\n');
    console.log('Parking change prepared locally. A normal reviewed Manager PR is required; no publication occurred.');
  }
  else if (command === 'return') {
    let entry = backlog.entries.find(e => e.key === identifier || e.slug === identifier || e.lessonId === identifier || e.destinationSlug === identifier || e.legacySlugs?.includes(identifier));
    const reason = words.join(' ').trim();
    if (!reason) throw new Error('Use return <lesson key/slug/ID> <reason>.');
    if (!entry) {
      for (const year of await readdir('src/content/lessons')) if (/^\d{4}$/.test(year)) {
        for (const slug of await readdir(`src/content/lessons/${year}`)) {
          const doc=parseDocument(await readFile(`src/content/lessons/${year}/${slug}/lesson.yaml`,'utf8'),{schema:'core',uniqueKeys:true});
          if(doc.errors.length||doc.warnings.length) throw new Error('Invalid canonical lesson metadata.');
          const metadata=doc.toJS({maxAliasCount:0});
          if(metadata.slug===identifier || metadata.id===identifier || metadata.aliases.includes(identifier)) {
            entry={key:`lesson-${metadata.id}`,kind:'revision',lessonId:metadata.id,slug:metadata.slug,state:'queued',priority:0,queuedAt:new Date().toISOString(),reason,criteria:[reason]};
            backlog.entries.push(entry);
          }
        }
      }
      if (!entry) throw new Error('No published lesson matches that key/slug/ID.');
    }
    if (entry.destinationId) { entry.kind='revision'; entry.lessonId=entry.destinationId; entry.slug=entry.destinationSlug; }
    entry.state='queued'; entry.priority=0; entry.reason=reason; entry.criteria=[reason]; entry.queuedAt=new Date().toISOString();
    delete entry.blocker;
    delete entry.completedAt; delete entry.destinationId; delete entry.destinationSlug;
    parseBacklog(JSON.stringify(backlog));
    await writeFile(BACKLOG_PATH, JSON.stringify(backlog,null,2)+'\n');
    console.log('Backlog change prepared locally. Submit through a normal reviewed PR; no publication occurred.');
  } else throw new Error('Use next, return <lesson> <reason>, or park <lesson> <issue URL> <failed days,comma-separated> <reason>.');
}
