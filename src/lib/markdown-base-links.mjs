import { withBase } from "./paths.mjs";

/** Keep Markdown links and images working on a GitHub Pages project path. */
export default function markdownBaseLinks({ base = "/" } = {}) {
  const prefix = (node, context) => {
    const url = withBase(node.url, base);
    if (url !== node.url) context.replaceNode(node, { ...node, url });
  };
  return {
    name: "deployment-base-links",
    link: prefix,
    image: prefix,
    definition: prefix,
  };
}
