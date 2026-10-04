import { defineConfig } from "astro/config";
import node from "@astrojs/node";
export default defineConfig({
  site: "https://honeypaths.com",
  output: "server",
  adapter: node({ mode: "standalone" }),
  devToolbar: { enabled: false },
  redirects: {
    "/earrings-menu": { status: 301, destination: "/shop?tag=Earrings" },
    "/guitar-pick-earrings": {
      status: 301,
      destination: "/shop?tag=Guitar%20picks",
    },
    "/bottle-earrings": { status: 301, destination: "/shop?tag=Bottles" },
    "/animal-earrings": { status: 301, destination: "/shop?tag=Animals" },
    "/upcycled-earrings": { status: 301, destination: "/shop?tag=Upcycled" },
    "/stickers": { status: 301, destination: "/shop?tag=Stickers" },
    "/movie-stickers": { status: 301, destination: "/shop?tag=Movies" },
    "/tv-show-stickers": { status: 301, destination: "/shop?tag=TV%20shows" },
    "/hispanic-stickers": {
      status: 301,
      destination: "/shop?tag=Hispanic%20art",
    },
    "/mix-match": { status: 301, destination: "/shop" },
    "/art-prints": { status: 301, destination: "/shop?tag=Art%20prints" },
  },
});
