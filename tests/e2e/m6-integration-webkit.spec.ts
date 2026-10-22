import {expect,test} from './support/fixtures';
// These core journeys must also pass in the Safari engine.
import {singleVersionJourneys} from './single-version-journeys';
singleVersionJourneys();
test.describe('single-version WebKit integration',()=>{
 test('safe activity controls reset after reload and reader saves persist',async({page})=>{
  await page.goto('/figure-fixtures/toolkit');const activity=page.locator('[data-activity]');await activity.getByText('What do you think?',{exact:true}).click();
  await activity.getByRole('radio',{name:'The Southern Hemisphere',exact:true}).check();await expect(activity.locator('[data-activity-reveal]')).toHaveAttribute('open','');
  await page.reload();await expect(activity).not.toHaveAttribute('open','');for(const radio of await activity.getByRole('radio',{includeHidden:true}).all())await expect(radio).not.toBeChecked();
  await page.goto('/adult/why-earth-has-seasons');await page.getByRole('button',{name:'Save lesson',exact:true}).click();await page.reload();
  await expect(page.getByRole('button',{name:'Save lesson',exact:true})).toHaveAttribute('aria-pressed','true');
 });
  test('appearance, focus order and enlarged text remain usable at 320 CSS pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/saved');
    await page.locator('.reader-settings > summary').click();
    await page.getByRole('radio', { name: 'Dark' }).check();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

    for (const edition of ['adult']) {
      await page.goto(`/${edition}/why-earth-has-seasons`);
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('[data-recall-reveal] > summary').focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('region', { name: 'Takeaway', exact: true })).toBeVisible();
    }
  });
});
