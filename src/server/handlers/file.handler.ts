import { Middleware } from "../utils/middleware";

export const file: Middleware = async (request) => {
  const path = new URL(`../../../dist/${new URL(request.url).pathname}`, import.meta.url).pathname;
  const mimeType = request.url.endsWith(".js") 
    ? "application/javascript" 
    : request.url.endsWith(".css") 
    ? "text/css" 
    : request.url.endsWith(".svg")
    ? "image/svg+xml"
    : "text/plain"; 

  return new Response(Bun.file(path), {
    headers: {
      'Content-Type': mimeType
    }
  })
}