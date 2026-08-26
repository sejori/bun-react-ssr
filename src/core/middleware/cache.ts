import { CacheItem, defaultKeyGen } from "../utils/CacheItem.ts";
import { Middleware } from "../utils/middleware.ts";

export type CacheState = {
  hitCache: boolean;
};

interface CacheOptions {
  itemLifetime?: number;
  keyGen?: typeof defaultKeyGen;
  // a Map satisfies this, so swapping in Redis is a drop-in
  store?: {
    get: (
      key: string
    ) => Promise<CacheItem | undefined> | CacheItem | undefined;
    set: (key: string, value: CacheItem) => Promise<unknown> | unknown;
    delete: (key: string) => Promise<unknown> | unknown;
  };
}

export const cache = (opts: CacheOptions = {}): Middleware<CacheState> => {
  const store = opts.store ?? new Map<string, CacheItem>();
  const getKey = opts.keyGen ?? defaultKeyGen;

  return async function cacheMiddleware(ctx, next) {
    const key = getKey(ctx);
    const item = await store.get(key);
    const expired =
      item && opts.itemLifetime && Date.now() > item.dob + opts.itemLifetime;

    if (item && !expired) {
      item.count++;
      ctx.state.hitCache = true;

      // ETag match lets the browser reuse the copy it already holds
      const etag = item.headers.get("ETag")!;
      if (ctx.request.headers.get("if-none-match")?.includes(etag)) {
        return new Response(null, { headers: item.headers, status: 304 });
      }

      return item.response;
    }

    if (expired) await store.delete(key);

    const response = await next();
    if (!response?.ok) return response;

    const fresh = await CacheItem.from(key, response);
    await store.set(key, fresh);

    return fresh.response;
  };
};
