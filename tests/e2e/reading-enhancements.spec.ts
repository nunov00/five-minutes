import {test,expect} from './support/fixtures';
const key='five-minutes.reader-state';
const seasons='/teen/why-earth-has-seasons';

test('recall follows the body and reveals answer and takeaway together in both editions',async({page})=>{
 for(const edition of ['adult','teen']){
  await page.goto(`/${edition}/goodharts-law`);
  await expect(page.locator('.lesson-figure')).toHaveCount(0);
  const answer=page.locator('[data-recall] .answer'),takeaway=page.getByRole('region',{name:'Takeaway',exact:true});
  await expect(answer).toBeHidden();await expect(takeaway).toBeHidden();
  expect(await page.evaluate(()=>!!(document.querySelector('.lesson-body')!.compareDocumentPosition(document.querySelector('[data-recall]')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.locator('[data-recall-reveal] > summary').click();
  await expect(answer).toBeVisible();await expect(takeaway).toBeVisible();
 }
});

test('Teen choices are unnumbered accessible radios, with keyboard selection and no stored answer',async({page})=>{
 await page.goto(seasons);const prompt=page.locator('[data-activity]');
 await expect(prompt).not.toHaveAttribute('open','');
 await prompt.getByText('What do you think?',{exact:true}).focus();await page.keyboard.press('Enter');
 await expect(prompt.getByText('Choose an option to see the explanation.')).toBeVisible();
 await expect(prompt.getByText('Decide before you reveal.')).toBeHidden();
 const radios=prompt.getByRole('radio');await expect(radios).toHaveCount(2);
 for(const input of await radios.all()){await expect(input).not.toBeChecked();expect(await input.locator('..').evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);}
 await radios.first().focus();await page.keyboard.press('ArrowDown');await expect(radios.last()).toBeChecked();await expect(radios.first()).not.toBeChecked();
 await expect(prompt.locator('[data-activity-selection]')).toHaveText('You chose: The Southern Hemisphere');
 await expect(prompt.locator('[data-activity-reveal]')).toHaveAttribute('open','');
 const state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);expect(Object.keys(state).sort()).toEqual(['appearance','edition','read','recent','saved','version']);expect(state.saved).toEqual([]);
 await page.goto('/adult/why-earth-has-seasons');await expect(page.locator('[data-activity]')).toHaveCount(0);
});

test('activities reset on reload, Back and the restoration handler without storing answers',async({page})=>{
 async function choose(){await page.getByText('What do you think?',{exact:true}).click();await page.getByRole('radio',{name:'The Northern Hemisphere',exact:true}).check();}
 async function reset(){await expect(page.locator('[data-activity]')).not.toHaveAttribute('open','');await expect(page.locator('[data-activity-reveal]')).not.toHaveAttribute('open','');for(const input of await page.getByRole('radio',{includeHidden:true}).all())await expect(input).not.toBeChecked();await expect(page.locator('[data-activity-selection]')).toHaveText('');}
 await page.goto(seasons);await choose();await page.reload();await reset();
 await choose();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Today',exact:true}).click();await page.goBack();await expect(page).toHaveURL(seasons);await reset();
 await choose();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await reset();
 const state=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key);expect(Object.keys(state).sort()).toEqual(['appearance','edition','read','recent','saved','version']);expect(state.saved).toEqual([]);
});

test('native figures, plain activity choices and answer/takeaway reveals work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});const page=await context.newPage();
 for(const path of ['/adult/why-earth-has-seasons',seasons,'/teen/goodharts-law','/teen/how-heat-pumps-move-heat','/teen/how-kidneys-filter-blood','/teen/why-exponential-growth-feels-sudden']){
  await page.goto('http://127.0.0.1:4321'+path);
  const activity=page.locator('[data-activity]');
  if(await activity.count()){
   await activity.getByText('What do you think?',{exact:true}).click();await expect(activity.locator('ul')).toBeVisible();await expect(activity.locator('fieldset')).toBeHidden();await expect(activity.getByText('Decide before you reveal.')).toBeVisible();
   await activity.getByText('Reveal the explanation',{exact:true}).click();await expect(activity.locator('[data-activity-reveal]')).toHaveAttribute('open','');
  }
  await page.locator('[data-recall-reveal] > summary').click();await expect(page.getByRole('region',{name:'Takeaway',exact:true})).toBeVisible();
  if(await page.locator('.lesson-figure').count()){await page.getByText('Explanation of this figure',{exact:true}).click();await expect(page.locator('.figure-description p')).toBeVisible();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await context.close();
});

test('reusable structured diagrams are accessible, bounded and responsive',async({page},testInfo)=>{
 const examples=[
  ['/teen/how-heat-pumps-move-heat','cycle-flow','heat-transfer',4,/four-step loop/],
  ['/teen/how-kidneys-filter-blood','process-flow','filter-reclaim',4,/rough draft of fluid/],
  ['/teen/why-exponential-growth-feels-sudden','comparison-bars','doubling-growth',3,/grows from 1 to 32/],
 ] as const;
 for(const width of [320,393,1440])for(const [path,type,style,count,label] of examples){
  await page.setViewportSize({width,height:width<1000?700:900});await page.goto(path);
  const figure=page.locator(`.lesson-figure[data-figure-type="${type}"]`);await expect(figure).toHaveCount(1);
  await expect(figure).toHaveAttribute('data-figure-style',style);
  await expect(figure.locator('[role="img"]')).toHaveAttribute('aria-label',label);
  await expect(figure.locator(type==='comparison-bars'?'.growth-map li':type==='cycle-flow'?'.cycle-step':'.filter-step')).toHaveCount(count);
  if(style==='filter-reclaim')await expect(figure.locator('.figure-stage')).toHaveCount(count);
  const box=await figure.boundingBox();expect(box?.height).toBeLessThan(width<1000?620:700);
  if(testInfo.project.name==='desktop-chromium')await figure.screenshot({path:testInfo.outputPath(`visual-${style}-${width}.png`),animations:'disabled'});
  const visual=await figure.evaluate(root=>{
   const bounds=root.getBoundingClientRect();
   const labels=[...root.querySelectorAll<HTMLElement>('[data-visual-label]')].map((element,index)=>{
    const box=element.getBoundingClientRect();return {index,left:box.left,top:box.top,right:box.right,bottom:box.bottom};
   });
   const collisions:string[]=[];
   for(let first=0;first<labels.length;first++)for(let second=first+1;second<labels.length;second++){
    const a=labels[first],b=labels[second];
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)collisions.push(`${a.index}:${b.index}`);
   }
   const outside=labels.filter(box=>box.left<bounds.left-1||box.right>bounds.right+1||box.top<bounds.top-1||box.bottom>bounds.bottom+1).map(box=>box.index);
   const clipped=[...root.querySelectorAll<HTMLElement>('[data-visual-copy]')].filter(element=>element.scrollWidth>element.clientWidth+1||element.scrollHeight>element.clientHeight+1).length;
   return {collisions,outside,clipped,pageOverflow:document.documentElement.scrollWidth>innerWidth};
  });
  expect(visual,{message:`${style} at ${width}px must contain every label without collisions, clipping or page overflow`}).toEqual({collisions:[],outside:[],clipped:0,pageOverflow:false});
 }
});

test('figure follows the opening on phones and sits alongside desktop prose in both themes',async({page})=>{
 for(const width of [320,393,1440])for(const edition of ['adult','teen'])for(const colorScheme of ['light','dark'] as const){
  await page.setViewportSize({width,height:width===320?568:900});await page.emulateMedia({colorScheme});await page.goto(`/${edition}/why-earth-has-seasons`);
  const figure=page.locator('.lesson-figure');await expect(figure).toHaveCount(1);await expect(figure.locator('[role="img"]')).toHaveAttribute('aria-label',/Earth keeps the same axis direction/);
  const positions=await page.evaluate(()=>{const a=document.querySelector('.figure-opening')!.getBoundingClientRect(),f=document.querySelector('.lesson-figure')!.getBoundingClientRect(),r=document.querySelector('.figure-rest')!.getBoundingClientRect();return {a:{x:a.x,bottom:a.bottom},f:{x:f.x,y:f.y,bottom:f.bottom},r:{y:r.y},overflow:document.documentElement.scrollWidth>innerWidth};});
  expect(positions.overflow).toBe(false);
  if(width<1000){expect(positions.f.y).toBeGreaterThanOrEqual(positions.a.bottom);expect(positions.r.y).toBeGreaterThanOrEqual(positions.f.bottom);}else expect(positions.f.x).toBeGreaterThan(positions.a.x);
 }
});

test('large text, forced colours and reduced motion preserve keyboard-accessible reading',async({page})=>{
 await page.setViewportSize({width:320,height:568});await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.goto(seasons);
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-recall-reveal] > summary').focus();await page.keyboard.press('Enter');await expect(page.locator('[data-recall] .answer')).toBeVisible();
});
