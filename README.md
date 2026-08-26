# Full-Stack React + Bun Starter Template

## Getting started

0. Install bun: ([install page](https://bun.sh)) (alternatively, run as container below)
1. `$ bun install`
2. `$ bun run dev`
3. Go to `http://localhost:7777`
4. Start editting `src/home/Home.page.tsx`
5. Save file to see changes applied without a reload

## Containerisation

This app is containerised for deployment. You can build and run the docker image locally if you like:

0. Install Docker ([install page](https://docs.docker.com/engine/install/))
1. `$ docker build --tag 'bun-react-ssr' .`
2. `$ docker run -p 8080:8080 'bun-react-ssr'`
3. Go to `http://localhost:8080` 
4. ...

## File Structure

`src` follows a domain-driven design layout with `core`, `about` and `home` directories:
- `core` holds shared server middleware, handlers, utils, react components and static assets
- `about` holds a basic about page and the client entrypoint for building a browser bundle.
- `home` holds the home page along with some custom components (for now).

The idea is that as your project scales and your pages (domains) grow, you will need specific middleware, utilities, components etc for those domains.

## Build

`Bun.build` is used to generate client-side assets and store in the `dist/client` folder.

You do not need to manually build, it happens automatically in dev mode and in docker build.

## Hot module replacement

In dev mode `bun --watch` restarts the server on every source change, which rebuilds the client
bundles. Each build records a content hash per output file in an in-memory manifest
(`@core/utils/build`), served over a websocket at `/__hmr` (`@core/middleware/hmr`).

The browser runtime (`src/core/hmr.client.ts`, bootstrapped by the react middleware in dev) holds
those hashes and reconnects after each restart. Any of the current page's chunks whose hash moved is
re-fetched: stylesheets by swapping the `<link>` href, scripts by re-importing the entrypoint at
`?h=<hash>`. Re-running an entrypoint calls `hydratePage` again, which re-renders the root held on
`window.__ROOT__` rather than hydrating a second time.

CSS edits apply in place. A script swap replaces the component tree, so React state inside it resets,
but the page, its scroll position and the socket are never reloaded. None of this ships to prod: the
runtime is only bootstrapped when `ENV=dev`.

## Testing 

`$ bun test` to run unit and integration tests for client and server simulatenously.

Tests are run in a conventional `CI` process on PR open to main or commit/merge to main.

The provided tests include integration tests for frontend pages and unit tests for the backend. This is a good foundation but should be expanded with:
 - integration tests for backend routes and handlers
 - unit tests on the frontend utilities and UI snapshot testing. 
 - comprehensive E2E tests (Cypress, Playwright, etc)

**Note**: `bun.d.ts` extends the `Matchers` interface from `"bun:test"` to support `@testing-library`'s matcher types in your IDE. It also adds content types for static assets and the `__SERVER_PROPS__` property to the `Window` global. For custom testing, extended static file support or ssr modifications, you may need to update this file.

## Suggestions for your project:

 - A standardised UI component library (with storybooks to review)
 - Analytics/warehouse integration (cookie-based or via server endpoints)
 - Redis middleware to cache page renders
 - Authentication middleware or basic verification
 - Postgres or other cloud database to persist user auth
 - ML streaming middleware for reactive AI apps
 - CD process (terraform etc) to deploy db, redis and containers

## Feedback

If you have any suggestions please create an issue! All feedback welcome ^^