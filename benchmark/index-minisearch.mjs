import MiniSearch from 'minisearch';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';

const dir=new URL('../src/content/lessons/',import.meta.url);
const names=(await readdir(dir)).filter(n=>n.endsWith('.md')).sort();
const docs=[];
for(const name of names){
 const raw=await readFile(new URL(name,dir),'utf8');
 const id=raw.match(/^id: "([^"]+)"/m)?.[1];
 const title=raw.match(/^title: "([^"]+)"/m)?.[1];
 const topic=raw.match(/^topic: "([^"]+)"/m)?.[1];
 const subtopic=raw.match(/^subtopic: "([^"]+)"/m)?.[1];
 const text=raw.replace(/^---[\s\S]*?---\s*/m,'');
 docs.push({id,title,topic,subtopic,text,url:`/lesson/${id}/`});
}
const t0=performance.now();
const mini=new MiniSearch({
 fields:['title','topic','subtopic','text'],
 storeFields:['title','topic','subtopic','url'],
 searchOptions:{boost:{title:4,topic:2,subtopic:2},prefix:true}
});
mini.addAll(docs);
const buildMs=performance.now()-t0;
const json=JSON.stringify(mini);
const gzip=gzipSync(json);
await mkdir('dist/search',{recursive:true});
await writeFile('dist/search/minisearch-index.json',json);
await writeFile('dist/search/minisearch-index.json.gz',gzip);

const t1=performance.now();
const loaded=MiniSearch.loadJSON(json,{
 fields:['title','topic','subtopic','text'],
 storeFields:['title','topic','subtopic','url'],
 searchOptions:{boost:{title:4,topic:2,subtopic:2},prefix:true}
});
const loadMs=performance.now()-t1;
const queries=['synthetic lesson 04200','useful idea mechanism','Topic 7','limitations practical takeaway'];
const timings=[];
for(const query of queries){
 const q0=performance.now();
 const results=loaded.search(query,{prefix:true,fuzzy:0.2}).slice(0,20);
 timings.push({query,ms:+(performance.now()-q0).toFixed(3),results:results.length});
}
const result={documents:docs.length,buildMs:+buildMs.toFixed(1),loadMs:+loadMs.toFixed(1),indexMiB:+(Buffer.byteLength(json)/1048576).toFixed(2),gzipMiB:+(gzip.byteLength/1048576).toFixed(2),queries:timings};
console.log(JSON.stringify(result,null,2));
await writeFile('search-benchmark-results.json',JSON.stringify(result,null,2));
