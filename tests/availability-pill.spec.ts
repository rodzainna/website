import { test, expect } from '@playwright/test';

/**
 * One component rendered twice — the desktop header bar and the mobile menu —
 * so a change to it has to be checked in both places, not just the one that
 * happens to be visible at the current viewport.
 */
test.describe('availability pill', () => {
  test('renders as text only, with no status dot', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('header span', { hasText: /^AVAILABLE$/ });

    await expect(pills).toHaveCount(2);
    // The dot was the pill's only child element.
    for (let i = 0; i < 2; i++) {
      await expect(pills.nth(i).locator('span')).toHaveCount(0);
    }
  });

  test('border and text both resolve to the teal token', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) await page.locator('#mobile-nav summary').click();

    const pill = page
      .locator('header span', { hasText: /^AVAILABLE$/ })
      .filter({ visible: true })
      .first();
    await expect(pill).toBeVisible();

    const cyan = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue('--cyan')
        .trim();
      document.body.appendChild(probe);
      const out = getComputedStyle(probe).color;
      probe.remove();
      return out;
    });

    const styles = await pill.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, border: cs.borderTopColor };
    });

    expect(styles.color).toBe(cyan);
    expect(styles.border).toBe(cyan);
  });

  test('--success is no longer referenced by any element', async ({ page }) => {
    await page.goto('/');
    // The dot was the token's only consumer; this catches it being
    // reintroduced by accident rather than by decision.
    const users = await page.evaluate(() =>
      [...document.querySelectorAll('*')].filter((el) =>
        /(^|\s)(bg|text|border)-success(\s|$)/.test(el.className?.toString?.() ?? '')
      ).length
    );
    expect(users).toBe(0);
  });
});
