import { LOCAL_RASTER_PATH } from './raster.mjs';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&[Object.prototype,null].includes(Object.getPrototypeOf(v));
const plain=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[<>`\u0000-\u001f]/.test(v);
const source=v=>{if(!plain(v,512))return false;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
/** Structural evidence is necessary, never sufficient to establish ownership or a licence. */
export function validateImageRightsRecords(records){
 if(records===undefined)return [];
 if(!Array.isArray(records)||records.length<1||records.length>3)return ['Expected one to three imageRights records.'];
 if(!records.every(r=>object(r)&&Object.keys(r).every(k=>['src','origin','creator','licence','evidence','sourceUrl'].includes(k))
  &&typeof r.src==='string'&&LOCAL_RASTER_PATH.test(r.src)&&['original-code','generated','licensed'].includes(r.origin)
  &&plain(r.creator,120)&&plain(r.licence,160)&&plain(r.evidence,600)
  &&(r.sourceUrl===undefined?r.origin!=='licensed':source(r.sourceUrl))))return ['Each imageRights record requires a local src, approved origin, bounded creator/licence/evidence, and a safe HTTPS sourceUrl for licensed artwork.'];
 return new Set(records.map(r=>r.src)).size===records.length?[]:['Duplicate imageRights asset.'];
}
/** Every non-archive raster needs exactly one persistent rights record, shared across editions. */
export function validateImageRights(records,paths,required=true){
 const issues=validateImageRightsRecords(records);if(issues.length)return issues;
 if(records===undefined)return required&&paths.length?['Raster figures require imageRights in lesson.yaml.']:[];
 const referenced=new Set(paths),recorded=new Set(records.map(r=>r.src));
 return referenced.size===recorded.size&&[...referenced].every(p=>recorded.has(p))?[]:['imageRights must match exactly the referenced raster assets.'];
}
