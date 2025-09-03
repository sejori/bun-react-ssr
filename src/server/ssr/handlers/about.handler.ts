import { cascade } from "../../_common/utils/middleware";
import { log, LogState } from "../../_common/middleware/log.middleware";
import { reactHandler } from "../../_common/handlers/react.handler";
import About from "../../../client/about/About.page";

// MiddlewareContext generic set for log + inline name middleware 
// this feeds into the reactHandler prop factory for ssr props
// (see reactHandler to see ssr props also serialised into DOM)
export const aboutHandler = cascade<LogState & {
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
);