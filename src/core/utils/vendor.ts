// Page bundles import react through these bare specifiers instead of inlining
// it, and @core/components/Document maps them to the shared vendor build.
//
// One instance is what makes HMR viable: a chunk re-imported at `?h=<hash>`
// re-runs, but its unqueried react import is already in the browser's module
// map, so hooks keep talking to the same dispatcher. Bundling react per page
// would give the replacement chunk its own copy, and every hook would throw.
//
// Keys are the specifiers marked external at build time, values the shims in
// `src/core/vendor`.
export const vendorImports: Record<string, string> = {
  "react": "/static/vendor/react.js",
  "react-dom/client": "/static/vendor/react-dom.js",
  "react/jsx-runtime": "/static/vendor/jsx-runtime.js",
  // Bun emits the dev runtime for .tsx unless tsconfig sets `jsx`
  "react/jsx-dev-runtime": "/static/vendor/jsx-dev-runtime.js",
};

export const external = Object.keys(vendorImports);
