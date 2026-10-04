import type { Page } from '@playwright/test';
import {expect,test} from './support/fixtures';
const key='five-minutes.reader-state',originKey='five-minutes.session-origin.v1';
async function prefer(page:Page,edition:string){await page.addInitScript(({key,edition})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({version:1,edition,saved:[],read:{},recent:[],appearance:'system'}));},{key,edition});}
test('first-visit neutral chooser and preference forwarding preserve path/query/hash',async({page})=>{
 await page.goto('/library/page/2?q=clock#main');await expect(page.getByText('Choose the edition you would like to explore.')).toBeVisible();
 await page.getByRole('link',{name:'Explore Teen',exact:true}).click();await expect(page).toHaveURL('/editions/teen/library/page/2?q=clock#main');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('teen');
 await page.goto('/topics/science?from=library#main');await expect(page).toHaveURL('/editions/teen/topics/science?from=library#main');
 await page.goto('/');await expect(page).toHaveURL('/');await expect(page.getByRole('link',{name:/^Read the Adult edition/})).toBeVisible();await expect(page.getByRole('link',{name:/^Read the Teen edition/})).toBeVisible();
});
test('explicit routes and alternate version do not write preference; selector adds history',async({page})=>{
 await prefer(page,'adult');await page.goto('/teen/why-earth-has-seasons');
 await expect(page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Teen',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Read the other version →'}).click();await expect(page).toHaveURL('/adult/why-earth-has-seasons');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
 await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Teen',exact:true}).click();await expect(page).toHaveURL('/teen/why-earth-has-seasons');
 await page.goBack();await expect(page).toHaveURL('/adult/why-earth-has-seasons');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('teen');
});
test('selector writes the final envelope and preserves pagination',async({page})=>{
 await page.goto('/editions/adult/library/page/2');await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Teen',exact:true}).click();
 await expect(page).toHaveURL('/editions/teen/library/page/2');expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key)).toEqual({version:1,edition:'teen',saved:[],read:{},recent:[],appearance:'system'});
 await page.goto('/editions/adult/topics/science');await expect(page).toHaveURL('/editions/adult/topics/science');expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('teen');
});
test('Return is a session link to discovery, including Search query and invalid-origin fallback',async({page})=>{
 await page.goto('/editions/teen/library/page/2?from=test#main');const first=page.locator('.lesson-card h2 a').first();await first.click();
 await expect(page.locator('[data-return]')).toHaveAttribute('href','/editions/teen/library/page/2?from=test#main');await page.locator('[data-return]').click();await expect(page).toHaveURL('/editions/teen/library/page/2?from=test#main');
 await page.goto('/search?q=clock&edition=teen');await expect(page.getByRole('status')).toContainText('lesson');await page.locator('.search-results h2 a').first().click();
 await expect(page.locator('[data-return]')).toHaveAttribute('href','/search?q=clock&edition=teen');
 await page.evaluate(k=>sessionStorage.setItem(k,JSON.stringify({version:1,path:'//evil.invalid/search'})),originKey);await page.reload();await expect(page.locator('[data-return]')).toHaveAttribute('href','/');
});
test('blocked storage still navigates and explains non-persistence',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});Object.defineProperty(window,'sessionStorage',{get(){throw Error('blocked');}});});
 await page.goto('/topics');await page.getByRole('link',{name:'Explore Teen',exact:true}).click();await expect(page).toHaveURL('/editions/teen/topics');await expect(page.locator('#preference-note')).toBeVisible();
 await page.goto('/teen/why-earth-has-seasons');await expect(page.locator('[data-return]')).toHaveAttribute('href','/');
 await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Adult',exact:true}).click();await expect(page).toHaveURL('/adult/why-earth-has-seasons');
});
test('neutral restoration re-checks preference and replacement leaves the previous page reachable',async({page})=>{
 await page.goto('/');await page.goto('/library');await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,edition:'teen',saved:[],read:{},recent:[],appearance:'system'})),key);
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await expect(page).toHaveURL('/editions/teen/library');await page.goBack();await expect(page).toHaveURL('/');
});
test('Search has no default and local edition setting never writes preference',async({page})=>{
 await page.goto('/search?q=clock');await expect(page.getByRole('status')).toHaveText('Choose Adult or Teen to search.');await page.getByRole('radio',{name:'Teen',exact:true}).check();await expect(page.getByRole('status')).toContainText('lesson');
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Adult',exact:true}).click();await expect(page).toHaveURL(/\/search\?q=clock&edition=adult/);expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
});
test('no-JavaScript chooser, explicit routes and Return fallback remain usable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/library');await page.getByRole('link',{name:'Explore Teen',exact:true}).click();await expect(page).toHaveURL(/\/editions\/teen\/library$/);await expect(page.locator('[data-surprise-edition]')).toHaveCount(1);await expect(page.locator('[data-surprise-edition]')).toHaveAttribute('href',/\/teen\/[^/]+$/);await page.locator('.lesson-card h2 a').first().click();await expect(page.locator('[data-return]')).toHaveAttribute('href','/');await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition','teen');
 await expect(page.getByText('Edition links work, but your choice will not be remembered without JavaScript.')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});

test('neutral SEO and invalid edition routes preserve the static contract',async({page})=>{
 await page.goto('/library');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow');await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
 await page.goto('/editions/teen/library');await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
 for(const path of ['/editions/kids/library','/editions/teen/library/page/01','/editions/teen/topics/not-a-topic'])expect((await page.request.get(path)).status()).toBe(404);
});


test('the first chooser choice replaces the handoff so one Back reaches Today', async ({page}) => {
 for (const route of ['Library','Topics']) {
  await page.goto('/');
  await page.evaluate(k => localStorage.removeItem(k), key);
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:route, exact:true}).click();
  await page.getByRole('link', {name:'Explore Teen', exact:true}).click();
  await expect(page).toHaveURL(`/editions/teen/${route.toLowerCase()}`);
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', {name:"Today's idea",exact:true})).toBeVisible();
 }
 // The same initial handoff applies to the header selector on the chooser.
 await page.evaluate(k => localStorage.removeItem(k), key);
 await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Library', exact:true}).click();
 await page.getByRole('navigation', {name:'Edition'}).getByRole('link', {name:'Adult',exact:true}).click();
 await expect(page).toHaveURL('/editions/adult/library');
 await page.goBack(); await expect(page).toHaveURL('/');
});

test('write failures use a session notice without contaminating shared links', async ({page,browser}) => {
 await page.addInitScript(() => {
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function(k,v) {
   if(this === localStorage) throw Error('quota');
   original.call(this,k,v);
  };
 });
 await page.goto('/library');
 await page.getByRole('link', {name:'Explore Teen',exact:true}).click();
 await expect(page).toHaveURL('/editions/teen/library');
 await expect(page.locator('#preference-note')).toBeVisible();
 expect(await page.evaluate(() => sessionStorage.getItem('five-minutes.session-preference-notice.v1'))).toBeNull();
 const url = page.url();
 const other = await browser.newContext(); const shared = await other.newPage();
 await shared.goto(url); await expect(shared.locator('#preference-note')).toBeHidden();
 await other.close();
 await page.getByRole('navigation', {name:'Edition'}).getByRole('link', {name:'Adult',exact:true}).click();
 await expect(page).toHaveURL('/editions/adult/library');
 await expect(page.locator('#preference-note')).toBeVisible();
});

test('unreadable reader data is preserved until an explicit warned reset', async ({page}) => {
 for (const raw of ['{',JSON.stringify({version:2,saved:['future-data']})]) {
  await page.goto('/'); await page.evaluate(({key,raw}) => localStorage.setItem(key,raw),{key,raw});
  await page.goto('/library');
  await expect(page.locator('#preference-note')).toContainText('kept unchanged');
  await page.getByRole('link', {name:'Explore Teen',exact:true}).click();
  expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(raw);
  await page.getByText('Recover local reader data',{exact:true}).click();
  await expect(page.getByText(/Resetting discards saved lessons/)).toBeVisible();
  await page.getByRole('button', {name:'Discard local reader data and reset'}).click();
  await expect(page.locator('#reader-recovery')).toBeHidden();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key)).toEqual({version:1,edition:null,saved:[],read:{},recent:[],appearance:'system'});
  await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Adult',exact:true}).click();
  await expect(page).toHaveURL('/editions/adult/library');
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
 }
});

test('Library Surprise Me follows its edition without changing preference', async ({page}) => {
 await prefer(page,'adult');await page.goto('/editions/teen/library');
 await expect(page.locator('[data-surprise-edition]')).toHaveCount(1);
 await expect(page.locator('.lesson-card [aria-label^="Editions for"]')).toHaveCount(0);
 await page.getByRole('link',{name:'Surprise me · Teen',exact:true}).click();
 await expect(page).toHaveURL(/\/teen\/[^/]+$/);
 await page.waitForLoadState('load');
 await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition','teen');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
});

test('404 is noncanonical and edition choices retain the destination edition', async ({page}) => {
 await page.goto('/not-a-page?q=clock#main');
 await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow');
 await page.getByRole('navigation',{name:'Edition'}).getByRole('link',{name:'Teen',exact:true}).click();
 await expect(page).toHaveURL('/search?q=clock&edition=teen#main');
});
