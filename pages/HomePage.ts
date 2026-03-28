import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addNewButton: Locator;
  readonly postComposerTrigger: Locator;
  readonly postInput: Locator;
  readonly postSubmitButton: Locator;
  readonly searchInput: Locator;
  readonly feed: Locator;
  readonly logoutButton: Locator;

  // Photo post
  readonly photoComposerButton: Locator;
  readonly postModal: Locator;
  readonly postModalTextarea: Locator;
  readonly postModalPostButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addNewButton = page.getByRole('button', { name: 'Add New' }).first();
    this.postComposerTrigger = page.getByRole('button', { name: 'What do you want to talk about?' });
    this.postInput = page.locator('div[contenteditable="true"], textarea').first();
    this.postSubmitButton = page.getByRole('button', { name: /^post$|^share$/i });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    this.feed = page.locator('[class*="feed"], [class*="timeline"], main').first();
    this.logoutButton = page.getByRole('button', { name: 'Logout' });

    // Photo post
    this.photoComposerButton = page.getByRole('button', { name: 'Photo' });
    this.postModal = page.getByRole('dialog');
    this.postModalTextarea = page.getByRole('textbox', { name: /what do you want to talk about/i });
    this.postModalPostButton = page.getByRole('button', { name: 'Post', exact: true });
    this.successToast = page.getByText('Your post has been shared.');
  }

  async goto() {
    await this.page.goto('./');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for SPA to render — the post composer trigger only shows when logged in and page loaded
    await this.postComposerTrigger.waitFor({ timeout: 15000 }).catch(() => {});
    await this.dismissNotificationDialog();
  }

  async dismissNotificationDialog() {
    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
      const closeBtn = this.page.locator('[aria-label="Close"], button:has-text("Close"), button:has-text("Block"), button:has-text("Allow")').first();
      if (await closeBtn.isVisible({ timeout: 1500 })) {
        await closeBtn.click();
      }
    } catch {
      // Dialog may not be present
    }
  }

  async createPost(text: string) {
    await this.postComposerTrigger.click();
    await this.page.waitForTimeout(500);
    await this.postInput.fill(text);
    await this.postSubmitButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectFeedVisible() {
    await expect(this.feed).toBeVisible();
  }

  async expectLoggedIn() {
    await expect(this.addNewButton.first()).toBeVisible({ timeout: 10000 });
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async uploadPhotoInComposer(imagePath: string): Promise<void> {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.photoComposerButton.click(),
    ]);
    await fileChooser.setFiles(imagePath);
  }

  async fillPostCaption(caption: string): Promise<void> {
    await this.postModalTextarea.fill(caption);
  }

  async submitPhotoPost(): Promise<void> {
    await this.postModalPostButton.click();
  }
}
