import { writeFileSync } from "node:fs";
const title = process.argv.slice(2).join(" ").trim();
if (!title) {
  console.error('Usage: npm run new-post -- "Your announcement title"');
  process.exit(1);
}
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
if (!slug) {
  console.error("Please include letters or numbers in the title.");
  process.exit(1);
}
const date = new Date().toISOString().slice(0, 10);
const text = `---\ntitle: ${JSON.stringify(title)}\ndescription: "Write a short introduction here."\ndate: ${date}\ncategory: "Announcements"\nimage: "/images/e33bd90462a89543101e1db311a2cfb5.png"\nimageAlt: "Honey Path Designs’ ghost illustration sticker"\ntone: "lilac"\ndraft: true\n---\n\nWrite your announcement here.\n\nSet draft to false when you are ready to publish, then rebuild and deploy the site.\n`;
try {
  writeFileSync(`src/content/blog/${slug}.md`, text, { flag: "wx" });
  console.log(`Created src/content/blog/${slug}.md (draft).`);
} catch (error) {
  console.error(
    error.code === "EEXIST"
      ? "A post with this title already exists; choose a different title."
      : "Could not create the draft.",
  );
  process.exit(1);
}
