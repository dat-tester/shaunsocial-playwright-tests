import { Page, Locator } from '@playwright/test';

export class GroupsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createGroupButton: Locator;
  readonly newGroupsSidebar: Locator;
  readonly popularGroupsSidebar: Locator;
  // All Groups tab
  readonly keywordInput: Locator;
  readonly searchButton: Locator;
  // Create Group form
  readonly groupNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly categoriesInput: Locator;
  readonly continueButton: Locator;
  readonly publicGroupRadio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Groups', exact: true });
    this.createGroupButton = page.getByRole('button', { name: 'Create new group' });
    this.newGroupsSidebar = page.getByRole('heading', { name: 'New Groups' });
    this.popularGroupsSidebar = page.getByRole('heading', { name: 'Popular Groups' });
    // All Groups tab
    this.keywordInput = page.getByRole('textbox', { name: 'Keyword' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    // Create Group form
    this.groupNameInput = page.getByPlaceholder('Please enter group name');
    this.descriptionInput = page.getByPlaceholder('Enter group description');
    this.categoriesInput = page.getByRole('textbox', { name: 'Select categories' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.publicGroupRadio = page.locator('input[type="radio"]').first();
  }

  async goto() {
    await this.page.goto('./groups');
    await this.page.waitForLoadState('domcontentloaded');
  }
}
