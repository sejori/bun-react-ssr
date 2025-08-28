import { describe, it, expect } from "bun:test";
import { file } from "../../../src/server/handlers/file.handler";

// Fake file creation in Bun's tmp dir
const tmpDir = import.meta.dir;

describe("file handler", () => {
  it("should serve JS file with correct mime type", async () => {
    const jsPath = `${tmpDir}/test.js`;
    await Bun.write(jsPath, "console.log('hi')");

    const req = new Request("http://test/test.js");
    const res = await file(req, {}, async () => {}, {} as Bun.Server);

    expect(res?.headers.get("Content-Type")).toBe("application/javascript");
    expect(await res?.text()).toContain("console.log('hi')");
  });

  it("should serve CSS file with correct mime type", async () => {
    const cssPath = `${tmpDir}/test.css`;
    await Bun.write(cssPath, "body{color:red}");

    const req = new Request("http://test/test.css");
    const res = await file(req, {}, async () => {}, {} as Bun.Server);

    expect(res?.headers.get("Content-Type")).toBe("text/css");
    expect(await res?.text()).toContain("body{color:red}");
  });

  it("should serve SVG file with correct mime type", async () => {
    const svgPath = `${tmpDir}/test.svg`;
    await Bun.write(svgPath, "<svg></svg>");

    const req = new Request("http://test/test.svg");
    const res = await file(req, {}, async () => {}, {} as Bun.Server);

    expect(res?.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(await res?.text()).toContain("<svg>");
  });

  it("should default to text/plain for unknown extension", async () => {
    const txtPath = `${tmpDir}/test.unknown`;
    await Bun.write(txtPath, "fallback");

    const req = new Request("http://test/test.unknown");
    const res = await file(req, {}, async () => {}, {} as Bun.Server);

    expect(res?.headers.get("Content-Type")).toBe("text/plain");
    expect(await res?.text()).toBe("fallback");
  });
});
