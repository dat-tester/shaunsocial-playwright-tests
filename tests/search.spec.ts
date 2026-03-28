import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

test.describe('Search', () => {

  // TC-SRCH-001
  test('TC-SRCH-001: Search via URL returns results page', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchViaURL('admin');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-srch-001.png' });

    await expect(page).toHaveURL(/search/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-SRCH-002
  test('TC-SRCH-002: Search for an existing user returns results', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill('admin');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/search/);
    await expect(page.getByText(/Search: admin/i)).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: 'tc-srch-002.png' });

    const has404 = await page.getByText(/sorry.*not available|page isn't available/i).isVisible({ timeout: 2000 }).catch(() => false);
    expect(has404).toBeFalsy();
  });

  // TC-SRCH-003
  test('TC-SRCH-003: Search for non-existent term does not crash', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchViaURL('xyzzy_nonexistent_12345_abc');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-srch-003.png' });

    await expect(page.locator('body')).not.toBeEmpty();
    // Page should not show an unhandled error
    const hasServerError = await page.getByText(/500|server error|unexpected error/i).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasServerError).toBeFalsy();
  });

  // TC-SRCH-004
  test('TC-SRCH-004: Search with special characters does not crash', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchViaURL('test%20user');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-srch-004.png' });

    await expect(page.locator('body')).not.toBeEmpty();
    const hasServerError = await page.getByText(/500|server error|unexpected error/i).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasServerError).toBeFalsy();
  });

  // TC-SRCH-005
  test('TC-SRCH-005: Global header search bar accepts input and submits', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });

    await searchInput.fill('testuser');
    await page.screenshot({ path: 'tc-srch-005-typed.png' });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-srch-005-result.png' });

    await expect(page.locator('body')).not.toBeEmpty();
  });
});
