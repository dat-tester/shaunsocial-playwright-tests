import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByRole('textbox', { name: 'Name' }).first();
    this.usernameInput = page.getByRole('textbox', { name: 'Username' }).first();
    this.emailInput = page.getByRole('textbox', { name: 'Email' }).first();
    this.passwordInput = page.getByRole('textbox', { name: 'Password' }).first();
    this.signUpButton = page.getByRole('button', { name: 'Sign up' }).first();
    this.loginLink = page.getByRole('link', { name: /log in|login|sign in/i });
  }

  async goto() {
    await this.page.goto('signup');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async register(name: string, username: string, email: string, password: string) {
    await this.goto();
    await this.fullNameInput.fill(name);
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectFormVisible() {
    await expect(this.fullNameInput).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }
}
