import { expect, test } from './support/fixtures';

const key = 'five-minutes.reader-state';
const lesson = '/teen/why-earth-has-seasons';

test('lesson visits are read and recent, while Save is shared across editions', async ({page}) => {
  await page.goto(lesson);
  const id = await page.locator('[data-reader-lesson]').getAttribute('data-lesson-id');
  await expect(page.getByRole('button', {name:'Mark unread'})).toBeVisible();
  await page.getByRole('button', {name:'Save', exact:true}).click();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key)).toMatchObject({saved:[id], read:{[id!]:expect.any(String)}, recent:[{id,edition:'teen'}]});
  await page.goto('/adult/why-earth-has-seasons');
  await expect(page.getByRole('button', {name:'Saved', exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', {name:'Mark unread'}).click();
  expect(await page.evaluate(({key,id}) => JSON.parse(localStorage.getItem(key)!).read[id!], {key,id})).toBeUndefined();
});

test('Saved renders both editions, Recent preserves the visited edition, and markers appear', async ({page}) => {
  await page.goto(lesson); await page.getByRole('button', {name:'Save', exact:true}).click();
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Saved'}).click();
  await expect(page).toHaveURL('/saved');
  await expect(page.getByRole('heading', {name:'Saved and recent'})).toBeVisible();
  await expect(page.locator('[data-saved-list]')).toContainText('Adult'); await expect(page.locator('[data-saved-list]')).toContainText('Teen');
  await expect(page.locator('[data-recent-list]')).toContainText('Teen');
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link', {name:'Library', exact:true}).focus(); await page.keyboard.press('Enter'); await page.getByRole('link', {name:'Explore Teen', exact:true}).click();
  await expect(page.locator('[data-reader-markers]').filter({hasText:'Saved'}).first()).toBeVisible();
  await page.goto('/search?q=season&edition=teen'); await expect(page.getByRole('status')).toContainText('lesson');
  await expect(page.locator('[data-reader-markers]').filter({hasText:'Saved'}).first()).toBeVisible();
});

test('appearance persists and overrides the operating-system preference before content is read', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'}); await page.goto('/saved');
  await page.getByRole('radio', {name:'Light'}).check();
  await expect(page.locator('html')).toHaveAttribute('data-appearance','light');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-appearance','light');
  await page.getByRole('radio', {name:'System'}).check(); await expect(page.locator('html')).toHaveAttribute('data-appearance','system');
});

test('import requires confirmation, rejects invalid data, and replaces valid v1 data', async ({page}) => {
  await page.goto('/saved');
  const downloadPromise=page.waitForEvent('download'); await page.getByRole('button',{name:'Export data'}).click();
  const download=await downloadPromise; expect(download.suggestedFilename()).toBe('five-minutes-reader-data.json');
  const file = page.locator('[data-import-file]');
  await file.setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await page.getByRole('button', {name:'Import and replace'}).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-import-status]')).toContainText('Choose a file and confirm');
  await page.locator('[data-import-confirm]').check(); await page.getByRole('button', {name:'Import and replace'}).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-import-status]')).toContainText('not valid'); expect(await page.evaluate(k=>localStorage.getItem(k),key)).toBeNull();
  const valid={version:1,edition:'adult',saved:[],read:{},recent:[],appearance:'dark'};
  await file.setInputFiles({name:'five-minutes-reader-data.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});
  await page.locator('[data-import-confirm]').check(); await page.getByRole('button', {name:'Import and replace'}).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-import-status]')).toHaveText('Reader data imported.'); await expect(page.locator('html')).toHaveAttribute('data-appearance','dark');
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key)).toEqual(valid);
});

test('another tab refreshes Saved through the storage event', async ({page}) => {
  await page.goto('/saved'); await expect(page.locator('[data-saved-empty]')).toHaveText('No saved lessons yet.');
  const reading=await page.context().newPage(); await reading.goto(lesson); await reading.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('[data-saved-list] li')).toHaveCount(1); await reading.close();
});

test('blocked storage disables personal controls without changing content access', async ({page}) => {
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));
  await page.goto('/saved'); await expect(page.locator('[data-personal-status]')).toHaveText('Reader data is unavailable. It has not been changed.');
  await expect(page.getByRole('button',{name:'Export data'})).toBeDisabled(); await expect(page.getByRole('radio',{name:'System'})).toBeDisabled();
  await page.goto(lesson); await expect(page.locator('.lesson-body').first()).toBeVisible(); await expect(page.getByRole('button',{name:'Save'})).toHaveCount(0);
});

test('reader surfaces fail safely without JavaScript', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}}); const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/teen/why-earth-has-seasons');
  await expect(page.getByText('Saving and read markers need JavaScript.')).toBeVisible(); await expect(page.getByRole('button',{name:'Save'})).toHaveCount(0);
  await page.goto('http://127.0.0.1:4321/saved'); await expect(page.getByText(/Saved lessons, recent reading/)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow'); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});
