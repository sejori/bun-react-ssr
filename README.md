# Full-Stack React + Bun Starter Template

## Getting started

0. Install bun: ([install page](https://bun.sh)) (alternatively, run as container below)
1. `$ bun install`
2. `$ bun run dev`
3. Go to `http://localhost:7777`
4. Start editting `src/client/home/Home.page.tsx`
5. Save file and refresh plage to see changes

## Containerisation

This app is containerised for deployment. You can build and run the docker image locally if you like:

0. Install Docker ([install page](https://docs.docker.com/engine/install/))
1. `$ docker build --tag 'bun-react-ssr' .`
2. `$ docker run -p 8080:8080 'bun-react-ssr'`
3. Go to `http://localhost:8080` 
4. ...

## File Structure

`src` contains `client`, `server` and `_common` directories:
- `client` holds all react components, static assets and client-side entrypoint files.
- `server` holds all server middleware, handlers, utils and main file with routes.
- `_common` holds shared data models.

The project utilises domain-driven-design architecture for clean organisation and scalability.

## Build

`Bun.build` is used to generate client-side assets and store in the `dist/client` folder.

You do not need to manually build, it happens automatically in dev mode and in docker build.

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
 - Analytics integration (cookie-based or via server endpoints)
 - Redis middleware to cache page renders
 - Authentication middleware or basic verification
 - Postgres or other cloud database to persist user auth
 - ML streaming middleware for reactive AI apps
 - CD process (terraform etc) to deploy db, redis and containers

## Feedback

If you have any suggestions please create an issue! All feedback welcome ^^