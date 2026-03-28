# ShaunSocial — Playwright Test Project

## App Information

- **URL:** https://stage.shaunsocial.com/php82/shaun1n71/
- **Type:** Social/dating platform (staging environment)
- **Test account:** testuser_pw2026 / Test@12345
- **Admin account:** admin@socialloft.com / 123456

---

## Language Rules

- Explain everything in Vietnamese
- All code, variable names, comments in English
- Test case names in English

---

## Work Process — MUST FOLLOW STRICTLY

Step 1 → **SCREENSHOT FIRST**
Always use Playwright MCP to navigate to the page and take a screenshot before writing any code.

Step 2 → **LIST ELEMENTS**
List all visible elements: buttons, inputs, links, forms, menus. Describe layout in Vietnamese.

Step 3 → **PROPOSE TEST PLAN**
Tell me in Vietnamese what test cases you plan to create. Format as numbered list with test name and expected result.

Step 4 → **STOP AND WAIT**
Do NOT write any code. Wait for my approval. I may add, remove, or modify test cases.

Step 5 → **GENERATE CODE**
Only after I say OK, create the test files using Page Object Model.

Step 6 → **RUN ONLY — DO NOT FIX**
Run all tests immediately. If any test fails, report the failure to me in Vietnamese. Do NOT auto-fix. I will review and decide.

Step 7 → **REPORT RESULTS**
Show a summary table: test name, pass/fail, duration. Explain failures in Vietnamese.

---

## NEVER DO — Absolute Rules

- NEVER write code before taking a screenshot
- NEVER move to another page without my permission
- NEVER auto-fix test failures
- NEVER skip the approval step (Step 4)
- NEVER assume page structure — always verify visually
- NEVER generate tests for multiple pages at once
- NEVER change passwords of existing test accounts
- NEVER use page.waitForTimeout() or sleep()
- NEVER use hardcoded delays
- NEVER use innerText() + expect() — use web-first assertions

---

## Code Standards

### Pattern
- Page Object Model (POM) — one class per page
- AAA pattern in every test: Arrange → Act → Assert
- Each test must be independent — no test depends on another

### Locator Priority (highest to lowest)
1. getByRole()
2. getByText()
3. getByTestId()
4. getByLabel()
5. getByPlaceholder()
6. CSS selector (last resort)

### Assertions — Use Web-First Only
- await expect(locator).toBeVisible()
- await expect(locator).toHaveText()
- await expect(locator).toContainText()
- await expect(locator).toHaveValue()
- await expect(locator).toHaveCount()
- await expect(locator).toBeChecked()
- await expect(page).toHaveURL()

### Naming Convention
- Page objects: PascalCase → LoginPage, ProfilePage
- Test files: kebab-case → login.spec.ts, profile.spec.ts
- Test names: descriptive English → 'should show error when password is empty'
- Variables: camelCase → loginButton, emailInput

---

## Project Structure

```
D:\shaunsocial-tests\
├── CLAUDE.md                    ← This file (read every session)
├── playwright.config.ts         ← Config: baseURL, browsers, timeout
├── playwright\.auth\            ← Saved login state (storageState)
│
├── pages\                       ← Page Object classes
│   ├── login.page.ts
│   ├── registration.page.ts
│   ├── profile.page.ts
│   ├── feed.page.ts
│   ├── search.page.ts
│   ├── chat.page.ts
│   ├── groups.page.ts
│   └── settings.page.ts
│
└── tests\                       ← Test spec files
    ├── global.setup.ts          ← Login once, save session
    ├── login.spec.ts
    ├── registration.spec.ts
    ├── profile.spec.ts
    ├── feed.spec.ts
    ├── search.spec.ts
    ├── chat.spec.ts
    ├── groups.spec.ts
    └── settings.spec.ts
```

---

## Test Priority Order

Priority 1 — Login (most critical, test first)
Priority 2 — Registration
Priority 3 — Profile (view / edit)
Priority 4 — Feed / Posts (create, like, comment, delete)
Priority 5 — Search users
Priority 6 — Chat / Messaging
Priority 7 — Groups (create, join, post)
Priority 8 — Settings / Logout

---

## Test Accounts Usage

- Use **test account** (testuser_pw2026) for normal user flow testing
- Use **admin account** (admin@socialloft.com) for admin panel, user management, moderation
- If registration test creates new accounts, use format: autotest_[timestamp]@test.com
- Never change passwords of existing accounts
- Never delete existing user data

---

## Report Format

When reporting test results, use this format:

```
📊 Kết quả test [Tên trang]:

| # | Test case | Kết quả | Thời gian |
|---|-----------|---------|-----------|
| 1 | should... | ✅ Pass | 2.1s      |
| 2 | should... | ❌ Fail | 5.3s      |

✅ Pass: X/Y
❌ Fail: X/Y

Chi tiết lỗi:
- Test #2: [giải thích bằng tiếng Việt]
```