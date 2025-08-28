import { cascade } from "./utils/middleware";
import Index from "../client/pages/Index";
import { logger } from "./middleware/log.middleware";
import { reactHandler } from "./handlers/react.handler";
import { file } from "./handlers/file.handler";
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
      logger,
      reactHandler(Index, {
        message: "Hello world"
      })
    ),
    "/about": cascade(
      logger,
      (req, state) => {
        state["name"] = new URL(req.url).searchParams.get("name")
      },
      reactHandler(About, (_req, state) => ({
        name: state["name"],
        logged: state["logged"],
      }))
    ),
  },
  fetch: cascade(
    logger,
    file
  )
});



console.log(`Server running on port ${PORT}`);