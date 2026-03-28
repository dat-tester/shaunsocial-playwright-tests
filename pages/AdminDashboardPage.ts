import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usersCount: Locator;
  readonly postsCount: Locator;
  readonly siteSettingsMenu: Locator;
  readonly usersMenu: Locator;
  readonly billingsMenu: Locator;
  readonly eWalletMenu: Locator;
  readonly aiFeaturesMenu: Locator;
  readonly membershipMenu: Locator;
  readonly advertisingMenu: Locator;
  readonly vibbMenu: Locator;
  readonly systemSettingMenu: Locator;
  readonly logoutLink: Locator;
  readonly visitSiteLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /dashboard/i }).first();
    this.usersCount = page.getByRole('heading', { name: /users/i }).first();
    this.postsCount = page.getByText(/posts/i).first();
    this.siteSettingsMenu = page.getByRole('link', { name: /site settings/i });
    this.usersMenu = page.getByRole('link', { name: /^users$/i });
    this.billingsMenu = page.getByRole('link', { name: /billings/i });
    this.eWalletMenu = page.getByRole('link', { name: /ewallet/i });
    this.aiFeaturesMenu = page.getByRole('link', { name: /ai features/i });
    this.membershipMenu = page.getByRole('link', { name: /membership/i });
    this.advertisingMenu = page.getByRole('link', { name: /advertising/i });
    this.vibbMenu = page.getByRole('link', { name: /vibb/i });
    this.systemSettingMenu = page.getByRole('link', { name: /system setting/i });
    this.logoutLink = page.getByRole('link', { name: /logout/i });
    this.visitSiteLink = page.getByRole('link', { name: /visit site/i });
  }

  async goto() {
    await this.page.goto('admin/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectDashboardVisible() {
    await expect(this.page).toHaveURL(/admin\/dashboard/);
    await expect(this.heading).toBeVisible();
  }

  async navigateTo(section: string) {
    await this.page.goto(`admin/${section}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout() {
    await this.logoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
