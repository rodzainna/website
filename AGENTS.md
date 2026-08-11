# Project notes

Personal portfolio at [rodzainna.com](https://rodzainna.com). Astro 7, static output,
**no UI framework** — there are no React/Vue/Svelte islands and no framework
integration installed. Interactivity is plain `<script>` plus platform APIs
(`<dialog>`, `localStorage`). Keep it that way unless there's a concrete reason not to.

**[SPEC.md](./SPEC.md) is the source of truth** for constraints, performance budgets,
interaction invariants and how to verify them. Read it before changing scroll locking,
text scaling, or anything that adds JavaScript. The summary below is a shortcut, not a
replacement — if the two disagree, SPEC.md wins and this file needs updating.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

**Gotcha:** the dev server can serve stale CSS after new Tailwind classes are added,
and stale images when a file is replaced at an unchanged path. If something looks
wrong, restart the server and hard-reload before debugging the code. `astro dev status`
can also lose track of a running process — `lsof -nP -iTCP:4321 -sTCP:LISTEN` is
authoritative.

**Always restart after installing or removing a dependency.** pnpm rewrites the
paths under `node_modules/.pnpm`, and a server started before that keeps stale
module resolution. It presents as `/_image` returning 500 with `MissingSharp` and
every project image broken, which looks like a code bug and isn't — `node -e
"require('sharp')"` will succeed the whole time.

## Conventions

- **Styles** live in `src/styles/global.css`. Colours come from CSS custom
  properties; don't hardcode hex values or `neutral-*` utilities in components.
  Surfaces that are dark in *both* themes use the `*-on-dark` token set.
- **Buttons and pills** come from `src/lib/variants.ts` (CVA). Add a variant
  there rather than a new one-off class string.
- **Projects** are an MDX content collection in `src/content/projects/`.
  Behaviour is driven by frontmatter (`status`, `coverFit`), never by project id.
- **Repeated markup gets a component**, repeated content gets a constant. Nav
  links come from `NAV_LINKS` in `consts.ts` and are mapped over in both the
  desktop bar and the mobile menu.
- **Indexing is blocked** while the site is in progress: `SITE_NOINDEX` in
  `src/consts.ts` *and* `public/robots.txt`. Both must change to launch.
- **Layout changes are verified by measurement in a browser**, at a real
  viewport, measuring the quantity the user sees — not the one that's easiest
  to reach. See SPEC.md § Verification.

## CI and tests

`pnpm check` and `pnpm test` run on **pull requests only** — private repo,
metered minutes. Playwright's `webServer` builds before serving, so there's no
separate build step; a broken build still fails the test job. `pnpm check` fails
on hints as well as errors, so deprecations get fixed while they're one-liners.

**Never commit a résumé PDF.** `public/resume*.pdf` is gitignored and
`tests/no-resume.spec.ts` guards it. See SPEC.md § Résumé for why history, not
just the working tree, is the thing that matters.

Tests are Playwright in `tests/`, run against the built output at desktop and
mobile viewports. Before changing scroll locking, text scaling, the nav or the
colour tokens, read SPEC.md § Verification — it records the specific mistakes
these specs exist to prevent (asserting on painted rather than computed values,
bypassing the real trigger, and passing vacuously when a scrollbar is overlay).

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
