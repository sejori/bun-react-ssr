import { Middleware } from "../utils/middleware";

export const file: Middleware = async (ctx) => {
  const path = new URL(`../../../../dist/client${new URL(ctx.request.url).pathname}`, import.meta.url).pathname;
  console.log(path);
  const mimeType = ctx.request.url.endsWith(".js") 
    ? "application/javascript" 
    : ctx.request.url.endsWith(".css") 
    ? "text/css" 
    : ctx.request.url.endsWith(".svg")
    ? "image/svg+xml"
    : "text/plain"; 

  return new Response(Bun.file(path).stream(), {
    headers: {
      'Content-Type': mimeType
    }
  })
}