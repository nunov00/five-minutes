import {readdir,stat,writeFile} from 'node:fs/promises';import {join} from 'node:path';
async function walk(p){let f=[];for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);f.push(...(e.isDirectory()?await walk(q):[q]))}return f}
const files=await walk('dist');let bytes=0;for(const f of files)bytes+=(await stat(f)).size;
const sf=files.filter(f=>f.includes('/search/'));let sb=0;for(const f of sf)sb+=(await stat(f)).size;
const html=files.filter(f=>f.endsWith('.html'));
if(html.length!==20000)throw new Error('Cardinality failure after build: expected 20000 HTML pages, got '+html.length);
if(sf.length<1)throw new Error('Search artifact missing from dist/search');
const result={generatedAt:new Date().toISOString(),distFiles:files.length,htmlFiles:html.length,distMiB:+(bytes/1048576).toFixed(2),searchFiles:sf.length,searchMiB:+(sb/1048576).toFixed(2)};
console.log(JSON.stringify(result,null,2));await writeFile('benchmark-results.json',JSON.stringify(result,null,2));
