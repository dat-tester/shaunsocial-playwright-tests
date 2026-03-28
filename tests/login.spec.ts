import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

// ─── Login / Home ─────────────────────────────────────────────────────────────

test.describe('Login', () => {

  // TC-LOGIN-001
  test('TC-LOGIN-001: Home feed loads after login', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tc-login-001.png' });

    await expect(home.postComposerTrigger).toBeVisible({ timeout: 10000 });
    const sidebar = page.locator('nav, [role="navigation"], ul').first();
    await expect(sidebar).toBeVisible();
  });

  // TC-LOGIN-002
  test('TC-LOGIN-002: Feed displays posts with author and engagement buttons', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tc-login-002.png' });

    // Author username link
    const authorLink = page.locator('a[href*="@"]').first();
    await expect(authorLink).toBeVisible({ timeout: 10000 });

    // Like button
    const likeBtn = page.getByRole('button', { name: /likes?$/i }).first();
    await expect(likeBtn).toBeVisible({ timeout: 8000 });

    // Comment button
    const commentBtn = page.getByRole('button', { name: /comment/i }).first();
    await expect(commentBtn).toBeVisible({ timeout: 5000 });
  });

});
