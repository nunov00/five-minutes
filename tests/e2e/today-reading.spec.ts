import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';
interface Route {path:string;lessonId:string;edition:'adult';slug:string}
async function deliveryRoutes(page:Page):Promise<Route[]>{const response=await page.request.get('/delivery.json');expect(response.ok()).toBe(true);return (await response.json()).routes;}
async function expectNoHorizontalOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(0);}
test.describe('Home and the single lesson',()=>{
 test('shows one latest lesson and three earlier links without an edition choice',async({page})=>{
  const routes=await deliveryRoutes(page);await page.goto('/');
  const today=page.locator('[data-lesson-id]').first(),id=await today.getAttribute('data-lesson-id');
  const current=routes.filter(route=>route.lessonId===id);expect(current).toHaveLength(1);
  await expect(page.locator('[data-today-edition]')).toHaveCount(1);
  await expect(page.getByRole('link',{name:/^Read:/})).toHaveAttribute('href',current[0].path);
  await expect(page.getByRole('navigation',{name:'Edition'})).toHaveCount(0);
  await expect(page.locator('[data-earlier-id]')).toHaveCount(3);
  await expect(page.locator('[data-earlier-id] .earlier-links a')).toHaveCount(3);
  const times=today.locator(':scope > .eyebrow time');expect(await times.count()).toBeGreaterThanOrEqual(1);
  for(const time of await times.all())await expect(time).toHaveText(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  await expect(page.getByRole('link',{name:'Surprise me'})).toHaveCount(1);await expectNoHorizontalOverflow(page);
 });
 test('an old Teen preference cannot select a hidden or second lesson',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('five-minutes.reader-state',JSON.stringify({version:1,edition:'teen',saved:[],read:{},recent:[],appearance:'dark'})));
  await page.goto('/');await expect(page.locator('[data-today-edition]')).toHaveCount(1);await expect(page.locator('[data-today-edition]')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-appearance','dark');
  await page.getByRole('link',{name:/^Read:/}).click();await expect(page).toHaveURL(/\/adult\//);
  await expect(page).not.toHaveTitle(/edition/i);
  const recall=page.getByRole('region',{name:'Recall',exact:true});await expect(recall.locator('.answer')).toBeHidden();
  await recall.getByText('Reveal answer and takeaway').click();await expect(recall.locator('.answer')).toBeVisible();
  await expect(page.getByRole('region',{name:'Takeaway',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Back to home'}).click();await expect(page).toHaveURL('/');
 });
 test('unreadable legacy state is preserved and does not change the initial appearance',async({page})=>{
  const raw=JSON.stringify({version:1,edition:'teen',saved:['bad'],read:{},recent:[],appearance:'dark'});
  await page.addInitScript(raw=>localStorage.setItem('five-minutes.reader-state',raw),raw);await page.goto('/');
  await expect(page.locator('[data-today-edition]')).toBeVisible();await expect(page.locator('html')).not.toHaveAttribute('data-appearance','dark');
  expect(await page.evaluate(()=>localStorage.getItem('five-minutes.reader-state'))).toBe(raw);await expect(page.locator('#reader-recovery')).toBeVisible();
 });
  test('sampled reading pages have one title heading and recall-before-takeaway', async ({ page }) => {
    // Static verification checks every built lesson; sample one route per edition here.
    const routes=await deliveryRoutes(page);
    for (const route of routes.slice(0,2)) {
      const response = await page.goto(route.path);
      expect(response?.ok(), route.path).toBe(true);
      await expect(page.locator('article[data-lesson-id]')).toHaveAttribute('data-edition', route.edition);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.getByRole('region', { name: 'Recall',exact:true })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Takeaway',exact:true })).toBeHidden();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('the answer can be revealed with the keyboard', async ({ page }) => {
    const [route] = await deliveryRoutes(page);
    await page.goto(route.path);
    const summary = page.getByText('Reveal answer and takeaway');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.answer')).toBeVisible();
  });

  test('follows the system dark colour scheme', async ({ page }) => {
    const [route] = await deliveryRoutes(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(route.path);
    const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: 'dark' });
    const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(dark).not.toBe(light);
  });
});
