import { test } from "node:test";
import assert from "node:assert/strict";
import { withBase, withoutBase } from "../src/lib/paths.mjs";

test("project-site paths preserve queries, fragments, and external destinations", () => {
  assert.equal(withBase("/", "/HoneyPaths/"), "/HoneyPaths/");
  assert.equal(
    withBase("/shop?tag=Guitar%20picks#main", "/HoneyPaths"),
    "/HoneyPaths/shop?tag=Guitar%20picks#main",
  );
  assert.equal(withBase("/images/item.png", "/"), "/images/item.png");
  for (const url of [
    "https://example.com/item",
    "//example.com/item",
    "#main",
  ]) {
    assert.equal(withBase(url, "/HoneyPaths/"), url);
  }
  assert.equal(withoutBase("/HoneyPaths/shop/", "/HoneyPaths/"), "/shop/");
  assert.equal(withoutBase("/HoneyPaths/", "/HoneyPaths"), "/");
  assert.equal(
    withoutBase("/HoneyPaths-other/shop", "/HoneyPaths"),
    "/HoneyPaths-other/shop",
  );
});

test("Markdown links, images, and reference definitions use the deployment base", async () => {
  const { default: markdownBaseLinks } =
    await import("../src/lib/markdown-base-links.mjs");
  const { markdownToHtml } = await import("satteri");
  const { html } = markdownToHtml(
    "[Shop](/shop?tag=Upcycled) ![Item](/images/item.png) [About][about] [Etsy](https://www.etsy.com/shop/Honeypaths)\n\n[about]: /about",
    { mdastPlugins: [markdownBaseLinks({ base: "/HoneyPaths" })] },
  );
  assert.ok(html.includes('href="/HoneyPaths/shop?tag=Upcycled"'));
  assert.ok(html.includes('src="/HoneyPaths/images/item.png"'));
  assert.ok(html.includes('href="/HoneyPaths/about"'));
  assert.ok(html.includes('href="https://www.etsy.com/shop/Honeypaths"'));
});
