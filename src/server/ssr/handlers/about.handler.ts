import { cascade } from "../../_common/utils/middleware";
import { log, LogState } from "../../_common/middleware/log.middleware";
import { reactMiddleware } from "../middleware/react.middleware";
import About from "../../../client/about/About.page";

// MiddlewareContext generic set for log + inline name middleware 
// this feeds into the reactHandler prop factory for ssr props
// (see reactHandler to see ssr props also serialised into DOM)
export const aboutHandler = cascade<
  LogState,
  Request & {
    params: { name: string }
  }>(
  log(console.log),
  reactMiddleware(About, (ctx) => ({
    name: ctx.request.params.name,
    logged: ctx.state.logged,
  }))
);