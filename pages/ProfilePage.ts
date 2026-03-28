import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly profileName: Locator;
  readonly profileUsername: Locator;
  readonly editProfileButton: Locator;
  readonly followButton: Locator;
  readonly postsTab: Locator;
  readonly postsCount: Locator;
  readonly followersCount: Locator;
  readonly followingCount: Locator;
  readonly coverPhoto: Locator;
  readonly avatar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.profileName = page.locator('[class*="profile-name"], [class*="display-name"], h1, h2').first();
    this.profileUsername = page.locator('[class*="username"], [class*="handle"]').first();
    this.editProfileButton = page.getByRole('button', { name: /edit profile/i });
    this.followButton = page.getByRole('button', { name: /^follow$/i });
    this.postsTab = page.getByRole('link', { name: /posts/i });
    this.postsCount = page.locator('[class*="post-count"], [class*="posts"]').first();
    this.followersCount = page.locator('[class*="follower"]').first();
    this.followingCount = page.locator('[class*="following"]').first();
    this.coverPhoto = page.locator('[class*="cover"], [class*="banner"]').first();
    this.avatar = page.locator('[class*="avatar"], [class*="profile-pic"]').first();
  }

  async goto(username: string) {
    await this.page.goto(`@${username}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectProfileVisible() {
    await expect(this.page).toHaveURL(/@\w+/);
  }

  async expectEditProfileButtonVisible() {
    await expect(this.editProfileButton).toBeVisible();
  }
}
