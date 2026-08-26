import { cascade } from "@core/utils/middleware";
import { log, LogState } from "@core/middleware/log";
import { reactMiddleware } from "@core/middleware/react";
import { fileMiddleware } from "@core/middleware/file";
import { cache, CacheState } from "@core/middleware/cache";
import { buildClient } from "@core/utils/build";
import { hmrHandler, hmrWebsocket } from "@core/middleware/hmr";

import Home from "@home/Home.page";
import About from "@about/About.page";

const port = process.env.PORT || 7777;
const isDev = process.env.ENV === "dev";

// awaited so the server never serves a request before the bundle exists
if (isDev) await buildClient();

const homeHandler = cascade<LogState>(
  log(console.log),
  reactMiddleware(Home, (ctx) => ({
    requestTime: ctx.state.requestTime
  }))
);

// Home renders a fresh `requestTime` every hit, so only About — whose props are
// derived from the URL — is cached. The default key is pathname + search, so
// /about/Steve and /about/Bob get their own entries.
const aboutHandler = cascade<LogState & CacheState>(
  log(console.log),
  cache({ itemLifetime: 60_000 }),
  reactMiddleware(About, (ctx) => ({
    name: ctx.request.params.name,
    logged: ctx.state.logged,
  }))
);


const fileHandler = cascade(
  log(console.log),
  fileMiddleware
);

Bun.serve({
  port,
  routes: {
    "/": homeHandler,
    "/about": aboutHandler,
    "/about/:name": aboutHandler,
    "/static/:dir/:file": fileHandler,
    ...(isDev && { "/__hmr": hmrHandler })
  },
  websocket: hmrWebsocket
});

console.log(`Server running on port ${port}`);