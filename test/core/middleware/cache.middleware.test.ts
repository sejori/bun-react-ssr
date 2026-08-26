import { describe, it, expect } from "bun:test";
import { cascade, Middleware } from "@core/utils/middleware";
import { cache, CacheState } from "@core/middleware/cache";

const fakeServer = {} as unknown as Bun.Server;

// counts renders so a cache hit is visible in the body
const renderer = (): [Middleware, () => number] => {
  let renders = 0;
  return [
    () => new Response(`render ${++renders}`, { headers: { "Content-Type": "text/html" } }),
    () => renders,
  ];
};

const get = (handler: ReturnType<typeof cascade>, url: string, headers?: HeadersInit) =>
  handler(new Request(url, { headers }) as Bun.BunRequest, fakeServer);

describe("cache middleware", () => {
  it("should replay a cached response without re-rendering", async () => {
    const [render, renders] = renderer();
    const handler = cascade<CacheState>(cache(), render);

    expect(await (await get(handler, "http://test/about/Steve")).text()).toBe("render 1");
    expect(await (await get(handler, "http://test/about/Steve")).text()).toBe("render 1");
    expect(renders()).toBe(1);
  });

  it("should key on route params and query", async () => {
    const [render, renders] = renderer();
    const handler = cascade<CacheState>(cache(), render);

    expect(await (await get(handler, "http://test/about/Steve")).text()).toBe("render 1");
    expect(await (await get(handler, "http://test/about/Bob")).text()).toBe("render 2");
    expect(await (await get(handler, "http://test/about/Bob?x=1")).text()).toBe("render 3");
    expect(renders()).toBe(3);
  });

  it("should re-render once an item expires", async () => {
    const [render, renders] = renderer();
    const handler = cascade<CacheState>(cache({ itemLifetime: -1 }), render);

    await get(handler, "http://test/about/Steve");
    await get(handler, "http://test/about/Steve");
    expect(renders()).toBe(2);
  });

  it("should return 304 when the ETag matches", async () => {
    const [render] = renderer();
    const handler = cascade<CacheState>(cache(), render);

    const first = await get(handler, "http://test/about/Steve");
    const etag = first.headers.get("ETag")!;
    expect(etag).toBeTruthy();

    const second = await get(handler, "http://test/about/Steve", { "if-none-match": etag });
    expect(second.status).toBe(304);
    expect(await second.text()).toBe("");
  });

  it("should not cache error responses", async () => {
    let renders = 0;
    const handler = cascade<CacheState>(
      cache(),
      () => new Response(`fail ${++renders}`, { status: 500 })
    );

    await get(handler, "http://test/about/Steve");
    await get(handler, "http://test/about/Steve");
    expect(renders).toBe(2);
  });
});
