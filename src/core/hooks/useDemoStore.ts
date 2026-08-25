import { useContext } from "react";
import { DemoContext } from "../contexts/demoContext";

export const useDemoStore = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemoStore must be used within a DemoProvider");
  }
  return context;
};