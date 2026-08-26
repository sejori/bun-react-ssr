import { createElement, FC } from "react";
import { hydrateRoot } from "react-dom/client";

// The root is kept on `window` so an HMR re-import of the client entrypoint
// re-renders the existing tree instead of hydrating a second time.
export const hydratePage = (Page: FC<any>) => {
  const element = createElement(Page, window.__SERVER_PROPS__);

  if (window.__ROOT__) window.__ROOT__.render(element);
  else window.__ROOT__ = hydrateRoot(document, element);
};
