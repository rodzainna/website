import { test, expect } from '@playwright/test';
import { openFirstSheet, rightEdge, leftEdge, scrollbarWidth } from './helpers';

/**
 * Two invariants must hold at once, and fixing one while breaking the other
 * has shipped twice. See SPEC.md § Interaction invariants.
 *
 *   1. The page must not shift when a sheet opens.
 *   2. The sheet must reach the viewport edge.
 *
 * `scrollbar-gutter: stable` satisfies (1) and breaks (2). The first fix
 * shipped with precise numbers for (1) and never measured (2).
 */
test.describe('scroll lock', () => {
  test('page does not shift when a sheet opens or closes', async ({ page }) => {
    await page.goto('/');

    const closed = {
      header: await rightEdge(page, 'header'),
      h1: await leftEdge(page, 'h1'),
    };

    const sheet = await openFirstSheet(page);

    expect(await rightEdge(page, 'header')).toBe(closed.header);
    expect(await leftEdge(page, 'h1')).toBe(closed.h1);

    await sheet.press('Escape');
    await page.waitForTimeout(400);

    expect(await rightEdge(page, 'header')).toBe(closed.header);
    expect(await leftEdge(page, 'h1')).toBe(closed.h1);
  });

  test('sheet reaches the viewport edge, leaving no strip beside it', async ({ page }) => {
    await page.goto('/');
    await openFirstSheet(page);

    const { innerWidth, dialogRight } = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      dialogRight: +document
        .querySelector('dialog.project-sheet[open]')!
        .getBoundingClientRect()
        .right.toFixed(2),
    }));

    expect(dialogRight).toBe(innerWidth);
  });

  test('viewport-pinned rails hold their position', async ({ page }) => {
    await page.goto('/');
    // Scroll so back-to-top is rendered in place before it's measured.
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(100);

    const closed = {
      rail: await rightEdge(page, '#a11y-rail'),
      backToTop: await rightEdge(page, '#back-to-top-rail'),
    };

    await openFirstSheet(page);

    expect(await rightEdge(page, '#a11y-rail')).toBe(closed.rail);
    expect(await rightEdge(page, '#back-to-top-rail')).toBe(closed.backToTop);
  });

  test('compensation matches the scrollbar exactly', async ({ page }) => {
    await page.goto('/');
    const width = await scrollbarWidth(page);

    // Overlay scrollbars take no layout width, so there is nothing to replace
    // and every rule involved is inert. Skipping keeps this honest rather than
    // passing vacuously — the regression only exists with classic scrollbars.
    test.skip(
      width === 0,
      'overlay scrollbars — no layout width to compensate (macOS and mobile)'
    );

    await openFirstSheet(page);

    const applied = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--scrollbar-width')
    );
    expect(applied).toBe(`${width}px`);

    // The content box gives up exactly what the scrollbar gave up, while the
    // containing block stays at full viewport width.
    const { bodyWidth, innerWidth } = await page.evaluate(() => ({
      bodyWidth: +document.body.getBoundingClientRect().width.toFixed(2),
      innerWidth: window.innerWidth,
    }));
    expect(bodyWidth).toBe(innerWidth - width);
  });

  test('background cannot be scrolled by the user while a sheet is open', async ({
    page,
  }) => {
    await page.goto('/');
    const sheet = await openFirstSheet(page);

    // Baseline *after* opening: clicking the card scrolls it into view first,
    // so a baseline taken before the click would compare against a position
    // the page legitimately left.
    const before = await page.evaluate(() => window.scrollY);

    const box = (await sheet.boundingBox())!;
    // Over the backdrop where one is exposed, otherwise over the panel. The
    // page must hold still either way.
    const x = box.x > 20 ? box.x / 2 : box.width / 2;

    // Must be real input. `overflow: hidden` blocks user scrolling but not
    // programmatic scrollTo, so asserting against scrollTo would fail against
    // a perfectly correct implementation.
    await page.mouse.move(x, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(150);

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
});
