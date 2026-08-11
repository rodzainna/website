import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against the *built* output, not the dev server: the dev server can
 * serve stale CSS, and the built HTML is what actually ships.
 *
 * Port 4325 rather than Astro's default 4321, so a dev server left running
 * during development can't be mistaken for the preview server.
 */
const PORT = 4325;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* A .only left in a commit shouldn't silently skip the rest of the suite. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        /* Full Chromium in new headless mode, not the default headless shell.
           The shell always draws overlay scrollbars, which would make every
           scroll-lock assertion pass vacuously — the bug being guarded against
           only exists when the scrollbar takes up layout width. */
        channel: 'chromium',
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
