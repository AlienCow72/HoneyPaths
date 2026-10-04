import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const products = JSON.parse(
  readFileSync(new URL("../src/data/products.json", import.meta.url)),
);
test("migrated catalog has unique routes, real source links, local assets, and consistent tags", () => {
  assert.equal(products.length, 57);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  for (const p of products) {
    assert.ok(
      existsSync(new URL(`../public${p.image}`, import.meta.url)),
      p.image,
    );
    assert.ok(p.tags.includes(p.category));
    assert.match(
      p.shopUrl,
      /^https:\/\/honeypaths\.mayhem\.my\/store\/detail\/[a-f0-9-]+$/,
    );
    assert.match(p.sourceUrl, /^https:\/\/honeypaths\.com\//);
    if (p.etsyUrl)
      assert.match(p.etsyUrl, /^https:\/\/(www\.)?etsy\.com\/listing\/\d+/);
  }
});
