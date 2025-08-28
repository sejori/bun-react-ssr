import { describe, it, expect, mock } from "bun:test";
import { cascade, Middleware } from "../../../src/server/utils/middleware";

// Fake server object
const fakeServer = {} as unknown as Bun.Server;

describe("cascade()", () => {
  it("should cascade through middleware until a Response is returned", async () => {
    const m1: Middleware = async (_req, _state, next) => {
      return next();
    };

    const m2: Middleware = async () => {
      return new Response("handled by m2", { status: 200 });
    };

    const handler = cascade(m1, m2);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("handled by m2");
  });

  it("should short circuit if a middleware returns a Response early", async () => {
    const m1: Middleware = async () => {
      return new Response("early stop", { status: 201 });
    };

    const m2: Middleware = mock(async () => {
      return new Response("should not be called");
    });

    const handler = cascade(m1, m2);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(201);
    expect(await res.text()).toBe("early stop");
    expect(m2).not.toHaveBeenCalled();
  });

  it("should return 404 if no middleware returns a Response", async () => {
    const m1: Middleware = async (_req, _state, next) => {
      return next();
    };

    const handler = cascade(m1);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not found");
  });

  it("should return 500 if middleware throws", async () => {
    const m1: Middleware = async () => {
      throw new Error("boom");
    };

    const handler = cascade(m1);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });

  it("should allow middleware to mutate shared state", async () => {
    const m1: Middleware<{ name?: string }> = async (req, state, next) => {
      state.name = "Alice";
      return next();
    };

    const m2: Middleware<{ name?: string }> = async (_req, state) => {
      return new Response(`Hello ${state.name}`, { status: 200 });
    };

    const handler = cascade(m1, m2);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello Alice");
  });
});
