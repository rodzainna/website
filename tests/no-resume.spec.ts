import { test, expect } from '@playwright/test';

/**
 * The résumé PDF was removed from the repo and purged from git history, so the
 * repo can go public without publishing contact details permanently. These
 * guard the two ways it could come back: an asset committed again, or a link
 * to one reintroduced in the markup.
 *
 * See SPEC.md § Résumé.
 */
test.describe('no résumé in the build', () => {
  test('no page links to a résumé asset', async ({ page }) => {
    for (const path of ['/', '/privacy', '/does-not-exist']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '')
      );
      expect(hrefs.filter((h) => /resume|\.pdf($|\?)/i.test(h))).toEqual([]);
    }
  });

  test('nothing is served at the old résumé path', async ({ page }) => {
    const res = await page.request.get(
      '/resume-rodzainna-hamisain-senior-fullstack-developer.pdf'
    );
    expect(res.status()).toBe(404);
  });

  test('no download attribute survives anywhere', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[download]')).toHaveCount(0);
  });
});
