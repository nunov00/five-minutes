import { readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const expected=Number(process.env.LESSON_COUNT)*2;
async function walk(p){let f=[];for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);f.push(...(e.isDirectory()?await walk(q):[q]))}return f}
const files=await walk('dist'); const html=files.filter(f=>f.endsWith('.html')); let bytes=0; for(const f of files)bytes+=(await stat(f)).size;
if(html.length!==expected) throw new Error('Expected '+expected+' HTML pages, got '+html.length);
const result={lessonIdentities:Number(process.env.LESSON_COUNT),presentations:expected,htmlFiles:html.length,distFiles:files.length,distMiB:+(bytes/1048576).toFixed(2)};
console.log(JSON.stringify(result,null,2)); await writeFile('scale-'+process.env.LESSON_COUNT+'.json',JSON.stringify(result,null,2));
