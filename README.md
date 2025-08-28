# Getting started

1. Run `$ bun --watch src/server/main.tsx`
2. Go to `http://localhost:777`
3. Enjoy ^^

# File Structure

`src` contains `client` and `server`.
- `client` holds all frontend react components, pages and client-side entrypoint files
- `server` holds all middleware, handlers and middlware cascading utility as well as the main bun file with route definitions.

# Build

`Bun.build` is used in the `src/server/main.tsx` file to generate client-side assets and store in the `dist` folder.
These files are referenced in `src/client/Document.tsx` for assets and `src/server/handlers/react.handler.ts` for hydration.