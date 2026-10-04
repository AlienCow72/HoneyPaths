import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().default("Announcements"),
    image: z.string(),
    imageAlt: z.string(),
    tone: z.enum(["pink", "sage", "lilac"]).default("lilac"),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
