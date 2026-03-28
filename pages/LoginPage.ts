import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailOrUsernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailOrUsernameInput = page.getByRole('textbox').first();
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' }).first();
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password' });
  }

  async goto() {
    await this.page.goto('./');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for login form to appear (unauthenticated state)
    await this.loginButton.waitFor({ timeout: 10000 }).catch(() => {});
  }

  async login(emailOrUsername: string, password: string) {
    await this.goto();
    await this.emailOrUsernameInput.fill(emailOrUsername);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  async expectLoginFormVisible() {
    await expect(this.emailOrUsernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.signUpLink).toBeVisible();
  }

  async isLoggedIn(): Promise<boolean> {
    // Logged in = page shows "Add New" button or "Logout"
    const addNew = this.page.getByRole('button', { name: 'Add New' });
    return addNew.isVisible({ timeout: 3000 }).catch(() => false);
  }
}
