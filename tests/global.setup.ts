import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../site.config';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

const USER_EMAIL = TEST_USER_EMAIL;
const USER_PASSWORD = TEST_USER_PASSWORD;

setup('authenticate as test user', async ({ page }) => {
  await page.goto('./');
  await page.waitForLoadState('domcontentloaded');

  // Fill credentials using real accessible names from the DOM
  await page.getByRole('textbox').first().fill(USER_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Dismiss notification dialog if present (push notifications prompt)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const blockBtn = page.getByRole('button', { name: 'Block' });
  if (await blockBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await blockBtn.click();
  }

  // Verify login succeeded — "Add New" button only appears when authenticated
  await expect(page.getByRole('button', { name: 'Add New' }).first()).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: authFile });
  console.log('Auth state saved to', authFile);
});
