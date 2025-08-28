import { hydrateRoot, Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

let root: Root | null = null;

export function renderToDocument(component: React.ReactElement) {
  // 0. reset the document
  root?.unmount();
  root = null;

  // 1. simulate ssr with renderToString
  const initialRender = renderToString(component);
  const strippedHtmlTags = initialRender.slice(6, -7);
  document.documentElement.innerHTML = strippedHtmlTags;

  // 2. hydrate to simulate client take-over
  root = hydrateRoot(document, component);
}