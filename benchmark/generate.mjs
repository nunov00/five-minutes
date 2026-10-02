import { mkdir, rm, writeFile } from 'node:fs/promises';
const root=new URL('../src/content/lessons/',import.meta.url);
await rm(root,{recursive:true,force:true}); await mkdir(root,{recursive:true});
const para=(i,a,p)=>`Lesson ${i} ${a} section ${p}. This synthetic paragraph represents explanatory Five Minutes prose about a useful idea, its mechanism, an example, limitations, and a practical takeaway. It is intentionally substantial enough to exercise rendering and search indexing rather than benchmark empty pages.`;
for(let i=1;i<=10000;i++){
 const id=String(i).padStart(5,'0'), topic=`Topic ${i%20}`, subtopic=`Subtopic ${i%100}`;
 const adult=Array.from({length:7},(_,p)=>para(i,'adult',p+1)).join('\n\n');
 const teen=Array.from({length:6},(_,p)=>para(i,'teen',p+1)).join('\n\n');
 const body=`---\nid: "lesson-${id}"\ntitle: "Synthetic lesson ${id}"\ntopic: "${topic}"\nsubtopic: "${subtopic}"\n---\n# Synthetic lesson ${id}\n\n## Adult\n\n${adult}\n\n## Teen\n\n${teen}\n\n## Takeaway\n\nA concise synthetic takeaway for lesson ${id}.\n`;
 await writeFile(new URL(`lesson-${id}.md`,root),body);
}
console.log('generated 10000 lessons');
