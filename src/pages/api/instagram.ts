import type { APIRoute } from "astro";
import { createInstagramFeed } from "../../lib/instagram.mjs";
export const prerender = false;
const getFeed = createInstagramFeed();
export const GET: APIRoute = async () => {
  const feed = await getFeed({
    token:
      process.env.INSTAGRAM_ACCESS_TOKEN ||
      import.meta.env.INSTAGRAM_ACCESS_TOKEN,
    userId: process.env.INSTAGRAM_USER_ID || import.meta.env.INSTAGRAM_USER_ID,
    version:
      process.env.INSTAGRAM_API_VERSION ||
      import.meta.env.INSTAGRAM_API_VERSION ||
      "v25.0",
  });
  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control":
        feed.status === "live"
          ? "public, max-age=300, s-maxage=900"
          : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
