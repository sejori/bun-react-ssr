import { describe, it, expect } from "bun:test";
import { hmrHandler, hmrWebsocket } from "@core/middleware/hmr";
import { manifest } from "@core/utils/build";

const request = new Request("http://test/__hmr") as Bun.BunRequest;

describe("hmr middleware", () => {
  it("should return 400 when the upgrade fails", () => {
    const server = { upgrade: () => false } as unknown as Bun.Server;

    const res = hmrHandler(request, server);
    expect(res?.status).toBe(400);
  });

  it("should return nothing when the upgrade succeeds", () => {
    const server = { upgrade: () => true } as unknown as Bun.Server;

    expect(hmrHandler(request, server)).toBeUndefined();
  });

  it("should send the manifest on open", () => {
    manifest["/static/home/home.client.js"] = "abc";
    const sent: string[] = [];

    hmrWebsocket.open?.({ send: (m: string) => sent.push(m) } as any);
    expect(JSON.parse(sent[0]!)).toMatchObject({
      "/static/home/home.client.js": "abc",
    });
  });
});
