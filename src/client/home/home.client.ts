import { hydrateRoot } from "react-dom/client";
import { createElement } from "react";
import Home from "./Home.page";

hydrateRoot(
  document,
  createElement(Home, window.__SERVER_PROPS__)
);
