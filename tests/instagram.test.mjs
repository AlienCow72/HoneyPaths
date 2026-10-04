import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePosts, createInstagramFeed } from "../src/lib/instagram.mjs";
const photo = (id, date = "2026-10-04") => ({
  id,
  media_type: "IMAGE",
  media_url: `https://scontent.cdninstagram.com/${id}.jpg`,
  permalink: `https://www.instagram.com/p/${id}/`,
  timestamp: date,
  caption: "A little happy",
});
test("feed returns newest photos, includes carousels, excludes videos and unsafe links", () => {
  const input = {
    data: [
      photo("old", "2026-01-01"),
      { ...photo("carousel"), media_type: "CAROUSEL_ALBUM" },
      { ...photo("video"), media_type: "VIDEO" },
      { ...photo("unsafe"), permalink: "javascript:alert(1)" },
      {
        ...photo("phishing"),
        permalink: "https://instagram.com.evil.example/p/a",
      },
      { ...photo("bad-image"), media_url: "http://example.com/image.jpg" },
      photo("new", "2026-10-05"),
    ],
  };
  assert.deepEqual(
    normalizePosts(input).map((x) => x.id),
    ["new", "carousel", "old"],
  );
});
test("missing configuration makes no network requests", async () => {
  const feed = createInstagramFeed({
    fetcher: () => {
      throw new Error("Must not fetch");
    },
  });
  assert.deepEqual(await feed(), { posts: [], status: "unconfigured" });
});
test("requests are cached, concurrent requests coalesce, and failures preserve last good feed", async () => {
  let time = 0,
    calls = 0,
    fail = false;
  const feed = createInstagramFeed({
    now: () => time,
    ttl: 1000,
    retryDelay: 100,
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url.hostname, "graph.instagram.com");
      assert.equal(options.headers.Authorization, "Bearer secret");
      assert.equal(url.searchParams.has("access_token"), false);
      if (fail) throw new Error("secret upstream error");
      return { ok: true, json: async () => ({ data: [photo("a")] }) };
    },
  });
  const config = { token: "secret", userId: "123" };
  const responses = await Promise.all([feed(config), feed(config)]);
  assert.equal(calls, 1);
  assert.equal(responses[0].posts.length, 1);
  await feed(config);
  assert.equal(calls, 1);
  time = 1001;
  fail = true;
  const stale = await feed(config);
  assert.equal(stale.status, "cached");
  assert.equal(stale.posts.length, 1);
  assert.equal(JSON.stringify(stale).includes("secret"), false);
  await feed(config);
  assert.equal(calls, 2);
  time = 4_000_000;
  assert.deepEqual((await feed(config)).posts, []);
});
