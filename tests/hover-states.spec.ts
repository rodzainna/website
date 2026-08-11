import { test, expect, type Page, type Locator } from '@playwright/test';
import { openFirstSheet } from './helpers';

/**
 * Every interactive control resolves to the teal accent on hover. Before this,
 * buttons hovered to `--foreground` — black in light mode, white in dark —
 * while links hovered to teal, so the two halves of the site disagreed.
 *
 * Asserting the *resolved* colour rather than the class string is the point:
 * `hover:border-cyan` in the markup proves nothing if a later rule wins.
 */

/** Resolves a token to the `rgb(...)` form computed styles report. */
async function tokenColor(page: Page, token: string) {
  return page.evaluate((name) => {
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }, token);
}

/** Polls rather than sleeping — the colour eases in over the transition. */
async function expectHoverColor(el: Locator, prop: 'color' | 'borderTopColor', want: string) {
  await el.hover();
  await expect
    .poll(async () => el.evaluate((e, p) => getComputedStyle(e)[p as 'color'], prop), {
      timeout: 2000,
    })
    .toBe(want);
}

test.describe('hover states', () => {
  /* Tailwind wraps every `hover:` utility in `@media (hover: hover)`, verified
     in the built CSS, so none of these rules apply on a touch device — which is
     correct: a hover style on touch sticks after the tap. Genuinely not
     applicable here rather than quietly unverified; the class-string guard
     below still runs on both projects. */
  test.skip(({ isMobile }) => !!isMobile, 'hover: is gated behind @media (hover: hover)');

  test('the secondary button hovers to teal, not to foreground', async ({ page }) => {
    // The 404 page carries the only `secondary` button left; the home page's
    // was the résumé download, removed with the PDF.
    await page.goto('/does-not-exist', { waitUntil: 'domcontentloaded' });
    const cyan = await tokenColor(page, '--cyan');
    const button = page.getByRole('link', { name: 'View projects' });

    await expect(button).toBeVisible();
    await expectHoverColor(button, 'color', cyan);
    await expectHoverColor(button, 'borderTopColor', cyan);
  });

  test('accessibility rail buttons hover to teal', async ({ page }) => {
    await page.goto('/');
    const cyan = await tokenColor(page, '--cyan');

    const toggle = page.locator('#a11y-toggle');
    if (await toggle.isVisible()) await toggle.click();

    const themeButton = page.locator('#a11y-theme');
    await expectHoverColor(themeButton, 'color', cyan);
    await expectHoverColor(themeButton, 'borderTopColor', cyan);
  });

  test('back to top hovers to teal once it is visible', async ({ page }) => {
    await page.goto('/');
    const cyan = await tokenColor(page, '--cyan');

    await page.evaluate(() => window.scrollTo(0, 900));
    const button = page.locator('#back-to-top');
    await expect(button).toHaveAttribute('data-visible', 'true');

    await expectHoverColor(button, 'color', cyan);
    await expectHoverColor(button, 'borderTopColor', cyan);
  });

  test('footer social links hover to teal', async ({ page }) => {
    await page.goto('/');
    const cyan = await tokenColor(page, '--cyan');
    const github = page.locator('footer a[aria-label^="GitHub"]');

    await expectHoverColor(github, 'color', cyan);
    await expectHoverColor(github, 'borderTopColor', cyan);
  });

  test('the sheet close button hovers to teal', async ({ page }) => {
    await page.goto('/');
    const cyan = await tokenColor(page, '--cyan');

    const sheet = await openFirstSheet(page);
    await expectHoverColor(sheet.locator('[data-sheet-close]'), 'color', cyan);
  });

  test('teal resolves brighter in dark mode, so hovers stay legible', async ({ page }) => {
    await page.goto('/does-not-exist', { waitUntil: 'domcontentloaded' });
    const light = await tokenColor(page, '--cyan');

    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const dark = await tokenColor(page, '--cyan');

    // Same token, different value per theme — a hardcoded hex would break this.
    expect(dark).not.toBe(light);

    const button = page.getByRole('link', { name: 'View projects' });
    await expectHoverColor(button, 'color', dark);
  });

});

test.describe('hover consistency', () => {
  test('nothing hovers to plain foreground any more', async ({ page }) => {
    await page.goto('/');
    // Guards the class strings directly, on both projects: a reintroduced
    // hover:border-foreground would pass every assertion above if it landed on
    // a control the list doesn't name.
    const offenders = await page.evaluate(() =>
      [...document.querySelectorAll('a, button')]
        .filter((el) => /hover:(border|text)-foreground(?![\w-])/.test(el.className))
        .map((el) => el.className)
    );
    expect(offenders).toEqual([]);
  });
});
