import { test, expect } from '@playwright/test';
import { buildPersonSchema, toJsonLd } from '@/lib/schema';

/**
 * Pure functions, no browser needed. `toJsonLd` is the security-relevant one:
 * it feeds a <script> via `set:html`, which does not escape.
 */
test.describe('JSON-LD', () => {
  test('escapes < so a payload cannot close the script tag early', () => {
    const out = toJsonLd({ name: 'x</script><img src=x onerror=alert(1)>' });

    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<img');
    expect(out).toContain('\\u003c');
  });

  test('stays valid JSON after escaping', () => {
    const input = { a: '<b>', c: ['</script>'] };
    expect(JSON.parse(toJsonLd(input))).toEqual(input);
  });

  test('person schema carries the fields the rich result needs', () => {
    const schema = buildPersonSchema({
      url: 'https://rodzainna.com/',
      image: 'https://rodzainna.com/og-image.png',
    });

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Person');
    expect(schema.name).toBeTruthy();
    expect(schema.jobTitle).toBeTruthy();
    expect(schema.email).toMatch(/^mailto:/);
    expect(schema.sameAs.length).toBeGreaterThan(0);
    expect(schema.knowsAbout.length).toBeGreaterThan(0);
  });

  test('knowsAbout is flattened, not nested groups', () => {
    const { knowsAbout } = buildPersonSchema({ url: 'https://x/', image: 'https://x/i.png' });
    expect(knowsAbout.every((s) => typeof s === 'string')).toBe(true);
  });
});

test.describe('rendered document', () => {
  test('embeds parseable JSON-LD', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const parsed = JSON.parse(raw!);
    expect(parsed['@type']).toBe('Person');
  });

  test('stays noindex — a permanent decision, not a pre-launch state', async ({ page }) => {
    await page.goto('/');
    // SPEC.md § Search indexing. Paired with robots.txt; if this fails, the
    // change needs to be deliberate rather than a passing edit.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
  });

  test('robots.txt still disallows everything', async ({ page }) => {
    // The meta tag alone isn't the policy — both halves have to hold.
    const res = await page.request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toMatch(/Disallow:\s*\/\s*$/m);
  });

  test('the 404 page emits no canonical URL', async ({ page }) => {
    await page.goto('/does-not-exist', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
