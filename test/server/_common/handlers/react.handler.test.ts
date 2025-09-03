import { describe, it, expect } from "bun:test";
import React, { FC } from "react";
import { reactHandler } from "../../../../src/server/_common/handlers/react.handler";

const fakeServer = {} as unknown as Bun.Server;

const Hello: FC<{ name: string }> = ({ name }) => React.createElement("div", null, `Hello ${name}`);

describe("reactHandler", () => {
  it("should render component with static props", async () => {
    const handler = reactHandler(Hello, { name: "Alice" });

    const res = await handler({ request: new Request("http://test"), state: {}, server: fakeServer}, async () => {});
    expect(res).toBeInstanceOf(Response);
    expect(res?.headers.get("Content-Type")).toBe("text/html");

    const text = await res?.text();
    expect(text).toContain("Hello Alice");
    expect(text).toContain("window.__SERVER_PROPS__ = {\"name\":\"Alice\"}");
  });

  it("should render component with dynamic props", async () => {
    const handler = reactHandler(Hello, () => ({ name: "Bob" }));

    const res = await handler({ request: new Request("http://test"), state: {}, server: fakeServer}, async () => {});
    const text = await res?.text();
    expect(text).toContain("Hello Bob");
    expect(text).toContain("Bob");
  });

  it("should set cache headers differently in PROD", async () => {
    process.env.ENVIRONMENT = "PROD";
    const handler = reactHandler(Hello, { name: "CacheTest" });

    const res = await handler({ request: new Request("http://test"), state: {}, server: fakeServer}, async () => {});
    expect(res?.headers.get("Cache-Control")).toContain("max-age");
  });
});
