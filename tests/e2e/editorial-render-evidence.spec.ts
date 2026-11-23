import {readFileSync} from 'node:fs';
import {loadPublishedLessons} from '../../src/lib/content/loader';
import {lessonVisuals} from '../../src/lib/figures/collection.mjs';
import {test,expect} from './support/fixtures';
import {checkReading,sourceOpening} from './support/reading';

const ownership=JSON.parse(readFileSync('src/content/route-ownership.json','utf8'));
const lessons=await loadPublishedLessons('src/content/lessons',ownership);
// Include intended future release dates: editorial evidence is needed before publication.
const latest=lessons.filter(l=>lessonVisuals(l.adult).some(v=>v.role==='lead'))
 .sort((a,b)=>Date.parse(b.metadata.revisedAt??b.metadata.publishedAt)-Date.parse(a.metadata.revisedAt??a.metadata.publishedAt)
  ||a.metadata.id.localeCompare(b.metadata.id))[0];

test('latest illustrated release has full no-script editorial renders and artwork derivatives',async({browser},info)=>{
 expect(latest,'An illustrated release must be available for evidence').toBeDefined();
 const presentation=latest.adult;
 if(!presentation)throw new Error('The selected release needs its active presentation.');
 const origin='http://127.0.0.1:4321';
 const route=`/adult/${latest.metadata.slug}`;
 const capture=info.project.name==='desktop-chromium';
 for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900},colorScheme});
  try{
   const page=await context.newPage();
   const response=await page.goto(origin+route);expect(response?.status()).toBe(200);
   await expect(page.getByRole('heading',{level:1})).toHaveText(presentation.title);
   await expect(page.locator('.lesson-sources li')).toHaveCount(latest.metadata.sources.length);
   const figures=page.locator('article .lesson-figure');
   await expect(figures).toHaveCount(lessonVisuals(presentation).length);
   for(const img of await figures.locator('img').all()){
    await img.scrollIntoViewIfNeeded();
    await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
   }
   const references=page.locator('article a[href^="#source-"]');
   for(const reference of await references.all()){
    const target=await reference.getAttribute('href');
    expect(target).toMatch(/^#source-[1-9][0-9]*$/);
    await expect(page.locator(target!)).toHaveCount(1);
   }
   if(await references.count()){
    await references.first().focus();await page.keyboard.press('Enter');
    await expect(page.locator(await references.first().getAttribute('href') as string)).toBeFocused();
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(capture)await page.screenshot({path:info.outputPath(`visual-editorial-${latest.metadata.slug}-${width}-${colorScheme}-noscript.png`),fullPage:true});
   for(const description of await page.locator('article .figure-description').all()){
    await description.locator('summary').click();await expect(description.locator('p')).toBeVisible();
   }
   await checkReading(page,await sourceOpening(page),'keyboard');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(capture&&width===393&&colorScheme==='light')await page.screenshot({path:info.outputPath(`visual-editorial-${latest.metadata.slug}-393-open-noscript.png`),fullPage:true});
   const share=await page.locator('meta[property="og:image"]').getAttribute('content');
   expect(share).toMatch(/^https:\/\/[^/]+\/visuals\/lesson-/);
   if(width===393){
    await page.goto(origin+'/library');
    const card=page.locator('.lesson-card').filter({has:page.locator(`a[href="${route}"]`)});
    const visited=new Set<string>();
    while(await card.count()===0){
     expect(visited.has(page.url()),'Library pagination must advance').toBe(false);visited.add(page.url());
     const next=page.getByRole('navigation',{name:'Library pages'}).getByRole('link',{name:'Next',exact:true});
     await expect(next,'The selected lesson must be reachable').toHaveCount(1);await next.click();
    }
    await expect(card).toHaveCount(1);await expect(card.getByRole('link')).toHaveAccessibleName(presentation.title);
    const thumbnail=card.locator('img');
    await thumbnail.scrollIntoViewIfNeeded();
    await expect.poll(()=>thumbnail.evaluate((el:HTMLImageElement)=>({loaded:el.complete,width:el.naturalWidth,height:el.naturalHeight}))).toEqual({loaded:true,width:480,height:320});
    if(capture)await card.screenshot({path:info.outputPath(`visual-editorial-card-${latest.metadata.slug}-393-${colorScheme}-noscript.png`)});
   }
   if(width===1440&&colorScheme==='light'){
    await page.goto(origin+new URL(share!).pathname);
    const image=page.locator('img');
    await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>({loaded:el.complete,width:el.naturalWidth,height:el.naturalHeight}))).toEqual({loaded:true,width:1200,height:630});
    if(capture)await image.screenshot({path:info.outputPath(`visual-editorial-share-${latest.metadata.slug}.png`)});
   }
  }finally{await context.close();}
 }
});
