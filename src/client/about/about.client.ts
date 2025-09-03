import { hydrateRoot } from "react-dom/client";
import { createElement } from "react";
import About from "./About.page";

hydrateRoot(
  document,
  createElement(About, window.__SERVER_PROPS__)
);
