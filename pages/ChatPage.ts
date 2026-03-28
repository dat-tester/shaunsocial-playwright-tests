import { Page, Locator, expect } from '@playwright/test';

export class ChatPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly conversationList: Locator;
  readonly messageInput: Locator;
  readonly sendButton: Locator;
  readonly newMessageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /message|inbox|chat/i }).first();
    this.conversationList = page.locator('[class*="conversation"], [class*="chat-list"], [class*="inbox"]').first();
    this.messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i]').first();
    this.sendButton = page.getByRole('button', { name: /send/i });
    this.newMessageButton = page.getByRole('button', { name: /new message|compose/i }).first();
  }

  async goto() {
    await this.page.goto('messages');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/message/);
  }
}
