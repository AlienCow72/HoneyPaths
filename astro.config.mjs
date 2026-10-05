import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { withBase } from "./src/lib/paths.mjs";
import markdownBaseLinks from "./src/lib/markdown-base-links.mjs";
import { satteri } from "@astrojs/markdown-satteri";
const pages = process.env.PUBLIC_PAGES_BUILD === "true";
const base = pages ? (process.env.PAGES_BASE ?? "/HoneyPaths") : "/";
export default defineConfig({
  site: pages
    ? process.env.PAGES_SITE || "https://kyleanderson.online"
    : "https://honeypaths.com",
  base,
  markdown: {
    processor: satteri({ mdastPlugins: [markdownBaseLinks({ base })] }),
  },
  output: pages ? "static" : "server",
  adapter: pages ? undefined : node({ mode: "standalone" }),
  integrations: pages
    ? [
        {
          name: "pages-static-feed",
          hooks: {
            "astro:route:setup": ({ route }) => {
              if (route.component === "src/pages/api/instagram.ts")
                route.prerender = true;
            },
          },
        },
      ]
    : [],
  devToolbar: { enabled: false },
  redirects: {
    "/earrings-menu": {
      status: 301,
      destination: withBase("/shop?tag=Earrings", base),
    },
    "/guitar-pick-earrings": {
      status: 301,
      destination: withBase("/shop?tag=Guitar%20picks", base),
    },
    "/bottle-earrings": {
      status: 301,
      destination: withBase("/shop?tag=Bottles", base),
    },
    "/animal-earrings": {
      status: 301,
      destination: withBase("/shop?tag=Animals", base),
    },
    "/upcycled-earrings": {
      status: 301,
      destination: withBase("/shop?tag=Upcycled", base),
    },
    "/stickers": {
      status: 301,
      destination: withBase("/shop?tag=Stickers", base),
    },
    "/movie-stickers": {
      status: 301,
      destination: withBase("/shop?tag=Movies", base),
    },
    "/tv-show-stickers": {
      status: 301,
      destination: withBase("/shop?tag=TV%20shows", base),
    },
    "/hispanic-stickers": {
      status: 301,
      destination: withBase("/shop?tag=Hispanic%20art", base),
    },
    "/mix-match": { status: 301, destination: withBase("/shop", base) },
    "/art-prints": {
      status: 301,
      destination: withBase("/shop?tag=Art%20prints", base),
    },
  },
});
