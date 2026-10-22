import type { ValidationIssue } from './schema';
import { FIGURE_SYMBOLS, TOOLKIT_TYPES, validateToolkitData } from '../figures/toolkit-contract.mjs';
import { RASTER_LIMITS, LOCAL_RASTER_PATH } from '../figures/raster.mjs';

export interface FigureText {
  alt: string;
  caption: string;
  description: string;
  /** Insert after this top-level prose paragraph; omitted means the opening. */
  afterParagraph?: number;
}
export interface FlowStep { label: string; detail?: string; }
export interface ComparisonItem { label: string; value: number; display: string; }
export interface ConceptNode { label: string; symbol: keyof typeof FIGURE_SYMBOLS; }
export type LessonFigure = FigureText & (
  | { type: 'seasons-orbit'; data: { tiltDegrees: 23.4 | 23.5 } }
  | { type: 'process-flow'; data: { style: 'filter-reclaim'; steps: FlowStep[] } }
  | { type: 'cycle-flow'; data: { style: 'feedback-loop' | 'heat-transfer'; steps: FlowStep[] } }
  | { type: 'comparison-bars'; data: { style: 'doubling-growth' | 'proportional'; items: ComparisonItem[]; unit?: string } }
  | { type: 'concept-flow'; data: { pattern: 'sequence' | 'cycle' | 'branch'; nodes: ConceptNode[] } }
  | { type: 'orbital-motion'; data: { style: 'shared-free-fall' } }
  | { type: 'image'; src: string; width: number; height: number }
);
export interface TeenActivity { prompt: string; options: string[]; answer: number; explanation: string; }
export const FIGURE_LIMITS = RASTER_LIMITS;
export const LOCAL_FIGURE_PATH = LOCAL_RASTER_PATH;
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const plain = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max
  && !/[<>`]|!\[|\[[^\]]*\]\(|\*\*|(?:^|\n)\s*(?:#|[-*]\s)/.test(v) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
const normalise = (v: string) => v.trim().toLocaleLowerCase('en').replace(/\s+/g,' ');
function keys(v: Record<string,unknown>, allowed: string[], path: string, issues: ValidationIssue[]) {
  for(const key of Object.keys(v)) if(!allowed.includes(key)) issues.push({path:`${path}.${key}`,code:'unknown-field',message:'Unknown structured presentation field.'});
}
function validateSteps(value: unknown, path: string, type: 'process-flow'|'cycle-flow', issues: ValidationIssue[], fail: (name:string,message:string)=>void) {
  if(!object(value)) { fail('figure.data','Expected structured flow data.'); return; }
  keys(value,['style','steps'],`${path}.figure.data`,issues);
  const styles=type==='process-flow'?['filter-reclaim']:['feedback-loop','heat-transfer'];
  if(!styles.includes(String(value.style))) fail('figure.data.style',`Expected one approved ${type} visual style.`);
  if(!Array.isArray(value.steps)||value.steps.length!==4) {
    fail('figure.data.steps','Approved flow visuals require exactly four concise steps.'); return;
  }
  const labels:string[]=[];
  value.steps.forEach((step,index)=>{
    if(!object(step)) { fail(`figure.data.steps.${index}`,'Expected one structured flow step.'); return; }
    keys(step,['label','detail'],`${path}.figure.data.steps.${index}`,issues);
    if(!plain(step.label,36)) fail(`figure.data.steps.${index}.label`,'Expected a concise plain-text label of at most 36 characters.');
    else labels.push(normalise(step.label));
    if(step.detail!==undefined&&!plain(step.detail,120)) fail(`figure.data.steps.${index}.detail`,'Expected plain-text detail of at most 120 characters.');
  });
  if(labels.length===value.steps.length&&new Set(labels).size!==labels.length) fail('figure.data.steps','Flow-step labels must be unique.');
}
export function validatePresentationExtensions(value: Record<string,unknown>, path: string, _edition: 'adult'|'teen'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (name:string,message:string) => issues.push({path:`${path}.${name}`,code:'presentation-extension',message});
  if ('figure' in value) {
    const f = value.figure;
    if (!object(f)) fail('figure','Expected one structured figure.');
    else {
      const common = ['type','alt','caption','description','afterParagraph'];
      const structured=['seasons-orbit','process-flow','cycle-flow','comparison-bars',...TOOLKIT_TYPES].includes(String(f.type));
      keys(f,[...common,...(structured?['data']:f.type==='image'?['src','width','height']:[])],`${path}.figure`,issues);
      for(const [key,max] of [['alt',200],['caption',240],['description',900]] as const) if(!plain(f[key],max)) fail(`figure.${key}`,`Expected non-empty plain text (maximum ${max} characters).`);
      if(f.afterParagraph!==undefined && (!Number.isInteger(f.afterParagraph) || Number(f.afterParagraph)<1 || Number(f.afterParagraph)>50)) fail('figure.afterParagraph','Expected a prose paragraph position from 1 to 50.');
      if(TOOLKIT_TYPES.includes(String(f.type)) || (f.type==='comparison-bars' && object(f.data) && f.data.style==='proportional')) {
        for(const message of validateToolkitData(String(f.type), f.data)) fail('figure.data',message);
      } else if(f.type==='seasons-orbit') {
        if(!object(f.data)) fail('figure.data','Expected seasons diagram data.');
        else {
          keys(f.data,['tiltDegrees'],`${path}.figure.data`,issues);
          if(f.data.tiltDegrees!==23.4 && f.data.tiltDegrees!==23.5) fail('figure.data.tiltDegrees','Earth diagram tilt must be 23.4 or 23.5 degrees.');
        }
      } else if(f.type==='process-flow'||f.type==='cycle-flow') {
        validateSteps(f.data,path,f.type,issues,fail);
      } else if(f.type==='comparison-bars') {
        if(!object(f.data)) fail('figure.data','Expected structured comparison data.');
        else {
          keys(f.data,['style','items','unit'],`${path}.figure.data`,issues);
          if(f.data.style!=='doubling-growth') fail('figure.data.style','Expected the approved doubling-growth visual style.');
          if(f.data.unit!==undefined&&!plain(f.data.unit,40)) fail('figure.data.unit','Expected a plain-text unit of at most 40 characters.');
          if(!Array.isArray(f.data.items)||f.data.items.length!==3) fail('figure.data.items','The doubling-growth visual requires exactly three stages.');
          else {
            const labels:string[]=[];
            f.data.items.forEach((item,index)=>{
              if(!object(item)) { fail(`figure.data.items.${index}`,'Expected one structured comparison item.'); return; }
              keys(item,['label','value','display'],`${path}.figure.data.items.${index}`,issues);
              if(!plain(item.label,24)) fail(`figure.data.items.${index}.label`,'Expected a concise plain-text label of at most 24 characters.');
              else labels.push(normalise(item.label));
              if(typeof item.value!=='number'||!Number.isFinite(item.value)||item.value<0||item.value>1_000_000_000) fail(`figure.data.items.${index}.value`,'Expected a finite value from 0 to 1,000,000,000.');
              if(!plain(item.display,16)) fail(`figure.data.items.${index}.display`,'Expected a plain-text display value of at most 16 characters.');
            });
            if(labels.length===f.data.items.length&&new Set(labels).size!==labels.length) fail('figure.data.items','Comparison labels must be unique.');
            if(f.data.items.every(item=>object(item)&&item.value===0)) fail('figure.data.items','At least one comparison value must be greater than zero.');
          }
        }
      } else if(f.type==='image') {
        if(typeof f.src!=='string' || !LOCAL_FIGURE_PATH.test(f.src)) fail('figure.src','Expected a local /lesson-media/<name>.png or .webp path.');
        if(!Number.isInteger(f.width)||!Number.isInteger(f.height)||Number(f.width)<1||Number(f.height)<1||Number(f.width)>FIGURE_LIMITS.maxDimension||Number(f.height)>FIGURE_LIMITS.maxDimension||Number(f.width)*Number(f.height)>FIGURE_LIMITS.maxPixels) fail('figure','Image dimensions exceed the configured limits.');
      } else fail('figure.type','Unknown app-owned figure type.');
    }
  }
  if('activity' in value) {
    const a = value.activity;
    if(!object(a)) fail('activity','Expected a structured activity.');
    else {
      keys(a,['prompt','options','answer','explanation'],`${path}.activity`,issues);
      if(!plain(a.prompt,140)) fail('activity.prompt','Expected a plain-text prompt of at most 140 characters.');
      if(!Array.isArray(a.options)||a.options.length<2||a.options.length>4||!a.options.every(o=>plain(o,80))) fail('activity.options','Expected 2–4 plain-text choices of at most 80 characters each.');
      else if(new Set(a.options.map(normalise)).size!==a.options.length) fail('activity.options','Choices must be unique.');
      if(!Number.isInteger(a.answer)||!Array.isArray(a.options)||Number(a.answer)<0||Number(a.answer)>=a.options.length) fail('activity.answer','Expected a zero-based answer index within the choices.');
      if(!plain(a.explanation,400)) fail('activity.explanation','Expected a plain-text explanation of at most 400 characters.');
      if(typeof a.prompt==='string' && typeof value.question==='string' && normalise(a.prompt)===normalise(value.question)) fail('activity.prompt','The activity must not repeat the retrieval question.');
    }
  }
  return issues;
}
