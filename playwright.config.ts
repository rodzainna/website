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
  /* No retries, deliberately. Retries plus the fixed sleeps this suite used to
     carry meant a genuinely flaky test could go green without anyone seeing it.
     The sleeps are gone — every wait is now a poll on the condition itself — so
     a failure here is a real failure worth reading. */
  retries: 0,
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
        /* Full Chromium rather than the default headless shell — fidelity with
           the browser people actually use, nothing more. This was once
           justified as necessary for the scroll-lock assertions; it isn't.
           Neither build produces a classic scrollbar on macOS *or* on
           ubuntu-latest, which is why those specs force the width instead of
           waiting for a real one. See SPEC.md § Verification. */
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
    /* Never reuse. With `reuseExistingServer`, Playwright skips the command
       entirely when something already answers on the port — so the build never
       runs and the suite silently tests whatever that server happens to be
       serving. This repo has been bitten twice by stale dev servers; a fresh
       build costs about two seconds. */
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
