import { cascade } from "../../_common/utils/middleware";
import { log, LogState } from "../../_common/middleware/log.middleware";
import { reactMiddleware } from "../middleware/react.middleware";
import { generateMsTimeString } from "../../../_common/utils/date.utils";
import Home from "../../../client/home/Home.page";

export const homeHandler = cascade<
  LogState & {
    requestTime: string;
  }
>(
  log(console.log),
  (ctx) => {
    ctx.state.requestTime = generateMsTimeString();
  },
  reactMiddleware(Home, (ctx) => ({
    requestTime: ctx.state.requestTime
  }))
);