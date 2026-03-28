import { Page, Locator, expect } from '@playwright/test';

export class GroupsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly groupCards: Locator;
  readonly createGroupButton: Locator;
  readonly joinButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /group/i }).first();
    this.groupCards = page.locator('[class*="group-card"], [class*="group-item"]').first();
    this.createGroupButton = page.getByRole('button', { name: /create group|new group/i });
    this.joinButton = page.getByRole('button', { name: /join/i }).first();
  }

  async goto() {
    await this.page.goto('groups');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/group/);
  }
}
