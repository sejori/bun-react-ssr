import { test, describe, expect } from "bun:test";
import About from "../../../src/client/pages/About/About";
import { renderToDocument } from "../client.test-utils";

describe("About page", () => {
  test("renders name and logged status", () => {
    renderToDocument(<About name="Charlie" logged={true} />);
    const p1 = document.querySelector("p:nth-of-type(1)");
    const p2 = document.querySelector("p:nth-of-type(2)");

    expect(p1?.textContent).toContain("Charlie");
    expect(p2?.textContent).toContain("true");
  });

  test("renders link back to home", () => {
    renderToDocument(<About name="Dana" logged={false} />);
    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/");
    expect(link.textContent).toBe("Home");
  });
});