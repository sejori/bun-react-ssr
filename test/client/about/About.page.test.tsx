import { describe, test, expect, beforeEach, spyOn, Mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import React from "react";

import About from "../../../src/client/about/About.page";
import { Document } from "../../../src/client/_common/components/Document";
import { Layout } from "../../../src/client/_common/components/Layout";
import { DemoProvider } from "../../../src/client/_common/contexts/demoContext";

describe("About page", () => {
  let docSpy: Mock<typeof Document>;
  let layoutSpy: Mock<typeof Layout>;
  let demoProviderSpy: Mock<typeof DemoProvider>;
  
  beforeEach(async () => {
    const DocumentMod = await import("../../../src/client/_common/components/Document");
    const LayoutMod = await import("../../../src/client/_common/components/Layout");
    const DemoContextMod = await import("../../../src/client/_common/contexts/demoContext");

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
    render(<About name="Sammy" logged={true} />);

    expect(docSpy).toHaveBeenCalled();
    expect(layoutSpy).toHaveBeenCalled();
    expect(demoProviderSpy).toHaveBeenCalled();
  });

  test("renders name and logged status", () => {
    render(<About name="Charlie" logged={true} />);
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  test("renders link back to home", () => {
    render(<About name="Charlie" logged={true} />);
    expect(screen.getByLabelText("home-link")).toHaveTextContent("Home");
  });
});