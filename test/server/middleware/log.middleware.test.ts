import { describe, it, expect, mock } from "bun:test";
import { log } from "../../../src/server/middleware/log.middleware";
import { fakeContext } from "../server.test-utils";

describe("log middleware", () => {
  it("should mark state.logged as true and call next()", async () => {
    const logFn = mock();
    const nextFn = mock<() => Promise<Response>>();
    const m = log(logFn);
    const state: Record<string, any> = {};


    const handler = async (req: Request) => {
      return await m(fakeContext(req, state), async () => {
        nextFn();
        return new Response("ok");
      });
    };
    await handler(new Request("http://test/hello"));

    // Ensure log marked state and called next
    await m(fakeContext(), nextFn);
    expect(state.logged).toBe(true);
    expect(nextFn).toHaveBeenCalled();

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

    const res = await m(fakeContext(new Request("http://test/none")), async () => {});

    expect(res).toBeUndefined(); // next() didn’t return a Response
    expect(logFn).toHaveBeenCalled();
    const [url, status] = logFn.mock.calls[0];
    expect(url).toBe("http://test/none");
    expect(status).toBeUndefined();
  });
});
