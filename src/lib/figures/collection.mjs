/** Shared bounded structure; each inner figure is validated by the existing figure validator. */
import {RASTER_LIMITS} from './raster.mjs';
export const VISUAL_LIMITS = Object.freeze({count:3, totalBytes:3*RASTER_LIMITS.maxBytes});
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
export function validateVisualCollection(presentation) {
  if(!Object.hasOwn(presentation,'figures'))return [];
  const issues=[];
  if(Object.hasOwn(presentation,'figure'))issues.push('Use figure or figures, never both.');
  const list=presentation.figures;
  if(!Array.isArray(list)||list.length<1||list.length>VISUAL_LIMITS.count)return [...issues,'Expected one to three figures.'];
  const ids=new Set();let leads=0;
  for(const item of list){
    if(!object(item)||Object.keys(item).some(k=>!['id','role','figure'].includes(k))
      ||typeof item.id!=='string'||item.id.length>20||!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(item.id)
      ||!['lead','explanation','evidence'].includes(item.role)||!object(item.figure)){
      issues.push('Each visual requires a bounded id, approved role and structured figure.');continue;
    }
    if(ids.has(item.id))issues.push('Visual ids must be unique.');ids.add(item.id);
    if(!Number.isInteger(item.figure.afterParagraph)||item.figure.afterParagraph<1||item.figure.afterParagraph>50)issues.push('Collection figures require a paragraph position from 1 to 50.');
    if(item.role==='lead'){leads++;if(item.figure.type!=='image')issues.push('A lead must be a local raster image.');}
  }
  if(leads>1)issues.push('At most one lead visual is allowed.');
  return issues;
}
/** Call after validation. Legacy figures retain their former default placement and rendering.
 * @returns {import('../content/presentation-extensions').LessonVisual[]}
 */
export function lessonVisuals(presentation) {
  if(Array.isArray(presentation?.figures))return presentation.figures.filter(v=>object(v)&&object(v.figure));
  return presentation?.figure?[{id:'legacy',role:'explanation',figure:presentation.figure}]:[];
}
