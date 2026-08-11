# rodzainna.com

Personal portfolio for **Rodzainna Hamisain**, Senior Full-Stack Developer.

Built with [Astro](https://astro.build) as a static site, deployed on Vercel.

> Search indexing is currently disabled while the site is being finished — see
> the [launch checklist](./SPEC.md#launch-checklist).

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
integration installed — interactivity is plain `<script>` plus platform APIs.
First-party JavaScript is under 6 KB uncompressed.

The constraints behind that, and the rest of the decisions worth knowing, are in
[SPEC.md](./SPEC.md).

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
| `pnpm check` | `astro check` — fails on errors, warnings *and* hints |
| `pnpm test` | Playwright, against the built output |
| `pnpm test:ui` | Playwright in watch/inspect mode |

CI runs `pnpm check` and `pnpm test` on every pull request.

> **First run:** `pnpm exec playwright install chromium`.

> **After changing dependencies, restart the dev server.** pnpm rewrites the
> paths under `node_modules/.pnpm`, and a server started beforehand keeps stale
> module resolution — which surfaces as `/_image` returning 500 with
> `MissingSharp` and every project image failing to render.

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
└─ consts.ts          Site metadata, nav, skills, experience

tests/                Playwright specs + shared helpers
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
frontmatter. Panels ship in the initial HTML, so see the
[HTML budget](./SPEC.md#html) before adding many more.

## Licence

Code is available for reference. Content, images, résumé and branding are not
licensed for reuse.
