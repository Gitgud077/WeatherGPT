const cacheStore = new Map();

function setCache(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { value, expiresAt });
}

function getCache(key) {
  const cached = cacheStore.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return cached.value;
}

function clearExpiredCache() {
  const now = Date.now();
  for (const [key, item] of cacheStore.entries()) {
    if (now > item.expiresAt) {
      cacheStore.delete(key);
    }
  }
}

// Periodically clean expired keys every 5 minutes
setInterval(clearExpiredCache, 300_000).unref?.();

module.exports = {
  setCache,
  getCache
};
