import { test, expect, type Page } from '@playwright/test';

const p='/design-preview',key='five-minutes-prototype-v1';
async function prefer(page:Page,edition:string){await page.addInitScript(({key,edition})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({edition}));},{key,edition});}
test('explicit shared edition wins; switch persists and Back keeps the explicit page',async({page})=>{
 await prefer(page,'adult');await page.goto(p+'/teen/why-earth-has-seasons');
 await expect(page.getByRole('heading',{level:1})).toHaveText('The Season Explanation That Fails Half the Planet');
 await expect(page.locator('#preference-bridge')).toBeVisible();
 await expect(page.locator('.wordmark')).toHaveAttribute('href',/\/editions\/teen$/);
 await page.locator('.edition-control').getByText('Adult',{exact:true}).click();
 await expect(page).toHaveURL(/\/adult\/why-earth-has-seasons$/);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
 await page.goBack();await expect(page).toHaveURL(/\/teen\/why-earth-has-seasons$/);
 await expect(page.locator('#preference-bridge')).toBeVisible();
 await page.locator('#bridge-make').click();await expect(page.locator('#preference-bridge')).toBeHidden();
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('teen');
});
test('neutral restore replaces the entry and keeps query and hash',async({page})=>{
 await prefer(page,'teen');await page.goto('/');await page.goto(p+'/search?q=tilt#main');
 await expect(page).toHaveURL(/\/editions\/teen\/search\?q=tilt#main$/);
 await expect(page.locator('#search-query')).toHaveValue('tilt');
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await page.goBack();await expect(page).toHaveURL(/\/\/?$/);
});
test('switch keeps archive page, shelf page and search query',async({page})=>{
 for(const suffix of ['library/page/7','topics/science/astronomy/page/2','search?q=seasons']){
  await page.goto(p+'/editions/adult/'+suffix);
  await page.locator('.edition-control').getByText('Teen',{exact:true}).click();
  await expect(page).toHaveURL(p+'/editions/teen/'+suffix);
 }
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await expect(page.locator('.row-title')).toHaveText('The Season Explanation That Fails Half the Planet');
});
test('answer and takeaway reveal together; Saved joins by identity across editions',async({page})=>{
 await page.goto(p+'/adult/goodharts-law');
 await expect(page.locator('.reveal-content')).toBeHidden();await expect(page.locator('.figure-column')).toHaveCount(0);
 await page.locator('.recall-reveal summary').click();await expect(page.locator('.takeaway')).toBeVisible();
 await page.locator('[data-save-id]').click();await page.locator('[data-read-id]').click();
 await page.locator('.edition-control').getByText('Teen',{exact:true}).click();
 await expect(page.locator('[data-save-id]')).toHaveAttribute('aria-pressed','true');
 await page.goto(p+'/editions/teen/saved');
 await expect(page.locator('.row-title')).toHaveText('Why Chasing the Score Can Ruin the Game');
 await expect(page.locator('.state-gutter')).toHaveAttribute('aria-label','Saved and read');
 await page.locator('[data-remove-id]').click();await expect(page.locator('.empty-state')).toBeVisible();
});
test('search query history, no results, error retry and stale completion',async({page})=>{
 await page.goto(p+'/editions/adult/search');
 await page.locator('#search-query').fill('seasons');await page.locator('#search-form button').click();
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await page.locator('#search-query').fill('zzzzxyz');await page.locator('#search-form button').click();
 await expect(page.locator('#search-status')).toContainText('No ideas found.');
 await page.goBack();await expect(page.locator('#search-query')).toHaveValue('seasons');
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await page.goto(p+'/editions/adult/search?q=seasons&network=error');
 await expect(page.locator('#search-retry')).toBeVisible();await page.locator('#search-retry').click();
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await expect(page.locator('.edition-control a').last()).not.toHaveAttribute('href',/network=error/);
 await page.goto(p+'/editions/adult/search?q=seasons&network=slow');
 await page.locator('#search-query').fill('proxy');await page.locator('#search-form button').click();
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
 await expect(page.locator('.row-title')).toHaveText('When a Useful Measure Becomes a Bad Target');
 await page.waitForTimeout(1400);await expect(page.locator('.row-title')).toHaveText('When a Useful Measure Becomes a Bad Target');
});
test('large search fixture has bounded results and retains context across editions',async({page})=>{
 await page.goto(p+'/editions/adult/search?q=synthetic&catalogue=10000');
 await expect(page.locator('#search-status')).toHaveText('10000 ideas found in the synthetic fixture.');
 await expect(page.locator('#search-results .lesson-row')).toHaveCount(24);
 await page.locator('[data-search-page]').click();await expect(page).toHaveURL(/page=2/);
 await expect(page.locator('.row-title').first()).toContainText('entry 25:');
 await page.locator('.edition-control').getByText('Teen',{exact:true}).click();
 await expect(page).toHaveURL(/\/editions\/teen\/search\?q=synthetic&catalogue=10000&page=2/);
 await expect(page.locator('.row-title').first()).toContainText('entry 25:');
});
test('storage denial leaves readable content and honest ephemeral state',async({page})=>{
 await page.goto(p+'/teen/goodharts-law?storage=blocked');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Why Chasing the Score Can Ruin the Game');
 await page.locator('[data-save-id]').click();await expect(page.locator('#storage-message')).toBeVisible();
 await expect(page.locator('#action-status')).toHaveText('Saved state changed for this visit only.');
 await page.locator('.edition-control').getByText('Adult',{exact:true}).click();
 await expect(page).toHaveURL(/\/adult\/goodharts-law\?storage=blocked/);
});
test('no-JavaScript edition navigation, recall, prediction and pagination work',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});const page=await ctx.newPage();
 await page.goto('http://127.0.0.1:4321'+p+'/teen/why-earth-has-seasons');
 await expect(page.locator('.prediction-plain')).toHaveCount(2);await expect(page.locator('.prediction-choice').first()).toBeHidden();
 await page.locator('#prediction-module > summary').click();await expect(page.locator('.prediction-plain').first()).toBeVisible();await page.locator('#prediction-reveal summary').click();await expect(page.locator('#prediction-reveal')).toHaveAttribute('open','');
 await page.locator('.recall-reveal summary').click();await expect(page.locator('.takeaway')).toBeVisible();
 await page.locator('.edition-control').getByText('Adult',{exact:true}).click();await expect(page).toHaveURL(/\/adult\/why-earth-has-seasons$/);
 await page.goto('http://127.0.0.1:4321'+p+'/editions/teen/library/page/7');await expect(page.locator('.lesson-row')).toHaveCount(24);
 await page.getByText('Next →',{exact:true}).click();await expect(page).toHaveURL(/\/library\/page\/8$/);
 await page.goto('http://127.0.0.1:4321'+p+'/editions/teen/search');await expect(page.getByText(/Search needs JavaScript\. You can explore/)).toBeVisible();
 await ctx.close();
});
test('320px layout, 200% text, dark themes and reduced motion',async({page})=>{
 await page.setViewportSize({width:320,height:800});
 for(const edition of ['adult','teen'])for(const scheme of ['light','dark'] as const){
  await page.emulateMedia({colorScheme:scheme,reducedMotion:'reduce'});
  for(const suffix of ['', '/library','/topics','/search','/preferences']){
   await page.goto(p+'/editions/'+edition+suffix);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const targets=await page.locator('.edition-control a,.preferences-link,.mobile-nav a').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));expect(targets.every(n=>n>=44)).toBe(true);
  }
  await page.goto(p+'/'+edition+'/why-earth-has-seasons');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.figure-column')).toBeVisible();
 }
});

test('cross-edition bridge preserves preference and returns to the same lesson',async({page})=>{
 await prefer(page,'adult');await page.goto(p+'/adult/goodharts-law');
 await page.locator('.cross-edition').click();await expect(page).toHaveURL(/\/teen\/goodharts-law$/);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!).edition,key)).toBe('adult');
 await expect(page.locator('#bridge-return')).toHaveAttribute('href',/\/adult\/goodharts-law$/);
 await page.locator('#bridge-return').click();await expect(page).toHaveURL(/\/adult\/goodharts-law$/);
});
test('phone first viewport exposes reading action and lesson opening; figure follows opening',async({page})=>{
 for(const viewport of [{width:375,height:667},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(const edition of ['adult','teen']){
   await page.goto(p+'/editions/'+edition);
   const nav=await page.locator('.mobile-nav').boundingBox();const action=await page.locator('.primary-action').boundingBox();
   expect(action!.y+action!.height).toBeLessThanOrEqual(nav!.y);
   await page.locator('.primary-action').click();
   const opening=await page.locator('.opening').boundingBox();const tabs=await page.locator('.mobile-nav').boundingBox();
   expect(opening!.y+24).toBeLessThan(tabs!.y);
   const figure=await page.locator('.figure-column').boundingBox();const continuation=await page.locator('.body-continuation').boundingBox();
   expect(figure!.y).toBeGreaterThanOrEqual(opening!.y+opening!.height);
   expect(continuation!.y).toBeGreaterThanOrEqual(figure!.y+figure!.height);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
});
test('skip link leads keyboard order and search reuses production word matching',async({page})=>{
 await page.goto(p+'/editions/adult/search');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
 await page.locator('#search-query').fill('art');await page.locator('#search-form button').click();
 await expect(page.locator('#search-status')).toContainText('No ideas found.');
 await page.locator('#search-query').fill('seasonx');await page.locator('#search-form button').click();
 await expect(page.locator('#search-status')).toHaveText('1 idea found.');
});
test('preference return keeps discovery query and Surprise skips the featured idea',async({page})=>{
 await prefer(page,'adult');await page.goto(p+'/editions/teen/search?q=seasons#main');
 await expect(page.locator('#bridge-return')).toHaveAttribute('href',/\/editions\/adult\/search\?q=seasons#main$/);
 await page.locator('#bridge-return').click();await expect(page).toHaveURL(/\/editions\/adult\/search\?q=seasons#main$/);
 await page.goto(p+'/editions/adult');
 const docs=await (await page.request.get(p+'/catalogue.json')).json();
 const featured=await page.locator('[data-featured-id]').getAttribute('data-featured-id');
 const index=docs.findIndex((l:{id:string})=>l.id===featured);
 await page.evaluate(value=>{Math.random=()=>value;},(index+.1)/docs.length);
 await page.locator('[data-surprise]').click();
 await expect(page).not.toHaveURL(/\/why-earth-has-seasons$/);
 await expect(page.locator('.lesson-ending')).toBeVisible();
});
