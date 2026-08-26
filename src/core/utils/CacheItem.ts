import { MiddlewareContext } from "./middleware.ts";

// route params live in the path, so pathname + search keeps /about/Steve and
// /about/Bob (and any ?query) in separate entries
export const defaultKeyGen = (ctx: MiddlewareContext) => {
  const { pathname, search } = new URL(ctx.request.url);
  return pathname + search;
};

export class CacheItem {
  readonly dob = Date.now();
  count = 0;

  private constructor(
    readonly key: string,
    readonly body: ArrayBuffer,
    readonly headers: Headers
  ) {}

  // SSR responses are streams, so the body is buffered once here to make the
  // entry replayable, and hashed into an ETag for conditional requests
  static async from(key: string, response: Response) {
    const body = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set("ETag", `"${Bun.hash(body).toString(36)}"`);

    return new CacheItem(key, body, headers);
  }

  get response() {
    return new Response(this.body, { headers: this.headers });
  }
}
