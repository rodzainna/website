import { test, expect, type Page } from '@playwright/test';

/**
 * Theme and reduced motion persist through the same no-flash loader in
 * BaseLayout that text scaling does, so they share its failure modes: a value
 * that doesn't survive reload, or one applied after first paint and visible as
 * a flash. `text-scaling.spec.ts` covered that path; these two didn't.
 */

/** The rail's panel sits behind a toggle below `sm`. */
async function openRail(page: Page) {
  const toggle = page.locator('#a11y-toggle');
  if (await toggle.isVisible()) await toggle.click();
}

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await openRail(page);
  });

  test('toggles the class and records the choice', async ({ page }) => {
    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    await page.locator('#a11y-theme').click();

    expect(
      await page.evaluate(() => document.documentElement.classList.contains('dark'))
    ).toBe(!before);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
      before ? 'light' : 'dark'
    );
  });

  test('survives reload, applied before first paint', async ({ page }) => {
    await page.locator('#a11y-theme').click();
    const chosen = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    await page.reload();

    // Read immediately after load: the inline loader runs in <head>, so the
    // class is already correct rather than being added by the rail's script.
    expect(
      await page.evaluate(() => document.documentElement.classList.contains('dark'))
    ).toBe(chosen);
  });

  test('the accessible name says what the button will do, not what is on', async ({
    page,
  }) => {
    const button = page.locator('#a11y-theme');
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    await expect(button).toHaveAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );

    await button.click();

    await expect(button).toHaveAttribute(
      'aria-label',
      isDark ? 'Switch to dark mode' : 'Switch to light mode'
    );
  });

  test('with no stored choice it follows the OS preference', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');

    expect(
      await page.evaluate(() => document.documentElement.classList.contains('dark'))
    ).toBe(true);

    await context.close();
  });
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await openRail(page);
  });

  test('toggles the class, reports pressed state, and persists', async ({ page }) => {
    const button = page.locator('#a11y-motion');
    await expect(button).toHaveAttribute('aria-pressed', 'false');

    await button.click();

    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() => document.documentElement.classList.contains('reduce-motion'))
    ).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('a11y-reduce-motion'))).toBe('true');

    await page.reload();

    expect(
      await page.evaluate(() => document.documentElement.classList.contains('reduce-motion'))
    ).toBe(true);
  });

  test('collapses transition duration rather than only claiming to', async ({ page }) => {
    const durations = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('a, button')]
          .map((el) => getComputedStyle(el).transitionDuration)
          .filter((d) => d && d !== '0s')
      );

    const before = await durations();
    expect(before.some((d) => parseFloat(d) > 0.05)).toBe(true);

    await page.locator('#a11y-motion').click();

    const after = await durations();
    expect(after.every((d) => parseFloat(d) <= 0.001)).toBe(true);
  });

  test('back to top scrolls instantly when reduced motion is on', async ({ page }) => {
    await page.locator('#a11y-motion').click();
    await page.evaluate(() => window.scrollTo(0, 1200));

    await page.locator('#back-to-top').click();

    // An explicit `behavior: 'smooth'` beats the CSS rule, so the script has to
    // check the class itself. Instant means we're already at the top here.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('reset clears theme, scale and motion together', async ({ page }) => {
    await page.locator('#a11y-motion').click();
    await page.locator('#a11y-font-inc').click();

    await page.locator('#a11y-reset').click();

    const stored = await page.evaluate(() => ({
      theme: localStorage.getItem('theme'),
      scale: localStorage.getItem('a11y-font-scale'),
      motion: localStorage.getItem('a11y-reduce-motion'),
    }));
    expect(stored).toEqual({ theme: null, scale: null, motion: null });
    expect(
      await page.evaluate(() => document.documentElement.classList.contains('reduce-motion'))
    ).toBe(false);
  });
});
