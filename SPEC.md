# Specification

The constraints this site has to satisfy, why they exist, and how to check they
still hold. [README](./README.md) covers what the project is and how to run it.

This repository is itself a work sample — the code stands in for production work
that belongs to employers and clients and can't be published. So the repo is
held to the same bar as the code inside it, and decisions get written down here
rather than living in someone's memory.

## Architecture constraints

**Static output.** Astro, `output: 'static'`. No SSR, no server runtime, no
environment secrets. Everything is a file on a CDN.

**No UI framework.** There are no React/Vue/Svelte islands and no framework
integration installed. Interactivity is plain `<script>` plus platform APIs —
`<dialog>`, `localStorage`, `:has()`, `@starting-style`. Adding a framework
needs a concrete reason recorded here, not a preference.

The project panels are the precedent. They began as a React + Radix island
costing 269 KB of JavaScript to render panels that are closed on load.
`showModal()` supplies the focus trap, `Esc` handling, background inertness and
top-layer stacking, so the runtime was removed entirely and the slide-in became
CSS (`@starting-style` + `transition-behavior: allow-discrete`).

**Tailwind 4, CSS-first.** No `tailwind.config`. Theme lives in `@theme` blocks
in `src/styles/global.css`.

## Performance budgets

### JavaScript

Measured from `dist/index.html` after `pnpm build`, uncompressed:

| | |
| --- | --- |
| Astro prefetch runtime (the only external bundle) | 2.4 KB |
| Inline component scripts — nav, project sheets, back-to-top, a11y rail | 3.5 KB |
| Vercel Analytics + Speed Insights | 5.2 KB |

First-party JavaScript should stay under **10 KB uncompressed**. Anything that
would push past it needs to justify itself against the no-framework constraint
above, since that is the budget the constraint exists to protect.

### HTML

Every project's panel — full MDX body and image markup — is rendered into the
initial document whether or not a visitor opens one. That is a deliberate
trade: it's what buys zero JavaScript, no loading state, and panels that work
with a cold cache.

Current cost:

| | |
| --- | --- |
| `index.html` raw | 104 KB |
| `index.html` gzipped | **15 KB** |
| 15 panels | 36% of the document, ~2.5 KB raw each |

The raw number looks alarming and mostly isn't: fifteen near-identical panels
compress extremely well, which is why 104 KB becomes 15 KB over the wire.

**Threshold.** Revisit when the gzipped document passes **30 KB**, or when a
single project body grows beyond a few paragraphs — long, dissimilar bodies stop
compressing against each other and the marginal cost climbs. At that point the
options are lazy-loading panel bodies (costs JavaScript and a loading state) or
giving projects their own routes (costs the panel interaction). Neither is worth
it at 15 KB.

## Styling

**Colour lives in tokens, never in components.** `src/styles/global.css` defines
light and dark values. Components use `bg-background`, `text-muted-foreground`
and so on — never a hex value, never a `neutral-*` utility.

**The `*-on-dark` set is separate on purpose.** Surfaces that are dark in *both*
themes — the terminal blocks, the contact card — can't use theme-aware tokens,
because in light mode those resolve to dark-on-dark. They get a fixed set that
never flips. Getting this wrong is how you end up with 2.6:1 text.

**Contrast floor: 4.5:1** for every foreground/background pairing, including the
`*-on-dark` set. Enforced by `tests/contrast.spec.ts` in both themes — it caught
`--muted-foreground` on `--muted` sitting at 4.43:1 behind the project status
badge, which is why that token is a shade darker than Tailwind's gray-500.

**Shared treatments are defined once.** `src/lib/variants.ts` holds the button
and tag variants (CVA); `.eyebrow`, `.page-prose` and `.container-page` are
utilities in `global.css`. Components compose them rather than repeating class
strings.

**Every interactive control hovers to the teal accent** — `--cyan`, or
`--cyan-on-dark` on the always-dark surfaces. Never to `--foreground`: that
reads as black in light mode and white in dark, and it used to leave buttons
disagreeing with links, which already hovered to teal. Enforced by
`tests/hover-states.spec.ts`, which asserts the *resolved* colour rather than
the class string, and separately fails on any `hover:*-foreground` still in the
markup.

**Repeated markup gets a component.** The nav links live in `NAV_LINKS` in
`consts.ts` and are mapped over in both the desktop bar and the mobile menu; the
availability pill is one component used twice. Two copies of the same markup in
one file is the smell this rule exists to prevent.

## Content model

Projects are an MDX collection in `src/content/projects/`, validated by a Zod
schema in `src/content.config.ts`. The build fails on invalid frontmatter.

**Behaviour is driven by frontmatter, never by project id.** `status` renders
the badge, `coverFit` picks the image fit, `draft` excludes it, `date` sorts the
grid. No component may branch on a filename or slug.

## Résumé

**No résumé PDF is committed, and no page links to one.** `public/resume*.pdf`
is gitignored, and `tests/no-resume.spec.ts` fails on a résumé link, a
`download` attribute, or anything served at the old path.

The reason is git history rather than the file itself. The PDF entered at the
first real commit and carried contact details. On a public repo, deleting it
later would not have helped — any older commit still contains it, and forks and
archives keep their own copies. It was purged from history with `git
filter-repo` and force-pushed; the repo was private throughout, so nothing was
ever published.

Two things that purge does **not** cover, and that matter before going public:

- **GitHub keeps unreachable objects** until its own garbage collection runs.
  Until then a blob can still be fetched by its exact SHA. Ask GitHub Support to
  run `gc` on the repository if that window matters.
- **Vercel keeps previous deployments**, each on its own URL, built from the
  pre-purge tree. Those still serve the old file. Delete the old deployments, or
  enable deployment protection, before flipping visibility.

To offer a résumé again, host it outside the repo and link out, or commit a
version carrying only an email address — never a phone number or street address,
since anything in `public/` is world-readable from the deployed site regardless
of repository visibility.

## Interaction invariants

### Scroll lock

Opening a panel locks background scroll with `overflow: hidden` on `<html>`.
Two quantities must hold at once, and it is easy to fix one while breaking the
other — this has happened twice:

1. **The page must not shift.** Removing the scrollbar frees its width and the
   content box widens, sliding every centred element sideways.
2. **The panel must reach the viewport edge.** Otherwise an empty strip sits
   beside it for as long as it is open.

`scrollbar-gutter: stable` satisfies (1) and breaks (2): it reserves the gutter
*inside* the initial containing block, so a fixed element is laid out against
1425px on a 1440px viewport. `100vw` shrinks with it too, so no CSS length can
recover the difference — `window.innerWidth` is the only measurement that
survives it.

The implementation instead pads the root by the measured scrollbar width, which
shrinks the content box while leaving the containing block at full viewport
width. Viewport-pinned elements (`#a11y-rail`, `#back-to-top-rail`) take the
same compensation or they slide while everything else holds still.

On overlay scrollbars — mobile, tablet, macOS on a trackpad — the measurement is
`0px` and every rule involved is inert.

### Text scaling

The accessibility rail scales the **root font-size**, not `zoom`. `zoom` is a
paint-time visual scale: computed font-size never changes and iOS Safari ignores
it on the root element, so the control silently does nothing on mobile. Every
text and spacing utility here is rem-based, so one property reaches all of them.

Persisted values are clamped to `FONT_SCALE_MIN`/`MAX` by both the writer (the
rail) and the reader (the no-flash loader in `BaseLayout`), so a hand-edited
`localStorage` value can't escape the range the UI allows.

## Accessibility

- `<header>` / `<main>` landmarks, and a skip link that moves focus rather than
  only scrolling (`tabindex="-1"` on the target).
- One focus ring for every interactive control, defined once in the base layer.
- Accessibility rail: theme, text scaling, reduced motion, reset — persisted to
  `localStorage` and applied before first paint, so there is no flash.
- Reduced motion honoured by CSS **and** by JavaScript-driven scrolling; an
  explicit `behavior: 'smooth'` overrides the CSS rule, so JS must check too.
- Dialogs trap focus, close on `Esc` and backdrop, restore focus to their
  trigger, and keep `aria-expanded` accurate however they were dismissed.

## Verification

CI runs `pnpm check` (fails on hints, not just errors) and `pnpm test` on every
pull request — **pull requests only**, since this is a private repo with metered
Actions minutes and running on pushes to main meant every merge re-ran the
checks the PR had just passed. There is no separate `pnpm build` step either:
Playwright's `webServer` builds before it serves, so a standalone build compiled
the site twice per run. A broken build still fails the test job.

Tests are Playwright, in `tests/`, against the **built** output rather than the
dev server — the dev server can serve stale CSS, and `dist/` is what ships. Two
projects run every spec: `desktop` at 1440×900 and `mobile` on a Pixel 5.

Every invariant on this page has a spec:

| Spec | Covers |
| --- | --- |
| `scroll-lock.spec.ts` | Both invariants above, the compensation arithmetic, and that the background can't be scrolled |
| `text-scaling.spec.ts` | Computed font-size changes, clamping, float drift, persistence, reset |
| `dialog.spec.ts` | Open, Esc, backdrop, close button, `aria-expanded`, labelling, focus containment and restoration |
| `nav.spec.ts` | Both menus agree, targets exist, links absolute, mobile open/dismiss/Escape |
| `contrast.spec.ts` | Every token pairing in the table above, both themes, plus a check on the ratio maths itself |
| `hover-states.spec.ts` | Every control resolves to teal on hover, in both themes |
| `footer.spec.ts` | Social hrefs, `rel=noopener`, accessible names, footer on every page |
| `schema.spec.ts` | `toJsonLd` escaping, `Person` shape, the noindex pair, 404 canonical |
| `a11y-rail.spec.ts` | Theme and reduced motion: toggle, persistence, no-flash load, OS preference, JS-driven scroll |
| `availability-pill.spec.ts` | Text-only pill, teal border and text, rendered in both menus |
| `no-resume.spec.ts` | No résumé link, asset or `download` attribute in the build |

### Rules these tests encode

**Measure the quantity the user sees.** Both scroll-lock bugs violated this.
The page-shift fix shipped with precise before/after numbers for the header and
heading positions, and a visible strip beside the panel, because the panel's own
edge was never measured. Precise measurement of the wrong quantity reads as more
certain than no measurement at all.

**Assert on computed values, not painted ones.** `text-scaling.spec.ts` asserts
`getComputedStyle(...).fontSize`, never a bounding box. A bounding-box assertion
would have passed against the broken `zoom` implementation, because Chrome
scales `getBoundingClientRect` by the zoom while computed font-size stays put.

**Drive the real trigger.** Sheets are opened by clicking the card, not by
calling `showModal()` — the trigger sets `--scrollbar-width`, so bypassing it
tests a state the product never reaches.

**Use real input for user actions.** `overflow: hidden` blocks user scrolling
but not programmatic `scrollTo`, so scroll-lock is asserted with
`mouse.wheel()`. Asserting against `scrollTo` would fail a correct
implementation.

**Wait on the condition, never on a duration, and don't retry.** There are no
`waitForTimeout` calls: waits poll the thing being waited for — the sheet's box
until it stops moving, `scrollY` until it comes to rest — so they can't rot when
a transition duration changes in `global.css`. `retries` is `0` for the same
reason: retries plus sleeps let a genuinely flaky test go green unseen.

**Never reuse a running server.** `reuseExistingServer` is off. When something
already answers on the port, Playwright skips the whole command — including the
build — and the suite tests whatever that server happens to hold. This repo has
lost time to stale servers twice.

**Prove a new test can fail.** Break the implementation, watch it go red, put it
back. Every guard here has been through that: reverting to `scrollbar-gutter:
stable` reddens four scroll-lock specs, reverting the secondary hover reddens
four hover specs, and dropping the `reduce-motion` check in `BackToTop`
reddens the instant-scroll spec with `Expected 0, Received 1200`.

**A permanent skip is a deleted test.** The compensation assertion needs a
classic scrollbar. macOS follows the system overlay-scrollbar setting and no
Chromium flag overrides it — and `ubuntu-latest` reports `0` as well, checked
against a real CI run rather than assumed. So a spec that waits for a genuine
classic scrollbar never executes anywhere, and skipping is only a tidier way of
not testing.

It is split instead: one spec asserts the measurement (`--scrollbar-width`
equals `innerWidth - clientWidth`, which holds at `0` too), and one forces the
value to `15px` and asserts what the stylesheet does with it. Verified to fail
by reverting the implementation to `scrollbar-gutter: stable` — four specs go
red with the 1440-versus-1425 signature, on macOS, where the real scrollbar is
zero. Do that whenever a test's failure mode isn't obvious; a test never seen
red is a guess.

## Search indexing

**The site is permanently excluded from search engines.** This is a settled
decision, not a pre-launch state and not an oversight — do not "fix" it, and do
not flag it in a review.

Two mechanisms enforce it, and they belong together:

1. `SITE_NOINDEX` in `src/consts.ts` — drives `<meta name="robots">`
2. `public/robots.txt` — `User-agent: * / Disallow: /`

The site is reached by a link given directly to someone, so discovery through
search is not wanted. `tests/schema.spec.ts` asserts the meta tag stays
`noindex, nofollow`, so a change has to be deliberate.

The metadata that remains is the metadata that still does work without
indexing: **Open Graph and the Twitter card** drive the link preview when the
URL is pasted into LinkedIn, Slack or iMessage, which is exactly how this site
gets shared. Canonical URLs and the JSON-LD `Person` cost nothing and are
correct if the decision ever changes.

`sitemap-index.xml` is the exception — it is generated and linked while
`robots.txt` disallows everything, so nothing will ever read it. Known and
accepted; inert rather than harmful.
