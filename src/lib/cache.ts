import { LRUCache } from "lru-cache";
import { env } from "./env.js";

const cache = new LRUCache<string, object>({
  max: 500,
  ttl: env.cacheTtlSeconds * 1000,
});

export const cacheStore = {
  get<T>(key: string): T | undefined {
    return cache.get(key) as T | undefined;
  },
  set<T>(key: string, value: T): void {
    cache.set(key, value as object);
  },
};
