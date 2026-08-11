import { test, expect } from '@playwright/test';

/**
 * The social links are the two a recruiter actually follows, so a typo'd or
 * dead href costs more here than anywhere else on the site.
 */
const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/rodzainna' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rodzainnahamisain' },
];

test.describe('footer', () => {
  for (const { label, href } of SOCIALS) {
    test(`${label} points at the right profile and opens safely`, async ({ page }) => {
      await page.goto('/');
      const link = page.locator(`footer a[aria-label^="${label}"]`);

      await expect(link).toHaveAttribute('href', href);
      await expect(link).toHaveAttribute('target', '_blank');
      // Without noopener the opened tab can reach back through window.opener.
      await expect(link).toHaveAttribute('rel', /noopener/);
    });
  }

  test('icon-only links carry an accessible name that flags the new tab', async ({
    page,
  }) => {
    await page.goto('/');
    for (const { label } of SOCIALS) {
      await expect(page.getByRole('link', { name: `${label} (opens in a new tab)` })).toHaveCount(
        1
      );
    }
  });

  test('the icons themselves are hidden from assistive tech', async ({ page }) => {
    await page.goto('/');
    const svgs = page.locator('footer a svg');
    await expect(svgs).toHaveCount(SOCIALS.length);
    for (let i = 0; i < SOCIALS.length; i++) {
      await expect(svgs.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('appears on every page, with a working privacy link', async ({ page }) => {
    for (const path of ['/', '/privacy', '/does-not-exist']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('footer a[href="/privacy"]')).toHaveCount(1);
    }
  });
});
