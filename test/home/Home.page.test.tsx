
import { test, describe, expect, Mock, beforeEach, spyOn } from "bun:test";
import userEvent from '@testing-library/user-event'
import { render, screen } from "@testing-library/react";

import Home from "../../src/home/Home.page";
import { Document } from "../../src/core/components/Document";
import { Layout } from "../../src/core/components/Layout";
import { DemoProvider } from "../../src/core/contexts/demoContext";

describe("Home page", () => {
  let docSpy: Mock<typeof Document>;
  let layoutSpy: Mock<typeof Layout>;
  let demoProviderSpy: Mock<typeof DemoProvider>;
  const mockTimeString = new Date().toISOString();
  
  beforeEach(async () => {
    const DocumentMod = await import("../../src/core/components/Document");
    const LayoutMod = await import("../../src/core/components/Layout");
    const DemoContextMod = await import("../../src/core/contexts/demoContext");

    docSpy = spyOn(DocumentMod, "Document").mockImplementation(
      ({ children }: { children: React.ReactNode }) => (
        <div data-testid="document">{children}</div>
      )
    );

    layoutSpy = spyOn(LayoutMod, "Layout").mockImplementation(
      ({ children }: { children: React.ReactNode }) => (
        <div data-testid="layout">{children}</div>
      )
    );

    demoProviderSpy = spyOn(DemoContextMod, "DemoProvider").mockImplementation(
      ({ children }: { children: React.ReactNode }) => (
        <div data-testid="demo-provider">{children}</div>
      )
    );
  });

  test("renders into Document, Layout and DemoProvider parents", () => {
    render(<Home requestTime={mockTimeString} />);

    expect(docSpy).toHaveBeenCalled();
    expect(layoutSpy).toHaveBeenCalled();
    expect(demoProviderSpy).toHaveBeenCalled();
  });

  test("renders name and logged status", () => {
    render(<Home requestTime={mockTimeString} />);
    expect(screen.getByText(mockTimeString)).toBeInTheDocument();
  });

  test("increments counter when button is clicked", async () => {
    render(<Home requestTime={mockTimeString} />);
  
    expect(screen.getByText("0")).toBeInTheDocument();  

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("1")).toBeInTheDocument();  

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("2")).toBeInTheDocument();  
  });

  test("updates link when input value changes", async () => {
    render(<Home requestTime={mockTimeString} />);
    expect(screen.getByLabelText("about-link")).toHaveTextContent("Steve");

    await userEvent.type(screen.getByLabelText("name-input"), "Alice");
    expect(screen.getByLabelText("about-link")).toHaveTextContent("Steve");
  });
});
