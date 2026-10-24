import {test,expect} from './support/fixtures';
const route='/figure-fixtures/sources/references';

test('source references work in prose, captions and descriptions across sizes and themes',async({page},info)=>{
  for(const width of [320,393,1440])for(const colorScheme of ['light','dark'] as const){
    await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});await page.goto(route);
    await expect(page.getByRole('heading',{name:'Sources',exact:true})).toHaveCount(1);
    await expect(page.locator('.lesson-sources li')).toHaveCount(2);
    await expect(page.locator('.lesson-body a[aria-label="Source 1"]')).toHaveCount(2);
    await page.locator('figcaption a').click();
    expect(new URL(page.url()).hash).toBe('#source-2');await expect(page.locator('#source-2')).toBeInViewport();
    await expect(page.locator('#source-2')).toContainText('Abstract checked only');
    await page.locator('.figure-description summary').click();await page.locator('.figure-description a').click();
    expect(new URL(page.url()).hash).toBe('#source-1');
    await expect(page.locator('#source-1 > a')).toHaveAttribute('href','https://example.com/one?a=1&b=2');
    const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));expect(new Set(ids).size).toBe(ids.length);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(info.project.name==='desktop-chromium')await page.screenshot({path:info.outputPath(`visual-sources-${width}-${colorScheme}.png`),fullPage:true});
  }
});

test('source navigation remains available without JavaScript, with keyboard and enlarged text',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}}),page=await context.newPage();
  await page.goto('http://127.0.0.1:4321'+route);
  const reference=page.locator('.lesson-body a[aria-label="Source 1"]').first();
  await reference.focus();await page.keyboard.press('Enter');
  expect(new URL(page.url()).hash).toBe('#source-1');await expect(page.locator('#source-1')).toBeFocused();
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});

test('existing canonical lessons expose their recorded sources without invented citation markers',async({page})=>{
  await page.goto('/adult/why-gps-needs-einstein');
  await expect(page.getByRole('heading',{name:'Sources',exact:true})).toBeVisible();
  await expect(page.locator('#source-1')).toContainText('NASA');
  await expect(page.locator('.source-citation')).toHaveCount(0);
});
