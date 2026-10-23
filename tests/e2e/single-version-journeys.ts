import {checkReading,sourceOpening} from './support/reading';
import {expect,test} from './support/fixtures';
const key='five-minutes.reader-state',originKey='five-minutes.session-origin.v1';
export function singleVersionJourneys(){
test('first-visit discovery renders lessons directly and preserves path/query/hash',async({page})=>{
 await page.goto('/library/page/2?q=clock#main');await expect(page).toHaveURL('/library/page/2?q=clock#main');
 await expect(page.locator('.lesson-card')).not.toHaveCount(0);await expect(page.getByRole('navigation',{name:'Edition'})).toHaveCount(0);
 expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
 await page.goto('/topics/science');await expect(page.locator('.lesson-card')).not.toHaveCount(0);
});
test('former edition discovery URLs and Teen lesson links reach the single version',async({page})=>{
 for(const old of ['/editions/adult/library/page/2','/editions/teen/library/page/2']){
  await page.goto(old);await expect(page).toHaveURL('/library/page/2');await expect(page.locator('.lesson-card')).not.toHaveCount(0);
 }
 await page.goto('/teen/why-earth-has-seasons');await expect(page).toHaveURL('/adult/why-earth-has-seasons');
 await expect(page.locator('article[data-reader-lesson]')).toBeVisible();await expect(page).not.toHaveTitle(/edition/i);
});
test('Return preserves discovery context and rejects unsafe session destinations',async({page})=>{
 await page.goto('/library/page/2?from=test#main');await page.locator('.lesson-card h2 a').first().click();
 await expect(page.locator('[data-return]')).toHaveAttribute('href','/library/page/2?from=test#main');
 await page.locator('[data-return]').click();await expect(page).toHaveURL('/library/page/2?from=test#main');
 await page.goto('/search?q=clock');await expect(page.getByRole('status')).toContainText('lesson');await page.locator('.search-results h2 a').first().click();
 await expect(page.locator('[data-return]')).toHaveAttribute('href','/search?q=clock');
 await page.evaluate(k=>sessionStorage.setItem(k,JSON.stringify({version:1,path:'//evil.invalid/search'})),originKey);await page.reload();await expect(page.locator('[data-return]')).toHaveAttribute('href','/');
});
test('Back and restored discovery do not forward to a saved edition',async({page})=>{
 await page.goto('/');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Library',exact:true}).click();
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,edition:'teen',saved:[],read:{},recent:[],appearance:'system'})),key);
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await expect(page).toHaveURL('/library');
 await page.goBack();await expect(page).toHaveURL('/');
});
test('Search ignores old edition context and does not write a preference',async({page})=>{
 await page.goto('/search?q=clock&edition=teen');await expect(page.getByRole('status')).toContainText('lesson');
 await expect(page.getByRole('navigation',{name:'Edition'})).toHaveCount(0);expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
 await page.getByRole('searchbox').fill('season');await expect(page.getByRole('status')).toContainText('lesson');await expect(page).toHaveURL('/search?q=season');
});
test('blocked storage leaves discovery, reading and Return usable',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});Object.defineProperty(window,'sessionStorage',{get(){throw Error('blocked')}})});
 await page.goto('/topics');await expect(page.locator('.topic-card')).not.toHaveCount(0);await page.goto('/adult/why-earth-has-seasons');
 await expect(page.locator('.lesson-body').first()).toBeVisible();await expect(page.locator('[data-return]')).toHaveAttribute('href','/');
});
test('no-JavaScript discovery, reading, reveals and Surprise Me remain usable',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/library');await expect(page.locator('[data-surprise-edition]')).toHaveCount(1);
 await page.locator('.lesson-card h2 a').first().click();await expect(page.locator('article[data-reader-lesson]')).toBeVisible();
 await checkReading(page,await sourceOpening(page));
 await expect(page.locator('[data-return]')).toHaveAttribute('href','/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
test('canonical discovery and invalid legacy routes keep their SEO and 404 contracts',async({page})=>{
 await page.goto('/library');await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
 for(const path of ['/editions/kids/library','/editions/teen/library/page/01','/editions/teen/topics/not-a-topic'])expect((await page.request.get(path)).status()).toBe(404);
 await page.goto('/not-a-page');await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow');
 await page.getByRole('link',{name:'Go to the home page'}).click();await expect(page).toHaveURL('/');
});
test('unreadable reader data remains untouched until explicit warned reset',async({page})=>{
 for(const raw of ['{',JSON.stringify({version:3}),JSON.stringify({version:2,edition:'teen',saved:['bad'],read:{},recent:[],appearance:'dark'})]){
  await page.goto('/');await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key,raw});await page.goto('/library');
  await expect(page.locator('#preference-note')).toContainText('kept unchanged');expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBe(raw);
  await page.getByText('Recover local reader data',{exact:true}).click();await expect(page.getByText(/Resetting discards saved lessons/)).toBeVisible();
  await page.getByRole('button',{name:'Discard local reader data and reset'}).click();await expect(page.locator('#reader-recovery')).toBeHidden();
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key)).toEqual({version:2,edition:null,saved:[],read:{},recent:[],appearance:'system'});
 }
});
test('legacy duplicate saves and recents render once and unsave by identity',async({page})=>{
 await page.goto('/adult/why-earth-has-seasons');const id=await page.locator('[data-reader-lesson]').getAttribute('data-lesson-id');
 await page.evaluate(({key,id})=>localStorage.setItem(key,JSON.stringify({version:2,edition:'teen',saved:[{id,edition:'teen'},{id,edition:'adult'}],read:{},recent:[{id,edition:'teen',visitedAt:'2026-10-04T08:00:00Z'},{id,edition:'adult',visitedAt:'2026-10-03T08:00:00Z'}],appearance:'dark',extension:{kept:true}})),{key,id});
 await page.goto('/saved');await expect(page.locator('[data-saved-list] li')).toHaveCount(1);await expect(page.locator('[data-recent-list] li')).toHaveCount(1);
 await expect(page.locator('[data-saved-list] a')).toHaveAttribute('href','/adult/why-earth-has-seasons');await page.locator('[data-saved-list] a').click();
 await expect(page.getByRole('button',{name:'Save lesson'})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Save lesson'}).click();
 const state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);expect(state.saved).toEqual([]);expect(state.extension).toEqual({kept:true});
});

}
