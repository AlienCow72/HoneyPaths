# AGENTS.md

## Project

Honey Path Designs (HoneyPaths) is Joe and Saris's handmade earrings, stickers, and art discovery website. It uses Astro 7, strict TypeScript, semantic Astro components, plain client-side scripts, and shared CSS. Checkout happens on Mayhem Market or Etsy; this repository does not implement a cart or payment flow.

Use the actual source and `package.json` as the authority when older documentation differs. Do not add a client framework, CMS, or additional backend service without a concrete need.

## Content and structure

- `src/layouts/Layout.astro`: shared header, footer, navigation, self-hosted font imports, metadata, canonical URLs, and skip link.
- `src/styles/global.css`: sitewide color and typography tokens, component styles, responsive layouts, and reduced-motion rules. Prefer changes here over scattered overrides.
- `src/components/Icon.astro`: shared inline SVG icons, including the bee. Icons use `currentColor`; decorative SVGs are hidden from assistive technology. Give icon-only links an accessible name.
- `src/components/ProductCard.astro`: product cards, related products, and catalog filter data attributes.
- `src/data/products.json`: product source of truth. `src/data/sources.json` records provenance and verification limits. Product images live in `public/images` and are referenced as `/images/...`.
- `src/pages`: homepage, `/about`, `/shop`, `/shop/[id]`, `/blog`, `/blog/[id]`, and the 404 page. Legacy collection redirects are in `astro.config.mjs`; `/shop-links` redirects to `/shop`.
- `src/content/blog/*.md` and `src/content.config.ts`: file-based posts and their front matter schema.
- `src/components/InstagramFeed.astro`, `src/pages/api/instagram.ts`, and `src/lib/instagram.mjs`: studio fallback, public feed endpoint, normalization, and server-side caching.
- `tests/*.test.mjs`: Node tests for catalog integrity and Instagram behavior. `scripts/new-post.mjs` creates Markdown drafts.

### Catalog and publishing rules

Preserve product IDs, source links, local image transparency, categories, and tags. Tags include the product category. The current migration contains 57 image/listing combinations, and the catalog test asserts that count; update it deliberately if the catalog changes.

Do not invent prices, stock, materials, or listing matches. Set `etsyUrl` only for a verified exact Etsy listing; otherwise keep it `null`. The separately labeled general Etsy shop link is not a product match. Keep checkout links on the marketplaces.

Preserve combined search/category/tag filters, sorting, shareable URL parameters (`category`, `tag`, `q`, `sort`), browser history handling, and the full catalog without JavaScript.

Create a post with `npm run new-post -- "Post title"`. Front matter uses `title`, `description`, `date`, `category`, `image`, `imageAlt`, `tone` (`pink`, `sage`, or `lilac`), and `draft`. New posts start as drafts; drafts must stay excluded from the homepage, blog index, and generated post routes. Publishing requires setting `draft: false`, rebuilding, and deploying.

## Design and accessibility

Preserve the established cream/lilac/sage/blush/butter palette and dark green ink in the CSS custom properties. Typography pairs Fraunces headings with DM Sans body text, self-hosted through `@fontsource` imports. Keep the friendly handmade voice, product collage, and subject-focused product images.

The user requested larger text across the entire site and then larger bee branding. Preserve these decisions:

- Use relative font sizes and fluid headings that respect browser font preferences. The current root size is `115%`, body text is roughly 18–19px at standard browser defaults, and small labels are at least about 14px. Do not restore the old 5–13px labels or shrink mobile text to force a fit.
- Allow navigation, actions, metadata, filters, and footer content to wrap. Headers grow with their content. The narrowest product grid uses one column at widths up to 380px. Keep long text from causing horizontal overflow.
- Header and footer bee SVGs are 64px and 56px on desktop in `Layout.astro`; at widths up to 850px, CSS sets them to 48px and 44px. When changing icon sizes, account for both the SVG attributes and responsive CSS, and preserve square proportions.
- Keep meaningful image alt text, visible keyboard focus, the skip link, accessible control labels, filter `aria-pressed` states, and the live product result count.
- Respect `prefers-reduced-motion`. Keep hover effects modest and avoid adding motion that obstructs reading or interaction.

For visual changes, inspect rendered output at desktop, tablet, and mobile widths, including 320–390px. Check long product names, labels, navigation, cards, and footer content. Test text enlarged to 200% for typography/layout changes; distinguish simulated text enlargement from actual browser zoom or physical-device testing. Larger fonts alone do not establish full accessibility compliance.

## Commands and validation

Use Node 22.19+; `.nvmrc` selects Node 24. Install locked dependencies with `npm ci`.

```sh
npm run dev          # Loopback dev server, normally port 4321
npm run check        # Astro/TypeScript diagnostics
npm test             # Node catalog and Instagram tests
npm run format:check # Whole-repository Prettier check
npm run build        # Production standalone Node build
npm run build:pages  # Static GitHub Pages build
npm run verify:pages # Verify generated Pages links/assets and fallback
npm start            # Run dist/server/entry.mjs, loading .env if present
```

`npm run preview` previews the build locally. Set `HOST=127.0.0.1 PORT=4321` when running the production server locally. Reuse an existing project dev server when appropriate.

Run checks relevant to the change: Astro check and build for source changes; `npm test` for catalog/feed logic changes; targeted Prettier checks for changed files; and `git diff --check`. For documentation-only changes, validate formatting and factual accuracy without rebuilding the site. `npm run format` rewrites the entire repository; prefer targeted formatting to avoid unrelated changes. Report unrelated existing check failures separately.

When available in T3 Code, use the collaborative preview tools for rendered checks: start with `preview_status`, open a preview if needed, then navigate, resize, and inspect it. Report only checks actually performed.

## Instagram and secrets

Live Instagram access requires owner-authorized credentials. Use `.env.example` as the configuration reference: `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`, and `INSTAGRAM_API_VERSION`. Never commit real `.env` files, expose tokens in client code or `PUBLIC_` variables, or log credentials.

Preserve the clearly labeled studio collection when the feed is unconfigured or unavailable; do not describe fallback images as recent Instagram posts. The feed returns public photo fields only, sorts newest first, excludes video-only posts, and displays up to four image/carousel posts. Keep HTTPS/link validation, authorization headers, request timeouts, concurrent request coalescing, the 15-minute successful cache, failure backoff, and the one-hour stale-data limit. Cache is per server process. Do not claim live integration validation without authorized credentials and an actual live check.

## Build and deployment

`npm run build` uses `output: "server"`, the standalone `@astrojs/node` adapter, and `site: "https://honeypaths.com"`. Content pages are prerendered; `/api/instagram` is a runtime server endpoint. This mode requires a Node-capable host and HTTPS. `npm run build:pages` sets `PUBLIC_PAGES_BUILD=true` for static output, with an empty unconfigured feed response and no browser feed request. Never read Instagram credentials in Pages mode.

`.github/workflows/deploy.yml` validates and deploys static output on pushes to `main` or manual dispatch from `main`. It gets `PAGES_SITE` and `PAGES_BASE` from `actions/configure-pages`; local Pages builds default to `https://kyleanderson.online/HoneyPaths/`. Keep the same origin/base for build and `verify:pages`. An empty `PAGES_BASE` supports root hosting. The PR workflow runs checks, tests, formatting validation, and both build modes without deployment.

Use `src/lib/paths.mjs` (`withBase`, `withoutBase`) for local links, images, metadata, feed requests, and navigation comparisons. `src/lib/markdown-base-links.mjs` prefixes Markdown URLs. Keep legacy redirect destinations base-aware. Run `verify:pages` after changing routes, links, Markdown, or deployment settings; it verifies the actual static artifact and rejects server output. Do not bypass dependency peer conflicts with `--force` or `--legacy-peer-deps`. Astro checker currently supports TypeScript 5/6, not TypeScript 7. Prefer Node type definitions matching the Node 24 CI runtime.

Do not assert that the current build is deployed merely because a workflow or older note names a URL. Verify the relevant hosting configuration and deployment result when deployment is requested. Preserve user changes and avoid unrelated workflow, content, or dependency edits during a scoped task.
