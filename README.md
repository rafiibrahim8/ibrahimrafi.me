# ibrahimrafi.me

My personal website — a backend/software engineer's portfolio, writing, and a
small steganography toy. Built with [Astro](https://astro.build), vanilla CSS,
and self-hosted fonts; deployed on Cloudflare Pages.

## Stack

- **[Astro 5](https://astro.build)** — static site generator, ships ~zero JS by default
- **Vanilla CSS** with custom properties (no framework) — design system in `src/styles/global.css`
- **[@fontsource](https://fontsource.org)** — self-hosted Anton (display) + IBM Plex Sans/Mono, preloaded
- **Markdown content collections** for the blog, with RSS + sitemap
- **pnpm** · **TypeScript** (strict)

## Develop

```bash
pnpm install
pnpm dev          # dev server at http://localhost:4321
pnpm build        # type-check (astro check) + build to dist/
pnpm preview      # serve the production build locally
```

Requires Node 22+ and pnpm.

## Structure

```
src/
  layouts/Base.astro       # <head>, meta/OG, nav, footer, font preloads
  components/              # Nav, Footer, ProofCard, Prose
  styles/global.css        # design tokens + shared styles
  content/writing/         # blog posts (Markdown)
  content.config.ts        # writing collection schema
  pages/
    index.astro            # home
    work.astro             # experience + projects
    research.astro         # thesis + publications
    writing/               # blog index + [slug] post pages
    about.astro
    steg.astro             # client-side steganography tool
    rss.xml.ts             # RSS feed
    404.astro
public/                    # favicon, apple-touch-icon, OG image, robots.txt
```

## Writing a post

Drop a Markdown file in `src/content/writing/`:

```markdown
---
title: Post title
emoji: 🪡
date: 2026-06-10
tags: [tag-one, tag-two]
draft: false
---

Body in Markdown. Code blocks get a copy button automatically.
```

Set `draft: true` to keep it out of the build, the index, and the RSS feed.

## The steganography page

`/steg` is a fully client-side tool — nothing uploaded leaves the browser:

- **Hide** text inside an image using least-significant-bit (LSB) encoding, then download the PNG.
- **Reveal** hidden text from a PNG made with this tool.
- **Decode** zero-width-character payloads hidden in ordinary text.

The encode/decode logic lives in `src/scripts/steg.ts` (image LSB) and
`src/scripts/zerowidth.ts` (zero-width text).

## Deploy

Cloudflare Pages, building from this repo:

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Node version:** 22+

## License

[MIT](./LICENSE) © Ibrahim Rafi. The site code is MIT-licensed; the written
content (blog posts, copy) and brand assets are not — please don't republish
those as your own.
