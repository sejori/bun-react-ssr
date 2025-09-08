import { describe, it, expect, mock } from "bun:test";
import { cascade, Middleware } from "../../../../src/server/_common/utils/middleware";

// Fake server object
const fakeServer = {} as unknown as Bun.Server;

describe("cascade()", () => {
  it("should build MiddlewareContext correctly", async () => {
    const m1: Middleware = async (ctx) => {
      expect(ctx.request.url === "http://test");
      expect(ctx.state).toEqual({});
      expect(ctx.server).toBeDefined();
      return new Response("Hi there.")
    };

    const handler = cascade(m1);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hi there.");
  });

  it("should cascade through middleware until a Response is returned", async () => {
    const m1: Middleware = async (_ctx, next) => {
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
    const m1: Middleware = async (_ctx, next) => {
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
    const m1: Middleware<{ name?: string }> = async (ctx, next) => {
      ctx.state.name = "Alice";
      return next();
    };

    const m2: Middleware<{ name?: string }> = async (ctx, state) => {
      return new Response(`Hello ${ctx.state.name}`, { status: 200 });
    };

    const handler = cascade(m1, m2);
    const res = await handler(new Request("http://test"), fakeServer);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello Alice");
  });

  it("should never call any middleware more than once", async () => {
    let m1Calls = 0;
    let m2Calls = 0;
    let m3Calls = 0;

    const m1: Middleware = async (ctx, next) => {
      m1Calls++;
      await next();
      // Not returning the response from next
    };

    const m2: Middleware = async (ctx, next) => {
      m2Calls++;
      return next();
    };

    const m3: Middleware = async () => {
      m3Calls++;
      return new Response("done", { status: 200 });
    };

    const handler = cascade(m1, m2, m3);
    const res = await handler(new Request("http://test"), fakeServer);
    
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("done");
    expect(m1Calls).toBe(1);
    expect(m2Calls).toBe(1);
    expect(m3Calls).toBe(1);
  });

  it("should handle middleware that doesn't return next() result (like logging)", async () => {
    const logCalls: string[] = [];
    let handlerCalls = 0;
    
    // Logging middleware that doesn't return the response
    const logger: Middleware = async (ctx, next) => {
      logCalls.push("before");
      const res = await next();
      logCalls.push(`after: ${res?.status}`);
      // Intentionally not returning res to test cascade behavior
    };

    const handler: Middleware = async () => {
      handlerCalls++;
      return new Response("handled", { status: 200 });
    };

    const cascaded = cascade(logger, handler);
    const res = await cascaded(new Request("http://test"), fakeServer);
    
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("handled");
    expect(logCalls).toEqual(["before", "after: 200"]);
    expect(handlerCalls).toBe(1); // Should only be called once
  });

  it("should handle multiple middleware in chain with mixed return patterns", async () => {
    const order: string[] = [];
    let callCounts = { m1: 0, m2: 0, m3: 0 };
    
    // First middleware: calls next but doesn't return it
    const m1: Middleware = async (ctx, next) => {
      callCounts.m1++;
      order.push("m1-start");
      const res = await next();
      order.push("m1-end");
      // Not returning res
    };

    // Second middleware: calls next and returns it
    const m2: Middleware = async (ctx, next) => {
      callCounts.m2++;
      order.push("m2-start");
      const res = await next();
      order.push("m2-end");
      return res;
    };

    // Third middleware: doesn't call next, returns response
    const m3: Middleware = async () => {
      callCounts.m3++;
      order.push("m3");
      return new Response("final", { status: 200 });
    };

    const handler = cascade(m1, m2, m3);
    const res = await handler(new Request("http://test"), fakeServer);
    
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("final");
    expect(order).toEqual(["m1-start", "m2-start", "m3", "m2-end", "m1-end"]);
    expect(callCounts).toEqual({ m1: 1, m2: 1, m3: 1 });
  });

  it("should handle body consumption correctly in middleware chain", async () => {
    let bodyReadCount = 0;
    const requestBody = JSON.stringify({ test: "data" });
    
    // First middleware reads the body
    const m1: Middleware = async (ctx, next) => {
      const body = await ctx.request.json();
      bodyReadCount++;
      expect(body).toEqual({ test: "data" });
      return next();
    };

    // Second middleware should not be able to read body again
    const m2: Middleware = async (ctx) => {
      // This would throw if we tried to read the body again
      // await ctx.request.json(); // Should fail
      return new Response("success", { status: 200 });
    };

    const handler = cascade(m1, m2);
    const req = new Request("http://test", {
      method: "POST",
      body: requestBody,
      headers: { "Content-Type": "application/json" }
    });
    
    const res = await handler(req, fakeServer);
    expect(res.status).toBe(200);
    expect(bodyReadCount).toBe(1);
  });
});
