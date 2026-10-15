import { expect, test } from './support/fixtures';

const key = 'five-minutes.reader-state';
const lesson = '/teen/why-earth-has-seasons';

test('lesson visits are read and recent, while Save is presentation-specific', async ({page}) => {
  await page.goto(lesson);
  const id = await page.locator('[data-reader-lesson]').getAttribute('data-lesson-id');
  await expect(page.getByRole('button', {name:'Mark unread'})).toBeVisible();
  const save=page.getByRole('button', {name:'Save lesson', exact:true}); await save.click();
  await expect(save).toHaveAttribute('aria-pressed','true'); await expect(save).toHaveText('Save lesson');
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), key)).toMatchObject({version:2,saved:[{id,edition:'teen'}], read:{[id!]:expect.any(String)}, recent:[{id,edition:'teen'}]});
  await page.goto('/adult/why-earth-has-seasons');
  await expect(page.getByRole('button', {name:'Save lesson', exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button', {name:'Mark unread'}).click();
  await expect(page.getByRole('button', {name:'Mark read'})).not.toHaveAttribute('aria-pressed',/.+/);
  expect(await page.evaluate(({key,id}) => JSON.parse(localStorage.getItem(key)!).read[id!], {key,id})).toBeUndefined();
});

test('Saved renders only the saved presentation without redundant edition labels', async ({page}) => {
  await page.goto(lesson); await page.getByRole('button', {name:'Save lesson', exact:true}).click();
  await page.getByRole('navigation', {name:'Main navigation'}).getByRole('link', {name:'Saved'}).click();
  await expect(page).toHaveURL('/saved');
  await expect(page.getByRole('heading', {name:'Saved and recent'})).toBeVisible();
  await expect(page.locator('[data-saved-list]')).toContainText('The Season Explanation That Fails Half the Planet');
  await expect(page.locator('[data-saved-list]')).not.toContainText('Why Summer Is Not Earth Moving Closer to the Sun');
  await expect(page.locator('[data-saved-list]')).not.toContainText('Teen:');
  await expect(page.locator('[data-recent-list]')).not.toContainText('Teen ·');
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

test('import requires confirmation, rejects invalid data, and migrates valid v1 data', async ({page}) => {
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
  expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),key)).toEqual({...valid,version:2});
});

test('another tab refreshes Saved through the storage event', async ({page}) => {
  await page.goto('/saved'); await expect(page.locator('[data-saved-empty]')).toHaveText('No saved lessons yet.');
  const reading=await page.context().newPage(); await reading.goto(lesson); await reading.getByRole('button',{name:'Save lesson',exact:true}).click();
  await expect(page.locator('[data-saved-list] li')).toHaveCount(1); await reading.close();
});

test('write failures are explained and controls return to stored state', async ({page}) => {
  await page.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===localStorage)throw Error('full');original.call(this,k,v);};});
  await page.goto(lesson); await expect(page.locator('#preference-note')).toContainText('could not be saved');
  await page.getByRole('button',{name:'Save lesson'}).click(); await expect(page.locator('#preference-note')).toBeVisible();
  await page.goto('/saved'); await page.getByRole('radio',{name:'Light'}).click();
  await expect(page.getByRole('radio',{name:'System'})).toBeChecked(); await expect(page.locator('#preference-note')).toContainText('will not be remembered');
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
  await expect(page.getByText('Loading saved lessons…')).toBeHidden(); await expect(page.getByText('Saved lessons need JavaScript to appear here.')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,follow'); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});
