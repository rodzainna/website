# rodzainna.com

Personal portfolio for **Rodzainna Hamisain**, Senior Full-Stack Developer.

Built with [Astro](https://astro.build) as a static site, deployed on Vercel.

> Search indexing is currently disabled while the site is being finished — see
> [Launch checklist](#launch-checklist).

## Stack

| | |
| --- | --- |
| Framework | Astro 7 (static output) |
| Styling | Tailwind CSS 4, CSS-first config — no `tailwind.config` |
| Content | MDX content collections with a Zod schema |
| Type variants | `class-variance-authority` |
| Fonts | Inter Variable, JetBrains Mono Variable (self-hosted) |
| Analytics | Vercel Web Analytics + Speed Insights |
| Package manager | pnpm, Node >= 20 |

**No UI framework.** There are no React/Vue/Svelte islands and no framework
integration installed. All the JavaScript on the home page, uncompressed:

| | |
| --- | --- |
| Astro prefetch runtime (`_astro/page.*.js`, the only external bundle) | 2.4 KB |
| Inline component scripts — nav, project sheets, back-to-top, a11y rail | 3.5 KB |
| Vercel Analytics + Speed Insights | 5.2 KB |

Measured from `dist/index.html` after `pnpm build`.

## Decisions worth knowing

**Project detail panels use a native `<dialog>`.** They started as a React +
Radix island, which cost 269 KB of JavaScript to render panels that are closed
on load. `showModal()` provides the focus trap, `Esc` handling, inert background
and top-layer stacking for free, so the runtime was removed entirely. The
slide-in animation is CSS (`@starting-style` + `transition-behavior: allow-discrete`).

**Colour lives in tokens, never in components.** `src/styles/global.css` defines
light and dark values, plus a fixed `*-on-dark` set for surfaces that stay dark
in _both_ themes (the terminal blocks and the contact card). Those can't use
theme-aware tokens, and getting that wrong is how you end up with 2.6:1 text.
Every foreground/background pairing is at or above **4.5:1**.

**Shared styling is defined once.** `src/lib/variants.ts` holds the button and
tag variants; `.eyebrow`, `.page-prose` and `.container-page` are utilities in
`global.css`. Components compose them rather than repeating class strings.

**Content drives behaviour.** A project's status badge and image fit come from
its frontmatter (`status`, `coverFit`), not from checks against its filename.

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

| Command | Does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build to `dist/` |
| `pnpm preview` | Serve the built output |
| `pnpm check` | `astro check` — type and template diagnostics |

> **Dev server gotcha:** it can serve stale CSS after new Tailwind classes are
> added, and stale images when a file is replaced at an unchanged path. If
> something looks wrong, restart and hard-reload before debugging the code.
> `astro dev status` can also lose track of a running process —
> `lsof -nP -iTCP:4321 -sTCP:LISTEN` is authoritative.

## Structure

```
src/
├─ components/        Header, Hero, Skills, Projects, Experience, Contact,
│                     Footer, Terminal, AccessibilityRail, Button, Tag …
├─ content/projects/  One .mdx per project + its cover image
├─ layouts/           BaseLayout — head, metadata, JSON-LD, skip link
├─ lib/               variants.ts (CVA), schema.ts (JSON-LD), utils.ts (cn)
├─ pages/             index, privacy, 404
├─ styles/global.css  Tokens, base layer, utilities, dialog styles
└─ consts.ts          Site metadata, skills, experience
```

## Adding a project

Drop an `.mdx` file into `src/content/projects/` with its cover beside it:

```mdx
---
title: Project name
kicker: CLIENT
description: One sentence, shown on the card and in the panel.
tags: [React, TypeScript]
cover: ./project-cover.webp
coverFit: cover        # or `contain` for logo-style images
status: In development # optional badge next to the title
date: 2025-03-01       # sorts the grid, newest first
draft: false
---

Body content becomes the detail panel.
```

The schema lives in `src/content.config.ts`; the build fails on invalid
frontmatter.

## Accessibility

- `<header>` / `<main>` landmarks and a working skip link
- One focus ring for every interactive control
- Accessibility rail: theme, text scaling, reduced motion, reset — persisted to
  `localStorage`, applied before first paint so there's no flash
- Reduced motion is honoured by CSS **and** by JavaScript-driven scrolling
- Dialogs trap focus, close on `Esc`/backdrop, and lock background scroll
  without shifting the page

## Launch checklist

Search engines are blocked deliberately. To go live, flip **both** together:

1. `SITE_NOINDEX` in `src/consts.ts` → `false`
2. `public/robots.txt` → remove `Disallow: /`

Everything else — canonical URLs, Open Graph, Twitter card, JSON-LD `Person`,
sitemap, 1200×630 social image — is already in place.

## Licence

Code is available for reference. Content, images, résumé and branding are not
licensed for reuse.
