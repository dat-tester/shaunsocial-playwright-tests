import { Page, Locator, expect } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly generalSection: Locator;
  readonly privacySection: Locator;
  readonly notificationsSection: Locator;
  readonly saveButton: Locator;
  readonly displayNameInput: Locator;
  readonly bioInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /setting/i }).first();
    this.generalSection = page.getByText(/general/i).first();
    this.privacySection = page.getByText(/privacy/i).first();
    this.notificationsSection = page.getByText(/notification/i).first();
    this.saveButton = page.getByRole('button', { name: /save|update/i }).first();
    this.displayNameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    this.bioInput = page.locator('textarea[name="bio"], textarea[placeholder*="bio" i], textarea[placeholder*="about" i]').first();
  }

  async goto() {
    await this.page.goto('settings');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/setting/);
  }
}
