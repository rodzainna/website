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
`*-on-dark` set.

**Shared treatments are defined once.** `src/lib/variants.ts` holds the button
and tag variants (CVA); `.eyebrow`, `.page-prose` and `.container-page` are
utilities in `global.css`. Components compose them rather than repeating class
strings.

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

CI runs `pnpm check` (fails on hints, not just errors) and `pnpm build` on every
pull request. Neither catches rendered-layout regressions, so the invariants
above are checked by measurement, in a browser, at a real viewport.

The rule that both scroll-lock bugs violated: **measure the quantity the user
sees.** The page-shift fix was verified with precise before/after numbers for
the header and heading positions, and shipped with a visible strip beside the
panel, because the panel's own edge was never measured. Precise measurement of
the wrong quantity reads as more certain than no measurement at all.

For a scroll-lock change that means, at minimum:

```
window.innerWidth
header.getBoundingClientRect().right      // page didn't shift
dialog.getBoundingClientRect().right      // panel reaches the edge
#a11y-rail / #back-to-top-rail .right     // pinned elements held
```

taken closed → open → closed, driven through the real trigger rather than by
calling `showModal()` directly, and repeated at a mobile viewport where the
measurement should be `0px` and every rule inert.

## Launch checklist

Search engines are blocked deliberately while the site is in progress. To go
live, flip **both** together:

1. `SITE_NOINDEX` in `src/consts.ts` → `false`
2. `public/robots.txt` → remove `Disallow: /`

Everything else — canonical URLs, Open Graph, Twitter card, JSON-LD `Person`,
sitemap, 1200×630 social image — is already in place.
