import { Page, Locator, expect } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;
  readonly nextButton: Locator;
  readonly skipButton: Locator;
  readonly tagItems: Locator;
  readonly userItems: Locator;
  readonly followButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.getByRole('button', { name: /next|continue/i });
    this.skipButton = page.getByRole('button', { name: /skip/i });
    this.tagItems = page.locator('[class*="tag"], [class*="interest"], .tag-item').first();
    this.userItems = page.locator('[class*="user-item"], [class*="follow"]').first();
    this.followButton = page.getByRole('button', { name: /follow/i }).first();
  }

  async selectFirstTagsAndContinue() {
    await this.page.waitForLoadState('domcontentloaded');
    // Select first available tags
    const tags = this.page.locator('label, [role="checkbox"], input[type="checkbox"]');
    const count = await tags.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await tags.nth(i).click().catch(() => {});
    }
    await this.nextButton.click().catch(async () => {
      await this.skipButton.click().catch(() => {});
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async selectUsersAndContinue() {
    await this.page.waitForLoadState('domcontentloaded');
    // Try clicking Follow on first user
    const followBtns = this.page.getByRole('button', { name: /follow/i });
    const count = await followBtns.count();
    for (let i = 0; i < Math.min(2, count); i++) {
      await followBtns.nth(i).click().catch(() => {});
    }
    await this.nextButton.click().catch(async () => {
      await this.skipButton.click().catch(() => {});
    });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async completeOnboarding() {
    // Step 1: Select tags
    const isTagStep = await this.page.locator('text=/tag|interest|topic/i').isVisible().catch(() => false);
    if (isTagStep) {
      await this.selectFirstTagsAndContinue();
    }
    // Step 2: Select users
    const isUserStep = await this.page.locator('text=/follow|user|people/i').isVisible().catch(() => false);
    if (isUserStep) {
      await this.selectUsersAndContinue();
    }
  }
}
