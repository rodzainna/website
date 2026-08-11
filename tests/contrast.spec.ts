import { test, expect } from '@playwright/test';
import { contrastRatio, parseColor } from './helpers';

/**
 * SPEC.md commits to 4.5:1 for every foreground/background pairing. The
 * `*-on-dark` set is the part that breaks silently: those surfaces are dark in
 * *both* themes, so a theme-aware token resolves to dark-on-dark in light mode
 * and lands around 2.6:1 without anything looking obviously wrong.
 */
const AA = 4.5;

const PAIRS = [
  ['--foreground', '--background'],
  ['--muted-foreground', '--background'],
  ['--cyan', '--background'],
  ['--muted-foreground', '--muted'],
  ['--primary-foreground', '--primary'],
  ['--foreground-on-dark', '--surface-on-dark'],
  ['--muted-foreground-on-dark', '--surface-on-dark'],
  ['--cyan-on-dark', '--surface-on-dark'],
] as const;

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} theme meets ${AA}:1 on every token pairing`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((t) => {
      document.documentElement.classList.toggle('dark', t === 'dark');
    }, theme);

    const tokens = await page.evaluate((names) => {
      const cs = getComputedStyle(document.documentElement);
      return Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()]));
    }, PAIRS.flat() as unknown as string[]);

    const failures: string[] = [];
    for (const [fg, bg] of PAIRS) {
      const ratio = contrastRatio(parseColor(tokens[fg]), parseColor(tokens[bg]));
      if (ratio < AA) {
        failures.push(`${fg} on ${bg} — ${ratio.toFixed(2)}:1 (${tokens[fg]} / ${tokens[bg]})`);
      }
    }

    expect(failures, `contrast failures in ${theme} theme:\n${failures.join('\n')}`).toEqual(
      []
    );
  });
}

test('the contrast helper agrees with known WCAG values', () => {
  // Guards the maths itself — a broken helper would pass everything above.
  expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1);
  expect(contrastRatio([255, 255, 255], [255, 255, 255])).toBeCloseTo(1, 5);
  expect(contrastRatio(parseColor('#777777'), parseColor('#ffffff'))).toBeCloseTo(4.48, 1);
});
