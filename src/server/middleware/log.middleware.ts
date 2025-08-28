import { Middleware } from "../utils/middleware";

export const log = (fn: ((...args: unknown[]) => void)): Middleware =>
  async (req, state, next) => {
    const start = performance.now();
    state["logged"] = true;
    const res = await next();
    const end = performance.now();
    fn(req.url, res?.status, `${end-start}ms`)
  }