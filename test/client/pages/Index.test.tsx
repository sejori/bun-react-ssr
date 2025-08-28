import { test, describe, expect } from "bun:test";
import userEvent from '@testing-library/user-event'
import Index from "../../../src/client/pages/Index/Index";
import { renderToDocument } from "../test.utils";

describe("Index page", () => {
  test("renders heading from props", () => {
    renderToDocument(<Index message="Hello World!" />);

    const h2 = document.querySelector("h2") as HTMLElement;
    expect(h2.textContent).toBe("Hello World!");
  });

  test("increments counter when button is clicked", async () => {
    renderToDocument(<Index message="Count Test" />);
  
    const p = document.querySelector("p") as HTMLElement;
    const button = document.querySelector("button") as HTMLElement;
    expect(p.textContent).toBe("0");  

    await userEvent.click(button);
    expect(p.textContent).toBe("1");

    await userEvent.click(button);
    expect(p.textContent).toBe("2");
  });

  test("updates link when input value changes", async () => {
    renderToDocument(<Index message="Input Test" />);

    const input = document.querySelector("input") as HTMLInputElement;
    const link = document.querySelector("a") as HTMLAnchorElement;
    expect(link.href).toContain("Steve");

    await userEvent.type(input, "Alice");
    expect(link?.href).toContain("Alice");
  });
});
