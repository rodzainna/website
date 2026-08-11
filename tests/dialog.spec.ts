import { test, expect } from '@playwright/test';
import { openFirstSheet } from './helpers';

/**
 * The panels are a native <dialog> rather than a JS island, so most of this is
 * asserting the platform behaviour the React + Radix runtime was dropped for —
 * if any of it stops holding, the trade stops being worth it.
 */
test.describe('project sheet', () => {
  test('opens from the card and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const sheet = await openFirstSheet(page);
    await expect(sheet).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('dialog.project-sheet[open]')).toHaveCount(0);
  });

  test('closes on the close button and on backdrop click', async ({ page }) => {
    await page.goto('/');

    let sheet = await openFirstSheet(page);
    await sheet.locator('[data-sheet-close]').click();
    await expect(page.locator('dialog.project-sheet[open]')).toHaveCount(0);

    sheet = await openFirstSheet(page);
    const box = (await sheet.boundingBox())!;

    // Below the panel's 36rem cap the sheet fills the viewport and there is no
    // backdrop to aim at, so there is nothing to assert.
    test.skip(box.x <= 20, 'panel spans the full viewport — no exposed backdrop');

    // The backdrop sits outside the dialog's box, so this must be a viewport
    // coordinate left of the panel; a `position:` option would be measured
    // from the panel itself and land inside it.
    await page.mouse.click(box.x / 2, 300);
    await expect(page.locator('dialog.project-sheet[open]')).toHaveCount(0);
  });

  test('aria-expanded tracks the sheet however it was dismissed', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-sheet-open]').first();

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await openFirstSheet(page);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('the trigger describes the dialog it controls', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-sheet-open]').first();

    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    const controls = await trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test('the dialog is labelled by its own heading', async ({ page }) => {
    await page.goto('/');
    const sheet = await openFirstSheet(page);

    const labelledBy = await sheet.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toHaveText(/\S/);
  });

  test('focus is trapped inside the sheet and restored to the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('[data-sheet-open]').first();
    await openFirstSheet(page);

    // Focus must never reach a control behind the dialog. It may pass through
    // <body> — with a single focusable inside (the close button) that's how
    // Chromium cycles a modal — but the background is inert, so no background
    // control is ever reachable. Asserting "always inside" would be wrong.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const escaped = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return false;
        return !a.closest('dialog.project-sheet[open]');
      });
      expect(escaped).toBe(false);
    }

    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
});
