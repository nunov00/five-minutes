import {checkReading} from './support/reading';
import {test,expect} from './support/fixtures';
test('five visual slots retain positions, labels and decoding across sizes and themes',async({page},info)=>{
 for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});await page.goto('/figure-fixtures/weekly/five');
  const figures=page.locator('article .lesson-figure');await expect(figures).toHaveCount(5);
  const sequence=await page.locator('.visual-sequence').evaluate(root=>[...root.querySelectorAll(':scope > .lesson-body > p, :scope > figure')].map(el=>el.matches('figure')?'figure':el.textContent?.trim()));
  expect(sequence).toEqual([
   expect.stringContaining('An illustration'),'figure',expect.stringContaining('The next figure'),'figure',
   expect.stringContaining('A third independently'),'figure',expect.stringContaining('A fourth figure'),'figure',
   expect.stringContaining('A fifth figure'),'figure']);
  for(const fig of await figures.all()){
   await fig.scrollIntoViewIfNeeded();await expect(fig.getByRole('img')).toHaveAccessibleName(/\S/);
   for(const img of await fig.locator('img').all())await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  }
  const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));expect(new Set(ids).size).toBe(ids.length);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(info.project.name==='desktop-chromium')await page.screenshot({path:info.outputPath(`visual-five-${width}-${colorScheme}.png`),fullPage:true});
 }
});
test('five positioned figures and their descriptions work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/figure-fixtures/weekly/five');await expect(page.locator('article .lesson-figure')).toHaveCount(5);
 const descriptions=page.locator('article .figure-description');
 for(const description of await descriptions.all()){await description.locator('summary').click();await expect(description.locator('p')).toBeVisible();}
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
test('answer-first keeps one visible takeaway after the lead and a later native answer reveal',async({page},info)=>{
 for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});await page.goto('/figure-fixtures/weekly/answer-first');
  await expect(page.locator('#takeaway-heading')).toHaveCount(1);
  await expect(page.locator('[data-opening-takeaway]')).toBeVisible();
  expect(await page.locator('.visual-sequence').evaluate(el=>[...el.children].map(n=>n.matches('figure')?'figure':n.hasAttribute('data-opening-takeaway')?'takeaway':n.textContent?.trim()).filter(Boolean))).toEqual([
   expect.stringContaining('An illustration'),'figure','takeaway',expect.stringContaining('The next figure'),'figure',expect.stringContaining('A third independently'),'figure']);
  await expect(page.locator('[data-recall] #takeaway-heading')).toHaveCount(0);
  await expect(page.locator('[data-recall] summary')).toHaveText('▸Reveal answer');
  await expect(page.locator('[data-recall] .answer')).toBeHidden();
  await checkReading(page,'answer-first');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const ids=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id));expect(new Set(ids).size).toBe(ids.length);
  if(info.project.name==='desktop-chromium')await page.screenshot({path:info.outputPath(`visual-opening-${width}-${colorScheme}.png`),fullPage:true});
 }
});
test('answer-first explanation and disclosure work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/figure-fixtures/weekly/answer-first');
 await expect(page.locator('[data-opening-takeaway]')).toBeVisible();await expect(page.locator('#takeaway-heading')).toHaveCount(1);
 await checkReading(page,'answer-first');
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
test('three positions, accessible artwork and illustrated card work across sizes and themes',async({page},info)=>{
 for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});await page.goto('/figure-fixtures/weekly/visuals');
  await expect(page.locator('.lesson-figure')).toHaveCount(3);
  expect(await page.locator('.visual-sequence').evaluate(el=>[...el.children].map(n=>n.matches('figure')?'figure':n.textContent?.trim()).filter(Boolean))).toEqual([
   expect.stringContaining('An illustration'),'figure',expect.stringContaining('The next figure'),'figure',expect.stringContaining('A third independently'),'figure']);
  for(const img of await page.locator('img').all()){await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);}
  for(const fig of await page.locator('.lesson-figure').all())await expect(fig.getByRole('img')).toHaveAccessibleName(/\S/);
  await expect(page.locator('.lesson-card-art')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const ids=await page.locator('[id]').evaluateAll(els=>els.map(e=>e.id));expect(new Set(ids).size).toBe(ids.length);
  if(info.project.name==='desktop-chromium')await page.screenshot({path:info.outputPath(`visual-weekly-${width}-${colorScheme}.png`),fullPage:true});
 }
});
test('canonical lessons have absolute article metadata and decoded fallback sharing; redirects do not',async({page,request})=>{
 await page.goto('/adult/why-earth-has-seasons');
 const image=await page.locator('meta[property="og:image"]').getAttribute('content');expect(image).toMatch(/^https:\/\/[^/]+\/visuals\/publication-/);
 expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toMatch(/\/adult\/why-earth-has-seasons$/);
 await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');
 const response=await request.get(new URL(image!).pathname);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toMatch(/^image\/(png|jpeg)/);
 const redirect=await request.get('/teen/why-earth-has-seasons');expect(await redirect.text()).not.toContain('property="og:image"');
});
test('three visual slots remain readable without JavaScript and with enlarged text',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/figure-fixtures/weekly/visuals');await expect(page.locator('.lesson-figure')).toHaveCount(3);
 await page.locator('.figure-description summary').first().click();await expect(page.locator('.figure-description p').first()).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});

test('lesson thumbnails sit beside titles in Library and Topics without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});
 const page=await context.newPage();
 for(const path of ['/library','/topics/science']){
  await page.goto(`http://127.0.0.1:4321${path}`);
  const card=page.locator('.lesson-card').filter({has:page.locator('a[href="/adult/why-popcorn-pops"]')});
  const image=card.locator('.lesson-thumbnail');
  await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  const art=await image.boundingBox(),copy=await card.locator('.lesson-row-copy').boundingBox();
  expect(art!.x+art!.width).toBeLessThan(copy!.x);
  await expect(card.getByRole('link')).toHaveAccessibleName('How a hard kernel becomes fluffy popcorn');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(path==='/library')await page.screenshot({path:info.outputPath('visual-library-thumbnails.png'),fullPage:true});
 }
 await context.close();
});

test('Search, Saved and Recent reuse the small lesson thumbnail',async({page},info)=>{
 await page.goto('/search?q=popcorn');
 const result=page.locator('.search-result').filter({has:page.locator('a[href="/adult/why-popcorn-pops"]')});
 await expect(result.locator('.lesson-thumbnail')).toHaveCount(1);
 await result.getByRole('link').click();
 await page.getByRole('button',{name:'Save lesson',exact:true}).click();
 await page.goto('/saved');
 for(const selector of ['[data-saved-list]','[data-recent-list]']){
  const row=page.locator(`${selector} li`).filter({has:page.locator('a[href="/adult/why-popcorn-pops"]')});
  const image=row.locator('.lesson-thumbnail');
  await expect(image).toHaveCount(1);await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveAttribute('src',/\/visuals\/lesson-why-popcorn-pops-.*\/thumbnail.webp$/);
  await expect(image).toHaveAttribute('alt','');
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
 }
 if(info.project.name==='mobile-iphone')await page.screenshot({path:info.outputPath('visual-saved-thumbnails.png'),fullPage:true});
 await page.goto('/search?q=seasons');
 const textOnly=page.locator('.search-result').filter({has:page.locator('a[href="/adult/why-earth-has-seasons"]')});
 await expect(textOnly).toBeVisible();await expect(textOnly.locator('.lesson-thumbnail')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
