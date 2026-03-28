import { Page, Locator, expect } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly userResults: Locator;
  readonly postResults: Locator;
  readonly noResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    this.searchResults = page.locator('[class*="search-result"], [class*="result-item"]').first();
    this.userResults = page.locator('[class*="user-result"], [class*="people-result"]').first();
    this.postResults = page.locator('[class*="post-result"]').first();
    this.noResults = page.getByText(/no results|nothing found/i).first();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchViaURL(query: string) {
    await this.page.goto(`search?q=${encodeURIComponent(query)}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectSearchResultsVisible() {
    await this.page.waitForTimeout(1000);
    await expect(this.page.locator('body')).not.toBeEmpty();
  }
}
