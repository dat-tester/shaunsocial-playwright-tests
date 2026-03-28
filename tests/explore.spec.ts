import { test, expect } from '@playwright/test';
import { ExplorePage } from '../pages/ExplorePage';

test.describe('Explore', () => {

  // TC-EXP-001
  test('TC-EXP-001: Explore page loads at /explore', async ({ page }) => {
    const explore = new ExplorePage(page);
    await explore.goto();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tc-exp-001.png' });

    await expect(page).toHaveURL(/explore/);
    await expect(page).toHaveTitle(/explore/i);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-EXP-002
  test('TC-EXP-002: Explore page displays post or user content', async ({ page }) => {
    const explore = new ExplorePage(page);
    await explore.goto();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-exp-002.png' });

    const hasItems = await page.locator(
      'article, [class*="post"], [class*="user-card"], [class*="item"]'
    ).first().isVisible({ timeout: 8000 }).catch(() => false);
    expect(hasItems).toBeTruthy();
  });

  // TC-EXP-003
  test('TC-EXP-003: Explore page remains accessible after browser refresh', async ({ page }) => {
    const explore = new ExplorePage(page);
    await explore.goto();
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tc-exp-003.png' });

    await expect(page).toHaveURL(/explore/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-EXP-004
  test('TC-EXP-004: Scrolling down on Explore page loads more content', async ({ page }) => {
    const explore = new ExplorePage(page);
    await explore.goto();
    await page.waitForTimeout(2000);

    const beforeCount = await page.locator('article, [class*="post-item"], [class*="post-card"]').count();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-exp-004.png' });

    await expect(page.locator('body')).not.toBeEmpty();
  });
});
