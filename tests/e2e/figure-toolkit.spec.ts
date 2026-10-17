import { test,expect } from './support/fixtures';
import { loadPublishedLessons } from '../../src/lib/content/loader';
import { readFileSync } from 'node:fs';
const routeOwnership=JSON.parse(readFileSync('src/content/route-ownership.json','utf8'));

test('toolkit figures remain readable and proportional on phones and desktop',async({page},testInfo)=>{
 for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});
  await page.goto('/figure-fixtures/toolkit');
  await expect(page.locator('.lesson-figure')).toHaveCount(7);
  for(const figure of await page.locator('.lesson-figure').all()){
   await expect(figure.getByRole('img')).toHaveAccessibleName(/\S/);
   const geometry=await figure.evaluate(root=>{
    const bounds=root.getBoundingClientRect(),labels=[...root.querySelectorAll('[data-visual-label]')].map(el=>el.getBoundingClientRect());
    let collisions=0;for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)if(Math.min(labels[i].right,labels[j].right)-Math.max(labels[i].left,labels[j].left)>1&&Math.min(labels[i].bottom,labels[j].bottom)-Math.max(labels[i].top,labels[j].top)>1)collisions++;
    return {collisions,outside:labels.filter(b=>b.left<bounds.left-1||b.right>bounds.right+1||b.top<bounds.top-1||b.bottom>bounds.bottom+1).length,clipped:[...root.querySelectorAll<HTMLElement>('[data-visual-copy]')].filter(el=>el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1).length,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   expect(geometry).toEqual({collisions:0,outside:0,clipped:0,overflow:false});
  }
  const lengths=await page.locator('.proportional-track span').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().width));
  expect(lengths[0]).toBe(0);expect(lengths[2]).toBeCloseTo(2*lengths[1],0);
  if(testInfo.project.name==='desktop-chromium'){
   for(let index=0;index<7;index++)await page.locator(`[data-fixture="${index}"]`).screenshot({path:testInfo.outputPath(`visual-toolkit-${index}-${width}-${colorScheme}.png`),animations:'disabled'});
  }
 }
});

test('toolkit figures remain available without scripts and with enlarged text',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:700}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4321/figure-fixtures/toolkit');
 await expect(page.locator('.lesson-figure')).toHaveCount(7);
 await page.locator('.figure-description summary').first().click();await expect(page.locator('.figure-description p').first()).toBeVisible();
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});

// Every original daily raster gets the same decoding/size evidence as archive imports.
const rasterLessons=(await loadPublishedLessons('src/content/lessons',routeOwnership)).filter(l=>!l.metadata.archive&&(l.adult?.figure?.type==='image'||l.teen?.figure?.type==='image'));
for(const lesson of rasterLessons)for(const edition of ['adult','teen'] as const){
 const figure=lesson[edition]?.figure;if(figure?.type!=='image')continue;
 test(`daily raster ${edition}/${lesson.metadata.slug} loads at declared dimensions`,async({page},testInfo)=>{
  for(const width of [320,393,1440]){
   await page.setViewportSize({width,height:900});await page.goto(`/${edition}/${lesson.metadata.slug}`);
   const image=page.locator('.lesson-figure img');await image.scrollIntoViewIfNeeded();
   await expect(image).toHaveAttribute('alt',figure.alt);
   await expect.poll(()=>image.evaluate(el=>({loaded:(el as HTMLImageElement).complete,width:(el as HTMLImageElement).naturalWidth,height:(el as HTMLImageElement).naturalHeight}))).toEqual({loaded:true,width:figure.width,height:figure.height});
   if(testInfo.project.name==='desktop-chromium')await page.locator('.lesson-figure').screenshot({path:testInfo.outputPath(`visual-daily-${edition}-${lesson.metadata.slug}-${width}.png`)});
  }
 });
}
