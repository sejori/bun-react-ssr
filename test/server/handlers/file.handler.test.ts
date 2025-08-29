import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { file } from "../../../src/server/handlers/file.handler";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const distDir = join(import.meta.dir, "../../../dist");

describe("file handler", () => {
  beforeAll(async () => {
    // Ensure dist directory exists
    await mkdir(distDir, { recursive: true });
    
    // Create fake files
    await writeFile(join(distDir, "test.js"), `console.log("hello js");`);
    await writeFile(join(distDir, "test.css"), `body { color: red; }`);
    await writeFile(join(distDir, "test.svg"), `<svg></svg>`);
    await writeFile(join(distDir, "note.unknown"), "plain text here");
  });

  afterAll(async () => {
    // Clean up dist files after tests
    await rm(`${distDir}/test.js`, { recursive: true, force: true });
    await rm(`${distDir}/test.css`, { recursive: true, force: true });
    await rm(`${distDir}/test.svg`, { recursive: true, force: true });
    await rm(`${distDir}/note.unknown`, { recursive: true, force: true });
  });

  it("should serve JS file with correct MIME type", async () => {
    const req = new Request("http://localhost/test.js");
    const res = await file({ request: req, state: {}, server: {} as Bun.Server}, async () => {});

    expect(res).toBeInstanceOf(Response);
    expect(res?.headers.get("Content-Type")).toBe("application/javascript");

    const text = await res?.text();
    expect(text).toContain("hello js");
  });

  it("should serve CSS file with correct MIME type", async () => {
    const req = new Request("http://localhost/test.css");
    const res = await file({ request: req, state: {}, server: {} as Bun.Server}, async () => {});

    expect(res?.headers.get("Content-Type")).toBe("text/css");
    expect(await res?.text()).toContain("color: red");
  });

  it("should serve SVG file with correct MIME type", async () => {
    const req = new Request("http://localhost/test.svg");
    const res = await file({ request: req, state: {}, server: {} as Bun.Server}, async () => {});

    expect(res?.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(await res?.text()).toContain("<svg>");
  });

  it("should default to text/plain for unknown extensions", async () => {
    const req = new Request("http://localhost/note.unknown");

    const res = await file({ request: req, state: {}, server: {} as Bun.Server}, async () => {});

    expect(res?.headers.get("Content-Type")).toBe("text/plain");
    expect(await res?.text()).toContain("plain text here");
  });
});
