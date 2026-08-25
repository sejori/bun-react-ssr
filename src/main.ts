import { cascade } from "./core/utils/middleware";
import { log, LogState } from "./core/middleware/log";
import { reactMiddleware } from "./core/middleware/react";
import { fileMiddleware } from "./core/middleware/file";
import { buildClient } from "./core/utils/build";

import Home from "./home/Home.page";
import About from "./about/About.page";

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
    "/static/:dir/:file": fileHandler 
  }
});

console.log(`Server running on port ${port}`);