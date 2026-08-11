import { test, expect } from '@playwright/test';

/**
 * The rail scales the root font-size, not `zoom`. `zoom` is a paint-time
 * visual scale: computed font-size never changes and iOS Safari ignores it on
 * the root element, so the control silently did nothing on mobile.
 *
 * Asserting on *computed font-size* rather than bounding boxes is the point —
 * a bounding-box assertion would have passed against the broken `zoom`
 * implementation, because Chrome scales getBoundingClientRect by the zoom.
 */
const rootFontSize = () =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

test.describe('text scaling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // The rail's panel is behind a toggle below `sm`.
    const toggle = page.locator('#a11y-toggle');
    if (await toggle.isVisible()) await toggle.click();
  });

  test('increasing changes the computed font size, not just the painted size', async ({
    page,
  }) => {
    const before = await page.evaluate(rootFontSize);
    const h1Before = await page.evaluate(
      () => getComputedStyle(document.querySelector('h1')!).fontSize
    );

    await page.locator('#a11y-font-inc').click();

    expect(await page.evaluate(rootFontSize)).toBeGreaterThan(before);
    expect(
      await page.evaluate(() => getComputedStyle(document.querySelector('h1')!).fontSize)
    ).not.toBe(h1Before);
  });

  test('decreasing reverses it', async ({ page }) => {
    const base = await page.evaluate(rootFontSize);
    await page.locator('#a11y-font-dec').click();
    expect(await page.evaluate(rootFontSize)).toBeLessThan(base);
  });

  test('clamps at both ends', async ({ page }) => {
    const inc = page.locator('#a11y-font-inc');
    for (let i = 0; i < 15; i++) await inc.click();
    expect(await page.evaluate(() => localStorage.getItem('a11y-font-scale'))).toBe('1.4');

    const dec = page.locator('#a11y-font-dec');
    for (let i = 0; i < 20; i++) await dec.click();
    expect(await page.evaluate(() => localStorage.getItem('a11y-font-scale'))).toBe('0.85');
  });

  test('steps do not drift through floating point', async ({ page }) => {
    const inc = page.locator('#a11y-font-inc');
    for (let i = 0; i < 3; i++) await inc.click();
    const stored = await page.evaluate(() => localStorage.getItem('a11y-font-scale'));
    // 1 + 0.1 + 0.1 + 0.1 is 1.3000000000000003 without rounding.
    expect(stored).toBe('1.3');
  });

  test('persists across reload and resumes from the stored value', async ({ page }) => {
    await page.locator('#a11y-font-inc').click();
    await page.locator('#a11y-font-inc').click();
    const scaled = await page.evaluate(rootFontSize);

    await page.reload();

    // Applied by the no-flash loader before first paint.
    expect(await page.evaluate(rootFontSize)).toBe(scaled);
    expect(await page.evaluate(() => localStorage.getItem('a11y-font-scale'))).toBe('1.2');

    const toggle = page.locator('#a11y-toggle');
    if (await toggle.isVisible()) await toggle.click();
    await page.locator('#a11y-font-inc').click();

    // Reads the persisted value back rather than restarting from 1.
    expect(await page.evaluate(() => localStorage.getItem('a11y-font-scale'))).toBe('1.3');
  });

  test('reset restores the default and clears storage', async ({ page }) => {
    const base = await page.evaluate(rootFontSize);
    await page.locator('#a11y-font-inc').click();
    await page.locator('#a11y-reset').click();

    expect(await page.evaluate(rootFontSize)).toBe(base);
    expect(await page.evaluate(() => localStorage.getItem('a11y-font-scale'))).toBeNull();
  });
});
