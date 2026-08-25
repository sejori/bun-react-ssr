import { fileHandler } from "./handlers/file.hander";
import { cascade } from "./utils/middleware";
import { log, LogState } from "./middleware/log.middleware";
import { reactMiddleware } from "./middleware/react.middleware";
import { buildClient } from "./build";

import Home from "./client/pages/home/Home.page";
import About from "./client/pages/about/About.page";

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

const aboutHandler = cascade<LogState>(
  log(console.log),
  reactMiddleware(About, (ctx) => ({
    name: ctx.request.params.name,
    logged: ctx.state.logged,
  }))
);

Bun.serve({
  port,
  routes: {
    "/": homeHandler,
    "/about": aboutHandler,
    "/about/:name": aboutHandler,
    "/static/:dir/:file": fileHandler
  }
});

console.log(`Server running on port ${port}`);