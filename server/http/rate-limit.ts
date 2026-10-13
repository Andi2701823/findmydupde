import "server-only";
import { isIP } from "node:net";
export function createRateLimiter(
  limit = 60,
  windowMs = 60000,
  maximumKeys = 1000,
) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (key: string, now = Date.now()) => {
    for (const [id, value] of buckets)
      if (value.resetAt <= now) buckets.delete(id);
    let bucket = buckets.get(key);
    if (!bucket) {
      // No eviction that could allow an attacker to reset another client's quota.
      if (buckets.size >= maximumKeys) return false;
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    if (bucket.count >= limit) return false;
    bucket.count++;
    return true;
  };
}
export function requestQuotaKey(request: Request, trustProxy = false) {
  const ip = request.headers.get("x-real-ip") || "";
  return trustProxy && isIP(ip) ? ip : "shared";
}
