import type {APIRoute} from 'astro';
import {getBuildMetadata} from '../../lib/content/build-content';
import {readFile} from 'node:fs/promises';
import {configuredOrigin} from '../../lib/site-origin.mjs';
import {lessonArtwork,buildArtwork} from '../../lib/figures/artwork.mjs';
export async function getStaticPaths(){
 const {lessons}=await getBuildMetadata();const outputs=new Map();
 for(const lesson of lessons){const art=await lessonArtwork(lesson);if(!art.isFallback||configuredOrigin(process.env.SITE_URL))for(const item of art.outputs)outputs.set(item.path,item);}
 if(process.env.FIVE_MINUTES_TEST_LIBRARY_PAGE_SIZE){
  const sample={...lessons[0],adult:{figures:[{id:'lead',role:'lead',figure:{type:'image',src:'/lesson-media/visual-style-butterfly.webp',width:1536,height:1024}}]}};
  const art=await buildArtwork(await readFile('docs/visuals/references/butterfly.webp'),`lesson-${sample.metadata.slug}`);for(const item of art.outputs)outputs.set(item.path,item);
 }
 return [...outputs.values()].map(item=>({params:{image:item.path},props:item}));
}
export const GET:APIRoute=({props})=>new Response(new Uint8Array(props.bytes),{headers:{'Content-Type':props.type}});
