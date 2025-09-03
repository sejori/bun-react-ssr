import { Middleware } from "../utils/middleware";

export interface LogState {
  logged: boolean;
}

export const log = (fn: ((...args: unknown[]) => void)): Middleware<{ logged: boolean }> =>
  async (ctx, next) => {
    const start = performance.now();
    ctx.state.logged = true;
    const res = await next();
    const end = performance.now();
    fn(ctx.request.url, res?.status, `${end-start}ms`)
  }