import { test, expect } from '@playwright/test';
import {
  openFirstSheet,
  rightEdge,
  leftEdge,
  scrollbarWidth,
  waitUntilStill,
  waitForScrollToStop,
} from './helpers';

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
    await expect(page.locator('dialog.project-sheet[open]')).toHaveCount(0);
    await waitUntilStill(page.locator('header'));

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
    await waitForScrollToStop(page);
    await waitUntilStill(page.locator('#back-to-top-rail'));

    const closed = {
      rail: await rightEdge(page, '#a11y-rail'),
      backToTop: await rightEdge(page, '#back-to-top-rail'),
    };

    await openFirstSheet(page);

    expect(await rightEdge(page, '#a11y-rail')).toBe(closed.rail);
    expect(await rightEdge(page, '#back-to-top-rail')).toBe(closed.backToTop);
  });

  test('the trigger records the scrollbar width it is compensating for', async ({
    page,
  }) => {
    await page.goto('/');
    const width = await scrollbarWidth(page);

    await openFirstSheet(page);

    // Holds at 0 too: with overlay scrollbars nothing is taken away, so the
    // correct compensation is 0px and every rule below becomes inert.
    const applied = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--scrollbar-width')
    );
    expect(applied).toBe(`${width}px`);
  });

  test('a non-zero scrollbar width is compensated exactly', async ({ page }) => {
    await page.goto('/');
    const sheet = await openFirstSheet(page);

    /* The width is *forced*, not measured. macOS follows the system
       overlay-scrollbar setting and no Chromium flag overrides it — and
       ubuntu-latest on CI reports 0 as well, so a test that waits for a real
       classic scrollbar never runs anywhere. Forcing the value exercises the
       CSS contract on every platform instead of skipping forever.

       The measurement half is covered by the test above; this is the half that
       says what the stylesheet does with it. */
    const FORCED = 15;

    const railBefore = await rightEdge(page, '#a11y-rail');

    const after = await page.evaluate((w) => {
      document.documentElement.style.setProperty('--scrollbar-width', `${w}px`);
      const dialog = document.querySelector('dialog.project-sheet[open]')!;
      return {
        bodyWidth: +document.body.getBoundingClientRect().width.toFixed(2),
        innerWidth: window.innerWidth,
        dialogRight: +dialog.getBoundingClientRect().right.toFixed(2),
        railRight: +document
          .querySelector('#a11y-rail')!
          .getBoundingClientRect()
          .right.toFixed(2),
      };
    }, FORCED);

    // The content box gives up exactly the scrollbar's width...
    expect(after.bodyWidth).toBe(after.innerWidth - FORCED);
    // ...while the containing block stays at full viewport width, which is the
    // half `scrollbar-gutter: stable` gets wrong.
    expect(after.dialogRight).toBe(after.innerWidth);
    // Viewport-pinned rails take the same compensation.
    expect(after.railRight).toBe(railBefore! - FORCED);

    await sheet.evaluate((d: HTMLDialogElement) => d.close());
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
    await waitForScrollToStop(page);

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
});
