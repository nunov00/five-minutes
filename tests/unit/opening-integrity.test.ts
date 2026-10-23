import {describe,it,expect} from 'vitest';
import {verifyReadingOrder} from '../../scripts/reading-integrity.mjs';

const prose='<div class="lesson-body"><p>Opening observation.</p></div>';
const lead='<figure data-opening-lead><img src="/local.webp"/></figure>';
const early='<section data-opening-takeaway><h2 id="takeaway-heading">The short answer</h2><p>Insight.</p></section>';
const rest='<div class="lesson-body"><p>A deeper explanation.</p></div>';
const late='<section><h3 id="takeaway-heading">Takeaway</h3><p>Insight.</p></section>';
const recall=(takeaway='')=>`<section data-recall><h2>Recall</h2><p>Why?</p><details data-recall-reveal><summary>Reveal answer</summary><p class="answer">Because.</p>${takeaway}</details></section>`;
const standard=prose+rest+recall(late);
const first=`<article data-opening="answer-first">${prose}${lead}${early}${rest}${recall()}</article>`;

describe('whole-corpus reading-order check',()=>{
 it('accepts the original order and the source-selected answer-first order',()=>{
  expect(()=>verifyReadingOrder(standard)).not.toThrow();
  expect(()=>verifyReadingOrder(first,'answer-first')).not.toThrow();
 });
 it('cannot opt in merely by adding a marker to generated HTML',()=>{
  expect(()=>verifyReadingOrder(first)).toThrow();
  expect(()=>verifyReadingOrder(standard,'answer-first')).toThrow();
  expect(()=>verifyReadingOrder(first,'other')).toThrow();
 });
 it.each([
  (s:string)=>s.replace(early,''),
  (s:string)=>s.replace(early,early+early),
  (s:string)=>s.replace(early,'').replace(recall(),recall(late)),
  (s:string)=>s.replace(lead+early,early+lead),
  (s:string)=>s.replace(early+rest,rest+early),
  (s:string)=>s.replace('data-opening="answer-first"','data-opening="other"'),
  (s:string)=>s.replace('data-opening-lead','data-unrelated'),
  (s:string)=>s.replace(recall(),recall()+recall()),
  (s:string)=>s.replace('class="answer"','class="missing"'),
 ])('fails closed for missing, duplicate or misordered answer-first content %#',mutate=>{
  expect(()=>verifyReadingOrder(mutate(first),'answer-first')).toThrow();
 });
 it('retains the default reveal checks and rejects duplicates',()=>{
  for(const html of [prose+late+recall(),prose+rest+recall(),standard+late,standard.replace('<p class="answer">Because.</p>','')])expect(()=>verifyReadingOrder(html)).toThrow();
 });
});
