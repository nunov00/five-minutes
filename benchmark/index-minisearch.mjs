import MiniSearch from 'minisearch';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';

const dir=new URL('../src/content/lessons/',import.meta.url);
const names=(await readdir(dir)).filter(n=>n.endsWith('.md')).sort();
if(names.length!==20000) throw new Error('Expected 20000 presentation files, got '+names.length);
const docs=[];
for(const name of names){
  const raw=await readFile(new URL(name,dir),'utf8');
  const front=raw.split('---',3)[1] ?? '';
  const one=(key)=>front.match(new RegExp('^'+key+': "([^"]+)"','m'))?.[1];
  const arr=(key)=>{const m=front.match(new RegExp('^'+key+': \\[(.*)\\]','m'))?.[1]??'';return [...m.matchAll(/"([^"]+)"/g)].map(x=>x[1])};
  const id=one('id'), edition=one('edition'), slug=one('slug');
  docs.push({key:id+':'+edition,id,edition,title:one('title'),description:one('description'),topic:one('topic'),subtopic:one('subtopic'),concepts:arr('concepts').join(' '),takeaway:one('takeaway'),url:'/'+edition+'/lessons/'+slug+'/'});
}
const identities=new Set(docs.map(d=>d.id)).size;
if(identities!==10000) throw new Error('Expected 10000 identities, got '+identities);
if(new Set(docs.map(d=>d.key)).size!==20000) throw new Error('Search keys are not unique');
const opts={idField:'key',fields:['title','description','topic','subtopic','concepts','takeaway'],storeFields:['id','edition','title','description','topic','subtopic','url'],searchOptions:{boost:{title:5,concepts:3,topic:2,subtopic:2},prefix:true}};
const t0=performance.now();const mini=new MiniSearch(opts);mini.addAll(docs);const buildMs=performance.now()-t0,json=JSON.stringify(mini),gzip=gzipSync(json);
await mkdir('dist/search',{recursive:true});await writeFile('dist/search/minisearch-index.json',json);
const t1=performance.now(),loaded=MiniSearch.loadJSON(json,opts),loadMs=performance.now()-t1,timings=[];
for(const query of ['idea 04200','term00140 mechanism','topic-7','term03000 subtopic-81']){for(let i=0;i<5;i++)loaded.search(query,{prefix:true,fuzzy:0.2}).slice(0,20);const samples=[];for(let i=0;i<20;i++){const q=performance.now();loaded.search(query,{prefix:true,fuzzy:0.2}).slice(0,20);samples.push(performance.now()-q)}samples.sort((a,b)=>a-b);timings.push({query,p50Ms:+samples[9].toFixed(3),p95Ms:+samples[18].toFixed(3)})}
const result={documents:docs.length,lessonIdentities:identities,buildMs:+buildMs.toFixed(1),loadMs:+loadMs.toFixed(1),indexMiB:+(Buffer.byteLength(json)/1048576).toFixed(2),gzipMiB:+(gzip.byteLength/1048576).toFixed(2),queries:timings};
console.log(JSON.stringify(result,null,2));await writeFile('search-benchmark-results.json',JSON.stringify(result,null,2));
