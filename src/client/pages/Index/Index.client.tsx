import { hydrateRoot } from "react-dom/client";
import { createElement } from "react";
import App from "./Index";

hydrateRoot(
  document,
  createElement(App, (window as any).__INITIAL_PROPS__)
);
