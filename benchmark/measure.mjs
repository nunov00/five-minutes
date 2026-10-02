import { readdir, stat, writeFile } from 'node:fs/promises'; import { join } from 'node:path';
async function walk(p){let files=[];for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);if(e.isDirectory())files.push(...await walk(q));else files.push(q)}return files}
const files=await walk('dist'); let bytes=0; for(const f of files) bytes+=(await stat(f)).size;
const pf=files.filter(f=>f.includes('pagefind'));
const result={generatedAt:new Date().toISOString(),distFiles:files.length,distMiB:+(bytes/1048576).toFixed(2),pagefindFiles:pf.length,pagefindMiB:+((await Promise.all(pf.map(f=>stat(f)))).reduce((n,s)=>n+s.size,0)/1048576).toFixed(2)};
console.log(JSON.stringify(result,null,2)); await writeFile('benchmark-results.json',JSON.stringify(result,null,2));
