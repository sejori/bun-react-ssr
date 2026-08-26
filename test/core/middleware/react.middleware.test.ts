import { describe, it, expect, afterEach } from "bun:test";
import React, { FC } from "react";
import { reactMiddleware } from "@core/middleware/react";

const fakeServer = {} as unknown as Bun.Server;

const Hello: FC<{ name: string }> = ({ name }) => React.createElement("div", null, `Hello ${name}`);

describe("react middleware", () => {
  afterEach(() => { delete process.env.ENV; });

  it("should render component with static props", async () => {
    const mware = reactMiddleware(Hello, { name: "Alice" });

    const res = await mware({ request: new Request("http://test"), state: {}, server: fakeServer});
    expect(res).toBeInstanceOf(Response);
    expect(res?.headers.get("Content-Type")).toBe("text/html");

    const text = await res?.text();
    expect(text).toContain("Hello Alice");
    expect(text).toContain("window.__SERVER_PROPS__ = {\"name\":\"Alice\"}");
  });

  it("should render component with dynamic props", async () => {
    const mware = reactMiddleware(Hello, () => ({ name: "Bob" }));

    const res = await mware({ request: new Request("http://test"), state: {}, server: fakeServer});
    const text = await res?.text();
    expect(text).toContain("Hello Bob");
    expect(text).toContain("Bob");
  });

  it("should set cache headers outside of dev", async () => {
    process.env.ENV = "prod";
    const mware = reactMiddleware(Hello, { name: "CacheTest" });

    const res = await mware({ request: new Request("http://test"), state: {}, server: fakeServer});
    expect(res?.headers.get("Cache-Control")).toContain("max-age");
  });

  it("should bootstrap the hmr runtime and skip caching in dev", async () => {
    process.env.ENV = "dev";
    const mware = reactMiddleware(Hello, { name: "DevTest" });

    const res = await mware({ request: new Request("http://test"), state: {}, server: fakeServer});
    expect(res?.headers.get("Cache-Control")).toBe("no-store");
    expect(await res?.text()).toContain("/static/core/hmr.client.js");
  });
});
