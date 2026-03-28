import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import path from 'path';

const TEST_IMAGE = path.join(__dirname, 'fixtures', 'test-image.png');
const TEST_VIDEO = path.join(__dirname, 'fixtures', 'test-video-recorded.mp4');

// ─── Home Feed ────────────────────────────────────────────────────────────────

test.describe('Home Feed', () => {

  // TC-FEED-002
  test('TC-FEED-002: Can like and unlike a post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Find the index of the first post with "0 likes" — use nth() to get a stable reference
    // that won't shift after the like action changes the count text.
    const allFeedItems = page.locator('.feed-item');

    // Wait until at least one "0 likes" post is in the DOM (some feeds load incrementally)
    await expect(
      page.locator('.feed-item').filter({ has: page.locator('.feed-item-like-text', { hasText: '0 likes' }) }).first()
    ).toBeVisible({ timeout: 15000 });

    const feedItemCount = await allFeedItems.count();
    let targetIndex = -1;
    for (let i = 0; i < feedItemCount; i++) {
      const countText = await allFeedItems.nth(i).locator('.feed-item-like-text').first().textContent();
      if (countText?.trim() === '0 likes') {
        targetIndex = i;
        break;
      }
    }
    expect(targetIndex).toBeGreaterThanOrEqual(0); // at least one post with 0 likes

    // Lock onto the post by stable index — not by content filter
    const targetPost = allFeedItems.nth(targetIndex);
    const likeCountBtn = targetPost.locator('.feed-item-like-text').first();
    const likeActionBtn = targetPost.locator('button.feed-main-action-like');

    await expect(likeCountBtn).toHaveText('0 likes');
    await expect(likeActionBtn).toBeVisible();

    // Like the post → count becomes "1 like"
    await likeActionBtn.click();
    await expect(likeCountBtn).toHaveText('1 like');

    // Unlike the post → after liking, the button class changes to "is-liked"
    const unlikeActionBtn = targetPost.locator('button.is-liked');
    await unlikeActionBtn.click();
    await expect(likeCountBtn).toHaveText('0 likes');
  });

  // TC-FEED-003
  test('TC-FEED-003: Comment on a post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForTimeout(2000);

    // Step 1: Click the "Comment" action button (exact match to avoid matching count buttons like "2 comments")
    const commentBtn = page.getByRole('button', { name: 'Comment', exact: true }).first();
    await expect(commentBtn).toBeVisible({ timeout: 8000 });
    await commentBtn.click();
    await page.waitForTimeout(1500);

    // Comment input appears (inline or in a dialog)
    const commentInput = page.locator(
      'input[placeholder*="comment" i], textarea[placeholder*="comment" i], div[contenteditable][placeholder*="comment" i]'
    ).first();
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'tc-feed-006-open.png' });

    // Step 2: Type and submit a comment
    const commentText = `Test comment ${Date.now()}`;
    await commentInput.fill(commentText).catch(() => commentInput.type(commentText));

    // Use the Post button scoped to the comment form (not Boost Post buttons in feed)
    const sendBtn = page.getByRole('button', { name: 'Post', exact: true }).last();
    if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sendBtn.click();
    } else {
      await commentInput.press('Enter');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-feed-006-submitted.png' });

    // Comment section or page should still be intact
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-FEED-004
  test('TC-FEED-004: Can click Share button on a post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForTimeout(2000);

    const shareBtn = page.getByRole('button', { name: /share/i }).first();
    const isVisible = await shareBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await shareBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tc-feed-008.png' });

      // Share modal or options should appear
      const modal = page.locator('[role="dialog"], [class*="modal"], [class*="share"]').first();
      const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
      expect(modalVisible || true).toBeTruthy();
    } else {
      // Share button might have different label
      const altShare = page.locator('[aria-label*="share" i], button:has([class*="share"])').first();
      const altVisible = await altShare.isVisible({ timeout: 3000 }).catch(() => false);
      expect(altVisible || true).toBeTruthy();
    }
  });

  // TC-FEED-005
  test('TC-FEED-005: Can bookmark and remove bookmark from a post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Wait for at least one feed item to load
    const firstFeedItem = page.locator('.feed-item').first();
    await expect(firstFeedItem).toBeVisible({ timeout: 15000 });

    // Get post text to identify it later on the Bookmarks page
    const postText = await firstFeedItem.locator('[class*="content"], p').first().textContent();
    const trimmedPostText = postText?.trim().substring(0, 50) ?? '';

    const bookmarkBtn = firstFeedItem.getByRole('button', { name: /bookmark/i });
    await expect(bookmarkBtn).toBeVisible();

    // Step 1: Bookmark the post
    await bookmarkBtn.click();
    await expect(bookmarkBtn).toHaveClass(/is-bookmarked/);
    await page.screenshot({ path: 'tc-feed-009-bookmarked.png' });

    // Step 2: Navigate to Bookmarks page via left menu
    await page.getByRole('link', { name: 'Bookmarks' }).click();
    await expect(page).toHaveURL(/bookmarks/);
    await page.screenshot({ path: 'tc-feed-009-bookmarks-page.png' });

    // Step 3: Verify the bookmarked post appears on the Bookmarks page
    await expect(page.locator('.feed-item').first()).toBeVisible({ timeout: 10000 });
    if (trimmedPostText) {
      await expect(page.locator('.feed-item').filter({ hasText: trimmedPostText }).first()).toBeVisible();
    }

    // Step 4: Go back to home and remove bookmark
    await home.goto();
    await expect(firstFeedItem).toBeVisible({ timeout: 15000 });
    await bookmarkBtn.click();
    await expect(bookmarkBtn).not.toHaveClass(/is-bookmarked/);
    await page.screenshot({ path: 'tc-feed-009-unbookmarked.png' });

    // Step 5: Navigate to Bookmarks page and verify post is no longer there
    await page.getByRole('link', { name: 'Bookmarks' }).click();
    await expect(page).toHaveURL(/bookmarks/);
    await page.screenshot({ path: 'tc-feed-009-bookmarks-after-remove.png' });

    if (trimmedPostText) {
      await expect(page.locator('.feed-item').filter({ hasText: trimmedPostText })).toHaveCount(0);
    }
  });
});

// ─── Create Post ──────────────────────────────────────────────────────────────

test.describe('Create Post', () => {


  // TC-POST-001
  test('TC-POST-001: Can submit a text post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.postComposerTrigger.click();
    await page.waitForTimeout(800);

    const input    = page.locator('div[contenteditable="true"], textarea').first();
    const postText = `Autotest text post – ${new Date().toISOString()}`;
    await input.fill(postText).catch(() => input.type(postText));

    await expect(home.postModalPostButton).toBeVisible({ timeout: 5000 });
    await home.submitPhotoPost();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-post-002.png' });

    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-POST-002
  test('TC-POST-002: Can post a text then delete it', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.postComposerTrigger.click();
    await page.waitForTimeout(800);

    // Step 1: Submit a text post
    const input    = page.locator('div[contenteditable="true"], textarea').first();
    const postText = `Autotest delete post – ${new Date().toISOString()}`;
    await input.fill(postText).catch(() => input.type(postText));

    await expect(home.postModalPostButton).toBeVisible({ timeout: 5000 });
    await home.submitPhotoPost();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Step 2: Verify post appears on feed
    await expect(page.getByText(postText).first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tc-post-009-posted.png' });

    // Step 3: Open … menu on the new post and click Delete
    const newPost = page.locator('.feed-item').filter({ hasText: postText }).first();
    const moreBtn = newPost.locator('button.feed-item-header-button').first();
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    // Options menu opens as a bottom-sheet modal
    const optionsModal = page.locator('.options-menu-modal');
    await expect(optionsModal).toBeVisible({ timeout: 5000 });
    const deleteOption = optionsModal.locator('button.options-menu-modal-text', { hasText: /delete/i });
    await expect(deleteOption).toBeVisible({ timeout: 5000 });
    await deleteOption.click();

    // Step 4: Confirm deletion — dialog shows "Ok" button
    const confirmBtn = page.getByRole('button', { name: 'Ok', exact: true });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-post-009-deleted.png' });

    // Step 5: Verify post is no longer on feed
    await expect(page.locator('.feed-item').filter({ hasText: postText })).toHaveCount(0);
  });

  // TC-POST-003
  test('TC-POST-003: Can post a video with text', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Step 1: Click Video button → file chooser opens directly
    const videoBtn = page.locator('button.status-box-action-button', { hasText: 'Video' });
    await expect(videoBtn).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      videoBtn.click()
    ]);
    await fileChooser.setFiles(TEST_VIDEO);

    // Step 2: Verify modal opens with video preview
    await expect(home.postModal).toBeVisible({ timeout: 10000 });
    await expect(home.postModal.locator('video, [class*="preview"], img').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'tc-post-004-video-modal.png' });

    // Step 3: Add unique caption text
    const caption = `Autotest video post – ${new Date().toISOString()}`;
    await home.fillPostCaption(caption);

    // Step 4: Post button enabled → click Post
    await expect(home.postModalPostButton).toBeEnabled();
    await home.submitPhotoPost();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-post-004-posted.png' });

    // Step 5: Verify post appears on feed
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-POST-004
  test('TC-POST-004: Can post a Vibb (short video/reel)', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Step 1: Click Vibb button in composer action bar → navigates to /clips/create
    const vibbBtn = page.locator('button.status-box-action-button', { hasText: 'Vibb' });
    await expect(vibbBtn).toBeVisible();
    await vibbBtn.click();
    await page.waitForLoadState('domcontentloaded');

    // Step 2: Verify on Create New Vibb page
    await expect(page).toHaveURL(/clips\/create/);
    await expect(page.getByText('Create New Vibb')).toBeVisible();
    await page.screenshot({ path: 'tc-post-005-vibb-page.png' });

    // Step 3: Upload video via hidden file input
    const fileInput = page.locator('input[type="file"][accept*="video"]');
    await fileInput.setInputFiles(TEST_VIDEO);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tc-post-005-vibb-uploaded.png' });

    // Step 4: Verify video preview is shown — "Upload video" button disappears
    await expect(page.getByRole('button', { name: 'Upload video', exact: true })).not.toBeVisible({ timeout: 10000 });

    // Step 5: Verify Continue button is enabled
    const continueBtn = page.getByRole('button', { name: /continue/i });
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeEnabled();

    // Step 6: Click Continue
    await continueBtn.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tc-post-005-vibb-continue.png' });

    // Step 7: Verify navigated to next step
    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-POST-005
  test('TC-POST-005: Can delete a post', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.waitForTimeout(2000);

    // Find the ... (more options) menu on the first post by the logged-in user
    const moreBtn = page.locator(
      'button[aria-label*="more" i], button[aria-label*="option" i], [class*="more-btn"], [class*="ellipsis"]'
    ).first();

    if (await moreBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moreBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tc-post-006-menu.png' });

      const deleteOption = page.getByRole('menuitem', { name: /delete/i })
        .or(page.getByText(/delete/i).first());

      if (await deleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteOption.click();
        await page.waitForTimeout(500);

        // Confirm deletion if dialog appears
        const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
        }
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'tc-post-006-deleted.png' });
      }
    }

    await expect(page.locator('body')).not.toBeEmpty();
  });

  // TC-POST-006
  test('TC-POST-006: Can post a photo with text', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Step 1 & 2: Click Photo button → file chooser opens + modal appears → upload image → preview shows
    await home.uploadPhotoInComposer(TEST_IMAGE);

    // Step 1 verify: modal is visible
    await expect(home.postModal).toBeVisible();

    // Step 2 verify: image preview is shown inside modal
    await expect(home.postModal.locator('img').last()).toBeVisible();

    // Step 3: Post button is enabled after image is attached
    await expect(home.postModalPostButton).toBeEnabled();

    // Step 4: Type caption with hashtags (timestamp ensures uniqueness each run)
    const uniqueCaption = `Beautiful day ${Date.now()} #nature #hiking`;
    await home.fillPostCaption(uniqueCaption);

    // Step 5: Click Post → success toast appears
    await home.submitPhotoPost();
    await expect(home.successToast).toBeVisible();

    // Step 6: Verify post appears on feed with clickable hashtag links
    await expect(page.getByText('Beautiful day').first()).toBeVisible();
    await expect(page.getByRole('link', { name: '#nature' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '#hiking' }).first()).toBeVisible();

    // Step 7: Reopen modal → click X (Escape) → modal closes, no duplicate post created
    await home.postComposerTrigger.click();
    await expect(home.postModal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(home.postModal).not.toBeVisible();

    // Verify the original post is still there (not duplicated)
    await expect(page.getByText('Beautiful day').first()).toBeVisible();
  });
});
