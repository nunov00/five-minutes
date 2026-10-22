import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { test, expect } from './support/fixtures';
import { formatEditorialDate } from '../../src/lib/today';

for (const slug of ['why-a-day-is-longer-than-earths-spin','why-every-rainbow-is-a-circle','why-lakes-freeze-from-the-top-down']) {
 const metadata=parse(readFileSync(`src/content/lessons/2026/${slug}/lesson.yaml`,'utf8'));
 test(`recovered publication dates: ${slug}`,async({page},testInfo)=>{
  for(const width of [320,393,1440])for(const edition of ['adult']){
   await page.setViewportSize({width,height:900});await page.goto(`/${edition}/${slug}`);
   const header=page.locator('.reader-header');const dates=header.locator('.eyebrow');
   await expect(dates).toContainText(formatEditorialDate(metadata.publishedAt));
   await expect(dates).not.toContainText(formatEditorialDate(metadata.archive.catalogueDate));
   await expect(dates).not.toContainText(/Archive|Adapted/);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   if(testInfo.project.name==='desktop-chromium')await header.screenshot({path:testInfo.outputPath(`visual-dates-${slug}-${edition}-${width}.png`),animations:'disabled'});
  }
 });
}
