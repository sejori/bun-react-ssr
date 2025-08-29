import { cascade } from "./utils/middleware";
import { log, LogState } from "./middleware/log.middleware";
import { reactHandler } from "./handlers/react.handler";
import { file } from "./handlers/file.handler";

import Index from "../client/pages/Index/Index";
import About from "../client/pages/About/About";

const PORT = process.env.PORT || 7777;

Bun.build({
  entrypoints: [
    new URL("../client/pages/Index/Index.client.tsx", import.meta.url).pathname,
    new URL("../client/pages/About/About.client.tsx", import.meta.url).pathname
  ],
  outdir: new URL("../../dist", import.meta.url).pathname,
  naming: {
    asset: "dist/[dir]/[name].[ext]",
  }
});

Bun.serve({
  port: PORT,
  routes: {
    "/": cascade(
      log(console.log),
      reactHandler(Index, {
        message: "Hello world"
      })
    ),
    // Generic type for inline name middleware and reactHandler prop factory
    "/about": cascade<LogState & {
      name: string;
    }>(
      log(console.log),
      (ctx) => {
        ctx.state.name = new URL(ctx.request.url).searchParams.get("name") || ""
      },
      reactHandler(About, (ctx) => ({
        name: ctx.state.name,
        logged: ctx.state.logged,
      }))
    ),
  },
  fetch: cascade(
    log(console.log),
    file
  )
});

console.log(`Server running on port ${PORT}`);