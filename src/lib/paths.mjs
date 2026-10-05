/** Prefix local paths for project-site hosting; leave external links untouched. */
export function withBase(path, base = import.meta.env?.BASE_URL || "/") {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}

/** Compare navigation routes independently of the deployment base path. */
export function withoutBase(path, base = import.meta.env?.BASE_URL || "/") {
  const prefix = base.replace(/\/$/, "");
  if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) {
    return path.slice(prefix.length) || "/";
  }
  return path;
}
