// Under `hmr` the client build rewrites these specifiers to the urls their
// shims in `src/core/vendor` are served from, and leaves them external.
//
// One react instance is what makes HMR viable: a chunk re-imported at
// `?h=<hash>` re-runs, but its rewritten react import is already in the
// browser's module map, so hooks keep talking to the same dispatcher. Bundling
// react per page would give the replacement chunk its own copy, and every hook
// would throw.
//
// The urls are baked into the bundle rather than mapped by an importmap in the
// document: react hoists `<link rel="modulepreload">` above anything the
// document renders, and a preload that resolves before the map is parsed fails
// the bare specifier outright.
export const vendorImports: Record<string, string> = {
  "react": "/static/vendor/react.js",
  "react-dom/client": "/static/vendor/react-dom.js",
  "react/jsx-runtime": "/static/vendor/jsx-runtime.js",
  // Bun emits the dev runtime for .tsx unless tsconfig sets `jsx`
  "react/jsx-dev-runtime": "/static/vendor/jsx-dev-runtime.js",
};

export const external = Object.keys(vendorImports);
