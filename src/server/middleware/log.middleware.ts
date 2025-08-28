import { Middleware } from "../utils/middleware";

export const logger: Middleware = async (req, server, next) => {
  const start = performance.now();
  server["state"][req["id"]] = { logged: true };
  const res = await next();
  const end = performance.now();
  console.log(req.url, res?.status, `${end-start}ms`)
}