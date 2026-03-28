import { Page, Locator, expect } from '@playwright/test';

export class ExplorePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly posts: Locator;
  readonly hashtagLinks: Locator;
  readonly userLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /explore|discover/i }).first();
    this.posts = page.locator('[class*="post-item"], [class*="post-card"], article').first();
    this.hashtagLinks = page.locator('a[href*="hashtag"], a[href*="#"]').first();
    this.userLinks = page.locator('[class*="user-card"], [class*="people"]').first();
  }

  async goto() {
    await this.page.goto('explore');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/explore/);
    await expect(this.page.locator('body')).not.toBeEmpty();
  }
}
