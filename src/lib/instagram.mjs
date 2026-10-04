/** Only public photo fields leave the server. Access tokens never enter client code. */
export function normalizePosts(payload) {
  if (!payload || !Array.isArray(payload.data)) return [];
  return payload.data
    .flatMap((media) => {
      if (!["IMAGE", "CAROUSEL_ALBUM"].includes(media.media_type)) return [];
      let image, permalink;
      try {
        image = new URL(media.media_url);
        permalink = new URL(media.permalink);
      } catch {
        return [];
      }
      if (
        image.protocol !== "https:" ||
        permalink.protocol !== "https:" ||
        !["instagram.com", "www.instagram.com"].includes(permalink.hostname)
      )
        return [];
      const timestamp = Date.parse(media.timestamp);
      if (!Number.isFinite(timestamp)) return [];
      return [
        {
          id: String(media.id),
          image: image.href,
          permalink: permalink.href,
          caption: String(media.caption || "").slice(0, 300),
          timestamp: new Date(timestamp).toISOString(),
        },
      ];
    })
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 4);
}

export function createInstagramFeed({
  fetcher = fetch,
  now = Date.now,
  ttl = 15 * 60 * 1000,
  retryDelay = 60 * 1000,
} = {}) {
  let cache = null;
  let nextAttempt = 0;
  let pending = null;
  let configKey = null;
  /** @param {{token?: string, userId?: string, version?: string}} config */
  return async function getFeed({ token, userId, version = "v25.0" } = {}) {
    if (!token || !/^\d+$/.test(userId || "") || !/^v\d+\.\d+$/.test(version))
      return { posts: [], status: "unconfigured" };
    const key = `${userId}:${version}:${token}`;
    if (key !== configKey) {
      cache = null;
      nextAttempt = 0;
      configKey = key;
    }
    if (cache && now() < cache.expires)
      return { posts: cache.posts, status: "live" };
    if (now() < nextAttempt) {
      const posts =
        cache && now() - cache.expires < 60 * 60 * 1000 ? cache.posts : [];
      return { posts, status: posts.length ? "cached" : "unavailable" };
    }
    if (pending) return pending;
    pending = (async () => {
      try {
        const url = new URL(
          `https://graph.instagram.com/${version}/${userId}/media`,
        );
        url.searchParams.set(
          "fields",
          "id,caption,media_type,media_url,permalink,timestamp",
        );
        url.searchParams.set("limit", "50");
        const response = await fetcher(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error("Instagram unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.data))
          throw new Error("Invalid Instagram response");
        const posts = normalizePosts(payload);
        cache = { posts, expires: now() + ttl };
        nextAttempt = 0;
        return { posts, status: "live" };
      } catch {
        nextAttempt = now() + retryDelay;
        // Instagram image URLs expire; serve stale data for at most one hour.
        const posts =
          cache && now() - cache.expires < 60 * 60 * 1000 ? cache.posts : [];
        return { posts, status: posts.length ? "cached" : "unavailable" };
      } finally {
        pending = null;
      }
    })();
    return pending;
  };
}
