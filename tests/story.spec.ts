import { test, expect } from '@playwright/test';
import { StoryPage } from '../pages/StoryPage';
import path from 'path';

const TEST_IMAGE = path.join(__dirname, 'fixtures', 'test-image.png');
const TEST_VIDEO = path.join(__dirname, 'fixtures', 'test-video-recorded.mp4');

// ─── Story ────────────────────────────────────────────────────────────────────

test.describe('Story', () => {

  // TC-STORY-001
  test('TC-STORY-001: Stories page is accessible and displays 3 story type options', async ({ page }) => {
    const storyPage = new StoryPage(page);
    await storyPage.goto();

    await expect(page).toHaveURL(/\/stories/);
    await expect(storyPage.photoStoryCard).toBeVisible();
    await expect(storyPage.textStoryCard).toBeVisible();
    await expect(storyPage.videoStoryCard).toBeVisible();
  });

  // TC-STORY-002
  test('TC-STORY-002: Create a photo story successfully', async ({ page }) => {
    const storyPage = new StoryPage(page);
    await storyPage.goto();

    // Step 1: Click "Create a photo story" — file chooser opens
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      storyPage.photoStoryCard.click(),
    ]);
    await fileChooser.setFiles(TEST_IMAGE);

    // Step 2: Editor dialog opens with "Post Story" button
    await expect(storyPage.editorDialog).toBeVisible({ timeout: 10000 });
    await expect(storyPage.postStoryButton).toBeVisible();
    await page.screenshot({ path: 'tc-story-002-editor.png' });

    // Step 3: Click "Post Story" → dialog closes
    await storyPage.postStoryButton.click();
    await expect(storyPage.editorDialog).not.toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'tc-story-002-posted.png' });
  });

  // TC-STORY-003
  test('TC-STORY-003: Create a text story successfully', async ({ page }) => {
    const storyPage = new StoryPage(page);
    await storyPage.goto();

    // Step 1: Click "Create a text story" — editor opens directly
    await storyPage.textStoryCard.click();
    await expect(storyPage.editorDialog).toBeVisible({ timeout: 10000 });
    await expect(storyPage.enterTextInput).toBeVisible();
    await expect(storyPage.postStoryButton).toBeVisible();
    await page.screenshot({ path: 'tc-story-003-editor.png' });

    // Step 2: Enter text content
    const storyText = `Autotest text story – ${Date.now()}`;
    await storyPage.enterTextInput.fill(storyText);

    // Step 3: Click "Post Story" → dialog closes
    await storyPage.postStoryButton.click();
    await expect(storyPage.editorDialog).not.toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'tc-story-003-posted.png' });
  });

  // TC-STORY-004
  test('TC-STORY-004: Create a video story successfully', async ({ page }) => {
    const storyPage = new StoryPage(page);
    await storyPage.goto();

    // Step 1: Click "Create a video story" — file chooser opens
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      storyPage.videoStoryCard.click(),
    ]);
    await fileChooser.setFiles(TEST_VIDEO);

    // Step 2: Editor dialog opens — click "Upload video" to upload to server
    await expect(storyPage.editorDialog).toBeVisible({ timeout: 10000 });
    const uploadVideoBtn = page.getByRole('button', { name: 'Upload video' });
    await expect(uploadVideoBtn).toBeVisible();
    await uploadVideoBtn.click();

    // Step 3: Wait for upload to complete — "Upload video" button disappears
    await expect(uploadVideoBtn).not.toBeVisible({ timeout: 30000 });
    await expect(storyPage.postStoryButton).toBeVisible();
    await page.screenshot({ path: 'tc-story-004-editor.png' });

    // Step 4: Click "Post Story" → dialog closes
    await storyPage.postStoryButton.click();
    await expect(storyPage.editorDialog).not.toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'tc-story-004-posted.png' });
  });

});
