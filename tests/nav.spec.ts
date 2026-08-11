import { test, expect } from '@playwright/test';

/**
 * Both menus render from NAV_LINKS in consts.ts. The regression this guards
 * is the two drifting apart, which is what the duplicated markup allowed.
 */
const EXPECTED = [
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' },
];

test.describe('navigation', () => {
  test('both menus render the same links in the same order', async ({ page }) => {
    await page.goto('/');

    const menus = await page.evaluate(() =>
      [...document.querySelectorAll('header nav')].map((nav) =>
        [...nav.querySelectorAll('a')].map((a) => ({
          label: a.textContent!.trim(),
          href: a.getAttribute('href'),
        }))
      )
    );

    expect(menus).toHaveLength(2);
    for (const menu of menus) expect(menu).toEqual(EXPECTED);
  });

  test('every nav target exists on the page', async ({ page }) => {
    await page.goto('/');
    for (const { href } of EXPECTED) {
      const id = href.replace('/#', '');
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('links are absolute so they work from other pages', async ({ page }) => {
    await page.goto('/privacy');
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('header nav a')].map((a) => a.getAttribute('href'))
    );
    for (const href of hrefs) expect(href).toMatch(/^\/#/);
  });

  test('the wordmark marks itself current only on home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header a[href="/"]')).toHaveAttribute('aria-current', 'page');

    await page.goto('/privacy');
    await expect(page.locator('header a[href="/"]')).not.toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'the menu only exists below md');

  test('opens, dismisses on outside click, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const details = page.locator('#mobile-nav');
    const summary = details.locator('summary');

    await expect(details).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(details).toHaveAttribute('open', '');

    // A viewport coordinate below the sticky header — clicking an element the
    // header overlaps would be intercepted by the header instead.
    const header = (await page.locator('header').boundingBox())!;
    await page.mouse.click(30, header.y + header.height + 120);
    await expect(details).not.toHaveAttribute('open', '');

    await summary.click();
    await page.keyboard.press('Escape');
    await expect(details).not.toHaveAttribute('open', '');

    // Escape returns focus to the trigger rather than dropping it to body.
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  });

  test('choosing a link closes the menu', async ({ page }) => {
    await page.goto('/');
    const details = page.locator('#mobile-nav');

    await details.locator('summary').click();
    await details.locator('a').first().click();

    await expect(details).not.toHaveAttribute('open', '');
  });
});
