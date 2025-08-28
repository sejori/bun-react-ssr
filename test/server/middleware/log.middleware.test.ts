import { describe, it, expect, mock } from "bun:test";
import { log } from "../../../src/server/middleware/log.middleware";
import type { Middleware } from "../../../src/server/utils/middleware";

// Fake server placeholder
const fakeServer = {} as unknown as Bun.Server;

describe("log middleware", () => {
  it("should mark state.logged as true and call next()", async () => {
    const logFn = mock();
    const m = log(logFn);

    const downstream: Middleware = async () =>
      new Response("ok", { status: 200 });

    const handler = async (req: Request) => {
      let state: Record<string, any> = {};
      return await m(req, state, async () => downstream(req, state, async () => {}, fakeServer), fakeServer);
    };

    const res = await handler(new Request("http://test/hello"));

    expect(res).toBeInstanceOf(Response);
    expect(res?.status).toBe(200);

    // Ensure log marked state
    const state: Record<string, any> = {};
    await m(new Request("http://test/hello"), state, async () => new Response("ok"), fakeServer);
    expect(state.logged).toBe(true);

    // Ensure log function was called
    expect(logFn).toHaveBeenCalled();
    const [url, status, duration] = logFn.mock.calls[0];
    expect(url).toBe("http://test/hello");
    expect(status).toBe(200);
    expect(duration).toMatch(/ms$/);
  });

  it("should still log when next returns void", async () => {
    const logFn = mock();
    const m = log(logFn);

    const handler = async (req: Request) => {
      let state: Record<string, any> = {};
      return await m(req, state, async () => {}, fakeServer);
    };

    const res = await handler(new Request("http://test/none"));

    expect(res).toBeUndefined(); // next() didn’t return a Response
    expect(logFn).toHaveBeenCalled();
    const [url, status] = logFn.mock.calls[0];
    expect(url).toBe("http://test/none");
    expect(status).toBeUndefined();
  });
});
