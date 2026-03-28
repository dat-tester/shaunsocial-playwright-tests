import { Page, Locator } from '@playwright/test';

export class StoryPage {
  readonly page: Page;
  readonly photoStoryCard: Locator;
  readonly textStoryCard: Locator;
  readonly videoStoryCard: Locator;
  readonly editorDialog: Locator;
  readonly postStoryButton: Locator;
  readonly enterTextInput: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.photoStoryCard = page.locator('div').filter({ hasText: /^Create a photo story$/ }).first();
    this.textStoryCard  = page.locator('div').filter({ hasText: /^Create a text story$/ }).first();
    this.videoStoryCard = page.locator('div').filter({ hasText: /^Create a video story$/ }).first();
    this.editorDialog   = page.locator('[role="dialog"]');
    this.postStoryButton = page.getByRole('button', { name: 'Post Story' });
    this.enterTextInput  = page.getByRole('textbox', { name: 'Enter Text' });
    this.closeButton     = page.locator('.fullscreen-close-btn');
  }

  async goto() {
    await this.page.goto('./stories');
    await this.page.waitForLoadState('domcontentloaded');
  }
}
