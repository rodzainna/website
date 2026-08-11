import { expect, type Page, type Locator } from '@playwright/test';

/** Right edge of an element, or null when it isn't in the layout. */
export async function rightEdge(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? +el.getBoundingClientRect().right.toFixed(2) : null;
  }, selector);
}

/** Left edge of an element. */
export async function leftEdge(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? +el.getBoundingClientRect().left.toFixed(2) : null;
  }, selector);
}

/**
 * Width the classic scrollbar takes out of the layout. 0 with overlay
 * scrollbars — mobile, and any macOS runner, which follows the system
 * setting and cannot be overridden by a Chromium flag.
 */
export async function scrollbarWidth(page: Page) {
  return page.evaluate(() => window.innerWidth - document.documentElement.clientWidth);
}

/**
 * Waits for an element to stop moving, by sampling its box until two reads
 * agree. Used instead of sleeping through the sheet's 0.3s slide-in: a fixed
 * wait is either too short (flaky) or too long (slow), and it silently stops
 * being correct the moment the transition duration changes in global.css.
 */
export async function waitUntilStill(locator: Locator) {
  let previous: string | null = null;
  await expect
    .poll(
      async () => {
        const box = await locator.boundingBox();
        const current = box ? `${box.x.toFixed(2)}x${box.y.toFixed(2)}` : null;
        const settled = current !== null && current === previous;
        previous = current;
        return settled;
      },
      { timeout: 5000, intervals: [50] }
    )
    .toBe(true);
}

/** Opens the first project sheet through its real trigger, not showModal(). */
export async function openFirstSheet(page: Page) {
  await page.locator('[data-sheet-open]').first().click();
  const sheet = page.locator('dialog.project-sheet[open]');
  await sheet.waitFor({ state: 'visible' });
  await waitUntilStill(sheet);
  return sheet;
}

/** Waits for scrolling to come to rest rather than guessing at a duration. */
export async function waitForScrollToStop(page: Page) {
  let previous: number | null = null;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => window.scrollY);
        const settled = y === previous;
        previous = y;
        return settled;
      },
      { timeout: 5000, intervals: [50] }
    )
    .toBe(true);
}

/** sRGB relative luminance, per WCAG 2.1. */
function luminance([r, g, b]: number[]) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: number[], b: number[]) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Parses `#rgb`, `#rrggbb` or `rgb(...)` into [r, g, b]. */
export function parseColor(value: string): number[] {
  const v = value.trim();
  if (v.startsWith('#')) {
    const hex = v.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  }
  const nums = v.match(/[\d.]+/g);
  if (!nums) throw new Error(`Unparseable colour: ${value}`);
  return nums.slice(0, 3).map(Number);
}
