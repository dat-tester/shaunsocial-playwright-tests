import { Page, Locator, expect } from '@playwright/test';

export class AdminLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.loginButton = page.getByRole('button', { name: /log in|login|sign in/i });
    this.errorMessage = page.locator('.alert-danger, [class*="error"]').first();
  }

  async goto() {
    await this.page.goto('admin/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectLoginFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async expectInvalidCredentialsError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
