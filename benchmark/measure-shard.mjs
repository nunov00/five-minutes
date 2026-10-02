import {readdir,stat,writeFile} from 'node:fs/promises';import {join} from 'node:path';
async function walk(p){let f=[];for(const e of await readdir(p,{withFileTypes:true})){const q=join(p,e.name);f.push(...(e.isDirectory()?await walk(q):[q]))}return f}
const files=await walk('dist'),html=files.filter(f=>f.endsWith('.html'));let bytes=0;for(const f of files)bytes+=(await stat(f)).size;
const count=Number(process.env.LESSON_COUNT), shards=Number(process.env.SHARD_COUNT), idx=Number(process.env.SHARD_INDEX);
const start=Math.floor(count*idx/shards)+1,end=Math.floor(count*(idx+1)/shards),expected=(end-start+1)*2;
if(html.length!==expected)throw new Error('Expected '+expected+' HTML pages, got '+html.length);
const r={totalLessonTarget:count,shardCount:shards,shardIndex:idx,lessonIdentities:end-start+1,htmlFiles:html.length,distMiB:+(bytes/1048576).toFixed(2)};console.log(JSON.stringify(r,null,2));await writeFile('shard-'+idx+'.json',JSON.stringify(r,null,2));
