import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://stage.shaunsocial.com/php82/shaun1n71/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 20000,
    navigationTimeout: 30000,
    headless: true,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /global\.setup\.ts/,
    },
  ],
});
