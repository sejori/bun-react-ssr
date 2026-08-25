import { Middleware } from "../utils/middleware";
import { generateMsTimeString } from "../utils/date";

export interface LogState {
  logged: boolean;
  requestTime: string;
}

export const log = (fn: ((...args: unknown[]) => void)): Middleware<LogState> =>
  async (ctx, next) => {
    const start = performance.now();
    ctx.state.logged = true;
    ctx.state.requestTime = generateMsTimeString();
    try {
      const res = await next();
      const end = performance.now();
      fn(ctx.request.url, res?.status, `${end-start}ms`)
    } catch(e) {
      console.log(e);
    }
  }