import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.PAGES_BASE ?? "/HoneyPaths").replace(/\/$/, "");
const origin = process.env.PAGES_SITE || "https://kyleanderson.online";
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
assert.ok(
  existsSync("dist/index.html"),
  "Pages must contain a root index.html",
);
assert.ok(existsSync("dist/404.html"), "Pages must contain a custom 404 page");
assert.ok(
  !existsSync("dist/server"),
  "Do not upload Node server output to Pages",
);
const htmlFiles = files("dist").filter((file) => file.endsWith(".html"));
let checked = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)) {
    const url = match[1];
    if (url.startsWith("//")) continue;
    assert.ok(
      !base || url === base || url.startsWith(`${base}/`),
      `${file}: unprefixed URL ${url}`,
    );
    const local = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]);
    const path = join("dist", local);
    assert.ok(
      existsSync(path) || existsSync(join(path, "index.html")),
      `${file}: missing destination ${url}`,
    );
    checked++;
  }
}
const home = readFileSync("dist/index.html", "utf8");
assert.ok(
  home.includes(`rel="canonical" href="${origin}${base}/"`),
  "Homepage canonical must use the Pages URL",
);
assert.ok(
  home.includes("From our studio collection"),
  "Static Instagram fallback must be labeled",
);
assert.deepEqual(JSON.parse(readFileSync("dist/api/instagram", "utf8")), {
  posts: [],
  status: "unconfigured",
});
console.log(
  `Verified ${htmlFiles.length} Pages HTML files and ${checked} local links/assets.`,
);
