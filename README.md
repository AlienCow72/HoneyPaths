# Honey Path Designs

An Astro rebuild of [honeypaths.com](https://honeypaths.com), with a pastel cream/lilac/sage/blush palette, original transparent product images, a unified filterable catalog, owner-editable announcement posts, and a dedicated about page.

## Run locally

Use Node 22.19+ (Node 24 LTS recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Astro (normally http://127.0.0.1:4321).

```sh
npm run check
npm test
npm run format:check
npm run build
npm start
```

The production build uses the Astro Node standalone adapter. Most pages are prerendered; the Instagram endpoint runs on the server. Set `HOST=127.0.0.1 PORT=4321` when testing the production server locally. Public deployment needs a Node-capable host and HTTPS. This project has not been deployed and does not modify the existing website.

## Products and Etsy matches

Edit `src/data/products.json`. The catalog migrates 57 image/listing combinations from the original site, including two separate images for the tie-dyed guitar pick listing. Listings retain the original Mayhem Market URLs and source URLs; no prices or stock levels were invented. Images are local copies of the site's original assets; transparent PNGs remain transparent.

Each product has `category`, `tags`, `shopUrl`, and optional `etsyUrl`. Search and category/style filters work together, and the current selection is reflected in the URL for sharing. Without JavaScript, the entire collection remains available.

Etsy's device-verification page prevented verification of individual matches during this rebuild. `etsyUrl` remains `null` until an exact match is confirmed. Every product page includes a separately labeled link to the general Etsy shop. To add a verified match, paste its actual `https://www.etsy.com/listing/...` URL into `etsyUrl`; the item then displays a direct Etsy purchase link. Do not substitute shop/search URLs for exact listing matches.

Current pricing, options, materials, and availability stay with the original marketplaces. This site is a discovery catalog, with checkout on Mayhem Market or Etsy.

## Automatic Instagram photos

The homepage has an Instagram profile link and a server-backed automatic photo feed. **Live access requires the account owner's authorization and credentials.** Without them, it honestly labels its fallback as the studio collection; these are original website images, not claimed to be recent Instagram posts.

1. The owner sets up [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/) for the HoneyPaths professional account and authorizes read access (`instagram_business_basic`). Use the current Meta setup and app-review requirements.
2. Obtain the Instagram account ID and an authorized long-lived access token.
3. Copy `.env.example` to `.env` locally, or configure these secret environment variables with the production host:
   - `INSTAGRAM_USER_ID`
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_API_VERSION` (defaults to `v25.0`; select a version supported by your Meta app)
4. Restart the server. The homepage automatically requests `/api/instagram` and replaces the collection with the four newest image/carousel posts found in the latest 50 media entries. Video-only posts are excluded.

Credentials remain server-side, never use a `PUBLIC_` variable. The endpoint caches successful reads for 15 minutes, coalesces simultaneous requests, backs off failures, and preserves the last good photos for up to one extra hour. For multi-instance deployment, use shared caching if required. Meta image URLs expire, so live posts are refreshed instead of baked into the build. Manage token renewal through the owner's Meta app; a scheduled credential-refresh service is not configured. If access expires or the service fails, the homepage keeps its clearly labeled studio collection and profile link.

`npm test` verifies safe public feed fields, sorting, video filtering, caching/concurrent requests, token isolation, failure behavior, and catalog integrity. No live Instagram request was tested because credentials were not supplied.

## Create an announcement

```sh
npm run new-post -- "Our next market day"
```

This creates a Markdown draft in `src/content/blog`. Edit it with any text editor. Front matter defines the title, short description, date, category, cover image, image description, and pastel tone (`pink`, `sage`, or `lilac`). Put new images in `public/images` and reference them as `/images/your-file.png`.

When ready, set `draft: false`, run `npm run check && npm run build`, and deploy. Drafts are excluded from both blog routes and the homepage. The two starter studio stories are newly written from the original site's about/catalog text, dated for this rebuild; they are not imported historical announcements. Owners should review these before publication. This version supports file-based publishing, not a hosted admin login.

## Provenance

Original catalog and about text were inspected on October 4, 2026. `src/data/sources.json` records source links and the Etsy verification limit; each product records its original collection, page, image URL, and shop URL. Existing category paths redirect into the corresponding filter in the unified shop.
