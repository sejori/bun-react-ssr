import { describe, test, expect, beforeEach, spyOn, Mock, jest } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";

import { Layout } from "../../../../src/client/_common/components/Layout";
import { useDemoStore } from "../../../../src/client/_common/hooks/useDemoStore";
import { DemoContextType } from "../../../../src/client/_common/contexts/demoContext";

describe("Layout component", () => {
  let useDemoStoreSpy: Mock<typeof useDemoStore>;
  let storeItemMock: Mock<DemoContextType["storeItem"]>;
  let clearItemsMock: Mock<DemoContextType["clearItems"]>;

  beforeEach(async () => {
    const storeMod = await import("../../../../src/client/_common/hooks/useDemoStore");

    storeItemMock = jest.fn();
    clearItemsMock = jest.fn();

    useDemoStoreSpy = spyOn(storeMod, "useDemoStore").mockReturnValue({
      isLoading: false,
      items: [
        {
          itemId: crypto.randomUUID(), 
          action: "click", 
          details: "Mon Sep 01 2025 12:00:00" 
        },
      ],
      storeItem: storeItemMock,
      clearItems: clearItemsMock,
    });
  });

  test("renders header, footer and children", () => {
    render(
      <Layout>
        <p>Child content</p>
      </Layout>
    );

    expect(screen.getByText("Full-Stack Bun + React")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
    expect(screen.getByText(/Built by/)).toBeInTheDocument();
  });

  test("renders items from store", () => {
    render(
      <Layout>
        <p>Child content</p>
      </Layout>
    );
    expect(screen.getByText(/click at Mon Sep/)).toBeInTheDocument();
  });

  test("calls storeItem when Add Item is clicked", () => {
    render(
      <Layout>
        <p>Child content</p>
      </Layout>
    );
    const addButton = screen.getByText("Add Item");
    fireEvent.click(addButton);
    expect(storeItemMock).toHaveBeenCalled();
  });

  test("calls clearItems when Clear Items is clicked", () => {
    render(
      <Layout>
        <p>Child content</p>
      </Layout>
    );
    const clearButton = screen.getByText("Clear Items");
    fireEvent.click(clearButton);
    expect(clearItemsMock).toHaveBeenCalled();
  });
});
