import type {Page} from '@playwright/test';
import {expect} from './fixtures';
export type Opening = 'answer-first' | undefined;

/** Expected mode comes from validated delivery data, not the DOM under test. */
export async function sourceOpening(page:Page):Promise<Opening>{
 const response=await page.request.get('/delivery.json');expect(response.ok()).toBe(true);
 const routes=(await response.json()).routes;
 const selected=routes.filter((r:{path:string})=>r.path===new URL(page.url()).pathname);
 expect(selected).toHaveLength(1);
 const mode=selected[0].opening;expect([undefined,'answer-first']).toContain(mode);return mode;
}

/** Preserve the full default contract and assert the reviewed opt-in contract separately. */
export async function checkReading(page:Page,opening:Opening,reveal:'click'|'keyboard'|false='click'){
 const recall=page.getByRole('region',{name:'Recall',exact:true}),answer=recall.locator('.answer');
 const heading=page.locator('#takeaway-heading'),early=page.locator('[data-opening-takeaway]');
 await expect(recall).toBeVisible();await expect(heading).toHaveCount(1);await expect(answer).toBeHidden();
 const summary=recall.locator('[data-recall-reveal] > summary');
 if(opening==='answer-first'){
  await expect(heading).toHaveText('The short answer');await expect(early).toHaveCount(1);await expect(early).toBeVisible();
  await expect(recall.locator('#takeaway-heading')).toHaveCount(0);
  await expect(summary).toHaveText('▸Reveal answer');
  expect(await early.evaluate(el=>{
   const lead=document.querySelector('[data-opening-lead]'),recall=document.querySelector('[data-recall]');
   return !!lead&&!!recall&&!!(lead.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(el.compareDocumentPosition(recall)&Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
 }else{
  await expect(heading).toHaveText('Takeaway');await expect(early).toHaveCount(0);await expect(heading).toBeHidden();
  await expect(recall.locator('[data-recall-reveal] #takeaway-heading')).toHaveCount(1);
  await expect(summary).toHaveText('▸Reveal answer and takeaway');
 }
 if(!reveal)return;
 if(reveal==='keyboard'){await summary.focus();await page.keyboard.press('Enter');}else await summary.click();
 await expect(answer).toBeVisible();await expect(heading).toBeVisible();await expect(heading).toHaveCount(1);
}
