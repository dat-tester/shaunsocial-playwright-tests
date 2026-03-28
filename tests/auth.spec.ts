import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Auth tests run without stored session
test.use({ storageState: { cookies: [], origins: [] } });

const VALID_EMAIL    = 'testuser_pw@test.com';
const VALID_USERNAME = 'testuser_pw2026';
const VALID_PASSWORD = 'Test@12345';

// ─── Login ────────────────────────────────────────────────────────────────────

test.describe('Login', () => {

  // TC-AUTH-001
  test('TC-AUTH-001: Login page displays correctly when unauthenticated', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.screenshot({ path: 'tc-auth-001.png' });

    await expect(login.emailOrUsernameInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.loginButton).toBeVisible();
    await expect(page).toHaveTitle(/ShaunSocial/i);
  });

  // TC-AUTH-002
  test('TC-AUTH-002: Login with valid email and password', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(VALID_EMAIL, VALID_PASSWORD);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-auth-002.png' });

    const addNew = page.getByRole('button', { name: 'Add New' }).first();
    await expect(addNew).toBeVisible({ timeout: 10000 });
  });

  // TC-AUTH-003
  test('TC-AUTH-003: Login with valid username (not email)', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(VALID_USERNAME, VALID_PASSWORD);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-auth-003.png' });

    const addNew = page.getByRole('button', { name: 'Add New' }).first();
    await expect(addNew).toBeVisible({ timeout: 10000 });
  });

  // TC-AUTH-004
  test('TC-AUTH-004: Login with incorrect password', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailOrUsernameInput.fill(VALID_EMAIL);
    await login.passwordInput.fill('WrongPassword999!');
    await login.loginButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-auth-004.png' });

    const hasError = await page.locator('.alert, [class*="error"], [class*="alert"]').first().isVisible().catch(() => false);
    const addNew   = await page.getByRole('button', { name: 'Add New' }).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError || !addNew).toBeTruthy();
  });

  // TC-AUTH-005
  test('TC-AUTH-005: Login with empty email and password', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tc-auth-005.png' });

    await expect(login.loginButton).toBeVisible();
    const addNew = await page.getByRole('button', { name: 'Add New' }).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(addNew).toBeFalsy();
  });

  // TC-AUTH-006
  test('TC-AUTH-006: Login with email only (password empty)', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.emailOrUsernameInput.fill(VALID_EMAIL);
    await login.loginButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tc-auth-006.png' });

    const addNew = await page.getByRole('button', { name: 'Add New' }).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(addNew).toBeFalsy();
  });

  // TC-AUTH-007
  test('TC-AUTH-007: Sign up link navigates to /signup', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await expect(login.signUpLink).toBeVisible();
    await login.signUpLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'tc-auth-007.png' });
    await expect(page).toHaveURL(/signup/);
  });

  // TC-AUTH-008
  test('TC-AUTH-008: Forgot password link is visible on login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.screenshot({ path: 'tc-auth-008.png' });
    await expect(login.forgotPasswordLink).toBeVisible();
  });
});

// ─── Registration ─────────────────────────────────────────────────────────────

test.describe('Registration', () => {

  // TC-REG-001
  test('TC-REG-001: Registration form is accessible at /signup', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await page.screenshot({ path: 'tc-reg-001.png' });
    await register.expectFormVisible();
    await expect(page).toHaveURL(/signup/);
  });

  // TC-REG-002
  test('TC-REG-002: Registration form has all required fields', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await page.screenshot({ path: 'tc-reg-002.png' });
    await expect(register.fullNameInput).toBeVisible();
    await expect(register.usernameInput).toBeVisible();
    await expect(register.emailInput).toBeVisible();
    await expect(register.passwordInput).toBeVisible();
  });

  // TC-REG-003
  test('TC-REG-003: Register with a new unique account', async ({ page }) => {
    const ts       = Date.now();
    const email    = `newuser_${ts}@test.com`;
    const username = `newuser${ts}`;

    const register = new RegisterPage(page);
    await register.goto();
    await register.fullNameInput.fill('New User Test');
    await register.usernameInput.fill(username);
    await register.emailInput.fill(email);
    await register.passwordInput.fill(VALID_PASSWORD);
    await page.screenshot({ path: 'tc-reg-003-filled.png' });
    await register.signUpButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'tc-reg-003-after.png' });

    const url = page.url();
    expect(
      url.includes('/onboarding') || url.includes('/home') ||
      url.includes('/select')    || !url.includes('/signup')
    ).toBeTruthy();
  });

  // TC-REG-004
  test('TC-REG-004: Register with an already-used email shows error', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.register('Test User PW', 'dup_' + Date.now(), VALID_EMAIL, VALID_PASSWORD);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tc-reg-004.png' });

    const hasError      = await page.locator('.alert-danger, [class*="error"], [class*="alert"]').first().isVisible().catch(() => false);
    const stillOnSignup = page.url().includes('/signup');
    expect(hasError || stillOnSignup).toBeTruthy();
  });

  // TC-REG-005
  test('TC-REG-005: Register with a short/invalid password', async ({ page }) => {
    const ts = Date.now();
    const register = new RegisterPage(page);
    await register.goto();
    await register.fullNameInput.fill('Test User');
    await register.usernameInput.fill('testshort' + ts);
    await register.emailInput.fill(`shortpw_${ts}@test.com`);
    await register.passwordInput.fill('123');
    await register.signUpButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-reg-005.png' });

    const hasError      = await page.locator('[class*="error"], [class*="alert"], [class*="invalid"]').first().isVisible().catch(() => false);
    const stillOnSignup = page.url().includes('/signup');
    expect(hasError || stillOnSignup).toBeTruthy();
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

test.describe('Logout', () => {

  // TC-LGOUT-001
  test('TC-LGOUT-001: Logout returns user to login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(VALID_EMAIL, VALID_PASSWORD);
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-lgout-001.png' });

    await expect(login.emailOrUsernameInput).toBeVisible({ timeout: 10000 });
    await expect(login.passwordInput).toBeVisible({ timeout: 10000 });
  });

  // TC-LGOUT-002
  test('TC-LGOUT-002: Session is destroyed after logout', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(VALID_EMAIL, VALID_PASSWORD);
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Try to access a protected page directly
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'tc-lgout-002.png' });

    // Should see login form, not home feed
    await expect(login.loginButton).toBeVisible({ timeout: 10000 });
    const addNew = await page.getByRole('button', { name: 'Add New' }).first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(addNew).toBeFalsy();
  });
});
