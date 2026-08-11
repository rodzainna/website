# Project notes

Personal portfolio at [rodzainna.com](https://rodzainna.com). Astro 7, static output,
**no UI framework** — there are no React/Vue/Svelte islands and no framework
integration installed. Interactivity is plain `<script>` plus platform APIs
(`<dialog>`, `localStorage`). Keep it that way unless there's a concrete reason not to.

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

## Conventions

- **Styles** live in `src/styles/global.css`. Colours come from CSS custom
  properties; don't hardcode hex values or `neutral-*` utilities in components.
  Surfaces that are dark in *both* themes use the `*-on-dark` token set.
- **Buttons and pills** come from `src/lib/variants.ts` (CVA). Add a variant
  there rather than a new one-off class string.
- **Projects** are an MDX content collection in `src/content/projects/`.
  Behaviour is driven by frontmatter (`status`, `coverFit`), never by project id.
- **Indexing is blocked** while the site is in progress: `SITE_NOINDEX` in
  `src/consts.ts` *and* `public/robots.txt`. Both must change to launch.

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
