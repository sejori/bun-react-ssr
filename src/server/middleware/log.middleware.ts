import { Middleware } from "../utils/middleware";

export const logger: Middleware = async (req, state, next) => {
  const start = performance.now();
  state["logged"] = true;
  const res = await next();
  const end = performance.now();
  console.log(req.url, res?.status, `${end-start}ms`)
}