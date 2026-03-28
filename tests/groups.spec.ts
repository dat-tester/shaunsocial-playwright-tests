import { test, expect } from '@playwright/test';
import { GroupsPage } from '../pages/GroupsPage';
import { RegisterPage } from '../pages/RegisterPage';

const GROUP_NAME = `Autotest Group ${Date.now()}`;
const NEW_USER_PASSWORD = 'Test@12345';

// ─── Groups ───────────────────────────────────────────────────────────────────

test.describe('Groups', () => {

  // TC-GROUP-001
  test('TC-GROUP-001: Groups page is accessible and create a Public Group successfully', async ({ page }) => {
    const groups = new GroupsPage(page);
    await groups.goto();

    // Step 1: Verify Groups page elements
    await expect(page).toHaveURL(/\/groups/);
    await expect(groups.heading).toBeVisible();
    await expect(groups.createGroupButton).toBeVisible();
    await expect(groups.newGroupsSidebar).toBeVisible();
    await expect(groups.popularGroupsSidebar).toBeVisible();
    await page.screenshot({ path: 'tc-group-001-page.png' });

    // Step 2: Click "Create new group" → navigate to create form
    await groups.createGroupButton.click();
    await expect(page).toHaveURL(/\/groups\/create/);
    await expect(groups.groupNameInput).toBeVisible({ timeout: 10000 });

    // Step 3: Fill group name and description
    await groups.groupNameInput.fill(GROUP_NAME);
    await groups.descriptionInput.fill('Autotest group created by Playwright');

    // Step 4: Select a category — click input → dialog opens → check "Technology" → Select
    await groups.categoriesInput.click();
    const categoryDialog = page.getByRole('dialog', { name: 'Select Categories' });
    await expect(categoryDialog).toBeVisible({ timeout: 5000 });
    await categoryDialog.getByRole('checkbox', { name: 'Technology' }).check();
    await categoryDialog.getByRole('button', { name: 'Select' }).click();
    await expect(categoryDialog).not.toBeVisible();

    // Step 5: Public Group is selected by default → click Continue
    await expect(groups.publicGroupRadio).toBeChecked();
    await page.screenshot({ path: 'tc-group-001-form.png' });
    await groups.continueButton.click();

    // Step 6: Verify group created → redirected to group detail page
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/groups\/\d+/, { timeout: 15000 });
    await page.screenshot({ path: 'tc-group-001-created.png' });
  });

  // TC-GROUP-002
  test('TC-GROUP-002: View group detail page', async ({ page }) => {
    await page.goto('./groups/3/demo-group-001');
    await page.waitForLoadState('domcontentloaded');

    // Verify group detail elements
    await expect(page).toHaveURL(/\/groups\/3\/demo-group-001/);
    await expect(page.getByText('Demo group 001').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Public').first()).toBeVisible();
    await expect(page.getByText('Feeds', { exact: true })).toBeVisible();
    await expect(page.getByText('Info', { exact: true })).toBeVisible();
    await expect(page.getByText('Media', { exact: true })).toBeVisible();
    await expect(page.getByText('Members', { exact: true })).toBeVisible();
    await page.screenshot({ path: 'tc-group-002-detail.png' });
  });

});

// TC-GROUP-003 — runs WITHOUT saved session (new user registers, joins group, then posts)
test.describe('Groups - New User Join and Post', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  // TC-GROUP-003
  test('TC-GROUP-003: New user registers, joins Autotest Group, and posts in it', async ({ page }) => {
    const ts = Date.now();
    const email    = `autotest_${ts}@test.com`;
    const username = `autotest${ts}`;

    // Step 1: Register new account
    const register = new RegisterPage(page);
    await register.goto();
    await register.fullNameInput.fill(`Autotest User ${ts}`);
    await register.usernameInput.fill(username);
    await register.emailInput.fill(email);
    await register.passwordInput.fill(NEW_USER_PASSWORD);
    await page.screenshot({ path: 'tc-group-003-form.png' });
    await register.signUpButton.click();
    await page.waitForLoadState('domcontentloaded');

    // Wait for redirect after registration
    await page.waitForURL(/first-login|onboarding|home|select|groups/, { timeout: 15000 });
    await page.screenshot({ path: 'tc-group-003-registered.png' });

    // Step 2: Navigate to All Groups → search for "Autotest Group"
    await page.goto('./groups/all');
    await page.waitForLoadState('domcontentloaded');

    const keywordInput = page.getByRole('textbox', { name: 'Keyword' });
    await expect(keywordInput).toBeVisible({ timeout: 10000 });
    await keywordInput.fill('Autotest Group');
    await page.getByRole('button', { name: 'Search' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'tc-group-003-search.png' });

    // Step 3: Click "Join Group" → navigates to group detail page
    const joinGroupBtn = page.getByRole('button', { name: 'Join Group' }).first();
    await expect(joinGroupBtn).toBeVisible({ timeout: 10000 });
    await joinGroupBtn.click();
    await page.waitForLoadState('domcontentloaded');

    // Step 4: Now on group detail page — click "Join" to actually join the group
    await expect(page).toHaveURL(/\/groups\/\d+/, { timeout: 10000 });
    const joinBtn = page.getByRole('button', { name: 'Join', exact: true });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });
    await joinBtn.click();
    await expect(page.getByRole('button', { name: 'Leave', exact: true })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tc-group-003-joined.png' });

    // Step 5: Verify on group detail page
    await expect(page).toHaveURL(/\/groups\/\d+/);
    await page.screenshot({ path: 'tc-group-003-group-page.png' });

    // Step 6: Click "What do you want to talk about?" → composer dialog opens
    const composerBtn = page.getByRole('button', { name: /what do you want to talk about/i });
    await expect(composerBtn).toBeVisible({ timeout: 10000 });
    await composerBtn.click();

    // Step 7: Fill text in dialog textbox
    const postInput = page.getByRole('dialog').getByRole('textbox');
    await expect(postInput).toBeVisible({ timeout: 5000 });
    const postText = `Group post by new user – ${ts}`;
    await postInput.fill(postText);
    await page.screenshot({ path: 'tc-group-003-composing.png' });

    // Step 8: Click Post → dialog closes
    const postBtn = page.getByRole('button', { name: 'Post', exact: true }).last();
    await expect(postBtn).toBeEnabled({ timeout: 5000 });
    await postBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'tc-group-003-posted.png' });

    // Step 9: Verify post appears in group feed
    await expect(page.getByText(postText).first()).toBeVisible({ timeout: 10000 });
  });

});
