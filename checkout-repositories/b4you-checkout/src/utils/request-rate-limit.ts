import { LRUCache } from "lru-cache";
import { env } from "@/env";

type RateLimitEntry = {
  count: number;
  lastRequest: number;
};

export const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 800,
  ttl: 60 * (Number(env.RESET_LIMIT_TIME_IN_MINUTS) * 1000),
});

export function checkRateLimit(
  ip: string,
  limit: number = Number(env.RATE_LIMIT),
): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(ip);

  if (!entry) {
    rateLimitCache.set(ip, { count: 1, lastRequest: now });
    return true;
  }

  if (now - entry.lastRequest > 60 * 1000) {
    rateLimitCache.set(ip, { count: 1, lastRequest: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  rateLimitCache.set(ip, entry);
  return true;
}
